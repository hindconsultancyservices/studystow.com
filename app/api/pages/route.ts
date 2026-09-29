import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Page, {
  type PageStatus,
  type PageType,
} from "@/models/Page";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return null;
  }

  return session;
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status") || "";

    const type =
      searchParams.get("type") || "";

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
      status === "published" ||
      status === "draft"
    ) {
      filter.status = status;
    }

    if (
      [
        "homepage",
        "static",
        "legal",
        "policy",
        "support",
        "custom",
      ].includes(type)
    ) {
      filter.type = type;
    }

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

    const skip = (page - 1) * limit;

    const [
      pages,
      total,
      totalPages,
      published,
      drafts,
    ] = await Promise.all([
      Page.find(filter)
        .populate("author", "name email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Page.countDocuments(filter),

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
        page,
        limit,
        total,
        totalPages: Math.max(
          Math.ceil(total / limit),
          1
        ),
      },

      stats: {
        total: totalPages,
        published,
        drafts,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/pages error:",
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

export async function POST(request: NextRequest) {
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

    if (!/^\/?[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*\/?$/.test(slug)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid slug. Use letters, numbers and hyphens only.",
        },
        { status: 400 }
      );
    }

    const normalizedSlug =
      slug === "/"
        ? "/"
        : `/${slug.replace(/^\/+|\/+$/g, "")}`;

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

    const existingPage =
      await Page.findOne({
        slug: normalizedSlug,
      }).lean();

    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A page with this slug already exists",
        },
        { status: 409 }
      );
    }

    const authorId = session.user?.id;

    const page = await Page.create({
      title,
      slug: normalizedSlug,
      type: type as PageType,
      content,
      status: status as PageStatus,
      seoTitle: seoTitle || undefined,
      seoDescription:
        seoDescription || undefined,
      noIndex,
      author: authorId || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Page created successfully",
        data: page,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/pages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create page",
      },
      { status: 500 }
    );
  }
}