"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Crown,
  FileBarChart,
  Filter,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Star,
  Target,
  UserCheck,
  Users,
  UserPlus,
  WalletCards,
} from "lucide-react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type ReportBlockProps = {
  title: string;
  description: string;
  icon: typeof Users;
  emptyTitle: string;
  emptyDescription: string;
};

function ReportBlock({
  title,
  description,
  icon: Icon,
  emptyTitle,
  emptyDescription,
}: ReportBlockProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-950">
                {title}
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-400">
            <CircleDollarSign className="h-3.5 w-3.5" />
            Awaiting data
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
            <BarChart3 className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">
            {emptyTitle}
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500">
            {emptyDescription}
          </p>
        </div>
      </div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  description: string;
  icon: typeof Users;
  valueLabel?: string;
};

function MetricCard({
  label,
  description,
  icon: Icon,
  valueLabel = "—",
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-300">
            {valueLabel}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function CustomersReportPage() {
  const { isOwner, canView } = useAdminPermissions();

  const canAccess = isOwner || canView("reports");

  if (!canAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Access denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You do not have permission to access the Customers report.
          </p>

          <Link
            href="/admin/reports"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link
                href="/admin/reports"
                className="transition hover:text-slate-950"
              >
                Reports
              </Link>

              <ArrowRight className="h-3.5 w-3.5" />

              <span className="font-medium text-slate-700">
                Customers
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Users className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Customer Report
                </h1>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Analyse customer growth, purchasing behaviour, order
                  frequency, customer value, retention and overall customer
                  contribution to StudyStow.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white opacity-50"
            >
              Export
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Filter className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Report Filters
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                These filters will control the reporting dataset after the
                customer reporting API is connected.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                From
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="date"
                  disabled
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                To
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="date"
                  disabled
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Customer Type
              </label>

              <select
                disabled
                defaultValue="all"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none"
              >
                <option value="all">All Customers</option>
                <option value="new">New Customers</option>
                <option value="returning">Returning Customers</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Order Activity
              </label>

              <select
                disabled
                defaultValue="all"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none"
              >
                <option value="all">All Activity</option>
                <option value="ordered">Customers With Orders</option>
                <option value="inactive">Inactive Customers</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Customer Value
              </label>

              <select
                disabled
                defaultValue="all"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none"
              >
                <option value="all">All Value Bands</option>
                <option value="high">High Value</option>
                <option value="medium">Medium Value</option>
                <option value="low">Low Value</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Customers"
          description="Total customer accounts included in the selected report period."
          icon={Users}
        />

        <MetricCard
          label="New Customers"
          description="Newly registered or first-time purchasing customers."
          icon={UserPlus}
        />

        <MetricCard
          label="Returning Customers"
          description="Customers who placed repeat orders during the selected period."
          icon={UserCheck}
        />

        <MetricCard
          label="Customer Revenue"
          description="Revenue attributed to customers represented by this report."
          icon={CircleDollarSign}
        />

        <MetricCard
          label="Average Order Value"
          description="Average value of customer orders in the selected period."
          icon={WalletCards}
        />

        <MetricCard
          label="Orders Per Customer"
          description="Average number of orders per active customer."
          icon={ShoppingBag}
        />

        <MetricCard
          label="Top Customer"
          description="Highest-value customer according to the connected reporting data."
          icon={Crown}
        />

        <MetricCard
          label="Retention"
          description="Customer repeat-purchase or retention measurement."
          icon={Target}
        />
      </section>

      {/* Customer growth */}
      <ReportBlock
        title="Customer Growth"
        description="Track customer registrations, first purchases and customer growth over time."
        icon={UserPlus}
        emptyTitle="Customer growth data is not connected yet"
        emptyDescription="Once the reporting API is connected, this section will show date-wise customer growth and comparison against previous periods."
      />

      {/* Purchasing behaviour */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ReportBlock
          title="Customer Purchasing Behaviour"
          description="Understand ordering frequency, average order value and customer purchasing patterns."
          icon={ShoppingBag}
          emptyTitle="Purchasing behaviour is not connected yet"
          emptyDescription="This section will calculate purchase frequency, order value and other customer behaviour metrics from real StudyStow order data."
        />

        <ReportBlock
          title="Customer Value"
          description="Identify high-value customers and understand their contribution to total revenue."
          icon={Crown}
          emptyTitle="Customer value data is not connected yet"
          emptyDescription="This section will rank customers using actual order and revenue data once the customer reporting API is available."
        />
      </div>

      {/* Retention */}
      <ReportBlock
        title="Customer Retention"
        description="Measure repeat customers, returning customer activity and retention trends."
        icon={UserCheck}
        emptyTitle="Retention data is not connected yet"
        emptyDescription="Retention calculations will be based on actual customer order history and reporting periods. No estimated retention values are shown here."
      />

      {/* Top customers */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Crown className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-950">
                Top Customers
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Customers ranked by actual order value, order volume or
                another selected reporting metric.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[60px_minmax(160px,1fr)_120px_120px_140px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>#</span>
              <span>Customer</span>
              <span>Orders</span>
              <span>Revenue</span>
              <span>Customer Value</span>
            </div>

            <div className="px-5 py-10 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Users className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                No customer ranking data loaded
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500">
                Customer names, order counts and revenue will appear here
                after the reporting API is connected to the actual
                customer and order data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer status */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ReportBlock
          title="Active vs Inactive Customers"
          description="Review customer activity and identify customers who have not purchased recently."
          icon={UserCheck}
          emptyTitle="Customer activity data is not connected yet"
          emptyDescription="This report will use real order activity and customer records to classify active and inactive customers."
        />

        <ReportBlock
          title="Customer Segments"
          description="Analyse customers by order frequency, value, purchase history and other business-defined segments."
          icon={Star}
          emptyTitle="Customer segmentation is not connected yet"
          emptyDescription="Custom customer segments can be calculated once the reporting layer and segment rules are connected."
        />
      </div>

      {/* Data integrity */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Reporting data integrity
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              This report will use actual StudyStow customer and order
              records. Manual adjustments, when required, should be
              stored through the dedicated reporting/accounting layer
              rather than modifying original customer or order records.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <FileBarChart className="h-3.5 w-3.5" />
              API + database connection pending
            </div>
          </div>
        </div>
      </section>

      {/* Warning */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <ShieldAlert className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-amber-900">
              No estimated customer metrics
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Customer counts, revenue, retention and rankings are
              intentionally left blank until the actual reporting data
              source is connected.
            </p>
          </div>
        </div>
      </section>

      {/* Footer navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="inline-flex items-center gap-2 text-xs text-slate-400">
          <FileBarChart className="h-4 w-4" />
          Customers Report
        </div>
      </div>
    </div>
  );
}