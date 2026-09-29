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

async function requireAdmin() {
  const session =
    await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return null;
  }

  return session;
}

function validateId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

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
    console.error(
      "GET /api/pages/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch page",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

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

    const title =
      String(body?.title || "").trim();

    const slug =
      String(body?.slug || "")
        .trim()
        .toLowerCase();

    const content =
      String(body?.content || "");

    const type =
      String(body?.type || "custom");

    const status =
      String(body?.status || "draft");

    const seoTitle =
      String(body?.seoTitle || "").trim();

    const seoDescription =
      String(body?.seoDescription || "").trim();

    const noIndex =
      Boolean(body?.noIndex);

    if (!title || !slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title and slug are required",
        },
        { status: 400 }
      );
    }

    const validTypes: PageType[] = [
      "homepage",
      "static",
      "legal",
      "policy",
      "support",
      "custom",
    ];

    const validStatuses: PageStatus[] = [
      "published",
      "draft",
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

    const normalizedSlug =
      slug === "/"
        ? "/"
        : `/${slug.replace(/^\/+|\/+$/g, "")}`;

    const duplicate =
      await Page.findOne({
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

    const page =
      await Page.findByIdAndUpdate(
        id,
        {
          $set: {
            title,
            slug: normalizedSlug,
            type: type as PageType,
            content,
            status: status as PageStatus,
            seoTitle:
              seoTitle || undefined,
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
  } catch (error) {
    console.error(
      "PUT /api/pages/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update page",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

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
      "DELETE /api/pages/[id] error:",
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