import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

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

function isProtectedOwner(user: any) {
  return (
    user?.role === "owner" ||
    user?.adminRole === "owner" ||
    user?.adminRole === "super_admin"
  );
}

/**
 * GET /api/admin/roles-permissions/[id]
 *
 * Get one admin user.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const sessionUser = session.user as any;

    if (!isOwner(sessionUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the owner can view admin details.",
        },
        { status: 403 }
      );
    }

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

    const user = (await User.findById(id)
      .select(
        "_id name email role adminRole permissions status invitedBy invitationExpires createdAt updatedAt"
      )
      .lean()) as any;

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user not found.",
        },
        { status: 404 }
      );
    }

    if (!["admin", "owner"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is not an admin account.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(user._id),
        _id: String(user._id),
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        adminRole: user.adminRole || null,
        permissions: user.permissions || {},
        status: user.status || "active",
        invitedBy: user.invitedBy
          ? String(user.invitedBy)
          : null,
        invitationExpires: user.invitationExpires
          ? new Date(user.invitationExpires).toISOString()
          : null,
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : null,
        updatedAt: user.updatedAt
          ? new Date(user.updatedAt).toISOString()
          : null,
        isOwner: isProtectedOwner(user),
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/roles-permissions/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin user.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/roles-permissions/[id]
 *
 * Update admin user's name, role and permissions.
 *
 * Only Owner can do this.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const sessionUser = session.user as any;

    if (!isOwner(sessionUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the owner can edit admin users.",
        },
        { status: 403 }
      );
    }

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

    if (String(sessionUser.id) === String(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot modify your own permissions.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    await connectDB();

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user not found.",
        },
        { status: 404 }
      );
    }

    if (isProtectedOwner(targetUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "Owner account cannot be modified.",
        },
        { status: 403 }
      );
    }

    if (targetUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only admin accounts can be edited here.",
        },
        { status: 400 }
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "name"
      )
    ) {
      const name = String(body.name || "").trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Name cannot be empty.",
          },
          { status: 400 }
        );
      }

      if (name.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Name cannot exceed 100 characters.",
          },
          { status: 400 }
        );
      }

      targetUser.name = name;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "adminRole"
      )
    ) {
      const adminRole = String(
        body.adminRole || ""
      ).trim();

      if (
        ["owner", "super_admin", "super-admin"].includes(
          adminRole.toLowerCase()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Owner/Super Admin cannot be assigned.",
          },
          { status: 403 }
        );
      }

      (targetUser as any).adminRole =
        adminRole || null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "permissions"
      )
    ) {
      if (
        !body.permissions ||
        typeof body.permissions !== "object" ||
        Array.isArray(body.permissions)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid permissions format.",
          },
          { status: 400 }
        );
      }

      (targetUser as any).permissions =
        body.permissions;
    }

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: "Admin user updated successfully.",
      data: {
        id: String(targetUser._id),
        _id: String(targetUser._id),
        name: targetUser.name || "",
        email: targetUser.email || "",
        role: targetUser.role,
        adminRole:
          (targetUser as any).adminRole || null,
        permissions:
          (targetUser as any).permissions || {},
        status:
          (targetUser as any).status || "active",
        isOwner: false,
        updatedAt:
          targetUser.updatedAt?.toISOString?.() ||
          null,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/roles-permissions/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update admin user.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/roles-permissions/[id]
 *
 * Permanently removes an admin account.
 *
 * Owner only.
 */
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
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const sessionUser = session.user as any;

    if (!isOwner(sessionUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the owner can remove admin users.",
        },
        { status: 403 }
      );
    }

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

    if (String(sessionUser.id) === String(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot remove your own account.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user not found.",
        },
        { status: 404 }
      );
    }

    if (isProtectedOwner(targetUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "Owner account cannot be removed.",
        },
        { status: 403 }
      );
    }

    if (targetUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only admin accounts can be removed.",
        },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Admin user removed successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/roles-permissions/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove admin user.",
      },
      { status: 500 }
    );
  }
}