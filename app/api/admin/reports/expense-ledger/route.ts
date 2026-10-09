import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getDate(value: string | null, endOfDay = false) {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

function getAmount(expense: any): number {
  const amount = Number(expense.amount ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const from = getDate(searchParams.get("from"));
    const to = getDate(searchParams.get("to"), true);

    const category = searchParams.get("category")?.trim();
    const status = searchParams.get("status")?.trim();
    const search = searchParams.get("search")?.trim();

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") || "20", 10) || 20
      )
    );

    if (from === null || to === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date filter.",
        },
        { status: 400 }
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "The start date cannot be after the end date.",
        },
        { status: 400 }
      );
    }

    const filter: Record<string, any> = {};

    if (from || to) {
      filter.createdAt = {};

      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    if (category && category.toLowerCase() !== "all") {
      filter.category = category;
    }

    if (status && status.toLowerCase() !== "all") {
      filter.status = status;
    }

    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(safeSearch, "i");

      filter.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { paymentMethod: regex },
        { reference: regex },
      ];
    }

    const [expenses, totalRecords, summaryRecords] = await Promise.all([
      Expense.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Expense.countDocuments(filter),

      Expense.find(filter)
        .select("amount status category createdAt")
        .lean(),
    ]);

    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let rejectedAmount = 0;

    const categoryTotals: Record<string, number> = {};

    for (const expense of summaryRecords as any[]) {
      const amount = getAmount(expense);
      const expenseStatus = String(expense.status || "").toLowerCase();
      const expenseCategory = String(expense.category || "Uncategorized");

      totalAmount += amount;

      if (["paid", "completed", "approved"].includes(expenseStatus)) {
        paidAmount += amount;
      } else if (["pending", "unpaid"].includes(expenseStatus)) {
        pendingAmount += amount;
      } else if (
        ["rejected", "cancelled", "canceled"].includes(expenseStatus)
      ) {
        rejectedAmount += amount;
      }

      categoryTotals[expenseCategory] =
        (categoryTotals[expenseCategory] || 0) + amount;
    }

    const ledger = (expenses as any[]).map((expense, index) => ({
      id: String(expense._id),
      entryNumber: (page - 1) * limit + index + 1,
      date: expense.createdAt ?? null,
      title: expense.title ?? expense.description ?? "Expense",
      description: expense.description ?? "",
      category: expense.category ?? "Uncategorized",
      amount: getAmount(expense),
      status: expense.status ?? "pending",
      paymentMethod: expense.paymentMethod ?? "",
      reference: expense.reference ?? "",
      createdAt: expense.createdAt ?? null,
      updatedAt: expense.updatedAt ?? null,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Expense ledger fetched successfully.",
        data: ledger,
        summary: {
          totalRecords,
          totalAmount,
          paidAmount,
          pendingAmount,
          rejectedAmount,
          categoryTotals,
          currency: "INR",
        },
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
          hasNextPage: page * limit < totalRecords,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[EXPENSE_LEDGER_GET_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch expense ledger.",
      },
      { status: 500 }
    );
  }
}
