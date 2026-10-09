
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function authorize() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  const user = session.user as typeof session.user & {
    role?: string;
  };

  if (user.role !== "owner") {
    return NextResponse.json(
      {
        success: false,
        message: "Only the owner can manage profit and loss records.",
      },
      { status: 403 }
    );
  }

  return null;
}

async function getValidId(context: RouteContext) {
  const { id } = await context.params;

  return mongoose.Types.ObjectId.isValid(id) ? id : null;
}

// GET /api/admin/reports/profit-loss/[id]
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const authError = await authorize();
    if (authError) return authError;

    const id = await getValidId(context);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid expense ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const expense = await Expense.findById(id)
      .select("date title category amount taxAmount status")
      .lean();

    if (!expense) {
      return NextResponse.json(
        { success: false, message: "Expense not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Profit and loss record GET error:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch the expense." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reports/profit-loss/[id]
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const authError = await authorize();
    if (authError) return authError;

    const id = await getValidId(context);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid expense ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "date",
      "title",
      "category",
      "amount",
      "taxAmount",
      "status",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update." },
        { status: 400 }
      );
    }

    if (
      updates.amount !== undefined &&
      (!Number.isFinite(Number(updates.amount)) ||
        Number(updates.amount) < 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Amount must be a valid non-negative number." },
        { status: 400 }
      );
    }

    if (
      updates.taxAmount !== undefined &&
      (!Number.isFinite(Number(updates.taxAmount)) ||
        Number(updates.taxAmount) < 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Tax must be a valid non-negative number." },
        { status: 400 }
      );
    }

    if (updates.date !== undefined) {
      const date = new Date(String(updates.date));

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid expense date." },
          { status: 400 }
        );
      }

      updates.date = date;
    }

    if (
      updates.status !== undefined &&
      !["paid", "pending", "cancelled"].includes(
        String(updates.status)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid expense status.",
        },
        { status: 400 }
      );
    }

    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount);
    }

    if (updates.taxAmount !== undefined) {
      updates.taxAmount = Number(updates.taxAmount);
    }

    await connectDB();

    const expense = await Expense.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("date title category amount taxAmount status")
      .lean();

    if (!expense) {
      return NextResponse.json(
        { success: false, message: "Expense not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Expense updated successfully.",
      data: expense,
    });
  } catch (error) {
    console.error("Profit and loss record PATCH error:", error);

    return NextResponse.json(
      { success: false, message: "Could not update the expense." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reports/profit-loss/[id]
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const authError = await authorize();
    if (authError) return authError;

    const id = await getValidId(context);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid expense ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return NextResponse.json(
        { success: false, message: "Expense not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully.",
      data: { id },
    });
  } catch (error) {
    console.error("Profit and loss record DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Could not delete the expense." },
      { status: 500 }
    );
  }
}
