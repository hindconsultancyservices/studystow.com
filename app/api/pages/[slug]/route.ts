import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import Page from "@/models/Page";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

const updatePageSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens"
    )
    .optional(),

  content: z.string().optional(),

  excerpt: z.string().max(500).optional(),

  featuredImage: z.string().optional(),

  metaTitle: z.string().max(200).optional(),

  metaDescription: z.string().max(500).optional(),

  status: z
    .enum(["draft", "published"])
    .optional(),

  featured: z.boolean().optional(),

  sortOrder: z.number().int().min(0).optional(),
});


// GET /api/pages/[slug]
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Page slug is required",
        },
        { status: 400 }
      );
    }

    const page = await Page.findOne({
      slug,
    }).lean();

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("GET /api/pages/[slug] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch page",
      },
      { status: 500 }
    );
  }
}


// PUT /api/pages/[slug]
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Page slug is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validation = updatePageSchema.safeParse(body);

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

    const existingPage = await Page.findOne({
      slug,
    });

    if (!existingPage) {
      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    /*
     * If slug is being changed, make sure
     * another page does not already use it.
     */
    if (data.slug && data.slug !== existingPage.slug) {
      const duplicateSlug = await Page.findOne({
        slug: data.slug,
        _id: {
          $ne: existingPage._id,
        },
      }).lean();

      if (duplicateSlug) {
        return NextResponse.json(
          {
            success: false,
            message: "Another page already uses this slug",
          },
          { status: 409 }
        );
      }
    }

    Object.assign(existingPage, data);

    await existingPage.save();

    return NextResponse.json({
      success: true,
      message: "Page updated successfully",
      data: existingPage,
    });
  } catch (error) {
    console.error("PUT /api/pages/[slug] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update page",
      },
      { status: 500 }
    );
  }
}


// DELETE /api/pages/[slug]
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Page slug is required",
        },
        { status: 400 }
      );
    }

    const page = await Page.findOne({
      slug,
    });

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    await Page.deleteOne({
      _id: page._id,
    });

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/pages/[slug] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete page",
      },
      { status: 500 }
    );
  }
}
