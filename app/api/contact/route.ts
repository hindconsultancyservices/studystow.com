import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";

type ContactStatus =
  | "new"
  | "contacted"
  | "in-progress"
  | "completed";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getRequestBody(
  request: NextRequest
): Promise<Record<string, unknown>> {
  const contentType =
    request.headers.get("content-type")?.toLowerCase() || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return {};
    }

    return body as Record<string, unknown>;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();

    return {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      orderNumber: formData.get("orderNumber"),
      message: formData.get("message"),
    };
  }

  return {};
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Admin contact messages
*/
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed on the Store API." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await getRequestBody(request);

    const name = clean(body.name);

    const email = clean(body.email).toLowerCase();

    const phone = clean(body.phone);

    const subject = clean(body.subject);

    const orderNumber = clean(
      body.orderNumber
    );

    const message = clean(body.message);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject is required.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      orderNumber,
      message,
      status: "new",
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Your message has been sent successfully.",

        data: {
          _id: String(contact._id),
          id: String(contact._id),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/contact error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to send your message.",
      },
      { status: 500 }
    );
  }
}