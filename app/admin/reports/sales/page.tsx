"use client";

import Link from "next/link";
import {
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
  Filter,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShoppingCart,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type SalesStatus =
  | "completed"
  | "processing"
  | "pending"
  | "cancelled"
  | "refunded"
  | "partially-refunded";

type SalesRecord = {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  productName: string;
  category: string;
  units: number;
  grossAmount: number;
  discount: number;
  refund: number;
  shipping: number;
  tax: number;
  netSales: number;
  status: SalesStatus;
};

type SortField =
  | "date"
  | "orderNumber"
  | "customerName"
  | "productName"
  | "units"
  | "grossAmount"
  | "discount"
  | "refund"
  | "netSales";

const EMPTY_SALES: SalesRecord[] = [];

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Sales Statuses",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "refunded",
    label: "Refunded",
  },
  {
    value: "partially-refunded",
    label: "Partially Refunded",
  },
];

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
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN").format(value);
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

function formatPercent(value: number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${value.toFixed(2)}%`;
}

function statusClass(status: SalesStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";

    case "processing":
      return "bg-violet-50 text-violet-700";

    case "pending":
      return "bg-amber-50 text-amber-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    case "refunded":
      return "bg-orange-50 text-orange-700";

    case "partially-refunded":
      return "bg-yellow-50 text-yellow-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function displayStatus(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  dark = false,
  trend,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof ShoppingCart;
  dark?: boolean;
  trend?: "up" | "down" | "neutral";
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
            className={`mt-3 text-2xl font-bold tracking-tight ${
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

      <div className="mt-3 flex items-center justify-between gap-3">
        <p
          className={`text-xs leading-5 ${
            dark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {description}
        </p>

        {trend === "up" && (
          <TrendingUp
            className={`h-4 w-4 shrink-0 ${
              dark ? "text-emerald-400" : "text-emerald-600"
            }`}
          />
        )}

        {trend === "down" && (
          <TrendingDown
            className={`h-4 w-4 shrink-0 ${
              dark ? "text-red-400" : "text-red-600"
            }`}
          />
        )}

        {trend === "neutral" && (
          <ArrowUpDown
            className={`h-4 w-4 shrink-0 ${
              dark ? "text-slate-500" : "text-slate-400"
            }`}
          />
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
  const active = sortField === field;

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

export default function SalesReportPage() {
  const { isOwner, canView } =
    useAdminPermissions();

  const canAccess =
    isOwner || canView("reports");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] =
    useState<SortField>("date");
  const [descending, setDescending] = useState(true);

  const sales = EMPTY_SALES;

  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(
        sales
          .map((item) => item.category)
          .filter(Boolean),
      ),
    );
  }, [sales]);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = sales.filter((sale) => {
      if (
        query &&
        ![
          sale.orderNumber,
          sale.customerName,
          sale.productName,
          sale.category,
          sale.id,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }

      if (
        status !== "all" &&
        sale.status !== status
      ) {
        return false;
      }

      if (
        category !== "all" &&
        sale.category !== category
      ) {
        return false;
      }

      if (minAmount) {
        const minimum = Number(minAmount);

        if (
          Number.isFinite(minimum) &&
          sale.netSales < minimum
        ) {
          return false;
        }
      }

      if (maxAmount) {
        const maximum = Number(maxAmount);

        if (
          Number.isFinite(maximum) &&
          sale.netSales > maximum
        ) {
          return false;
        }
      }

      if (fromDate) {
        const saleTime = new Date(
          sale.date,
        ).getTime();

        const fromTime = new Date(
          `${fromDate}T00:00:00`,
        ).getTime();

        if (saleTime < fromTime) {
          return false;
        }
      }

      if (toDate) {
        const saleTime = new Date(
          sale.date,
        ).getTime();

        const toTime = new Date(
          `${toDate}T23:59:59`,
        ).getTime();

        if (saleTime > toTime) {
          return false;
        }
      }

      return true;
    });

    result.sort((a, b) => {
      let difference = 0;

      switch (sortField) {
        case "orderNumber":
          difference =
            a.orderNumber.localeCompare(
              b.orderNumber,
            );
          break;

        case "customerName":
          difference =
            a.customerName.localeCompare(
              b.customerName,
            );
          break;

        case "productName":
          difference =
            a.productName.localeCompare(
              b.productName,
            );
          break;

        case "units":
          difference = a.units - b.units;
          break;

        case "grossAmount":
          difference =
            a.grossAmount - b.grossAmount;
          break;

        case "discount":
          difference =
            a.discount - b.discount;
          break;

        case "refund":
          difference =
            a.refund - b.refund;
          break;

        case "netSales":
          difference =
            a.netSales - b.netSales;
          break;

        case "date":
        default:
          difference =
            new Date(a.date).getTime() -
            new Date(b.date).getTime();
          break;
      }

      return descending
        ? -difference
        : difference;
    });

    return result;
  }, [
    sales,
    search,
    status,
    category,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    sortField,
    descending,
  ]);

  const allSelected =
    filteredSales.length > 0 &&
    filteredSales.every((sale) =>
      selectedIds.includes(sale.id),
    );

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(
        selectedIds.filter(
          (id) =>
            !filteredSales.some(
              (sale) => sale.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds([
      ...new Set([
        ...selectedIds,
        ...filteredSales.map(
          (sale) => sale.id,
        ),
      ]),
    ]);
  };

  const toggleRow = (id: string) => {
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
      setDescending(
        (current) => !current,
      );
      return;
    }

    setSortField(field);
    setDescending(true);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  if (!canAccess) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Access denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You do not have permission to view the Sales Report.
          </p>

          <Link
            href="/admin/reports"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
      {/* =========================================================
          HEADER
      ========================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <Link
                href="/admin/reports"
                className="hover:text-slate-950"
              >
                Reports
              </Link>

              <ArrowRight className="h-3.5 w-3.5" />

              <span className="text-slate-900">
                Sales
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <CircleDollarSign className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Sales Report
                </h1>

                <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                  Analyse gross sales, discounts, refunds, net sales,
                  units sold, average order value and product performance
                  from the real StudyStow order data.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/reports/orders"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4" />
              Order Report
            </Link>

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
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          SUMMARY CARDS
      ========================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          label="Gross Sales"
          value="—"
          description="Sales value before discounts and refunds."
          icon={CircleDollarSign}
          trend="neutral"
        />

        <SummaryCard
          label="Discounts"
          value="—"
          description="Discount value applied to sales."
          icon={ArrowDown}
          trend="neutral"
        />

        <SummaryCard
          label="Refunds"
          value="—"
          description="Refund value affecting reported sales."
          icon={RotateCcw}
          trend="neutral"
        />

        <SummaryCard
          label="Net Sales"
          value="—"
          description="Sales after applicable adjustments."
          icon={TrendingUp}
          trend="neutral"
        />

        <SummaryCard
          label="Units Sold"
          value="—"
          description="Total units represented by sales."
          icon={Package}
          trend="neutral"
        />

        <SummaryCard
          label="Average Order Value"
          value="—"
          description="Average sales value per order."
          icon={WalletCards}
          dark
          trend="neutral"
        />
      </section>

      {/* =========================================================
          SALES HEALTH
      ========================================================== */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Revenue
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Net Sales Growth
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Period-over-period sales movement from actual records.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-300">
              —
            </span>

            <span className="text-xs font-semibold text-slate-400">
              vs previous
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Customers
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Buying Customers
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Unique customers with qualifying sales.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-300">
              —
            </span>

            <span className="text-xs font-semibold text-slate-400">
              customers
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <ShoppingCart className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Orders
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Sales Orders
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Orders contributing to the sales report.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-300">
              —
            </span>

            <span className="text-xs font-semibold text-slate-400">
              orders
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <RotateCcw className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Adjustment
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Refund Rate
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Refund value compared with gross sales.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-300">
              —
            </span>

            <span className="text-xs font-semibold text-slate-400">
              percentage
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================
          SALES TREND
      ========================================================== */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Sales Trend
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Gross sales, net sales and sales volume over time.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Reporting Period
            </button>
          </div>

          <div className="flex min-h-[330px] items-center justify-center p-6">
            <div className="max-w-lg text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BarChart3 className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-base font-bold text-slate-900">
                Sales trend unavailable
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The chart will use actual order and payment data after the
                Sales Report API is connected. No synthetic trend is shown.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-950">
              Sales Composition
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Distribution of net sales by available dimensions.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {[
              "Book Sales",
              "Top Categories",
              "Top Products",
              "New Customers",
              "Returning Customers",
            ].map((label) => (
              <div key={label}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-700">
                    {label}
                  </span>

                  <span className="text-xs font-semibold text-slate-400">
                    —
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-0 rounded-full bg-slate-950" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FILTERS
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <SlidersHorizontal className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Sales Filters
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Filter sales by product, category, status, dates and sales
                value.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setShowFilters((current) => !current)
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5" />
              {showFilters
                ? "Hide Filters"
                : "Show Filters"}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
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
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order number, customer, product or category..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </label>

                <FilterSelect
                  value={status}
                  onChange={setStatus}
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
                </FilterSelect>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Category
                </label>

                <FilterSelect
                  value={category}
                  onChange={setCategory}
                >
                  <option value="all">
                    All Categories
                  </option>

                  {availableCategories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ),
                  )}
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
                    onChange={(event) =>
                      setFromDate(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                      setToDate(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Min
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minAmount}
                    onChange={(event) =>
                      setMinAmount(
                        event.target.value,
                      )
                    }
                    placeholder="₹ 0"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Max
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxAmount}
                    onChange={(event) =>
                      setMaxAmount(
                        event.target.value,
                      )
                    }
                    placeholder="₹ 0"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          SALES TABLE
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Sales Transactions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredSales.length} matching sales records
              {selectedIds.length > 0
                ? ` · ${selectedIds.length} selected`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <>
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Selected
                </button>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Review Refunds
                </button>
              </>
            )}

            <button
              type="button"
              disabled
              className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CircleDollarSign className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-900">
              No sales records available
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              No sales records have been loaded from the reporting source.
              Gross sales, discounts, refunds and net sales are intentionally
              not estimated.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <FileBarChart2 className="h-3.5 w-3.5" />
              Waiting for live sales data
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1600px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label="Select all sales records"
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
                        field="customerName"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Product"
                        field="productName"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Units"
                        field="units"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Gross"
                        field="grossAmount"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Discount"
                        field="discount"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Refund"
                        field="refund"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Net Sales"
                        field="netSales"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => {
                    const selected =
                      selectedIds.includes(
                        sale.id,
                      );

                    return (
                      <tr
                        key={sale.id}
                        className={`transition hover:bg-slate-50 ${
                          selected
                            ? "bg-slate-50"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              toggleRow(
                                sale.id,
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {sale.orderNumber}
                          </p>

                          <p className="mt-1 font-mono text-[10px] text-slate-400">
                            {sale.id}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {formatDate(sale.date)}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900">
                            {sale.customerName}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="max-w-[220px] truncate font-medium text-slate-900">
                            {sale.productName}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {sale.category}
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                          {formatNumber(sale.units)}
                        </td>

                        <td className="px-4 py-4 text-right text-sm text-slate-700">
                          {formatCurrency(
                            sale.grossAmount,
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm text-slate-600">
                          {formatCurrency(
                            sale.discount,
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm text-orange-600">
                          {formatCurrency(
                            sale.refund,
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-bold text-slate-950">
                          {formatCurrency(
                            sale.netSales,
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              sale.status,
                            )}`}
                          >
                            {displayStatus(
                              sale.status,
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/orders/${sale.orderNumber}`}
                            className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Open related order"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing {filteredSales.length} sales records
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
          CATEGORY / PRODUCT ANALYSIS
      ========================================================== */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <BarChart3 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Category Performance
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Compare net sales and units across product categories.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {[
              "Category 1",
              "Category 2",
              "Category 3",
              "Category 4",
              "Other Categories",
            ].map((label) => (
              <div
                key={label}
                className="border-b border-slate-100 py-4 last:border-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-700">
                    {label}
                  </span>

                  <span className="text-sm font-bold text-slate-300">
                    —
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-0 rounded-full bg-slate-950" />
                </div>

                <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                  <span>Units —</span>
                  <span>Share —</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Package className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Top Product Performance
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Rank products by actual net sales and units sold.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {[
              "Top Product",
              "Second Product",
              "Third Product",
              "Fourth Product",
              "Fifth Product",
            ].map((label, index) => (
              <div
                key={label}
                className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {label}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Units — · Sales —
                  </p>
                </div>

                <span className="text-sm font-bold text-slate-300">
                  —
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          DATA INTEGRITY
      ========================================================== */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-amber-900">
              Sales data integrity
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Gross sales, discounts, refunds, taxes, shipping and net sales
              must be calculated from the authenticated StudyStow order and
              payment sources. This page intentionally contains no invented
              transactions or financial figures.
            </p>

            <p className="mt-2 text-xs leading-5 text-amber-700">
              The final API-backed implementation should use the existing
              Order, Payment and product/inventory structures after they are
              inspected.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          NAVIGATION
      ========================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/reports/profit-loss"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            Profit & Loss
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/reports/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            Order Report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}