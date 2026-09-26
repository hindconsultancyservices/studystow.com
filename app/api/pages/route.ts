import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import Page from "@/models/Page";

const pageSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),

  slug: z
    .string()
    .min(2, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens"
    ),

  content: z.string().optional().default(""),

  excerpt: z.string().max(500).optional().default(""),

  featuredImage: z.string().optional().default(""),

  metaTitle: z.string().max(200).optional().default(""),

  metaDescription: z.string().max(500).optional().default(""),

  status: z
    .enum(["draft", "published"])
    .optional()
    .default("draft"),

  featured: z.boolean().optional().default(false),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),
});


// GET /api/pages
//
// Examples:
// /api/pages
// /api/pages?search=about
// /api/pages?status=published
// /api/pages?featured=true
// /api/pages?page=1&limit=20
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 20), 1),
      100
    );

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: search,
            $options: "i",
          },
        },
        {
          excerpt: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status === "draft" || status === "published") {
      filter.status = status;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (featured === "false") {
      filter.featured = false;
    }

    const skip = (page - 1) * limit;

    const [pages, total] = await Promise.all([
      Page.find(filter)
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Page.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/pages error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pages",
      },
      { status: 500 }
    );
  }
}


// POST /api/pages
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validation = pageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check duplicate slug
    const existingPage = await Page.findOne({
      slug: data.slug,
    }).lean();

    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          message: "A page with this slug already exists",
        },
        { status: 409 }
      );
    }

    const page = await Page.create({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      status: data.status,
      featured: data.featured,
      sortOrder: data.sortOrder,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Page created successfully",
        data: page,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/pages error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create page",
      },
      { status: 500 }
    );
  }
}
