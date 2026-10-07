import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import TeamInvitation from "@/models/TeamInvitation";

export const dynamic = "force-dynamic";

// ============================================================
// OWNER CHECK
// ============================================================

function isOwner(user: any) {
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const adminRole = String(user?.adminRole || "")
    .trim()
    .toLowerCase();

  const status = String(user?.status || "")
    .trim()
    .toLowerCase();

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

  const ownerEmail = process.env.ADMIN_OWNER_EMAIL
    ?.trim()
    .toLowerCase();

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

// ============================================================
// NORMALIZE ROLE PERMISSIONS
// ============================================================

function normalizePermissions(value: any) {
  if (!value || typeof value !== "object") {
    return {};
  }

  const result: Record<string, string[]> = {};

  for (const [moduleKey, actions] of Object.entries(value)) {
    if (Array.isArray(actions)) {
      result[moduleKey] = actions.filter(
        (action): action is string => typeof action === "string",
      );
    }
  }

  return result;
}

// ============================================================
// PROTECTED ROLES
// ============================================================

function isProtectedRole(role: any) {
  const slug = String(role?.slug || "")
    .trim()
    .toLowerCase();

  const name = String(role?.name || "")
    .trim()
    .toLowerCase();

  const protectedSlugs = [
    "owner",
    "super_admin",
    "super-admin",
    "super admin",
  ];

  const protectedNames = [
    "owner",
    "super admin",
    "super_admin",
  ];

  return (
    protectedSlugs.includes(slug) ||
    protectedNames.includes(name)
  );
}

// ============================================================
// CREATE INVITATION TOKEN
// ============================================================

function createInvitationToken() {
  const rawToken = crypto
    .randomBytes(32)
    .toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() +
      1000 * 60 * 60 * 24 * 7,
  );

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

// ============================================================
// BUILD INVITATION URL
// ============================================================

function buildInviteUrl(rawToken: string) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL or NEXTAUTH_URL is missing.",
    );
  }

  const normalizedAppUrl = appUrl.replace(/\/+$/, "");

  return (
    `${normalizedAppUrl}/accept-invites?token=${encodeURIComponent(
      rawToken,
    )}`
  );
}

// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// RESEND SENDER
// ============================================================

function getResendFrom() {
  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "StudyStow <no-reply@studystow.com>";

  if (from.toLowerCase().includes("@resend.dev")) {
    throw new Error(
      "RESEND_FROM is using Resend's testing sender. Use a verified StudyStow sender such as StudyStow <no-reply@studystow.com>.",
    );
  }

  return from;
}

// ============================================================
// SEND ADMIN INVITATION THROUGH RESEND
// ============================================================

