import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isOwnerRole,
  type PermissionAction,
  type PermissionMap,
  type PermissionModule,
} from "@/lib/permissions";

type SessionUser = {
  id?: string;
  _id?: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  adminRole?: string | null;
  status?: string | null;
  permissions?: PermissionMap | null;
};

export type AuthorizationResult = {
  authorized: boolean;
  user: SessionUser | null;
  response?: NextResponse;
};

/**
 * Get the currently authenticated user.
 */
export async function getCurrentAdmin(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return session.user as SessionUser;
}

/**
 * Check whether the configured owner account is the
 * authenticated active admin account.
 *
 * IMPORTANT:
 * The email alone is NOT enough.
 * The account must also be an admin/owner account.
 */
export function isConfiguredOwner(
  user: SessionUser | null | undefined
): boolean {
  if (!user) {
    return false;
  }

  const configuredOwnerEmail =
    process.env.ADMIN_OWNER_EMAIL
      ?.trim()
      .toLowerCase();

  if (!configuredOwnerEmail) {
    return false;
  }

  const userEmail =
    user.email?.trim().toLowerCase();

  if (!userEmail || userEmail !== configuredOwnerEmail) {
    return false;
  }

  const role = String(
    user.role || ""
  ).toLowerCase();

  const adminRole = String(
    user.adminRole || ""
  ).toLowerCase();

  const isAdminAccount =
    role === "admin" ||
    role === "owner" ||
    role === "super_admin" ||
    role === "super-admin" ||
    adminRole === "admin" ||
    adminRole === "owner" ||
    adminRole === "super_admin" ||
    adminRole === "super-admin";

  if (!isAdminAccount) {
    return false;
  }

  if (
    user.status &&
    user.status !== "active"
  ) {
    return false;
  }

  return true;
}

/**
 * Check whether a user is an Owner/Super Admin.
 *
 * Explicit owner/super-admin roles always work.
 * The configured owner email also works, but only for
 * an active admin account.
 */
export function isOwnerUser(
  user: SessionUser | null | undefined
): boolean {
  if (!user) {
    return false;
  }

  return (
    isOwnerRole(
      user.role,
      user.adminRole
    ) ||
    isConfiguredOwner(user)
  );
}

/**
 * Check whether the current user is authenticated.
 */
export async function requireAuth(): Promise<AuthorizationResult> {
  const user = await getCurrentAdmin();

  if (!user) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true,
    user,
  };
}

/**
 * Check whether the current user is an active admin.
 */
export async function requireAdmin(): Promise<AuthorizationResult> {
  const user = await getCurrentAdmin();

  if (!user) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      ),
    };
  }

  const admin =
    user.role === "admin" ||
    user.role === "owner" ||
    user.adminRole === "admin" ||
    user.adminRole === "owner" ||
    user.adminRole === "super_admin" ||
    user.adminRole === "super-admin";

  if (!admin) {
    return {
      authorized: false,
      user,
      response: NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      ),
    };
  }

  if (
    user.status &&
    user.status !== "active"
  ) {
    return {
      authorized: false,
      user,
      response: NextResponse.json(
        {
          success: false,
          message:
            "Your admin account is not active.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user,
  };
}

/**
 * Check whether the current user is the Owner/Super Admin.
 */
export async function requireOwner(): Promise<AuthorizationResult> {
  const user = await getCurrentAdmin();

  if (!user) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      ),
    };
  }

  if (
    user.status &&
    user.status !== "active"
  ) {
    return {
      authorized: false,
      user,
      response: NextResponse.json(
        {
          success: false,
          message:
            "Your admin account is not active.",
        },
        { status: 403 }
      ),
    };
  }

  if (!isOwnerUser(user)) {
    return {
      authorized: false,
      user,
      response: NextResponse.json(
        {
          success: false,
          message: "Owner access required.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user,
  };
}

/**
 * Check one permission.
 *
 * Owner automatically has all permissions.
 */
export async function requirePermission(
  module: PermissionModule,
  action: PermissionAction
): Promise<AuthorizationResult> {
  const result = await requireAdmin();

  if (!result.authorized || !result.user) {
    return result;
  }

  const user = result.user;

  if (isOwnerUser(user)) {
    return {
      authorized: true,
      user,
    };
  }

  if (
    hasPermission(
      user.permissions,
      module,
      action
    )
  ) {
    return {
      authorized: true,
      user,
    };
  }

  return {
    authorized: false,
    user,
    response: NextResponse.json(
      {
        success: false,
        message:
          "You do not have permission to perform this action.",
        code: "FORBIDDEN",
        requiredPermission: {
          module,
          action,
        },
      },
      { status: 403 }
    ),
  };
}

/**
 * Check multiple permissions.
 *
 * Every permission must be available.
 */
export async function requireAllPermissions(
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): Promise<AuthorizationResult> {
  const result = await requireAdmin();

  if (!result.authorized || !result.user) {
    return result;
  }

  const user = result.user;

  if (isOwnerUser(user)) {
    return {
      authorized: true,
      user,
    };
  }

  if (
    hasAllPermissions(
      user.permissions,
      requiredPermissions
    )
  ) {
    return {
      authorized: true,
      user,
    };
  }

  return {
    authorized: false,
    user,
    response: NextResponse.json(
      {
        success: false,
        message:
          "You do not have all required permissions.",
        code: "FORBIDDEN",
      },
      { status: 403 }
    ),
  };
}

/**
 * Check whether the user has at least one
 * of the requested permissions.
 */
export async function requireAnyPermission(
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): Promise<AuthorizationResult> {
  const result = await requireAdmin();

  if (!result.authorized || !result.user) {
    return result;
  }

  const user = result.user;

  if (isOwnerUser(user)) {
    return {
      authorized: true,
      user,
    };
  }

  if (
    hasAnyPermission(
      user.permissions,
      requiredPermissions
    )
  ) {
    return {
      authorized: true,
      user,
    };
  }

  return {
    authorized: false,
    user,
    response: NextResponse.json(
      {
        success: false,
        message:
          "You do not have the required permission.",
        code: "FORBIDDEN",
      },
      { status: 403 }
    ),
  };
}

/**
 * Utility for API routes.
 */
export async function authorize(
  module: PermissionModule,
  action: PermissionAction
) {
  return requirePermission(module, action);
}

/**
 * Check ownership/protection of another admin account.
 *
 * Prevents employees from modifying Owner accounts.
 */
export function canManageAdmin(
  currentUser: SessionUser,
  targetUser: SessionUser
): boolean {
  if (isOwnerUser(targetUser)) {
    return isOwnerUser(currentUser);
  }

  return true;
}

/**
 * Prevent an admin from modifying their own
 * sensitive RBAC permissions.
 */
export function canModifyOwnPermissions(
  currentUser: SessionUser,
  targetUserId: string
): boolean {
  const currentId = String(
    currentUser.id ||
      currentUser._id ||
      ""
  );

  return currentId !== String(targetUserId);
}

/**
 * Standard unauthorized response.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Unauthorized.",
    },
    { status: 401 }
  );
}

/**
 * Standard forbidden response.
 */
export function forbiddenResponse(
  message = "You do not have permission to perform this action."
) {
  return NextResponse.json(
    {
      success: false,
      message,
      code: "FORBIDDEN",
    },
    { status: 403 }
  );
}