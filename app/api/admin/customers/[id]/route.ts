import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAdmin(user: any) {
  const role = String(user?.role || "")
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/ /g, "_");

  const adminRole = String(user?.adminRole || "")
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/ /g, "_");

  return (
    role === "admin" ||
    role === "owner" ||
    role === "super_admin" ||
    adminRole === "admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin"
  );
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("customers", "view");

    if (!auth.ok) {
      return auth.response;
    }

    void request;

    await connectDB();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer ID is required.",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid customer ID.",
          id,
        },
        { status: 400 }
      );
    }

    const customer = await User.findById(id).lean();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
          id,
        },
        { status: 404 }
      );
    }

    const rawCustomer = customer as any;

    const formattedCustomer = {
      _id: String(rawCustomer._id),
      name: rawCustomer.name || "",
      email: rawCustomer.email || "",
      phone: rawCustomer.phone || "",
      role: rawCustomer.role || "customer",

      // Support both common field names.
      active:
        typeof rawCustomer.active === "boolean"
          ? rawCustomer.active
          : typeof rawCustomer.isActive === "boolean"
          ? rawCustomer.isActive
          : rawCustomer.status
          ? String(rawCustomer.status).toLowerCase() ===
            "active"
          : true,

      createdAt: rawCustomer.createdAt
        ? new Date(rawCustomer.createdAt).toISOString()
        : "",

      updatedAt: rawCustomer.updatedAt
        ? new Date(rawCustomer.updatedAt).toISOString()
        : "",
    };

    return NextResponse.json({
      success: true,
      data: formattedCustomer,

      // Compatibility in case another frontend
      // expects "customer" instead of "data".
      customer: formattedCustomer,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/customers/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        message: `Failed to load customer: ${message}`,
      },
      { status: 500 }
    );
  }
}