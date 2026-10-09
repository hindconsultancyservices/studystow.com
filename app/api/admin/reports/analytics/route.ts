import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Book from "@/models/Book";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getAmount(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseDate(value: string | null, endOfDay = false) {
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

function getOrderTotal(order: any): number {
  return getAmount(order.total);
}

function isPaid(order: any): boolean {
  return order.paymentStatus === "paid";
}

function isCancelled(order: any): boolean {
  return order.orderStatus === "cancelled";
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"), true);

    const groupBy = (
      searchParams.get("groupBy") || "day"
    ).toLowerCase();

    const search = searchParams.get("search")?.trim();

    if (from === null || to === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date. Use YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "Start date cannot be after end date.",
        },
        { status: 400 }
      );
    }

    if (!["day", "month", "year"].includes(groupBy)) {
      return NextResponse.json(
        {
          success: false,
          message: "groupBy must be day, month, or year.",
        },
        { status: 400 }
      );
    }

    const orderFilter: Record<string, any> = {};

    if (from || to) {
      orderFilter.createdAt = {};

      if (from) orderFilter.createdAt.$gte = from;
      if (to) orderFilter.createdAt.$lte = to;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      orderFilter.$or = [
        { orderNumber: regex },
        { razorpayOrderId: regex },
        { razorpayPaymentId: regex },
      ];
    }

    const [
      orders,
      totalCustomers,
      newCustomers,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      Order.find(orderFilter)
        .select(
          "orderNumber items subtotal shipping discount tax total paymentMethod paymentStatus orderStatus createdAt"
        )
        .sort({ createdAt: 1 })
        .lean(),

      User.countDocuments({ role: "customer" }),

      User.countDocuments({
        role: "customer",
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { $gte: from } : {}),
                ...(to ? { $lte: to } : {}),
              },
            }
          : {}),
      }),

      Book.countDocuments({}),

      Book.countDocuments({
        $or: [
          { stock: { $gt: 0, $lte: 10 } },
          {
            stock: { $exists: false },
            quantity: { $gt: 0, $lte: 10 },
          },
        ],
      }),
    ]);

    let totalOrders = 0;
    let paidOrders = 0;
    let pendingOrders = 0;
    let cancelledOrders = 0;
    let failedPayments = 0;
    let refundedPayments = 0;

    let grossOrderValue = 0;
    let paidSales = 0;
    let pendingValue = 0;
    let totalDiscount = 0;
    let totalShipping = 0;
    let totalTax = 0;
    let totalUnitsSold = 0;

    const paymentMethods: Record<
      string,
      { orders: number; amount: number }
    > = {};

    const orderStatuses: Record<string, number> = {};
    const paymentStatuses: Record<string, number> = {};

    const trends: Record<
      string,
      {
        period: string;
        orders: number;
        paidOrders: number;
        sales: number;
        unitsSold: number;
      }
    > = {};

    const bookSales: Record<
      string,
      {
        title: string;
        quantity: number;
        revenue: number;
      }
    > = {};

    for (const order of orders as any[]) {
      totalOrders++;

      const orderStatus = String(
        order.orderStatus || "unknown"
      ).toLowerCase();

      const paymentStatus = String(
        order.paymentStatus || "unknown"
      ).toLowerCase();

      const paymentMethod = String(
        order.paymentMethod || "unknown"
      ).toLowerCase();

      const orderTotal = getOrderTotal(order);
      const paid = isPaid(order);
      const cancelled = isCancelled(order);

      orderStatuses[orderStatus] =
        (orderStatuses[orderStatus] || 0) + 1;

      paymentStatuses[paymentStatus] =
        (paymentStatuses[paymentStatus] || 0) + 1;

      if (cancelled) cancelledOrders++;

      if (paymentStatus === "failed") failedPayments++;
      if (paymentStatus === "refunded") refundedPayments++;

      if (paymentStatus === "pending") pendingOrders++;

      grossOrderValue += orderTotal;

      if (paid && !cancelled) {
        paidOrders++;
        paidSales += orderTotal;
        totalDiscount += getAmount(order.discount);
        totalShipping += getAmount(order.shipping);
        totalTax += getAmount(order.tax);
      } else if (paymentStatus === "pending" && !cancelled) {
        pendingValue += orderTotal;
      }

      if (!paymentMethods[paymentMethod]) {
        paymentMethods[paymentMethod] = {
          orders: 0,
          amount: 0,
        };
      }

      paymentMethods[paymentMethod].orders++;

      if (paid && !cancelled) {
        paymentMethods[paymentMethod].amount += orderTotal;
      }

      const createdAt = order.createdAt
        ? new Date(order.createdAt)
        : null;

      let period = "unknown";

      if (createdAt && !Number.isNaN(createdAt.getTime())) {
        if (groupBy === "year") {
          period = String(createdAt.getFullYear());
        } else if (groupBy === "month") {
          period = `${createdAt.getFullYear()}-${String(
            createdAt.getMonth() + 1
          ).padStart(2, "0")}`;
        } else {
          period = [
            createdAt.getFullYear(),
            String(createdAt.getMonth() + 1).padStart(2, "0"),
            String(createdAt.getDate()).padStart(2, "0"),
          ].join("-");
        }
      }

      if (!trends[period]) {
        trends[period] = {
          period,
          orders: 0,
          paidOrders: 0,
          sales: 0,
          unitsSold: 0,
        };
      }

      trends[period].orders++;

      if (paid && !cancelled) {
        trends[period].paidOrders++;
        trends[period].sales += orderTotal;
      }

      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const quantity = Math.max(
            0,
            getAmount(item.quantity)
          );

          if (paid && !cancelled) {
            totalUnitsSold += quantity;
            trends[period].unitsSold += quantity;
          }

          const bookId = String(item.book || item.title || "unknown");

          if (!bookSales[bookId]) {
            bookSales[bookId] = {
              title: String(item.title || "Unknown book"),
              quantity: 0,
              revenue: 0,
            };
          }

          if (paid && !cancelled) {
            bookSales[bookId].quantity += quantity;
            bookSales[bookId].revenue +=
              quantity * getAmount(item.price);
          }
        }
      }
    }

    const trendData = Object.values(trends)
      .map((item) => ({
        ...item,
        sales: roundMoney(item.sales),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const topSellingBooks = Object.values(bookSales)
      .map((book) => ({
        ...book,
        revenue: roundMoney(book.revenue),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const averageOrderValue =
      paidOrders > 0 ? paidSales / paidOrders : 0;

    const conversionOrderRate =
      totalCustomers > 0
        ? (newCustomers / totalCustomers) * 100
        : 0;

    return NextResponse.json(
      {
        success: true,
        message: "Analytics report fetched successfully.",

        summary: {
          totalOrders,
          paidOrders,
          pendingOrders,
          cancelledOrders,
          failedPayments,
          refundedPayments,

          grossOrderValue: roundMoney(grossOrderValue),
          paidSales: roundMoney(paidSales),
          pendingValue: roundMoney(pendingValue),

          totalDiscount: roundMoney(totalDiscount),
          totalShipping: roundMoney(totalShipping),
          totalTax: roundMoney(totalTax),

          totalUnitsSold,
          averageOrderValue: roundMoney(averageOrderValue),

          totalCustomers,
          newCustomers,
          totalProducts,
          lowStockProducts,

          customerRegistrationPercentage: roundMoney(
            conversionOrderRate
          ),

          currency: "INR",
        },

        charts: {
          salesTrend: trendData,

          orderStatuses: Object.entries(orderStatuses).map(
            ([status, count]) => ({
              status,
              count,
            })
          ),

          paymentStatuses: Object.entries(paymentStatuses).map(
            ([status, count]) => ({
              status,
              count,
            })
          ),

          paymentMethods: Object.entries(paymentMethods).map(
            ([method, values]) => ({
              method,
              orders: values.orders,
              amount: roundMoney(values.amount),
            })
          ),

          topSellingBooks,
        },

        filters: {
          from: searchParams.get("from") || null,
          to: searchParams.get("to") || null,
          groupBy,
          search: search || "",
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
    console.error("[ANALYTICS_REPORT_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics report.",
      },
      { status: 500 }
    );
  }
}
