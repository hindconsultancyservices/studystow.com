"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit3,
  ExternalLink,
  FileBarChart,
  Filter,
  MoreHorizontal,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type EntryType =
  | "expense"
  | "reimbursement"
  | "adjustment";

type LedgerStatus =
  | "pending"
  | "approved"
  | "paid"
  | "cancelled";

type SortField =
  | "date"
  | "amount"
  | "category"
  | "description";

type SortDirection = "asc" | "desc";

type LedgerEntry = {
  id: string;
  date: string;
  description: string;
  category: string;
  paymentMethod: string;
  entryType: EntryType;
  status: LedgerStatus;
  amount: number;
  vendor?: string;
  reference?: string;
};

const ENTRY_TYPE_OPTIONS: Array<{
  value: EntryType | "all";
  label: string;
}> = [
  {
    value: "all",
    label: "All Entry Types",
  },
  {
    value: "expense",
    label: "Expense",
  },
  {
    value: "reimbursement",
    label: "Reimbursement",
  },
  {
    value: "adjustment",
    label: "Adjustment",
  },
];

const STATUS_OPTIONS: Array<{
  value: LedgerStatus | "all";
  label: string;
}> = [
  {
    value: "all",
    label: "All Statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "paid",
    label: "Paid",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const EMPTY_LEDGER: LedgerEntry[] = [];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function entryTypeLabel(type: EntryType) {
  switch (type) {
    case "expense":
      return "Expense";

    case "reimbursement":
      return "Reimbursement";

    case "adjustment":
      return "Adjustment";

    default:
      return type;
  }
}

function statusClass(status: LedgerStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";

    case "approved":
      return "bg-blue-50 text-blue-700";

    case "pending":
      return "bg-amber-50 text-amber-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function entryTypeClass(type: EntryType) {
  switch (type) {
    case "expense":
      return "bg-slate-100 text-slate-700";

    case "reimbursement":
      return "bg-violet-50 text-violet-700";

    case "adjustment":
      return "bg-orange-50 text-orange-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  dark = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof WalletCards;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        dark
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              dark ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-3 truncate text-2xl font-bold tracking-tight ${
              dark ? "text-white" : "text-slate-300"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            dark
              ? "bg-white/10 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p
        className={`mt-3 text-xs leading-5 ${
          dark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          {children}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function EmptyLedgerState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <WalletCards className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        No ledger entries
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        No expense records are currently available from the reporting
        database. Once the Expense Ledger API is connected, your real
        expenses and manual entries will appear here.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
        <FileBarChart className="h-3.5 w-3.5" />
        Waiting for API + database connection
      </div>
    </div>
  );
}

export default function ExpenseLedgerPage() {
  const {
    isOwner,
    canView,
  } = useAdminPermissions();

  const canAccess =
    isOwner || canView("reports");

  const [search, setSearch] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [paymentMethod, setPaymentMethod] =
    useState("all");

  const [entryType, setEntryType] =
    useState<EntryType | "all">("all");

  const [status, setStatus] =
    useState<LedgerStatus | "all">("all");

  const [minAmount, setMinAmount] =
    useState("");

  const [maxAmount, setMaxAmount] =
    useState("");

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [sortField, setSortField] =
    useState<SortField>("date");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [showFilters, setShowFilters] =
    useState(true);

  const [showAdvancedActions, setShowAdvancedActions] =
    useState(false);

  const entries = EMPTY_LEDGER;

  const filteredEntries = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const result = entries.filter(
      (entry) => {
        if (
          normalizedSearch &&
          ![
            entry.description,
            entry.category,
            entry.paymentMethod,
            entry.vendor || "",
            entry.reference || "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        ) {
          return false;
        }

        if (
          category !== "all" &&
          entry.category !== category
        ) {
          return false;
        }

        if (
          paymentMethod !== "all" &&
          entry.paymentMethod !== paymentMethod
        ) {
          return false;
        }

        if (
          entryType !== "all" &&
          entry.entryType !== entryType
        ) {
          return false;
        }

        if (
          status !== "all" &&
          entry.status !== status
        ) {
          return false;
        }

        if (
          minAmount &&
          entry.amount < Number(minAmount)
        ) {
          return false;
        }

        if (
          maxAmount &&
          entry.amount > Number(maxAmount)
        ) {
          return false;
        }

        if (fromDate) {
          const entryDate =
            new Date(entry.date).getTime();

          const startDate =
            new Date(
              `${fromDate}T00:00:00`,
            ).getTime();

          if (
            Number.isFinite(startDate) &&
            entryDate < startDate
          ) {
            return false;
          }
        }

        if (toDate) {
          const entryDate =
            new Date(entry.date).getTime();

          const endDate =
            new Date(
              `${toDate}T23:59:59`,
            ).getTime();

          if (
            Number.isFinite(endDate) &&
            entryDate > endDate
          ) {
            return false;
          }
        }

        return true;
      },
    );

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "amount":
          comparison = a.amount - b.amount;
          break;

        case "category":
          comparison = a.category.localeCompare(
            b.category,
          );
          break;

        case "description":
          comparison =
            a.description.localeCompare(
              b.description,
            );
          break;

        case "date":
        default:
          comparison =
            new Date(a.date).getTime() -
            new Date(b.date).getTime();
          break;
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    entries,
    search,
    fromDate,
    toDate,
    category,
    paymentMethod,
    entryType,
    status,
    minAmount,
    maxAmount,
    sortField,
    sortDirection,
  ]);

  const allVisibleSelected =
    filteredEntries.length > 0 &&
    filteredEntries.every((entry) =>
      selectedIds.includes(entry.id),
    );

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !filteredEntries.some(
              (entry) => entry.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...filteredEntries.map(
          (entry) => entry.id,
        ),
      ]),
    ]);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id,
          )
        : [...current, id],
    );
  };

  const handleSort = (
    field: SortField,
  ) => {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc"
          ? "desc"
          : "asc",
      );

      return;
    }

    setSortField(field);
    setSortDirection("desc");
  };

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setCategory("all");
    setPaymentMethod("all");
    setEntryType("all");
    setStatus("all");
    setMinAmount("");
    setMaxAmount("");
  };

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
            You do not have permission to access the Expense Ledger.
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
    <div className="mx-auto w-full max-w-[1700px] space-y-6">
      {/* =========================================================
          HEADER
      ========================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link
                href="/admin/reports"
                className="transition hover:text-slate-950"
              >
                Reports
              </Link>

              <ArrowRight className="h-3.5 w-3.5" />

              <Link
                href="/admin/reports/expenses"
                className="transition hover:text-slate-950"
              >
                Expenses
              </Link>

              <ArrowRight className="h-3.5 w-3.5" />

              <span className="font-medium text-slate-700">
                Expense Ledger
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <WalletCards className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Expense Ledger
                </h1>

                <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                  Maintain a detailed, auditable record of every business
                  expense, reimbursement and manual adjustment entered into
                  StudyStow.
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
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400"
              title="Export becomes available after the reporting API is connected"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400"
              title="Print becomes available with the reporting data"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            <button
              type="button"
              disabled
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white opacity-50"
              title="Expense API is not connected yet"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          SUMMARY CARDS
      ========================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Expenses"
          value="—"
          description="Total expense value for the selected period."
          icon={ArrowDown}
        />

        <StatCard
          label="Paid Expenses"
          value="—"
          description="Expenses already marked as paid."
          icon={CheckCircle2}
        />

        <StatCard
          label="Pending Expenses"
          value="—"
          description="Expenses awaiting approval or payment."
          icon={WalletCards}
        />

        <StatCard
          label="Ledger Balance"
          value="—"
          description="Calculated ledger position after connected entries."
          icon={ArrowUpDown}
          dark
        />
      </section>

      {/* =========================================================
          FILTER BAR
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Filter className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Ledger Filters
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Filter the real expense ledger once the reporting API is
                connected.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setShowFilters((current) => !current)
              }
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                showFilters
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              {showFilters
                ? "Hide Filters"
                : "Show Filters"}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-5 p-5 sm:p-6">
            {/* Search */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Search Ledger
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  type="search"
                  placeholder="Search description, vendor, reference or category..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  From Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) =>
                      setFromDate(event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  To Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) =>
                      setToDate(event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <SelectField
                label="Entry Type"
                value={entryType}
                onChange={(value) =>
                  setEntryType(
                    value as EntryType | "all",
                  )
                }
              >
                {ENTRY_TYPE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </SelectField>

              <SelectField
                label="Status"
                value={status}
                onChange={(value) =>
                  setStatus(
                    value as LedgerStatus | "all",
                  )
                }
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </SelectField>

              <SelectField
                label="Category"
                value={category}
                onChange={setCategory}
              >
                <option value="all">
                  All Categories
                </option>
              </SelectField>

              <SelectField
                label="Payment Method"
                value={paymentMethod}
                onChange={setPaymentMethod}
              >
                <option value="all">
                  All Payment Methods
                </option>
              </SelectField>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Min Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={minAmount}
                  onChange={(event) =>
                    setMinAmount(event.target.value)
                  }
                  placeholder="₹ 0"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Max Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={maxAmount}
                  onChange={(event) =>
                    setMaxAmount(event.target.value)
                  }
                  placeholder="₹ 0"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* Applied Filters */}
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-400">
                Filter state:
              </span>

              {search ||
              fromDate ||
              toDate ||
              category !== "all" ||
              paymentMethod !== "all" ||
              entryType !== "all" ||
              status !== "all" ||
              minAmount ||
              maxAmount ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Filters applied
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  No filters
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          TOOLBAR
      ========================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">
              Ledger Entries
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {filteredEntries.length} visible entries
              {selectedIds.length > 0
                ? ` · ${selectedIds.length} selected`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Paid
                </button>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>

                <div className="h-5 w-px bg-slate-200" />
              </>
            )}

            <button
              type="button"
              onClick={() =>
                setShowAdvancedActions(
                  (current) => !current,
                )
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              More
            </button>

            <button
              type="button"
              disabled
              className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Entry
            </button>
          </div>
        </div>

        {showAdvancedActions && (
          <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled
                className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-400"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>

              <button
                type="button"
                disabled
                className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-400"
              >
                <Download className="h-3.5 w-3.5" />
                Export Excel
              </button>

              <button
                type="button"
                disabled
                className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-400"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Ledger
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          DESKTOP TABLE
      ========================================================== */}
      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:block">
        {filteredEntries.length === 0 ? (
          <EmptyLedgerState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1280px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          allVisibleSelected
                        }
                        onChange={
                          toggleAllVisible
                        }
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label="Select all visible entries"
                      />
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "date",
                          )
                        }
                        className="inline-flex items-center gap-1.5"
                      >
                        Date
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "description",
                          )
                        }
                        className="inline-flex items-center gap-1.5"
                      >
                        Description
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Payment
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "amount",
                          )
                        }
                        className="ml-auto inline-flex items-center gap-1.5"
                      >
                        Amount
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </th>

                    <th className="w-24 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.map(
                    (entry) => {
                      const selected =
                        selectedIds.includes(
                          entry.id,
                        );

                      return (
                        <tr
                          key={entry.id}
                          className={`transition hover:bg-slate-50 ${
                            selected
                              ? "bg-slate-50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={
                                selected
                              }
                              onChange={() =>
                                toggleSelected(
                                  entry.id,
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300"
                              aria-label={`Select ${entry.description}`}
                            />
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                            {formatDate(
                              entry.date,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="min-w-[240px]">
                              <p className="font-semibold text-slate-900">
                                {
                                  entry.description
                                }
                              </p>

                              {entry.vendor && (
                                <p className="mt-1 text-xs text-slate-400">
                                  Vendor:{" "}
                                  {
                                    entry.vendor
                                  }
                                </p>
                              )}

                              {entry.reference && (
                                <p className="mt-1 font-mono text-[10px] text-slate-400">
                                  {
                                    entry.reference
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {
                              entry.category
                            }
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {
                              entry.paymentMethod
                            }
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${entryTypeClass(
                                entry.entryType,
                              )}`}
                            >
                              {entryTypeLabel(
                                entry.entryType,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                                entry.status,
                              )}`}
                            >
                              {entry.status
                                .replace(
                                  /_/g,
                                  " ",
                                )
                                .replace(
                                  /\b\w/g,
                                  (char) =>
                                    char.toUpperCase(),
                                )}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(
                              entry.amount,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                disabled
                                className="rounded-lg p-2 text-slate-300"
                                title="Edit will be enabled after API integration"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                disabled
                                className="rounded-lg p-2 text-slate-300"
                                title="Delete will be enabled after API integration"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                disabled
                                className="rounded-lg p-2 text-slate-300"
                                title="View details will be enabled after API integration"
                              >
                                <ExternalLink className="h-4 w-4" />
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

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing {filteredEntries.length} of{" "}
                {filteredEntries.length} entries
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white">
                  1
                </span>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* =========================================================
          MOBILE / TABLET CARDS
      ========================================================== */}
      <section className="xl:hidden">
        {filteredEntries.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <EmptyLedgerState />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map(
              (entry) => {
                const selected =
                  selectedIds.includes(
                    entry.id,
                  );

                return (
                  <article
                    key={entry.id}
                    className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
                      selected
                        ? "ring-2 ring-slate-950/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4">
                      <div className="flex min-w-0 gap-3">
                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleSelected(
                              entry.id,
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                        />

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {
                              entry.description
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(
                              entry.date,
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="rounded-lg p-2 text-slate-300"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {
                            entry.category
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {formatCurrency(
                            entry.amount,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Payment
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {
                            entry.paymentMethod
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Status
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                            entry.status,
                          )}`}
                        >
                          {entry.status
                            .replace(
                              /_/g,
                              " ",
                            )
                            .replace(
                              /\b\w/g,
                              (char) =>
                                char.toUpperCase(),
                            )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
                      <button
                        type="button"
                        disabled
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-400"
                      >
                        <Edit3 className="mx-auto h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-400"
                      >
                        <Trash2 className="mx-auto h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-400"
                      >
                        <ExternalLink className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* =========================================================
          ACCOUNTING SAFETY
      ========================================================== */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
            <ShieldAlert className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-amber-900">
              Accounting data protection
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Ledger entries should never be stored in browser state or
              overwritten on the client. Actual expense records will be
              created, updated and deleted only through the authenticated
              reporting API and MongoDB.
            </p>

            <p className="mt-2 text-xs leading-5 text-amber-700">
              The current page intentionally contains no dummy ledger
              records and performs no database mutation.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          NAVIGATION
      ========================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/reports/expenses"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Expenses
        </Link>

        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          All Reports
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}