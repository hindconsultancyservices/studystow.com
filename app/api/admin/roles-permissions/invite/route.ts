import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import TeamInvitation from "@/models/TeamInvitation";

function isOwner(user: any) {
  const role = String(user?.role || "").toLowerCase();
  const adminRole = String(user?.adminRole || "").toLowerCase();
  const status = String(user?.status || "").toLowerCase();
  const active = user?.active === false
    ? false
    : !["suspended", "removed"].includes(status);

  const explicitOwner =
    role === "owner" ||
    role === "super_admin" ||
    role === "super-admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin" ||
    adminRole === "super-admin";

  if (explicitOwner) return active;

  const ownerEmail = process.env.ADMIN_OWNER_EMAIL?.trim().toLowerCase();
  const emailMatches =
    !!ownerEmail &&
    String(user?.email || "").trim().toLowerCase() === ownerEmail;

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

function normalizePermissions(value: any) {
  if (!value || typeof value !== "object") return {};

  const result: Record<string, string[]> = {};
  for (const [moduleKey, actions] of Object.entries(value)) {
    if (Array.isArray(actions)) {
      result[moduleKey] = actions.filter(
        (action): action is string => typeof action === "string"
      );
    }
  }
  return result;
}

function isProtectedRole(role: any) {
  const slug = String(role?.slug || "").trim().toLowerCase();
  const name = String(role?.name || "").trim().toLowerCase();

  return [
    "owner",
    "super_admin",
    "super-admin",
    "super admin",
  ].includes(slug) || [
    "owner",
    "super admin",
    "super_admin",
  ].includes(name);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "You are not authorized." },
        { status: 401 }
      );
    }

    if (!isOwner(session.user)) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to invite administrators." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const roleId = String(body?.roleId || "").trim();

    if (!name || !email || !roleId) {
      return NextResponse.json(
        { success: false, message: "Name, email and role are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await dbConnect();

    const role = await Role.findById(roleId).lean();

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Selected role was not found." },
        { status: 404 }
      );
    }

    if (isProtectedRole(role)) {
      return NextResponse.json(
        { success: false, message: "Owner and Super Admin roles cannot be assigned through invitations." },
        { status: 403 }
      );
    }

    const existingUser = await User.findOne({ email });

    // IMPORTANT: An existing customer can be promoted to an administrator.
    // The existing account, password, orders and other customer data stay intact.
    if (existingUser) {
      const currentRole = String((existingUser as any).role || "").toLowerCase();
      const currentAdminRole = String((existingUser as any).adminRole || "").toLowerCase();

      if (
        currentRole === "owner" ||
        currentRole === "super_admin" ||
        currentRole === "super-admin" ||
        currentAdminRole === "owner" ||
        currentAdminRole === "super_admin" ||
        currentAdminRole === "super-admin"
      ) {
        return NextResponse.json(
          { success: false, message: "This account already has protected administrator access." },
          { status: 409 }
        );
      }

      const permissions = normalizePermissions((role as any).permissions);

      (existingUser as any).name = name || (existingUser as any).name;
      (existingUser as any).role = "admin";
      (existingUser as any).adminRole = String((role as any).slug || "custom");
      (existingUser as any).permissions = permissions;
      (existingUser as any).status = "active";
      (existingUser as any).active = true;
      (existingUser as any).invitedBy = (session.user as any).id || null;
      (existingUser as any).invitationExpires = null;

      await existingUser.save();

      return NextResponse.json(
        {
          success: true,
          message: "Existing customer account has been granted administrator access.",
          data: {
            type: "existing-user-promoted",
            userId: String(existingUser._id),
            email: existingUser.email,
            role: "admin",
            adminRole: (existingUser as any).adminRole,
          },
        },
        { status: 200 }
      );
    }

    // New email: keep the invitation flow for people who do not have an account yet.
    const existingInvitation = await (TeamInvitation as any).findOne({
      email,
      status: { $in: ["pending", "sent"] },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, message: "An active invitation already exists for this email address." },
        { status: 409 }
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const invitation = await (TeamInvitation as any).create({
      name,
      email,
      roleId: role._id,
      role: String((role as any).slug || "custom"),
      invitedBy: (session.user as any).id,
      tokenHash,
      expiresAt,
      status: "pending",
    });

    const appUrl =
      process.env.NEXTAUTH_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "http://localhost:3000";

    const inviteUrl = `${appUrl.replace(/\/$/, "")}/admin/accept-invitation?token=${rawToken}`;

    return NextResponse.json(
      {
        success: true,
        message: "Administrator invitation created successfully.",
        data: {
          type: "new-user-invited",
          invitationId: String(invitation._id),
          email,
          roleId: String(role._id),
          inviteUrl,
          expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin invitation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create administrator invitation.",
      },
      { status: 500 }
    );
  }
}
