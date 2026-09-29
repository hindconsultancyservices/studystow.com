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
      "Slug must contain only lowercase letters, numbers and hyphens"
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
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details !== undefined
        ? { errors: details }
        : {}),
    },
    { status }
  );
}

function isAdmin(session: any) {
  return (
    session?.user?.role === "admin" &&
    Boolean(session?.user?.id)
  );
}

/* -------------------------------------------------------
   GET /api/books
------------------------------------------------------- */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const category =
      searchParams.get("category")?.trim() || "";

    const publishedParam =
      searchParams.get("published");

    const featuredParam =
      searchParams.get("featured");

    const page = Math.max(
      Number.parseInt(
        searchParams.get("page") || "1",
        10
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          searchParams.get("limit") || "20",
          10
        ) || 20,
        1
      ),
      100
    );

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
          author: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
        {
          isbn: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (
      category &&
      mongoose.Types.ObjectId.isValid(category)
    ) {
      filter.category = category;
    }

    if (
      publishedParam === "true" ||
      publishedParam === "false"
    ) {
      filter.published =
        publishedParam === "true";
    }

    if (
      featuredParam === "true" ||
      featuredParam === "false"
    ) {
      filter.featured =
        featuredParam === "true";
    }

    const skip = (page - 1) * limit;

    const [books, total] =
      await Promise.all([
        Book.find(filter)
          .populate(
            "category",
            "name slug"
          )
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
        totalPages: Math.ceil(
          total / limit
        ),
        hasNextPage:
          page * limit < total,
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/books error:",
      error
    );

    return errorResponse(
      "Failed to fetch books",
      500
    );
  }
}

/* -------------------------------------------------------
   POST /api/books
------------------------------------------------------- */

export async function POST(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    await connectDB();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "Invalid JSON request body",
        400
      );
    }

    const parsed =
      bookSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Invalid book data",
        422,
        parsed.error.flatten()
      );
    }

    const data = parsed.data;

    /* Category ObjectId validation */

    if (
      !mongoose.Types.ObjectId.isValid(
        data.category
      )
    ) {
      return errorResponse(
        "Invalid category selected",
        422
      );
    }

    /* Category existence */

    const category =
      await Category.findOne({
        _id: data.category,
        active: true,
      }).lean();

    if (!category) {
      return errorResponse(
        "Selected category was not found or is inactive",
        422
      );
    }

    /* Price validation */

    if (
      data.compareAtPrice !== undefined &&
      data.compareAtPrice < data.price
    ) {
      return errorResponse(
        "Compare-at price cannot be lower than the selling price",
        422
      );
    }

    /* Duplicate validation */

    const duplicateQueries: Record<
      string,
      unknown
    >[] = [
      { slug: data.slug },
      { sku: data.sku },
    ];

    if (data.isbn) {
      duplicateQueries.push({
        isbn: data.isbn,
      });
    }

    const existingBook =
      await Book.findOne({
        $or: duplicateQueries,
      }).lean();

    if (existingBook) {
      return errorResponse(
        "A book with the same slug, SKU or ISBN already exists",
        409
      );
    }

    /* Create book */

    const book = await Book.create({
      title: data.title,
      slug: data.slug,
      author: data.author,
      description: data.description,
      category: new mongoose.Types.ObjectId(
        data.category
      ),
      price: data.price,
      compareAtPrice:
        data.compareAtPrice,
      stock: data.stock,
      sku: data.sku.toUpperCase(),
      isbn: data.isbn || undefined,
      image: data.image || undefined,
      images: data.images || [],
      publisher:
        data.publisher || undefined,
      language:
        data.language || "English",
      pages: data.pages,
      featured: data.featured,
      published: data.published,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Book created successfully",
        data: book,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "POST /api/books error:",
      error
    );

    if (
      error?.code === 11000
    ) {
      return errorResponse(
        "A book with the same unique value already exists",
        409
      );
    }

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      return errorResponse(
        "Book validation failed",
        422,
        error.errors
      );
    }

    return errorResponse(
      "Failed to create book",
      500,
      process.env.NODE_ENV ===
        "development"
        ? {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          }
        : undefined
    );
  }
}