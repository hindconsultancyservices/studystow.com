import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

function isAdmin(session: Awaited<ReturnType<typeof getServerSession<typeof authOptions>>>) {
  return session?.user?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const ratingParam = searchParams.get("rating") || "";

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
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

      if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
        filter.rating = rating;
      }
    }

    if (search) {
      const matchingReviews = await Review.find()
        .populate("book", "title slug")
        .populate("user", "name email")
        .lean();

      const searchLower = search.toLowerCase();

      const matchingIds = matchingReviews
        .filter((review: any) => {
          const bookTitle = review.book?.title || "";
          const userName = review.user?.name || "";
          const userEmail = review.user?.email || "";
          const reviewTitle = review.title || "";
          const comment = review.comment || "";

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

      filter._id = { $in: matchingIds };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("book", "title slug image")
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Review.countDocuments(filter),
    ]);

    const allStats = await Review.aggregate([
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

          status: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
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

    const aggregateResult = allStats[0] || {};

    const summary = aggregateResult.summary?.[0];

    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    for (const item of aggregateResult.status || []) {
      if (item._id in statusStats) {
        statusStats[item._id as keyof typeof statusStats] =
          item.count;
      }
    }

    const ratingBreakdown = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const item of aggregateResult.ratings || []) {
      if (item._id >= 1 && item._id <= 5) {
        ratingBreakdown[
          item._id as 1 | 2 | 3 | 4 | 5
        ] = item.count;
      }
    }

    const totalAllReviews = summary?.total || 0;

    return NextResponse.json({
      success: true,

      data: reviews,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },

      stats: {
        total: totalAllReviews,
        pending: statusStats.pending,
        approved: statusStats.approved,
        rejected: statusStats.rejected,
        averageRating: Number(
          summary?.averageRating || 0
        ),
        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}