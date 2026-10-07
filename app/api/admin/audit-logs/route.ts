import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAdmin(user: any) {
  const role = String(user?.role || "").toLowerCase();
  const adminRole = String(user?.adminRole || "")
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/ /g, "_");

  return (
    role === "admin" ||
    role === "owner" ||
    adminRole === "admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin"
  );
}

export async function GET(request: NextRequest) {
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

    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const rawPage = Number(searchParams.get("page") || "1");
    const rawLimit = Number(searchParams.get("limit") || "20");

    const page = Number.isFinite(rawPage)
      ? Math.max(1, Math.floor(rawPage))
      : 1;

    const limit = Number.isFinite(rawLimit)
      ? Math.min(100, Math.max(1, Math.floor(rawLimit)))
      : 20;

    const search = searchParams.get("search")?.trim() || "";
    const result = searchParams.get("result")?.trim() || "";
    const resource = searchParams.get("resource")?.trim() || "";
    const action = searchParams.get("action")?.trim() || "";

    const filter: Record<string, any> = {};

    if (result) {
      filter.result = result;
    }

    if (resource) {
      filter.resource = resource;
    }

    if (action) {
      filter.action = action;
    }

    if (search) {
      filter.$or = [
        {
          action: {
            $regex: search,
            $options: "i",
          },
        },
        {
          resource: {
            $regex: search,
            $options: "i",
          },
        },
        {
          resourceId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          ipAddress: {
            $regex: search,
            $options: "i",
          },
        },
        {
          userAgent: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("actor", "name email role adminRole")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AuditLog.countDocuments(filter),
    ]);

    const formattedLogs = logs.map((log: any) => ({
      id: String(log._id),
      _id: String(log._id),

      actor: log.actor
        ? {
            id: String(log.actor._id),
            name: log.actor.name || "",
            email: log.actor.email || "",
            role: log.actor.role || "",
            adminRole: log.actor.adminRole || null,
          }
        : null,

      action: log.action || "",
      resource: log.resource || "",
      resourceId:
        log.resourceId !== undefined &&
        log.resourceId !== null
          ? String(log.resourceId)
          : "",

      metadata:
        log.metadata &&
        typeof log.metadata === "object"
          ? log.metadata
          : {},

      ipAddress: log.ipAddress || "",
      userAgent: log.userAgent || "",
      result: log.result || "success",

      createdAt: log.createdAt
        ? new Date(log.createdAt).toISOString()
        : null,

      updatedAt: log.updatedAt
        ? new Date(log.updatedAt).toISOString()
        : null,
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: formattedLogs,

      pagination: {
        page,
        limit,
        total,
        totalPages,

        // Backward compatibility with current frontend
        pages: totalPages,

        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/audit-logs error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? `Failed to fetch audit logs: ${errorMessage}`
            : "Failed to fetch audit logs.",
      },
      { status: 500 }
    );
  }
}