import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

function validId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function getStatus(coupon: any) {
  const now = new Date();

  if (!coupon.active) {
    return "Inactive";
  }

  if (new Date(coupon.startDate) > now) {
    return "Scheduled";
  }

  if (new Date(coupon.endDate) < now) {
    return "Expired";
  }

  if (
    coupon.usageLimit !== undefined &&
    coupon.usageCount >= coupon.usageLimit
  ) {
    return "Expired";
  }

  return "Active";
}

// GET — single coupon
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermission("coupons", "view");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon ID",
        },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findById(id).lean();

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...coupon,
        status: getStatus(coupon),
      },
    });
  } catch (error) {
    console.error("Coupon GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coupon",
      },
      { status: 500 }
    );
  }
}

// PUT — update coupon
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermission("coupons", "edit");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon ID",
        },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      active,
    } = body;

    // Code
    if (code !== undefined) {
      const normalizedCode = String(code)
        .trim()
        .toUpperCase();

      if (!normalizedCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Coupon code cannot be empty",
          },
          { status: 400 }
        );
      }

      const duplicate = await Coupon.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Coupon code already exists",
          },
          { status: 409 }
        );
      }

      coupon.code = normalizedCode;
    }

    // Description
    if (description !== undefined) {
      coupon.description = String(description).trim();
    }

    // Type
    if (type !== undefined) {
      if (!["percentage", "fixed"].includes(type)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid coupon type",
          },
          { status: 400 }
        );
      }

      coupon.type = type;
    }

    // Value
    if (value !== undefined) {
      const discountValue = Number(value);

      if (
        !Number.isFinite(discountValue) ||
        discountValue <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Discount value must be greater than 0",
          },
          { status: 400 }
        );
      }

      coupon.value = discountValue;
    }

    // Percentage validation
    if (
      coupon.type === "percentage" &&
      coupon.value > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Percentage discount cannot exceed 100%",
        },
        { status: 400 }
      );
    }

    // Minimum order
    if (minOrderAmount !== undefined) {
      const amount = Number(minOrderAmount);

      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid minimum order amount",
          },
          { status: 400 }
        );
      }

      coupon.minOrderAmount = amount;
    }

    // Maximum discount
    if (maxDiscountAmount !== undefined) {
      if (maxDiscountAmount === "") {
        coupon.maxDiscountAmount = undefined;
      } else {
        const amount = Number(maxDiscountAmount);

        if (!Number.isFinite(amount) || amount < 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid maximum discount amount",
            },
            { status: 400 }
          );
        }

        coupon.maxDiscountAmount = amount;
      }
    }

    // Usage limit
    if (usageLimit !== undefined) {
      if (usageLimit === "") {
        coupon.usageLimit = undefined;
      } else {
        const limit = Number(usageLimit);

        if (!Number.isInteger(limit) || limit < 1) {
          return NextResponse.json(
            {
              success: false,
              message: "Usage limit must be at least 1",
            },
            { status: 400 }
          );
        }

        if (limit < coupon.usageCount) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Usage limit cannot be less than current usage",
            },
            { status: 400 }
          );
        }

        coupon.usageLimit = limit;
      }
    }

    // Per-user limit
    if (perUserLimit !== undefined) {
      if (perUserLimit === "") {
        coupon.perUserLimit = undefined;
      } else {
        const limit = Number(perUserLimit);

        if (!Number.isInteger(limit) || limit < 1) {
          return NextResponse.json(
            {
              success: false,
              message: "Per-user limit must be at least 1",
            },
            { status: 400 }
          );
        }

        coupon.perUserLimit = limit;
      }
    }

    // Start date
    if (startDate !== undefined) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid start date",
          },
          { status: 400 }
        );
      }

      coupon.startDate = start;
    }

    // End date
    if (endDate !== undefined) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid end date",
          },
          { status: 400 }
        );
      }

      coupon.endDate = end;
    }

    // Date validation
    if (coupon.endDate <= coupon.startDate) {
      return NextResponse.json(
        {
          success: false,
          message: "End date must be after start date",
        },
        { status: 400 }
      );
    }

    // Active / inactive
    if (active !== undefined) {
      coupon.active = Boolean(active);
    }

    const updatedCoupon = await coupon.save();

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      data: {
        ...updatedCoupon.toObject(),
        status: getStatus(updatedCoupon),
      },
    });
  } catch (error: any) {
    console.error("Coupon PUT error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to update coupon",
      },
      { status: 500 }
    );
  }
}

// DELETE — delete coupon
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermission("coupons", "delete");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon ID",
        },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Coupon DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete coupon",
      },
      { status: 500 }
    );
  }
}