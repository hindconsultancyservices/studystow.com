import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import TeamInvitation from "@/models/TeamInvitation";

export const dynamic = "force-dynamic";

function hashInvitationToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function normalizePermissions(
  value: any,
): Record<string, Record<string, boolean>> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const result: Record<string, Record<string, boolean>> = {};

  for (const [moduleKey, actions] of Object.entries(value)) {
    if (Array.isArray(actions)) {
      const normalized: Record<string, boolean> = {};

      for (const action of actions) {
        if (typeof action === "string" && action.trim()) {
          normalized[action.trim()] = true;
        }
      }

      if (Object.keys(normalized).length > 0) {
        result[moduleKey] = normalized;
      }

      continue;
    }

    if (actions && typeof actions === "object") {
      const normalized: Record<string, boolean> = {};

      for (const [actionKey, enabled] of Object.entries(actions)) {
        if (typeof enabled === "boolean") {
          normalized[actionKey] = enabled;
        }
      }

      if (Object.keys(normalized).length > 0) {
        result[moduleKey] = normalized;
      }
    }
  }

  return result;
}

function serializeRole(role: any) {
  if (!role) {
    return null;
  }

  return {
    id: String(role._id),
    name: String(role.name || "Custom Role"),
    slug: String(role.slug || ""),
  };
}

function validateInvitation(invitation: any) {
  if (!invitation) {
    return {
      ok: false as const,
      status: 404,
      message: "This invitation is invalid or no longer available.",
    };
  }

  const status = String(invitation.status || "")
    .trim()
    .toLowerCase();

  if (status === "cancelled" || status === "canceled") {
    return {
      ok: false as const,
      status: 410,
      message: "This invitation has been cancelled.",
    };
  }

  if (status === "accepted") {
    return {
      ok: false as const,
      status: 409,
      message: "This invitation has already been accepted.",
    };
  }

  if (status !== "pending" && status !== "sent") {
    return {
      ok: false as const,
      status: 410,
      message: "This invitation is no longer active.",
    };
  }

  if (
    invitation.expiresAt &&
    new Date(invitation.expiresAt).getTime() <= Date.now()
  ) {
    return {
      ok: false as const,
      status: 410,
      expired: true,
      message: "This invitation has expired.",
    };
  }

  return {
    ok: true as const,
  };
}

async function findInvitationByToken(token: string) {
  const tokenHash = hashInvitationToken(token);

  return TeamInvitation.findOne({
    tokenHash,
  })
    .select("+tokenHash")
    .lean();
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to process the invitation.";
}

// ============================================================
// GET
// Public invitation verification. No admin/user session needed.
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim() || "";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing invitation token.",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const invitation =
      await findInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          message: "This invitation is invalid or no longer available.",
        },
        { status: 404 },
      );
    }

    const validation =
      validateInvitation(invitation);

    if (!validation.ok) {
      if (
        validation.expired &&
        invitation?._id
      ) {
        await TeamInvitation.findByIdAndUpdate(
          invitation._id,
          {
            $set: {
              status: "expired",
            },
          },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: validation.message,
        },
        { status: validation.status },
      );
    }

    const role = await Role.findById(
      invitation.roleId,
    )
      .select("_id name slug permissions isSystem")
      .lean();

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The role assigned to this invitation could not be found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(invitation._id),
        email: String(invitation.email || ""),
        name: String(invitation.name || ""),
        role: serializeRole(role),
        expiresAt: invitation.expiresAt
          ? new Date(
              invitation.expiresAt,
            ).toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/roles-permissions/accept-invite error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: errorMessage(error),
      },
      { status: 500 },
    );
  }
}

// ============================================================
// POST
// Create the admin account from the invitation.
// No existing session is required.
// ============================================================

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json().catch(() => null);

    const token = String(
      body?.token || "",
    ).trim();

    const password = String(
      body?.password || "",
    );

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing invitation token.",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a password.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 8 characters.",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const invitation =
      await findInvitationByToken(token);

    const validation =
      validateInvitation(invitation);

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This invitation is invalid or no longer available.",
        },
        { status: 404 },
      );
    }

    if (!validation.ok) {
      if (
        validation.expired &&
        invitation._id
      ) {
        await TeamInvitation.findByIdAndUpdate(
          invitation._id,
          {
            $set: {
              status: "expired",
            },
          },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: validation.message,
        },
        { status: validation.status },
      );
    }

    const email = String(
      invitation.email || "",
    )
      .trim()
      .toLowerCase();

    const name = String(
      invitation.name || "",
    ).trim();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The invitation does not contain a valid email address.",
        },
        { status: 422 },
      );
    }

    const role = await Role.findById(
      invitation.roleId,
    )
      .select("_id name slug permissions isSystem")
      .lean();

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The role assigned to this invitation could not be found.",
        },
        { status: 404 },
      );
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists. Please use the existing account or contact the owner.",
        },
        { status: 409 },
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const permissions =
      normalizePermissions(
        (role as any).permissions,
      );

    const now = new Date();

    // User.ts confirms that "password" is the required
    // password field, and custom admin roles are supported
    // through adminRole + roleId.
    const newUser: any = await User.create({
      name:
        name ||
        email.split("@")[0],

      email,

      password: passwordHash,

      role: "admin",

      adminRole:
        String(
          (role as any).slug || "custom",
        ),

      roleId: (role as any)._id,

      permissions,

      status: "active",

      active: true,

      invitedBy:
        (invitation as any).invitedBy ||
        null,

      invitationExpires: undefined,
    });

    await TeamInvitation.findByIdAndUpdate(
      invitation._id,
      {
        $set: {
          status: "accepted",
          acceptedAt: now,
          passwordSetAt: now,
        },
      },
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Your admin account has been created successfully.",
        data: {
          userId: String(
            newUser._id,
          ),
          email: newUser.email,
          role: "admin",
          adminRole:
            (newUser as any)
              .adminRole,
          roleId: String(
            (newUser as any).roleId ||
              role._id,
          ),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/admin/roles-permissions/accept-invite error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: errorMessage(error),
      },
      { status: 500 },
    );
  }
}
