"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Filter,
  Grid2X2,
  Info,
  List,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
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
  slug?: string;
  description?: string;
  permissions?: BackendPermissionMap;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AdminUser = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: "customer" | "admin" | "owner";
  adminRole?: string | null;
  isOwner?: boolean;
  status?:
    | "active"
    | "suspended"
    | "removed"
    | "pending";
  roleId?: string | null;
  roleData?: Role | null;
  permissions?:
    | PermissionMap
    | BackendPermissionMap;
  invitedBy?: string | null;
  invitationExpires?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UsersResponse = {
  success: boolean;
  data: AdminUser[];
  pagination?: Pagination;
  message?: string;
};

type RolesResponse = {
  success: boolean;
  data: Role[];
  message?: string;
};

type ViewMode = "table" | "cards";

type UserSort =
  | "newest"
  | "oldest"
  | "name"
  | "status";

type BulkAction =
  | "suspend"
  | "activate"
  | "remove";

type StatusFilter =
  | "all"
  | "active"
  | "suspended"
  | "removed";

const PERMISSION_MODULES = [
  {
    key: "dashboard",
    label: "Dashboard",
    actions: ["view"],
  },
  {
    key: "books",
    label: "Books",
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
    actions: [
      "view",
      "update",
    ],
  },
  {
    key: "orders",
    label: "Orders",
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
    actions: [
      "view",
      "edit",
      "delete",
    ],
  },
  {
    key: "pages",
    label: "Pages / CMS",
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
    actions: ["view"],
  },
  {
    key: "payments",
    label: "Payments",
    actions: [
      "view",
      "update",
      "refund",
    ],
  },
  {
    key: "adminUsers",
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
    key: "settings",
    label: "Site Settings",
    actions: [
      "view",
      "edit",
    ],
  },
] as const;

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

function formatRelativeDate(
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

  const diff =
    date.getTime() -
    Date.now();

  const minutes = Math.round(
    diff / 60000,
  );

  const formatter =
    new Intl.RelativeTimeFormat(
      "en",
      {
        numeric: "auto",
      },
    );

  if (
    Math.abs(minutes) < 60
  ) {
    return formatter.format(
      minutes,
      "minute",
    );
  }

  const hours = Math.round(
    minutes / 60,
  );

  if (
    Math.abs(hours) < 24
  ) {
    return formatter.format(
      hours,
      "hour",
    );
  }

  return formatter.format(
    Math.round(hours / 24),
    "day",
  );
}

