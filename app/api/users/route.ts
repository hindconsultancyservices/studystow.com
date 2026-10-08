import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const userSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address").transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional().default(""),
  role: z.enum(["customer", "admin"]).optional().default("customer"),
  active: z.boolean().optional().default(true),
});

/**
 * GET /api/users
 * Store/account API only. A signed-in user may read only their own account record.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = String(session?.user?.email || "").trim().toLowerCase();

    if (!sessionEmail) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedSearch = searchParams.get("search")?.trim().toLowerCase() || "";
    const requestedRole = searchParams.get("role")?.trim() || "";

    if (requestedSearch !== sessionEmail || requestedRole) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 20), 1), 100);
    const active = searchParams.get("active");

    const filter: Record<string, unknown> = { email: sessionEmail };
    if (active === "true") filter.active = true;
    if (active === "false") filter.active = false;

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
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Store registration API only. Public registration can create customer accounts, never admins.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validation = userSchema.safeParse({ ...body, role: "customer" });

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: "Invalid user data",
        errors: validation.error.flatten(),
      }, { status: 400 });
    }

    const data = validation.data;
    const existingUser = await User.findOne({ email: data.email }).lean();

    if (existingUser) {
      return NextResponse.json({ success: false, message: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: "customer",
      active: data.active,
    });

    const { password: _password, ...safeUser } = user.toObject();

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: safeUser,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 });
  }
}
