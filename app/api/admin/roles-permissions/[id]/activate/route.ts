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
 * PATCH /api/admin/roles-permissions/[id]/activate
 *
 * Activates a suspended admin account.
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
            "Only the owner can activate admin users.",
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
     * Owner cannot perform the action on their own account.
     */
    if (String(sessionUser.id) === String(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot change your own account status.",
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

    /**
     * Owner protection.
     */
    if (isProtectedOwner(targetUser)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner account cannot be modified.",
        },
        { status: 403 }
      );
    }

    /**
     * Only admin accounts can be activated
     * from this endpoint.
     */
    if (targetUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only admin accounts can be activated.",
        },
        { status: 400 }
      );
    }

    const currentStatus =
      (targetUser as any).status || "active";

    /**
     * Already active.
     */
    if (currentStatus === "active") {
      return NextResponse.json({
        success: true,
        message: "Admin user is already active.",
        data: {
          id: String(targetUser._id),
          status: "active",
        },
      });
    }

    /**
     * Do not activate an account marked as removed.
     *
     * Removed accounts should be permanently removed
     * or restored through a separate controlled process.
     */
    if (currentStatus === "removed") {
      return NextResponse.json(
        {
          success: false,
          message:
            "A removed admin account cannot be activated.",
        },
        { status: 400 }
      );
    }

    (targetUser as any).status = "active";

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message:
        "Admin user activated successfully.",
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
      "PATCH /api/admin/roles-permissions/[id]/activate error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to activate admin user.",
      },
      { status: 500 }
    );
  }
}