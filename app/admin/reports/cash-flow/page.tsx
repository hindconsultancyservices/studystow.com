"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileBarChart,
  Landmark,
  RefreshCw,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type CashSectionProps = {
  title: string;
  description: string;
  icon: typeof ArrowDownLeft;
  emptyTitle: string;
  emptyDescription: string;
};

function CashSection({
  title,
  description,
  icon: Icon,
  emptyTitle,
  emptyDescription,
}: CashSectionProps) {
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
            <WalletCards className="h-5 w-5" />
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

export default function CashFlowPage() {
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
            You do not have permission to access the Cash Flow report.
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
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end lg:justify-between">
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
              Cash Flow
            </span>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <WalletCards className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Cash Flow
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Monitor money coming into and going out of StudyStow, with
                cash movement grouped by operating, investing and financing
                activities.
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

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">
              Reporting Period
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Select the period used to calculate cash inflows and
              outflows.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[520px]">
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
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Opening Cash
              </p>

              <p className="mt-3 text-xl font-bold text-slate-300">
                —
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
              <Landmark className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Beginning cash and bank position for the selected period.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Inflow
              </p>

              <p className="mt-3 text-xl font-bold text-slate-300">
                —
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Cash received from connected business transactions.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Outflow
              </p>

              <p className="mt-3 text-xl font-bold text-slate-300">
                —
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Cash paid for expenses, purchases, refunds and other
            outflows.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Net Cash Flow
              </p>

              <p className="mt-3 text-xl font-bold text-white">
                —
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3 text-white">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Total cash inflows minus total cash outflows.
          </p>
        </div>
      </section>

      {/* Cash flow categories */}
      <div className="grid gap-6 xl:grid-cols-2">
        <CashSection
          title="Operating Activities"
          description="Cash generated or used through normal StudyStow operations."
          icon={ArrowDownLeft}
          emptyTitle="Operating cash data is not connected yet"
          emptyDescription="This section will include customer collections, supplier payments, operating expenses, refunds and other routine business cash movements."
        />

        <CashSection
          title="Investing Activities"
          description="Cash movements related to business assets and long-term investments."
          icon={ArrowUpRight}
          emptyTitle="Investing cash data is not connected yet"
          emptyDescription="This section can include purchases or disposals of equipment, technology or other long-term assets once the accounting data model is connected."
        />
      </div>

      <CashSection
        title="Financing Activities"
        description="Cash movements related to owner capital, financing and other funding activity."
        icon={Landmark}
        emptyTitle="Financing cash data is not connected yet"
        emptyDescription="Once financing and owner-equity entries exist in the accounting layer, this section will show relevant cash inflows and outflows."
      />

      {/* Reconciliation */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Cash reconciliation
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              When the accounting API is connected, the report will
              reconcile opening cash + net cash movement against the
              closing cash and bank position.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Waiting for accounting data
            </div>
          </div>
        </div>
      </section>

      {/* Manual entries */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <ShieldAlert className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-amber-900">
              Manual cash entries
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Manual cash receipts, petty cash payments, owner
              contributions, cash withdrawals and other adjustments will
              be added only after the dedicated accounting model and API
              are connected.
            </p>

            <p className="mt-2 text-xs leading-5 text-amber-700">
              This page intentionally does not write any financial data
              yet.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
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
          Cash Flow Report
        </div>
      </div>
    </div>
  );
}