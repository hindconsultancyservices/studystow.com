import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn(
    "Razorpay environment variables are not configured."
  );
}

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

const createPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),

  razorpayOrderId: z.string().min(1),

  razorpayPaymentId: z.string().min(1),

  razorpaySignature: z.string().min(1),
});


// POST /api/payments
//
// Creates a Razorpay payment order.
//
// Body:
// {
//   "orderId": "MONGODB_ORDER_ID"
// }
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    if (!razorpay) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay is not configured on the server",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const validation = createPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { orderId } = validation.data;

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        {
          success: false,
          message: "Order is already paid",
        },
        { status: 400 }
      );
    }

    if (order.paymentMethod !== "razorpay") {
      return NextResponse.json(
        {
          success: false,
          message: "This order is not configured for Razorpay",
        },
        { status: 400 }
      );
    }

    const amount = Math.round(Number(order.total) * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order amount",
        },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: String(order.orderNumber),
      notes: {
        orderId: String(order._id),
        orderNumber: String(order.orderNumber),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment order created successfully",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayKeyId,
        orderId: order._id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error("POST /api/payments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment order",
      },
      { status: 500 }
    );
  }
}


// PUT /api/payments
//
// Verifies Razorpay payment signature.
//
// Body:
// {
//   "orderId": "MONGODB_ORDER_ID",
//   "razorpayOrderId": "order_xxxxx",
//   "razorpayPaymentId": "pay_xxxxx",
//   "razorpaySignature": "xxxxx"
// }
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    if (!razorpayKeySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay is not configured on the server",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment verification data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = validation.data;

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    /*
     * Make sure the Razorpay order belongs
     * to our local order.
     */
    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !== razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment order mismatch",
        },
        { status: 400 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`
      )
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpaySignature)
    );

    if (!isValid) {
      order.paymentStatus = "failed";
      await order.save();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment signature",
        },
        { status: 400 }
      );
    }

    /*
     * Payment successfully verified.
     */
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    console.error("PUT /api/payments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}
