
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

/* =========================================================
   GET /api/books/[id]

   Example:
   /api/books/BK001

   [id] represents Book SKU.
========================================================= */

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const sku = decodeURIComponent(id)
      .trim()
      .toUpperCase();

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

/* =========================================================
   PUT /api/books/[id]

   Updates an existing book using its current SKU.

   Example:
   PUT /api/books/BK001
========================================================= */

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const currentSku = decodeURIComponent(id)
      .trim()
      .toUpperCase();

    if (!currentSku) {
      return errorResponse(
        "Book SKU is required",
        400
      );
    }

    /* -----------------------------------------
       Read request body safely
    ----------------------------------------- */

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "Invalid JSON request body",
        400
      );
    }

    /* -----------------------------------------
       Find existing book
    ----------------------------------------- */

    const existingBook = await Book.findOne({
      sku: currentSku,
    });

    if (!existingBook) {
      return errorResponse(
        "Book not found",
        404
      );
    }

    /* -----------------------------------------
       Basic validation
    ----------------------------------------- */

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    const author =
      typeof body.author === "string"
        ? body.author.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const sku =
      typeof body.sku === "string"
        ? body.sku.trim().toUpperCase()
        : "";

    const isbn =
      typeof body.isbn === "string"
        ? body.isbn.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const publisher =
      typeof body.publisher === "string"
        ? body.publisher.trim()
        : "";

    const language =
      typeof body.language === "string"
        ? body.language.trim()
        : "English";

    if (!title) {
      return errorResponse(
        "Book title is required",
        422
      );
    }

    if (!slug) {
      return errorResponse(
        "Book slug is required",
        422
      );
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return errorResponse(
        "Slug must contain only lowercase letters, numbers and hyphens",
        422
      );
    }

    if (!author) {
      return errorResponse(
        "Author is required",
        422
      );
    }

    if (!category) {
      return errorResponse(
        "Category is required",
        422
      );
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return errorResponse(
        "Invalid category",
        422
      );
    }

    if (!sku) {
      return errorResponse(
        "SKU is required",
        422
      );
    }

    /* -----------------------------------------
       Numeric values
    ----------------------------------------- */

    const price = Number(body.price);
    const stock = Number(body.stock);

    const compareAtPrice =
      body.compareAtPrice === undefined ||
      body.compareAtPrice === null ||
      body.compareAtPrice === ""
        ? undefined
        : Number(body.compareAtPrice);

    const pages =
      body.pages === undefined ||
      body.pages === null ||
      body.pages === ""
        ? undefined
        : Number(body.pages);

    if (!Number.isFinite(price) || price < 0) {
      return errorResponse(
        "Price must be a valid non-negative number",
        422
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return errorResponse(
        "Stock must be a non-negative whole number",
        422
      );
    }

    if (
      compareAtPrice !== undefined &&
      (!Number.isFinite(compareAtPrice) ||
        compareAtPrice < 0)
    ) {
      return errorResponse(
        "Compare-at price must be a valid non-negative number",
        422
      );
    }

    if (
      compareAtPrice !== undefined &&
      compareAtPrice < price
    ) {
      return errorResponse(
        "Compare-at price cannot be lower than the selling price",
        422
      );
    }

    if (
      pages !== undefined &&
      (!Number.isInteger(pages) || pages < 1)
    ) {
      return errorResponse(
        "Pages must be a positive whole number",
        422
      );
    }

    /* -----------------------------------------
       Images
    ----------------------------------------- */

    const images = Array.isArray(body.images)
      ? body.images
          .filter(
            (item): item is string =>
              typeof item === "string"
          )
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    /* -----------------------------------------
       Boolean values
    ----------------------------------------- */

    const featured =
      typeof body.featured === "boolean"
        ? body.featured
        : false;

    const published =
      typeof body.published === "boolean"
        ? body.published
        : true;

    /* -----------------------------------------
       Check category exists
    ----------------------------------------- */

    const categoryExists =
      await Category.findOne({
        _id: category,
        active: true,
      }).lean();

    if (!categoryExists) {
      return errorResponse(
        "Selected category does not exist or is inactive",
        422
      );
    }

    /* -----------------------------------------
       Check duplicate slug

       Ignore current book.
    ----------------------------------------- */

    const duplicateSlug =
      await Book.findOne({
        slug,
        _id: { $ne: existingBook._id },
      }).lean();

    if (duplicateSlug) {
      return errorResponse(
        `Another book already uses the slug "${slug}"`,
        409
      );
    }

    /* -----------------------------------------
       Check duplicate SKU

       Ignore current book.
    ----------------------------------------- */

    const duplicateSku =
      await Book.findOne({
        sku,
        _id: { $ne: existingBook._id },
      }).lean();

    if (duplicateSku) {
      return errorResponse(
        `Another book already uses the SKU "${sku}"`,
        409
      );
    }

    /* -----------------------------------------
       Check duplicate ISBN

       Empty ISBN is allowed.
    ----------------------------------------- */

    if (isbn) {
      const duplicateIsbn =
        await Book.findOne({
          isbn,
          _id: { $ne: existingBook._id },
        }).lean();

      if (duplicateIsbn) {
        return errorResponse(
          `Another book already uses the ISBN "${isbn}"`,
          409
        );
      }
    }

    /* -----------------------------------------
       Update book
    ----------------------------------------- */

    existingBook.title = title;
    existingBook.slug = slug;
    existingBook.author = author;
    existingBook.description = description;

    existingBook.category =
      new mongoose.Types.ObjectId(category);

    existingBook.price = price;

    if (compareAtPrice === undefined) {
      existingBook.compareAtPrice = undefined;
    } else {
      existingBook.compareAtPrice =
        compareAtPrice;
    }

    existingBook.stock = stock;
    existingBook.sku = sku;

    if (isbn) {
      existingBook.isbn = isbn;
    } else {
      existingBook.isbn = undefined;
    }

    if (image) {
      existingBook.image = image;
    } else {
      existingBook.image = undefined;
    }

    existingBook.images = images;

    if (publisher) {
      existingBook.publisher = publisher;
    } else {
      existingBook.publisher = undefined;
    }

    existingBook.language =
      language || "English";

    if (pages === undefined) {
      existingBook.pages = undefined;
    } else {
      existingBook.pages = pages;
    }

    existingBook.featured = featured;
    existingBook.published = published;

    await existingBook.save();

    /* -----------------------------------------
       Return updated book
    ----------------------------------------- */

    const updatedBook =
      await Book.findById(existingBook._id)
        .populate("category", "name slug")
        .lean();

    return NextResponse.json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    console.error(
      "PUT /api/books/[id] error:",
      error
    );

    /*
      Mongoose validation error
    */
    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      const messages = Object.values(
        error.errors
      )
        .map((item) => item.message)
        .join(", ");

      return errorResponse(
        messages || "Book validation failed",
        422
      );
    }

    /*
      Duplicate MongoDB key
    */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return errorResponse(
        "A book with the same unique value already exists",
        409
      );
    }

    return errorResponse(
      "Failed to update book",
      500
    );
  }
}

