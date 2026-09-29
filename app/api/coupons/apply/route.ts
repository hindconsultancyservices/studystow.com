import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/coupon";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const code = String(body.code || "")
      .trim()
      .toUpperCase();

    const subtotal = Number(body.subtotal || 0);

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid subtotal",
        },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({
      code,
    }).lean();

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon code",
        },
        { status: 404 }
      );
    }

    const now = new Date();

    // Active check
    if (!coupon.active) {
      return NextResponse.json(
        {
          success: false,
          message: "This coupon is inactive",
        },
        { status: 400 }
      );
    }

    // Start date
    if (now < new Date(coupon.startDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "This coupon is not active yet",
        },
        { status: 400 }
      );
    }

    // End date
    if (now > new Date(coupon.endDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "This coupon has expired",
        },
        { status: 400 }
      );
    }

    // Total usage limit
    if (
      coupon.usageLimit !== undefined &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This coupon usage limit has been reached",
        },
        { status: 400 }
      );
    }

    // Minimum order
    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;

    if (coupon.type === "percentage") {
      discount = (subtotal * coupon.value) / 100;

      if (
        coupon.maxDiscountAmount !== undefined &&
        discount > coupon.maxDiscountAmount
      ) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.value;
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, subtotal);

    // Round to 2 decimals
    discount = Math.round(discount * 100) / 100;

    const finalTotal =
      Math.round((subtotal - discount) * 100) / 100;

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        couponId: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        subtotal,
        finalTotal,
      },
    });
  } catch (error) {
    console.error("Apply coupon error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to apply coupon",
      },
      { status: 500 }
    );
  }
}