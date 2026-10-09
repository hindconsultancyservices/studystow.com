
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";

export const dynamic = "force-dynamic";

function getDateRange(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const startDate = from ? new Date(`${from}T00:00:00.000Z`) : null;
  const endDate = to ? new Date(`${to}T23:59:59.999Z`) : null;

  if (
    (startDate && Number.isNaN(startDate.getTime())) ||
    (endDate && Number.isNaN(endDate.getTime()))
  ) {
    throw new Error("Invalid date range.");
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("'from' date cannot be after 'to' date.");
  }

  return { startDate, endDate };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const user = session.user as typeof session.user & {
      role?: string;
    };

    if (user.role !== "owner") {
      return NextResponse.json(
        {
          success: false,
          message: "Only the owner can view profit and loss reports.",
        },
        { status: 403 },
      );
    }

    const { startDate, endDate } = getDateRange(request);

    await connectDB();

    const dateFilter: Record<string, unknown> = {};

    if (startDate || endDate) {
      dateFilter.date = {
        ...(startDate ? { $gte: startDate } : {}),
        ...(endDate ? { $lte: endDate } : {}),
      };
    }

    const expenses = await Expense.find({
      ...dateFilter,
      status: "paid",
    })
      .select("date title category amount taxAmount status")
      .lean();

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const totalTax = expenses.reduce(
      (sum, expense) =>
        sum + Number((expense as typeof expense & { taxAmount?: number }).taxAmount || 0),
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        period: {
          from: startDate?.toISOString() ?? null,
          to: endDate?.toISOString() ?? null,
        },
        revenue: null,
        expenses: totalExpenses,
        expenseTax: totalTax,
        netProfit: null,
        profitMargin: null,
        revenueConfigured: false,
        message:
          "Expense totals include paid expenses only. Connect your actual Order model to calculate revenue, net profit, and profit margin.",
        expenseRecords: expenses.length,
      },
    });
  } catch (error) {
    console.error("Profit and loss report error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not generate profit and loss report.",
      },
      { status: 500 },
    );
  }
}
