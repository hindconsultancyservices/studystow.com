import { getCurrentAdminContext } from "@/lib/admin-authorization";
import { can } from "@/lib/permissions";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import connectDB from "@/lib/db";
import Order from "@/models/Order";

const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

const updateOrderSchema = z.object({
  orderStatus: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .nullable()
    .optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getOrderFilter(id: string) {
  const value = decodeURIComponent(id).trim();

  if (!value) {
    return null;
  }

  if (mongoose.isValidObjectId(value)) {
    return {
      $or: [
        {
          _id: new mongoose.Types.ObjectId(value),
        },
        {
          orderNumber: value,
        },
      ],
    };
  }

  return {
    orderNumber: value,
  };
}

/**
 * GET /api/admin/orders/[id]
 *
 * Supports:
 * /api/admin/orders/68xxxxxxxxxxxx
 * /api/admin/orders/SS-2026-0001
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission("orders", "view");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    const filter = getOrderFilter(id);

    if (!filter) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    const order = await Order.findOne(filter)
      .populate("customer", "name email phone")
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
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
      "GET /api/admin/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 *
 * Updates:
 * - orderStatus
 * - paymentStatus
 * - notes
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const current = await getCurrentAdminContext();
    if (!current.ok) return current.response;

    await connectDB();

    const { id } = await context.params;

    const filter = getOrderFilter(id);

    if (!filter) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order update data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const required: Array<{
      module: "orders";
      action: "update" | "cancel" | "refund";
    }> = [];

    if (parsed.data.orderStatus !== undefined) {
      required.push({
        module: "orders",
        action:
          parsed.data.orderStatus === "cancelled"
            ? "cancel"
            : "update",
      });
    }

    if (parsed.data.paymentStatus !== undefined) {
      required.push({
        module: "orders",
        action:
          parsed.data.paymentStatus === "refunded"
            ? "refund"
            : "update",
      });
    }

    if (parsed.data.notes !== undefined && required.length === 0) {
      required.push({ module: "orders", action: "update" });
    }

    if (!current.context.actor.isOwner) {
      const denied = required.some(
        ({ module, action }) => !can(current.context.actor, module, action)
      );

      if (denied) {
        return NextResponse.json(
          {
            success: false,
            code: "PERMISSION_DENIED",
            message: "You do not have permission to perform this order action.",
            required,
          },
          { status: 403 }
        );
      }
    }

    const updates: Record<string, unknown> = {};

    if (parsed.data.orderStatus !== undefined) {
      updates.orderStatus = parsed.data.orderStatus;
    }

    if (parsed.data.paymentStatus !== undefined) {
      updates.paymentStatus = parsed.data.paymentStatus;
    }

    if (parsed.data.notes !== undefined) {
      updates.notes = parsed.data.notes || undefined;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No changes were provided",
        },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findOneAndUpdate(
      filter,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer", "name email phone")
      .lean();

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
      },
      { status: 500 }
    );
  }
}
