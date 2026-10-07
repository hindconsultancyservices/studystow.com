import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

const Invitation = (() => {
  const candidates = [
    "@/models/Invitation",
    "@/models/InvitationModel",
    "@/models/Invite",
    "@/models/InvitationToken",
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  return null;
})();

const Role = (() => {
  const candidates = [
    "@/models/Role",
    "@/models/RolePermission",
    "@/models/RoleModel",
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  return null;
})();

export const dynamic = "force-dynamic";

const INVITATION_EXPIRY_HOURS = 48;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isOwner(user: any) {
  return (
    user?.role === "owner" ||
    user?.adminRole === "owner" ||
    user?.adminRole === "super_admin"
  );
}

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("adminUsers", "invite");
    if (!auth.ok) return auth.response;

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    /**
     * Find the pending invitation.
     *
     * The id is treated as the invitation ID first.
     */
    let invitation = await Invitation.findById(id);

    /**
     * If the frontend sends a user ID instead,
     * find the latest pending invitation for that user.
     */
    if (!invitation) {
      const user = await User.findById(id)
        .select("_id email")
        .lean();

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invitation or admin user not found.",
          },
          { status: 404 }
        );
      }

      invitation = await Invitation.findOne({
        email: user.email,
        status: "pending",
      }).sort({
        createdAt: -1,
      });
    }

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No pending invitation was found.",
        },
        { status: 404 }
      );
    }

    /**
     * Invitation must not already be accepted.
     */
    if (invitation.status === "accepted") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This invitation has already been accepted.",
        },
        { status: 400 }
      );
    }

    /**
     * Do not allow invitations for an existing account.
     */
    const existingUser = await User.findOne({
      email: invitation.email,
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account already exists with this email address.",
        },
        { status: 409 }
      );
    }

    /**
     * Get the role so the invitation keeps
     * the current role permissions.
     */
    let role = null;

    if (
      (invitation as any).role ||
      (invitation as any).roleId
    ) {
      role = await Role.findById(
        (invitation as any).role ||
          (invitation as any).roleId
      ).lean();
    }

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The role assigned to this invitation no longer exists.",
        },
        { status: 400 }
      );
    }

    const roleSlug = String(
      (role as any).slug || ""
    ).toLowerCase();

    /**
     * Never resend an invitation that would create
     * an owner/super-admin account.
     */
    if (
      roleSlug === "owner" ||
      roleSlug === "super-admin" ||
      roleSlug === "super_admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner/Super Admin invitations cannot be sent.",
        },
        { status: 403 }
      );
    }

    /**
     * Invalidate the old token by replacing it
     * with a completely new cryptographic token.
     */
    const rawToken = crypto
      .randomBytes(48)
      .toString("hex");

    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() +
        INVITATION_EXPIRY_HOURS *
          60 *
          60 *
          1000
    );

    invitation.tokenHash = tokenHash;
    invitation.expiresAt = expiresAt;
    invitation.status = "pending";

    /**
     * Refresh permission snapshot from the role.
     */
    (invitation as any).permissions =
      (role as any).permissions || {};

    (invitation as any).role = role._id;
    (invitation as any).roleId = role._id;

    await invitation.save();

    const appUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Application URL is not configured.",
        },
        { status: 500 }
      );
    }

    const inviteUrl =
      `${appUrl.replace(/\/$/, "")}` +
      `/accept-invite?token=${encodeURIComponent(
        rawToken
      )}`;

    /**
     * IMPORTANT:
     *
     * Raw token is NEVER stored in MongoDB.
     * Only its SHA-256 hash is stored.
     *
     * Email sending should use the existing
     * lib/email.ts implementation once its
     * actual API is confirmed.
     */
    return NextResponse.json({
      success: true,
      message:
        "Invitation regenerated successfully.",
      data: {
        id: String(invitation._id),
        email: invitation.email,
        name:
          (invitation as any).name || "",
        role: {
          id: String(role._id),
          name:
            (role as any).name || "",
          slug:
            (role as any).slug || "",
        },
        expiresAt:
          expiresAt.toISOString(),
        inviteUrl,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/admin/roles-permissions/[id]/resend-invite error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to resend invitation.",
      },
      { status: 500 }
    );
  }
}