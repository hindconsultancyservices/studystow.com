
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import TeamInvitation from "@/models/TeamInvitation";

export const dynamic = "force-dynamic";

type NormalizedInvitationStatus =
  | "pending"
  | "sent"
  | "accepted"
  | "expired"
  | "cancelled";

function isOwner(user: any) {
  const role = String(user?.role || "").trim().toLowerCase();
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

function normalizeStatus(
  statusValue: unknown,
  expiresAtValue: unknown
): NormalizedInvitationStatus {
  const status = String(statusValue || "")
    .trim()
    .toLowerCase();

  if (status === "accepted") {
    return "accepted";
  }

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "cancelled";
  }

  if (status === "expired") {
    return "expired";
  }

  const expiresAt = expiresAtValue
    ? new Date(String(expiresAtValue))
    : null;

  const hasValidExpiry =
    expiresAt &&
    !Number.isNaN(expiresAt.getTime());

  if (
    (status === "pending" || status === "sent") &&
    hasValidExpiry &&
    expiresAt.getTime() <= Date.now()
  ) {
    return "expired";
  }

  if (status === "sent") {
    return "sent";
  }

  return "pending";
}

function toIso(value: unknown) {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function buildSearchQuery(
  search: string
): Record<string, any> {
  if (!search) {
    return {};
  }

  return {
    $or: [
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
    ],
  };
}

function buildNonExpiredCondition() {
  return {
    $or: [
      {
        expiresAt: {
          $exists: false,
        },
      },
      {
        expiresAt: {
          $gt: new Date(),
        },
      },
    ],
  };
}

function buildInvitationQuery(
  search: string,
  statusFilter: string,
  now: Date
) {
  const searchQuery = buildSearchQuery(search);

  const andConditions: Record<string, any>[] = [];

  if (searchQuery.$or) {
    andConditions.push({
      $or: searchQuery.$or,
    });
  }

  switch (statusFilter) {
    case "accepted": {
      andConditions.push({
        status: "accepted",
      });
      break;
    }

    case "cancelled": {
      andConditions.push({
        status: {
          $in: ["cancelled", "canceled"],
        },
      });
      break;
    }

    case "expired": {
      andConditions.push({
        $or: [
          {
            status: "expired",
          },
          {
            status: {
              $in: ["pending", "sent"],
            },
            expiresAt: {
              $lte: now,
            },
          },
        ],
      });
      break;
    }

    case "pending": {
      andConditions.push({
        status: "pending",
      });

      andConditions.push({
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

      break;
    }

    case "sent": {
      andConditions.push({
        status: "sent",
      });

      andConditions.push({
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

      break;
    }

    case "all":
    default:
      break;
  }

  if (andConditions.length === 0) {
    return {};
  }

  if (andConditions.length === 1) {
    return andConditions[0];
  }

  return {
    $and: andConditions,
  };
}

function buildSearchOnlyQuery(search: string) {
  return buildSearchQuery(search);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized.",
        },
        {
          status: 401,
        }
      );
    }

    if (!isOwner(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to view invitations.",
        },
        {
          status: 403,
        }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const statusFilter =
      searchParams
        .get("status")
        ?.trim()
        .toLowerCase() || "all";

    const requestedPage = Number(
      searchParams.get("page") || 1
    );

    const requestedLimit = Number(
      searchParams.get("limit") || 20
    );

    const page = Number.isFinite(requestedPage)
      ? Math.max(requestedPage, 1)
      : 1;

    const limit = Number.isFinite(requestedLimit)
      ? Math.min(
          Math.max(requestedLimit, 1),
          100
        )
      : 20;

    const now = new Date();

    /*
     * Main query used by the table.
     */
    const baseQuery = buildInvitationQuery(
      search,
      statusFilter,
      now
    );

    const skip = (page - 1) * limit;

    /*
     * Stats should represent all matching invitations,
     * not only the currently selected status filter.
     */
    const searchQuery =
      buildSearchOnlyQuery(search);

    const [
      invitationDocuments,
      filteredTotal,
      totalCount,
      pendingCount,
      sentCount,
      acceptedCount,
      cancelledCount,
      expiredCount,
    ] = await Promise.all([
      (TeamInvitation as any)
        .find(baseQuery)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      (TeamInvitation as any).countDocuments(
        baseQuery
      ),

      (TeamInvitation as any).countDocuments(
        searchQuery
      ),

      (TeamInvitation as any).countDocuments({
        ...searchQuery,
        status: "pending",
        $and: [
          ...(searchQuery.$and || []),
          buildNonExpiredCondition(),
        ],
      }),

      (TeamInvitation as any).countDocuments({
        ...searchQuery,
        status: "sent",
        $and: [
          ...(searchQuery.$and || []),
          buildNonExpiredCondition(),
        ],
      }),

      (TeamInvitation as any).countDocuments({
        ...searchQuery,
        status: "accepted",
      }),

      (TeamInvitation as any).countDocuments({
        ...searchQuery,
        status: {
          $in: ["cancelled", "canceled"],
        },
      }),

      (TeamInvitation as any).countDocuments({
        ...searchQuery,
        $or: [
          {
            status: "expired",
          },
          {
            status: {
              $in: ["pending", "sent"],
            },
            expiresAt: {
              $lte: now,
            },
          },
        ],
      }),
    ]);

    /*
     * Collect referenced Role IDs.
     */
    const roleIds = invitationDocuments
      .map((item: any) => item.roleId)
      .filter(Boolean)
      .map((value: any) => String(value));

    /*
     * Collect inviter User IDs.
     */
    const invitedByIds = invitationDocuments
      .map((item: any) => item.invitedBy)
      .filter(Boolean)
      .map((value: any) => String(value));

    const [roleDocuments, userDocuments] =
      await Promise.all([
        roleIds.length
          ? Role.find({
              _id: {
                $in: roleIds,
              },
            })
              .select("_id name slug")
              .lean()
          : [],

        invitedByIds.length
          ? User.find({
              _id: {
                $in: invitedByIds,
              },
            })
              .select("_id name email")
              .lean()
          : [],
      ]);

    const roleMap = new Map(
      roleDocuments.map((role: any) => [
        String(role._id),
        role,
      ])
    );

    const userMap = new Map(
      userDocuments.map((user: any) => [
        String(user._id),
        user,
      ])
    );

    const data = invitationDocuments.map(
      (invitation: any) => {
        const normalizedStatus =
          normalizeStatus(
            invitation.status,
            invitation.expiresAt
          );

        const role = invitation.roleId
          ? roleMap.get(
              String(invitation.roleId)
            )
          : null;

        const invitedBy =
          invitation.invitedBy
            ? userMap.get(
                String(invitation.invitedBy)
              )
            : null;

        return {
          _id: String(invitation._id),

          name: invitation.name || "",

          email: invitation.email || "",

          status: normalizedStatus,

          role: role
            ? {
                _id: String(role._id),
                name:
                  role.name ||
                  "Custom Role",
                slug: role.slug || "",
              }
            : {
                _id: invitation.roleId
                  ? String(
                      invitation.roleId
                    )
                  : "",
                name:
                  "Role unavailable",
                slug: "",
              },

          invitedBy: invitedBy
            ? {
                _id: String(
                  invitedBy._id
                ),
                name:
                  invitedBy.name || "",
                email:
                  invitedBy.email || "",
              }
            : null,

          createdAt: toIso(
            invitation.createdAt
          ),

          updatedAt: toIso(
            invitation.updatedAt
          ),

          expiresAt: toIso(
            invitation.expiresAt
          ),

          acceptedAt: toIso(
            invitation.acceptedAt
          ),
        };
      }
    );

    const totalPages = Math.max(
      Math.ceil(filteredTotal / limit),
      1
    );

    return NextResponse.json({
      success: true,

      data,

      stats: {
        total: totalCount,
        pending: pendingCount,
        sent: sentCount,
        accepted: acceptedCount,
        cancelled: cancelledCount,
        expired: expiredCount,
      },

      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/roles-permissions/invitations error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load invitations.",
      },
      {
        status: 500,
      }
    );
  }
}
