import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Book from "@/models/Book";
import Category from "@/models/Category";

const bookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Book title is required")
    .max(200),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),

  author: z
    .string()
    .trim()
    .min(1, "Author is required")
    .max(150),

  description: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default(""),

  category: z
    .string()
    .trim()
    .min(1, "Category is required"),

  price: z
    .number()
    .nonnegative(),

  compareAtPrice: z
    .number()
    .nonnegative()
    .optional(),

  stock: z
    .number()
    .int()
    .nonnegative()
    .default(0),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(100),

  isbn: z
    .string()
    .trim()
    .max(30)
    .optional(),

  image: z
    .string()
    .trim()
    .optional()
    .default(""),

  images: z
    .array(z.string())
    .optional()
    .default([]),

  publisher: z
    .string()
    .trim()
    .max(150)
    .optional(),

  language: z
    .string()
    .trim()
    .max(50)
    .optional(),

  pages: z
    .number()
    .int()
    .positive()
    .optional(),

  featured: z
    .boolean()
    .default(false),

  published: z
    .boolean()
    .default(true),
});

function errorResponse(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details !== undefined
        ? { errors: details }
        : {}),
    },
    { status },
  );
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const featuredParam = searchParams.get("featured");
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "20", 10) || 20, 1),
      100,
    );

    const filter: Record<string, unknown> = { published: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    if (featuredParam === "true" || featuredParam === "false") {
      filter.featured = featuredParam === "true";
    }

    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Book.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/books error:", error);
    return errorResponse("Failed to fetch books", 500);
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, message: "Method not allowed on the Store API." },
    { status: 405, headers: { Allow: "GET" } },
  );
}