async function sendAdminInvitationEmailViaResend({
  name,
  email,
  roleName,
  inviteUrl,
  expiresAt,
}: {
  name: string;
  email: string;
  roleName: string;
  inviteUrl: string;
  expiresAt: Date;
}) {
  const resendApiKey =
    process.env.RESEND_API_KEY?.trim();

  if (!resendApiKey) {
    throw new Error(
      "RESEND_API_KEY is missing. Please configure the Resend API key.",
    );
  }

  const from = getResendFrom();

  const formattedExpiry =
    new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(expiresAt);

  const safeName = escapeHtml(name);
  const safeRoleName = escapeHtml(roleName);
  const safeInviteUrl = escapeHtml(inviteUrl);
  const safeFormattedExpiry =
    escapeHtml(formattedExpiry);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>StudyStow Admin Invitation</title>
</head>
<body
  style="
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div
    style="
      max-width:620px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #e5e7eb;
      border-radius:14px;
      overflow:hidden;
    "
  >
    <div
      style="
        padding:26px;
        background:#111827;
        color:#ffffff;
      "
    >
      <h1 style="margin:0;font-size:24px;">
        StudyStow
      </h1>

      <p
        style="
          margin:8px 0 0;
          color:#d1d5db;
          font-size:14px;
        "
      >
        Administrator Invitation
      </p>
    </div>

    <div style="padding:30px;">
      <h2
        style="
          margin:0;
          color:#111827;
          font-size:22px;
        "
      >
        You have been invited
      </h2>

      <p
        style="
          margin:20px 0 0;
          color:#374151;
          line-height:1.7;
        "
      >
        Hello ${safeName},
      </p>

      <p
        style="
          margin:12px 0 0;
          color:#374151;
          line-height:1.7;
        "
      >
        You have been invited to access the
        StudyStow Admin Panel.
      </p>

      <div
        style="
          margin:24px 0;
          padding:18px;
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:10px;
        "
      >
        <p
          style="
            margin:0;
            color:#6b7280;
            font-size:12px;
            text-transform:uppercase;
          "
        >
          Assigned Role
        </p>

        <p
          style="
            margin:6px 0 0;
            color:#111827;
            font-size:17px;
            font-weight:700;
          "
        >
          ${safeRoleName}
        </p>
      </div>

      <div style="margin:30px 0;">
        <a
          href="${safeInviteUrl}"
          style="
            display:inline-block;
            padding:13px 22px;
            background:#111827;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-size:14px;
            font-weight:700;
          "
        >
          Accept Invitation
        </a>
      </div>

      <p
        style="
          margin:0;
          color:#6b7280;
          font-size:13px;
          line-height:1.7;
        "
      >
        This invitation expires on
        <strong>${safeFormattedExpiry}</strong>.
      </p>

      <p
        style="
          margin-top:24px;
          color:#9ca3af;
          font-size:12px;
          line-height:1.7;
        "
      >
        If you were not expecting this invitation,
        you can safely ignore this email.
      </p>
    </div>

    <div
      style="
        padding:18px 30px;
        border-top:1px solid #e5e7eb;
        color:#6b7280;
        font-size:12px;
      "
    >
      StudyStow Team
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hello ${name},

You have been invited to access the StudyStow Admin Panel.

Assigned Role: ${roleName}

Accept your invitation:

${inviteUrl}

This invitation expires on:

${formattedExpiry}

If you were not expecting this invitation, you can safely ignore this email.

StudyStow Team
  `.trim();

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject:
          "You have been invited to the StudyStow Admin Panel",
        html,
        text,
      }),
    },
  );

  const responseData = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    console.error(
      "Resend invitation error:",
      responseData,
    );

    const resendMessage =
      responseData?.message ||
      responseData?.error ||
      "Resend rejected the email.";

    throw new Error(
      `Resend email failed: ${resendMessage}`,
    );
  }

  return responseData;
}

// ============================================================
// POST
// ============================================================

export async function POST(
  request: NextRequest,
) {
  try {
    // --------------------------------------------------------
    // SESSION
    // --------------------------------------------------------

    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized.",
        },
        {
          status: 401,
        },
      );
    }

    // --------------------------------------------------------
    // OWNER ONLY
    // --------------------------------------------------------

    if (!isOwner(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to invite administrators.",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------------

    const body =
      await request.json().catch(() => null);

    const name = String(
      body?.name || "",
    ).trim();

    const email = String(
      body?.email || "",
    )
      .trim()
      .toLowerCase();

    const roleId = String(
      body?.roleId || "",
    ).trim();

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (!name || !email || !roleId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, email and role are required.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------------

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------------
    // DATABASE
    // --------------------------------------------------------

    await dbConnect();

    // --------------------------------------------------------
    // FIND SELECTED ROLE
    // --------------------------------------------------------

    const role =
      await Role.findById(roleId).lean();

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected role was not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------------------------
    // PROTECT OWNER / SUPER ADMIN ROLE
    // --------------------------------------------------------

    if (isProtectedRole(role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner and Super Admin roles cannot be assigned through invitations.",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------------------------------
    // CHECK EXISTING USER
    // --------------------------------------------------------

    const existingUser =
      await User.findOne({ email });

    // ========================================================
    // EXISTING USER
    // ========================================================

    if (existingUser) {
      const currentRole = String(
        (existingUser as any).role || "",
      )
        .trim()
        .toLowerCase();

      const currentAdminRole = String(
        (existingUser as any).adminRole || "",
      )
        .trim()
        .toLowerCase();

      // ------------------------------------------------------
      // PROTECTED ACCOUNT CHECK
      // ------------------------------------------------------

      if (
        currentRole === "owner" ||
        currentRole === "super_admin" ||
        currentRole === "super-admin" ||
        currentAdminRole === "owner" ||
        currentAdminRole === "super_admin" ||
        currentAdminRole === "super-admin"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This account already has protected administrator access.",
          },
          {
            status: 409,
          },
        );
      }

      // ------------------------------------------------------
      // GET ROLE PERMISSIONS
      // ------------------------------------------------------

      const permissions =
        normalizePermissions(
          (role as any).permissions,
        );

      // ------------------------------------------------------
      // PROMOTE EXISTING USER TO ADMIN
      // ------------------------------------------------------

      (existingUser as any).name =
        name || (existingUser as any).name;

      (existingUser as any).role = "admin";

      (existingUser as any).adminRole =
        String(
          (role as any).slug || "custom",
        );

      // Keep the custom role relation when the User model supports it.
      (existingUser as any).roleId =
        (role as any)._id;

      (existingUser as any).permissions =
        permissions;

      (existingUser as any).status = "active";
      (existingUser as any).active = true;

      (existingUser as any).invitedBy =
        (session.user as any).id || null;

      (existingUser as any).invitationExpires = null;

      await existingUser.save();

      // ------------------------------------------------------
      // CLEAN OLD INVITATIONS
      // ------------------------------------------------------

      await (TeamInvitation as any).updateMany(
        {
          email,
          status: {
            $in: ["pending", "sent"],
          },
        },
        {
          $set: {
            status: "accepted",
            acceptedAt: new Date(),
          },
        },
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Existing customer account has been granted administrator access.",
          data: {
            type: "existing-user-promoted",
            userId: String(existingUser._id),
            email: existingUser.email,
            role: "admin",
            adminRole:
              (existingUser as any).adminRole,
            roleId: String(
              (existingUser as any).roleId ||
                (role as any)._id,
            ),
          },
        },
        {
          status: 200,
        },
      );
    }

    // ========================================================
    // CHECK ACTIVE EXISTING INVITATION
    // ========================================================

    const now = new Date();

    const existingInvitation =
      await (TeamInvitation as any).findOne({
        email,
        status: {
          $in: ["pending", "sent"],
        },
        $or: [
          {
            expiresAt: {
              $exists: false,
            },
          },
          {
            expiresAt: {
              $gt: now,
            },
          },
        ],
      });

    // ========================================================
    // EXISTING INVITATION -> REFRESH / RESEND
    // ========================================================

    if (existingInvitation) {
      const {
        rawToken,
        tokenHash,
        expiresAt,
      } = createInvitationToken();

      // ------------------------------------------------------
      // UPDATE EXISTING INVITATION
      // ------------------------------------------------------

      existingInvitation.name = name;
      existingInvitation.email = email;
      existingInvitation.roleId = role._id;
      existingInvitation.role = role._id;
      existingInvitation.invitedBy =
        (session.user as any).id;

      existingInvitation.tokenHash = tokenHash;
      existingInvitation.expiresAt = expiresAt;
      existingInvitation.status = "pending";

      if ("acceptedAt" in existingInvitation) {
        existingInvitation.acceptedAt = null;
      }

      if ("passwordSetAt" in existingInvitation) {
        existingInvitation.passwordSetAt = null;
      }

      await existingInvitation.save();

      // ------------------------------------------------------
      // BUILD NEW URL
      // ------------------------------------------------------

      const inviteUrl =
        buildInviteUrl(rawToken);

      // ------------------------------------------------------
      // SEND THROUGH RESEND
      // ------------------------------------------------------

      await sendAdminInvitationEmailViaResend({
        name,
        email,
        roleName: String(
          (role as any).name ||
            "Administrator",
        ),
        inviteUrl,
        expiresAt,
      });

      // ------------------------------------------------------
      // MARK AS SENT ONLY AFTER RESEND SUCCESS
      // ------------------------------------------------------

      existingInvitation.status = "sent";
      await existingInvitation.save();

      return NextResponse.json(
        {
          success: true,
          message:
            "Administrator invitation has been resent successfully.",
          data: {
            type: "invitation-resent",
            invitationId:
              String(existingInvitation._id),
            email,
            roleId: String(role._id),
            expiresAt,
            status: "sent",
          },
        },
        {
          status: 200,
        },
      );
    }

    // ========================================================
    // CREATE NEW INVITATION
    // ========================================================

    const {
      rawToken,
      tokenHash,
      expiresAt,
    } = createInvitationToken();

    // --------------------------------------------------------
    // CREATE TEAM INVITATION
    // --------------------------------------------------------

    const invitation =
      await (TeamInvitation as any).create({
        name,
        email,
        roleId: role._id,
        role: role._id,
        invitedBy:
          (session.user as any).id,
        tokenHash,
        expiresAt,
        status: "pending",
        acceptedAt: null,
        passwordSetAt: null,
      });

    // --------------------------------------------------------
    // BUILD INVITATION URL
    // --------------------------------------------------------

    const inviteUrl =
      buildInviteUrl(rawToken);

    // --------------------------------------------------------
    // SEND THROUGH RESEND
    // --------------------------------------------------------

    try {
      await sendAdminInvitationEmailViaResend({
        name,
        email,
        roleName: String(
          (role as any).name ||
            "Administrator",
        ),
        inviteUrl,
        expiresAt,
      });
    } catch (emailError) {
      // Remove newly-created invitation if email failed,
      // so there is no unusable pending invitation.
      await (
        TeamInvitation as any
      ).findByIdAndDelete(
        invitation._id,
      );

      throw emailError;
    }

    // --------------------------------------------------------
    // MARK SENT AFTER SUCCESS
    // --------------------------------------------------------

    invitation.status = "sent";
    await invitation.save();

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator invitation sent successfully.",
        data: {
          type: "new-user-invited",
          invitationId:
            String(invitation._id),
          email,
          roleId: String(role._id),
          expiresAt,
          status: "sent",
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Admin invitation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create administrator invitation.",
      },
      {
        status: 500,
      },
    );
  }
}
