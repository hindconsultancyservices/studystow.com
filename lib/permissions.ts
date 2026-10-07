/**
 * StudyStow – Central permission definition + pure authorization helpers.
 *
 * IMPORTANT:
 * - This file contains NO Next.js/database imports.
 * - It is safe to use from client UI code and server code.
 * - Do NOT treat role === "admin" as full access.
 * - Owner / Super Admin are the only implicit full-access roles.
 * - Every staff permission must be explicitly granted.
 */

// ============================================================
// MODULES
// ============================================================

export const PERMISSION_MODULES = [
  "dashboard",
  "books",
  "categories",
  "inventory",
  "orders",
  "customers",
  "coupons",
  "reviews",
  "pages",
  "reports",
  "payments",
  "adminUsers",
  "settings",
  "analytics",
  "contact",
  "auditLogs",
] as const;

export type PermissionModule =
  (typeof PERMISSION_MODULES)[number];

// ============================================================
// ACTIONS
// ============================================================

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "update",
  "invite",
  "suspend",
  "remove",
  "cancel",
  "refund",
] as const;

export type PermissionAction =
  (typeof PERMISSION_ACTIONS)[number];

// ============================================================
// CANONICAL PERMISSION MAP
// ============================================================

export type PermissionMap = Partial<
  Record<
    PermissionModule,
    Partial<Record<PermissionAction, boolean>>
  >
>;

/**
 * The Roles & Permissions page historically used arrays such as:
 *   books: ["view", "edit"]
 *
 * MongoDB/user records may use objects such as:
 *   books: { view: true, edit: true }
 *
 * We support both shapes so older records do not silently lose access.
 */
export type PermissionInput =
  | PermissionMap
  | Record<string, string[]>
  | Record<string, Record<string, boolean | unknown>>
  | null
  | undefined;

// ============================================================
// UI / DATABASE CONFIGURATION
// ============================================================

export const PERMISSION_CONFIG = [
  {
    module: "dashboard",
    label: "Dashboard",
    actions: ["view"],
  },
  {
    module: "books",
    label: "Books",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "categories",
    label: "Categories",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "inventory",
    label: "Inventory",
    actions: ["view", "update"],
  },
  {
    module: "orders",
    label: "Orders",
    actions: ["view", "update", "cancel", "refund"],
  },
  {
    module: "customers",
    label: "Customers",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "coupons",
    label: "Coupons",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "reviews",
    label: "Reviews",
    actions: ["view", "edit", "delete"],
  },
  {
    module: "pages",
    label: "Pages / CMS",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    module: "reports",
    label: "Reports",
    actions: ["view"],
  },
  {
    module: "payments",
    label: "Payments",
    actions: ["view", "update", "refund"],
  },
  {
    module: "adminUsers",
    label: "Admin Users",
    actions: ["view", "invite", "edit", "suspend", "remove"],
  },
  {
    module: "settings",
    label: "Site Settings",
    actions: ["view", "edit"],
  },
  {
    module: "analytics",
    label: "Analytics",
    actions: ["view"],
  },
  {
    module: "contact",
    label: "Contact Messages",
    actions: ["view", "edit", "delete"],
  },
  {
    module: "auditLogs",
    label: "Audit Logs",
    actions: ["view"],
  },
] as const;

export const DEFAULT_PERMISSIONS: PermissionMap = {
  dashboard: { view: false },

  books: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },

  categories: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },

  inventory: {
    view: false,
    update: false,
  },

  orders: {
    view: false,
    update: false,
    cancel: false,
    refund: false,
  },

  customers: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },

  coupons: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },

  reviews: {
    view: false,
    edit: false,
    delete: false,
  },

  pages: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },

  reports: {
    view: false,
  },

  payments: {
    view: false,
    update: false,
    refund: false,
  },

  adminUsers: {
    view: false,
    invite: false,
    edit: false,
    suspend: false,
    remove: false,
  },

  settings: {
    view: false,
    edit: false,
  },

  analytics: {
    view: false,
  },

  contact: {
    view: false,
    edit: false,
    delete: false,
  },

  auditLogs: {
    view: false,
  },
};

// ============================================================
// ACTION DEPENDENCIES
// ============================================================

/**
 * These dependencies are useful for UI/page navigation only.
 * IMPORTANT: they do NOT make write permissions implicit.
 *
 * Example:
 * - edit does not grant delete.
 * - view does not grant edit.
 */
