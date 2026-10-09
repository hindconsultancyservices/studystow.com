"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileBarChart,
  Landmark,
  RefreshCw,
  Scale,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type BalanceSectionProps = {
  title: string;
  description: string;
  icon: typeof Landmark;
  emptyTitle: string;
  emptyDescription: string;
};

function BalanceSection({
  title,
  description,
  icon: Icon,
  emptyTitle,
  emptyDescription,
}: BalanceSectionProps) {
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

export default function BalanceSheetPage() {
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
            You do not have permission to access the Balance Sheet report.
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
              Balance Sheet
            </span>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Scale className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Balance Sheet
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Financial position of StudyStow showing assets, liabilities
                and owner&apos;s equity for the selected reporting date.
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

      {/* Report controls */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">
              Reporting Period
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Select the date for which the balance sheet should be prepared.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[520px]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                As of date
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
                Accounting basis
              </label>

              <select
                disabled
                defaultValue="accrual"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none"
              >
                <option value="accrual">Accrual basis</option>
                <option value="cash">Cash basis</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Equation */}
      <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Accounting equation
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xl font-bold sm:text-2xl">
              <span>Assets</span>
              <span className="text-slate-500">=</span>
              <span>Liabilities</span>
              <span className="text-slate-500">+</span>
              <span>Owner&apos;s Equity</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 px-4 py-3 text-xs text-slate-300">
            Calculated from connected accounting data
          </div>
        </div>
      </section>

      {/* Main sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        <BalanceSection
          title="Assets"
          description="Resources owned or controlled by StudyStow, such as cash, bank balances, inventory and other business assets."
          icon={Landmark}
          emptyTitle="Asset data is not connected yet"
          emptyDescription="Once the accounting model and API are connected, this section will show current assets, non-current assets, inventory value, cash and bank balances and their totals."
        />

        <BalanceSection
          title="Liabilities"
          description="Outstanding obligations and amounts payable by StudyStow to suppliers, lenders, service providers or other parties."
          icon={FileBarChart}
          emptyTitle="Liability data is not connected yet"
          emptyDescription="Once liability entries and accounting data are connected, this section will show current liabilities, outstanding payables and other obligations."
        />
      </div>

      <BalanceSection
        title="Owner's Equity"
        description="Owner's investment, retained earnings and other equity-related balances that represent the owner's interest in the business."
        icon={Scale}
        emptyTitle="Equity data is not connected yet"
        emptyDescription="Once capital, retained earnings and related accounting entries are available, this section will calculate the owner's equity and show its components."
      />

      {/* Verification */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Balance check
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              When accounting data is connected, this report will verify that
              total assets equal total liabilities plus owner&apos;s equity.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Waiting for accounting data
            </div>
          </div>
        </div>
      </section>

      {/* Manual-entry notice */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <ShieldAlert className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-amber-900">
              Manual accounting entries
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Manual assets, liabilities, capital adjustments and other
              accounting entries should be stored through the dedicated
              accounting data layer. This page will not create or store
              financial records until that API and database model are
              connected.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}