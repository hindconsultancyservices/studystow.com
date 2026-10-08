import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Page, {
  type PageStatus,
  type PageType,
} from "@/models/Page";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function validateId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

/* =========================================================
   GET PAGE
   ========================================================= */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("pages", "view");

    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    if (!validateId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page ID",
        },
        { status: 400 }
      );
    }

    const page = await Page.findById(id)
      .populate("author", "name email")
      .lean();

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("GET /api/admin/pages/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch page",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   UPDATE PAGE
   ========================================================= */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("pages", "edit");

    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    if (!validateId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const title = String(body?.title || "").trim();

    const slug = String(body?.slug || "")
      .trim()
      .toLowerCase();

    const content = String(body?.content || "");

    const type = String(body?.type || "custom");

    const status = String(body?.status || "draft");

    const seoTitle = String(body?.seoTitle || "").trim();

    const seoDescription = String(
      body?.seoDescription || ""
    ).trim();

    const noIndex = Boolean(body?.noIndex);

    /* =====================================================
       BASIC VALIDATION
       ===================================================== */

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Page title is required",
        },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Page slug is required",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VALID TYPES
       ===================================================== */

    const validTypes: PageType[] = [
      "homepage",
      "static",
      "legal",
      "policy",
      "support",
      "custom",
    ];

    if (!validTypes.includes(type as PageType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page type",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VALID STATUS
       ===================================================== */

    const validStatuses: PageStatus[] = [
      "published",
      "draft",
    ];

    if (
      !validStatuses.includes(
        status as PageStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page status",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       NORMALIZE SLUG
       ===================================================== */

    const normalizedSlug =
      slug === "/"
        ? "/"
        : `/${slug.replace(/^\/+|\/+$/g, "")}`;

    /* =====================================================
       CHECK DUPLICATE SLUG
       ===================================================== */

    const duplicate = await Page.findOne({
      slug: normalizedSlug,
      _id: {
        $ne: id,
      },
    }).lean();

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another page already uses this slug",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       UPDATE PAGE
       ===================================================== */

    const page = await Page.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          slug: normalizedSlug,
          type: type as PageType,
          content,
          status: status as PageStatus,
          seoTitle: seoTitle || undefined,
          seoDescription:
            seoDescription || undefined,
          noIndex,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("author", "name email")
      .lean();

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Page updated successfully",
      data: page,
    });
  } catch (error: any) {
    console.error(
      "PUT /api/admin/pages/[id] error:",
      error
    );

    /* Duplicate MongoDB unique index */
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another page already uses this slug",
        },
        { status: 409 }
      );
    }

    /* Mongoose validation error */
    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message:
            error?.message ||
            "Page validation failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update page",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE PAGE
   ========================================================= */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("pages", "delete");

    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    if (!validateId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page ID",
        },
        { status: 400 }
      );
    }

    const page =
      await Page.findByIdAndDelete(id);

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/pages/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete page",
      },
      { status: 500 }
    );
  }
}