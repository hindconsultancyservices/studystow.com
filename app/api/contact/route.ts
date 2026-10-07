import { requireAdminPermission } from "@/lib/admin-authorization";
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
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("contact", "view");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 100), 1),
      100
    );

    const filter: Record<string, unknown> = {};

    if (
      status === "new" ||
      status === "contacted" ||
      status === "in-progress" ||
      status === "completed"
    ) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: search,
            $options: "i",
          },
        },
        {
          orderNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          message: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [
      contacts,
      total,
      newMessages,
      contactedMessages,
      inProgressMessages,
      completedMessages,
    ] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Contact.countDocuments(filter),

      Contact.countDocuments({
        status: "new",
      }),

      Contact.countDocuments({
        status: "contacted",
      }),

      Contact.countDocuments({
        status: "in-progress",
      }),

      Contact.countDocuments({
        status: "completed",
      }),
    ]);

    const data = contacts.map((contact) => ({
      _id: String(contact._id),

      name: contact.name || "",

      email: contact.email || "",

      phone: contact.phone || "",

      subject: contact.subject || "",

      orderNumber: contact.orderNumber || "",

      message: contact.message || "",

      status: contact.status as ContactStatus,

      createdAt: contact.createdAt,

      updatedAt: contact.updatedAt,
    }));

    return NextResponse.json({
      success: true,

      data,

      stats: {
        total: total,
        new: newMessages,
        contacted: contactedMessages,
        inProgress: inProgressMessages,
        completed: completedMessages,
      },

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage:
          page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/contact error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load contact messages.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Public StudyStow contact form
*/
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