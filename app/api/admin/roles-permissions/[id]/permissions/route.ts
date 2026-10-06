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

function isValidPermissions(value: unknown) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

/**
 * GET
 * /api/admin/roles-permissions/[id]/permissions
 *
 * Get permissions of one admin user.
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
          message:
            "Only the owner can view admin permissions.",
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
        "_id name email role adminRole permissions status"
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

    if (
      user.role !== "admin" &&
      user.role !== "owner"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account is not an admin account.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(user._id),
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        adminRole: user.adminRole || null,
        status: user.status || "active",
        permissions: user.permissions || {},
        isOwner: isProtectedOwner(user),
      },
    });
  } catch (error) {
    console.error(
      "GET admin permissions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load admin permissions.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 * /api/admin/roles-permissions/[id]/permissions
 *
 * Replace admin user's permissions.
 *
 * Owner only.
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
          message:
            "Only the owner can change admin permissions.",
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

    /**
     * Owner cannot modify their own permissions.
     */
    if (String(sessionUser.id) === String(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot modify your own permissions.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const permissions = body?.permissions;

    if (!isValidPermissions(permissions)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid permissions object is required.",
        },
        { status: 400 }
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

    /**
     * Owner protection.
     */
    if (isProtectedOwner(targetUser)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner permissions cannot be modified.",
        },
        { status: 403 }
      );
    }

    if (targetUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Permissions can only be assigned to admin accounts.",
        },
        { status: 400 }
      );
    }

    /**
     * Do not allow permission payload to
     * elevate an account into owner/super-admin.
     */
    const normalizedPermissions = {
      ...permissions,
    };

    delete (normalizedPermissions as any).owner;
    delete (normalizedPermissions as any).superAdmin;
    delete (normalizedPermissions as any).super_admin;

    (targetUser as any).permissions =
      normalizedPermissions;

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message:
        "Admin permissions updated successfully.",
      data: {
        id: String(targetUser._id),
        name: targetUser.name || "",
        email: targetUser.email || "",
        role: targetUser.role,
        adminRole:
          (targetUser as any).adminRole || null,
        status:
          (targetUser as any).status || "active",
        permissions:
          (targetUser as any).permissions || {},
        updatedAt:
          targetUser.updatedAt?.toISOString?.() ||
          null,
      },
    });
  } catch (error) {
    console.error(
      "PATCH admin permissions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update admin permissions.",
      },
      { status: 500 }
    );
  }
}