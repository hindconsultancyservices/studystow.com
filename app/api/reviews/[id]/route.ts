import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed on the Store API." }, { status: 405, headers: { Allow: "POST on /api/reviews" } });
}

export async function PATCH() {
  return NextResponse.json({ success: false, message: "Method not allowed on the Store API." }, { status: 405, headers: { Allow: "GET on /api/reviews?bookId=..." } });
}
