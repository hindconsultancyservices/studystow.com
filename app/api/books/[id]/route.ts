import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};
// 
function errorResponse(
  message: string,
  status = 400
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

/**
 * GET /api/books/[id]
 *
 * Example:
 * /api/books/BK001
 *
 * Here [id] represents the book SKU.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const sku = decodeURIComponent(id).trim().toUpperCase();

    if (!sku) {
      return errorResponse(
        "Book SKU is required",
        400
      );
    }

    const book = await Book.findOne({
      sku,
    })
      .populate("category", "name slug")
      .lean();

    if (!book) {
      return errorResponse(
        "Book not found",
        404
      );
    }

    return NextResponse.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error(
      "GET /api/books/[id] error:",
      error
    );

    return errorResponse(
      "Failed to fetch book",
      500
    );
  }
}