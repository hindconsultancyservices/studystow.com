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
] as const;

export type PermissionModule =
  (typeof PERMISSION_MODULES)[number];

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

export type PermissionMap = Partial<
  Record<
    PermissionModule,
    Partial<Record<PermissionAction, boolean>>
  >
>;

/**
 * Default permission structure.
 *
 * This is only the permission definition.
 * Actual permissions are stored per role/user in MongoDB.
 */
export const DEFAULT_PERMISSIONS: PermissionMap = {
  dashboard: {
    view: true,
  },

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
};

/**
 * Permissions shown in Roles & Permissions UI.
 */
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
    actions: [
      "view",
      "update",
      "cancel",
      "refund",
    ],
  },
  {
    module: "customers",
    label: "Customers",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
    ],
  },
  {
    module: "coupons",
    label: "Coupons",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
    ],
  },
  {
    module: "reviews",
    label: "Reviews",
    actions: [
      "view",
      "edit",
      "delete",
    ],
  },
  {
    module: "pages",
    label: "Pages / CMS",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
    ],
  },
  {
    module: "reports",
    label: "Reports",
    actions: ["view"],
  },
  {
    module: "payments",
    label: "Payments",
    actions: [
      "view",
      "update",
      "refund",
    ],
  },
  {
    module: "adminUsers",
    label: "Admin Users",
    actions: [
      "view",
      "invite",
      "edit",
      "suspend",
      "remove",
    ],
  },
  {
    module: "settings",
    label: "Site Settings",
    actions: ["view", "edit"],
  },
] as const;

/**
 * Check whether a permission exists.
 */
export function hasPermission(
  permissions: PermissionMap | null | undefined,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  if (!permissions) {
    return false;
  }

  return permissions[module]?.[action] === true;
}

/**
 * Check multiple permissions.
 * Every permission must be present.
 */
export function hasAllPermissions(
  permissions: PermissionMap | null | undefined,
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): boolean {
  return requiredPermissions.every(
    ({ module, action }) =>
      hasPermission(permissions, module, action)
  );
}

/**
 * Check multiple permissions.
 * At least one permission must be present.
 */
export function hasAnyPermission(
  permissions: PermissionMap | null | undefined,
  requiredPermissions: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>
): boolean {
  return requiredPermissions.some(
    ({ module, action }) =>
      hasPermission(permissions, module, action)
  );
}

/**
 * Convert permission map into a clean object.
 * Prevents unknown modules/actions from being stored.
 */
export function sanitizePermissions(
  permissions: unknown
): PermissionMap {
  if (
    !permissions ||
    typeof permissions !== "object" ||
    Array.isArray(permissions)
  ) {
    return {};
  }

  const input =
    permissions as Record<string, unknown>;

  const clean: PermissionMap = {};

  for (const module of PERMISSION_MODULES) {
    const moduleValue = input[module];

    if (
      !moduleValue ||
      typeof moduleValue !== "object" ||
      Array.isArray(moduleValue)
    ) {
      continue;
    }

    const actions =
      moduleValue as Record<string, unknown>;

    const allowedActions =
      PERMISSION_CONFIG.find(
        (item) => item.module === module
      )?.actions || [];

    const cleanActions: Partial<
      Record<PermissionAction, boolean>
    > = {};

    for (const action of allowedActions) {
      if (actions[action] === true) {
        cleanActions[action] = true;
      } else {
        cleanActions[action] = false;
      }
    }

    clean[module] = cleanActions;
  }

  return clean;
}

/**
 * Owner has unrestricted access.
 *
 * Use this together with hasPermission() in authorization
 * middleware/helpers.
 */
export function isOwnerRole(
  role?: string | null,
  adminRole?: string | null
): boolean {
  return (
    role === "owner" ||
    adminRole === "owner" ||
    adminRole === "super_admin"
  );
}

/**
 * Create a full permission set.
 * Useful when creating the Owner/Super Admin role.
 */
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