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

function isAdmin(user: any) {
  return (
    user?.role === "admin" ||
    user?.role === "owner" ||
    user?.adminRole === "admin" ||
    user?.adminRole === "owner" ||
    user?.adminRole === "super_admin"
  );
}

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

    const currentUser = session.user as any;

    if (!isOwner(currentUser)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the owner can suspend admin users.",
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

    const targetRecord = targetUser as any;
    const targetRole = targetRecord?.role;
    const targetAdminRole = targetRecord?.adminRole;
    const targetStatus = targetRecord?.status;

    // Owner account can never be suspended.
    if (
      targetRole === "owner" ||
      targetAdminRole === "owner" ||
      targetAdminRole === "super_admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The owner account cannot be suspended.",
        },
        { status: 403 }
      );
    }

    // Target must actually be an admin account.
    if (!isAdmin(targetUser)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only admin users can be suspended.",
        },
        { status: 400 }
      );
    }

    // Prevent an owner from suspending their own account.
    const currentUserId =
      String(
        currentUser.id ||
          currentUser._id ||
          currentUser.userId ||
          ""
      );

    if (
      currentUserId &&
      currentUserId === String(targetUser._id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot suspend your own account.",
        },
        { status: 400 }
      );
    }

    if (targetRecord.status === "suspended") {
      return NextResponse.json(
        {
          success: true,
          message:
            "Admin user is already suspended.",
          data: {
            id: String(targetUser._id),
            name: targetUser.name,
            email: targetUser.email,
            status: targetRecord.status,
          },
        },
        { status: 200 }
      );
    }

    if (targetRecord.status === "removed") {
      return NextResponse.json(
        {
          success: false,
          message:
            "A removed admin cannot be suspended. Activate or recreate the account first.",
        },
        { status: 400 }
      );
    }

    targetRecord.status = "suspended";

    await targetUser.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "Admin user suspended successfully.",
        data: {
          id: String(targetUser._id),
          name: targetUser.name,
          email: targetUser.email,
          role: targetRole,
          adminRole: targetAdminRole || null,
          status: targetRecord.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Suspend admin user error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to suspend admin user.",
      },
      { status: 500 }
    );
  }
}