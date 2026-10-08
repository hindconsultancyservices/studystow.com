import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed on the Store API." }, { status: 405 });
}
export async function PATCH() {
  return NextResponse.json({ success: false, message: "Method not allowed on the Store API." }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ success: false, message: "Method not allowed on the Store API." }, { status: 405 });
}
