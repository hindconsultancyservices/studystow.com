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

/* Public Store API: published pages only. */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";
    const pageNumber = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
    const filter: Record<string, any> = { status: "published" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { seoTitle: { $regex: search, $options: "i" } },
      ];
    }
    if (type && validTypes.includes(type as PageType)) filter.type = type;

    const total = await Page.countDocuments(filter);
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
    const safePage = Math.min(pageNumber, totalPages);
    const pages = await Page.find(filter)
      .sort({ updatedAt: -1 })
      .skip((safePage - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: pages,
      pagination: { page: safePage, limit, total, totalPages },
    });
  } catch (error) {
    console.error("GET /api/pages error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ success: false, message: "Method not allowed on the Store API." }, { status: 405, headers: { Allow: "GET" } });
}