/* =========================================================
   DELETE /api/books/[id]

   Deletes an existing book using its SKU.

   Example:
   DELETE /api/books/BK001
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    /* -----------------------------------------
       Check logged-in admin
    ----------------------------------------- */

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse(
        "You are not authorized.",
        401
      );
    }

    if (!isAdmin(session.user)) {
      return errorResponse(
        "You do not have permission to delete books.",
        403
      );
    }

    /* -----------------------------------------
       Get SKU
    ----------------------------------------- */

    const { id } = await context.params;

    const sku = decodeURIComponent(id)
      .trim()
      .toUpperCase();

    if (!sku) {
      return errorResponse(
        "Book SKU is required",
        400
      );
    }

    /* -----------------------------------------
       Connect database
    ----------------------------------------- */

    await connectDB();

    /* -----------------------------------------
       Find book by SKU
    ----------------------------------------- */

    const book = await Book.findOne({
      sku,
    }).select("_id title sku");

    if (!book) {
      return errorResponse(
        "Book not found",
        404
      );
    }

    /* -----------------------------------------
       Delete book
    ----------------------------------------- */

    await Book.deleteOne({
      _id: book._id,
    });

    /* -----------------------------------------
       Success response
    ----------------------------------------- */

    return NextResponse.json({
      success: true,
      message: `"${book.title}" has been deleted successfully.`,
      data: {
        id: String(book._id),
        sku: book.sku,
      },
    });
  } catch (error) {
    console.error(
      "DELETE /api/books/[id] error:",
      error
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to delete book",
      500
    );
  }
}
