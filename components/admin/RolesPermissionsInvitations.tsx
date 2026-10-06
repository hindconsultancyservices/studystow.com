
"use client";

import {
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type InvitationStatus =
  | "pending"
  | "sent"
  | "accepted"
  | "expired"
  | "cancelled";

type Invitation = {
  _id: string;
  name: string;
  email: string;
  status: InvitationStatus;
  role?: {
    _id?: string;
    name?: string;
    slug?: string;
  } | null;
  invitedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  expiresAt?: string | null;
  acceptedAt?: string | null;
};

type Stats = {
  total: number;
  pending: number;
  sent: number;
  accepted: number;
  cancelled: number;
  expired: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiResponse = {
  success: boolean;
  data: Invitation[];
  stats?: Partial<Stats>;
  pagination?: Pagination;
  message?: string;
};

type Props = {
  onInvite: () => void;
  refreshKey?: number;
};

type StatusFilter = "all" | InvitationStatus;

const initialStats: Stats = {
  total: 0,
  pending: 0,
  sent: 0,
  accepted: 0,
  cancelled: 0,
  expired: 0,
};

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

function getStatusLabel(status: InvitationStatus) {
  switch (status) {
    case "accepted":
      return "Accepted";

    case "sent":
      return "Sent";

    case "expired":
      return "Expired";

    case "cancelled":
      return "Cancelled";

    case "pending":
    default:
      return "Pending";
  }
}

function getStatusClass(status: InvitationStatus) {
  switch (status) {
    case "accepted":
      return "bg-emerald-50 text-emerald-700";

    case "sent":
      return "bg-blue-50 text-blue-700";

    case "expired":
      return "bg-red-50 text-red-700";

    case "cancelled":
      return "bg-slate-100 text-slate-600";

    case "pending":
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function getStatusIcon(status: InvitationStatus) {
  switch (status) {
    case "accepted":
      return CheckCircle2;

    case "sent":
      return Mail;

    case "expired":
    case "cancelled":
      return XCircle;

    case "pending":
    default:
      return Clock3;
  }
}

function getExpiryText(invitation: Invitation) {
  if (invitation.status === "accepted") {
    return invitation.expiresAt
      ? formatDate(invitation.expiresAt)
      : "Completed";
  }

  if (invitation.status === "cancelled") {
    return "Cancelled";
  }

  if (invitation.status === "expired") {
    return invitation.expiresAt
      ? formatDate(invitation.expiresAt)
      : "Expired";
  }

  return formatDate(invitation.expiresAt);
}

export default function RolesPermissionsInvitations({
  onInvite,
  refreshKey = 0,
}: Props) {
  const [invitations, setInvitations] = useState<Invitation[]>(
    []
  );

  const [stats, setStats] = useState<Stats>(initialStats);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");

  const fetchInvitations = useCallback(
    async (requestedPage = 1) => {
      try {
        setError("");

        if (requestedPage === 1) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const params = new URLSearchParams();

        params.set("page", String(requestedPage));
        params.set("limit", "20");

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        const response = await fetch(
          `/api/admin/roles-permissions/invitations?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data: ApiResponse = await response
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
            data.message ||
              "You do not have permission to view invitations."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load invitations."
          );
        }

        const nextInvitations = Array.isArray(data.data)
          ? data.data
          : [];

        setInvitations(nextInvitations);

        setStats({
          ...initialStats,
          ...(data.stats || {}),
        });

        const nextPage = Number(
          data.pagination?.page || requestedPage
        );

        const nextTotalPages = Math.max(
          Number(data.pagination?.totalPages || 1),
          1
        );

        setPage(nextPage);
        setTotalPages(nextTotalPages);
      } catch (err) {
        console.error("Invitations tab error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load invitations."
        );

        /*
         * Do not wipe the existing list during a refresh
         * when the API temporarily fails.
         */
        if (requestedPage === 1) {
          setInvitations([]);
          setStats(initialStats);
          setPage(1);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter]
  );

  const deleteInvitation = async (
    invitationId: string,
    inviteeName: string
  ) => {
    const confirmed = window.confirm(
      `Remove invitation for "${inviteeName}"?\n\nThis will permanently delete the invitation from MongoDB.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(invitationId);
      setError("");

      const response = await fetch(
        `/api/admin/roles-permissions/invitations/${encodeURIComponent(
          invitationId
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error("Your session has expired.");
      }

      if (response.status === 403) {
        throw new Error(
          "Only the owner can delete invitations."
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to delete invitation."
        );
      }

      /*
       * If the current page becomes empty after deletion,
       * move back one page when possible.
       */
      const shouldGoPreviousPage =
        invitations.length === 1 && page > 1;

      await fetchInvitations(
        shouldGoPreviousPage ? page - 1 : page
      );
    } catch (err) {
      console.error(
        "Delete invitation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete invitation."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * Single effect for:
   * - initial load
   * - search
   * - status filter
   * - refreshKey after creating a new invitation
   *
   * This replaces the two overlapping effects from the old code,
   * so the API is not called twice.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchInvitations(1);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchInvitations, refreshKey]);

  return (
    <div className="space-y-5">
      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-700">
            {stats.pending}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Sent
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-700">
            {stats.sent}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            Accepted
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {stats.accepted}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-red-600">
            Expired
          </p>

          <p className="mt-2 text-2xl font-bold text-red-700">
            {stats.expired}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Cancelled
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-700">
            {stats.cancelled}
          </p>
        </div>
      </div>

      {/* HEADER / FILTERS */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Admin Invitations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track administrator invitations and acceptance
              status.
            </p>
          </div>

          <button
            type="button"
            onClick={onInvite}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Mail className="h-4 w-4" />
            Invite Admin
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_190px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value as StatusFilter
              );
              setPage(1);
            }}
            className="h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={() => fetchInvitations(page)}
            disabled={loading || refreshing || deletingId !== null}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* LIST */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <RefreshCw className="h-7 w-7 animate-spin text-slate-500" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Mail className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No invitations found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              There are no invitation records matching the
              current filters.
            </p>

            <button
              type="button"
              onClick={onInvite}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Mail className="h-4 w-4" />
              Invite Administrator
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1200px]">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invitee
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invited
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Expires
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invited By
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {invitations.map((invitation) => {
                    const Icon = getStatusIcon(
                      invitation.status
                    );

                    const invitationId = String(
                      invitation._id
                    );

                    const isDeleting =
                      deletingId === invitationId;

                    return (
                      <tr
                        key={invitationId}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                              <Shield className="h-5 w-5 text-slate-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {invitation.name ||
                                  "Unnamed invitee"}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {invitation.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {invitation.role?.name ||
                              "Role unavailable"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              invitation.status
                            )}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {getStatusLabel(
                              invitation.status
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            invitation.createdAt
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {getExpiryText(invitation)}
                        </td>

                        <td className="px-5 py-4">
                          {invitation.invitedBy ? (
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {
                                  invitation.invitedBy
                                    .name
                                }
                              </p>

                              <p className="text-xs text-slate-400">
                                {
                                  invitation.invitedBy
                                    .email
                                }
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              deleteInvitation(
                                invitationId,
                                invitation.name ||
                                  invitation.email
                              )
                            }
                            disabled={
                              isDeleting ||
                              deletingId !== null
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />

                            {isDeleting
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="divide-y lg:hidden">
              {invitations.map((invitation) => {
                const Icon = getStatusIcon(
                  invitation.status
                );

                const invitationId = String(
                  invitation._id
                );

                const isDeleting =
                  deletingId === invitationId;

                return (
                  <div
                    key={invitationId}
                    className="space-y-4 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <Shield className="h-5 w-5 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {invitation.name ||
                              "Unnamed invitee"}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {invitation.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClass(
                          invitation.status
                        )}`}
                      >
                        <Icon className="h-3 w-3" />
                        {getStatusLabel(
                          invitation.status
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">
                          Role
                        </p>

                        <p className="mt-1 font-medium text-slate-700">
                          {invitation.role?.name ||
                            "Unavailable"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Invited
                        </p>

                        <p className="mt-1 font-medium text-slate-700">
                          {formatDate(
                            invitation.createdAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Expires
                        </p>

                        <p className="mt-1 font-medium text-slate-700">
                          {getExpiryText(invitation)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Invited By
                        </p>

                        <p className="mt-1 font-medium text-slate-700">
                          {invitation.invitedBy?.name ||
                            "—"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteInvitation(
                          invitationId,
                          invitation.name ||
                            invitation.email
                        )
                      }
                      disabled={
                        isDeleting ||
                        deletingId !== null
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />

                      {isDeleting
                        ? "Removing..."
                        : "Remove Invitation"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={
                      page <= 1 ||
                      refreshing ||
                      deletingId !== null
                    }
                    onClick={() =>
                      fetchInvitations(page - 1)
                    }
                    className="h-9 rounded-lg border px-3 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >= totalPages ||
                      refreshing ||
                      deletingId !== null
                    }
                    onClick={() =>
                      fetchInvitations(page + 1)
                    }
                    className="h-9 rounded-lg border px-3 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
