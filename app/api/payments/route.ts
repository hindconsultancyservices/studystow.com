
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getStoreSettings } from "@/lib/store-settings";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

const createPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

function signatureIsValid(
  keySecret: string,
  orderId: string,
  paymentId: string,
  suppliedSignature: string
) {
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  let supplied: Buffer;

  try {
    supplied = Buffer.from(suppliedSignature, "hex");
  } catch {
    return false;
  }

  return (
    supplied.length === expected.length &&
    crypto.timingSafeEqual(expected, supplied)
  );
}

/**
 * POST /api/payments
 * Create a Razorpay order for the authenticated customer's order.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return errorResponse("Please login before payment.", 401);
    }

    await connectDB();

    const settings = await getStoreSettings();

    if (!settings.razorpayEnabled) {
      return errorResponse(
        "Razorpay is disabled in store settings.",
        400
      );
    }

    if (
      !settings.razorpayConfigured ||
      !settings.razorpayKeyId ||
      !settings.razorpayKeySecret
    ) {
      return errorResponse(
        "Razorpay credentials for the selected mode are not configured.",
        503
      );
    }

    const body = await request.json();
    const validation = createPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment data.",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (!mongooseObjectIdIsValid(validation.data.orderId)) {
      return errorResponse("Invalid order ID.", 400);
    }

    const order = await Order.findById(validation.data.orderId);

    if (!order || String(order.customer) !== userId) {
      return errorResponse("Order not found.", 404);
    }

    if (order.paymentMethod !== "razorpay") {
      return errorResponse(
        "This order is not configured for Razorpay.",
        400
      );
    }

    if (order.orderStatus === "cancelled") {
      return errorResponse(
        "This order has been cancelled.",
        400
      );
    }

    if (order.paymentStatus === "paid") {
      return errorResponse("This order is already paid.", 400);
    }

    const amount = Math.round(Number(order.total) * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return errorResponse("Invalid order amount.", 400);
    }

    const razorpay = new Razorpay({
      key_id: settings.razorpayKeyId,
      key_secret: settings.razorpayKeySecret,
    });

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
      message: "Payment order created successfully.",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: settings.razorpayKeyId,
        orderId: String(order._id),
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error("POST /api/payments error:", error);

    return errorResponse(
      "Failed to create payment order.",
      500
    );
  }
}

/**
 * PUT /api/payments
 * Verify a Razorpay payment signature.
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return errorResponse("Please login to verify payment.", 401);
    }

    await connectDB();

    const settings = await getStoreSettings();

    if (
      !settings.razorpayKeySecret ||
      !settings.razorpayConfigured
    ) {
      return errorResponse(
        "Razorpay credentials for the selected mode are not configured.",
        503
      );
    }

    const body = await request.json();
    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment verification data.",
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

    if (!mongooseObjectIdIsValid(orderId)) {
      return errorResponse("Invalid order ID.", 400);
    }

    const order = await Order.findById(orderId);

    if (!order || String(order.customer) !== userId) {
      return errorResponse("Order not found.", 404);
    }

    if (order.paymentMethod !== "razorpay") {
      return errorResponse(
        "This order is not configured for Razorpay.",
        400
      );
    }

    if (
      order.paymentStatus === "paid" &&
      order.razorpayPaymentId === razorpayPaymentId
    ) {
      return NextResponse.json({
        success: true,
        message: "Payment was already verified.",
        data: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      });
    }

    if (order.paymentStatus === "paid") {
      return errorResponse("This order is already paid.", 409);
    }

    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !== razorpayOrderId
    ) {
      return errorResponse("Payment order mismatch.", 400);
    }

    const validSignature = signatureIsValid(
      settings.razorpayKeySecret,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!validSignature) {
      return errorResponse(
        "Payment signature verification failed.",
        400
      );
    }

    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      data: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    console.error("PUT /api/payments error:", error);

    return errorResponse(
      "Failed to verify payment.",
      500
    );
  }
}

function mongooseObjectIdIsValid(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}
