import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

const bookSchema = z.object({
  title: z.string().min(1, "Book title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(220)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens"
    ),
  author: z.string().min(1, "Author is required").max(150),
  description: z.string().optional().default(""),
  category: z.string().min(1, "Category is required"),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().default(0),
  sku: z.string().min(1, "SKU is required").max(100),
  isbn: z.string().max(50).optional(),
  image: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  publisher: z.string().max(150).optional(),
  language: z.string().max(50).optional(),
  pages: z.number().int().positive().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
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
      ...(details ? { errors: details } : {}),
    },
    { status }
  );
}

/**
 * GET /admin/book
 *
 * Supported query parameters:
 * ?search=atomic
 * ?category=self-help
 * ?published=true
 * ?featured=true
 * ?page=1
 * ?limit=20
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const publishedParam = searchParams.get("published");
    const featuredParam = searchParams.get("featured");

    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(searchParams.get("limit") || "20", 10) || 20,
        1
      ),
      100
    );

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (publishedParam === "true" || publishedParam === "false") {
      filter.published = publishedParam === "true";
    }

    if (featuredParam === "true" || featuredParam === "false") {
      filter.featured = featuredParam === "true";
    }

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      Book.find(filter)
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
    console.error("GET /admin/book error:", error);

    return errorResponse(
      "Failed to fetch books",
      500
    );
  }
}

/**
 * POST /admin/book
 *
 * Creates a new book.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const parsed = bookSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Invalid book data",
        422,
        parsed.error.flatten()
      );
    }

    const data = parsed.data;

    const existingBook = await Book.findOne({
      $or: [
        { slug: data.slug },
        { sku: data.sku },
        ...(data.isbn ? [{ isbn: data.isbn }] : []),
      ],
    }).lean();

    if (existingBook) {
      return errorResponse(
        "A book with the same slug, SKU or ISBN already exists",
        409
      );
    }

    if (
      data.compareAtPrice !== undefined &&
      data.compareAtPrice < data.price
    ) {
      return errorResponse(
        "Compare-at price cannot be lower than the selling price",
        422
      );
    }

    const book = await Book.create({
      ...data,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Book created successfully",
        data: book,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /admin/book error:", error);

    return errorResponse(
      "Failed to create book",
      500
    );
  }
}
