"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Edit3,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
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

type PermissionMap = Record<string, PermissionAction[]>;

type Role = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: PermissionMap;
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
  status?: "active" | "suspended" | "removed" | "pending";
  roleId?: string | null;
  roleData?: Role | null;
  permissions?: PermissionMap;
  invitedBy?: string | null;
  invitationExpires?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type InvitationRole =
  | string
  | {
      _id?: string;
      name?: string;
      slug?: string;
    }
  | null;

type Invitation = {
  _id: string;
  name: string;
  email: string;
  role?: InvitationRole;
  roleId?: string | null;
  status?: string;
  tokenHash?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  acceptedAt?: string | null;
  passwordSetAt?: string | null;
  invitedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  roleData?: Role | null;
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

type InvitationsResponse = {
  success: boolean;
  data?: Invitation[];
  items?: Invitation[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  message?: string;
};

const PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard", actions: ["view"] },
  {
    key: "books",
    label: "Books",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "categories",
    label: "Categories",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "inventory",
    label: "Inventory",
    actions: ["view", "update"],
  },
  {
    key: "orders",
    label: "Orders",
    actions: ["view", "update", "cancel", "refund"],
  },
  {
    key: "customers",
    label: "Customers",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "coupons",
    label: "Coupons",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "reviews",
    label: "Reviews",
    actions: ["view", "edit", "delete"],
  },
  {
    key: "pages",
    label: "Pages / CMS",
    actions: ["view", "create", "edit", "delete"],
  },
  { key: "reports", label: "Reports", actions: ["view"] },
  {
    key: "payments",
    label: "Payments",
    actions: ["view", "update", "refund"],
  },
  {
    key: "adminUsers",
    label: "Users",
    actions: ["view", "invite", "edit", "suspend", "remove"],
  },
  {
    key: "settings",
    label: "Site Settings",
    actions: ["view", "edit"],
  },
] as const;

const ACTION_LABELS: Record<PermissionAction, string> = {
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

function normalizePermissions(
  permissions?: PermissionMap | null,
): PermissionMap {
  const normalized = createEmptyPermissions();

  if (!permissions) {
    return normalized;
  }

  for (const module of PERMISSION_MODULES) {
    const current = permissions[module.key] || [];

    normalized[module.key] = module.actions.filter((action) =>
      current.includes(action as PermissionAction),
    ) as PermissionAction[];
  }

  return normalized;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "sent":
      return "bg-blue-50 text-blue-700";
    case "accepted":
      return "bg-emerald-50 text-emerald-700";
    case "password_set":
    case "password-created":
    case "password-changed":
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "expired":
      return "bg-red-50 text-red-700";
    case "cancelled":
    case "canceled":
      return "bg-slate-100 text-slate-600";
    case "suspended":
      return "bg-red-50 text-red-700";
    case "removed":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function displayStatus(status?: string) {
  const value = String(status || "pending");

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInvitationProgress(invitation: Invitation) {
  const status = String(invitation.status || "")
    .toLowerCase()
    .replace(/_/g, "-");

  const cancelled =
    status === "cancelled" || status === "canceled";

  const sent = Boolean(invitation.createdAt) && !cancelled;

  const accepted =
    Boolean(invitation.acceptedAt) ||
    [
      "accepted",
      "email-accepted",
      "password-set",
      "password-created",
      "password-changed",
      "completed",
    ].includes(status);

  const passwordCreated =
    Boolean(invitation.passwordSetAt) ||
    [
      "password-set",
      "password-created",
      "password-changed",
      "completed",
    ].includes(status);

  return { sent, accepted, passwordCreated };
}

function getInvitationRoleName(invitation: Invitation) {
  if (invitation.roleData?.name) {
    return invitation.roleData.name;
  }

  const role = invitation.role;

  if (typeof role === "string" && role.trim()) {
    return role;
  }

  if (role && typeof role === "object") {
    if (typeof role.name === "string" && role.name.trim()) {
      return role.name;
    }

    if (typeof role.slug === "string" && role.slug.trim()) {
      return role.slug;
    }
  }

  return "Custom Role";
}

export default function RolesPermissionsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [invitationCount, setInvitationCount] = useState(0);

  const [activeTab, setActiveTab] = useState<
    "users" | "invitations" | "roles"
  >("users");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    roleId: "",
  });

  const [roleForm, setRoleForm] = useState<{
    name: string;
    description: string;
    permissions: PermissionMap;
  }>({
    name: "",
    description: "",
    permissions: createEmptyPermissions(),
  });

  const [invitationActionId, setInvitationActionId] = useState("");

  const changeTab = (
    tab: "users" | "invitations" | "roles",
  ) => {
    setActiveTab(tab);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "studystow-admin-roles-tab",
        tab,
      );
    }

    setError("");
  };

  useEffect(() => {
    const storedTab = window.localStorage.getItem(
      "studystow-admin-roles-tab",
    );

    if (
      storedTab === "users" ||
      storedTab === "invitations" ||
      storedTab === "roles"
    ) {
      setActiveTab(storedTab);
    }
  }, []);

  const fetchUsers = useCallback(
    async (page = 1) => {
      const params = new URLSearchParams();

      params.set("type", "users");
      params.set("page", String(page));
      params.set("limit", String(pagination.limit));

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `/api/admin/roles-permissions?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );

      const data: UsersResponse = await response
        .json()
        .catch(() => ({
          success: false,
          data: [],
          message: "Invalid server response.",
        }));

      if (response.status === 401) {
        throw new Error("You are not authorized.");
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to manage users.",
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load users.",
        );
      }

      setUsers(Array.isArray(data.data) ? data.data : []);

      if (data.pagination) {
        setPagination({
          page: Number(data.pagination.page || 1),
          limit: Number(data.pagination.limit || 20),
          total: Number(data.pagination.total || 0),
          totalPages: Number(
            data.pagination.totalPages || 1,
          ),
        });
      }
    },
    [pagination.limit, search, statusFilter],
  );

  const fetchRoles = useCallback(async () => {
    const response = await fetch(
      "/api/admin/roles-permissions/roles",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
    );

    const data: RolesResponse = await response
      .json()
      .catch(() => ({
        success: false,
        data: [],
        message: "Invalid server response.",
      }));

    if (response.status === 401) {
      throw new Error("You are not authorized.");
    }

    if (response.status === 403) {
      throw new Error(
        "You do not have permission to manage roles.",
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to load roles.",
      );
    }

    setRoles(Array.isArray(data.data) ? data.data : []);
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      setInvitationsLoading(true);

      const response = await fetch(
        "/api/admin/roles-permissions/invitations?limit=100",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );

      const data: InvitationsResponse = await response
        .json()
        .catch(() => ({
          success: false,
          data: [],
          message: "Invalid server response.",
        }));

      if (response.status === 401) {
        throw new Error("Your session has expired.");
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to view invitations.",
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load invitations.",
        );
      }

      const list = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.items)
          ? data.items
          : [];

      setInvitations(list);

      const active = list.filter((item) => {
        const status = String(item.status || "").toLowerCase();

        return status === "pending" || status === "sent";
      });

      setInvitationCount(active.length);
    } catch (err) {
      console.error("Invitation loading error:", err);

      setInvitations([]);
      setInvitationCount(0);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load invitations.",
      );
    } finally {
      setInvitationsLoading(false);
    }
  }, []);

  const loadData = useCallback(
    async (page = 1, showLoader = true) => {
      try {
        setError("");

        if (showLoader) {
          setLoading(true);
        }

        await Promise.all([
          fetchUsers(page),
          fetchRoles(),
        ]);

        await fetchInvitations();
      } catch (err) {
        console.error(
          "Roles permissions error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Roles & Permissions.",
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers, fetchRoles, fetchInvitations],
  );

  useEffect(() => {
    void loadData(1);
  }, [statusFilter, loadData]);

  useEffect(() => {
    if (activeTab === "invitations") {
      void fetchInvitations();
    }
  }, [activeTab, fetchInvitations]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.roleData?.name
          ?.toLowerCase()
          .includes(query),
    );
  }, [users, search]);

  const openCreateRole = () => {
    setEditingRole(null);

    setRoleForm({
      name: "",
      description: "",
      permissions: createEmptyPermissions(),
    });

    setError("");
    setShowRoleModal(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);

    setRoleForm({
      name: role.name,
      description: role.description || "",
      permissions: normalizePermissions(
        role.permissions,
      ),
    });

    setError("");
    setShowRoleModal(true);
  };

  const togglePermission = (
    moduleKey: string,
    action: PermissionAction,
  ) => {
    setRoleForm((current) => {
      const currentActions =
        current.permissions[moduleKey] || [];

      const exists =
        currentActions.includes(action);

      return {
        ...current,
        permissions: {
          ...current.permissions,
          [moduleKey]: exists
            ? currentActions.filter(
                (item) => item !== action,
              )
            : [...currentActions, action],
        },
      };
    });
  };

  const toggleModule = (
    moduleKey: string,
    actions: readonly string[],
  ) => {
    setRoleForm((current) => {
      const currentActions =
        current.permissions[moduleKey] || [];

      const allSelected =
        actions.length > 0 &&
        actions.every((action) =>
          currentActions.includes(
            action as PermissionAction,
          ),
        );

      return {
        ...current,
        permissions: {
          ...current.permissions,
          [moduleKey]: allSelected
            ? []
            : [...(actions as PermissionAction[])],
        },
      };
    });
  };

  const saveRole = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!roleForm.name.trim()) {
      setError("Role name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const endpoint = editingRole
        ? `/api/admin/roles-permissions/roles/${editingRole._id}`
        : "/api/admin/roles-permissions/roles";

      const method = editingRole ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
          permissions: roleForm.permissions,
        }),
      });

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to modify roles.",
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to save role.",
        );
      }

      setShowRoleModal(false);

      await loadData(
        pagination.page,
        false,
      );
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

  const inviteUser = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const name = inviteForm.name.trim();
    const email = inviteForm.email.trim().toLowerCase();

    if (!name || !email || !inviteForm.roleId) {
      setError(
        "Name, email and role are required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/admin/roles-permissions/invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            email,
            roleId: inviteForm.roleId,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to invite users.",
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to create invitation.",
        );
      }

      setShowInvite(false);

      setInviteForm({
        name: "",
        email: "",
        roleId: "",
      });

      await fetchInvitations();
      await fetchUsers(1);
    } catch (err) {
      console.error(
        "Invitation error:",
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

  const resendInvitation = async (
    invitation: Invitation,
  ) => {
    try {
      setInvitationActionId(
        invitation._id,
      );
      setError("");

      const response = await fetch(
        `/api/admin/roles-permissions/${invitation._id}/resend-invite`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to resend invitations.",
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to resend invitation.",
        );
      }

      await fetchInvitations();
    } catch (err) {
      console.error(
        "Resend invitation error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend invitation.",
      );
    } finally {
      setInvitationActionId("");
    }
  };

  const cancelInvitation = async (
    invitation: Invitation,
  ) => {
    if (
      !window.confirm(
        `Cancel invitation for ${invitation.email}?`,
      )
    ) {
      return;
    }

    try {
      setInvitationActionId(
        invitation._id,
      );
      setError("");

      const response = await fetch(
        `/api/admin/roles-permissions/invitations/${invitation._id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to cancel invitations.",
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to cancel invitation.",
        );
      }

      await fetchInvitations();
    } catch (err) {
      console.error(
        "Cancel invitation error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel invitation.",
      );
    } finally {
      setInvitationActionId("");
    }
  };

  const changeUserStatus = async (
    user: AdminUser,
    action:
      | "suspend"
      | "activate"
      | "remove",
  ) => {
    const owner =
      Boolean(user.isOwner) ||
      user.role === "owner" ||
      String(
        user.adminRole || "",
      ).toLowerCase() === "owner" ||
      String(
        user.adminRole || "",
      ).toLowerCase() === "super_admin";

    if (owner) {
      setError(
        "The Owner account is protected and cannot be modified here.",
      );
      return;
    }

    const actionText =
      action === "remove"
        ? "remove"
        : action === "suspend"
          ? "suspend"
          : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} ${user.name}?`,
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/admin/roles-permissions/${user._id}/${action}`,
        {
          method:
            action === "remove"
              ? "DELETE"
              : "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          ...(action === "remove"
            ? {
                body: JSON.stringify({
                  reason:
                    "User removed by owner.",
                }),
              }
            : {}),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (response.status === 403) {
        throw new Error(
          data?.message ||
            "You do not have permission to perform this action.",
        );
      }

      if (response.status === 404) {
        throw new Error(
          data?.message ||
            "User not found.",
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            `Unable to ${actionText} user.`,
        );
      }

      await fetchUsers(
        pagination.page,
      );
    } catch (err) {
      console.error(
        "User status error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update user.",
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

    if (
      !window.confirm(
        `Delete role "${role.name}"?`,
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/admin/roles-permissions/roles/${role._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired.",
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to delete roles.",
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to delete role.",
        );
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

  const handlePageRefresh = () => {
    setError("");

    if (activeTab === "invitations") {
      void fetchInvitations();
      return;
    }

    if (activeTab === "roles") {
      void fetchRoles();
      return;
    }

    void fetchUsers(
      pagination.page,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-slate-900" />

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Roles & Permissions
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Control user access using database roles and permissions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePageRefresh}
              disabled={
                loading ||
                invitationsLoading ||
                saving
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ||
                  invitationsLoading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

            {activeTab === "roles" ? (
              <button
                type="button"
                onClick={openCreateRole}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create Role
              </button>
            ) : activeTab === "users" ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setShowInvite(true);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <UserPlus className="h-4 w-4" />
                Invite User
              </button>
            ) : null}
          </div>
        </div>

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Action failed
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-600 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex overflow-x-auto border-b border-slate-200">
          <button
            type="button"
            onClick={() => changeTab("users")}
            className={`shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "users"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Users

            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {pagination.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              changeTab("invitations")
            }
            className={`shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab ===
              "invitations"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Invitations

            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                invitationCount > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {invitationCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => changeTab("roles")}
            className={`shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "roles"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Roles

            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {roles.length}
            </span>
          </button>
        </div>

        {activeTab === "users" && (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_190px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        void fetchUsers(1);
                      }
                    }}
                    placeholder="Search users..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
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
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                  <Shield className="h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No users found
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    There are no matching user records in MongoDB.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            User
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Role
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Created
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(
                          (user) => {
                            const status =
                              user.status ||
                              "active";

                            const owner =
                              Boolean(
                                user.isOwner,
                              ) ||
                              user.role ===
                                "owner" ||
                              String(
                                user.adminRole ||
                                  "",
                              ).toLowerCase() ===
                                "owner" ||
                              String(
                                user.adminRole ||
                                  "",
                              ).toLowerCase() ===
                                "super_admin";

                            return (
                              <tr
                                key={
                                  user._id
                                }
                                className="transition hover:bg-slate-50"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                      <Shield className="h-5 w-5 text-slate-600" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-slate-900">
                                        {
                                          user.name
                                        }
                                      </p>

                                      <p className="truncate text-xs text-slate-500">
                                        {
                                          user.email
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                    {owner
                                      ? "Owner / Super Admin"
                                      : user
                                          .roleData
                                          ?.name ||
                                        "Admin"}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                                      status,
                                    )}`}
                                  >
                                    {displayStatus(
                                      status,
                                    )}
                                  </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                                  {formatDate(
                                    user.createdAt,
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex justify-end gap-2">
                                    {!owner &&
                                      status !==
                                        "suspended" && (
                                        <button
                                          type="button"
                                          disabled={
                                            saving
                                          }
                                          onClick={() =>
                                            changeUserStatus(
                                              user,
                                              "suspend",
                                            )
                                          }
                                          title="Suspend user"
                                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
                                            changeUserStatus(
                                              user,
                                              "activate",
                                            )
                                          }
                                          title="Activate user"
                                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
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
                                          changeUserStatus(
                                            user,
                                            "remove",
                                          )
                                        }
                                        title="Remove user"
                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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

                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredUsers.map(
                      (user) => {
                        const status =
                          user.status ||
                          "active";

                        const owner =
                          Boolean(
                            user.isOwner,
                          ) ||
                          user.role ===
                            "owner" ||
                          String(
                            user.adminRole ||
                              "",
                          ).toLowerCase() ===
                            "owner" ||
                          String(
                            user.adminRole ||
                              "",
                          ).toLowerCase() ===
                            "super_admin";

                        return (
                          <div
                            key={
                              user._id
                            }
                            className="space-y-4 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                  <Shield className="h-5 w-5 text-slate-600" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {
                                      user.name
                                    }
                                  </p>

                                  <p className="truncate text-xs text-slate-500">
                                    {
                                      user.email
                                    }
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${statusClasses(
                                  status,
                                )}`}
                              >
                                {displayStatus(
                                  status,
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                                  {owner
                                    ? "Owner / Super Admin"
                                    : user
                                        .roleData
                                        ?.name ||
                                      "Admin"}
                                </span>

                                <p className="mt-2 text-xs text-slate-400">
                                  {formatDate(
                                    user.createdAt,
                                  )}
                                </p>
                              </div>

                              {!owner && (
                                <div className="flex gap-2">
                                  {status ===
                                  "suspended" ? (
                                    <button
                                      type="button"
                                      disabled={
                                        saving
                                      }
                                      onClick={() =>
                                        changeUserStatus(
                                          user,
                                          "activate",
                                        )
                                      }
                                      className="rounded-lg border border-slate-200 p-2 text-emerald-600"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={
                                        saving
                                      }
                                      onClick={() =>
                                        changeUserStatus(
                                          user,
                                          "suspend",
                                        )
                                      }
                                      className="rounded-lg border border-slate-200 p-2 text-red-600"
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    disabled={
                                      saving
                                    }
                                    onClick={() =>
                                      changeUserStatus(
                                        user,
                                        "remove",
                                      )
                                    }
                                    className="rounded-lg border border-slate-200 p-2 text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {pagination.totalPages >
                    1 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">
                        Page{" "}
                        {pagination.page} of{" "}
                        {pagination.totalPages}
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={
                            pagination.page <=
                              1 ||
                            loading
                          }
                          onClick={() =>
                            void fetchUsers(
                              pagination.page -
                                1,
                            )
                          }
                          className="h-9 rounded-lg border border-slate-200 px-3 text-sm disabled:opacity-50"
                        >
                          Previous
                        </button>

                        <button
                          type="button"
                          disabled={
                            pagination.page >=
                              pagination.totalPages ||
                            loading
                          }
                          onClick={() =>
                            void fetchUsers(
                              pagination.page +
                                1,
                            )
                          }
                          className="h-9 rounded-lg border border-slate-200 px-3 text-sm disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === "invitations" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                User Invitations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track invitation delivery, email acceptance,
                and password setup for StudyStow users.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {invitationsLoading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                  <Mail className="h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No invitations
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    There are currently no invitations stored in MongoDB.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {invitations.map(
                    (invitation) => {
                      const status =
                        String(
                          invitation.status ||
                            "pending",
                        ).toLowerCase();

                      const roleName =
                        getInvitationRoleName(
                          invitation,
                        );

                      const busy =
                        invitationActionId ===
                        invitation._id;

                      const canAction =
                        status === "pending" ||
                        status === "sent";

                      const progress =
                        getInvitationProgress(
                          invitation,
                        );

                      return (
                        <div
                          key={invitation._id}
                          className="p-5 transition hover:bg-slate-50"
                        >
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                  <Mail className="h-5 w-5 text-slate-600" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-900">
                                    {
                                      invitation.name
                                    }
                                  </p>

                                  <p className="truncate text-sm text-slate-500">
                                    {
                                      invitation.email
                                    }
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                      {roleName}
                                    </span>

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                                        status,
                                      )}`}
                                    >
                                      {displayStatus(
                                        status,
                                      )}
                                    </span>
                                  </div>

                                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                                    <p>
                                      Sent:{" "}
                                      {formatDate(
                                        invitation.createdAt,
                                      )}
                                    </p>

                                    {invitation.expiresAt && (
                                      <p>
                                        Expires:{" "}
                                        {formatDate(
                                          invitation.expiresAt,
                                        )}
                                      </p>
                                    )}

                                    {invitation.acceptedAt && (
                                      <p>
                                        Email accepted:{" "}
                                        {formatDate(
                                          invitation.acceptedAt,
                                        )}
                                      </p>
                                    )}

                                    {invitation.passwordSetAt && (
                                      <p>
                                        Password created:{" "}
                                        {formatDate(
                                          invitation.passwordSetAt,
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {canAction && (
                                <div className="flex shrink-0 gap-2">
                                  <button
                                    type="button"
                                    disabled={
                                      busy
                                    }
                                    onClick={() =>
                                      void resendInvitation(
                                        invitation,
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {busy ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    )}
                                    Resend
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      busy
                                    }
                                    onClick={() =>
                                      void cancelInvitation(
                                        invitation,
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    Invitation Progress
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Current onboarding status
                                  </p>
                                </div>

                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
                                  {progress.passwordCreated
                                    ? "Complete"
                                    : progress.accepted
                                      ? "Password Pending"
                                      : progress.sent
                                        ? "Awaiting User"
                                        : "Not Sent"}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div
                                  className={`rounded-lg border p-4 ${
                                    progress.sent
                                      ? "border-emerald-200 bg-emerald-50"
                                      : "border-slate-200 bg-white"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                        progress.sent
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      {progress.sent ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Mail className="h-4 w-4" />
                                      )}
                                    </div>

                                    <div>
                                      <p
                                        className={`text-sm font-semibold ${
                                          progress.sent
                                            ? "text-emerald-800"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        Invitation Sent
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        {progress.sent
                                          ? "Invitation has been created and sent."
                                          : "Invitation has not been sent."}
                                      </p>

                                      {invitation.createdAt && (
                                        <p className="mt-2 text-[11px] text-slate-400">
                                          {formatDate(
                                            invitation.createdAt,
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className={`rounded-lg border p-4 ${
                                    progress.accepted
                                      ? "border-emerald-200 bg-emerald-50"
                                      : "border-slate-200 bg-white"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                        progress.accepted
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      {progress.accepted ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <UserCheck className="h-4 w-4" />
                                      )}
                                    </div>

                                    <div>
                                      <p
                                        className={`text-sm font-semibold ${
                                          progress.accepted
                                            ? "text-emerald-800"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        Email Accepted
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        {progress.accepted
                                          ? "The invited user accepted the invitation."
                                          : "Waiting for the user to accept the invitation."}
                                      </p>

                                      {invitation.acceptedAt && (
                                        <p className="mt-2 text-[11px] text-slate-400">
                                          {formatDate(
                                            invitation.acceptedAt,
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className={`rounded-lg border p-4 ${
                                    progress.passwordCreated
                                      ? "border-emerald-200 bg-emerald-50"
                                      : "border-slate-200 bg-white"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                        progress.passwordCreated
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      {progress.passwordCreated ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <ShieldCheck className="h-4 w-4" />
                                      )}
                                    </div>

                                    <div>
                                      <p
                                        className={`text-sm font-semibold ${
                                          progress.passwordCreated
                                            ? "text-emerald-800"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        Password Created
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        {progress.passwordCreated
                                          ? "The user has completed password setup."
                                          : "Waiting for password creation."}
                                      </p>

                                      {invitation.passwordSetAt && (
                                        <p className="mt-2 text-[11px] text-slate-400">
                                          {formatDate(
                                            invitation.passwordSetAt,
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "roles" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                  ),
                )
              : roles.length === 0
                ? (
                    <div className="col-span-full rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
                      <Shield className="mx-auto h-10 w-10 text-slate-300" />

                      <h3 className="mt-4 font-semibold text-slate-900">
                        No roles found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        No roles are currently stored in MongoDB.
                      </p>
                    </div>
                  )
                : roles.map((role) => {
                    const permissionCount =
                      Object.values(
                        role.permissions || {},
                      ).reduce(
                        (
                          total,
                          actions,
                        ) =>
                          total +
                          actions.length,
                        0,
                      );

                    return (
                      <div
                        key={role._id}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <Shield className="h-5 w-5 text-slate-700" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-slate-900">
                                {role.name}
                              </h3>

                              {role.isSystem && (
                                <span className="text-[11px] font-medium text-slate-400">
                                  System Role
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditRole(role)
                              }
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              title="Edit role"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

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
                                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                title="Delete role"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="mt-4 min-h-[40px] text-sm text-slate-500">
                          {role.description ||
                            "No description provided."}
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="text-xs text-slate-500">
                            {
                              permissionCount
                            }{" "}
                            permissions
                          </span>

                          <span className="max-w-[150px] truncate font-mono text-[11px] text-slate-400">
                            {role.slug}
                          </span>
                        </div>
                      </div>
                    );
                  })}
          </div>
        )}
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Invite User
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Send an invitation with a selected role and permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowInvite(false)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={inviteUser}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Name
                </label>

                <input
                  value={inviteForm.name}
                  onChange={(event) =>
                    setInviteForm(
                      (current) => ({
                        ...current,
                        name: event.target
                          .value,
                      }),
                    )
                  }
                  required
                  maxLength={100}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder="User name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(event) =>
                      setInviteForm(
                        (current) => ({
                          ...current,
                          email:
                            event.target
                              .value,
                        }),
                      )
                    }
                    required
                    maxLength={254}
                    className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    placeholder="employee@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <select
                  value={inviteForm.roleId}
                  onChange={(event) =>
                    setInviteForm(
                      (current) => ({
                        ...current,
                        roleId:
                          event.target
                            .value,
                      }),
                    )
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">
                    Select role
                  </option>

                  {roles
                    .filter(
                      (role) =>
                        !role.isSystem,
                    )
                    .map((role) => (
                      <option
                        key={role._id}
                        value={
                          role._id
                        }
                      >
                        {role.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
                The selected role controls which parts of the admin dashboard
                this user can access.
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
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
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  <UserPlus className="h-4 w-4" />

                  Invite User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-8 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingRole
                    ? "Edit Role"
                    : "Create Role"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Configure granular access for this user role.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRoleModal(
                    false,
                  )
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveRole}
            >
              <div className="space-y-6 p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Role Name
                    </label>

                    <input
                      value={roleForm.name}
                      onChange={(event) =>
                        setRoleForm(
                          (current) => ({
                            ...current,
                            name: event.target
                              .value,
                          }),
                        )
                      }
                      required
                      maxLength={80}
                      placeholder="e.g. Operations Manager"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Description
                    </label>

                    <input
                      value={
                        roleForm.description
                      }
                      onChange={(event) =>
                        setRoleForm(
                          (current) => ({
                            ...current,
                            description:
                              event.target
                                .value,
                          }),
                        )
                      }
                      maxLength={300}
                      placeholder="Describe this role"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Permissions
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      These permissions are saved with the role in MongoDB.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {PERMISSION_MODULES.map(
                      (module) => {
                        const selected =
                          roleForm
                            .permissions[
                            module.key
                          ] || [];

                        const allSelected =
                          module.actions.every(
                            (
                              action,
                            ) =>
                              selected.includes(
                                action as PermissionAction,
                              ),
                          );

                        return (
                          <div
                            key={
                              module.key
                            }
                            className="p-4"
                          >
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {
                                    module.label
                                  }
                                </p>

                                <p className="text-xs text-slate-400">
                                  {
                                    selected.length
                                  }{" "}
                                  of{" "}
                                  {
                                    module
                                      .actions
                                      .length
                                  }{" "}
                                  selected
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleModule(
                                    module.key,
                                    module.actions,
                                  )
                                }
                                className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 sm:text-right"
                              >
                                {allSelected
                                  ? "Clear all"
                                  : "Select all"}
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {module.actions.map(
                                (
                                  action,
                                ) => {
                                  const selectedAction =
                                    selected.includes(
                                      action as PermissionAction,
                                    );

                                  return (
                                    <button
                                      key={
                                        action
                                      }
                                      type="button"
                                      onClick={() =>
                                        togglePermission(
                                          module.key,
                                          action as PermissionAction,
                                        )
                                      }
                                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                        selectedAction
                                          ? "border-slate-900 bg-slate-900 text-white"
                                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                                      }`}
                                    >
                                      {selectedAction && (
                                        <Check className="h-3.5 w-3.5" />
                                      )}

                                      {
                                        ACTION_LABELS[
                                          action as PermissionAction
                                        ]
                                      }
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowRoleModal(
                      false,
                    )
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingRole
                    ? "Save Changes"
                    : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
