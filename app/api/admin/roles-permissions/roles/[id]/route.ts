import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { logFailure, logSuccess } from "@/lib/audit-log";
import connectDB from "@/lib/db";
import Role from "@/models/Role";
import User from "@/models/User";
import TeamInvitation from "@/models/TeamInvitation";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
    process.env.ADMIN_OWNER_EMAIL || "",
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

function getActorId(user: any): string | null {
  return (
    user?.id ||
    user?._id ||
    user?.userId ||
    null
  );
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isProtectedRole(role: any) {
  const slug = String(role?.slug || "")
    .trim()
    .toLowerCase();

  const name = String(role?.name || "")
    .trim()
    .toLowerCase();

  return (
    [
      "owner",
      "super-admin",
      "super_admin",
      "superadmin",
    ].includes(slug) ||
    [
      "owner",
      "super admin",
      "super_admin",
    ].includes(name)
  );
}

type PermissionMap = Record<
  string,
  Record<string, boolean>
>;

function normalizePermissions(
  value: unknown,
): PermissionMap {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const source = value as Record<
    string,
    unknown
  >;
  const normalized: PermissionMap = {};

  for (const [feature, featurePermissions] of Object.entries(source)) {
    if (
      !featurePermissions ||
      typeof featurePermissions !== "object" ||
      Array.isArray(featurePermissions)
    ) {
      continue;
    }

    const entries = featurePermissions as Record<
      string,
      unknown
    >;
    const permissions: Record<string, boolean> = {};

    for (const [permission, enabled] of Object.entries(entries)) {
      permissions[permission] = Boolean(enabled);
    }

    normalized[feature] = permissions;
  }

  return normalized;
}

function serializeRole(role: any) {
  return {
    id: String(role._id),
    _id: String(role._id),
    name: String(role.name || ""),
    slug: String(role.slug || ""),
    description: String(role.description || ""),
    permissions: role.permissions || {},
    isSystem: Boolean(role.isSystem),
    createdBy: role.createdBy
      ? String(role.createdBy)
      : null,
    createdAt: role.createdAt
      ? new Date(role.createdAt).toISOString()
      : null,
    updatedAt: role.updatedAt
      ? new Date(role.updatedAt).toISOString()
      : null,
  };
}

/* ============================================================
   PATCH
   Edit an existing role
============================================================ */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (!isOwner(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the owner can modify roles.",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role ID.",
        },
        { status: 400 },
      );
    }

    const body =
      await request.json().catch(() => null);

    const name =
      body?.name !== undefined
        ? String(body.name || "").trim()
        : undefined;

    const description =
      body?.description !== undefined
        ? String(body.description || "").trim()
        : undefined;

    const permissions =
      body?.permissions !== undefined
        ? normalizePermissions(body.permissions)
        : undefined;

    if (
      name !== undefined &&
      !name
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Role name is required.",
        },
        { status: 400 },
      );
    }

    if (
      name !== undefined &&
      name.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Role name cannot exceed 100 characters.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const role =
      await Role.findById(id);

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: "Role not found.",
        },
        { status: 404 },
      );
    }

    /*
     * System roles cannot be changed.
     * This keeps Owner / Super Admin protection intact.
     */
    if (role.isSystem || isProtectedRole(role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "System and protected roles cannot be modified.",
        },
        { status: 403 },
      );
    }

    const nextName =
      name !== undefined
        ? name
        : String(role.name || "");

    const nextSlug =
      name !== undefined
        ? createSlug(nextName)
        : String(role.slug || "");

    if (!nextSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a valid role name.",
        },
        { status: 400 },
      );
    }

    const protectedSlugs = [
      "owner",
      "super-admin",
      "super_admin",
      "superadmin",
    ];

    if (
      protectedSlugs.includes(nextSlug)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner/Super Admin roles are protected.",
        },
        { status: 403 },
      );
    }

    /*
     * Prevent duplicate role names/slugs.
     */
    const duplicate = await Role.findOne({
      _id: {
        $ne: role._id,
      },
      $or: [
        {
          name: {
            $regex: `^${nextName.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&",
            )}$`,
            $options: "i",
          },
        },
        {
          slug: nextSlug,
        },
      ],
    }).lean();

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A role with this name or slug already exists.",
        },
        { status: 409 },
      );
    }

    /*
     * Save only fields that were actually provided.
     */
    const previousName = String(role.name || "");
    const previousSlug = String(role.slug || "");

    role.name = nextName;
    role.slug = nextSlug;

    if (description !== undefined) {
      role.description = description;
    }

    if (permissions !== undefined) {
      role.permissions = permissions;
    }

    await role.save();

    /*
     * Keep existing assigned users synchronized.
     *
     * roleId remains the source of truth.
     * adminRole + permissions are refreshed as snapshots.
     */
    const assignedUsers =
      await User.find({
        roleId: role._id,
      });

    if (assignedUsers.length > 0) {
      for (const user of assignedUsers) {
        (user as any).adminRole =
          nextSlug;

        (user as any).permissions =
          role.permissions || {};

        await user.save();
      }
    }

    const updatedRole =
      await Role.findById(role._id).lean();

    const actorId = getActorId(
      session.user as any,
    );

    await logSuccess(request, {
      actor: actorId,
      action: "role_updated",
      resource: "role",
      resourceId: String(role._id),
      metadata: {
        nameBefore: previousName,
        nameAfter: nextName,
        slugBefore: previousSlug,
        slugAfter: nextSlug,
        descriptionChanged:
          description !== undefined,
        permissionsChanged:
          permissions !== undefined,
        permissions:
          permissions !== undefined
            ? permissions
            : role.permissions || {},
      },
    });

    if (permissions !== undefined) {
      await logSuccess(request, {
        actor: actorId,
        action: "permissions_changed",
        resource: "role",
        resourceId: String(role._id),
        metadata: {
          roleName: nextName,
          permissions,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Role updated successfully.",
        data: updatedRole
          ? serializeRole(updatedRole)
          : serializeRole(role),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(
      "PATCH /api/admin/roles-permissions/roles/[id] error:",
      error,
    );

    try {
      const failedSession = await getServerSession(authOptions);
      const failedUser = failedSession?.user as any;
      const { id: failedRoleId } = await context.params;

      await logFailure(request, {
        actor: getActorId(failedUser),
        action: "role_update_failed",
        resource: "role",
        resourceId: failedRoleId || null,
        metadata: {
          error:
            error instanceof Error
              ? error.message
              : String(error),
        },
      });
    } catch (auditError) {
      console.error(
        "Failed to write role update failure audit log:",
        auditError,
      );
    }

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A role with this name or slug already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update role.",
      },
      { status: 500 },
    );
  }
}

