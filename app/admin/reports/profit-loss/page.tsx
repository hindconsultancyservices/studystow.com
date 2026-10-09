"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  Info,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

type ExpenseRecord = {
  _id?: string;
  id?: string;
  date?: string;
  title?: string;
  category?: string;
  amount?: number | string;
  taxAmount?: number | string;
  status?: "paid" | "pending" | "cancelled" | string;
};

type ProfitLossData = {
  period?: {
    from: string | null;
    to: string | null;
  };
  revenue: number | null;
  expenses: number | null;
  expenseTax: number | null;
  netProfit: number | null;
  profitMargin: number | null;
  revenueConfigured?: boolean;
  message?: string;
  expenseRecords?: number;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const API_URL = "/api/admin/reports/profit-loss";

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function dateForInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  muted = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Wallet;
  loading: boolean;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          {loading ? (
            <div className="mt-3 h-8 w-36 animate-pulse rounded-lg bg-neutral-100" />
          ) : (
            <p
              className={`mt-2 break-words text-2xl font-bold tracking-tight ${
                muted ? "text-neutral-400" : "text-neutral-950"
              }`}
            >
              {value}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
          <Icon className="h-5 w-5 text-neutral-700" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-neutral-500">{description}</p>
    </div>
  );
}

export default function ProfitLossPage() {
  const [report, setReport] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [recordId, setRecordId] = useState("");
  const [record, setRecord] = useState<ExpenseRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState("");

  const [editForm, setEditForm] = useState({
    date: "",
    title: "",
    category: "",
    amount: "",
    taxAmount: "",
    status: "paid",
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "title">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchReport = useCallback(
    async (quiet = false) => {
      if (from && to && from > to) {
        setError("From date cannot be after To date.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setNotice("");

      try {
        const params = new URLSearchParams();

        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const response = await fetch(
          `${API_URL}${params.size ? `?${params.toString()}` : ""}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
          }
        );

        const result: ApiResponse<ProfitLossData> = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.message || "Unable to load the Profit & Loss report."
          );
        }

        setReport(result.data);

        if (result.data.revenueConfigured === false) {
          setNotice(
            result.data.message ||
              "Revenue is not connected to this report yet. Profit cannot be calculated accurately."
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the report."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [from, to]
  );

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const loadRecord = useCallback(async () => {
    const id = recordId.trim();

    if (!id) {
      setRecordError("Enter an expense record ID first.");
      setRecord(null);
      return;
    }

    setRecordLoading(true);
    setRecordError("");
    setRecord(null);

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        }
      );

      const result: ApiResponse<ExpenseRecord> = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Could not find this expense.");
      }

      setRecord(result.data);
    } catch (err) {
      setRecordError(
        err instanceof Error ? err.message : "Could not load this expense."
      );
    } finally {
      setRecordLoading(false);
    }
  }, [recordId]);

  const openEdit = useCallback(() => {
    if (!record) return;

    setEditForm({
      date: dateForInput(record.date),
      title: record.title ?? "",
      category: record.category ?? "",
      amount:
        record.amount === undefined || record.amount === null
          ? ""
          : String(record.amount),
      taxAmount:
        record.taxAmount === undefined || record.taxAmount === null
          ? ""
          : String(record.taxAmount),
      status: record.status ?? "paid",
    });

    setEditError("");
    setEditOpen(true);
  }, [record]);

  const saveRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const id = record?._id || record?.id;

    if (!id) {
      setEditError("The loaded record does not contain a valid ID.");
      return;
    }

    if (!editForm.date || !editForm.title.trim()) {
      setEditError("Date and title are required.");
      return;
    }

    const amount = Number(editForm.amount);
    const taxAmount = Number(editForm.taxAmount || 0);

    if (!Number.isFinite(amount) || amount < 0) {
      setEditError("Enter a valid non-negative amount.");
      return;
    }

    if (!Number.isFinite(taxAmount) || taxAmount < 0) {
      setEditError("Enter a valid non-negative tax amount.");
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editForm.date,
          title: editForm.title.trim(),
          category: editForm.category.trim(),
          amount,
          taxAmount,
          status: editForm.status,
        }),
      });

      const result: ApiResponse<ExpenseRecord> = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to update this expense.");
      }

      setRecord(result.data);
      setEditOpen(false);
      setNotice(result.message || "Expense updated successfully.");
      await fetchReport(true);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Unable to update this expense."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async () => {
    const id = record?._id || record?.id;

    if (!id) {
      setRecordError("The loaded record does not contain a valid ID.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this expense record? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setRecordError("");

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const result: ApiResponse<{ id: string }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete this expense.");
      }

      setRecord(null);
      setRecordId("");
      setNotice(result.message || "Expense deleted successfully.");
      await fetchReport(true);
    } catch (err) {
      setRecordError(
        err instanceof Error ? err.message : "Unable to delete this expense."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    if (!report) {
      setError("There is no report data available to export.");
      return;
    }

    downloadCsv("studystow-profit-loss-report.csv", [
      ["StudyStow Profit & Loss Report"],
      ["From", from || "All dates"],
      ["To", to || "All dates"],
      [],
      ["Metric", "Value"],
      ["Revenue", report.revenue ?? "Not configured"],
      ["Paid Expenses", report.expenses ?? "Not available"],
      ["Expense Tax", report.expenseTax ?? "Not available"],
      ["Net Profit", report.netProfit ?? "Not available"],
      ["Profit Margin (%)", report.profitMargin ?? "Not available"],
      ["Expense Records", report.expenseRecords ?? 0],
      [],
      ["Note", report.message || "Revenue data is not configured."],
    ]);

    setNotice("Report CSV exported successfully.");
  };

  const clearFilters = () => {
    setFrom("");
    setTo("");
    setSearch("");
    setSortBy("date");
    setSortDirection("desc");
    setError("");
    setNotice("");
  };

  const hasActiveFilters = Boolean(from || to || search);

  const recordMatchesSearch = useMemo(() => {
    if (!record) return false;

    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      record._id,
      record.id,
      record.title,
      record.category,
      record.status,
      record.date,
      record.amount,
      record.taxAmount,
    ].some((value) => String(value ?? "").toLowerCase().includes(query));
  }, [record, search]);

  const displayedRecord = useMemo(() => {
    if (!record || !recordMatchesSearch) return null;

    return record;
  }, [record, recordMatchesSearch]);

  const netProfit = report?.netProfit ?? null;
  const revenue = report?.revenue ?? null;
  const expenses = report?.expenses ?? null;
  const expenseTax = report?.expenseTax ?? null;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              <Link
                href="/admin"
                className="transition hover:text-neutral-950"
              >
                Admin
              </Link>
              <span>/</span>
              <Link
                href="/admin/reports"
                className="transition hover:text-neutral-950"
              >
                Reports
              </Link>
              <span>/</span>
              <span className="font-medium text-neutral-900">
                Profit &amp; Loss
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl bg-neutral-950 p-3 text-white sm:block">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Profit &amp; Loss
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  Review recorded expenses, tax totals and financial reporting
                  readiness.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchReport(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading || refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={!report || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </header>

        {/* Notices */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Report could not be loaded</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchReport(true)}
              className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 font-semibold hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 leading-6">{notice}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              className="rounded-lg p-1 hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Revenue connection status */}
        {report?.revenueConfigured === false && (
          <section className="rounded-2xl border border-neutral-300 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <Info className="h-5 w-5 text-neutral-700" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">
                  Revenue integration is not configured
                </h2>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  This report currently reads paid expenses from MongoDB. It
                  cannot calculate net profit or profit margin until actual
                  order revenue is connected to the reporting API.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/admin/reports/sales"
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
                  >
                    Open Sales Report
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/admin/reports/orders"
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
                  >
                    Open Orders
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                <Clock3 className="h-3.5 w-3.5" />
                Setup required
              </span>
            </div>
          </section>
        )}

        {/* Date filters */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setFiltersOpen((current) => !current)}
            aria-expanded={filtersOpen}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <span className="flex items-center gap-3">
              <span className="rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                <Filter className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  Report filters
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  Select a date range to recalculate the report.
                </span>
              </span>
            </span>
            <ChevronDown
              className={`h-5 w-5 text-neutral-500 transition ${
                filtersOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {filtersOpen && (
            <div className="border-t border-neutral-100 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto] xl:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-neutral-700">
                    From date
                  </span>
                  <span className="relative block">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="date"
                      value={from}
                      max={to || undefined}
                      onChange={(event) => setFrom(event.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-neutral-700">
                    To date
                  </span>
                  <span className="relative block">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="date"
                      value={to}
                      min={from || undefined}
                      onChange={(event) => setTo(event.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                    />
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => void fetchReport()}
                  disabled={loading || refreshing}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Apply Filters
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </button>
              </div>

              <p className="mt-3 text-xs text-neutral-500">
                Only expenses with status <strong>paid</strong> are included by
                the current reporting API.
              </p>
            </div>
          )}
        </section>

        {/* Summary cards */}
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Financial overview
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Values returned by your Profit &amp; Loss API.
              </p>
            </div>
            <span className="text-xs text-neutral-500">
              {from || to
                ? `${from || "Beginning"} to ${to || "Latest"}`
                : "All available dates"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Recorded Revenue"
              value={formatCurrency(revenue)}
              description={
                report?.revenueConfigured === false
                  ? "Connect actual order data to calculate revenue."
                  : "Revenue reported by the API."
              }
              icon={CircleDollarSign}
              loading={loading}
              muted={revenue === null}
            />

            <StatCard
              title="Paid Expenses"
              value={formatCurrency(expenses)}
              description="Total amount of paid expense records."
              icon={Wallet}
              loading={loading}
            />

            <StatCard
              title="Expense Tax"
              value={formatCurrency(expenseTax)}
              description="Recorded tax on the included paid expenses."
              icon={FileSpreadsheet}
              loading={loading}
            />

            <StatCard
              title="Net Profit"
              value={formatCurrency(netProfit)}
              description="Unavailable until revenue is calculated by the API."
              icon={Activity}
              loading={loading}
              muted={netProfit === null}
            />
          </div>
        </section>

        {/* Analysis panels */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Profitability analysis</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Calculation readiness based on connected data.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-neutral-700">
                    Revenue data
                  </span>
                  <span className="font-semibold text-neutral-500">
                    {report?.revenueConfigured ? "Connected" : "Not connected"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      report?.revenueConfigured
                        ? "w-full bg-neutral-900"
                        : "w-0"
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-neutral-700">
                    Expense data
                  </span>
                  <span className="font-semibold text-neutral-700">
                    {report ? "Loaded from MongoDB" : "Waiting for data"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full bg-neutral-900 transition-all ${
                      report ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-neutral-700">
                    Net profit calculation
                  </span>
                  <span className="font-semibold text-neutral-500">
                    {netProfit === null ? "Unavailable" : "Available"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      netProfit === null ? "w-0" : "w-full bg-neutral-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" />
                <p className="text-sm leading-6 text-neutral-600">
                  A valid net profit calculation requires actual revenue and
                  expenses for the same period. The current API does not
                  provide revenue, so this page does not estimate profit.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Report status</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Current data availability
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-neutral-700" />
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-neutral-700" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Expense records</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {loading
                      ? "Loading records..."
                      : `${formatNumber(report?.expenseRecords)} records returned`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                {report?.revenueConfigured ? (
                  <Check className="h-5 w-5 shrink-0 text-neutral-700" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-neutral-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Revenue integration</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {report?.revenueConfigured
                      ? "Available"
                      : "Requires Order integration"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
                <LockKeyhole className="h-5 w-5 shrink-0 text-neutral-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Access control</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Owner-only API authorization
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={!report || loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download Summary CSV
            </button>
          </div>
        </section>

        {/* Expense record lookup */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Expense record management
                </h2>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Find an existing expense using its MongoDB record ID, then
                  view, edit or delete it.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                Owner access required
              </span>
            </div>

            <form
              className="mt-5 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void loadRecord();
              }}
            >
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Expense record ID</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={recordId}
                  onChange={(event) => setRecordId(event.target.value)}
                  placeholder="Enter expense MongoDB ID"
                  className="w-full rounded-xl border border-neutral-300 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                />
              </label>

              <button
                type="submit"
                disabled={recordLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {recordLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Find Record
              </button>
            </form>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              The current summary endpoint returns totals, not a list of
              individual expenses. Record lookup uses the separate
              <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5">
                /[id]
              </code>
              API route.
            </p>
          </div>

          {recordError && (
            <div className="m-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 break-words">{recordError}</p>
              <button
                type="button"
                onClick={() => setRecordError("")}
                aria-label="Dismiss error"
                className="rounded p-0.5 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {displayedRecord ? (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-base font-bold">
                      {displayedRecord.title || "Untitled expense"}
                    </h3>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        displayedRecord.status === "paid"
                          ? "border-neutral-300 bg-neutral-100 text-neutral-800"
                          : displayedRecord.status === "pending"
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-neutral-200 bg-white text-neutral-500"
                      }`}
                    >
                      {displayedRecord.status || "Unknown status"}
                    </span>
                  </div>

                  <p className="mt-2 break-all text-xs text-neutral-500">
                    ID: {displayedRecord._id || displayedRecord.id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openEdit}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold hover:bg-neutral-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteRecord()}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    {deleting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs font-medium text-neutral-500">
                    Expense date
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {formatDate(displayedRecord.date)}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs font-medium text-neutral-500">
                    Category
                  </p>
                  <p className="mt-2 break-words text-sm font-bold">
                    {displayedRecord.category || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs font-medium text-neutral-500">
                    Expense amount
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {formatCurrency(Number(displayedRecord.amount))}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-xs font-medium text-neutral-500">
                    Recorded tax
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {formatCurrency(Number(displayedRecord.taxAmount ?? 0))}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            !recordError && (
              <div className="px-5 py-10 text-center sm:px-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
                  <Search className="h-5 w-5 text-neutral-500" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">
                  Find an expense record
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-neutral-500">
                  Enter an existing expense ID above. The current API does not
                  expose a list endpoint, so no placeholder rows are displayed.
                </p>
              </div>
            )
          )}
        </section>

        {/* Reporting limitation */}
        <section className="rounded-2xl border border-neutral-200 bg-neutral-100/70 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-2">
              <Info className="h-5 w-5 text-neutral-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold">
                Data accuracy and reporting scope
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                This page uses the values returned by your current API. It
                includes paid expenses only. It does not invent revenue, net
                profit, margin, trends, or expense rows when those values are
                not available. The current API must be connected to actual
                order revenue before this can be treated as a complete Profit
                &amp; Loss statement.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium">
                <Link
                  href="/admin/reports"
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-neutral-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All Reports
                </Link>
                <Link
                  href="/admin/reports/sales"
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-neutral-600"
                >
                  Sales Report
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/reports/balance-sheet"
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-neutral-600"
                >
                  Balance Sheet
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-2 border-t border-neutral-200 pt-4 text-xs text-neutral-500 sm:flex-row sm:items-center">
          <p>StudyStow Admin · Profit &amp; Loss</p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Data loaded from your reporting API
          </p>
        </footer>
      </div>

      {/* Edit expense modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setEditOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-expense-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 p-5 sm:p-6">
              <div>
                <h2
                  id="edit-expense-title"
                  className="text-lg font-bold tracking-tight"
                >
                  Edit expense
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Changes are saved to the existing Expense record.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setEditOpen(false)}
                aria-label="Close edit form"
                className="rounded-lg border border-neutral-200 p-2 transition hover:bg-neutral-100 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={saveRecord} className="space-y-5 p-5 sm:p-6">
              {editError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Expense date *
                  </span>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        date: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Status *
                  </span>
                  <select
                    required
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        status: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium">
                    Expense title *
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={editForm.title}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Expense title"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium">
                    Category
                  </span>
                  <input
                    type="text"
                    maxLength={100}
                    value={editForm.category}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        category: event.target.value,
                      }))
                    }
                    placeholder="Expense category"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Amount (₹) *
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={editForm.amount}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        amount: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Tax amount (₹)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.taxAmount}
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        taxAmount: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold transition hover:bg-neutral-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
