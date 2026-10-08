import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isAdmin(
  session: Awaited<
    ReturnType<typeof getServerSession<typeof authOptions>>
  >
) {
  return session?.user?.role === "admin";
}

/**
 * PATCH /api/admin/reviews/[id]
 *
 * Admin:
 * - approve review
 * - reject review
 * - move review back to pending
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("reviews", "edit");
    if (!auth.ok) return auth.response;

    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid review ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json().catch(() => null);

    const status = body?.status;

    if (
      status !== "pending" &&
      status !== "approved" &&
      status !== "rejected"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Use pending, approved or rejected.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    review.status = status;

    await review.save();

    const updatedReview = await Review.findById(id)
      .populate("book", "title slug image")
      .populate("user", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message:
          status === "approved"
            ? "Review approved successfully."
            : status === "rejected"
            ? "Review rejected successfully."
            : "Review moved to pending.",
        data: updatedReview,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH /api/admin/reviews/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update review.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * GET /api/admin/reviews/[id]
 *
 * Admin only.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("reviews", "view");
    if (!auth.ok) return auth.response;

    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid review ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const review = await Review.findById(id)
      .populate("book", "title slug image")
      .populate("user", "name email")
      .lean();

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: review,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin/reviews/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch review.",
      },
      {
        status: 500,
      }
    );
  }
}