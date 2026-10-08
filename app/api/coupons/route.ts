import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: false, message: "Coupons management is available only through the Admin API." }, { status: 405, headers: { Allow: "POST /api/coupons/apply" } });
}

export async function POST() {
  return NextResponse.json({ success: false, message: "Coupons management is available only through the Admin API." }, { status: 405, headers: { Allow: "POST /api/coupons/apply" } });
}
