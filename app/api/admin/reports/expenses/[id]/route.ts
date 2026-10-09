
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import {
  requireAdminPermission,
  requireOwner,
} from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ExpenseUpdates = {
  title?: string;
  date?: Date;
  category?: string;
  vendor?: string;
  paymentMethod?: string;
  status?: "pending" | "approved" | "paid" | "rejected";
  priority?: "normal" | "high" | "urgent";
  amount?: number;
  reference?: string;
};

const ALLOWED_STATUSES = [
  "pending",
  "approved",
  "paid",
  "rejected",
] as const;

const ALLOWED_PRIORITIES = [
  "normal",
  "high",
  "urgent",
] as const;

function errorResponse(
  message: string,
  status = 400,
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function serializeExpense(expense: any) {
  const record =
    typeof expense?.toObject === "function"
      ? expense.toObject()
      : expense;

  return {
    ...record,
    _id: String(record._id),
    id: String(record._id),
  };
}

async function getExpenseId(context: RouteContext) {
  const { id } = await context.params;
  const cleanId = String(id || "").trim();

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    return null;
  }

  return cleanId;
}

/**
 * GET /api/admin/reports/expenses/[id]
 * Fetch one expense record.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const auth = await requireAdminPermission(
      "reports",
      "view",
    );

    if (!auth.ok) {
      return auth.response;
    }

    const id = await getExpenseId(context);

    if (!id) {
      return errorResponse("Invalid expense ID.", 400);
    }

    await connectDB();

    const expense = await Expense.findById(id).lean();

    if (!expense) {
      return errorResponse("Expense not found.", 404);
    }

    return NextResponse.json({
      success: true,
      data: serializeExpense(expense),
    });
  } catch (error) {
    console.error(
      "GET /api/admin/reports/expenses/[id] error:",
      error,
    );

    return errorResponse("Failed to fetch expense.", 500);
  }
}

/**
 * Update logic shared by PATCH and PUT.
 * Mutations are owner-only until explicit staff write
 * permissions are added to the permission configuration.
 */
async function updateExpense(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const auth = await requireOwner();

    if (!auth.ok) {
      return auth.response;
    }

    const id = await getExpenseId(context);

    if (!id) {
      return errorResponse("Invalid expense ID.", 400);
    }

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return errorResponse(
        "A valid JSON request body is required.",
        400,
      );
    }

    const updates: ExpenseUpdates = {};
    const input = body as Record<string, unknown>;

    // Title
    if ("title" in input) {
      if (
        typeof input.title !== "string" ||
        !input.title.trim()
      ) {
        return errorResponse("Expense title is required.");
      }

      updates.title = input.title.trim();
    }

    // Date
    if ("date" in input) {
      if (
        typeof input.date !== "string" ||
        !input.date.trim()
      ) {
        return errorResponse("A valid expense date is required.");
      }

      const date = new Date(input.date);

      if (Number.isNaN(date.getTime())) {
        return errorResponse("Invalid expense date.");
      }

      updates.date = date;
    }

    // Category
    if ("category" in input) {
      if (
        typeof input.category !== "string" ||
        !input.category.trim()
      ) {
        return errorResponse("Expense category is required.");
      }

      updates.category = input.category.trim();
    }

    // Optional text fields
    const optionalTextFields = [
      "vendor",
      "paymentMethod",
      "reference",
    ] as const;

    for (const field of optionalTextFields) {
      if (field in input) {
        if (typeof input[field] !== "string") {
          return errorResponse(
            `${field} must be a string.`,
          );
        }

        updates[field] = (input[field] as string).trim();
      }
    }

    // Amount
    if ("amount" in input) {
      if (
        input.amount === "" ||
        input.amount === null ||
        typeof input.amount === "boolean"
      ) {
        return errorResponse("A valid expense amount is required.");
      }

      const amount = Number(input.amount);

      if (!Number.isFinite(amount) || amount < 0) {
        return errorResponse(
          "Expense amount must be a valid non-negative number.",
        );
      }

      updates.amount = amount;
    }

    // Status
    if ("status" in input) {
      if (
        typeof input.status !== "string" ||
        !ALLOWED_STATUSES.includes(
          input.status as (typeof ALLOWED_STATUSES)[number],
        )
      ) {
        return errorResponse("Invalid expense status.");
      }

      updates.status =
        input.status as ExpenseUpdates["status"];
    }

    // Priority
    if ("priority" in input) {
      if (
        typeof input.priority !== "string" ||
        !ALLOWED_PRIORITIES.includes(
          input.priority as (typeof ALLOWED_PRIORITIES)[number],
        )
      ) {
        return errorResponse("Invalid expense priority.");
      }

      updates.priority =
        input.priority as ExpenseUpdates["priority"];
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(
        "No supported expense fields were provided.",
      );
    }

    await connectDB();

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!updatedExpense) {
      return errorResponse("Expense not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Expense updated successfully.",
      data: serializeExpense(updatedExpense),
    });
  } catch (error) {
    console.error(
      "UPDATE /api/admin/reports/expenses/[id] error:",
      error,
    );

    return errorResponse("Failed to update expense.", 500);
  }
}

/**
 * PATCH /api/admin/reports/expenses/[id]
 * PUT /api/admin/reports/expenses/[id]
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  return updateExpense(request, context);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  return updateExpense(request, context);
}

/**
 * DELETE /api/admin/reports/expenses/[id]
 * Permanently delete one expense record.
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const auth = await requireOwner();

    if (!auth.ok) {
      return auth.response;
    }

    const id = await getExpenseId(context);

    if (!id) {
      return errorResponse("Invalid expense ID.", 400);
    }

    await connectDB();

    const deletedExpense = await Expense.findByIdAndDelete(id)
      .select("_id title")
      .lean();

    if (!deletedExpense) {
      return errorResponse("Expense not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully.",
      data: {
        id: String(deletedExpense._id),
        title: deletedExpense.title,
      },
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/reports/expenses/[id] error:",
      error,
    );

    return errorResponse("Failed to delete expense.", 500);
  }
}