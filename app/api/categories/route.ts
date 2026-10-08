import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(100),
  slug: z
    .string()
    .min(2, "Slug is required")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens"
    ),
  description: z.string().max(500).optional().default(""),
  image: z.string().optional().default(""),
  parent: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});


// Public Store API: only active categories are exposed.
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const featured = searchParams.get("featured");
    const filter: Record<string, unknown> = { active: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (featured === "true" || featured === "false") {
      filter.featured = featured === "true";
    }

    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({ success: true, data: categories, count: categories.length });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, message: "Method not allowed on the Store API." },
    { status: 405, headers: { Allow: "GET" } },
  );
}
