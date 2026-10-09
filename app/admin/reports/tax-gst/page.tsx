
"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Download,
  ExternalLink,
  FileBarChart2,
  FileCheck2,
  Filter,
  Info,
  Landmark,
  LoaderCircle,
  RefreshCw,
  ReceiptIndianRupee,
  Scale,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  WalletCards,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type OrderRecord = {
  id: string;
  orderNumber: string;
  date: string | null;
  customer: {
    name: string;
    phone: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  gstBreakdownAvailable: boolean;
  currency: string;
  includedInPaidSummary: boolean;
};

type ReportSummary = {
  paidOrderCount: number;
  taxableSales: number;
  totalTax: number;
  paidShipping: number;
  paidDiscount: number;
  paidOrderValue: number;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  gstBreakdownAvailable: boolean;
  currency: string;
};

type Pagination = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: OrderRecord[];
  summary?: ReportSummary;
  pagination?: Pagination;
};

type SortField =
  | "date"
  | "orderNumber"
  | "customer"
  | "subtotal"
  | "tax"
  | "total";

const API_URL = "/api/admin/reports/tax-gst";
const PAGE_SIZE = 20;

const EMPTY_SUMMARY: ReportSummary = {
  paidOrderCount: 0,
  taxableSales: 0,
  totalTax: 0,
  paidShipping: 0,
  paidDiscount: 0,
  paidOrderValue: 0,
  cgst: null,
  sgst: null,
  igst: null,
  gstBreakdownAvailable: false,
  currency: "INR",
};

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: PAGE_SIZE,
  totalRecords: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function formatCurrency(value: number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
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

  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function displayStatus(value: string | null | undefined) {
  if (!value) return "Unavailable";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(value: string | null | undefined) {
  switch (String(value || "").toLowerCase()) {
    case "paid":
    case "delivered":
      return "bg-emerald-50 text-emerald-700";

    case "pending":
    case "processing":
      return "bg-amber-50 text-amber-700";

    case "failed":
    case "cancelled":
      return "bg-red-50 text-red-700";

    case "refunded":
      return "bg-orange-50 text-orange-700";

    case "confirmed":
    case "shipped":
      return "bg-blue-50 text-blue-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function SummaryCard({
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p
            className={`mt-3 break-words text-xl font-bold tracking-tight sm:text-2xl ${
              dark ? "text-white" : "text-slate-950"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            dark
              ? "bg-white/10 text-white"
              : "bg-slate-100 text-slate-700"
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

function FilterSelect({
  value,
  onChange,
  children,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function SortButton({
  label,
  field,
  sortField,
  descending,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  descending: boolean;
  onSort: (field: SortField) => void;
}) {
  const active = field === sortField;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:text-slate-950"
    >
      {label}
      {active ? (
        descending ? (
          <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUp className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />
      )}
    </button>
  );
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCSV(records: OrderRecord[], filename: string) {
  const headers = [
    "Order Number",
    "Order ID",
    "Date",
    "Customer",
    "Phone",
    "City",
    "State",
    "Pincode",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Subtotal INR",
    "Discount INR",
    "Shipping INR",
    "Recorded Tax INR",
    "Total INR",
    "CGST INR",
    "SGST INR",
    "IGST INR",
  ];

  const rows = records.map((record) => [
    record.orderNumber,
    record.id,
    record.date ? new Date(record.date).toISOString() : "",
    record.customer?.name,
    record.customer?.phone,
    record.customer?.city,
    record.customer?.state,
    record.customer?.pincode,
    record.paymentMethod,
    record.paymentStatus,
    record.orderStatus,
    record.subtotal,
    record.discount,
    record.shipping,
    record.tax,
    record.total,
    record.cgst ?? "",
    record.sgst ?? "",
    record.igst ?? "",
  ]);

  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
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

export default function TaxGSTReportPage() {
  const { isOwner, canView } = useAdminPermissions();
  const canAccess = isOwner || canView("reports");

  const [records, setRecords] = useState<OrderRecord[]>([]);
  const [summary, setSummary] = useState<ReportSummary>(EMPTY_SUMMARY);
  const [pagination, setPagination] =
    useState<Pagination>(EMPTY_PAGINATION);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("date");
  const [descending, setDescending] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<OrderRecord | null>(null);

  const fetchReport = useCallback(
    async (
      targetPage: number,
      signal?: AbortSignal,
      overrides?: {
        search?: string;
        fromDate?: string;
        toDate?: string;
        paymentStatus?: string;
        orderStatus?: string;
      },
    ) => {
      const current = {
        search: overrides?.search ?? search,
        fromDate: overrides?.fromDate ?? fromDate,
        toDate: overrides?.toDate ?? toDate,
        paymentStatus: overrides?.paymentStatus ?? paymentStatus,
        orderStatus: overrides?.orderStatus ?? orderStatus,
      };

      if (
        current.fromDate &&
        current.toDate &&
        current.fromDate > current.toDate
      ) {
        setError("Start date cannot be after end date.");
        setRecords([]);
        setSummary(EMPTY_SUMMARY);
        setPagination(EMPTY_PAGINATION);
        return;
      }

      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE),
        search: current.search.trim(),
        from: current.fromDate,
        to: current.toDate,
        status: current.paymentStatus,
        orderStatus: current.orderStatus,
      });

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal,
          headers: {
            Accept: "application/json",
          },
        });

        const result = (await response.json()) as ApiResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load the Tax & GST report.",
          );
        }

        setRecords(Array.isArray(result.data) ? result.data : []);
        setSummary(result.summary ?? EMPTY_SUMMARY);
        setPagination(result.pagination ?? EMPTY_PAGINATION);
        setSelectedIds([]);
        setPage(targetPage);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the report.",
        );
        setRecords([]);
        setSummary(EMPTY_SUMMARY);
        setPagination(EMPTY_PAGINATION);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [search, fromDate, toDate, paymentStatus, orderStatus],
  );

  useEffect(() => {
    if (!canAccess) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetchReport(1, controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    canAccess,
    search,
    fromDate,
    toDate,
    paymentStatus,
    orderStatus,
    fetchReport,
  ]);

  const visibleRecords = useMemo(() => {
    const min = minValue.trim() ? Number(minValue) : null;
    const max = maxValue.trim() ? Number(maxValue) : null;

    return records
      .filter((record) => {
        if (min !== null && Number.isFinite(min) && record.subtotal < min) {
          return false;
        }

        if (max !== null && Number.isFinite(max) && record.subtotal > max) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let difference = 0;

        switch (sortField) {
          case "orderNumber":
            difference = String(a.orderNumber || "").localeCompare(
              String(b.orderNumber || ""),
            );
            break;

          case "customer":
            difference = String(a.customer?.name || "").localeCompare(
              String(b.customer?.name || ""),
            );
            break;

          case "subtotal":
            difference = a.subtotal - b.subtotal;
            break;

          case "tax":
            difference = a.tax - b.tax;
            break;

          case "total":
            difference = a.total - b.total;
            break;

          case "date":
          default:
            difference =
              new Date(a.date || 0).getTime() -
              new Date(b.date || 0).getTime();
        }

        return descending ? -difference : difference;
      });
  }, [records, minValue, maxValue, sortField, descending]);

  const allSelected =
    visibleRecords.length > 0 &&
    visibleRecords.every((record) => selectedIds.includes(record.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !visibleRecords.some((record) => record.id === id),
        ),
      );
      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...visibleRecords.map((record) => record.id)]),
    ]);
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setDescending((current) => !current);
    } else {
      setSortField(field);
      setDescending(true);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setPaymentStatus("all");
    setOrderStatus("all");
    setMinValue("");
    setMaxValue("");
    setSelectedIds([]);
  };

  const handleExportAll = async () => {
    setExporting(true);
    setError("");

    try {
      const allRecords: OrderRecord[] = [];
      const totalPages = Math.max(1, pagination.totalPages);

      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
          search: search.trim(),
          from: fromDate,
          to: toDate,
          status: paymentStatus,
          orderStatus,
        });

        const response = await fetch(`${API_URL}?${params.toString()}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const result = (await response.json()) as ApiResponse;

        if (!response.ok || !result.success) {
          throw new Error(result.message || "CSV export failed.");
        }

        allRecords.push(...(result.data ?? []));

        if (!result.pagination?.hasNextPage) break;
      }

      if (allRecords.length === 0) {
        setNotice("There are no records to export for the selected filters.");
        return;
      }

      downloadCSV(allRecords, "studystow-tax-gst-report.csv");
      setNotice(`${allRecords.length} order records exported successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to export the report.",
      );
    } finally {
      setExporting(false);
    }
  };

  const handleExportSelected = () => {
    const selected = records.filter((record) =>
      selectedIds.includes(record.id),
    );

    if (selected.length === 0) {
      setNotice("Select at least one record to export.");
      return;
    }

    downloadCSV(selected, "studystow-tax-gst-selected.csv");
    setNotice(`${selected.length} selected records exported.`);
  };

  if (!canAccess) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Access denied
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            You do not have permission to view this report.
          </p>
          <Link
            href="/admin/reports"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1700px] space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/admin/reports" className="hover:text-slate-950">
                Reports
              </Link>
              <ArrowRight className="h-3.5 w-3.5" />
              <span className="text-slate-900">Tax & GST</span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <ReceiptIndianRupee className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Tax & GST Report
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Review order turnover, recorded tax, discounts, shipping
                  and payment status from your existing StudyStow API.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchReport(page)}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => void handleExportAll()}
              disabled={loading || exporting || pagination.totalRecords === 0}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? "Exporting..." : "Export CSV"}
            </button>

            <button
              type="button"
              onClick={() =>
                setNotice(
                  "Filing workspace is not available in the current API. No filing status is being changed and no GST return has been submitted.",
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FileCheck2 className="h-4 w-4" />
              Filing Info
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Unable to load the report</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchReport(page)}
            className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1 leading-6">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Recorded Taxable Sales"
          value={loading ? "Loading..." : formatCurrency(summary.taxableSales)}
          description="Paid orders: subtotal less recorded discount."
          icon={CircleDollarSign}
        />
        <SummaryCard
          label="Recorded Order Tax"
          value={loading ? "Loading..." : formatCurrency(summary.totalTax)}
          description="Tax amount stored on paid orders; not a GST component breakdown."
          icon={ArrowUp}
        />
        <SummaryCard
          label="Paid Orders"
          value={loading ? "Loading..." : formatNumber(summary.paidOrderCount)}
          description="Paid orders included in the API summary."
          icon={ClipboardList}
        />
        <SummaryCard
          label="Paid Order Value"
          value={loading ? "Loading..." : formatCurrency(summary.paidOrderValue)}
          description="Total value of paid orders in the selected period."
          icon={WalletCards}
          dark
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "CGST",
            description: "Separate component not provided by the API.",
            icon: ReceiptIndianRupee,
          },
          {
            label: "SGST",
            description: "Separate component not provided by the API.",
            icon: ReceiptIndianRupee,
          },
          {
            label: "IGST",
            description: "Separate component not provided by the API.",
            icon: Landmark,
          },
          {
            label: "Input Tax Credit",
            description: "Purchase/input-tax source is not provided by this API.",
            icon: Scale,
          },
        ].map(({ label, description, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Not available
              </span>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-950">{label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
            <p className="mt-4 text-xl font-bold text-slate-300">—</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Recorded Tax Position
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Values below come directly from the paid-order summary returned by the API.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1 p-5 sm:p-6">
            {[
              ["Paid order count", formatNumber(summary.paidOrderCount)],
              ["Taxable sales", formatCurrency(summary.taxableSales)],
              ["Recorded order tax", formatCurrency(summary.totalTax)],
              ["Shipping collected", formatCurrency(summary.paidShipping)],
              ["Discounts recorded", formatCurrency(summary.paidDiscount)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 border-b border-slate-100 py-3"
              >
                <span className="text-sm text-slate-600">{label}</span>
                <span className="text-right text-sm font-semibold text-slate-950">
                  {loading ? "Loading..." : value}
                </span>
              </div>
            ))}

            <div className="mt-5 rounded-xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Paid Order Value
              </p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(summary.paidOrderValue)}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                This is the order value from the API, not a calculated GST liability.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Data Availability
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Current API capabilities.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {[
              ["Order records", true],
              ["Recorded order tax", true],
              ["Payment status", true],
              ["Separate GST components", false],
              ["Input tax credit", false],
              ["GST filing workflow", false],
            ].map(([label, available]) => (
              <div key={String(label)} className="flex items-center gap-3">
                {available ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <Info className="h-5 w-5 shrink-0 text-slate-400" />
                )}
                <span className="text-sm text-slate-700">{label}</span>
                <span
                  className={`ml-auto text-xs font-semibold ${
                    available ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  {available ? "Available" : "Unavailable"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Report Filters
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Search and filter using supported API parameters.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-5 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order number, customer, phone or payment ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Payment Status
                </label>
                <FilterSelect value={paymentStatus} onChange={setPaymentStatus}>
                  <option value="all">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </FilterSelect>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Order Status
                </label>
                <FilterSelect value={orderStatus} onChange={setOrderStatus}>
                  <option value="all">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </FilterSelect>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  From Date
                </label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                    min={fromDate || undefined}
                    onChange={(event) => setToDate(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Minimum Subtotal (current page)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minValue}
                  onChange={(event) => setMinValue(event.target.value)}
                  placeholder="Minimum amount"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Maximum Subtotal (current page)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxValue}
                  onChange={(event) => setMaxValue(event.target.value)}
                  placeholder="Maximum amount"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-lg bg-slate-50 px-3 py-2">
                <strong className="text-slate-800">Matching API records:</strong>{" "}
                {formatNumber(pagination.totalRecords)}
              </span>
              <span className="rounded-lg bg-slate-50 px-3 py-2">
                <strong className="text-slate-800">Visible this page:</strong>{" "}
                {formatNumber(visibleRecords.length)}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Order Tax Transactions
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {formatNumber(pagination.totalRecords)} matching API records
              {selectedIds.length > 0 ? ` · ${selectedIds.length} selected` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleExportSelected}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export Selected
              </button>
            )}

            <button
              type="button"
              onClick={() => void fetchReport(page)}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading && records.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-16 text-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-slate-500" />
            <p className="mt-4 text-sm font-semibold text-slate-800">
              Loading report records...
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Fetching real order data from the configured API.
            </p>
          </div>
        ) : error && records.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Report could not be loaded
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Check the API response and try again.
            </p>
            <button
              type="button"
              onClick={() => void fetchReport(page)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ReceiptIndianRupee className="mx-auto h-9 w-9 text-slate-400" />
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No matching records
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              There are no orders matching these filters. Clear the filters or change the reporting period.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1500px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="Select all visible records"
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Order"
                        field="orderNumber"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Date"
                        field="date"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Customer"
                        field="customer"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Order Status
                    </th>
                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Subtotal"
                        field="subtotal"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Shipping
                    </th>
                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Recorded Tax"
                        field="tax"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Total"
                        field="total"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      GST Split
                    </th>
                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleRecords.map((record) => {
                    const selected = selectedIds.includes(record.id);

                    return (
                      <tr
                        key={record.id}
                        className={`transition hover:bg-slate-50 ${
                          selected ? "bg-slate-50" : ""
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleRow(record.id)}
                            aria-label={`Select ${record.orderNumber || record.id}`}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-mono text-xs font-semibold text-slate-900">
                            {record.orderNumber || "Order number unavailable"}
                          </p>
                          <p className="mt-1 font-mono text-[10px] text-slate-400">
                            {record.id}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {formatDate(record.date)}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900">
                            {record.customer?.name || "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {record.customer?.phone || "Phone unavailable"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {[record.customer?.city, record.customer?.state]
                              .filter(Boolean)
                              .join(", ") || "Address unavailable"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              record.paymentStatus,
                            )}`}
                          >
                            {displayStatus(record.paymentStatus)}
                          </span>
                          <p className="mt-1 text-xs text-slate-400">
                            {displayStatus(record.paymentMethod)}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              record.orderStatus,
                            )}`}
                          >
                            {displayStatus(record.orderStatus)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800">
                          {formatCurrency(record.subtotal)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-slate-600">
                          {formatCurrency(record.discount)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-slate-600">
                          {formatCurrency(record.shipping)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-slate-950">
                          {formatCurrency(record.tax)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-slate-950">
                          {formatCurrency(record.total)}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Unavailable
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            title="View order details"
                            aria-label={`View details for ${record.orderNumber || record.id}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                {" · "}
                {formatNumber(pagination.totalRecords)} total records
                {loading ? " · Updating..." : ""}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loading || !pagination.hasPreviousPage}
                  onClick={() => void fetchReport(page - 1)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white">
                  {pagination.page}
                </span>

                <button
                  type="button"
                  disabled={loading || !pagination.hasNextPage}
                  onClick={() => void fetchReport(page + 1)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-bold text-amber-900">
              GST calculation and filing notice
            </h2>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              This report displays order amounts and the tax amount stored in
              your existing Order records. The current API does not supply
              separate CGST, SGST, IGST, input tax credit, filing history or
              reconciliation data. Those values are intentionally not
              estimated, and this page does not submit GST returns.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: "/admin/reports/sales",
            title: "Sales Report",
            description: "Review sales and order turnover.",
            icon: CircleDollarSign,
          },
          {
            href: "/admin/reports/payments",
            title: "Payments Report",
            description: "Review recorded payment information.",
            icon: WalletCards,
          },
          {
            href: "/admin/reports/expenses",
            title: "Expense Report",
            description: "Review expense records.",
            icon: ClipboardList,
          },
          {
            href: "/admin/reports/profit-loss",
            title: "Profit & Loss",
            description: "Review reported revenue and expenses.",
            icon: FileBarChart2,
          },
        ].map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-950">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          </Link>
        ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <Link
          href="/admin/reports/balance-sheet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          Balance Sheet
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2
                  id="order-details-title"
                  className="text-lg font-bold text-slate-950"
                >
                  Order Details
                </h2>
                <p className="mt-1 break-all font-mono text-xs text-slate-500">
                  {selectedRecord.orderNumber || selectedRecord.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close order details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {[
                ["Order ID", selectedRecord.id],
                ["Order Date", formatDate(selectedRecord.date)],
                ["Customer", selectedRecord.customer?.name || "—"],
                ["Phone", selectedRecord.customer?.phone || "—"],
                ["City", selectedRecord.customer?.city || "—"],
                ["State", selectedRecord.customer?.state || "—"],
                ["Pincode", selectedRecord.customer?.pincode || "—"],
                ["Payment Method", displayStatus(selectedRecord.paymentMethod)],
                ["Payment Status", displayStatus(selectedRecord.paymentStatus)],
                ["Order Status", displayStatus(selectedRecord.orderStatus)],
                ["Subtotal", formatCurrency(selectedRecord.subtotal)],
                ["Discount", formatCurrency(selectedRecord.discount)],
                ["Shipping", formatCurrency(selectedRecord.shipping)],
                ["Recorded Tax", formatCurrency(selectedRecord.tax)],
                ["Total", formatCurrency(selectedRecord.total)],
                ["CGST / SGST / IGST", "Not provided by API"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}