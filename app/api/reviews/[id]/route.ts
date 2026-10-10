
import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Review from "@/models/Review";
import "@/models/Book";
import "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

async function getReviewId(context: RouteContext) {
  const { id } = await context.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return id;
}

/**
 * GET /api/admin/reviews/[id]
 * Fetch one review.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("reviews", "view");
    if (!auth.ok) return auth.response;

    const id = await getReviewId(context);
    if (!id) return errorResponse("Invalid review ID.", 400);

    await connectDB();

    const review = await Review.findById(id)
      .populate("book", "title slug image")
      .populate("user", "name email")
      .lean();

    if (!review) {
      return errorResponse("Review not found.", 404);
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("GET /api/admin/reviews/[id] error:", error);
    return errorResponse("Failed to fetch review.", 500);
  }
}

/**
 * PATCH /api/admin/reviews/[id]
 * Approve, reject, or reset a review to pending.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("reviews", "edit");
    if (!auth.ok) return auth.response;

    const id = await getReviewId(context);
    if (!id) return errorResponse("Invalid review ID.", 400);

    const body = await request.json().catch(() => null);
    const status = body?.status;

    if (
      status !== "pending" &&
      status !== "approved" &&
      status !== "rejected"
    ) {
      return errorResponse(
        "Invalid status. Use pending, approved or rejected.",
        400
      );
    }

    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return errorResponse("Review not found.", 404);
    }

    review.status = status;
    await review.save();

    const updatedReview = await Review.findById(id)
      .populate("book", "title slug image")
      .populate("user", "name email")
      .lean();

    return NextResponse.json({
      success: true,
      message:
        status === "approved"
          ? "Review approved successfully."
          : status === "rejected"
            ? "Review rejected successfully."
            : "Review moved to pending.",
      data: updatedReview,
    });
  } catch (error) {
    console.error("PATCH /api/admin/reviews/[id] error:", error);
    return errorResponse("Failed to update review.", 500);
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Permanently delete one review.
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("reviews", "delete");
    if (!auth.ok) return auth.response;

    const id = await getReviewId(context);
    if (!id) return errorResponse("Invalid review ID.", 400);

    await connectDB();

    const deletedReview = await Review.findByIdAndDelete(id)
      .select("_id")
      .lean();

    if (!deletedReview) {
      return errorResponse("Review not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully.",
      data: {
        id: String(deletedReview._id),
      },
    });
  } catch (error) {
    console.error("DELETE /api/admin/reviews/[id] error:", error);
    return errorResponse("Failed to delete review.", 500);
  }
}