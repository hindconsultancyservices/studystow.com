/**
 * StudyStow – SERVER-SIDE admin authorization boundary.
 *
 * This is the file every protected admin API should call BEFORE touching
 * MongoDB. UI checks are helpful for UX, but this module is the security
 * boundary.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { parseDateRange } from "@/lib/reports/date-range";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import {
  can,
  evaluatePermission,
  getActionForHttpMethod,
  getEffectivePermissions,
  isAccountActive,
  isAdminSubject,
  isOwnerRole,
  normalizePermissions,
  type PermissionAction,
  type PermissionInput,
  type PermissionMap,
  type PermissionModule,
} from "@/lib/permissions";
import User from "@/models/User";
import Role from "@/models/Role";

// ============================================================
// TYPES
// ============================================================

export type AdminActor = {
  id: string;
  name: string;
  email: string;
  role: string;
  adminRole: string | null;
  roleId: string | null;
  status: string | null;
  active: boolean;
  permissions: PermissionMap;
  isOwner: boolean;
};

export type AuthorizationContext = {
  actor: AdminActor;
  permissions: PermissionMap;
};

export type AuthorizationFailure = {
  ok: false;
  response: NextResponse;
};

export type AuthorizationSuccess = {
  ok: true;
  context: AuthorizationContext;
};

export type AuthorizationResult =
  | AuthorizationSuccess
  | AuthorizationFailure;

// ============================================================
// PRIVATE HELPERS
// ============================================================

function stringValue(value: unknown): string {
  return String(value ?? "").trim();
}

function normalized(value: unknown): string {
  return stringValue(value)
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function getSessionUserId(user: any): string | null {
  const raw =
    user?.id ||
    user?._id ||
    user?.userId ||
    null;

  if (!raw) {
    return null;
  }

  const value = String(raw).trim();

  return value || null;
}

function getSessionEmail(user: any): string | null {
  const email = String(user?.email || "")
    .trim()
    .toLowerCase();

  return email || null;
}

function getOwnerEmail(): string | null {
  const email = String(
    process.env.ADMIN_OWNER_EMAIL || ""
  )
    .trim()
    .toLowerCase();

  return email || null;
}

function unauthorized(
  message = "Authentication required."
): AuthorizationFailure {
  return {
    ok: false,
    response: NextResponse.json(
      {
        success: false,
        code: "UNAUTHENTICATED",
        message,
      },
      { status: 401 }
    ),
  };
}

function forbidden(
  code: string,
  message: string,
  details?: Record<string, unknown>
): AuthorizationFailure {
  return {
    ok: false,
    response: NextResponse.json(
      {
        success: false,
        code,
        message,
        ...(details ? { details } : {}),
      },
      { status: 403 }
    ),
  };
}

async function findCurrentUser(
  sessionUser: any
): Promise<any | null> {
  await connectDB();

  const id = getSessionUserId(sessionUser);
  const email = getSessionEmail(sessionUser);

  if (id && mongoose.Types.ObjectId.isValid(id)) {
    const byId = await User.findById(id).lean();

    if (byId) {
      return byId;
    }
  }

  if (email) {
    return User.findOne({ email }).lean();
  }

  return null;
}

async function getFreshPermissionSource(
  user: any
): Promise<PermissionInput> {
  const userPermissions =
    normalizePermissions(user?.permissions);

  const roleId = user?.roleId
    ? String(user.roleId)
    : "";

  /**
   * Role permission is authoritative when roleId is present.
   * This prevents an old JWT/session permission snapshot from granting
   * access after the Owner changes a role.
   */
  if (
    roleId &&
    mongoose.Types.ObjectId.isValid(roleId)
  ) {
    try {
      const role = await Role.findById(roleId)
        .select("permissions slug isSystem")
        .lean();

      if (role) {
        return normalizePermissions(
          (role as any).permissions
        );
      }
    } catch (error) {
      /**
       * Fail closed. If the configured role cannot be read, do not fall
       * back to a potentially stale staff permission snapshot.
       */
      console.error(
        "Admin authorization role lookup failed:",
        error
      );

      return {};
    }
  }

  return userPermissions;
}

function buildActor(
  user: any,
  permissions: PermissionMap
): AdminActor {
  const role = stringValue(user?.role);
  const adminRole =
    user?.adminRole !== null &&
    user?.adminRole !== undefined
      ? stringValue(user.adminRole) || null
      : null;
  const status =
    user?.status !== null &&
    user?.status !== undefined
      ? stringValue(user.status) || null
      : null;

  const email =
    stringValue(user?.email).toLowerCase();

  const explicitOwner = isOwnerRole(
    role,
    adminRole
  );

  const envOwnerEmail =
    getOwnerEmail();

  const emailOwner =
    !!envOwnerEmail &&
    email === envOwnerEmail;

  const isOwner =
    explicitOwner ||
    emailOwner;

  return {
    id: String(user?._id || ""),
    name: stringValue(user?.name),
    email,
    role,
    adminRole,
    roleId: user?.roleId
      ? String(user.roleId)
      : null,
    status,
    active: user?.active !== false,
    permissions,
    isOwner,
  };
}

