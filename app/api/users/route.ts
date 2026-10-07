import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { requireAdminPermission, getCurrentAdminContext } from "@/lib/admin-authorization";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const userSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),

  email: z
    .string()
    .email("Invalid email address")
    .transform((value) => value.toLowerCase().trim()),

  password: z.string().min(8, "Password must be at least 8 characters"),

  phone: z.string().optional().default(""),

  role: z
    .enum(["customer", "admin"])
    .optional()
    .default("customer"),

  active: z.boolean().optional().default(true),
});


// GET /api/users
//
// Examples:
// /api/users
// /api/users?page=1&limit=20
// /api/users?search=john
// /api/users?role=customer
// /api/users?active=true
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = String(session?.user?.email || "").trim().toLowerCase();
    const { searchParams } = new URL(request.url);
    const requestedSearch = searchParams.get("search")?.trim() || "";
    const requestedRole = searchParams.get("role")?.trim().toLowerCase() || "";

    if (session?.user && ["admin", "owner", "super_admin", "super-admin"].includes(String(session.user.role || "").trim().toLowerCase())) {
      const auth = await requireAdminPermission("adminUsers", "view");
      if (!auth.ok) return auth.response;
    } else if (!(sessionEmail && requestedSearch.toLowerCase() === sessionEmail && !requestedRole)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 20), 1),
      100
    );

    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const active = searchParams.get("active");

    const filter: Record<string, unknown> = {};

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

    if (role === "customer" || role === "admin") {
      filter.role = role;
    }

    if (active === "true") {
      filter.active = true;
    }

    if (active === "false") {
      filter.active = false;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}


// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const bodyPreview = await request.clone().json().catch(() => null);
    const requestedRole = String(bodyPreview?.role || "customer").trim().toLowerCase();

    const session = await getServerSession(authOptions);
    const sessionRole = String(session?.user?.role || "").trim().toLowerCase();
    const sessionIsAdmin = ["admin", "owner", "super_admin", "super-admin"].includes(sessionRole);

    if (sessionIsAdmin) {
      if (requestedRole === "admin") {
        const auth = await getCurrentAdminContext();
        if (!auth.ok) return auth.response;
        if (!auth.context.actor.isOwner) {
          return NextResponse.json(
            { success: false, message: "Only the owner can create administrator accounts." },
            { status: 403 }
          );
        }
      } else {
        const auth = await requireAdminPermission("customers", "create");
        if (!auth.ok) return auth.response;
      }
    } else if (requestedRole === "admin") {
      return NextResponse.json(
        { success: false, message: "Only the owner can create administrator accounts." },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check duplicate email
    const existingUser = await User.findOne({
      email: data.email,
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: data.role,
      active: data.active,
    });

    // Never return password
    const { password: _password, ...safeUser } = user.toObject();

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      { status: 500 }
    );
  }
}
