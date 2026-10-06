"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

type AuditResult = "success" | "failed";

type AuditLog = {
  _id: string;
  actor?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  result?: AuditResult;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type ApiResponse = {
  success: boolean;
  data: AuditLog[];
  pagination: Pagination;
  message?: string;
};

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 1,
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatAction(value?: string) {
  if (!value) return "Unknown";

  return value
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getActionClass(action?: string) {
  const value = (action || "").toLowerCase();

  if (
    value.includes("delete") ||
    value.includes("remove") ||
    value.includes("suspend") ||
    value.includes("cancel") ||
    value.includes("reject") ||
    value.includes("failed")
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    value.includes("create") ||
    value.includes("invite") ||
    value.includes("activate") ||
    value.includes("login") ||
    value.includes("success")
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    value.includes("update") ||
    value.includes("edit") ||
    value.includes("permission") ||
    value.includes("change")
  ) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getResourceLabel(resource?: string) {
  if (!resource) return "System";

  return formatAction(resource);
}

function getResultLabel(result?: AuditResult) {
  return result === "failed" ? "Failed" : "Success";
}

function getResultClass(result?: AuditResult) {
  return result === "failed"
    ? "bg-red-50 text-red-700"
    : "bg-emerald-50 text-emerald-700";
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const [pagination, setPagination] = useState<Pagination>(
    DEFAULT_PAGINATION
  );

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [resultFilter, setResultFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const fetchLogs = useCallback(
    async (page = 1, options?: { initial?: boolean }) => {
      const isInitial = options?.initial ?? false;

      try {
        setError("");

        if (isInitial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(pagination.limit));

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (resultFilter) {
          params.set("result", resultFilter);
        }

        if (resourceFilter) {
          params.set("resource", resourceFilter);
        }

        const response = await fetch(
          `/api/admin/audit-logs?${params.toString()}`,
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
            pagination: DEFAULT_PAGINATION,
          }));

        if (response.status === 401) {
          throw new Error("You are not authorized.");
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to view audit logs."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load audit logs."
          );
        }

        setLogs(Array.isArray(data.data) ? data.data : []);

        if (data.pagination) {
          setPagination(data.pagination);
        } else {
          setPagination((current) => ({
            ...current,
            page,
          }));
        }
      } catch (err) {
        console.error("Audit logs error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load audit logs."
        );

        setLogs([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      pagination.limit,
      resourceFilter,
      resultFilter,
      search,
    ]
  );

  useEffect(() => {
    fetchLogs(1, { initial: true });
  }, [resultFilter, resourceFilter]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    setSearch(searchInput.trim());

    /*
     * Search state update triggers the next fetch through the
     * effect below.
     */
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== searchInput.trim()) {
        setSearch(searchInput.trim());
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    if (search === "") {
      return;
    }

    fetchLogs(1);
  }, [search]);

  const stats = useMemo(() => {
    const successful = logs.filter(
      (log) => log.result !== "failed"
    ).length;

    const failed = logs.filter(
      (log) => log.result === "failed"
    ).length;

    return {
      total: pagination.total,
      successful,
      failed,
    };
  }, [logs, pagination.total]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setResultFilter("");
    setResourceFilter("");
  };

  const hasFilters =
    search.trim() ||
    resultFilter ||
    resourceFilter;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Audit Logs
                </h1>

                <p className="text-sm text-slate-500">
                  Monitor administrator activity and security events.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchLogs(pagination.page)}
            disabled={loading || refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load audit logs
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-600 transition hover:bg-red-100"
            >
              ×
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Events
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.total.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Activity className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Successful
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {stats.successful.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Current page
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Failed
                </p>

                <p className="mt-1 text-2xl font-bold text-red-600">
                  {stats.failed.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Current page
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_190px_auto]"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search admin, action, resource..."
                className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={resultFilter}
              onChange={(event) =>
                setResultFilter(event.target.value)
              }
              className="h-10 rounded-lg border bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="">All Results</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={resourceFilter}
              onChange={(event) =>
                setResourceFilter(event.target.value)
              }
              className="h-10 rounded-lg border bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="">All Resources</option>
              <option value="admin-users">Admin Users</option>
              <option value="books">Books</option>
              <option value="categories">Categories</option>
              <option value="inventory">Inventory</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
              <option value="coupons">Coupons</option>
              <option value="reviews">Reviews</option>
              <option value="pages">Pages</option>
              <option value="payments">Payments</option>
              <option value="settings">Settings</option>
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="h-10 flex-1 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 lg:flex-none"
              >
                Search
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-10 rounded-lg border px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* MAIN LOG TABLE */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Activity History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {pagination.total.toLocaleString("en-IN")} total events
              </p>
            </div>

            {refreshing && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Updating...
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4 p-5">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-lg border p-4"
                >
                  <div className="h-4 w-48 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-72 rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-40 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Activity className="h-6 w-6 text-slate-500" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No audit logs found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                No activity matches the current search or filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Administrator
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Resource
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Result
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* ADMIN */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                              <User className="h-4 w-4 text-slate-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {log.actor?.name || "System"}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {log.actor?.email || "System action"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getActionClass(
                              log.action
                            )}`}
                          >
                            {formatAction(log.action)}
                          </span>
                        </td>

                        {/* RESOURCE */}
                        <td className="px-5 py-4">
                          <div className="min-w-[150px]">
                            <p className="text-sm font-medium text-slate-800">
                              {getResourceLabel(log.resource)}
                            </p>

                            {log.resourceId && (
                              <p className="mt-0.5 max-w-[220px] truncate font-mono text-[11px] text-slate-400">
                                {log.resourceId}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* RESULT */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getResultClass(
                              log.result
                            )}`}
                          >
                            {getResultLabel(log.result)}
                          </span>
                        </td>

                        {/* DATE */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock3 className="h-4 w-4 text-slate-400" />

                            {formatDate(log.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y md:hidden">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="space-y-4 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {log.actor?.name || "System"}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {log.actor?.email || "System action"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${getResultClass(
                          log.result
                        )}`}
                      >
                        {getResultLabel(log.result)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getActionClass(
                          log.action
                        )}`}
                      >
                        {formatAction(log.action)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {getResourceLabel(log.resource)}
                      </span>
                    </div>

                    {log.resourceId && (
                      <p className="truncate rounded-lg bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-400">
                        {log.resourceId}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />

                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.pages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      pagination.page <= 1 ||
                      refreshing
                    }
                    onClick={() =>
                      fetchLogs(
                        pagination.page - 1
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      pagination.page >=
                        pagination.pages ||
                      refreshing
                    }
                    onClick={() =>
                      fetchLogs(
                        pagination.page + 1
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}