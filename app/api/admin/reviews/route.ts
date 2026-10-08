import { requireAdminPermission } from "@/lib/admin-authorization";
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

/*
 * GET
 *
 * Customer:
 *   /api/admin/reviews?bookId=BOOK_ID
 *
 * Only approved reviews are returned.
 *
 * Admin:
 *   Existing admin filtering/listing is preserved.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);

    const bookId = searchParams.get("bookId")?.trim() || "";

    /*
     * CUSTOMER / PRODUCT PAGE
     */
    if (bookId) {
      if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid book ID.",
          },
          { status: 400 }
        );
      }

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
          $group: {
            _id: null,
            total: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]);

      const stats = statsResult[0] || {
        total: 0,
        averageRating: 0,
      };

      const ratingResult = await Review.aggregate([
        {
          $match: {
            book: new mongoose.Types.ObjectId(bookId),
            status: "approved",
          },
        },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
      ]);

      const ratingBreakdown = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      for (const item of ratingResult) {
        if (
          Number.isInteger(item._id) &&
          item._id >= 1 &&
          item._id <= 5
        ) {
          ratingBreakdown[
            item._id as 1 | 2 | 3 | 4 | 5
          ] = item.count;
        }
      }

      return NextResponse.json({
        success: true,
        data: reviews,
        stats: {
          total: stats.total || 0,
          averageRating: Number(
            stats.averageRating || 0
          ),
          ratingBreakdown,
        },
      });
    }

    /*
     * ADMIN REVIEW LIST
     */
    const auth = await requireAdminPermission("reviews", "view");
    if (!auth.ok) return auth.response;

    const search =
      searchParams.get("search")?.trim() || "";

    const status = searchParams.get("status") || "";

    const ratingParam =
      searchParams.get("rating") || "";

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit")) || 10,
        1
      ),
      50
    );

    const filter: Record<string, unknown> = {};

    if (
      status === "pending" ||
      status === "approved" ||
      status === "rejected"
    ) {
      filter.status = status;
    }

    if (ratingParam) {
      const rating = Number(ratingParam);

      if (
        Number.isInteger(rating) &&
        rating >= 1 &&
        rating <= 5
      ) {
        filter.rating = rating;
      }
    }

    /*
     * Admin search
     */
    if (search) {
      const matchingReviews = await Review.find()
        .populate("book", "title slug")
        .populate("user", "name email")
        .lean();

      const searchLower = search.toLowerCase();

      const matchingIds = matchingReviews
        .filter((review: any) => {
          const bookTitle =
            review.book?.title || "";

          const userName =
            review.user?.name || "";

          const userEmail =
            review.user?.email || "";

          const reviewTitle =
            review.title || "";

          const comment =
            review.comment || "";

          return [
            bookTitle,
            userName,
            userEmail,
            reviewTitle,
            comment,
          ].some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchLower)
          );
        })
        .map((review: any) => review._id);

      filter._id = {
        $in: matchingIds,
      };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] =
      await Promise.all([
        Review.find(filter)
          .populate(
            "book",
            "title slug image"
          )
          .populate(
            "user",
            "name email"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Review.countDocuments(filter),
      ]);

    const allStats =
      await Review.aggregate([
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: 1,
                  },
                  averageRating: {
                    $avg: "$rating",
                  },
                },
              },
            ],

            status: [
              {
                $group: {
                  _id: "$status",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],

            ratings: [
              {
                $group: {
                  _id: "$rating",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
          },
        },
      ]);

    const aggregateResult =
      allStats[0] || {};

    const summary =
      aggregateResult.summary?.[0];

    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    for (
      const item of
        aggregateResult.status || []
    ) {
      if (
        item._id in statusStats
      ) {
        statusStats[
          item._id as keyof typeof statusStats
        ] = item.count;
      }
    }

    const ratingBreakdown = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (
      const item of
        aggregateResult.ratings || []
    ) {
      if (
        item._id >= 1 &&
        item._id <= 5
      ) {
        ratingBreakdown[
          item._id as 1 | 2 | 3 | 4 | 5
        ] = item.count;
      }
    }

    return NextResponse.json({
      success: true,

      data: reviews,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(
          Math.ceil(total / limit),
          1
        ),
      },

      stats: {
        total:
          summary?.total || 0,

        pending:
          statusStats.pending,

        approved:
          statusStats.approved,

        rejected:
          statusStats.rejected,

        averageRating:
          Number(
            summary?.averageRating || 0
          ),

        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/reviews error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch reviews.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST
 *
 * Logged-in customer creates a review.
 */
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
      "POST /api/admin/reviews error:",
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