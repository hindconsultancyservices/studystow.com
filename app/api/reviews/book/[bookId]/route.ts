import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Book from "@/models/Book";
import "@/models/Book";

type RouteContext = {
  params: Promise<{
    bookId: string;
  }>;
};

/*
 * ============================================================
 * GET
 * Approved reviews for one book
 * ============================================================
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { bookId } = await params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid book ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const reviews = await Review.find({
      book: bookId,
      status: "approved",
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const statsResult = await Review.aggregate([
      {
        $match: {
          book: new mongoose.Types.ObjectId(bookId),
          status: "approved",
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                averageRating: { $avg: "$rating" },
              },
            },
          ],

          ratings: [
            {
              $group: {
                _id: "$rating",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const statsData = statsResult[0] || {};

    const summary = statsData.summary?.[0];

    const ratingBreakdown = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const item of statsData.ratings || []) {
      if (
        Number.isInteger(item._id) &&
        item._id >= 1 &&
        item._id <= 5
      ) {
        ratingBreakdown[
          item._id as 1 | 2 | 3 | 4 | 5
        ] = Number(item.count || 0);
      }
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: {
        total: Number(summary?.total || 0),
        averageRating: Number(
          summary?.averageRating || 0
        ),
        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/reviews/book/[bookId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch book reviews.",
      },
      { status: 500 }
    );
  }
}

/*
 * ============================================================
 * POST
 * Submit a review
 * ============================================================
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to submit a review.",
        },
        { status: 401 }
      );
    }

    const { bookId } = await params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid book ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const rating = Number(body.rating);
    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const comment =
      typeof body.comment === "string"
        ? body.comment.trim()
        : "";

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a rating between 1 and 5.",
        },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Please write your review.",
        },
        { status: 400 }
      );
    }

    if (comment.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review must contain at least 3 characters.",
        },
        { status: 400 }
      );
    }

    if (comment.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review cannot be longer than 3000 characters.",
        },
        { status: 400 }
      );
    }

    if (title.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review title cannot be longer than 150 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const book = await Book.findOne({
      _id: bookId,
      published: true,
    })
      .select("_id")
      .lean();

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Book not found.",
        },
        { status: 404 }
      );
    }

    /*
     * One user can submit only one review
     * for the same book.
     */
    const existingReview = await Review.findOne({
      book: bookId,
      user: session.user.id,
    })
      .select("_id status")
      .lean();

    if (existingReview) {
      if (existingReview.status === "rejected") {
        /*
         * Allow a rejected review to be submitted again.
         */
        await Review.deleteOne({
          _id: existingReview._id,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message:
              "You have already submitted a review for this book.",
          },
          { status: 409 }
        );
      }
    }

    const review = await Review.create({
      book: bookId,
      user: session.user.id,
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
          rating: review.rating,
          title: review.title || "",
          comment: review.comment,
          status: review.status,
          verifiedPurchase: review.verifiedPurchase,
          createdAt: review.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    /*
     * MongoDB unique index:
     * { book: 1, user: 1 }
     */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already submitted a review for this book.",
        },
        { status: 409 }
      );
    }

    console.error(
      "POST /api/reviews/book/[bookId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit review.",
      },
      { status: 500 }
    );
  }
}