import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "newest";

    const filter: Record<string, unknown> = {
      role: "customer",
    };

    // Search
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Status
    if (status === "active") {
      filter.active = true;
    }

    if (status === "inactive") {
      filter.active = false;
    }

    // Sorting
    let sortOption: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    const customers = await User.find(filter)
      .select(
        "_id name email phone role active createdAt updatedAt"
      )
      .sort(sortOption)
      .lean();

    const [totalCustomers, activeCustomers, inactiveCustomers] =
      await Promise.all([
        User.countDocuments({
          role: "customer",
        }),

        User.countDocuments({
          role: "customer",
          active: true,
        }),

        User.countDocuments({
          role: "customer",
          active: false,
        }),
      ]);

    // Current month new customers
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const newCustomers = await User.countDocuments({
      role: "customer",
      createdAt: {
        $gte: startOfMonth,
      },
    });

    return NextResponse.json({
      success: true,

      data: customers,

      stats: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        newCustomers,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/customers error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customers",
      },
      {
        status: 500,
      }
    );
  }
}