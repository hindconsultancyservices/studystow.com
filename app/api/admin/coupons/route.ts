import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

function isAdmin(session: any) {
  return session?.user?.role === "admin";
}

// GET — all coupons
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("coupons", "view");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";

    const now = new Date();

    const filter: Record<string, any> = {};

    if (search) {
      filter.code = {
        $regex: search,
        $options: "i",
      };
    }

    if (type !== "all") {
      filter.type = type;
    }

    if (status === "active") {
      filter.active = true;
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    if (status === "scheduled") {
      filter.active = true;
      filter.startDate = { $gt: now };
    }

    if (status === "expired") {
      filter.endDate = { $lt: now };
    }

    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: await Coupon.countDocuments(),
      active: await Coupon.countDocuments({
        active: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
      scheduled: await Coupon.countDocuments({
        active: true,
        startDate: { $gt: now },
      }),
      expired: await Coupon.countDocuments({
        endDate: { $lt: now },
      }),
    };

    return NextResponse.json({
      success: true,
      data: coupons,
      stats,
    });
  } catch (error) {
    console.error("Coupons GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coupons",
      },
      { status: 500 }
    );
  }
}

// POST — create coupon
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("coupons", "create");
    if (!auth.ok) return auth.response;

    await connectDB();

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

    if (!code || !type || value === undefined || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Code, type, value, start date and end date are required",
        },
        { status: 400 }
      );
    }

    if (!["percentage", "fixed"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon type",
        },
        { status: 400 }
      );
    }

    const discountValue = Number(value);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Discount value must be greater than 0",
        },
        { status: 400 }
      );
    }

    if (type === "percentage" && discountValue > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Percentage discount cannot exceed 100%",
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid start or end date",
        },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        {
          success: false,
          message: "End date must be after start date",
        },
        { status: 400 }
      );
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const existingCoupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (existingCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists",
        },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      description: description?.trim() || "",
      type,
      value: discountValue,
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscountAmount:
        maxDiscountAmount !== undefined &&
        maxDiscountAmount !== ""
          ? Number(maxDiscountAmount)
          : undefined,
      usageLimit:
        usageLimit !== undefined && usageLimit !== ""
          ? Number(usageLimit)
          : undefined,
      usageCount: 0,
      perUserLimit:
        perUserLimit !== undefined && perUserLimit !== ""
          ? Number(perUserLimit)
          : undefined,
      startDate: start,
      endDate: end,
      active: active !== false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        data: coupon,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Coupons POST error:", error);

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
        message: error?.message || "Failed to create coupon",
      },
      { status: 500 }
    );
  }
}