
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(user: any) {
  return user?.role === "owner";
}

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null;

  // Accept YYYY-MM-DD and interpret the report dates in UTC.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(
    dateOnly
      ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
      : value,
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    if (!isAuthorized(user)) {
      return NextResponse.json(
        { success: false, message: "Only the owner can access sales reports." },
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const from = parseDate(fromParam);
    const to = parseDate(toParam, true);

    if (fromParam && !from) {
      return NextResponse.json(
        { success: false, message: "Invalid 'from' date." },
        { status: 400 },
      );
    }

    if (toParam && !to) {
      return NextResponse.json(
        { success: false, message: "Invalid 'to' date." },
        { status: 400 },
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        { success: false, message: "'from' date must be before or equal to 'to' date." },
        { status: 400 },
      );
    }

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1,
    );

    const requestedLimit = Number.parseInt(
      searchParams.get("limit") || "100",
      10,
    );

    const limit = Math.min(500, Math.max(1, requestedLimit));
    const skip = (page - 1) * limit;

    await connectDB();

    const filter: Record<string, any> = {};

    if (from || to) {
      filter.createdAt = {};

      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    const [orders, totalOrders, aggregateResult, statusCounts] =
      await Promise.all([
        Order.find(filter)
          .select(
            [
              "orderNumber",
              "createdAt",
              "items",
              "subtotal",
              "shipping",
              "discount",
              "tax",
              "total",
              "paymentMethod",
              "paymentStatus",
              "orderStatus",
            ].join(" "),
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Order.countDocuments(filter),

        Order.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
              subtotal: { $sum: { $ifNull: ["$subtotal", 0] } },
              shipping: { $sum: { $ifNull: ["$shipping", 0] } },
              discount: { $sum: { $ifNull: ["$discount", 0] } },
              tax: { $sum: { $ifNull: ["$tax", 0] } },
              orderValue: { $sum: { $ifNull: ["$total", 0] } },
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
              paidOrders: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0],
                },
              },
              pendingPayments: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0],
                },
              },
              failedPayments: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0],
                },
              },
              refundedPayments: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "refunded"] }, 1, 0],
                },
              },
              cancelledOrders: {
                $sum: {
                  $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0],
                },
              },
            },
          },
        ]),

        Order.aggregate([
          { $match: filter },
          {
            $group: {
              _id: {
                orderStatus: "$orderStatus",
                paymentStatus: "$paymentStatus",
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.orderStatus": 1, "_id.paymentStatus": 1 } },
        ]),
      ]);

    const summary = aggregateResult[0] || {
      orderCount: 0,
      subtotal: 0,
      shipping: 0,
      discount: 0,
      tax: 0,
      orderValue: 0,
      paidOrderValue: 0,
      refundedOrderValue: 0,
      paidOrders: 0,
      pendingPayments: 0,
      failedPayments: 0,
      refundedPayments: 0,
      cancelledOrders: 0,
    };

    const formattedOrders = orders.map((order: any) => ({
      id: String(order._id),
      orderNumber: order.orderNumber,
      date: order.createdAt,
      itemCount: Array.isArray(order.items)
        ? order.items.reduce(
            (count: number, item: any) => count + toNumber(item.quantity),
            0,
          )
        : 0,
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            title: item.title,
            quantity: toNumber(item.quantity),
            price: toNumber(item.price),
            lineTotal: toNumber(item.price) * toNumber(item.quantity),
          }))
        : [],
      subtotal: toNumber(order.subtotal),
      shipping: toNumber(order.shipping),
      discount: toNumber(order.discount),
      tax: toNumber(order.tax),
      total: toNumber(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    }));

    return NextResponse.json({
      success: true,
      data: {
        period: {
          from: from?.toISOString() ?? null,
          to: to?.toISOString() ?? null,
        },
        summary: {
          orderCount: toNumber(summary.orderCount),
          subtotal: toNumber(summary.subtotal),
          shipping: toNumber(summary.shipping),
          discount: toNumber(summary.discount),
          tax: toNumber(summary.tax),
          orderValue: toNumber(summary.orderValue),
          paidOrderValue: toNumber(summary.paidOrderValue),
          refundedOrderValue: toNumber(summary.refundedOrderValue),
          paidOrders: toNumber(summary.paidOrders),
          pendingPayments: toNumber(summary.pendingPayments),
          failedPayments: toNumber(summary.failedPayments),
          refundedPayments: toNumber(summary.refundedPayments),
          cancelledOrders: toNumber(summary.cancelledOrders),
        },
        statusBreakdown: statusCounts.map((item: any) => ({
          orderStatus: item._id.orderStatus,
          paymentStatus: item._id.paymentStatus,
          count: toNumber(item.count),
        })),
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit),
        },
        definitions: {
          orderValue:
            "Sum of order total values, including unpaid and cancelled orders.",
          paidOrderValue:
            "Sum of total values for orders whose paymentStatus is paid. This is not adjusted for refunds unless recorded in the order data.",
          refundedOrderValue:
            "Sum of total values for orders whose paymentStatus is refunded.",
          profit:
            "Not calculated by this sales endpoint. Product purchase costs and operating expenses must be accounted for separately.",
        },
      },
    });
  } catch (error) {
    console.error("[ADMIN_SALES_REPORT_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load the sales report.",
      },
      { status: 500 },
    );
  }
}