function statusClasses(
  status?: string,
) {
  switch (
    String(status || "")
      .toLowerCase()
  ) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "suspended":
      return "bg-red-50 text-red-700 border-red-200";

    case "removed":
      return "bg-slate-100 text-slate-600 border-slate-200";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function displayStatus(
  status?: string,
) {
  return String(
    status || "active",
  )
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function isProtectedOwner(
  user: AdminUser,
) {
  return (
    Boolean(user.isOwner) ||
    user.role === "owner" ||
    String(
      user.adminRole || "",
    ).toLowerCase() ===
      "owner" ||
    String(
      user.adminRole || "",
    ).toLowerCase() ===
      "super_admin"
  );
}

function getRoleName(
  user: AdminUser,
) {
  if (isProtectedOwner(user)) {
    return "Owner / Super Admin";
  }

  return (
    user.roleData?.name ||
    user.adminRole ||
    "Admin"
  );
}

function normalizePermissions(
  permissions?:
    | PermissionMap
    | BackendPermissionMap
    | null,
): PermissionMap {
  const output: PermissionMap =
    {};

  for (const module of PERMISSION_MODULES) {
    output[module.key] = [];
  }

  if (!permissions) {
    return output;
  }

  for (const module of PERMISSION_MODULES) {
    const current =
      permissions[module.key];

    if (Array.isArray(current)) {
      output[module.key] =
        module.actions.filter(
          (action) =>
            current.includes(
              action as PermissionAction,
            ),
        ) as PermissionAction[];

      continue;
    }

    if (
      current &&
      typeof current ===
        "object"
    ) {
      output[module.key] =
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

  return output;
}

function getUserPermissions(
  user: AdminUser,
) {
  return normalizePermissions(
    user.permissions ||
      user.roleData
        ?.permissions,
  );
}

function getPermissionCount(
  user: AdminUser,
) {
  if (isProtectedOwner(user)) {
    return PERMISSION_MODULES.reduce(
      (total, module) =>
        total +
        module.actions.length,
      0,
    );
  }

  const permissions =
    getUserPermissions(user);

  return Object.values(
    permissions,
  ).reduce(
    (total, actions) =>
      total + actions.length,
    0,
  );
}

function getTotalPermissions() {
  return PERMISSION_MODULES.reduce(
    (total, module) =>
      total + module.actions.length,
    0,
  );
}

function getPermissionCoverage(
  user: AdminUser,
) {
  const total =
    getTotalPermissions();

  if (total === 0) {
    return 0;
  }

  return Math.round(
    (getPermissionCount(
      user,
    ) /
      total) *
      100,
  );
}

function getStatusRank(
  status?: string,
) {
  switch (
    String(status || "").toLowerCase()
  ) {
    case "suspended":
      return 1;
    case "active":
      return 2;
    case "pending":
      return 3;
    case "removed":
      return 4;
    default:
      return 5;
  }
}

export default function UsersPage() {
  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [roles, setRoles] =
    useState<Role[]>([]);

  const [pagination, setPagination] =
    useState<Pagination>({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

  const [metrics, setMetrics] =
    useState({
      total: 0,
      active: 0,
      suspended: 0,
      removed: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [metricsLoading, setMetricsLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    rowActionId,
    setRowActionId,
  ] = useState("");

  const [bulkAction, setBulkAction] =
    useState<
      BulkAction | ""
    >("");

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>(
    "all",
  );

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("all");

  const [sortBy, setSortBy] =
    useState<UserSort>("newest");

  const [viewMode, setViewMode] =
    useState<ViewMode>("table");

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<Set<string>>(
    new Set(),
  );

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<AdminUser | null>(
    null,
  );

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  const [
    showInvite,
    setShowInvite,
  ] = useState(false);

  const [
    autoRefresh,
    setAutoRefresh,
  ] = useState(false);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState<string>("");

  const [
    inviteForm,
    setInviteForm,
  ] = useState({
    name: "",
    email: "",
    roleId: "",
  });

  const fetchUsers =
    useCallback(
      async (
        page = 1,
        showLoader = true,
        searchOverride?: string,
        statusOverride?: StatusFilter,
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          }

          const params =
            new URLSearchParams();

          params.set(
            "type",
            "users",
          );

          params.set(
            "page",
            String(page),
          );

          params.set(
            "limit",
            String(
              pagination.limit,
            ),
          );

          const effectiveSearch =
            searchOverride ??
            search;

          const effectiveStatus =
            statusOverride ??
            statusFilter;

          if (
            effectiveSearch.trim()
          ) {
            params.set(
              "search",
              effectiveSearch.trim(),
            );
          }

          if (
            effectiveStatus !==
            "all"
          ) {
            params.set(
              "status",
              effectiveStatus,
            );
          }

          const response =
            await fetch(
              `/api/admin/roles-permissions?${params.toString()}`,
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
              .catch(
                () => ({
                  success: false,
                  data: [],
                  message:
                    "Invalid server response.",
                }),
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
              data.message ||
                "You do not have permission to manage users.",
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

          if (data.pagination) {
            setPagination({
              page: Number(
                data
                  .pagination
                  .page ||
                  1,
              ),
              limit: Number(
                data
                  .pagination
                  .limit ||
                  pagination.limit,
              ),
              total: Number(
                data
                  .pagination
                  .total ||
                  0,
              ),
              totalPages: Number(
                data
                  .pagination
                  .totalPages ||
                  1,
              ),
            });
          }

          setLastUpdated(
            new Date().toISOString(),
          );
        } catch (err) {
          console.error(
            "Users loading error:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load users.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        pagination.limit,
        search,
        statusFilter,
      ],
    );

  const fetchRoles =
    useCallback(async () => {
      try {
        const response =
          await fetch(
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
            .catch(
              () => ({
                success: false,
                data: [],
                message:
                  "Invalid server response.",
              }),
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
            data.message ||
              "You do not have permission to load roles.",
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
      } catch (err) {
        console.error(
          "Roles loading error:",
          err,
        );

        setRoles([]);
      }
    }, []);

  const fetchMetricCount =
    useCallback(
      async (
        status?: string,
      ) => {
        const params =
          new URLSearchParams();

        params.set(
          "type",
          "users",
        );
        params.set(
          "page",
          "1",
        );
        params.set(
          "limit",
          "1",
        );

        if (status) {
          params.set(
            "status",
            status,
          );
        }

        const response =
          await fetch(
            `/api/admin/roles-permissions?${params.toString()}`,
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
            .catch(
              () => ({
                success: false,
                data: [],
                message:
                  "Invalid server response.",
              }),
            );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load user metrics.",
          );
        }

        return Number(
          data.pagination
            ?.total ||
            0,
        );
      },
      [],
    );

  const fetchMetrics =
    useCallback(async () => {
      try {
        setMetricsLoading(
          true,
        );

        const [
          total,
          active,
          suspended,
          removed,
        ] = await Promise.all([
          fetchMetricCount(),
          fetchMetricCount(
            "active",
          ),
          fetchMetricCount(
            "suspended",
          ),
          fetchMetricCount(
            "removed",
          ),
        ]);

        setMetrics({
          total,
          active,
          suspended,
          removed,
        });
      } catch (err) {
        console.error(
          "User metrics error:",
          err,
        );
      } finally {
        setMetricsLoading(
          false,
        );
      }
    }, [fetchMetricCount]);

  const loadData =
    useCallback(
      async (
        page = 1,
        showLoader = true,
      ) => {
        setError("");

        await Promise.all([
          fetchUsers(
            page,
            showLoader,
          ),
          fetchRoles(),
          fetchMetrics(),
        ]);
      },
      [
        fetchUsers,
        fetchRoles,
        fetchMetrics,
      ],
    );

  useEffect(() => {
    void loadData(1, true);
  }, []);

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        void fetchUsers(
          1,
          true,
        );
      }, 400);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [search]);

  useEffect(() => {
    void fetchUsers(
      1,
      true,
    );
  }, [statusFilter]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval =
      window.setInterval(() => {
        void loadData(
          pagination.page,
          false,
        );
      }, 30000);

    return () =>
      window.clearInterval(
        interval,
      );
  }, [
    autoRefresh,
    loadData,
    pagination.page,
  ]);

  const roleOptions =
    useMemo(() => {
      const customRoles =
        roles.filter(
          (role) =>
            !role.isSystem,
        );

      return customRoles.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
          ),
      );
    }, [roles]);

  const filteredUsers =
    useMemo(() => {
      const output = [
        ...users,
      ].filter(
        (user) => {
          if (
            roleFilter ===
            "all"
          ) {
            return true;
          }

          if (
            roleFilter ===
            "owner"
          ) {
            return isProtectedOwner(
              user,
            );
          }

          return (
            user.roleId ===
              roleFilter ||
            user.roleData?._id ===
              roleFilter
          );
        },
      );

      output.sort(
        (a, b) => {
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

          if (
            sortBy ===
            "status"
          ) {
            return (
              getStatusRank(
                a.status,
              ) -
              getStatusRank(
                b.status,
              )
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

      return output;
    }, [
      users,
      roleFilter,
      sortBy,
    ]);

  const selectedVisibleUsers =
    useMemo(
      () =>
        filteredUsers.filter(
          (user) =>
            selectedIds.has(
              user._id,
            ) &&
            !isProtectedOwner(
              user,
            ),
        ),
      [
        filteredUsers,
        selectedIds,
      ],
    );

  const selectableVisibleUsers =
    useMemo(
      () =>
        filteredUsers.filter(
          (user) =>
            !isProtectedOwner(
              user,
            ),
        ),
      [filteredUsers],
    );

  const allVisibleSelected =
    selectableVisibleUsers.length >
      0 &&
    selectableVisibleUsers.every(
      (user) =>
        selectedIds.has(
          user._id,
        ),
    );

  const bulkEligible =
    useMemo(() => {
      const selected =
        selectedVisibleUsers;

      return {
        suspend: selected.filter(
          (user) =>
            user.status !==
            "suspended",
        ),
        activate: selected.filter(
          (user) =>
            user.status ===
            "suspended",
        ),
        remove: selected.filter(
          (user) =>
            user.status !==
            "removed",
        ),
      };
    }, [selectedVisibleUsers]);

  const roleDistribution =
    useMemo(() => {
      const counts =
        new Map<
          string,
          number
        >();

      for (const user of users) {
        const name =
          getRoleName(user);

        counts.set(
          name,
          (counts.get(name) ||
            0) + 1,
        );
      }

      return Array.from(
        counts.entries(),
      )
        .sort(
          (a, b) =>
            b[1] - a[1],
        )
        .slice(0, 5);
    }, [users]);

  const openUserDetails =
    (user: AdminUser) => {
      setSelectedUser(user);
      setShowDetails(true);
    };

  const toggleUserSelection =
    (userId: string) => {
      setSelectedIds(
        (current) => {
          const next =
            new Set(
              current,
            );

          if (
            next.has(userId)
          ) {
            next.delete(
              userId,
            );
          } else {
            next.add(
              userId,
            );
          }

          return next;
        },
      );
    };

  const toggleSelectAll =
    () => {
      setSelectedIds(
        (current) => {
          const next =
            new Set(
              current,
            );

          if (
            allVisibleSelected
          ) {
            selectableVisibleUsers.forEach(
              (user) =>
                next.delete(
                  user._id,
                ),
            );
          } else {
            selectableVisibleUsers.forEach(
              (user) =>
                next.add(
                  user._id,
                ),
            );
          }

          return next;
        },
      );
    };

  const clearSelection =
    () => {
      setSelectedIds(
        new Set(),
      );
    };

  const changeUserStatus =
    async (
      user: AdminUser,
      action:
        | "suspend"
        | "activate"
        | "remove",
    ) => {
      if (
        isProtectedOwner(
          user,
        )
      ) {
        setError(
          "The Owner account is protected and cannot be modified here.",
        );
        return;
      }

      const text =
        action ===
        "remove"
          ? "remove"
          : action ===
              "suspend"
            ? "suspend"
            : "activate";

      if (
        !window.confirm(
          `Are you sure you want to ${text} ${user.name}?`,
        )
      ) {
        return;
      }

      try {
        setRowActionId(
          user._id,
        );
        setSaving(true);
        setError("");

        const response =
          await fetch(
            `/api/admin/roles-permissions/${user._id}/${action}`,
            {
              method:
                action ===
                "remove"
                  ? "DELETE"
                  : "PATCH",
              credentials:
                "include",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              ...(action ===
              "remove"
                ? {
                    body: JSON.stringify(
                      {
                        reason:
                          "User removed by owner.",
                      },
                    ),
                  }
                : {}),
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
              "You do not have permission to perform this action.",
          );
        }

        if (
          response.status ===
          404
        ) {
          throw new Error(
            data?.message ||
              "User not found.",
          );
        }

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              `Unable to ${text} user.`,
          );
        }

        await Promise.all([
          fetchUsers(
            pagination.page,
            false,
          ),
          fetchMetrics(),
        ]);
      } catch (err) {
        console.error(
          "User status action error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to update user.",
        );
      } finally {
        setRowActionId("");
        setSaving(false);
      }
    };

  const runBulkAction =
    async (
      action: BulkAction,
    ) => {
      const target =
        bulkEligible[action];

      if (
        target.length === 0
      ) {
        setError(
          `No users are eligible for ${action}.`,
        );
        return;
      }

      const actionText =
        action ===
        "remove"
          ? "remove"
          : action ===
              "suspend"
            ? "suspend"
            : "activate";

      if (
        !window.confirm(
          `Are you sure you want to ${actionText} ${target.length} selected user${
            target.length ===
            1
              ? ""
              : "s"
          }?`,
        )
      ) {
        return;
      }

      try {
        setBulkAction(
          action,
        );
        setSaving(true);
        setError("");

        const results =
          await Promise.allSettled(
            target.map(
              async (user) => {
                const response =
                  await fetch(
                    `/api/admin/roles-permissions/${user._id}/${action}`,
                    {
                      method:
                        action ===
                        "remove"
                          ? "DELETE"
                          : "PATCH",
                      credentials:
                        "include",
                      headers: {
                        "Content-Type":
                          "application/json",
                        Accept:
                          "application/json",
                      },
                      ...(action ===
                      "remove"
                        ? {
                            body: JSON.stringify(
                              {
                                reason:
                                  "User removed by owner.",
                              },
                            ),
                          }
                        : {}),
                    },
                  );

                const data =
                  await response
                    .json()
                    .catch(
                      () => null,
                    );

                if (
                  !response.ok ||
                  !data?.success
                ) {
                  throw new Error(
                    data?.message ||
                      `Unable to ${actionText} ${user.name}.`,
                  );
                }
              },
            ),
          );

        const failures =
          results.filter(
            (
              result,
            ) =>
              result.status ===
              "rejected",
          ).length;

        if (failures > 0) {
          setError(
            `${target.length - failures} user${
              target.length -
                failures ===
              1
                ? ""
                : "s"
            } updated. ${failures} failed.`,
          );
        }

        clearSelection();

        await Promise.all([
          fetchUsers(
            pagination.page,
            false,
          ),
          fetchMetrics(),
        ]);
      } catch (err) {
        console.error(
          "Bulk user action error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Bulk action failed.",
        );
      } finally {
        setBulkAction("");
        setSaving(false);
      }
    };

  const inviteUser =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();

      const name =
        inviteForm.name.trim();

      const email =
        inviteForm.email
          .trim()
          .toLowerCase();

      if (
        !name ||
        !email ||
        !inviteForm.roleId
      ) {
        setError(
          "Name, email and role are required.",
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        const response =
          await fetch(
            "/api/admin/roles-permissions/invite",
            {
              method: "POST",
              credentials:
                "include",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              body: JSON.stringify(
                {
                  name,
                  email,
                  roleId:
                    inviteForm.roleId,
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
              "You do not have permission to invite users.",
          );
        }

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              "Unable to create invitation.",
          );
        }

        setInviteForm({
          name: "",
          email: "",
          roleId: "",
        });

        setShowInvite(
          false,
        );

        await Promise.all([
          fetchUsers(
            1,
            false,
          ),
          fetchMetrics(),
        ]);
      } catch (err) {
        console.error(
          "Invite user error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to create invitation.",
        );
      } finally {
        setSaving(false);
      }
    };

  const copyText = async (
    value: string,
    label: string,
  ) => {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setError(
        `${label} copied.`,
      );

      window.setTimeout(
        () => {
          setError("");
        },
        1500,
      );
    } catch {
      setError(
        `Unable to copy ${label.toLowerCase()}.`,
      );
    }
  };

  const exportCsv =
    () => {
      if (
        filteredUsers.length ===
        0
      ) {
        setError(
          "There are no users to export.",
        );
        return;
      }

      const rows =
        filteredUsers.map(
          (user) => [
            user.name,
            user.email,
            getRoleName(user),
            displayStatus(
              user.status,
            ),
            formatDate(
              user.createdAt,
            ),
            formatDate(
              user.updatedAt,
            ),
            isProtectedOwner(
              user,
            )
              ? "Protected"
              : getPermissionCount(
                  user,
                ),
            user._id,
          ],
        );

      const csv = [
        [
          "Name",
          "Email",
          "Role",
          "Status",
          "Created",
          "Updated",
          "Permissions",
          "User ID",
        ],
        ...rows,
      ]
        .map(
          (row) =>
            row
              .map((cell) => {
                const value =
                  String(
                    cell ??
                      "",
                  );

                return `"${value.replaceAll(
                  '"',
                  '""',
                )}"`;
              })
              .join(","),
        )
        .join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type: "text/csv;charset=utf-8;",
          },
        );

      const url =
        URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href = url;
      link.download = `studystow-users-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(
        link,
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(
        url,
      );
    };

  const goToPage =
    (page: number) => {
      const next = Math.min(
        Math.max(
          page,
          1,
        ),
        pagination.totalPages,
      );

      void fetchUsers(
        next,
        true,
      );
    };

  const handlePageSizeChange =
    (
      value: string,
    ) => {
      const nextLimit =
        Number(value);

      if (
        !Number.isFinite(
          nextLimit,
        )
      ) {
        return;
      }

      setPagination(
        (current) => ({
          ...current,
          limit: nextLimit,
          page: 1,
        }),
      );

      window.setTimeout(() => {
        void fetchUsers(
          1,
          true,
        );
      }, 0);
    };

  const selectedInviteRole =
    roles.find(
      (role) =>
        role._id ===
        inviteForm.roleId,
    );

  const selectedInvitePermissions =
    selectedInviteRole
      ? normalizePermissions(
          selectedInviteRole.permissions,
        )
      : {};

  const selectedInvitePermissionCount =
    Object.values(
      selectedInvitePermissions,
    ).reduce(
      (total, actions) =>
        total +
        actions.length,
      0,
    );

  const renderUserRoleBadge =
    (user: AdminUser) => {
      const owner =
        isProtectedOwner(
          user,
        );

      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            owner
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {owner ? (
            <ShieldCheck className="h-3 w-3" />
          ) : (
            <Shield className="h-3 w-3" />
          )}

          {getRoleName(user)}
        </span>
      );
    };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-900" />

            <h2 className="text-lg font-semibold text-slate-900">
              Administrator Users
            </h2>
          </div>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Advanced control center for administrator accounts,
            access status, roles, permissions, and onboarding.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={
              exportCsv
            }
            disabled={
              filteredUsers.length ===
              0
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() =>
              setAutoRefresh(
                (value) =>
                  !value,
              )
            }
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium ${
              autoRefresh
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                autoRefresh
                  ? "animate-spin"
                  : ""
              }`}
            />

            Auto Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              void loadData(
                pagination.page,
                true,
              )
            }
            disabled={
              loading ||
              saving
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
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
            onClick={() =>
              setShowInvite(
                true,
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <UserPlus className="h-4 w-4" />
            Invite User
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
                User Management
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total Administrators"
          value={metrics.total}
          icon={
            <Users className="h-4 w-4" />
          }
          loading={
            metricsLoading
          }
          description="All administrator accounts"
        />

        <MetricCard
          label="Active"
          value={metrics.active}
          icon={
            <UserCheck className="h-4 w-4" />
          }
          loading={
            metricsLoading
          }
          description="Accounts with active access"
          tone="green"
        />

        <MetricCard
          label="Suspended"
          value={
            metrics.suspended
          }
          icon={
            <UserMinus className="h-4 w-4" />
          }
          loading={
            metricsLoading
          }
          description="Accounts temporarily blocked"
          tone="amber"
        />

        <MetricCard
          label="Removed"
          value={metrics.removed}
          icon={
            <Trash2 className="h-4 w-4" />
          }
          loading={
            metricsLoading
          }
          description="Removed administrator accounts"
          tone="red"
        />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Current View
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {pagination.total} records match the server-side
                filters.
              </p>
            </div>

            {lastUpdated && (
              <span className="text-xs text-slate-400">
                Updated{" "}
                {formatRelativeDate(
                  lastUpdated,
                )}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <MiniMetric
              label="Visible"
              value={
                filteredUsers.length
              }
            />

            <MiniMetric
              label="Selected"
              value={
                selectedIds.size
              }
            />

            <MiniMetric
              label="Roles Loaded"
              value={
                roles.length
              }
            />

            <MiniMetric
              label="Page"
              value={`${pagination.page}/${pagination.totalPages}`}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Role Distribution
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Current loaded users.
              </p>
            </div>

            <Link
              href="/admin/roles-permissions/roles"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Manage Roles
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {roleDistribution.length ===
            0 ? (
              <p className="text-xs text-slate-400">
                No role data available.
              </p>
            ) : (
              roleDistribution.map(
                ([name, count]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="max-w-[220px] truncate text-xs font-medium text-slate-600">
                      {name}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      {count}
                    </span>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search name, email, role..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  )
                }
                className="h-10 min-w-[160px] appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-slate-400"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="active">
                  Active
                </option>

                <option value="suspended">
                  Suspended
                </option>

                <option value="removed">
                  Removed
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={
                  roleFilter
                }
                onChange={(
                  event,
                ) =>
                  setRoleFilter(
                    event.target
                      .value,
                  )
                }
                className="h-10 min-w-[180px] appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-slate-400"
              >
                <option value="all">
                  All Roles
                </option>

                <option value="owner">
                  Owner / Super Admin
                </option>

                {roleOptions.map(
                  (role) => (
                    <option
                      key={
                        role._id
                      }
                      value={
                        role._id
                      }
                    >
                      {role.name}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <select
              value={sortBy}
              onChange={(
                event,
              ) =>
                setSortBy(
                  event.target
                    .value as UserSort,
                )
              }
              className="h-10 min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
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

              <option value="status">
                Status Priority
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setViewMode(
                  "table",
                )
              }
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${
                viewMode ===
                "table"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <List className="h-4 w-4" />
              Table
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  "cards",
                )
              }
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${
                viewMode ===
                "cards"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Grid2X2 className="h-4 w-4" />
              Cards
            </button>

            <select
              value={
                pagination.limit
              }
              onChange={(
                event,
              ) =>
                handlePageSizeChange(
                  event.target
                    .value,
                )
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700"
            >
              <option value="20">
                20 / page
              </option>

              <option value="50">
                50 / page
              </option>

              <option value="100">
                100 / page
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Toolbar */}
      {selectedIds.size >
        0 && (
        <div className="sticky top-3 z-20 rounded-xl border border-slate-300 bg-slate-900 p-3 text-white shadow-xl">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Check className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {selectedIds.size} selected
                </p>

                <p className="text-[11px] text-slate-300">
                  Protected Owner accounts cannot be bulk modified.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  saving ||
                  bulkEligible
                    .suspend
                    .length ===
                    0
                }
                onClick={() =>
                  void runBulkAction(
                    "suspend",
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-xs font-semibold hover:bg-white/20 disabled:opacity-40"
              >
                {bulkAction ===
                "suspend" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserMinus className="h-3.5 w-3.5" />
                )}
                Suspend
              </button>

              <button
                type="button"
                disabled={
                  saving ||
                  bulkEligible
                    .activate
                    .length ===
                    0
                }
                onClick={() =>
                  void runBulkAction(
                    "activate",
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-500/20 px-3 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-40"
              >
                {bulkAction ===
                "activate" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
                Activate
              </button>

              <button
                type="button"
                disabled={
                  saving ||
                  bulkEligible
                    .remove
                    .length ===
                    0
                }
                onClick={() =>
                  void runBulkAction(
                    "remove",
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-500/20 px-3 text-xs font-semibold text-red-100 hover:bg-red-500/30 disabled:opacity-40"
              >
                {bulkAction ===
                "remove" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remove
              </button>

              <button
                type="button"
                onClick={
                  clearSelection
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[450px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />

            <p className="text-sm text-slate-500">
              Loading administrator users...
            </p>
          </div>
        ) : filteredUsers.length ===
          0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Users className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No administrators found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              No user records match the current search,
              role, or status filters.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "all",
                  );
                  setRoleFilter(
                    "all",
                  );
                }}
                className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset Filters
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowInvite(
                    true,
                  )
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <UserPlus className="h-4 w-4" />
                Invite User
              </button>
            </div>
          </div>
        ) : viewMode ===
          "table" ? (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          allVisibleSelected
                        }
                        onChange={
                          toggleSelectAll
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Administrator
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Access Coverage
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(
                    (user) => {
                      const owner =
                        isProtectedOwner(
                          user,
                        );

                      const permissionCoverage =
                        getPermissionCoverage(
                          user,
                        );

                      const status =
                        user.status ||
                        "active";

                      const busy =
                        rowActionId ===
                        user._id;

                      return (
                        <tr
                          key={
                            user._id
                          }
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 align-top">
                            <input
                              type="checkbox"
                              disabled={
                                owner
                              }
                              checked={selectedIds.has(
                                user._id,
                              )}
                              onChange={() =>
                                toggleUserSelection(
                                  user._id,
                                )
                              }
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 disabled:opacity-30"
                            />
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex min-w-[245px] items-start gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                  owner
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {owner ? (
                                  <ShieldCheck className="h-5 w-5" />
                                ) : (
                                  <Shield className="h-5 w-5" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openUserDetails(
                                      user,
                                    )
                                  }
                                  className="block max-w-[260px] truncate text-sm font-semibold text-slate-900 hover:underline"
                                >
                                  {
                                    user.name
                                  }
                                </button>

                                <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500">
                                  {
                                    user.email
                                  }
                                </p>

                                <p className="mt-1 text-[11px] text-slate-400">
                                  ID:{" "}
                                  {user._id.slice(
                                    -8,
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            {renderUserRoleBadge(
                              user,
                            )}

                            {user.roleData
                              ?.description && (
                              <p className="mt-2 max-w-[180px] line-clamp-2 text-[11px] text-slate-400">
                                {
                                  user
                                    .roleData
                                    .description
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="min-w-[160px]">
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-600">
                                  {
                                    getPermissionCount(
                                      user,
                                    )
                                  }{" "}
                                  /{" "}
                                  {
                                    getTotalPermissions()
                                  }
                                </span>

                                <span className="text-[11px] font-bold text-slate-700">
                                  {
                                    permissionCoverage
                                  }
                                  %
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    owner
                                      ? "bg-slate-900"
                                      : permissionCoverage >=
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

                              <p className="mt-1 text-[10px] text-slate-400">
                                {owner
                                  ? "Protected full access"
                                  : "Role-based access"}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
                                status,
                              )}`}
                            >
                              {displayStatus(
                                status,
                              )}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 align-top">
                            <p className="text-xs font-medium text-slate-700">
                              {formatDate(
                                user.createdAt,
                              )}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {formatRelativeDate(
                                user.createdAt,
                              )}
                            </p>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  openUserDetails(
                                    user,
                                  )
                                }
                                title="View details"
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {!owner &&
                                status !==
                                  "suspended" && (
                                  <button
                                    type="button"
                                    disabled={
                                      busy
                                    }
                                    onClick={() =>
                                      void changeUserStatus(
                                        user,
                                        "suspend",
                                      )
                                    }
                                    title="Suspend user"
                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  >
                                    {busy ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserMinus className="h-4 w-4" />
                                    )}
                                  </button>
                                )}

                              {!owner &&
                                status ===
                                  "suspended" && (
                                  <button
                                    type="button"
                                    disabled={
                                      busy
                                    }
                                    onClick={() =>
                                      void changeUserStatus(
                                        user,
                                        "activate",
                                      )
                                    }
                                    title="Activate user"
                                    className="rounded-lg border border-slate-200 p-2 text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
                                  >
                                    {busy ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserCheck className="h-4 w-4" />
                                    )}
                                  </button>
                                )}

                              {!owner && (
                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    void changeUserStatus(
                                      user,
                                      "remove",
                                    )
                                  }
                                  title="Remove user"
                                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Table Cards */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredUsers.map(
                (user) => {
                  const owner =
                    isProtectedOwner(
                      user,
                    );

                  const status =
                    user.status ||
                    "active";

                  const coverage =
                    getPermissionCoverage(
                      user,
                    );

                  return (
                    <div
                      key={
                        user._id
                      }
                      className="space-y-4 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          disabled={
                            owner
                          }
                          checked={selectedIds.has(
                            user._id,
                          )}
                          onChange={() =>
                            toggleUserSelection(
                              user._id,
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 disabled:opacity-30"
                        />

                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              owner
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Shield className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                openUserDetails(
                                  user,
                                )
                              }
                              className="truncate text-left text-sm font-semibold text-slate-900"
                            >
                              {
                                user.name
                              }
                            </button>

                            <p className="truncate text-xs text-slate-500">
                              {
                                user.email
                              }
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${statusClasses(
                            status,
                          )}`}
                        >
                          {displayStatus(
                            status,
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {renderUserRoleBadge(
                          user,
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600">
                            Access Coverage
                          </span>

                          <span className="text-xs font-bold text-slate-800">
                            {coverage}%
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-slate-900"
                            style={{
                              width: `${coverage}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-[11px] text-slate-400">
                          {
                            getPermissionCount(
                              user,
                            )
                          } permissions
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] text-slate-400">
                            Created
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {formatDate(
                              user.createdAt,
                            )}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openUserDetails(
                                user,
                              )
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {!owner &&
                            status !==
                              "suspended" && (
                              <button
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() =>
                                  void changeUserStatus(
                                    user,
                                    "suspend",
                                  )
                                }
                                className="rounded-lg border border-slate-200 p-2 text-red-600"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            )}

                          {!owner &&
                            status ===
                              "suspended" && (
                              <button
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() =>
                                  void changeUserStatus(
                                    user,
                                    "activate",
                                  )
                                }
                                className="rounded-lg border border-slate-200 p-2 text-emerald-600"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}

                          {!owner && (
                            <button
                              type="button"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                void changeUserStatus(
                                  user,
                                  "remove",
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-red-600"
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
          </>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map(
              (user) => {
                const owner =
                  isProtectedOwner(
                    user,
                  );

                const status =
                  user.status ||
                  "active";

                const coverage =
                  getPermissionCoverage(
                    user,
                  );

                return (
                  <div
                    key={
                      user._id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          disabled={
                            owner
                          }
                          checked={selectedIds.has(
                            user._id,
                          )}
                          onChange={() =>
                            toggleUserSelection(
                              user._id,
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 disabled:opacity-30"
                        />

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full ${
                            owner
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {owner ? (
                            <ShieldCheck className="h-5 w-5" />
                          ) : (
                            <Shield className="h-5 w-5" />
                          )}
                        </div>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses(
                          status,
                        )}`}
                      >
                        {displayStatus(
                          status,
                        )}
                      </span>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          openUserDetails(
                            user,
                          )
                        }
                        className="truncate text-left text-sm font-bold text-slate-900 hover:underline"
                      >
                        {user.name}
                      </button>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <div className="mt-4">
                      {renderUserRoleBadge(
                        user,
                      )}
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          Permission Coverage
                        </span>

                        <span className="text-xs font-bold text-slate-900">
                          {coverage}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className={`h-full rounded-full ${
                            owner
                              ? "bg-slate-900"
                              : coverage >=
                                  80
                                ? "bg-emerald-500"
                                : coverage >=
                                    50
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                          }`}
                          style={{
                            width: `${coverage}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {
                            getPermissionCount(
                              user,
                            )
                          }{" "}
                          permissions
                        </span>

                        <span>
                          {
                            getTotalPermissions()
                          }{" "}
                          max
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Created
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                          {formatDate(
                            user.createdAt,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          ID
                        </p>

                        <p className="mt-1 truncate font-mono text-xs text-slate-700">
                          {
                            user._id
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          openUserDetails(
                            user,
                          )
                        }
                        className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </button>

                      {!owner &&
                        status !==
                          "suspended" && (
                          <button
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              void changeUserStatus(
                                user,
                                "suspend",
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}

                      {!owner &&
                        status ===
                          "suspended" && (
                          <button
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              void changeUserStatus(
                                user,
                                "activate",
                              )
                            }
                            className="rounded-lg border border-emerald-200 px-3 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}

                      {!owner && (
                        <button
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            void changeUserStatus(
                              user,
                              "remove",
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          filteredUsers.length >
            0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredUsers.length}
                </span>{" "}
                on this page of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.total}
                </span>{" "}
                total users.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    pagination.page <=
                    1
                  }
                  onClick={() =>
                    goToPage(
                      pagination.page -
                        1,
                    )
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="min-w-[80px] text-center text-xs font-semibold text-slate-600">
                  Page{" "}
                  {
                    pagination.page
                  }{" "}
                  /{" "}
                  {
                    pagination.totalPages
                  }
                </span>

                <button
                  type="button"
                  disabled={
                    pagination.page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    goToPage(
                      pagination.page +
                        1,
                    )
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* User Details Drawer */}
      {showDetails &&
        selectedUser && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close details"
              onClick={() =>
                setShowDetails(
                  false,
                )
              }
              className="absolute inset-0 bg-black/50"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Administrator Details
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {
                      selectedUser.name
                    }
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
                {/* Identity */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        isProtectedOwner(
                          selectedUser,
                        )
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      {isProtectedOwner(
                        selectedUser,
                      ) ? (
                        <ShieldCheck className="h-7 w-7" />
                      ) : (
                        <Shield className="h-7 w-7" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-base font-bold text-slate-900">
                        {
                          selectedUser.name
                        }
                      </h4>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {
                          selectedUser.email
                        }
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {renderUserRoleBadge(
                          selectedUser,
                        )}

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
                            selectedUser.status,
                          )}`}
                        >
                          {displayStatus(
                            selectedUser.status,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailBox
                    label="User ID"
                    value={
                      selectedUser._id
                    }
                    copyValue={
                      selectedUser._id
                    }
                    onCopy={() =>
                      void copyText(
                        selectedUser._id,
                        "User ID",
                      )
                    }
                  />

                  <DetailBox
                    label="Email"
                    value={
                      selectedUser.email
                    }
                    copyValue={
                      selectedUser.email
                    }
                    onCopy={() =>
                      void copyText(
                        selectedUser.email,
                        "Email",
                      )
                    }
                  />

                  <DetailBox
                    label="Created"
                    value={formatDate(
                      selectedUser.createdAt,
                    )}
                  />

                  <DetailBox
                    label="Updated"
                    value={formatDate(
                      selectedUser.updatedAt,
                    )}
                  />
                </div>

                {/* Permission Coverage */}
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Permission Coverage
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        Access inherited from the assigned role.
                      </p>
                    </div>

                    <span className="text-lg font-bold text-slate-900">
                      {
                        getPermissionCoverage(
                          selectedUser,
                        )
                      }
                      %
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        isProtectedOwner(
                          selectedUser,
                        )
                          ? "bg-slate-900"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${getPermissionCoverage(
                          selectedUser,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {
                        getPermissionCount(
                          selectedUser,
                        )
                      } permissions
                    </span>

                    <span>
                      {
                        getTotalPermissions()
                      } available
                    </span>
                  </div>
                </div>

                {/* Permission Modules */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Granted Modules
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        Actual permissions available to this user.
                      </p>
                    </div>

                    <Link
                      href="/admin/roles-permissions/roles"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Manage Roles
                    </Link>
                  </div>

                  <div className="mt-3 space-y-2">
                    {PERMISSION_MODULES.map(
                      (module) => {
                        const permissions =
                          getUserPermissions(
                            selectedUser,
                          );

                        const actions =
                          permissions[
                            module.key
                          ] || [];

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
                              </div>

                              <span className="text-xs font-semibold text-slate-500">
                                {
                                  actions.length
                                }
                                /
                                {
                                  module.actions
                                    .length
                                }
                              </span>
                            </div>

                            {actions.length >
                            0 ? (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {actions.map(
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
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-slate-400">
                                No permission
                              </p>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Invitation Info */}
                {(selectedUser.invitedBy ||
                  selectedUser.invitationExpires) && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                      <div>
                        <h4 className="text-sm font-semibold text-blue-900">
                          Invitation Information
                        </h4>

                        {selectedUser.invitedBy && (
                          <p className="mt-2 text-xs text-blue-800">
                            Invited by:{" "}
                            {
                              selectedUser.invitedBy
                            }
                          </p>
                        )}

                        {selectedUser.invitationExpires && (
                          <p className="mt-1 text-xs text-blue-800">
                            Invitation expires:{" "}
                            {formatDate(
                              selectedUser.invitationExpires,
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-5">
                  {!isProtectedOwner(
                    selectedUser,
                  ) &&
                    selectedUser.status !==
                      "suspended" && (
                      <button
                        type="button"
                        disabled={
                          saving
                        }
                        onClick={() =>
                          void changeUserStatus(
                            selectedUser,
                            "suspend",
                          )
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <UserMinus className="h-4 w-4" />
                        Suspend
                      </button>
                    )}

                  {!isProtectedOwner(
                    selectedUser,
                  ) &&
                    selectedUser.status ===
                      "suspended" && (
                      <button
                        type="button"
                        disabled={
                          saving
                        }
                        onClick={() =>
                          void changeUserStatus(
                            selectedUser,
                            "activate",
                          )
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                      >
                        <UserCheck className="h-4 w-4" />
                        Activate
                      </button>
                    )}

                  {!isProtectedOwner(
                    selectedUser,
                  ) && (
                    <button
                      type="button"
                      disabled={
                        saving
                      }
                      onClick={() => {
                        void changeUserStatus(
                          selectedUser,
                          "remove",
                        );
                        setShowDetails(
                          false,
                        );
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setShowDetails(
                        false,
                      )
                    }
                    className="ml-auto inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
          <div className="mx-auto my-5 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <UserPlus className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Invite Administrator
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Create a controlled invitation with a custom role.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowInvite(
                    false,
                  )
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                inviteUser
              }
              className="grid lg:grid-cols-[1fr_360px]"
            >
              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    value={
                      inviteForm.name
                    }
                    onChange={(
                      event,
                    ) =>
                      setInviteForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          name:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    required
                    maxLength={100}
                    placeholder="Employee name"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Work Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="email"
                      value={
                        inviteForm.email
                      }
                      onChange={(
                        event,
                      ) =>
                        setInviteForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            email:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      required
                      maxLength={254}
                      placeholder="employee@company.com"
                      className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                      Assign Role
                    </label>

                    <Link
                      href="/admin/roles-permissions/roles"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Manage roles
                    </Link>
                  </div>

                  <select
                    value={
                      inviteForm.roleId
                    }
                    onChange={(
                      event,
                    ) =>
                      setInviteForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          roleId:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    required
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="">
                      Select a custom role
                    </option>

                    {roleOptions.map(
                      (role) => (
                        <option
                          key={
                            role._id
                          }
                          value={
                            role._id
                          }
                        >
                          {
                            role.name
                          }
                        </option>
                      ),
                    )}
                  </select>

                  {roleOptions.length ===
                    0 && (
                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      No custom roles are available. Create a role first.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Controlled access
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-800">
                        The invited administrator will receive the selected
                        role and its permissions. The Owner keeps control of
                        which modules the role can access.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowInvite(
                        false,
                      )
                    }
                    className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      roleOptions.length ===
                        0
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}

                    Send Invitation
                  </button>
                </div>
              </div>

              {/* Role Preview */}
              <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
                {selectedInviteRole ? (
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Shield className="h-5 w-5 text-slate-700" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {
                            selectedInviteRole.name
                          }
                        </p>

                        <p className="font-mono text-[10px] text-slate-400">
                          {
                            selectedInviteRole.slug
                          }
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      {selectedInviteRole.description ||
                        "No role description provided."}
                    </p>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          Access Coverage
                        </span>

                        <span className="text-sm font-bold text-slate-900">
                          {
                            selectedInvitePermissionCount
                          }{" "}
                          permissions
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (selectedInvitePermissionCount /
                                  getTotalPermissions()) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {PERMISSION_MODULES.map(
                        (module) => {
                          const actions =
                            selectedInvitePermissions[
                              module.key
                            ] || [];

                          if (
                            actions.length ===
                            0
                          ) {
                            return null;
                          }

                          return (
                            <div
                              key={
                                module.key
                              }
                              className="rounded-xl border border-slate-200 bg-white p-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-700">
                                  {
                                    module.label
                                  }
                                </span>

                                <span className="text-[10px] font-semibold text-slate-400">
                                  {
                                    actions.length
                                  }
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-1">
                                {actions.map(
                                  (
                                    action,
                                  ) => (
                                    <span
                                      key={
                                        action
                                      }
                                      className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700"
                                    >
                                      {
                                        ACTION_LABELS[
                                          action
                                        ]
                                      }
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                      <SlidersHorizontal className="h-7 w-7 text-slate-400" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                      Role Preview
                    </h3>

                    <p className="mt-1 max-w-[250px] text-xs leading-5 text-slate-500">
                      Select a custom role to preview the exact permissions
                      this administrator will receive.
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({
  label,
  value,
  icon,
  loading,
  description,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
  description: string;
  tone?: "default" | "green" | "amber" | "red";
}) {
  const classes =
    tone === "green"
      ? "border-emerald-100 bg-emerald-50/60 text-emerald-700"
      : tone === "amber"
        ? "border-amber-100 bg-amber-50/60 text-amber-700"
        : tone === "red"
          ? "border-red-100 bg-red-50/60 text-red-700"
          : "border-slate-200 bg-white text-slate-700";

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${classes}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>

        {icon}
      </div>

      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-black/5" />
      ) : (
        <p className="mt-3 text-2xl font-bold">
          {value}
        </p>
      )}

      <p className="mt-1 text-xs opacity-70">
        {description}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DetailBox({
  label,
  value,
  copyValue,
  onCopy,
}: {
  label: string;
  value: string;
  copyValue?: string;
  onCopy?: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-medium text-slate-700">
          {value}
        </p>

        {copyValue &&
          onCopy && (
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
              title={`Copy ${label}`}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
      </div>
    </div>
  );
}