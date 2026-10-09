import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Expense from "@/models/Expense";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null;

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

  const date = new Date(
    dateOnly
      ? `${value}T${
          endOfDay ? "23:59:59.999" : "00:00:00.000"
        }Z`
      : value,
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    if (user.role !== "owner") {
      return NextResponse.json(
        {
          success: false,
          message: "Only the owner can access the balance sheet.",
        },
        { status: 403 },
      );
    }

    const params = request.nextUrl.searchParams;
    const asOfParam = params.get("asOf");
    const fromParam = params.get("from");
    const toParam = params.get("to");

    const asOf = parseDate(asOfParam, true);
    const from = parseDate(fromParam);
    const to = parseDate(toParam, true);

    if (asOfParam && !asOf) {
      return NextResponse.json(
        { success: false, message: "Invalid asOf date." },
        { status: 400 },
      );
    }

    if (fromParam && !from) {
      return NextResponse.json(
        { success: false, message: "Invalid from date." },
        { status: 400 },
      );
    }

    if (toParam && !to) {
      return NextResponse.json(
        { success: false, message: "Invalid to date." },
        { status: 400 },
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "From date must not be after to date.",
        },
        { status: 400 },
      );
    }

    if (asOf && (from || to)) {
      return NextResponse.json(
        {
          success: false,
          message: "Use asOf or from/to, not both.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    /*
     * A balance sheet is a point-in-time report.
     * asOf means include records created on or before that date.
     *
     * Without asOf/from/to, the report uses all available records.
     */
    const cutoff = asOf || to || null;

    const orderFilter: Record<string, any> = {};
    const expenseFilter: Record<string, any> = {
      status: "paid",
    };

    if (cutoff) {
      orderFilter.createdAt = { $lte: cutoff };
      expenseFilter.date = { $lte: cutoff };
    }

    /*
     * Expenses are actual paid expenses.
     * They are not automatically treated as assets or liabilities.
     *
     * Order values are operational figures, not a complete
     * accounting ledger. They cannot establish cash, receivables,
     * inventory valuation, payables, loans, or owner's equity.
     */
    const [orderSummaryResult, expenseSummaryResult] =
      await Promise.all([
        Order.aggregate([
          { $match: orderFilter },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },

              totalOrderValue: {
                $sum: { $ifNull: ["$total", 0] },
              },

              subtotal: {
                $sum: { $ifNull: ["$subtotal", 0] },
              },

              shipping: {
                $sum: { $ifNull: ["$shipping", 0] },
              },

              discount: {
                $sum: { $ifNull: ["$discount", 0] },
              },

              tax: {
                $sum: { $ifNull: ["$tax", 0] },
              },

              paidOrders: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "paid"] },
                    1,
                    0,
                  ],
                },
              },

              paidOrderValue: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "paid"] },
                    { $ifNull: ["$total", 0] },
                    0,
                  ],
                },
              },

              pendingPaymentOrders: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "pending"] },
                    1,
                    0,
                  ],
                },
              },

              refundedOrders: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "refunded"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),

        Expense.aggregate([
          { $match: expenseFilter },
          {
            $group: {
              _id: null,
              paidExpenseCount: { $sum: 1 },
              paidExpenseTotal: {
                $sum: { $ifNull: ["$amount", 0] },
              },
            },
          },
        ]),
      ]);

    const orders = orderSummaryResult[0] || {
      totalOrders: 0,
      totalOrderValue: 0,
      subtotal: 0,
      shipping: 0,
      discount: 0,
      tax: 0,
      paidOrders: 0,
      paidOrderValue: 0,
      pendingPaymentOrders: 0,
      refundedOrders: 0,
    };

    const expenses = expenseSummaryResult[0] || {
      paidExpenseCount: 0,
      paidExpenseTotal: 0,
    };

    const totalOrders = toNumber(orders.totalOrders);
    const paidOrders = toNumber(orders.paidOrders);
    const paidExpenseTotal = toNumber(expenses.paidExpenseTotal);

    /*
     * Do not label order revenue minus expenses as net assets
     * or owner's equity. Those accounting balances require
     * additional verified financial records.
     */
    return NextResponse.json({
      success: true,

      data: {
        report: "balance-sheet",

        period: {
          asOf: cutoff?.toISOString() ?? null,
          from: from?.toISOString() ?? null,
          to: to?.toISOString() ?? null,
          basis: "Available application records",
        },

        assets: {
          total: null,
          cash: null,
          bank: null,
          accountsReceivable: null,
          inventory: null,
          otherAssets: null,
          status: "not_configured",
          message:
            "Verified cash, bank, receivables, inventory valuation, and other asset records are required.",
        },

        liabilities: {
          total: null,
          accountsPayable: null,
          loans: null,
          taxPayable: null,
          otherLiabilities: null,
          status: "not_configured",
          message:
            "Verified supplier balances, loans, tax liabilities, and other liability records are required.",
        },

        equity: {
          total: null,
          ownerCapital: null,
          retainedEarnings: null,
          currentPeriodEarnings: null,
          status: "not_configured",
          message:
            "Opening capital, owner contributions/withdrawals, and reconciled earnings are required.",
        },

        operatingSnapshot: {
          totalOrders,
          paidOrders,
          pendingPaymentOrders: toNumber(
            orders.pendingPaymentOrders,
          ),
          refundedOrders: toNumber(orders.refundedOrders),

          orderValue: toNumber(orders.totalOrderValue),
          paidOrderValue: toNumber(orders.paidOrderValue),
          subtotal: toNumber(orders.subtotal),
          shipping: toNumber(orders.shipping),
          discount: toNumber(orders.discount),
          orderTax: toNumber(orders.tax),

          paidExpenseCount: toNumber(expenses.paidExpenseCount),
          paidExpenseTotal,

          orderValueLessPaidExpenses:
            toNumber(orders.totalOrderValue) - paidExpenseTotal,

          note:
            "This is an operational snapshot, not net assets, cash balance, retained earnings, or a verified accounting profit.",
        },

        reconciliation: {
          assetsMinusLiabilitiesAndEquity: null,
          balanced: null,
          status: "insufficient_accounting_data",
          message:
            "A complete balance-sheet reconciliation is unavailable until verified asset, liability, and equity records are configured.",
        },
      },

      meta: {
        generatedAt: new Date().toISOString(),
        currency: "INR",
        timezone: "UTC",
        dataSource: ["Order", "Expense"],
        limitations: [
          "The Order model does not establish actual cash or bank balances.",
          "Pending payments are not confirmed cash receipts.",
          "Refunded order totals may not equal the actual amount refunded.",
          "The Expense model does not contain supplier payable balances or asset purchases.",
          "Book purchase cost and inventory valuation are not verified by this endpoint.",
          "Owner capital, withdrawals, loans, and retained earnings are not available in these models.",
        ],
      },
    });
  } catch (error) {
    console.error("[ADMIN_BALANCE_SHEET_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate the balance sheet.",
      },
      { status: 500 },
    );
  }
}
