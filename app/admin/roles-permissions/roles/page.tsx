"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  Filter,
  Info,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";

type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "update"
  | "cancel"
  | "refund"
  | "invite"
  | "suspend"
  | "remove";

type PermissionMap = Record<
  string,
  PermissionAction[]
>;

type BackendPermissionValue =
  | PermissionAction[]
  | Record<string, boolean>;

type BackendPermissionMap = Record<
  string,
  BackendPermissionValue
>;

type Role = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions?: BackendPermissionMap;
  isSystem?: boolean;
  createdBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

type UserRecord = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  adminRole?: string | null;
  roleId?: string | null;
  roleData?: {
    _id?: string;
    name?: string;
  } | null;
  isOwner?: boolean;
  status?: string;
};

type UsersResponse = {
  success: boolean;
  data: UserRecord[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type RolesResponse = {
  success: boolean;
  data: Role[];
  message?: string;
};

type PermissionModule = {
  key: string;
  label: string;
  description: string;
  actions: readonly PermissionAction[];
};

type RoleFormState = {
  name: string;
  description: string;
  permissions: PermissionMap;
};

type RoleFilter =
  | "all"
  | "custom"
  | "system";

type RoleSort =
  | "name"
  | "permissions"
  | "newest"
  | "oldest";

const PERMISSION_MODULES: readonly PermissionModule[] =
  [
    {
      key: "dashboard",
      label: "Dashboard",
      description:
        "Main administration dashboard access.",
      actions: ["view"],
    },
    {
      key: "books",
      label: "Books",
      description:
        "Manage the StudyStow book catalogue.",
      actions: [
        "view",
        "create",
        "edit",
        "delete",
      ],
    },
    {
      key: "categories",
      label: "Categories",
      description:
        "Manage book categories and organization.",
      actions: [
        "view",
        "create",
        "edit",
        "delete",
      ],
    },
    {
      key: "inventory",
      label: "Inventory",
      description:
        "Manage stock and inventory updates.",
      actions: [
        "view",
        "update",
      ],
    },
    {
      key: "orders",
      label: "Orders",
      description:
        "Manage customer orders and order lifecycle.",
      actions: [
        "view",
        "update",
        "cancel",
        "refund",
      ],
    },
    {
      key: "customers",
      label: "Customers",
      description:
        "Manage customer records.",
      actions: [
        "view",
        "create",
        "edit",
        "delete",
      ],
    },
    {
      key: "coupons",
      label: "Coupons",
      description:
        "Create and manage discount coupons.",
      actions: [
        "view",
        "create",
        "edit",
        "delete",
      ],
    },
    {
      key: "reviews",
      label: "Reviews",
      description:
        "Moderate and manage customer reviews.",
      actions: [
        "view",
        "edit",
        "delete",
      ],
    },
    {
      key: "pages",
      label: "Pages / CMS",
      description:
        "Manage static pages and CMS content.",
      actions: [
        "view",
        "create",
        "edit",
        "delete",
      ],
    },
    {
      key: "reports",
      label: "Reports",
      description:
        "View operational and business reports.",
      actions: ["view"],
    },
    {
      key: "payments",
      label: "Payments",
      description:
        "View and manage payment-related actions.",
      actions: [
        "view",
        "update",
        "refund",
      ],
    },
    {
      key: "adminUsers",
      label: "Admin Users",
      description:
        "Manage invited administrators and access.",
      actions: [
        "view",
        "invite",
        "edit",
        "suspend",
        "remove",
      ],
    },
    {
      key: "settings",
      label: "Site Settings",
      description:
        "Manage administrative site settings.",
      actions: [
        "view",
        "edit",
      ],
    },
  ];

const ACTION_LABELS: Record<
  PermissionAction,
  string
> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  update: "Update",
  cancel: "Cancel",
  refund: "Refund",
  invite: "Invite",
  suspend: "Suspend",
  remove: "Remove",
};

function createEmptyPermissions(): PermissionMap {
  const permissions: PermissionMap = {};

  for (const module of PERMISSION_MODULES) {
    permissions[module.key] = [];
  }

  return permissions;
}

/**
 * Supports BOTH formats:
 *
 * {
 *   books: ["view", "create"]
 * }
 *
 * and:
 *
 * {
 *   books: {
 *     view: true,
 *     create: true,
 *     edit: false
 *   }
 * }
 *
 * This is important because the existing MongoDB role data
 * can contain object-based permissions.
 */
function normalizePermissions(
  permissions?:
    | BackendPermissionMap
    | PermissionMap
    | null,
): PermissionMap {
  const normalized =
    createEmptyPermissions();

  if (!permissions) {
    return normalized;
  }

  for (const module of PERMISSION_MODULES) {
    const current =
      permissions[module.key];

    if (Array.isArray(current)) {
      normalized[module.key] =
        module.actions.filter(
          (action) =>
            current.includes(
              action,
            ),
        ) as PermissionAction[];

      continue;
    }

    if (
      current &&
      typeof current ===
        "object"
    ) {
      normalized[module.key] =
        module.actions.filter(
          (action) =>
            Boolean(
              (
                current as Record<
                  string,
                  boolean
                >
              )[action],
            ),
        ) as PermissionAction[];
    }
  }

  return normalized;
}

/**
 * Convert frontend arrays to the backend's
 * object-of-booleans representation.
 */
function toApiPermissions(
  permissions: PermissionMap,
): Record<
  string,
  Record<string, boolean>
> {
  const output: Record<
    string,
    Record<string, boolean>
  > = {};

  for (const module of PERMISSION_MODULES) {
    const selected =
      permissions[module.key] || [];

    const actions: Record<
      string,
      boolean
    > = {};

    for (const action of module.actions) {
      actions[action] =
        selected.includes(
          action as PermissionAction,
        );
    }

    output[module.key] =
      actions;
  }

  return output;
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function slugPreview(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(
      /^-+|-+$/g,
      "",
    );
}

function getPermissionCount(
  permissions:
    | BackendPermissionMap
    | PermissionMap
    | null
    | undefined,
) {
  const normalized =
    normalizePermissions(
      permissions,
    );

  return Object.values(
    normalized,
  ).reduce(
    (total, actions) =>
      total + actions.length,
    0,
  );
}

function getTotalPermissionCount() {
  return PERMISSION_MODULES.reduce(
    (total, module) =>
      total + module.actions.length,
    0,
  );
}

function getModulePermissionCount(
  permissions: PermissionMap,
  moduleKey: string,
) {
  return (
    permissions[moduleKey]
      ?.length || 0
  );
}

function isModuleFullySelected(
  permissions: PermissionMap,
  module: PermissionModule,
) {
  const selected =
    permissions[module.key] || [];

  return (
    module.actions.length >
      0 &&
    module.actions.every(
      (action) =>
        selected.includes(
          action as PermissionAction,
        ),
    )
  );
}

function isModulePartiallySelected(
  permissions: PermissionMap,
  module: PermissionModule,
) {
  const selected =
    permissions[module.key] || [];

  return (
    selected.length > 0 &&
    selected.length <
      module.actions.length
  );
}

export default function RolesPage() {
  const [roles, setRoles] =
    useState<Role[]>([]);

  const [users, setUsers] =
    useState<UserRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [usersLoading, setUsersLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("all");

  const [sortBy, setSortBy] =
    useState<RoleSort>(
      "newest",
    );

  const [
    permissionSearch,
    setPermissionSearch,
  ] = useState("");

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<Role | null>(
    null,
  );

  const [
    editingRole,
    setEditingRole,
  ] = useState<Role | null>(
    null,
  );

  const [
    showRoleModal,
    setShowRoleModal,
  ] = useState(false);

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  const [roleForm, setRoleForm] =
    useState<RoleFormState>({
      name: "",
      description: "",
      permissions:
        createEmptyPermissions(),
    });

  const [
    expandedModules,
    setExpandedModules,
  ] = useState<
    Record<string, boolean>
  >({});

  const fetchRoles =
    useCallback(async () => {
      const response = await fetch(
        "/api/admin/roles-permissions/roles",
        {
          method: "GET",
          credentials:
            "include",
          cache: "no-store",
          headers: {
            Accept:
              "application/json",
          },
        },
      );

      const data: RolesResponse =
        await response
          .json()
          .catch(() => ({
            success: false,
            data: [],
            message:
              "Invalid server response.",
          }));

      if (
        response.status ===
        401
      ) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (
        response.status ===
        403
      ) {
        throw new Error(
          "You do not have permission to manage roles.",
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load roles.",
        );
      }

      setRoles(
        Array.isArray(
          data.data,
        )
          ? data.data
          : [],
      );
    }, []);

  const fetchUsers =
    useCallback(async () => {
      try {
        setUsersLoading(true);

        const response =
          await fetch(
            "/api/admin/roles-permissions?type=users&page=1&limit=1000",
            {
              method: "GET",
              credentials:
                "include",
              cache: "no-store",
              headers: {
                Accept:
                  "application/json",
              },
            },
          );

        const data: UsersResponse =
          await response
            .json()
            .catch(() => ({
              success: false,
              data: [],
              message:
                "Invalid server response.",
            }));

        if (
          response.status ===
          401
        ) {
          throw new Error(
            "Your session has expired.",
          );
        }

        if (
          response.status ===
          403
        ) {
          throw new Error(
            "You do not have permission to view users.",
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load users.",
          );
        }

        setUsers(
          Array.isArray(
            data.data,
          )
            ? data.data
            : [],
        );
      } catch (err) {
        console.error(
          "Role user-count loading error:",
          err,
        );

        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    }, []);

  const loadData =
    useCallback(async () => {
      try {
        setError("");
        setLoading(true);

        await Promise.all([
          fetchRoles(),
          fetchUsers(),
        ]);
      } catch (err) {
        console.error(
          "Roles page error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load roles.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      fetchRoles,
      fetchUsers,
    ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const roleUserCounts =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      for (const user of users) {
        const roleId =
          user.roleId ||
          user.roleData?._id ||
          null;

        if (roleId) {
          counts[roleId] =
            (counts[roleId] ||
              0) + 1;
        }
      }

      return counts;
    }, [users]);

  const customRoleCount =
    useMemo(
      () =>
        roles.filter(
          (role) =>
            !role.isSystem,
        ).length,
      [roles],
    );

  const systemRoleCount =
    useMemo(
      () =>
        roles.filter(
          (role) =>
            Boolean(
              role.isSystem,
            ),
        ).length,
      [roles],
    );

  const assignedUserCount =
    useMemo(() => {
      return users.filter(
        (user) => {
          return Boolean(
            user.roleId ||
              user.roleData?._id ||
              user.adminRole,
          );
        },
      ).length;
    }, [users]);

  const totalPermissionCount =
    getTotalPermissionCount();

  const filteredRoles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const filtered =
        roles.filter((role) => {
          const matchesSearch =
            !query ||
            role.name
              .toLowerCase()
              .includes(query) ||
            role.slug
              .toLowerCase()
              .includes(query) ||
            String(
              role.description ||
                "",
            )
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            roleFilter ===
              "all" ||
            (roleFilter ===
              "system" &&
              Boolean(
                role.isSystem,
              )) ||
            (roleFilter ===
              "custom" &&
              !role.isSystem);

          return (
            matchesSearch &&
            matchesFilter
          );
        });

      return [...filtered].sort(
        (a, b) => {
          if (
            sortBy ===
            "permissions"
          ) {
            return (
              getPermissionCount(
                b.permissions,
              ) -
              getPermissionCount(
                a.permissions,
              )
            );
          }

          if (
            sortBy ===
            "name"
          ) {
            return a.name.localeCompare(
              b.name,
            );
          }

          if (
            sortBy ===
            "oldest"
          ) {
            return (
              new Date(
                a.createdAt ||
                  0,
              ).getTime() -
              new Date(
                b.createdAt ||
                  0,
              ).getTime()
            );
          }

          return (
            new Date(
              b.createdAt ||
                0,
            ).getTime() -
            new Date(
              a.createdAt ||
                0,
            ).getTime()
          );
        },
      );
    }, [
      roles,
      search,
      roleFilter,
      sortBy,
    ]);

  const filteredPermissionModules =
    useMemo(() => {
      const query =
        permissionSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return PERMISSION_MODULES;
      }

      return PERMISSION_MODULES.filter(
        (module) =>
          module.label
            .toLowerCase()
            .includes(query) ||
          module.key
            .toLowerCase()
            .includes(query) ||
          module.description
            .toLowerCase()
            .includes(query) ||
          module.actions.some(
            (action) =>
              ACTION_LABELS[
                action
              ]
                .toLowerCase()
                .includes(query),
          ),
      );
    }, [permissionSearch]);

  const selectedPermissionCount =
    useMemo(
      () =>
        Object.values(
          roleForm.permissions,
        ).reduce(
          (total, actions) =>
            total +
            actions.length,
          0,
        ),
      [roleForm.permissions],
    );

  const permissionCoverage =
    totalPermissionCount > 0
      ? Math.round(
          (selectedPermissionCount /
            totalPermissionCount) *
            100,
        )
      : 0;

  const openCreateRole =
    () => {
      setEditingRole(null);

      setRoleForm({
        name: "",
        description: "",
        permissions:
          createEmptyPermissions(),
      });

      setPermissionSearch("");

      const initialExpanded: Record<
        string,
        boolean
      > = {};

      PERMISSION_MODULES.forEach(
        (module, index) => {
          initialExpanded[
            module.key
          ] = index < 4;
        },
      );

      setExpandedModules(
        initialExpanded,
      );

      setError("");
      setShowRoleModal(true);
    };

  const openEditRole = (
    role: Role,
  ) => {
    if (role.isSystem) {
      setError(
        "System roles are protected and cannot be edited here.",
      );
      return;
    }

    setEditingRole(role);

    setRoleForm({
      name: role.name,
      description:
        role.description ||
        "",
      permissions:
        normalizePermissions(
          role.permissions,
        ),
    });

    setPermissionSearch("");

    const initialExpanded: Record<
      string,
      boolean
    > = {};

    PERMISSION_MODULES.forEach(
      (module) => {
        initialExpanded[
          module.key
        ] = true;
      },
    );

    setExpandedModules(
      initialExpanded,
    );

    setError("");
    setShowRoleModal(true);
  };

  const duplicateRole = (
    role: Role,
  ) => {
    setEditingRole(null);

    setRoleForm({
      name: `${role.name} Copy`,
      description:
        role.description
          ? `${role.description} (copied)`
          : "",
      permissions:
        normalizePermissions(
          role.permissions,
        ),
    });

    setPermissionSearch("");

    const initialExpanded: Record<
      string,
      boolean
    > = {};

    PERMISSION_MODULES.forEach(
      (module) => {
        initialExpanded[
          module.key
        ] = true;
      },
    );

    setExpandedModules(
      initialExpanded,
    );

    setSelectedRole(null);
    setShowRoleModal(true);
  };

  const viewRole = (
    role: Role,
  ) => {
    setSelectedRole(role);
    setShowDetails(true);
  };

  const togglePermission =
    (
      moduleKey: string,
      action: PermissionAction,
    ) => {
      setRoleForm(
        (current) => {
          const currentActions =
            current.permissions[
              moduleKey
            ] || [];

          const exists =
            currentActions.includes(
              action,
            );

          return {
            ...current,
            permissions: {
              ...current.permissions,
              [moduleKey]:
                exists
                  ? currentActions.filter(
                      (
                        item,
                      ) =>
                        item !==
                        action,
                    )
                  : [
                      ...currentActions,
                      action,
                    ],
            },
          };
        },
      );
    };

  const toggleModule =
    (
      module: PermissionModule,
    ) => {
      setRoleForm(
        (current) => {
          const isSelected =
            isModuleFullySelected(
              current.permissions,
              module,
            );

          return {
            ...current,
            permissions: {
              ...current.permissions,
              [module.key]:
                isSelected
                  ? []
                  : [
                      ...module.actions,
                    ] as PermissionAction[],
            },
          };
        },
      );
    };

  const toggleAllVisible =
    () => {
      const allVisibleSelected =
        filteredPermissionModules.every(
          (module) =>
            isModuleFullySelected(
              roleForm.permissions,
              module,
            ),
        );

      setRoleForm(
        (current) => {
          const next = {
            ...current.permissions,
          };

          for (const module of filteredPermissionModules) {
            next[module.key] =
              allVisibleSelected
                ? []
                : [
                    ...module.actions,
                  ] as PermissionAction[];
          }

          return {
            ...current,
            permissions: next,
          };
        },
      );
    };

  const clearAllPermissions =
    () => {
      setRoleForm(
        (current) => ({
          ...current,
          permissions:
            createEmptyPermissions(),
        }),
      );
    };

  const selectRecommendedReadOnly =
    () => {
      const next =
        createEmptyPermissions();

      for (const module of PERMISSION_MODULES) {
        if (
          module.actions.includes(
            "view",
          )
        ) {
          next[module.key] =
            ["view"];
        }
      }

      setRoleForm(
        (current) => ({
          ...current,
          permissions: next,
        }),
      );
    };

  const saveRole = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const name =
      roleForm.name.trim();

    const description =
      roleForm.description.trim();

    if (!name) {
      setError(
        "Role name is required.",
      );
      return;
    }

    if (name.length > 100) {
      setError(
        "Role name cannot exceed 100 characters.",
      );
      return;
    }

    if (description.length > 500) {
      setError(
        "Description cannot exceed 500 characters.",
      );
      return;
    }

    if (
      selectedPermissionCount ===
      0
    ) {
      const confirmed =
        window.confirm(
          "This role has no permissions. Create it anyway?",
        );

      if (!confirmed) {
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const endpoint =
        editingRole
          ? `/api/admin/roles-permissions/roles/${editingRole._id}`
          : "/api/admin/roles-permissions/roles";

      const method =
        editingRole
          ? "PATCH"
          : "POST";

      const response =
        await fetch(
          endpoint,
          {
            method,
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            credentials:
              "include",
            body: JSON.stringify(
              {
                name,
                description,
                permissions:
                  toApiPermissions(
                    roleForm.permissions,
                  ),
              },
            ),
          },
        );

      const data =
        await response
          .json()
          .catch(
            () => null,
          );

      if (
        response.status ===
        401
      ) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (
        response.status ===
        403
      ) {
        throw new Error(
          data?.message ||
            "You do not have permission to modify roles.",
        );
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to save role.",
        );
      }

      setShowRoleModal(
        false,
      );

      setEditingRole(null);

      await fetchRoles();
    } catch (err) {
      console.error(
        "Save role error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save role.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (
    role: Role,
  ) => {
    if (role.isSystem) {
      setError(
        "System roles cannot be deleted.",
      );
      return;
    }

    const assignedUsers =
      roleUserCounts[
        role._id
      ] || 0;

    const warning =
      assignedUsers > 0
        ? `Role "${role.name}" is assigned to ${assignedUsers} user${
            assignedUsers === 1
              ? ""
              : "s"
          }. The server may prevent deletion until those users are reassigned. Continue?`
        : `Delete role "${role.name}"?`;

    if (
      !window.confirm(
        warning,
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch(
          `/api/admin/roles-permissions/roles/${role._id}`,
          {
            method: "DELETE",
            credentials:
              "include",
            headers: {
              Accept:
                "application/json",
            },
          },
        );

      const data =
        await response
          .json()
          .catch(
            () => null,
          );

      if (
        response.status ===
        401
      ) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (
        response.status ===
        403
      ) {
        throw new Error(
          data?.message ||
            "You do not have permission to delete roles.",
        );
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to delete role.",
        );
      }

      if (
        selectedRole?._id ===
        role._id
      ) {
        setSelectedRole(
          null,
        );
        setShowDetails(false);
      }

      await fetchRoles();
    } catch (err) {
      console.error(
        "Delete role error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete role.",
      );
    } finally {
      setSaving(false);
    }
  };

  const copySlug = async (
    slug: string,
  ) => {
    try {
      await navigator.clipboard.writeText(
        slug,
      );

      setError(
        "Role slug copied.",
      );

      window.setTimeout(
        () => {
          setError("");
        },
        1500,
      );
    } catch {
      setError(
        "Unable to copy role slug.",
      );
    }
  };

  const handleRefresh =
    () => {
      setError("");
      void loadData();
    };

  const allVisibleSelected =
    filteredPermissionModules.length >
      0 &&
    filteredPermissionModules.every(
      (module) =>
        isModuleFullySelected(
          roleForm.permissions,
          module,
        ),
    );

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-900" />

            <h2 className="text-lg font-semibold text-slate-900">
              Role Management
            </h2>
          </div>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Build custom administrator roles and control
            exactly which parts of the StudyStow dashboard
            each role can access.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              loading ||
              saving
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={
              openCreateRole
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <AlertTriangle className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Role management
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Roles
            </span>

            <Layers3 className="h-4 w-4 text-slate-400" />
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {roles.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Roles stored in MongoDB
          </p>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Custom
            </span>

            <Settings2 className="h-4 w-4 text-indigo-500" />
          </div>

          <p className="mt-3 text-2xl font-bold text-indigo-900">
            {customRoleCount}
          </p>

          <p className="mt-1 text-xs text-indigo-700/70">
            Owner-created roles
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              System
            </span>

            <LockIcon />
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {systemRoleCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Protected system roles
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Assigned Users
            </span>

            <Users className="h-4 w-4 text-emerald-500" />
          </div>

          <p className="mt-3 text-2xl font-bold text-emerald-900">
            {assignedUserCount}
          </p>

          <p className="mt-1 text-xs text-emerald-700/70">
            Admin users with roles
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Permission Library
            </span>

            <Shield className="h-4 w-4 text-amber-500" />
          </div>

          <p className="mt-3 text-2xl font-bold text-amber-900">
            {totalPermissionCount}
          </p>

          <p className="mt-1 text-xs text-amber-700/70">
            Available access controls
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search role name, slug or description..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={
                  roleFilter
                }
                onChange={(event) =>
                  setRoleFilter(
                    event.target
                      .value as RoleFilter,
                  )
                }
                className="h-10 min-w-[165px] appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-slate-400"
              >
                <option value="all">
                  All Roles
                </option>

                <option value="custom">
                  Custom Roles
                </option>

                <option value="system">
                  System Roles
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <select
              value={
                sortBy
              }
              onChange={(event) =>
                setSortBy(
                  event.target
                    .value as RoleSort,
                )
              }
              className="h-10 min-w-[170px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="name">
                Name A–Z
              </option>

              <option value="permissions">
                Most Permissions
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {filteredRoles.length} visible
            </span>

            {search ||
            roleFilter !==
              "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter(
                    "all",
                  );
                }}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Roles */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white"
                />
              ),
            )}
          </div>
        ) : filteredRoles.length ===
          0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Shield className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No roles found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              No roles match your current
              search or filter.
            </p>

            <button
              type="button"
              onClick={
                openCreateRole
              }
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create First Role
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRoles.map(
              (role) => {
                const permissionCount =
                  getPermissionCount(
                    role.permissions,
                  );

                const coverage =
                  totalPermissionCount >
                  0
                    ? Math.round(
                        (permissionCount /
                          totalPermissionCount) *
                          100,
                      )
                    : 0;

                const assignedUsers =
                  roleUserCounts[
                    role._id
                  ] || 0;

                return (
                  <div
                    key={role._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            role.isSystem
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {role.isSystem ? (
                            <ShieldCheck className="h-5 w-5" />
                          ) : (
                            <Shield className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900">
                            {role.name}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              void copySlug(
                                role.slug,
                              )
                            }
                            className="mt-1 inline-flex max-w-[170px] items-center gap-1 truncate font-mono text-[11px] text-slate-400 hover:text-slate-700"
                            title="Copy slug"
                          >
                            {role.slug}
                            <Copy className="h-3 w-3 shrink-0" />
                          </button>
                        </div>
                      </div>

                      {role.isSystem ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                          Protected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                          Custom
                        </span>
                      )}
                    </div>

                    <p className="mt-4 min-h-[44px] line-clamp-2 text-sm leading-5 text-slate-500">
                      {role.description ||
                        "No description provided for this role."}
                    </p>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          Permission Coverage
                        </span>

                        <span className="text-xs font-bold text-slate-900">
                          {coverage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            coverage >=
                            80
                              ? "bg-emerald-500"
                              : coverage >=
                                  50
                                ? "bg-blue-500"
                                : coverage > 0
                                  ? "bg-amber-500"
                                  : "bg-slate-300"
                          }`}
                          style={{
                            width: `${coverage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />

                          <span className="text-[11px] font-medium text-slate-400">
                            Permissions
                          </span>
                        </div>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {permissionCount}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-slate-400" />

                          <span className="text-[11px] font-medium text-slate-400">
                            Assigned
                          </span>
                        </div>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {assignedUsers}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="text-[11px] text-slate-400">
                        Updated{" "}
                        {formatDate(
                          role.updatedAt ||
                            role.createdAt,
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            viewRole(
                              role,
                            )
                          }
                          title="View role"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            duplicateRole(
                              role,
                            )
                          }
                          title="Duplicate role"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        {!role.isSystem && (
                          <button
                            type="button"
                            onClick={() =>
                              openEditRole(
                                role,
                              )
                            }
                            title="Edit role"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}

                        {!role.isSystem && (
                          <button
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              void deleteRole(
                                role,
                              )
                            }
                            title="Delete role"
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* Role Details Drawer */}
      {showDetails &&
        selectedRole && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close role details"
              onClick={() =>
                setShowDetails(
                  false,
                )
              }
              className="absolute inset-0 bg-black/50"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Role Details
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {selectedRole.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetails(
                      false,
                    )
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      {selectedRole.isSystem ? (
                        <ShieldCheck className="h-6 w-6 text-slate-800" />
                      ) : (
                        <Shield className="h-6 w-6 text-slate-700" />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedRole.name}
                      </p>

                      <p className="font-mono text-[11px] text-slate-400">
                        {selectedRole.slug}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {selectedRole.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Permissions
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {getPermissionCount(
                        selectedRole.permissions,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Assigned Users
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {
                        roleUserCounts[
                          selectedRole._id
                        ]
                      ||
                        0}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Permission Breakdown
                    </h4>

                    <span className="text-xs text-slate-400">
                      {
                        getPermissionCount(
                          selectedRole.permissions,
                        )
                      }{" "}
                      selected
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {PERMISSION_MODULES.map(
                      (
                        module,
                      ) => {
                        const normalized =
                          normalizePermissions(
                            selectedRole.permissions,
                          );

                        const count =
                          normalized[
                            module.key
                          ]?.length ||
                          0;

                        const percent =
                          module.actions
                            .length >
                          0
                            ? Math.round(
                                (count /
                                  module.actions
                                    .length) *
                                  100,
                              )
                            : 0;

                        return (
                          <div
                            key={
                              module.key
                            }
                            className="rounded-xl border border-slate-200 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {
                                    module.label
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {count}/
                                  {
                                    module
                                      .actions
                                      .length
                                  }{" "}
                                  permissions
                                </p>
                              </div>

                              <span className="text-xs font-bold text-slate-600">
                                {percent}%
                              </span>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-slate-900"
                                style={{
                                  width: `${percent}%`,
                                }}
                              />
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {normalized[
                                module.key
                              ]?.map(
                                (
                                  action,
                                ) => (
                                  <span
                                    key={
                                      action
                                    }
                                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700"
                                  >
                                    <Check className="h-3 w-3" />
                                    {
                                      ACTION_LABELS[
                                        action
                                      ]
                                    }
                                  </span>
                                ),
                              )}

                              {count ===
                                0 && (
                                <span className="text-xs text-slate-400">
                                  No access
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Role metadata
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Created:{" "}
                        {formatDate(
                          selectedRole.createdAt,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Updated:{" "}
                        {formatDate(
                          selectedRole.updatedAt,
                        )}
                      </p>

                      {selectedRole
                        .createdBy
                        ?.name && (
                        <p className="mt-1 text-xs text-slate-500">
                          Created by:{" "}
                          {
                            selectedRole
                              .createdBy
                              .name
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-slate-200 pt-5">
                  {!selectedRole.isSystem && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetails(
                          false,
                        );
                        openEditRole(
                          selectedRole,
                        );
                      }}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Role
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      duplicateRole(
                        selectedRole,
                      )
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

      {/* Create/Edit Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-5">
          <div className="mx-auto my-3 flex min-h-[calc(100vh-24px)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-5 sm:min-h-[calc(100vh-40px)]">
            {/* Modal Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {editingRole
                        ? "Edit Role"
                        : "Create Role"}
                    </h2>

                    <p className="text-xs text-slate-500">
                      Define administrator access with
                      granular permissions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    clearAllPermissions
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(
                      false,
                    );
                    setEditingRole(
                      null,
                    );
                  }}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={
                saveRole
              }
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="grid min-h-0 flex-1 lg:grid-cols-[330px_1fr]">
                {/* Left Setup */}
                <div className="border-b border-slate-200 bg-slate-50 p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r sm:p-6">
                  <div className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Role Name
                      </label>

                      <input
                        value={
                          roleForm.name
                        }
                        onChange={(
                          event,
                        ) =>
                          setRoleForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              name: event
                                .target
                                .value,
                            }),
                          )
                        }
                        required
                        maxLength={100}
                        placeholder="e.g. Content Manager"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Internal slug preview
                        </span>

                        <span className="max-w-[180px] truncate font-mono text-[11px] text-slate-500">
                          {slugPreview(
                            roleForm.name,
                          ) ||
                            "role-slug"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Description
                      </label>

                      <textarea
                        value={
                          roleForm.description
                        }
                        onChange={(
                          event,
                        ) =>
                          setRoleForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              description:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        maxLength={500}
                        rows={5}
                        placeholder="Explain what this role is allowed to do..."
                        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />

                      <p className="mt-1 text-right text-[11px] text-slate-400">
                        {
                          roleForm
                            .description
                            .length
                        }
                        /500
                      </p>
                    </div>

                    {/* Permission Summary */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Access Summary
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Selected permissions for this
                            role.
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {
                            selectedPermissionCount
                          }
                          /
                          {
                            totalPermissionCount
                          }
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            permissionCoverage >=
                            80
                              ? "bg-emerald-500"
                              : permissionCoverage >=
                                  50
                                ? "bg-blue-500"
                                : permissionCoverage >
                                    0
                                  ? "bg-amber-500"
                                  : "bg-slate-300"
                          }`}
                          style={{
                            width: `${permissionCoverage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {permissionCoverage}% permission
                        coverage
                      </p>
                    </div>

                    {/* Quick Selection */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-slate-500" />

                        <p className="text-sm font-semibold text-slate-900">
                          Quick Setup
                        </p>
                      </div>

                      <div className="mt-3 grid gap-2">
                        <button
                          type="button"
                          onClick={
                            toggleAllVisible
                          }
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <span>
                            {allVisibleSelected
                              ? "Clear visible modules"
                              : "Select visible modules"}
                          </span>

                          <ChevronRight className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={
                            selectRecommendedReadOnly
                          }
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <span>
                            Read-only access
                          </span>

                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={
                            clearAllPermissions
                          }
                          className="flex items-center justify-between rounded-lg border border-red-100 px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <span>
                            Remove all permissions
                          </span>

                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                        <div>
                          <p className="text-xs font-semibold text-blue-900">
                            Owner control
                          </p>

                          <p className="mt-1 text-xs leading-5 text-blue-800">
                            These permissions determine what an invited
                            administrator can access after accepting the
                            invitation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permission Matrix */}
                <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
                  <div className="sticky top-0 z-10 -mx-1 mb-5 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={
                            permissionSearch
                          }
                          onChange={(
                            event,
                          ) =>
                            setPermissionSearch(
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="Search permissions or modules..."
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {
                            filteredPermissionModules.length
                          }{" "}
                          modules
                        </span>

                        <button
                          type="button"
                          onClick={
                            toggleAllVisible
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />

                          {allVisibleSelected
                            ? "Clear Visible"
                            : "Select Visible"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredPermissionModules.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center">
                        <Search className="mx-auto h-8 w-8 text-slate-300" />

                        <p className="mt-3 text-sm font-semibold text-slate-800">
                          No permission modules found
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Try a different permission or module name.
                        </p>
                      </div>
                    ) : (
                      filteredPermissionModules.map(
                        (
                          module,
                        ) => {
                          const selectedCount =
                            getModulePermissionCount(
                              roleForm.permissions,
                              module.key,
                            );

                          const allSelected =
                            isModuleFullySelected(
                              roleForm.permissions,
                              module,
                            );

                          const partiallySelected =
                            isModulePartiallySelected(
                              roleForm.permissions,
                              module,
                            );

                          const expanded =
                            Boolean(
                              expandedModules[
                                module.key
                              ],
                            );

                          return (
                            <div
                              key={
                                module.key
                              }
                              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >
                              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedModules(
                                        (
                                          current,
                                        ) => ({
                                          ...current,
                                          [module.key]:
                                            !expanded,
                                        }),
                                      )
                                    }
                                    className="mt-0.5 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                  >
                                    {expanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="text-sm font-bold text-slate-900">
                                        {
                                          module.label
                                        }
                                      </h3>

                                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                        {
                                          selectedCount
                                        }
                                        /
                                        {
                                          module
                                            .actions
                                            .length
                                        }
                                      </span>

                                      {allSelected && (
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                          Full Access
                                        </span>
                                      )}

                                      {partiallySelected &&
                                        !allSelected && (
                                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                            Partial
                                          </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        module.description
                                      }
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleModule(
                                      module,
                                    )
                                  }
                                  className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                                    allSelected
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {allSelected ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                  )}

                                  {allSelected
                                    ? "Clear Module"
                                    : "Select Module"}
                                </button>
                              </div>

                              {expanded && (
                                <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {module.actions.map(
                                      (
                                        action,
                                      ) => {
                                        const selected =
                                          (
                                            roleForm
                                              .permissions[
                                              module
                                                .key
                                            ] ||
                                            []
                                          ).includes(
                                            action as PermissionAction,
                                          );

                                        return (
                                          <label
                                            key={
                                              action
                                            }
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                                              selected
                                                ? "border-slate-900 bg-white shadow-sm"
                                                : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                  selected
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-slate-100 text-slate-400"
                                                }`}
                                              >
                                                {selected ? (
                                                  <Check className="h-4 w-4" />
                                                ) : (
                                                  <Shield className="h-4 w-4" />
                                                )}
                                              </div>

                                              <div>
                                                <p className="text-xs font-semibold text-slate-800">
                                                  {
                                                    ACTION_LABELS[
                                                      action
                                                    ]
                                                  }
                                                </p>

                                                <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                                                  {
                                                    action
                                                  }
                                                </p>
                                              </div>
                                            </div>

                                            <input
                                              type="checkbox"
                                              checked={
                                                selected
                                              }
                                              onChange={() =>
                                                togglePermission(
                                                  module.key,
                                                  action as PermissionAction,
                                                )
                                              }
                                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                                            />
                                          </label>
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        },
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <ShieldCheck className="h-4 w-4 text-slate-600" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">
                      {selectedPermissionCount} permissions selected
                    </p>

                    <p className="text-[11px] text-slate-400">
                      {permissionCoverage}% coverage
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleModal(
                        false,
                      );
                      setEditingRole(
                        null,
                      );
                    }}
                    className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    <Check className="h-4 w-4" />

                    {editingRole
                      ? "Save Changes"
                      : "Create Role"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function LockIcon() {
  return (
    <div className="flex h-4 w-4 items-center justify-center rounded border border-slate-400">
      <div className="h-2 w-1.5 rounded-sm bg-slate-400" />
    </div>
  );
}