// ============================================================
// LOAD CURRENT ADMIN ACTOR
// ============================================================

export async function getCurrentAdminContext(): Promise<
  AuthorizationSuccess | AuthorizationFailure
> {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    return unauthorized();
  }

  const sessionUser = session.user as any;
  const user = await findCurrentUser(
    sessionUser
  );

  if (!user) {
    return unauthorized(
      "Your account could not be found."
    );
  }

  const status = normalized(user?.status);
  const active =
    user?.active !== false &&
    status !== "suspended" &&
    status !== "removed";

  if (!active) {
    return forbidden(
      "ACCOUNT_INACTIVE",
      "This administrator account is inactive."
    );
  }

  const role = normalized(user?.role);
  const adminRole = normalized(
    user?.adminRole
  );

  const ownerEmail =
    getOwnerEmail();

  const email = String(
    user?.email || ""
  )
    .trim()
    .toLowerCase();

  const isOwner =
    isOwnerRole(role, adminRole) ||
    (!!ownerEmail && email === ownerEmail);

  if (
    !isOwner &&
    !isAdminSubject({
      role,
      adminRole,
      active,
      status,
    })
  ) {
    return forbidden(
      "ADMIN_ACCESS_REQUIRED",
      "Administrator access is required."
    );
  }

  let permissions: PermissionMap;

  if (isOwner) {
    permissions = getEffectivePermissions({
      role: "owner",
      adminRole: "owner",
      active: true,
      status: "active",
    });
  } else {
    const source = await getFreshPermissionSource(
      user
    );

    permissions = normalizePermissions(
      source
    );
  }

  const actor = buildActor(
    user,
    permissions
  );

  return {
    ok: true,
    context: {
      actor,
      permissions,
    },
  };
}

// ============================================================
// PERMISSION GUARDS
// ============================================================

export async function requireAdminPermission(
  module: PermissionModule,
  action: PermissionAction
): Promise<AuthorizationResult> {
  const current =
    await getCurrentAdminContext();

  if (!current.ok) {
    return current;
  }

  const { actor, permissions } =
    current.context;

  if (actor.isOwner) {
    return current;
  }

  const result = evaluatePermission(
    actor,
    module,
    action
  );

  if (!result.allowed) {
    return forbidden(
      "PERMISSION_DENIED",
      `You do not have ${action} permission for ${module}.`,
      {
        module,
        action,
      }
    );
  }

  return {
    ok: true,
    context: {
      actor,
      permissions,
    },
  };
}

export async function requireAnyAdminPermission(
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): Promise<AuthorizationResult> {
  const current =
    await getCurrentAdminContext();

  if (!current.ok) {
    return current;
  }

  if (current.context.actor.isOwner) {
    return current;
  }

  const allowed = requiredPermissions.some(
    ({ module, action }) =>
      can(current.context.actor, module, action)
  );

  if (!allowed) {
    return forbidden(
      "PERMISSION_DENIED",
      "You do not have permission to perform this action.",
      {
        requiredPermissions,
      }
    );
  }

  return current;
}

export async function requireAllAdminPermissions(
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): Promise<AuthorizationResult> {
  const current =
    await getCurrentAdminContext();

  if (!current.ok) {
    return current;
  }

  if (current.context.actor.isOwner) {
    return current;
  }

  const allowed = requiredPermissions.every(
    ({ module, action }) =>
      can(current.context.actor, module, action)
  );

  if (!allowed) {
    return forbidden(
      "PERMISSION_DENIED",
      "You do not have all required permissions.",
      {
        requiredPermissions,
      }
    );
  }

  return current;
}

/**
 * REST convenience guard. Use explicit action for non-standard endpoints.
 */
export async function requireRequestPermission(
  request: Request,
  module: PermissionModule,
  explicitAction?: PermissionAction
): Promise<AuthorizationResult> {
  const action =
    explicitAction ||
    getActionForHttpMethod(
      request.method
    );

  if (!action) {
    return forbidden(
      "METHOD_NOT_SUPPORTED",
      "This request method is not supported for permission checking."
    );
  }

  return requireAdminPermission(
    module,
    action
  );
}

/**
 * Owner-only guard for role management, owner identity/security settings,
 * and other business-critical operations.
 */
export async function requireOwner(): Promise<
  AuthorizationResult
> {
  const current =
    await getCurrentAdminContext();

  if (!current.ok) {
    return current;
  }

  if (!current.context.actor.isOwner) {
    return forbidden(
      "OWNER_ONLY",
      "Only the StudyStow owner can perform this action."
    );
  }

  return current;
}

// ============================================================
// SMALL RESPONSE HELPERS
// ============================================================

export function isAuthorizationFailure(
  result: AuthorizationResult
): result is AuthorizationFailure {
  return result.ok === false;
}

export function isAuthorizationSuccess(
  result: AuthorizationResult
): result is AuthorizationSuccess {
  return result.ok === true;
}
