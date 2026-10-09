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

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

  const date = new Date(
    isDateOnly
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
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    if (user.role !== "owner") {
      return NextResponse.json(
        {
          success: false,
          message: "Only the owner can access cash-flow reports.",
        },
        { status: 403 },
      );
    }

    const params = request.nextUrl.searchParams;

    const fromParam = params.get("from");
    const toParam = params.get("to");

    const from = parseDate(fromParam);
    const to = parseDate(toParam, true);

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

    await connectDB();

    /*
     * IMPORTANT:
     * Order.createdAt is an order creation timestamp, not a verified
     * payment receipt timestamp. This report therefore labels order
     * collections as estimates based on paymentStatus.
     *
     * Expense.date is used as the expense date, and only paid expenses
     * are included in the paid-expense total.
     */

    const orderFilter: Record<string, any> = {};
    const expenseFilter: Record<string, any> = {
      status: "paid",
    };

    if (from || to) {
      orderFilter.createdAt = {};
      expenseFilter.date = {};

      if (from) {
        orderFilter.createdAt.$gte = from;
        expenseFilter.date.$gte = from;
      }

      if (to) {
        orderFilter.createdAt.$lte = to;
        expenseFilter.date.$lte = to;
      }
    }

    const [
      orderSummaryResult,
      expenseSummaryResult,
      dailyOrders,
      dailyExpenses,
      paymentMethodBreakdown,
    ] = await Promise.all([
      Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },

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

            failedPaymentOrders: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "failed"] },
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

            refundedOrderValue: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "refunded"] },
                  { $ifNull: ["$total", 0] },
                  0,
                ],
              },
            },

            cancelledOrders: {
              $sum: {
                $cond: [
                  { $eq: ["$orderStatus", "cancelled"] },
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

      Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },

            totalOrders: { $sum: 1 },

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

            refundedOrderValue: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "refunded"] },
                  { $ifNull: ["$total", 0] },
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Expense.aggregate([
        { $match: expenseFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
                timezone: "UTC",
              },
            },

            expenseCount: { $sum: 1 },
            paidExpenses: {
              $sum: { $ifNull: ["$amount", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: {
              paymentMethod: "$paymentMethod",
              paymentStatus: "$paymentStatus",
            },
            orderCount: { $sum: 1 },
            orderValue: {
              $sum: { $ifNull: ["$total", 0] },
            },
          },
        },
        { $sort: { "_id.paymentMethod": 1 } },
      ]),
    ]);

    const orderSummary = orderSummaryResult[0] || {
      totalOrders: 0,
      paidOrders: 0,
      paidOrderValue: 0,
      pendingPaymentOrders: 0,
      failedPaymentOrders: 0,
      refundedOrders: 0,
      refundedOrderValue: 0,
      cancelledOrders: 0,
    };

    const expenseSummary = expenseSummaryResult[0] || {
      paidExpenseCount: 0,
      paidExpenseTotal: 0,
    };

    /*
     * Merge the daily order and expense summaries.
     */
    const dailyMap = new Map<
      string,
      {
        date: string;
        totalOrders: number;
        paidOrders: number;
        estimatedCollections: number;
        recordedRefundedOrderValue: number;
        paidExpenses: number;
        expenseCount: number;
      }
    >();

    for (const item of dailyOrders) {
      dailyMap.set(item._id, {
        date: item._id,
        totalOrders: toNumber(item.totalOrders),
        paidOrders: toNumber(item.paidOrders),
        estimatedCollections: toNumber(item.paidOrderValue),
        recordedRefundedOrderValue: toNumber(
          item.refundedOrderValue,
        ),
        paidExpenses: 0,
        expenseCount: 0,
      });
    }

    for (const item of dailyExpenses) {
      const existing = dailyMap.get(item._id);

      if (existing) {
        existing.paidExpenses = toNumber(item.paidExpenses);
        existing.expenseCount = toNumber(item.expenseCount);
      } else {
        dailyMap.set(item._id, {
          date: item._id,
          totalOrders: 0,
          paidOrders: 0,
          estimatedCollections: 0,
          recordedRefundedOrderValue: 0,
          paidExpenses: toNumber(item.paidExpenses),
          expenseCount: toNumber(item.expenseCount),
        });
      }
    }

    const dailyFlow = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        estimatedNetMovement:
          item.estimatedCollections - item.paidExpenses,
      }));

    const estimatedCollections = toNumber(
      orderSummary.paidOrderValue,
    );

    const paidExpenses = toNumber(
      expenseSummary.paidExpenseTotal,
    );

    const estimatedNetMovement =
      estimatedCollections - paidExpenses;

    return NextResponse.json({
      success: true,

      data: {
        report: "cash-flow",

        period: {
          from: from?.toISOString() ?? null,
          to: to?.toISOString() ?? null,
          timezone: "UTC",
        },

        summary: {
          totalOrders: toNumber(orderSummary.totalOrders),
          paidOrders: toNumber(orderSummary.paidOrders),

          pendingPaymentOrders: toNumber(
            orderSummary.pendingPaymentOrders,
          ),

          failedPaymentOrders: toNumber(
            orderSummary.failedPaymentOrders,
          ),

          refundedOrders: toNumber(orderSummary.refundedOrders),

          cancelledOrders: toNumber(orderSummary.cancelledOrders),

          estimatedCollections,
          recordedRefundedOrderValue: toNumber(
            orderSummary.refundedOrderValue,
          ),

          paidExpenseCount: toNumber(
            expenseSummary.paidExpenseCount,
          ),

          paidExpenses,

          estimatedNetMovement,
        },

        paymentMethodBreakdown: paymentMethodBreakdown.map(
          (item: any) => ({
            paymentMethod: item._id.paymentMethod || "unknown",
            paymentStatus: item._id.paymentStatus || "unknown",
            orderCount: toNumber(item.orderCount),
            orderValue: toNumber(item.orderValue),
          }),
        ),

        dailyFlow,

        accounting: {
          status: "estimated",
          openingCashBalance: null,
          closingCashBalance: null,
          verifiedCashInflows: null,
          verifiedCashOutflows: null,
          verifiedNetCashFlow: null,

          message:
            "The current Order model does not record the exact date or amount of each cash receipt or refund. The Expense model records paid expenses but does not establish bank or cash transactions. Values shown are estimates, not a reconciled cash-flow statement.",

          limitations: [
            "Paid order totals are treated as estimated collections, not verified bank receipts.",
            "Refunded order totals may not equal the actual refund amount.",
            "Cash on delivery collection dates are not recorded in the current Order model.",
            "Expense.date is used as the expense date; actual bank payment dates are not separately recorded.",
            "Opening and closing cash balances require verified cash/bank records.",
          ],
        },
      },

      meta: {
        generatedAt: new Date().toISOString(),
        currency: "INR",
        dataSources: ["Order", "Expense"],
      },
    });
  } catch (error) {
    console.error("[ADMIN_CASH_FLOW_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate the cash-flow report.",
      },
      { status: 500 },
    );
  }
}
