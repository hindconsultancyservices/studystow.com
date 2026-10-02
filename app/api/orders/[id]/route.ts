import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Order from "@/models/Order";
import Book from "@/models/Book";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ============================================================
// PATCH /api/orders/[id]
// Cancel customer's order
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to cancel your order.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const orderNumber = String(id || "").trim();

    if (!orderNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number is required.",
        },
        { status: 400 }
      );
    }

    let body: {
      action?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const action =
      typeof body.action === "string"
        ? body.action.trim().toLowerCase()
        : "";

    if (action !== "cancel") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order action.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // ========================================================
    // FIND ONLY THE LOGGED-IN USER'S ORDER
    // ========================================================

    const order = await Order.findOne({
      orderNumber,
      customer: session.user.id,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    const currentStatus = String(
      order.orderStatus || ""
    )
      .trim()
      .toLowerCase();

    // ========================================================
    // ALREADY CANCELLED
    // ========================================================

    if (currentStatus === "cancelled") {
      return NextResponse.json({
        success: true,
        message: "Order is already cancelled.",
        data: {
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
        },
      });
    }

    // ========================================================
    // CUSTOMER CAN CANCEL ONLY BEFORE SHIPPING
    // ========================================================

    const cancellableStatuses = [
      "pending",
      "confirmed",
      "processing",
    ];

    if (!cancellableStatuses.includes(currentStatus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order can no longer be cancelled.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // CANCEL ORDER
    // ========================================================

    order.orderStatus = "cancelled";

    await order.save();

    // ========================================================
    // RESTORE STOCK
    // ========================================================

    for (const item of order.items) {
      if (!item.book || item.quantity <= 0) {
        continue;
      }

      await Book.updateOne(
        {
          _id: item.book,
        },
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
      data: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to cancel order.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET /api/orders/[id]
// Get one customer's order
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const orderNumber = String(id || "").trim();

    if (!orderNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      orderNumber,
      customer: session.user.id,
    })
      .populate(
        "items.book",
        "title author slug image price compareAtPrice"
      )
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "GET /api/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order.",
      },
      { status: 500 }
    );
  }
}