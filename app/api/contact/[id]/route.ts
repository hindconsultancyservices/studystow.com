import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";

const ALLOWED_STATUS = [
  "new",
  "contacted",
  "in-progress",
  "completed",
] as const;

type ContactStatus = (typeof ALLOWED_STATUS)[number];

function isValidStatus(value: unknown): value is ContactStatus {
  return (
    typeof value === "string" &&
    ALLOWED_STATUS.includes(value as ContactStatus)
  );
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermission("contact", "view");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    const contact = await Contact.findById(id).lean();

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact enquiry not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch contact enquiry.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermission("contact", "edit");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;
    const body = await request.json();

    if (!isValidStatus(body?.status)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Allowed values: new, contacted, in-progress, completed.",
        },
        { status: 400 }
      );
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        $set: {
          status: body.status,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact enquiry not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact status updated successfully.",
      data: contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update contact enquiry.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermission("contact", "delete");
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;

    const contact = await Contact.findByIdAndDelete(id).lean();

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact enquiry not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact enquiry deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete contact enquiry.",
      },
      { status: 500 }
    );
  }
}