import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Wishlist from "@/models/Wishlist";
import Book from "@/models/Book";

function getUserId(session: any) {
  return session?.user?.id || session?.user?._id || "";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view your wishlist.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const wishlist = await Wishlist.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .populate(
        "book",
        "title slug author price compareAtPrice image stock published"
      )
      .lean();

    const items = wishlist
      .filter((item: any) => item.book)
      .map((item: any) => ({
        _id: String(item.book._id),
        id: String(item.book._id),
        title: item.book.title || "",
        slug: item.book.slug || "",
        author: item.book.author || "",
        price: Number(item.book.price || 0),
        compareAtPrice:
          item.book.compareAtPrice !== undefined
            ? Number(item.book.compareAtPrice)
            : undefined,
        image: item.book.image || "",
        stock: Number(item.book.stock || 0),
        published: item.book.published !== false,
        wishlistId: String(item._id),
      }));

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("GET /api/wishlist error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load wishlist.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to add books to wishlist.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const bookId = String(body?.bookId || "").trim();

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          message: "Book ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const book = await Book.findOne({
      _id: bookId,
      published: true,
    }).lean();

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Book not found.",
        },
        { status: 404 }
      );
    }

    const existing = await Wishlist.findOne({
      user: userId,
      book: bookId,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Book is already in wishlist.",
        item: {
          _id: String(book._id),
          id: String(book._id),
          title: book.title,
          slug: book.slug,
          author: book.author || "",
          price: Number(book.price || 0),
          compareAtPrice:
            book.compareAtPrice !== undefined
              ? Number(book.compareAtPrice)
              : undefined,
          image: book.image || "",
          stock: Number(book.stock || 0),
          published: book.published !== false,
        },
      });
    }

    await Wishlist.create({
      user: userId,
      book: bookId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Book added to wishlist.",
        item: {
          _id: String(book._id),
          id: String(book._id),
          title: book.title,
          slug: book.slug,
          author: book.author || "",
          price: Number(book.price || 0),
          compareAtPrice:
            book.compareAtPrice !== undefined
              ? Number(book.compareAtPrice)
              : undefined,
          image: book.image || "",
          stock: Number(book.stock || 0),
          published: book.published !== false,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/wishlist error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({
        success: true,
        message: "Book is already in wishlist.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add book to wishlist.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const bookId = String(body?.bookId || "").trim();

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          message: "Book ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    await Wishlist.deleteOne({
      user: userId,
      book: bookId,
    });

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist.",
    });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to remove from wishlist.",
      },
      { status: 500 }
    );
  }
}