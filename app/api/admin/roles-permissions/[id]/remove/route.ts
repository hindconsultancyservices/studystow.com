import { requireAdminPermission } from "@/lib/admin-authorization";
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

/**
 * Checks whether the currently logged-in user is the owner.
 *
 * Supports:
 * - role = owner
 * - role = super_admin
 * - adminRole = owner
 * - adminRole = super_admin
 * - ADMIN_OWNER_EMAIL environment variable
 */
function isOwner(user: any) {
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const adminRole = String(user?.adminRole || "")
    .trim()
    .toLowerCase();

  const email = String(user?.email || "")
    .trim()
    .toLowerCase();

  const ownerEmail = String(
    process.env.ADMIN_OWNER_EMAIL || ""
  )
    .trim()
    .toLowerCase();

  return (
    role === "owner" ||
    role === "super_admin" ||
    role === "super-admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin" ||
    adminRole === "super-admin" ||
    (!!ownerEmail && email === ownerEmail)
  );
}

/**
 * Protects owner / super-admin accounts
 * from being permanently deleted.
 */
function isProtectedOwner(user: any) {
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const adminRole = String(user?.adminRole || "")
    .trim()
    .toLowerCase();

  return (
    role === "owner" ||
    role === "super_admin" ||
    role === "super-admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin" ||
    adminRole === "super-admin"
  );
}

/**
 * DELETE
 *
 * /api/admin/roles-permissions/[id]/remove
 *
 * Permanently removes an administrator account.
 *
 * Owner only.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await requireAdminPermission("adminUsers", "remove");
    if (!auth.ok) return auth.response;

    const sessionUser = auth.context.actor;

    // --------------------------------------------------
    // 3. GET ADMIN USER ID
    // --------------------------------------------------
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

    // --------------------------------------------------
    // 4. OWNER CANNOT REMOVE THEMSELVES
    // --------------------------------------------------
    if (
      sessionUser.id &&
      String(sessionUser.id) === String(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot remove your own admin account.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 5. CONNECT DATABASE
    // --------------------------------------------------
    await connectDB();

    // --------------------------------------------------
    // 6. FIND TARGET USER
    // --------------------------------------------------
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

    // --------------------------------------------------
    // 7. PROTECT OWNER / SUPER ADMIN
    // --------------------------------------------------
    if (isProtectedOwner(targetUser)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner / Super Admin account cannot be removed.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 8. ONLY ADMIN ACCOUNTS CAN BE REMOVED
    // --------------------------------------------------
    if (
      String(targetUser.role || "")
        .trim()
        .toLowerCase() !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only admin accounts can be removed.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 9. OPTIONAL REMOVAL REASON
    // --------------------------------------------------
    let reason = "";

    try {
      const body = await request.json();

      if (body?.reason) {
        reason = String(body.reason)
          .trim()
          .slice(0, 500);
      }
    } catch {
      // DELETE request body is optional.
    }

    // --------------------------------------------------
    // 10. SAVE DATA FOR RESPONSE / FUTURE AUDIT LOG
    // --------------------------------------------------
    const removedAdmin = {
      id: String(targetUser._id),
      name: targetUser.name || "",
      email: targetUser.email || "",
      role: targetUser.role || "",
      adminRole:
        (targetUser as any).adminRole || null,
      reason,
    };

    // --------------------------------------------------
    // 11. PERMANENTLY DELETE ADMIN
    // --------------------------------------------------
    await User.deleteOne({
      _id: targetUser._id,
    });

    // --------------------------------------------------
    // 12. SUCCESS
    // --------------------------------------------------
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
