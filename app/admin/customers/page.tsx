"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success?: boolean;
  data?: Customer[];
  stats?: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    newCustomers: number;
  };
  message?: string;
};

type StatusFilter = "all" | "active" | "inactive";

type SortOption = "newest" | "oldest";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusStyles(active: boolean) {
  if (active) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }

  return "bg-slate-100 text-slate-600 ring-slate-500/20";
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [sort, setSort] =
    useState<SortOption>("newest");

  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    newCustomers: 0,
  });

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      params.set("status", status);
      params.set("sort", sort);

      const response = await fetch(
        `/api/admin/customers?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load customers."
        );
      }

      setCustomers(data.data || []);

      setStats(
        data.stats || {
          totalCustomers: 0,
          activeCustomers: 0,
          inactiveCustomers: 0,
          newCustomers: 0,
        }
      );
    } catch (err) {
      console.error(
        "Admin customers error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status, sort]);

  const visibleCustomers = useMemo(() => {
    return customers.filter(
      (customer) => customer.role === "customer"
    );
  }, [customers]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href="/admin"
                aria-label="Back to admin dashboard"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <p className="text-sm font-medium text-blue-600">
                  Administration
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Customers
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage customers registered on your store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
          />

          <StatCard
            label="Active Customers"
            value={stats.activeCustomers}
            icon={UserCheck}
          />

          <StatCard
            label="New Customers"
            value={stats.newCustomers}
            icon={UserPlus}
          />

          <StatCard
            label="Inactive"
            value={stats.inactiveCustomers}
            icon={UserX}
          />
        </section>

        {/* Search & Filters */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email or phone..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as StatusFilter
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value as SortOption
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="newest">
                  Newest Joined
                </option>

                <option value="oldest">
                  Oldest Joined
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-semibold text-red-800">
              Unable to load customers
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadCustomers}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-12 rounded-lg bg-slate-100" />
            </div>
          </section>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          visibleCustomers.length === 0 && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Users className="mx-auto h-10 w-10 text-slate-300" />

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No customers found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                No registered customers match your current filters.
              </p>
            </section>
          )}

        {/* Desktop Table */}
        {!loading &&
          !error &&
          visibleCustomers.length > 0 && (
            <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Contact
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Joined
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleCustomers.map(
                      (customer) => (
                        <tr
                          key={customer._id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                {getInitials(
                                  customer.name
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {customer.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {customer._id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <p className="flex items-center gap-2 text-sm text-slate-700">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />

                              {customer.email}
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />

                              {customer.phone || "No phone added"}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm font-medium text-slate-700">
                              {formatDate(
                                customer.createdAt
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                                customer.active
                              )}`}
                            >
                              {customer.active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-5 text-right">
                            <Link
                              href={`/admin/customers/${customer._id}`}
                              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                              View

                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        {/* Mobile Cards */}
        {!loading &&
          !error &&
          visibleCustomers.length > 0 && (
            <section className="mt-6 space-y-4 lg:hidden">
              {visibleCustomers.map(
                (customer) => (
                  <article
                    key={customer._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                          {getInitials(
                            customer.name
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {customer._id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                          customer.active
                        )}`}
                      >
                        {customer.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                          <Mail className="h-4 w-4 text-slate-500" />
                        </div>

                        <span className="truncate">
                          {customer.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                          <Phone className="h-4 w-4 text-slate-500" />
                        </div>

                        <span>
                          {customer.phone ||
                            "No phone added"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Joined
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDate(
                          customer.createdAt
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`More options for ${customer.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        <Link
                          href={`/admin/customers/${customer._id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                        >
                          View

                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              )}
            </section>
          )}

        {/* Database Info */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <Users className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Customer database
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Customer information shown above is loaded
                directly from the registered customer accounts
                in MongoDB.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}