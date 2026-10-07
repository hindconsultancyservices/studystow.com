import { requireAdminPermission } from "@/lib/admin-authorization";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

type PopulatedCustomer = {
  _id: unknown;
  name?: string;
  email?: string;
  phone?: string;
};

type PopulatedOrder = {
  _id: unknown;
  orderNumber: string;
  customer?: PopulatedCustomer | null;

  shippingAddress: unknown;

  items: Array<{
    book?: unknown;
    title: string;
    quantity: number;
    price: number;
    image?: string;
  }>;

  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;

  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
};

function getDateRange(value: string | null) {
  if (!value || value === "all") return null;

  const now = new Date();
  const days = Number(value);

  if (!Number.isFinite(days)) return null;

  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  return {
    $gte: start,
    $lte: now,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("orders", "view");

    if (!auth.ok) {
      return auth.response;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const payment = searchParams.get("payment") || "all";
    const days = searchParams.get("days") || "30";

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      100
    );

    const query: Record<string, unknown> = {};

    if (status !== "all") {
      query.orderStatus = status;
    }

    if (payment !== "all") {
      query.paymentStatus = payment;
    }

    const createdAt = getDateRange(days);

    if (createdAt) {
      query.createdAt = createdAt;
    }

    if (search) {
      query.$or = [
        {
          orderNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.name": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.phone": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [
      orders,
      totalOrders,
      totalRevenueResult,
      pendingOrders,
      deliveredOrders,
      processingOrders,
      shippedOrders,
    ] = await Promise.all([
      Order.find(query)
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(query),

      Order.aggregate([
        {
          $match: query,
        },
        {
          $match: {
            paymentStatus: {
              $in: ["paid"],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$total",
            },
          },
        },
      ]),

      Order.countDocuments({
        ...query,
        orderStatus: "pending",
      }),

      Order.countDocuments({
        ...query,
        orderStatus: "delivered",
      }),

      Order.countDocuments({
        ...query,
        orderStatus: "processing",
      }),

      Order.countDocuments({
        ...query,
        orderStatus: "shipped",
      }),
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0
        ? Number(totalRevenueResult[0].total || 0)
        : 0;

    const totalPages = Math.ceil(totalOrders / limit);

    const populatedOrders =
      orders as unknown as PopulatedOrder[];

    const data = populatedOrders.map((order) => ({
      _id: String(order._id),
      orderNumber: order.orderNumber,

      customer: order.customer
        ? {
            _id: order.customer._id
              ? String(order.customer._id)
              : undefined,
            name: order.customer.name || "",
            email: order.customer.email || "",
            phone: order.customer.phone || "",
          }
        : null,

      shippingAddress: order.shippingAddress,

      items: order.items.map((item) => ({
        book: item.book ? String(item.book) : undefined,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image || "",
      })),

      itemCount: order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),

      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      tax: order.tax,
      total: order.total,

      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,

      razorpayOrderId: order.razorpayOrderId || null,
      razorpayPaymentId: order.razorpayPaymentId || null,

      notes: order.notes || "",

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data,

      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
      },

      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/orders error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      {
        status: 500,
      }
    );
  }
}
