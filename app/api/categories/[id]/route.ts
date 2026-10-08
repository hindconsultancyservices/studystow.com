import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name is required")
    .max(100),

  slug: z
    .string()
    .min(2, "Slug is required")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens"
    ),

  description: z
    .string()
    .max(500)
    .optional()
    .default(""),

  image: z
    .string()
    .optional()
    .default(""),

  parent: z
    .string()
    .optional()
    .default(""),

  featured: z
    .boolean()
    .optional()
    .default(false),

  active: z
    .boolean()
    .optional()
    .default(true),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),
});


// Public Store API: only active categories are exposed.
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid category ID" }, { status: 400 });
    }
    const category = await Category.findOne({ _id: id, active: true }).lean();
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: "Method not allowed on the Store API." },
    { status: 405, headers: { Allow: "GET" } },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: "Method not allowed on the Store API." },
    { status: 405, headers: { Allow: "GET" } },
  );
}
