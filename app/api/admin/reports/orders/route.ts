
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null;

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(
    isDateOnly
      ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
      : value,
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOrZero(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
        { success: false, message: "Only the owner can access this report." },
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
        { success: false, message: "From date must not be after to date." },
        { status: 400 },
      );
    }

    const page = Math.max(
      1,
      Number.parseInt(params.get("page") || "1", 10) || 1,
    );

    const requestedLimit = Number.parseInt(
      params.get("limit") || "50",
      10,
    );

    const limit = Math.min(200, Math.max(1, requestedLimit));

    const paymentStatus = params.get("paymentStatus");
    const orderStatus = params.get("orderStatus");
    const search = params.get("search")?.trim();

    const filter: Record<string, any> = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    const allowedOrderStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (paymentStatus) {
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid payment status." },
          { status: 400 },
        );
      }

      filter.paymentStatus = paymentStatus;
    }

    if (orderStatus) {
      if (!allowedOrderStatuses.includes(orderStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid order status." },
          { status: 400 },
        );
      }

      filter.orderStatus = orderStatus;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { orderNumber: { $regex: escapedSearch, $options: "i" } },
        { "items.title": { $regex: escapedSearch, $options: "i" } },
      ];
    }

    await connectDB();

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select(
          [
            "orderNumber",
            "createdAt",
            "updatedAt",
            "items",
            "subtotal",
            "shipping",
            "discount",
            "tax",
            "total",
            "paymentMethod",
            "paymentStatus",
            "orderStatus",
            "notes",
          ].join(" "),
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    const formattedOrders = orders.map((order: any) => ({
      id: String(order._id),
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: (order.items || []).map((item: any) => ({
        title: item.title,
        quantity: numberOrZero(item.quantity),
        price: numberOrZero(item.price),
        lineTotal:
          numberOrZero(item.quantity) * numberOrZero(item.price),
      })),
      itemCount: (order.items || []).reduce(
        (sum: number, item: any) => sum + numberOrZero(item.quantity),
        0,
      ),
      subtotal: numberOrZero(order.subtotal),
      shipping: numberOrZero(order.shipping),
      discount: numberOrZero(order.discount),
      tax: numberOrZero(order.tax),
      total: numberOrZero(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      notes: order.notes || "",
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        from: from?.toISOString() || null,
        to: to?.toISOString() || null,
        paymentStatus: paymentStatus || null,
        orderStatus: orderStatus || null,
        search: search || null,
      },
    });
  } catch (error) {
    console.error("[ADMIN_REPORT_ORDERS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch orders.",
      },
      { status: 500 },
    );
  }
}
