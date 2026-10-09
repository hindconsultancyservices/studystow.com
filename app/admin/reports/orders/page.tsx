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
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type OrderStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

type OrderRecord = {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemsCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};

type SortField =
  | "date"
  | "orderNumber"
  | "customerName"
  | "itemsCount"
  | "total";

const EMPTY_ORDERS: OrderRecord[] = [];

const ORDER_STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Order Statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "refunded",
    label: "Refunded",
  },
];

const PAYMENT_STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Payment Statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "paid",
    label: "Paid",
  },
  {
    value: "failed",
    label: "Failed",
  },
  {
    value: "refunded",
    label: "Refunded",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function statusClass(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700";

    case "shipped":
      return "bg-blue-50 text-blue-700";

    case "confirmed":
      return "bg-cyan-50 text-cyan-700";

    case "processing":
      return "bg-violet-50 text-violet-700";

    case "pending":
      return "bg-amber-50 text-amber-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    case "refunded":
      return "bg-orange-50 text-orange-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function paymentStatusClass(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";

    case "pending":
      return "bg-amber-50 text-amber-700";

    case "failed":
      return "bg-red-50 text-red-700";

    case "refunded":
      return "bg-orange-50 text-orange-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function displayStatus(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
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
  icon: typeof ShoppingCart;
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
            className={`mt-3 text-2xl font-bold tracking-tight ${
              dark
                ? "text-white"
                : "text-slate-950"
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
          dark
            ? "text-slate-400"
            : "text-slate-500"
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
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
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

export default function OrdersReportPage() {
  const {
    isOwner,
    canView,
  } = useAdminPermissions();

  const canAccess =
    isOwner || canView("reports");

  const [search, setSearch] =
    useState("");

  const [orderStatus, setOrderStatus] =
    useState("all");

  const [paymentStatus, setPaymentStatus] =
    useState("all");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [minAmount, setMinAmount] =
    useState("");

  const [maxAmount, setMaxAmount] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(true);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [sortField, setSortField] =
    useState<SortField>("date");

  const [descending, setDescending] =
    useState(true);

  const orders = EMPTY_ORDERS;

  const filteredOrders = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const result = orders.filter(
      (order) => {
        if (
          query &&
          ![
            order.orderNumber,
            order.customerName,
            order.customerEmail || "",
            order.id,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        if (
          orderStatus !== "all" &&
          order.status !== orderStatus
        ) {
          return false;
        }

        if (
          paymentStatus !== "all" &&
          order.paymentStatus !== paymentStatus
        ) {
          return false;
        }

        if (minAmount) {
          const minimum =
            Number(minAmount);

          if (
            Number.isFinite(minimum) &&
            order.total < minimum
          ) {
            return false;
          }
        }

        if (maxAmount) {
          const maximum =
            Number(maxAmount);

          if (
            Number.isFinite(maximum) &&
            order.total > maximum
          ) {
            return false;
          }
        }

        if (fromDate) {
          const orderTime =
            new Date(order.date).getTime();

          const fromTime =
            new Date(
              `${fromDate}T00:00:00`,
            ).getTime();

          if (orderTime < fromTime) {
            return false;
          }
        }

        if (toDate) {
          const orderTime =
            new Date(order.date).getTime();

          const toTime =
            new Date(
              `${toDate}T23:59:59`,
            ).getTime();

          if (orderTime > toTime) {
            return false;
          }
        }

        return true;
      },
    );

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

        case "itemsCount":
          difference =
            a.itemsCount - b.itemsCount;
          break;

        case "total":
          difference =
            a.total - b.total;
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
    orders,
    search,
    orderStatus,
    paymentStatus,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    sortField,
    descending,
  ]);

  const allSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) =>
      selectedIds.includes(order.id),
    );

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(
        selectedIds.filter(
          (id) =>
            !filteredOrders.some(
              (order) =>
                order.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds([
      ...new Set([
        ...selectedIds,
        ...filteredOrders.map(
          (order) => order.id,
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
    setOrderStatus("all");
    setPaymentStatus("all");
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
            You do not have permission to view the Order Report.
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
                className="transition hover:text-slate-950"
              >
                Reports
              </Link>

              <ArrowRight className="h-3.5 w-3.5" />

              <span className="text-slate-900">
                Orders
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Order Report
                </h1>

                <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                  Analyse order volume, order value, fulfilment progress,
                  payment status and customer purchasing activity from the
                  real order database.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4" />
              Orders
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
          SUMMARY
      ========================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Total Orders"
          value="—"
          description="Total orders in the selected reporting period."
          icon={ShoppingCart}
        />

        <SummaryCard
          label="Order Value"
          value="—"
          description="Gross order value from the connected order source."
          icon={CircleDollarSign}
        />

        <SummaryCard
          label="Average Order Value"
          value="—"
          description="Average value per order from real order totals."
          icon={WalletCards}
        />

        <SummaryCard
          label="Delivered"
          value="—"
          description="Orders completed according to the order status source."
          icon={CheckCircle2}
        />

        <SummaryCard
          label="Customers"
          value="—"
          description="Unique customers represented in the selected orders."
          icon={Users}
          dark
        />
      </section>

      {/* =========================================================
          OPERATIONAL SNAPSHOT
      ========================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <ShoppingCart className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Pipeline
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Pending Orders
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Orders awaiting processing from the real order source.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <Package className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Processing
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Fulfilment
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Processing and shipping pipeline from current order states.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Truck className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Shipping
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Shipped
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Orders handed over to fulfilment or shipping.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <RotateCcw className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Exceptions
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Cancelled / Refunded
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Orders affected by cancellation or refund activity.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>
        </div>
      </section>

      {/* =========================================================
          ANALYTICS
      ========================================================== */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Order Volume & Value
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Trend of order count and order value over the selected
                reporting period.
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

          <div className="flex min-h-[310px] items-center justify-center p-6">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BarChart3 className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-sm font-bold text-slate-900">
                Order analytics unavailable
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                The chart will use actual orders and totals after the report
                API is connected to the current StudyStow order source.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-950">
              Order Status Distribution
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Distribution of real order statuses.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {[
              "Pending",
              "Processing",
              "Confirmed",
              "Shipped",
              "Delivered",
              "Cancelled",
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
                Order Filters
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Filter orders by status, payment state, date and order value.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setShowFilters((current) => !current)
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
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
          <div className="space-y-5 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order number, customer name, email or order ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Order Status
                </label>

                <FilterSelect
                  value={orderStatus}
                  onChange={setOrderStatus}
                >
                  {ORDER_STATUS_OPTIONS.map(
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
                  Payment Status
                </label>

                <FilterSelect
                  value={paymentStatus}
                  onChange={setPaymentStatus}
                >
                  {PAYMENT_STATUS_OPTIONS.map(
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
                      setToDate(event.target.value)
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
          ORDER TABLE
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Order Records
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredOrders.length} matching orders
              {selectedIds.length > 0
                ? ` · ${selectedIds.length} selected`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                disabled
                className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
              >
                <Download className="h-3.5 w-3.5" />
                Export Selected
              </button>
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

        {filteredOrders.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingCart className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-900">
              No order records available
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              No order records have been loaded from the reporting data
              source. Order totals, customer values and status counts are
              intentionally not estimated.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <FileBarChart2 className="h-3.5 w-3.5" />
              Waiting for live order data
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1450px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label="Select all orders"
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

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Items"
                        field="itemsCount"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Order Status
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Payment
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Subtotal
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Discount
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

                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(
                    (order) => {
                      const selected =
                        selectedIds.includes(
                          order.id,
                        );

                      return (
                        <tr
                          key={order.id}
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
                                  order.id,
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {order.orderNumber}
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-slate-400">
                              {order.id}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                            {formatDate(
                              order.date,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-medium text-slate-900">
                              {order.customerName}
                            </p>

                            {order.customerEmail && (
                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  order.customerEmail
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                            {formatNumber(
                              order.itemsCount,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                                order.status,
                              )}`}
                            >
                              {displayStatus(
                                order.status,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusClass(
                                order.paymentStatus,
                              )}`}
                            >
                              {displayStatus(
                                order.paymentStatus,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {formatCurrency(
                              order.subtotal,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {formatCurrency(
                              order.discount,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-950">
                            {formatCurrency(
                              order.total,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                              title="View order"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing {filteredOrders.length} orders
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
          ACCOUNTING / DATA INTEGRITY
      ========================================================== */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Real order data only
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Order totals, discounts, tax, shipping, payment status and
                fulfilment status should come from the authenticated server
                data source. This page does not generate estimated values.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileBarChart2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Reporting scope
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The API-backed version can calculate order volume, gross
                value, discounts, shipping, tax, refunds, cancellations,
                fulfilment performance and customer order behaviour from the
                existing StudyStow order data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER NAVIGATION
      ========================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/reports/customers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            Customer Report
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/reports/inventory"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            Inventory Report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}