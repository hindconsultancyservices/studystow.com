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


// ============================================
// GET /api/categories/[id]
// ============================================

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(
      "GET /api/categories/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch category",
      },
      { status: 500 }
    );
  }
}


// ============================================
// PUT /api/categories/[id]
// ============================================

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validation =
      updateCategorySchema.safeParse(body);

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

    // --------------------------------------------
    // Check category exists
    // --------------------------------------------

    const existingCategory =
      await Category.findById(id);

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------
    // Check duplicate slug
    // --------------------------------------------

    const duplicateSlug =
      await Category.findOne({
        slug: data.slug,
        _id: {
          $ne: id,
        },
      }).lean();

    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A category with this slug already exists",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------
    // Check duplicate name
    // --------------------------------------------

    const duplicateName =
      await Category.findOne({
        name: {
          $regex: `^${data.name.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`,
          $options: "i",
        },
        _id: {
          $ne: id,
        },
      }).lean();

    if (duplicateName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A category with this name already exists",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------
    // Validate parent
    // --------------------------------------------

    if (data.parent) {
      if (!mongoose.Types.ObjectId.isValid(data.parent)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid parent category ID",
          },
          { status: 400 }
        );
      }

      // Category cannot be its own parent
      if (data.parent === id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A category cannot be its own parent",
          },
          { status: 400 }
        );
      }

      const parentCategory =
        await Category.findById(data.parent).lean();

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

    // --------------------------------------------
    // Update category
    // --------------------------------------------

    existingCategory.name = data.name;
    existingCategory.slug = data.slug;
    existingCategory.description =
      data.description;

    existingCategory.image = data.image;

    existingCategory.parent =
      data.parent
        ? new mongoose.Types.ObjectId(data.parent)
        : null;

    existingCategory.featured =
      data.featured;

    existingCategory.active =
      data.active;

    existingCategory.sortOrder =
      data.sortOrder;

    await existingCategory.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: existingCategory,
    });
  } catch (error) {
    console.error(
      "PUT /api/categories/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update category",
      },
      { status: 500 }
    );
  }
}


// ============================================
// DELETE /api/categories/[id]
// ============================================

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const category =
      await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/categories/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category",
      },
      { status: 500 }
    );
  }
}