/* ============================================================
   DELETE
   Delete an existing custom role
============================================================ */

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (!isOwner(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the owner can delete roles.",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const role =
      await Role.findById(id);

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: "Role not found.",
        },
        { status: 404 },
      );
    }

    /*
     * Never delete system/protected roles.
     */
    if (role.isSystem || isProtectedRole(role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "System and protected roles cannot be deleted.",
        },
        { status: 403 },
      );
    }

    /*
     * Do not delete a role that is currently
     * assigned to real users.
     */
    const assignedUserCount =
      await User.countDocuments({
        roleId: role._id,
      });

    if (assignedUserCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            `This role is assigned to ${assignedUserCount} user${
              assignedUserCount === 1
                ? ""
                : "s"
            }. Reassign those users before deleting the role.`,
        },
        { status: 409 },
      );
    }

    /*
     * Do not orphan pending/sent invitations.
     */
    const pendingInvitationCount =
      await TeamInvitation.countDocuments({
        roleId: role._id,
        status: {
          $in: [
            "pending",
            "sent",
          ],
        },
      });

    if (pendingInvitationCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            `This role is attached to ${pendingInvitationCount} active invitation${
              pendingInvitationCount === 1
                ? ""
                : "s"
            }. Cancel or complete those invitations before deleting the role.`,
        },
        { status: 409 },
      );
    }

    const actorId = getActorId(
      session.user as any,
    );

    await Role.findByIdAndDelete(
      role._id,
    );

    await logSuccess(request, {
      actor: actorId,
      action: "role_deleted",
      resource: "role",
      resourceId: String(role._id),
      metadata: {
        name: role.name,
        slug: role.slug,
        description: role.description || "",
        assignedUserCount,
        pendingInvitationCount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Role deleted successfully.",
        data: {
          id: String(role._id),
          name: role.name,
          slug: role.slug,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "DELETE /api/admin/roles-permissions/roles/[id] error:",
      error,
    );

    try {
      const failedSession = await getServerSession(authOptions);
      const failedUser = failedSession?.user as any;
      const { id: failedRoleId } = await context.params;

      await logFailure(request, {
        actor: getActorId(failedUser),
        action: "role_delete_failed",
        resource: "role",
        resourceId: failedRoleId || null,
        metadata: {
          error:
            error instanceof Error
              ? error.message
              : String(error),
        },
      });
    } catch (auditError) {
      console.error(
        "Failed to write role deletion failure audit log:",
        auditError,
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete role.",
      },
      { status: 500 },
    );
  }
}