import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  isOwnerUser,
} from "@/lib/authorization";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

function isOwner(user: any) {
  return isOwnerUser(user);
}

function isAdmin(user: any) {
  const role = String(
    user?.role || ""
  ).toLowerCase();

  const adminRole = String(
    user?.adminRole || ""
  ).toLowerCase();

  return (
    role === "admin" ||
    role === "owner" ||
    role === "super_admin" ||
    role === "super-admin" ||
    adminRole === "admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin" ||
    adminRole === "super-admin"
  );
}

/**
 * GET /api/admin/roles-permissions
 */
export async function GET(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const sessionUser =
      session.user as any;

    if (!isAdmin(sessionUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const type =
      searchParams.get("type") ||
      "users";

    const search =
      searchParams
        .get("search")
        ?.trim() || "";

    const status =
      searchParams
        .get("status")
        ?.trim() || "";

    const page = Math.max(
      Number.parseInt(
        searchParams.get("page") ||
          "1",
        10
      ),
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          searchParams.get("limit") ||
            "50",
          10
        ),
        1
      ),
      100
    );

    await connectDB();

    if (type !== "users") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request type.",
        },
        { status: 400 }
      );
    }

    /**
     * Only admin/owner accounts.
     * Customer accounts are intentionally excluded.
     */
    const filter: Record<
      string,
      any
    > = {
      role: {
        $in: ["admin", "owner"],
      },
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const skip =
      (page - 1) * limit;

    const [
      users,
      total,
    ] = await Promise.all([
      User.find(filter)
        .select(
          "_id name email role adminRole permissions status invitedBy invitationExpires createdAt updatedAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const data = users.map(
      (user: any) => ({
        id: String(user._id),
        _id: String(user._id),

        name: user.name || "",
        email: user.email || "",

        role:
          user.role || "admin",

        adminRole:
          user.adminRole || null,

        permissions:
          user.permissions || {},

        status:
          user.status || "active",

        invitedBy:
          user.invitedBy
            ? String(user.invitedBy)
            : null,

        invitationExpires:
          user.invitationExpires
            ? new Date(
                user.invitationExpires
              ).toISOString()
            : null,

        createdAt:
          user.createdAt
            ? new Date(
                user.createdAt
              ).toISOString()
            : null,

        updatedAt:
          user.updatedAt
            ? new Date(
                user.updatedAt
              ).toISOString()
            : null,

        /**
         * Server-side owner determination.
         *
         * This is especially important for the
         * configured owner email.
         */
        isOwner:
          isOwner(user),
      })
    );

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/roles-permissions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load admin users.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/roles-permissions
 */
export async function PATCH(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const sessionUser =
      session.user as any;

    if (!isOwner(sessionUser)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the owner can modify admin users.",
        },
        { status: 403 }
      );
    }

    const body =
      await request.json();

    const userId = String(
      body?.userId || ""
    ).trim();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const targetUser =
      await User.findById(userId);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin user not found.",
        },
        { status: 404 }
      );
    }

    const targetUserData =
      targetUser as any;

    const targetIsOwner =
      isOwner(targetUserData);

    if (targetIsOwner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner account cannot be modified.",
        },
        { status: 403 }
      );
    }

    if (
      String(targetUser._id) ===
      String(
        sessionUser.id ||
          sessionUser._id ||
          ""
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot modify your own admin permissions.",
        },
        { status: 403 }
      );
    }

    const allowedFields = [
      "name",
      "adminRole",
      "permissions",
    ] as const;

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          body,
          field
        )
      ) {
        (targetUser as any)[field] =
          body[field];
      }
    }

    await targetUser.save();

    const updatedUser =
      targetUser as any;

    return NextResponse.json({
      success: true,
      message:
        "Admin user updated successfully.",
      data: {
        id: String(
          updatedUser._id
        ),
        name:
          updatedUser.name,
        email:
          updatedUser.email,
        role:
          updatedUser.role,
        adminRole:
          updatedUser.adminRole ||
          null,
        permissions:
          updatedUser.permissions ||
          {},
        status:
          updatedUser.status ||
          "active",
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/roles-permissions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update admin user.",
      },
      { status: 500 }
    );
  }
}