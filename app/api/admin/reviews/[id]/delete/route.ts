
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireAdminPermission } from "@/lib/admin-authorization";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

/**
 * POST /api/admin/reviews/[id]/delete
 *
 * Permanently deletes one review.
 */
export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  let reviewId = "";

  try {
    const { id } = await context.params;
    reviewId = String(id || "").trim();

    console.log("[REVIEW DELETE] Handler reached:", reviewId);

    if (
      !reviewId ||
      !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
      return errorResponse("Invalid review ID.", 400);
    }

    const auth = await requireAdminPermission(
      "reviews",
      "delete"
    );

    if (!auth.ok) {
      return auth.response;
    }

    await connectDB();

    console.log("[REVIEW DELETE] Database:", {
      database: mongoose.connection.name,
      collection: Review.collection.name,
      id: reviewId,
    });

    const deletedReview = await Review.findByIdAndDelete(
      new mongoose.Types.ObjectId(reviewId)
    )
      .select("_id")
      .lean();

    if (!deletedReview) {
      console.error(
        "[REVIEW DELETE] Review not found in connected database:",
        {
          id: reviewId,
          database: mongoose.connection.name,
          collection: Review.collection.name,
        }
      );

      return errorResponse(
        "Review not found in the connected database. Refresh the reviews list and try again.",
        404
      );
    }

    console.log(
      "[REVIEW DELETE] Successfully deleted:",
      String(deletedReview._id)
    );

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully.",
      data: {
        id: String(deletedReview._id),
      },
    });
  } catch (error) {
    console.error("[REVIEW DELETE] Error:", {
      id: reviewId,
      error,
    });

    return errorResponse(
      "Failed to delete review. Check the server logs.",
      500
    );
  }
}
