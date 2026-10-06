import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TeamInvitation from "@/models/TeamInvitation";

function isOwner(user: any) {
  const role = String(user?.role || "").toLowerCase();
  const adminRole = String(user?.adminRole || "").toLowerCase();
  const status = String(user?.status || "").toLowerCase();

  const active =
    user?.active === false
      ? false
      : !["suspended", "removed"].includes(status);

  const explicitOwner =
    role === "owner" ||
    role === "super_admin" ||
    role === "super-admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin" ||
    adminRole === "super-admin";

  if (explicitOwner) {
    return active;
  }

  const ownerEmail =
    process.env.ADMIN_OWNER_EMAIL?.trim().toLowerCase();

  const emailMatches =
    !!ownerEmail &&
    String(user?.email || "")
      .trim()
      .toLowerCase() === ownerEmail;

  const isAdmin =
    role === "admin" ||
    role === "owner" ||
    role === "super_admin" ||
    role === "super-admin" ||
    adminRole === "admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin" ||
    adminRole === "super-admin";

  return emailMatches && isAdmin && active;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized.",
        },
        { status: 401 }
      );
    }

    if (!isOwner(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the owner can delete administrator invitations.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid invitation ID.",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const invitation =
      await TeamInvitation.findById(id);

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          message: "Invitation not found.",
        },
        { status: 404 }
      );
    }

    await TeamInvitation.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message:
          "Invitation deleted successfully from MongoDB.",
        data: {
          invitationId: id,
          email: invitation.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "DELETE /api/admin/roles-permissions/invitations/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete invitation.",
      },
      { status: 500 }
    );
  }
}