
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") || "20", 10) || 20
      )
    );

    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim().toLowerCase();
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"), true);

    if (from === null || to === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date. Use YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "Start date cannot be after end date.",
        },
        { status: 400 }
      );
    }

    const filter: Record<string, any> = {
      role: "customer",
    };

    if (from || to) {
      filter.createdAt = {};

      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    if (status && status !== "all") {
      switch (status) {
        case "active":
          filter.isActive = true;
          break;

        case "inactive":
          filter.isActive = false;
          break;

        default:
          return NextResponse.json(
            {
              success: false,
              message: "Invalid status. Use all, active, or inactive.",
            },
            { status: 400 }
          );
      }
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const [customers, totalRecords, allCustomers] = await Promise.all([
      User.find(filter)
        .select(
          "name email phone role isActive status createdAt updatedAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),

      User.find({ role: "customer" })
        .select("isActive status createdAt")
        .lean(),
    ]);

    const totalCustomers = allCustomers.length;

    const activeCustomers = (allCustomers as any[]).filter(
      (customer) =>
        customer.isActive === true ||
        (customer.isActive === undefined &&
          String(customer.status ?? "").toLowerCase() === "active")
    ).length;

    const inactiveCustomers = (allCustomers as any[]).filter(
      (customer) =>
        customer.isActive === false ||
        (customer.isActive === undefined &&
          String(customer.status ?? "").toLowerCase() === "inactive")
    ).length;

    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const newCustomersThisMonth = (allCustomers as any[]).filter(
      (customer) =>
        customer.createdAt &&
        new Date(customer.createdAt) >= monthStart
    ).length;

    const data = (customers as any[]).map((customer) => ({
      id: String(customer._id),
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      status:
        customer.isActive === true
          ? "active"
          : customer.isActive === false
            ? "inactive"
            : customer.status ?? "unknown",
      createdAt: customer.createdAt ?? null,
      updatedAt: customer.updatedAt ?? null,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Customer report fetched successfully.",
        data,

        summary: {
          totalCustomers,
          activeCustomers,
          inactiveCustomers,
          newCustomersThisMonth,
        },

        pagination: {
          page,
          limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
          hasNextPage: page * limit < totalRecords,
          hasPreviousPage: page > 1,
        },

        filters: {
          search: search || "",
          status: status || "all",
          from: searchParams.get("from") || null,
          to: searchParams.get("to") || null,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[CUSTOMERS_REPORT_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customer report.",
      },
      { status: 500 }
    );
  }
}
