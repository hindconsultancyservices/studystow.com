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

/* Public Store API: published page only. */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();
    const { id } = await context.params;
    if (!validateId(id)) {
      return NextResponse.json({ success: false, message: "Invalid page ID" }, { status: 400 });
    }
    const page = await Page.findOne({ _id: id, status: "published" }).lean();
    if (!page) return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("GET /api/pages/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({ success: false, message: "Method not allowed on the Store API." }, { status: 405, headers: { Allow: "GET" } });
}
export async function DELETE() {
  return NextResponse.json({ success: false, message: "Method not allowed on the Store API." }, { status: 405, headers: { Allow: "GET" } });
}
