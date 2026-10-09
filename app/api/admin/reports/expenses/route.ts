
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import Expense from "@/models/Expense";
import { connectDB } from "@/lib/db";
import { requireAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "approved", "paid", "rejected"] as const;
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

function parseDateRange(params: URLSearchParams, defaultDays: number) {
  const now = new Date();
  const fromValue = params.get("from");
  const toValue = params.get("to");
  const from = fromValue ? new Date(fromValue) : new Date(now);
  const to = toValue ? new Date(toValue) : new Date(now);

  if (!fromValue) from.setDate(from.getDate() - defaultDays);

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    from > to
  ) {
    return null;
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

async function requireOwnerForChanges() {
  const auth = await requireAdminPermission("reports", "view");

  if (!auth.ok) {
    return { ok: false as const, response: auth.response };
  }

  // The current StudyStow permission configuration gives Reports
  // view permission only. Keep expense mutations owner-only.
  if (!auth.context.actor.isOwner) {
    return {
      ok: false as const,
      response: errorResponse(
        "Only the owner can create, edit or delete expenses.",
        403
      ),
    };
  }

  return { ok: true as const, context: auth.context };
}

// GET /api/admin/reports/expenses
export async function GET(request: NextRequest) {
  const auth = await requireAdminPermission("reports", "view");
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(request.url).searchParams;
    const range = parseDateRange(params, 30);

    if (!range) {
      return errorResponse("Invalid date range.");
    }

    await connectDB();

    const filter: Record<string, unknown> = {
      date: { $gte: range.from, $lte: range.to },
    };

    const search = params.get("search")?.trim();

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { category: { $regex: escaped, $options: "i" } },
        { vendor: { $regex: escaped, $options: "i" } },
        { reference: { $regex: escaped, $options: "i" } },
        { paymentMethod: { $regex: escaped, $options: "i" } },
      ];
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const data = expenses.map((expense: any) => ({
      id: String(expense._id),
      date: expense.date,
      title: expense.title,
      category: expense.category,
      vendor: expense.vendor || "",
      description: expense.description || "",
      paymentMethod: expense.paymentMethod || "",
      status: expense.status || "pending",
      priority: expense.priority || "normal",
      amount: Number(expense.amount || 0),
      taxAmount: Number(expense.taxAmount || 0),
      reference: expense.reference || "",
      notes: expense.notes || "",
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    }));

    const total = data.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const pending = data
      .filter((expense) => expense.status === "pending")
      .reduce((sum, expense) => sum + expense.amount, 0);

    const byCategory = Object.entries(
      data.reduce((map: Record<string, number>, expense) => {
        map[expense.category] =
          (map[expense.category] || 0) + expense.amount;
        return map;
      }, {})
    ).map(([category, amount]) => ({ category, amount }));

    return NextResponse.json({
      success: true,
      data,
      summary: {
        total,
        count: data.length,
        pending,
        byCategory,
      },
    });
  } catch (error) {
    console.error("GET expenses report error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load expenses report." },
      { status: 500 }
    );
  }
}

// POST /api/admin/reports/expenses
export async function POST(request: NextRequest) {
  const auth = await requireOwnerForChanges();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const amount = Number(body.amount);
    const taxAmount = Number(body.taxAmount ?? 0);
    const date = body.date ? new Date(body.date) : new Date();

    if (!title || !category) {
      return errorResponse("Title and category are required.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return errorResponse("Enter a valid amount greater than zero.");
    }

    if (!Number.isFinite(taxAmount) || taxAmount < 0) {
      return errorResponse("Tax amount must be zero or greater.");
    }

    if (Number.isNaN(date.getTime())) {
      return errorResponse("Enter a valid expense date.");
    }

    const status = body.status ?? "pending";
    const priority = body.priority ?? "normal";

    if (!STATUSES.includes(status)) {
      return errorResponse("Invalid expense status.");
    }

    if (!PRIORITIES.includes(priority)) {
      return errorResponse("Invalid expense priority.");
    }

    await connectDB();

    const expenseData = {
      title,
      category,
      amount,
      taxAmount,
      date,
      vendor: body.vendor || "",
      description: body.description || "",
      paymentMethod: body.paymentMethod || "",
      reference: body.reference || "",
      notes: body.notes || "",
      status,
      priority,
      createdBy: mongoose.Types.ObjectId.isValid(
        auth.context.actor.id
      )
        ? auth.context.actor.id
        : undefined,
      };
      const expense = await Expense.create(expenseData);

    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully.",
        data: {
          id: String(expense._id),
          ...expense.toObject(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST expenses report error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create expense." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reports/expenses?id=EXPENSE_ID
export async function PATCH(request: NextRequest) {
  const auth = await requireOwnerForChanges();
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(request.url).searchParams;
    const body = await request.json();
    const id = String(body.id || params.get("id") || "");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("A valid expense ID is required.");
    }

    const updates: Record<string, unknown> = {};

    const stringFields = [
      "title",
      "category",
      "vendor",
      "description",
      "paymentMethod",
      "reference",
      "notes",
    ] as const;

    for (const field of stringFields) {
      if (field in body) {
        if (typeof body[field] !== "string") {
          return errorResponse(`Invalid ${field}.`);
        }
        updates[field] = body[field].trim();
      }
    }

    if ("amount" in body) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return errorResponse("Amount must be greater than zero.");
      }
      updates.amount = amount;
    }

    if ("taxAmount" in body) {
      const taxAmount = Number(body.taxAmount);
      if (!Number.isFinite(taxAmount) || taxAmount < 0) {
        return errorResponse("Tax amount must be zero or greater.");
      }
      updates.taxAmount = taxAmount;
    }

    if ("date" in body) {
      const date = new Date(body.date);
      if (Number.isNaN(date.getTime())) {
        return errorResponse("Invalid expense date.");
      }
      updates.date = date;
    }

    if ("status" in body) {
      if (!STATUSES.includes(body.status)) {
        return errorResponse("Invalid expense status.");
      }
      updates.status = body.status;
    }

    if ("priority" in body) {
      if (!PRIORITIES.includes(body.priority)) {
        return errorResponse("Invalid expense priority.");
      }
      updates.priority = body.priority;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No valid fields were provided to update.");
    }

    await connectDB();

    const expense = await Expense.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!expense) {
      return errorResponse("Expense not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Expense updated successfully.",
      data: {
        ...expense,
        id: String((expense as any)._id),
      },
    });
  } catch (error) {
    console.error("PATCH expenses report error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update expense." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reports/expenses?id=EXPENSE_ID
export async function DELETE(request: NextRequest) {
  const auth = await requireOwnerForChanges();
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(request.url).searchParams;
    let id = params.get("id") || "";

    if (!id) {
      try {
        const body = await request.json();
        id = String(body.id || "");
      } catch {
        // The ID may be supplied through the query string instead.
      }
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("A valid expense ID is required.");
    }

    await connectDB();

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return errorResponse("Expense not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully.",
      data: { id },
    });
  } catch (error) {
    console.error("DELETE expenses report error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete expense." },
      { status: 500 }
    );
  }
}