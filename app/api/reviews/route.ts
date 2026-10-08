import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

type SessionUser = {
  id?: string;
  email?: string | null;
  role?: string;
};

function getUserId(
  session: Awaited<ReturnType<typeof getServerSession>>
) {
  const user = (session as { user?: SessionUser } | null | undefined)?.user;

  return user?.id || null;
}

function isAdmin(
  session: Awaited<ReturnType<typeof getServerSession>>
) {
  const user = (session as { user?: SessionUser } | null | undefined)?.user;

  return user?.role === "admin";
}

/* Public Store API: only approved reviews for a book. */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId")?.trim() || "";
    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
      return NextResponse.json(
        { success: false, message: "A valid bookId is required." },
        { status: 400 },
      );
    }

    const reviews = await Review.find({ book: bookId, status: "approved" })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const statsResult = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(bookId), status: "approved" } },
      { $group: { _id: null, total: { $sum: 1 }, averageRating: { $avg: "$rating" } } },
    ]);
    const stats = statsResult[0] || { total: 0, averageRating: 0 };

    const ratingResult = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(bookId), status: "approved" } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of ratingResult) {
      if (Number.isInteger(item._id) && item._id >= 1 && item._id <= 5) {
        ratingBreakdown[item._id as 1 | 2 | 3 | 4 | 5] = item.count;
      }
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: {
        total: stats.total || 0,
        averageRating: Number(stats.averageRating || 0),
        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch reviews." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    const userId =
      getUserId(session);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to submit a review.",
        },
        { status: 401 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user.",
        },
        { status: 400 }
      );
    }

    const body =
      await request.json();

    const bookId =
      typeof body.bookId === "string"
        ? body.bookId.trim()
        : "";

    const rating =
      Number(body.rating);

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const comment =
      typeof body.comment === "string"
        ? body.comment.trim()
        : "";

    if (
      !bookId ||
      !mongoose.Types.ObjectId.isValid(
        bookId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid book ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rating must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review comment is required.",
        },
        { status: 400 }
      );
    }

    if (
      comment.length < 3 ||
      comment.length > 3000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review must be between 3 and 3000 characters.",
        },
        { status: 400 }
      );
    }

    if (title.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review title cannot exceed 150 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    /*
     * Prevent duplicate review.
     */
    const existingReview =
      await Review.findOne({
        book: bookId,
        user: userId,
      });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already reviewed this book.",
        },
        { status: 409 }
      );
    }

    /*
     * New reviews remain pending
     * until admin approves them.
     */
    const review =
      await Review.create({
        book: bookId,
        user: userId,
        rating,
        title: title || undefined,
        comment,
        status: "pending",
        verifiedPurchase: false,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Review submitted successfully. It will appear after approval.",
        data: {
          id: review._id.toString(),
          status: review.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    /*
     * MongoDB unique index:
     * { book: 1, user: 1 }
     */
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already reviewed this book.",
        },
        { status: 409 }
      );
    }

    console.error(
      "POST /api/reviews error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to submit review.",
      },
      { status: 500 }
    );
  }
}