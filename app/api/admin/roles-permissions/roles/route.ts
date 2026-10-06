import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Role from "@/models/Role";

export const dynamic = "force-dynamic";

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

  const status = String(user?.status || "")
    .trim()
    .toLowerCase();

  const active =
    user?.active !== false &&
    !["suspended", "removed"].includes(status);

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

  return (
    !!ownerEmail &&
    email === ownerEmail &&
    active
  );
}

function isAdmin(user: any) {
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const adminRole = String(user?.adminRole || "")
    .trim()
    .toLowerCase();

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

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Create default system roles if they do not exist.
 */
async function ensureDefaultRoles(createdBy?: string) {
  const defaultRoles = [
    {
      name: "Manager",
      slug: "manager",
      description:
        "Can manage day-to-day store operations without owner-level access.",
      permissions: {
        dashboard: {
          view: true,
        },
        books: {
          view: true,
          create: true,
          edit: true,
        },
        categories: {
          view: true,
          create: true,
          edit: true,
        },
        inventory: {
          view: true,
          update: true,
        },
        orders: {
          view: true,
          update: true,
        },
        customers: {
          view: true,
          create: true,
          edit: true,
        },
        coupons: {
          view: true,
          create: true,
          edit: true,
        },
        reviews: {
          view: true,
          edit: true,
        },
        pages: {
          view: true,
          create: true,
          edit: true,
        },
        reports: {
          view: true,
        },
        payments: {
          view: true,
          update: true,
        },
        adminUsers: {
          view: true,
        },
        settings: {
          view: true,
        },
      },
      isSystem: true,
    },
    {
      name: "Staff",
      slug: "staff",
      description:
        "Basic store staff access for daily operations.",
      permissions: {
        dashboard: {
          view: true,
        },
        books: {
          view: true,
          create: true,
          edit: true,
        },
        categories: {
          view: true,
        },
        inventory: {
          view: true,
          update: true,
        },
        orders: {
          view: true,
          update: true,
        },
        customers: {
          view: true,
        },
        coupons: {
          view: true,
        },
        reviews: {
          view: true,
        },
        pages: {
          view: true,
        },
        reports: {
          view: true,
        },
        payments: {
          view: true,
        },
      },
      isSystem: true,
    },
  ];

  for (const roleData of defaultRoles) {
    const existingRole = await Role.findOne({
      slug: roleData.slug,
    });

    if (!existingRole) {
      await Role.create({
        ...roleData,
        createdBy: createdBy || null,
      });
    }
  }
}

/**
 * GET
 * /api/admin/roles-permissions/roles
 *
 * Owner + Admin can view roles.
 */
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

    const sessionUser = session.user as any;

    if (!isAdmin(sessionUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    await ensureDefaultRoles(
      sessionUser.id || sessionUser._id
    );

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const filter: Record<string, any> = {};

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          description: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    const roles = await Role.find(filter)
      .sort({
        isSystem: -1,
        name: 1,
      })
      .lean();

    const data = roles.map((role: any) => ({
      id: String(role._id),
      _id: String(role._id),
      name: role.name || "",
      slug: role.slug || "",
      description: role.description || "",
      permissions: role.permissions || {},
      isSystem: Boolean(role.isSystem),
      createdBy: role.createdBy
        ? String(role.createdBy)
        : null,
      createdAt: role.createdAt
        ? new Date(
            role.createdAt
          ).toISOString()
        : null,
      updatedAt: role.updatedAt
        ? new Date(
            role.updatedAt
          ).toISOString()
        : null,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/roles-permissions/roles error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load roles.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 * /api/admin/roles-permissions/roles
 *
 * Only Owner can create custom roles.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(
      authOptions
    );

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
            "Only the owner can create roles.",
        },
        { status: 403 }
      );
    }

    const body = await request
      .json()
      .catch(() => null);

    const name = String(
      body?.name || ""
    ).trim();

    const description = String(
      body?.description || ""
    ).trim();

    const permissions =
      body?.permissions &&
      typeof body.permissions === "object"
        ? body.permissions
        : {};

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Role name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Role name cannot exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    const slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a valid role name.",
        },
        { status: 400 }
      );
    }

    const protectedSlugs = [
      "owner",
      "super-admin",
      "super_admin",
      "superadmin",
    ];

    if (
      protectedSlugs.includes(slug)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner/Super Admin roles are protected.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const escapedName =
      name.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const existingRole =
      await Role.findOne({
        $or: [
          {
            name: {
              $regex: `^${escapedName}$`,
              $options: "i",
            },
          },
          {
            slug,
          },
        ],
      }).lean();

    if (existingRole) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A role with this name already exists.",
        },
        { status: 409 }
      );
    }

    const createdBy =
      sessionUser.id ||
      sessionUser._id ||
      null;

    const role = await Role.create({
      name,
      slug,
      description,
      permissions,
      isSystem: false,
      createdBy,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Role created successfully.",
        data: {
          id: String(role._id),
          _id: String(role._id),
          name: role.name,
          slug: role.slug,
          description:
            role.description || "",
          permissions:
            role.permissions || {},
          isSystem: Boolean(
            role.isSystem
          ),
          createdBy: role.createdBy
            ? String(
                role.createdBy
              )
            : null,
          createdAt:
            role.createdAt?.toISOString?.() ||
            null,
          updatedAt:
            role.updatedAt?.toISOString?.() ||
            null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "POST /api/admin/roles-permissions/roles error:",
      error
    );

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A role with this name or slug already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create role.",
      },
      { status: 500 }
    );
  }
}
