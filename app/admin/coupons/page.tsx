"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  Percent,
  Plus,
  Search,
  TicketPercent,
  XCircle,
} from "lucide-react";

type Coupon = {
  _id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  startDate: string;
  endDate: string;
  active: boolean;
};

type CouponStatus =
  | "Active"
  | "Scheduled"
  | "Expired"
  | "Inactive";

type Stats = {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
};

function getStatus(coupon: Coupon): CouponStatus {
  const now = new Date();

  if (!coupon.active) {
    return "Inactive";
  }

  if (new Date(coupon.startDate) > now) {
    return "Scheduled";
  }

  if (new Date(coupon.endDate) < now) {
    return "Expired";
  }

  if (
    coupon.usageLimit !== undefined &&
    coupon.usageCount >= coupon.usageLimit
  ) {
    return "Expired";
  }

  return "Active";
}

function statusStyles(status: CouponStatus) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "Scheduled":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";

    case "Expired":
      return "bg-slate-100 text-slate-600 ring-slate-500/20";

    case "Inactive":
      return "bg-red-50 text-red-700 ring-red-600/20";

    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCoupons() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }

      const response = await fetch(
        `/api/coupons?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load coupons"
        );
      }

      setCoupons(
        Array.isArray(result.data) ? result.data : []
      );

      setStats({
        total: Number(result.stats?.total || 0),
        active: Number(result.stats?.active || 0),
        scheduled: Number(result.stats?.scheduled || 0),
        expired: Number(result.stats?.expired || 0),
      });
    } catch (err: any) {
      console.error("Coupons load error:", err);

      setError(
        err?.message || "Failed to load coupons"
      );

      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCoupons();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard unavailable
    }
  }

  const visibleCoupons = useMemo(() => {
    return coupons;
  }, [coupons]);

  const statCards = [
    {
      label: "Total Coupons",
      value: stats.total,
      icon: TicketPercent,
      description: "All coupons",
    },
    {
      label: "Active",
      value: stats.active,
      icon: CheckCircle2,
      description: "Currently available",
    },
    {
      label: "Scheduled",
      value: stats.scheduled,
      icon: Clock3,
      description: "Starting soon",
    },
    {
      label: "Expired",
      value: stats.expired,
      icon: XCircle,
      description: "No longer active",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href="/admin"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Back to admin dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <p className="text-sm font-medium text-blue-600">
                  Administration
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Coupons
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create and manage discount coupons for your store.
                </p>
              </div>
            </div>

            <Link
              href="/admin/coupons/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coupon code..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Types</option>
                <option value="percentage">
                  Percentage
                </option>
                <option value="fixed">
                  Fixed Amount
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading coupons...
          </div>
        )}

        {/* Empty */}
        {!loading && !error && visibleCoupons.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <TicketPercent className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-3 font-semibold text-slate-900">
              No coupons found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create your first coupon to get started.
            </p>
          </div>
        )}

        {/* Desktop Table */}
        {!loading && visibleCoupons.length > 0 && (
          <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Coupon
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Discount
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Minimum Order
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Usage
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Validity
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
                  {visibleCoupons.map((coupon) => {
                    const status = getStatus(coupon);

                    const usagePercentage =
                      coupon.usageLimit &&
                      coupon.usageLimit > 0
                        ? Math.min(
                            (coupon.usageCount /
                              coupon.usageLimit) *
                              100,
                            100
                          )
                        : 0;

                    return (
                      <tr
                        key={coupon._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                              <TicketPercent className="h-5 w-5 text-blue-600" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900">
                                  {coupon.code}
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    copyCode(coupon.code)
                                  }
                                  className="text-slate-400 hover:text-slate-700"
                                  title="Copy coupon code"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                                {coupon.description ||
                                  "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-semibold text-slate-900">
                            {coupon.type === "percentage"
                              ? `${coupon.value}%`
                              : formatMoney(coupon.value)}
                          </p>

                          <p className="mt-1 text-xs capitalize text-slate-500">
                            {coupon.type}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-medium text-slate-700">
                            {formatMoney(
                              coupon.minOrderAmount
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Max off:{" "}
                            {coupon.maxDiscountAmount
                              ? formatMoney(
                                  coupon.maxDiscountAmount
                                )
                              : "No limit"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="w-28">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700">
                                {coupon.usageCount}
                              </span>

                              <span className="text-slate-400">
                                {coupon.usageLimit ??
                                  "∞"}
                              </span>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{
                                  width: `${usagePercentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />

                            <span>
                              {formatDate(
                                coupon.startDate
                              )}
                            </span>
                          </div>

                          <p className="mt-1 pl-5 text-xs text-slate-400">
                            to{" "}
                            {formatDate(coupon.endDate)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-right">
                          <Link
                            href={`/admin/coupons/${coupon._id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Manage
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mobile Cards */}
        {!loading && visibleCoupons.length > 0 && (
          <section className="mt-6 space-y-4 lg:hidden">
            {visibleCoupons.map((coupon) => {
              const status = getStatus(coupon);

              const usagePercentage =
                coupon.usageLimit &&
                coupon.usageLimit > 0
                  ? Math.min(
                      (coupon.usageCount /
                        coupon.usageLimit) *
                        100,
                      100
                    )
                  : 0;

              return (
                <article
                  key={coupon._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                        <TicketPercent className="h-5 w-5 text-blue-600" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">
                            {coupon.code}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              copyCode(coupon.code)
                            }
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {coupon.description ||
                            "No description"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Discount
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : formatMoney(coupon.value)}
                      </p>

                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {coupon.type}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Minimum Order
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {formatMoney(
                          coupon.minOrderAmount
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Max{" "}
                        {coupon.maxDiscountAmount
                          ? formatMoney(
                              coupon.maxDiscountAmount
                            )
                          : "No limit"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4 text-slate-400" />

                        <span className="text-sm font-medium text-slate-700">
                          Usage
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-slate-900">
                        {coupon.usageCount} /{" "}
                        {coupon.usageLimit ?? "∞"}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${usagePercentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />

                        {formatDate(coupon.startDate)}
                      </p>

                      <p className="mt-1 pl-5 text-xs text-slate-400">
                        to {formatDate(coupon.endDate)}
                      </p>
                    </div>

                    <Link
                      href={`/admin/coupons/${coupon._id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Manage
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Bottom info */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Coupon management
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Coupons can be configured with percentage or
                fixed discounts, minimum order values, maximum
                discount limits, usage limits and start/end
                dates. These rules are validated on the server.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}