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
 * DELETE
 * /api/admin/roles-permissions/[id]/remove
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
          message:
            "Only the owner can remove admin users.",
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
     * Prevent owner from removing their own account.
     */
    if (String(sessionUser.id) === String(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot remove your own admin account.",
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
     *
     * An owner must never be removable by an employee/admin.
     * Even another owner cannot remove the protected owner
     * through this endpoint.
     */
    if (isProtectedOwner(targetUser)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner account cannot be removed.",
        },
        { status: 403 }
      );
    }

    /**
     * Only admin accounts are handled here.
     */
    if (targetUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only admin accounts can be removed.",
        },
        { status: 400 }
      );
    }

    /**
     * Optional reason from the owner.
     * Useful for audit logs later.
     */
    let reason = "";

    try {
      const body = await request.json();

      if (body?.reason) {
        reason = String(body.reason)
          .trim()
          .slice(0, 500);
      }
    } catch {
      // DELETE body is optional.
    }

    /**
     * Save basic information before deletion
     * so the response/audit system can identify
     * the removed account.
     */
    const removedAdmin = {
      id: String(targetUser._id),
      name: targetUser.name || "",
      email: targetUser.email || "",
      role: targetUser.role,
      adminRole:
        (targetUser as any).adminRole || null,
      reason,
    };

    /**
     * Permanently delete the admin account.
     */
    await User.deleteOne({
      _id: targetUser._id,
    });

    return NextResponse.json({
      success: true,
      message:
        "Admin user removed successfully.",
      data: removedAdmin,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/roles-permissions/[id]/remove error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to remove admin user.",
      },
      { status: 500 }
    );
  }
}