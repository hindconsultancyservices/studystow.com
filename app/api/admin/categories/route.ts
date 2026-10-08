import { requireAdminPermission } from "@/lib/admin-authorization";
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


// GET /api/admin/categories
// Supports:
// /api/admin/categories
// /api/admin/categories?search=math
// /api/admin/categories?active=true
// /api/admin/categories?featured=true
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user && ["admin", "owner", "super_admin", "super-admin"].includes(String(session.user.role || "").trim().toLowerCase())) {
      const auth = await requireAdminPermission("categories", "view");
      if (!auth.ok) return auth.response;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const active = searchParams.get("active");
    const featured = searchParams.get("featured");

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
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (active === "true") {
      filter.active = true;
    }

    if (active === "false") {
      filter.active = false;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (featured === "false") {
      filter.featured = false;
    }

    const categories = await Category.find(filter)
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}


// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("categories", "create");
    if (!auth.ok) return auth.response;

    await connectDB();

    const body = await request.json();

    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check duplicate slug
    const existingSlug = await Category.findOne({
      slug: data.slug,
    }).lean();

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists",
        },
        { status: 409 }
      );
    }

    // Check duplicate name
    const existingName = await Category.findOne({
      name: {
        $regex: `^${data.name}$`,
        $options: "i",
      },
    }).lean();

    if (existingName) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this name already exists",
        },
        { status: 409 }
      );
    }

    // Validate parent category if provided
    if (data.parent) {
      const parentCategory = await Category.findById(data.parent).lean();

      if (!parentCategory) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent category not found",
          },
          { status: 400 }
        );
      }
    }

    const category = await Category.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      parent: data.parent || null,
      featured: data.featured,
      active: data.active,
      sortOrder: data.sortOrder,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category",
      },
      { status: 500 }
    );
  }
}
