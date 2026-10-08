import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Page, {
  type PageStatus,
  type PageType,
} from "@/models/Page";

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

function normalizeSlug(slug: string) {
  const value = slug.trim().toLowerCase();

  if (value === "/") {
    return "/";
  }

  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

/* =========================================================
   GET ALL PAGES
   ========================================================= */

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("pages", "view");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { searchParams } = new URL(request.url);

    const pageNumber = Math.max(
      1,
      Number(searchParams.get("page") || 1)
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(searchParams.get("limit") || 10)
      )
    );

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status")?.trim() || "";

    const type =
      searchParams.get("type")?.trim() || "";

    const filter: Record<string, any> = {};

    /* Search */

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: search,
            $options: "i",
          },
        },
        {
          seoTitle: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /* Status */

    if (
      status &&
      status !== "all" &&
      validStatuses.includes(status as PageStatus)
    ) {
      filter.status = status;
    }

    /* Type */

    if (
      type &&
      type !== "all" &&
      validTypes.includes(type as PageType)
    ) {
      filter.type = type;
    }

    /* =====================================================
       TOTAL
       ===================================================== */

    const total = await Page.countDocuments(filter);

    const totalPages =
      total === 0
        ? 1
        : Math.ceil(total / limit);

    const safePage = Math.min(
      pageNumber,
      totalPages
    );

    /* =====================================================
       FETCH PAGES
       ===================================================== */

    const pages = await Page.find(filter)
      .populate("author", "name email")
      .sort({ updatedAt: -1 })
      .skip((safePage - 1) * limit)
      .limit(limit)
      .lean();

    /* =====================================================
       STATS
       ===================================================== */

    const [
      totalStats,
      published,
      drafts,
    ] = await Promise.all([
      Page.countDocuments(),
      Page.countDocuments({
        status: "published",
      }),
      Page.countDocuments({
        status: "draft",
      }),
    ]);

    return NextResponse.json({
      success: true,

      data: pages,

      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },

      stats: {
        total: totalStats,
        published,
        drafts,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/pages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pages",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   CREATE NEW PAGE
   ========================================================= */

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("pages", "create");
    if (!auth.ok) return auth.response;

    await connectDB();

    const body = await request.json();

    const title = String(
      body?.title || ""
    ).trim();

    const slug = String(
      body?.slug || ""
    )
      .trim()
      .toLowerCase();

    const content = String(
      body?.content || ""
    );

    const type = String(
      body?.type || "custom"
    );

    const status = String(
      body?.status || "draft"
    );

    const seoTitle = String(
      body?.seoTitle || ""
    ).trim();

    const seoDescription = String(
      body?.seoDescription || ""
    ).trim();

    const noIndex = Boolean(
      body?.noIndex
    );

    /* =====================================================
       VALIDATION
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

    if (
      !validTypes.includes(
        type as PageType
      )
    ) {
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
      normalizeSlug(slug);

    /* =====================================================
       DUPLICATE SLUG
       ===================================================== */

    const existingPage =
      await Page.findOne({
        slug: normalizedSlug,
      }).lean();

    if (existingPage) {
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
       AUTHOR
       ===================================================== */

    const authorId = auth.context.actor.id;

    /* =====================================================
       CREATE
       ===================================================== */

    const page = await Page.create({
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

      ...(authorId
        ? {
            author: authorId,
          }
        : {}),
    });

    const populatedPage =
      await Page.findById(
        page._id
      )
        .populate(
          "author",
          "name email"
        )
        .lean();

    return NextResponse.json(
      {
        success: true,
        message:
          "Page created successfully",
        data: populatedPage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "POST /api/admin/pages error:",
      error
    );

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

    if (
      error?.name ===
      "ValidationError"
    ) {
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
        message:
          "Failed to create page",
      },
      { status: 500 }
    );
  }
}