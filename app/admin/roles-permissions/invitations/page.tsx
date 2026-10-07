
"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

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
  roleData?: {
    _id?: string;
    name?: string;
    slug?: string;
    description?: string;
  } | null;
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

type SortKey =
  | "newest"
  | "oldest"
  | "name"
  | "expiry";

type StatusFilter =
  | "all"
  | "active"
  | "pending"
  | "sent"
  | "accepted"
  | "completed"
  | "expired"
  | "cancelled";

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

function formatRelativeDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);

  return formatter.format(diffDays, "day");
}

function normalizeStatus(status?: string) {
  return String(status || "pending")
    .toLowerCase()
    .replace(/_/g, "-");
}

function displayStatus(status?: string) {
  return String(status || "pending")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClasses(status?: string) {
  switch (normalizeStatus(status)) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "sent":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "accepted":
    case "email-accepted":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "password-set":
    case "password-created":
    case "password-changed":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "expired":
      return "bg-red-50 text-red-700 border-red-200";

    case "cancelled":
    case "canceled":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getInvitationRoleName(invitation: Invitation) {
  if (invitation.roleData?.name) {
    return invitation.roleData.name;
  }

  if (
    typeof invitation.role === "string" &&
    invitation.role.trim()
  ) {
    return invitation.role;
  }

  if (
    invitation.role &&
    typeof invitation.role === "object"
  ) {
    if (
      typeof invitation.role.name === "string" &&
      invitation.role.name.trim()
    ) {
      return invitation.role.name;
    }

    if (
      typeof invitation.role.slug === "string" &&
      invitation.role.slug.trim()
    ) {
      return invitation.role.slug;
    }
  }

  return "Custom Role";
}

function getProgress(invitation: Invitation) {
  const status = normalizeStatus(invitation.status);

  const cancelled =
    status === "cancelled" ||
    status === "canceled";

  const expired =
    status === "expired" ||
    (!invitation.acceptedAt &&
      invitation.expiresAt &&
      new Date(invitation.expiresAt).getTime() <
        Date.now());

  const sent =
    Boolean(invitation.createdAt) &&
    !cancelled;

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

  return {
    sent,
    accepted,
    passwordCreated,
    expired,
    cancelled,
  };
}

function getProgressPercent(invitation: Invitation) {
  const progress = getProgress(invitation);

  if (progress.cancelled) {
    return 0;
  }

  let completed = 0;

  if (progress.sent) {
    completed += 1;
  }

  if (progress.accepted) {
    completed += 1;
  }

  if (progress.passwordCreated) {
    completed += 1;
  }

  return Math.round((completed / 3) * 100);
}

function isExpiringSoon(invitation: Invitation) {
  const progress = getProgress(invitation);

  if (
    progress.cancelled ||
    progress.accepted ||
    progress.passwordCreated ||
    !invitation.expiresAt
  ) {
    return false;
  }

  const expiry = new Date(
    invitation.expiresAt,
  ).getTime();

  if (Number.isNaN(expiry)) {
    return false;
  }

  const remaining = expiry - Date.now();

  return (
    remaining > 0 &&
    remaining <= 24 * 60 * 60 * 1000
  );
}

function getAttentionReason(invitation: Invitation) {
  const progress = getProgress(invitation);

  if (progress.cancelled) {
    return "Cancelled";
  }

  if (progress.expired) {
    return "Invitation expired";
  }

  if (isExpiringSoon(invitation)) {
    return "Expires within 24 hours";
  }

  if (
    progress.accepted &&
    !progress.passwordCreated
  ) {
    return "Password setup pending";
  }

  if (
    progress.sent &&
    !progress.accepted
  ) {
    return "Waiting for acceptance";
  }

  return "";
}

export default function InvitationsPage() {
  const [invitations, setInvitations] =
    useState<Invitation[]>([]);

  const [loading, setLoading] = useState(true);
  const [
    invitationsLoading,
    setInvitationsLoading,
  ] = useState(false);

  const [actionId, setActionId] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>("all");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [
    attentionOnly,
    setAttentionOnly,
  ] = useState(false);

  const [sortBy, setSortBy] =
    useState<SortKey>("newest");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    selectedInvitation,
    setSelectedInvitation,
  ] = useState<Invitation | null>(null);

  const [autoRefresh, setAutoRefresh] =
    useState(false);

  const pageSize = 10;

  const fetchInvitations = useCallback(
    async (showInitialLoader = false) => {
      try {
        if (showInitialLoader) {
          setLoading(true);
        } else {
          setInvitationsLoading(true);
        }

        setError("");

        const response = await fetch(
          "/api/admin/roles-permissions/invitations?limit=100",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const data: InvitationsResponse =
          await response
            .json()
            .catch(() => ({
              success: false,
              data: [],
              message:
                "Invalid server response.",
            }));

        if (response.status === 401) {
          throw new Error(
            "Your session has expired.",
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to view invitations.",
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load invitations.",
          );
        }

        const list =
          Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.items)
              ? data.items
              : [];

        setInvitations(list);

        setCurrentPage((current) =>
          Math.min(
            current,
            Math.max(
              1,
              Math.ceil(
                list.length / pageSize,
              ),
            ),
          ),
        );
      } catch (err) {
        console.error(
          "Invitation loading error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load invitations.",
        );
      } finally {
        setLoading(false);
        setInvitationsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchInvitations(true);
  }, [fetchInvitations]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = window.setInterval(() => {
      void fetchInvitations(false);
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [autoRefresh, fetchInvitations]);

  const roleOptions = useMemo(() => {
    const values = new Set<string>();

    invitations.forEach((invitation) => {
      values.add(
        getInvitationRoleName(invitation),
      );
    });

    return Array.from(values).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [invitations]);

  const metrics = useMemo(() => {
    const total = invitations.length;

    let active = 0;
    let accepted = 0;
    let completed = 0;
    let expired = 0;
    let cancelled = 0;
    let expiringSoon = 0;
    let passwordPending = 0;

    invitations.forEach((invitation) => {
      const progress =
        getProgress(invitation);

      const status =
        normalizeStatus(
          invitation.status,
        );

      if (
        status === "pending" ||
        status === "sent"
      ) {
        active += 1;
      }

      if (progress.accepted) {
        accepted += 1;
      }

      if (progress.passwordCreated) {
        completed += 1;
      }

      if (progress.expired) {
        expired += 1;
      }

      if (progress.cancelled) {
        cancelled += 1;
      }

      if (
        isExpiringSoon(invitation)
      ) {
        expiringSoon += 1;
      }

      if (
        progress.accepted &&
        !progress.passwordCreated &&
        !progress.cancelled
      ) {
        passwordPending += 1;
      }
    });

    const conversionRate =
      total > 0
        ? Math.round(
            (completed / total) * 100,
          )
        : 0;

    return {
      total,
      active,
      accepted,
      completed,
      expired,
      cancelled,
      expiringSoon,
      passwordPending,
      conversionRate,
    };
  }, [invitations]);

  const filteredInvitations = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    const filtered = invitations.filter(
      (invitation) => {
        const status =
          normalizeStatus(
            invitation.status,
          );

        const role =
          getInvitationRoleName(
            invitation,
          ).toLowerCase();

        const matchesSearch =
          !query ||
          invitation.name
            .toLowerCase()
            .includes(query) ||
          invitation.email
            .toLowerCase()
            .includes(query) ||
          role.includes(query) ||
          String(
            invitation.invitedBy?.name || "",
          )
            .toLowerCase()
            .includes(query) ||
          String(
            invitation.invitedBy?.email || "",
          )
            .toLowerCase()
            .includes(query);

        let matchesStatus = true;

        if (statusFilter !== "all") {
          if (statusFilter === "active") {
            matchesStatus =
              status === "pending" ||
              status === "sent";
          } else if (
            statusFilter === "completed"
          ) {
            matchesStatus =
              getProgress(
                invitation,
              ).passwordCreated;
          } else {
            matchesStatus =
              status === statusFilter;
          }
        }

        const matchesRole =
          roleFilter === "all" ||
          getInvitationRoleName(
            invitation,
          ) === roleFilter;

        const matchesAttention =
          !attentionOnly ||
          Boolean(
            getAttentionReason(
              invitation,
            ),
          );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesRole &&
          matchesAttention
        );
      },
    );

    return [...filtered].sort(
      (a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(
            b.name,
          );
        }

        if (sortBy === "oldest") {
          return (
            new Date(
              a.createdAt || 0,
            ).getTime() -
            new Date(
              b.createdAt || 0,
            ).getTime()
          );
        }

        if (sortBy === "expiry") {
          return (
            new Date(
              a.expiresAt ||
                "9999-12-31",
            ).getTime() -
            new Date(
              b.expiresAt ||
                "9999-12-31",
            ).getTime()
          );
        }

        return (
          new Date(
            b.createdAt || 0,
          ).getTime() -
          new Date(
            a.createdAt || 0,
          ).getTime()
        );
      },
    );
  }, [
    invitations,
    search,
    statusFilter,
    roleFilter,
    attentionOnly,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredInvitations.length /
        pageSize,
    ),
  );

  const paginatedInvitations =
    filteredInvitations.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    roleFilter,
    attentionOnly,
    sortBy,
  ]);

  const resendInvitation = async (
    invitation: Invitation,
  ) => {
    try {
      setActionId(invitation._id);
      setError("");

      const response =
        await fetch(
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
          data?.message ||
            "You do not have permission to resend invitations.",
        );
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to resend invitation.",
        );
      }

      await fetchInvitations(false);
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
      setActionId("");
    }
  };

  const cancelInvitation = async (
    invitation: Invitation,
  ) => {
    const confirmed = window.confirm(
      `Cancel invitation for ${invitation.email}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(invitation._id);
      setError("");

      const response =
        await fetch(
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
          data?.message ||
            "You do not have permission to cancel invitations.",
        );
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to cancel invitation.",
        );
      }

      setSelectedInvitation(null);

      await fetchInvitations(false);
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
      setActionId("");
    }
  };

  const deleteInvitation = async (
    invitation: Invitation,
  ) => {
    const firstConfirm = window.confirm(
      `PERMANENTLY DELETE the invitation for ${invitation.email}?\n\nThis will remove the invitation record from the database and cannot be undone.`,
    );

    if (!firstConfirm) {
      return;
    }

    const confirmationText =
      window.prompt(
        `Type DELETE to permanently remove this invitation for ${invitation.email}.`,
      );

    if (confirmationText !== "DELETE") {
      setError(
        "Permanent deletion cancelled. You must type DELETE exactly.",
      );
      return;
    }

    try {
      setDeleteId(invitation._id);
      setError("");

      const response =
        await fetch(
          `/api/admin/roles-permissions/invitations/${invitation._id}?permanent=true`,
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
          data?.message ||
            "You do not have permission to permanently delete invitations.",
        );
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to permanently delete invitation.",
        );
      }

      setSelectedInvitation(null);

      await fetchInvitations(false);
    } catch (err) {
      console.error(
        "Delete invitation error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to permanently delete invitation.",
      );
    } finally {
      setDeleteId("");
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

      setError(`${label} copied.`);

      window.setTimeout(() => {
        setError("");
      }, 1800);
    } catch {
      setError(
        `Unable to copy ${label.toLowerCase()}.`,
      );
    }
  };

  const exportCsv = () => {
    if (
      filteredInvitations.length === 0
    ) {
      setError(
        "There are no invitations to export.",
      );
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Role",
      "Status",
      "Created",
      "Expires",
      "Accepted",
      "Password Created",
      "Invited By",
      "Invitation ID",
    ];

    const rows =
      filteredInvitations.map(
        (invitation) => [
          invitation.name,
          invitation.email,
          getInvitationRoleName(
            invitation,
          ),
          displayStatus(
            invitation.status,
          ),
          invitation.createdAt
            ? formatDate(
                invitation.createdAt,
              )
            : "",
          invitation.expiresAt
            ? formatDate(
                invitation.expiresAt,
              )
            : "",
          invitation.acceptedAt
            ? formatDate(
                invitation.acceptedAt,
              )
            : "",
          invitation.passwordSetAt
            ? formatDate(
                invitation.passwordSetAt,
              )
            : "",
          invitation.invitedBy
            ?.name ||
            invitation.invitedBy
              ?.email ||
            "",
          invitation._id,
        ],
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell);

            return `"${value.replaceAll(
              '"',
              '""',
            )}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `studystow-invitations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
    setAttentionOnly(false);
    setSortBy("newest");
  };

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-slate-900" />

            <h2 className="text-lg font-semibold text-slate-900">
              Invitation Center
            </h2>
          </div>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Monitor administrator invitations,
            onboarding progress, expiration
            risk, and access activation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/roles-permissions/users"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <UserCheck className="h-4 w-4" />
            Invite New User
          </Link>

          <button
            type="button"
            onClick={exportCsv}
            disabled={
              filteredInvitations.length ===
              0
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() =>
              void fetchInvitations(false)
            }
            disabled={invitationsLoading}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                invitationsLoading
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
              <AlertTriangle className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Invitation Center
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total
            </span>

            <Mail className="h-4 w-4 text-slate-400" />
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {metrics.total}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            All invitations
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Active
            </span>

            <Clock3 className="h-4 w-4 text-blue-500" />
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-blue-900">
            {metrics.active}
          </p>

          <p className="mt-1 text-xs text-blue-700/70">
            Awaiting completion
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Completed
            </span>

            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-900">
            {metrics.completed}
          </p>

          <p className="mt-1 text-xs text-emerald-700/70">
            Password setup complete
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Attention
            </span>

            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-amber-900">
            {metrics.expiringSoon +
              metrics.passwordPending}
          </p>

          <p className="mt-1 text-xs text-amber-700/70">
            Expiring or setup pending
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Completion
            </span>

            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {metrics.conversionRate}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Invitation → account
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name, email, role, inviter..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as StatusFilter,
                  )
                }
                className="h-10 min-w-[170px] appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-slate-400"
              >
                <option value="all">
                  All statuses
                </option>
                <option value="active">
                  Active
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="sent">
                  Sent
                </option>
                <option value="accepted">
                  Accepted
                </option>
                <option value="completed">
                  Completed
                </option>
                <option value="expired">
                  Expired
                </option>
                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value,
                  )
                }
                className="h-10 min-w-[170px] appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-slate-400"
              >
                <option value="all">
                  All roles
                </option>

                {roleOptions.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as SortKey,
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="name">
                Name A–Z
              </option>

              <option value="expiry">
                Earliest expiry
              </option>
            </select>

            <button
              type="button"
              onClick={() =>
                setAttentionOnly(
                  (current) => !current,
                )
              }
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                attentionOnly
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Attention only
            </button>

            <button
              type="button"
              onClick={() =>
                setAutoRefresh(
                  (current) => !current,
                )
              }
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                autoRefresh
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  autoRefresh
                    ? "animate-spin"
                    : ""
                }`}
              />
              Auto refresh
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredInvitations.length}
            </span>{" "}
            matching invitations
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span>
              Accepted:{" "}
              <strong className="text-slate-600">
                {metrics.accepted}
              </strong>
            </span>

            <span>
              Expired:{" "}
              <strong className="text-slate-600">
                {metrics.expired}
              </strong>
            </span>

            <span>
              Cancelled:{" "}
              <strong className="text-slate-600">
                {metrics.cancelled}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />

              <p className="text-sm text-slate-500">
                Loading invitation center...
              </p>
            </div>
          </div>
        ) : filteredInvitations.length ===
          0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Mail className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No invitations found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              No invitation records match
              the current filters.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset Filters
              </button>

              <Link
                href="/admin/roles-permissions/users"
                className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Invite User
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invitee
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Progress
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Expiry
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedInvitations.map(
                    (invitation) => {
                      const progress =
                        getProgress(
                          invitation,
                        );

                      const status =
                        normalizeStatus(
                          invitation.status,
                        );

                      const progressPercent =
                        getProgressPercent(
                          invitation,
                        );

                      const attention =
                        getAttentionReason(
                          invitation,
                        );

                      const busy =
                        actionId ===
                        invitation._id;

                      const deleting =
                        deleteId ===
                        invitation._id;

                      const canAction =
                        status === "pending" ||
                        status === "sent";

                      return (
                        <tr
                          key={
                            invitation._id
                          }
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex min-w-[250px] items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                <Mail className="h-5 w-5 text-slate-600" />
                              </div>

                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedInvitation(
                                      invitation,
                                    )
                                  }
                                  className="block max-w-[250px] truncate text-sm font-semibold text-slate-900 hover:underline"
                                >
                                  {
                                    invitation.name
                                  }
                                </button>

                                <p className="max-w-[250px] truncate text-xs text-slate-500">
                                  {
                                    invitation.email
                                  }
                                </p>

                                <p className="mt-1 text-[11px] text-slate-400">
                                  Sent{" "}
                                  {formatRelativeDate(
                                    invitation.createdAt,
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {getInvitationRoleName(
                                invitation,
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-col items-start gap-2">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
                                  status,
                                )}`}
                              >
                                {displayStatus(
                                  status,
                                )}
                              </span>

                              {attention && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  {attention}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="min-w-[190px]">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-slate-600">
                                  {
                                    progressPercent
                                  }
                                  % complete
                                </span>

                                <span className="text-[11px] text-slate-400">
                                  {progress.passwordCreated
                                    ? "3/3"
                                    : progress.accepted
                                      ? "2/3"
                                      : progress.sent
                                        ? "1/3"
                                        : "0/3"}
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    progress.passwordCreated
                                      ? "bg-emerald-500"
                                      : progress.accepted
                                        ? "bg-emerald-400"
                                        : "bg-blue-400"
                                  }`}
                                  style={{
                                    width: `${progressPercent}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  progress.expired
                                    ? "text-red-600"
                                    : isExpiringSoon(
                                          invitation,
                                        )
                                      ? "text-amber-700"
                                      : "text-slate-700"
                                }`}
                              >
                                {invitation.expiresAt
                                  ? formatDate(
                                      invitation.expiresAt,
                                    )
                                  : "No expiry"}
                              </p>

                              {invitation.expiresAt && (
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {formatRelativeDate(
                                    invitation.expiresAt,
                                  )}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedInvitation(
                                    invitation,
                                  )
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                View
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>

                              {canAction && (
                                <>
                                  <button
                                    type="button"
                                    disabled={
                                      busy ||
                                      deleting
                                    }
                                    onClick={() =>
                                      void resendInvitation(
                                        invitation,
                                      )
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                                      busy ||
                                      deleting
                                    }
                                    onClick={() =>
                                      void cancelInvitation(
                                        invitation,
                                      )
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Cancel
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                disabled={
                                  busy ||
                                  deleting
                                }
                                onClick={() =>
                                  void deleteInvitation(
                                    invitation,
                                  )
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 xl:hidden">
              {paginatedInvitations.map(
                (invitation) => {
                  const progress =
                    getProgress(
                      invitation,
                    );

                  const status =
                    normalizeStatus(
                      invitation.status,
                    );

                  const percent =
                    getProgressPercent(
                      invitation,
                    );

                  const attention =
                    getAttentionReason(
                      invitation,
                    );

                  const busy =
                    actionId ===
                    invitation._id;

                  const deleting =
                    deleteId ===
                    invitation._id;

                  const canAction =
                    status === "pending" ||
                    status === "sent";

                  return (
                    <div
                      key={
                        invitation._id
                      }
                      className="space-y-4 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <Mail className="h-5 w-5 text-slate-600" />
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedInvitation(
                                  invitation,
                                )
                              }
                              className="truncate text-left text-sm font-semibold text-slate-900 hover:underline"
                            >
                              {
                                invitation.name
                              }
                            </button>

                            <p className="truncate text-xs text-slate-500">
                              {
                                invitation.email
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {getInvitationRoleName(
                                invitation,
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses(
                            status,
                          )}`}
                        >
                          {displayStatus(
                            status,
                          )}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">
                            Onboarding Progress
                          </span>

                          <span className="text-xs font-semibold text-slate-500">
                            {percent}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className={`h-full rounded-full ${
                              progress.passwordCreated
                                ? "bg-emerald-500"
                                : progress.accepted
                                  ? "bg-emerald-400"
                                  : "bg-blue-400"
                            }`}
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </div>

                      {attention && (
                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                          <AlertTriangle className="h-4 w-4" />
                          {attention}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedInvitation(
                              invitation,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700"
                        >
                          View Details
                        </button>

                        {canAction && (
                          <>
                            <button
                              type="button"
                              disabled={
                                busy ||
                                deleting
                              }
                              onClick={() =>
                                void resendInvitation(
                                  invitation,
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-50"
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
                                busy ||
                                deleting
                              }
                              onClick={() =>
                                void cancelInvitation(
                                  invitation,
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          disabled={
                            busy ||
                            deleting
                          }
                          onClick={() =>
                            void deleteInvitation(
                              invitation,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 text-xs font-semibold text-red-700 disabled:opacity-50"
                        >
                          {deleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-700">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {totalPages}
                  </span>
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={
                      currentPage <= 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page - 1,
                      )
                    }
                    className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      currentPage >=
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page + 1,
                      )
                    }
                    className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedInvitation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-6 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {(() => {
              const invitation =
                selectedInvitation;

              const progress =
                getProgress(
                  invitation,
                );

              const percent =
                getProgressPercent(
                  invitation,
                );

              const status =
                normalizeStatus(
                  invitation.status,
                );

              const attention =
                getAttentionReason(
                  invitation,
                );

              const busy =
                actionId ===
                invitation._id;

              const deleting =
                deleteId ===
                invitation._id;

              const canAction =
                status === "pending" ||
                status === "sent";

              return (
                <>
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <Mail className="h-6 w-6 text-slate-700" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-slate-900">
                          {
                            invitation.name
                          }
                        </h2>

                        <p className="truncate text-sm text-slate-500">
                          {
                            invitation.email
                          }
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {getInvitationRoleName(
                              invitation,
                            )}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
                              status,
                            )}`}
                          >
                            {displayStatus(
                              status,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedInvitation(
                          null,
                        )
                      }
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6 p-5 sm:p-6">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Onboarding Progress
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Invitation lifecycle
                            from delivery to
                            account activation.
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">
                            {percent}%
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {progress.passwordCreated
                              ? "Completed"
                              : progress.accepted
                                ? "Password setup"
                                : progress.sent
                                  ? "Awaiting acceptance"
                                  : "Not sent"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
                        <div
                          className={`h-full rounded-full ${
                            progress.passwordCreated
                              ? "bg-emerald-500"
                              : progress.accepted
                                ? "bg-emerald-400"
                                : "bg-blue-400"
                          }`}
                          style={{
                            width: `${percent}%`,
                          }}
                        />
                      </div>
                    </div>

                    {attention && (
                      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                        <div>
                          <p className="text-sm font-semibold text-amber-900">
                            Attention required
                          </p>

                          <p className="mt-1 text-sm text-amber-800">
                            {attention}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Invitation ID
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="truncate font-mono text-xs text-slate-700">
                            {
                              invitation._id
                            }
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              void copyText(
                                invitation._id,
                                "Invitation ID",
                              )
                            }
                            className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Email
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium text-slate-700">
                            {
                              invitation.email
                            }
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              void copyText(
                                invitation.email,
                                "Email",
                              )
                            }
                            className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Created
                        </p>

                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {formatDate(
                            invitation.createdAt,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Expires
                        </p>

                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {invitation.expiresAt
                            ? formatDate(
                                invitation.expiresAt,
                              )
                            : "No expiry"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Assigned Role
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {getInvitationRoleName(
                            invitation,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Invited By
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {invitation.invitedBy
                            ?.name ||
                            "—"}
                        </p>

                        {invitation
                          .invitedBy
                          ?.email && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {
                              invitation
                                .invitedBy
                                .email
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-5">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Invitation Activity
                      </h3>

                      <div className="mt-5 space-y-5">
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <Mail className="h-4 w-4 text-slate-600" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Invitation created
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                invitation.createdAt,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            {progress.accepted ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-slate-400" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Email accepted
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {invitation.acceptedAt
                                ? formatDate(
                                    invitation.acceptedAt,
                                  )
                                : "Not completed yet"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            {progress.passwordCreated ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Shield className="h-4 w-4 text-slate-400" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Password created
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {invitation.passwordSetAt
                                ? formatDate(
                                    invitation.passwordSetAt,
                                  )
                                : "Not completed yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                        <div>
                          <p className="text-sm font-semibold text-red-900">
                            Permanent deletion
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-700">
                            This permanently removes
                            this invitation record from
                            the database. This action
                            cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {progress.passwordCreated ? (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Onboarding complete
                          </span>
                        ) : progress.expired ? (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                            <XCircle className="h-4 w-4" />
                            Invitation expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                            <Clock3 className="h-4 w-4" />
                            Awaiting onboarding
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {canAction && (
                          <>
                            <button
                              type="button"
                              disabled={
                                busy ||
                                deleting
                              }
                              onClick={() =>
                                void resendInvitation(
                                  invitation,
                                )
                              }
                              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                              Resend Invitation
                            </button>

                            <button
                              type="button"
                              disabled={
                                busy ||
                                deleting
                              }
                              onClick={() =>
                                void cancelInvitation(
                                  invitation,
                                )
                              }
                              className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          disabled={
                            busy ||
                            deleting
                          }
                          onClick={() =>
                            void deleteInvitation(
                              invitation,
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-300 bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete Permanently
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedInvitation(
                              null,
                            )
                          }
                          className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
