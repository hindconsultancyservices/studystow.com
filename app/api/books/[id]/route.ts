
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import Book from "@/models/Book";
import Category from "@/models/Category";
import { authOptions } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function isAdmin(user: any) {
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const adminRole = String(user?.adminRole || "")
    .trim()
    .toLowerCase();

  return (
    role === "admin" ||
    role === "owner" ||
    role === "super_admin" ||
    role === "super-admin" ||
    adminRole === "admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin" ||
    adminRole === "super-admin"
  );
}

/* Public Store API: published books only. */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const sku = decodeURIComponent(id).trim().toUpperCase();
    if (!sku) return errorResponse("Book SKU is required", 400);

    const book = await Book.findOne({ sku, published: true })
      .populate("category", "name slug")
      .lean();

    if (!book) return errorResponse("Book not found", 404);
    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    console.error("GET /api/books/[id] error:", error);
    return errorResponse("Failed to fetch book", 500);
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