export const ACTION_DEPENDENCIES: Readonly<
  Partial<Record<PermissionAction, readonly PermissionAction[]>>
> = {
  create: ["view"],
  edit: ["view"],
  delete: ["view"],
  update: ["view"],
  cancel: ["view"],
  refund: ["view"],
  invite: ["view"],
  suspend: ["view"],
  remove: ["view"],
};

// ============================================================
// PROTECTED / OWNER ROLES
// ============================================================

export const PROTECTED_ADMIN_ROLE_SLUGS = [
  "owner",
  "super_admin",
  "super-admin",
  "superadmin",
] as const;

export type PermissionSubject = {
  role?: string | null;
  adminRole?: string | null;
  active?: boolean | null;
  status?: string | null;
  permissions?: PermissionInput;
  email?: string | null;
};

export function normalizeRole(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function isProtectedAdminRole(
  role?: string | null,
  adminRole?: string | null
): boolean {
  const normalizedRole = normalizeRole(role);
  const normalizedAdminRole = normalizeRole(adminRole);

  return (
    PROTECTED_ADMIN_ROLE_SLUGS.includes(
      normalizedRole as (typeof PROTECTED_ADMIN_ROLE_SLUGS)[number]
    ) ||
    PROTECTED_ADMIN_ROLE_SLUGS.includes(
      normalizedAdminRole as (typeof PROTECTED_ADMIN_ROLE_SLUGS)[number]
    )
  );
}

/**
 * Backward-compatible owner helper.
 * Super Admin is intentionally treated as unrestricted, matching the
 * existing StudyStow protected-role behavior.
 */
export function isOwnerRole(
  role?: string | null,
  adminRole?: string | null
): boolean {
  return isProtectedAdminRole(role, adminRole);
}

export function isAccountActive(
  subject: PermissionSubject
): boolean {
  const normalizedStatus = normalizeRole(subject.status);

  if (subject.active === false) {
    return false;
  }

  if (
    normalizedStatus === "suspended" ||
    normalizedStatus === "removed"
  ) {
    return false;
  }

  return true;
}

export function isAdminSubject(
  subject?: PermissionSubject | null
): boolean {
  if (!subject) {
    return false;
  }

  const role = normalizeRole(subject.role);
  const adminRole = normalizeRole(subject.adminRole);

  if (!isAccountActive(subject)) {
    return false;
  }

  return (
    role === "admin" ||
    isProtectedAdminRole(role, adminRole) ||
    adminRole === "admin"
  );
}

// ============================================================
// NORMALIZATION
// ============================================================

function getAllowedActions(
  module: PermissionModule
): readonly PermissionAction[] {
  return (
    PERMISSION_CONFIG.find(
      (item) => item.module === module
    )?.actions ?? []
  );
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

/**
 * Converts frontend arrays and MongoDB object maps into one clean shape.
 * Unknown modules/actions are discarded.
 */
export function sanitizePermissions(
  permissions: PermissionInput
): PermissionMap {
  if (!isRecord(permissions)) {
    return {};
  }

  const clean: PermissionMap = {};

  for (const module of PERMISSION_MODULES) {
    const source = permissions[module];
    const allowedActions = getAllowedActions(module);

    if (Array.isArray(source)) {
      const cleanActions: Partial<
        Record<PermissionAction, boolean>
      > = {};

      for (const action of allowedActions) {
        cleanActions[action] = source.includes(action);
      }

      clean[module] = cleanActions;
      continue;
    }

    if (isRecord(source)) {
      const cleanActions: Partial<
        Record<PermissionAction, boolean>
      > = {};

      for (const action of allowedActions) {
        cleanActions[action] = source[action] === true;
      }

      clean[module] = cleanActions;
    }
  }

  return clean;
}

/**
 * Explicit alias used by server routes/role APIs.
 */
export function normalizePermissions(
  permissions: PermissionInput
): PermissionMap {
  return sanitizePermissions(permissions);
}

export function clonePermissions(
  permissions: PermissionInput
): PermissionMap {
  return sanitizePermissions(
    JSON.parse(
      JSON.stringify(
        permissions ?? {}
      )
    ) as PermissionInput
  );
}

export function createEmptyPermissions(): PermissionMap {
  return clonePermissions(DEFAULT_PERMISSIONS);
}

// ============================================================
// OWNER PERMISSION SET
// ============================================================

export function getOwnerPermissions(): PermissionMap {
  const permissions: PermissionMap = {};

  for (const item of PERMISSION_CONFIG) {
    const actions: Partial<
      Record<PermissionAction, boolean>
    > = {};

    for (const action of item.actions) {
      actions[action] = true;
    }

    permissions[item.module] = actions;
  }

  return permissions;
}

// ============================================================
// EFFECTIVE PERMISSIONS
// ============================================================

/**
 * Calculates the effective permission set for a user.
 *
 * Owner/Super Admin bypasses stored permission maps.
 * Normal admins/staff MUST use their explicit permission map.
 */
export function getEffectivePermissions(
  subject?: PermissionSubject | null
): PermissionMap {
  if (!subject || !isAccountActive(subject)) {
    return {};
  }

  if (isOwnerRole(subject.role, subject.adminRole)) {
    return getOwnerPermissions();
  }

  if (!isAdminSubject(subject)) {
    return {};
  }

  return sanitizePermissions(subject.permissions);
}

// ============================================================
// CORE CHECKERS
// ============================================================

export function hasPermission(
  permissions: PermissionMap | PermissionInput,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  const clean = sanitizePermissions(permissions);

  if (clean[module]?.[action] !== true) {
    return false;
  }

  const dependencies = ACTION_DEPENDENCIES[action] ?? [];

  return dependencies.every(
    (dependency) => clean[module]?.[dependency] === true
  );
}

export function can(
  subject: PermissionSubject | null | undefined,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  const effective = getEffectivePermissions(subject);
  return hasPermission(effective, module, action);
}

export function hasAllPermissions(
  permissions: PermissionMap | PermissionInput,
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): boolean {
  const clean = sanitizePermissions(permissions);

  return requiredPermissions.every(
    ({ module, action }) =>
      hasPermission(clean, module, action)
  );
}

export function canAll(
  subject: PermissionSubject | null | undefined,
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): boolean {
  const effective = getEffectivePermissions(subject);
  return hasAllPermissions(effective, requiredPermissions);
}

export function hasAnyPermission(
  permissions: PermissionMap | PermissionInput,
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): boolean {
  const clean = sanitizePermissions(permissions);

  return requiredPermissions.some(
    ({ module, action }) =>
      hasPermission(clean, module, action)
  );
}

export function canAny(
  subject: PermissionSubject | null | undefined,
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): boolean {
  const effective = getEffectivePermissions(subject);
  return hasAnyPermission(effective, requiredPermissions);
}

// ============================================================
// STRUCTURED AUTHORIZATION RESULT
// ============================================================

export type PermissionCheckResult = {
  allowed: boolean;
  reason:
    | "allowed"
    | "unauthenticated"
    | "inactive"
    | "not_admin"
    | "permission_denied";
  module: PermissionModule;
  action: PermissionAction;
};

export function evaluatePermission(
  subject: PermissionSubject | null | undefined,
  module: PermissionModule,
  action: PermissionAction
): PermissionCheckResult {
  if (!subject) {
    return {
      allowed: false,
      reason: "unauthenticated",
      module,
      action,
    };
  }

  if (!isAccountActive(subject)) {
    return {
      allowed: false,
      reason: "inactive",
      module,
      action,
    };
  }

  if (!isAdminSubject(subject)) {
    return {
      allowed: false,
      reason: "not_admin",
      module,
      action,
    };
  }

  if (can(subject, module, action)) {
    return {
      allowed: true,
      reason: "allowed",
      module,
      action,
    };
  }

  return {
    allowed: false,
    reason: "permission_denied",
    module,
    action,
  };
}

// ============================================================
// HTTP METHOD → PERMISSION HELPER
// ============================================================

/**
 * Safe default mapping for REST-style admin APIs.
 * Complex operations such as refund/cancel MUST pass an explicit action.
 */
export function getActionForHttpMethod(
  method: string
): PermissionAction | null {
  switch (method.toUpperCase()) {
    case "GET":
      return "view";
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "edit";
    case "DELETE":
      return "delete";
    default:
      return null;
  }
}

// ============================================================
// FIELD-LEVEL SECURITY FOR SETTINGS
// ============================================================

/**
 * Site settings and owner/private security settings are intentionally
 * separated. These keys should never be returned to ordinary staff merely
 * because they have settings:view.
 */
export const OWNER_ONLY_SETTING_KEYS = [
  "adminName",
  "adminEmail",
  "ownerName",
  "ownerEmail",
  "ownerPhone",
  "smtpHost",
  "smtpPort",
  "smtpUser",
  "smtpPassword",
  "smtpFrom",
  "resendApiKey",
  "razorpayKeyId",
  "razorpayKeySecret",
  "razorpaySecret",
  "nextAuthSecret",
  "sessionSecret",
  "securityEmail",
  "loginProtection",
  "sessionDuration",
] as const;

export type OwnerOnlySettingKey =
  (typeof OWNER_ONLY_SETTING_KEYS)[number];

export function canReadSettingKey(
  subject: PermissionSubject | null | undefined,
  key: string
): boolean {
  if (
    OWNER_ONLY_SETTING_KEYS.includes(
      key as OwnerOnlySettingKey
    )
  ) {
    return isOwnerRole(
      subject?.role,
      subject?.adminRole
    );
  }

  return can(subject, "settings", "view");
}

export function canEditSettingKey(
  subject: PermissionSubject | null | undefined,
  key: string
): boolean {
  if (
    OWNER_ONLY_SETTING_KEYS.includes(
      key as OwnerOnlySettingKey
    )
  ) {
    return isOwnerRole(
      subject?.role,
      subject?.adminRole
    );
  }

  return can(subject, "settings", "edit");
}

/**
 * Removes owner-only fields from a settings object for staff.
 * It intentionally returns a new object and does not mutate the source.
 */
export function stripOwnerOnlySettings<T extends Record<string, unknown>>(
  subject: PermissionSubject | null | undefined,
  settings: T
): Partial<T> {
  const output: Record<string, unknown> = {
    ...settings,
  };

  if (isOwnerRole(subject?.role, subject?.adminRole)) {
    return output as Partial<T>;
  }

  for (const key of OWNER_ONLY_SETTING_KEYS) {
    delete output[key];
  }

  return output as Partial<T>;
}

// ============================================================
// ADMIN-USER SAFETY
// ============================================================

/**
 * A staff member must never be able to modify a protected owner account.
 */
export function canManageAdminUser(
  actor: PermissionSubject | null | undefined,
  target: PermissionSubject | null | undefined,
  action: "view" | "edit" | "suspend" | "remove"
): boolean {
  if (!can(actor, "adminUsers", action)) {
    return false;
  }

  if (
    isOwnerRole(target?.role, target?.adminRole)
  ) {
    return isOwnerRole(actor?.role, actor?.adminRole);
  }

  return true;
}

// ============================================================
// PERMISSION DIFFERENCE / AUDIT HELPERS
// ============================================================

export function listGrantedPermissions(
  permissions: PermissionInput
): Array<{
  module: PermissionModule;
  action: PermissionAction;
}> {
  const clean = sanitizePermissions(permissions);
  const result: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }> = [];

  for (const module of PERMISSION_MODULES) {
    const actions = clean[module] ?? {};

    for (const action of getAllowedActions(module)) {
      if (actions[action] === true) {
        result.push({ module, action });
      }
    }
  }

  return result;
}

export function diffPermissions(
  beforeInput: PermissionInput,
  afterInput: PermissionInput
): {
  granted: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>;
  revoked: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>;
} {
  const before = sanitizePermissions(beforeInput);
  const after = sanitizePermissions(afterInput);

  const granted: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }> = [];

  const revoked: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }> = [];

  for (const module of PERMISSION_MODULES) {
    for (const action of getAllowedActions(module)) {
      const wasGranted =
        before[module]?.[action] === true;
      const isGranted =
        after[module]?.[action] === true;

      if (!wasGranted && isGranted) {
        granted.push({ module, action });
      }

      if (wasGranted && !isGranted) {
        revoked.push({ module, action });
      }
    }
  }

  return { granted, revoked };
}

// ============================================================
// BACKWARD-COMPATIBLE LEGACY HELPERS
// ============================================================

export const isOwner = isOwnerRole;
export const isAdmin = isAdminSubject;
export const getEffectivePermissionMap = getEffectivePermissions;
