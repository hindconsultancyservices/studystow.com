"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Download,
  ExternalLink,
  FileBarChart2,
  Filter,
  Layers3,
  Package,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Warehouse,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type StockStatus =
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "overstock";

type InventoryRecord = {
  id: string;
  name: string;
  sku?: string;
  category: string;
  stock: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  unitCost: number;
  inventoryValue: number;
  status: StockStatus;
  updatedAt: string;
};

type SortField =
  | "name"
  | "stock"
  | "available"
  | "inventoryValue"
  | "updatedAt";

const EMPTY_INVENTORY: InventoryRecord[] = [];

const STOCK_STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Stock Status",
  },
  {
    value: "in-stock",
    label: "In Stock",
  },
  {
    value: "low-stock",
    label: "Low Stock",
  },
  {
    value: "out-of-stock",
    label: "Out of Stock",
  },
  {
    value: "overstock",
    label: "Overstock",
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

function stockStatusClass(status: StockStatus) {
  switch (status) {
    case "in-stock":
      return "bg-emerald-50 text-emerald-700";

    case "low-stock":
      return "bg-amber-50 text-amber-700";

    case "out-of-stock":
      return "bg-red-50 text-red-700";

    case "overstock":
      return "bg-violet-50 text-violet-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function stockStatusLabel(status: StockStatus) {
  switch (status) {
    case "in-stock":
      return "In Stock";

    case "low-stock":
      return "Low Stock";

    case "out-of-stock":
      return "Out of Stock";

    case "overstock":
      return "Overstock";

    default:
      return status;
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
  icon: typeof Boxes;
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
  sortDescending,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDescending: boolean;
  onSort: (field: SortField) => void;
}) {
  const active = sortField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900"
    >
      {label}

      {active ? (
        sortDescending ? (
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

export default function InventoryReportPage() {
  const {
    isOwner,
    canView,
  } = useAdminPermissions();

  const canAccess =
    isOwner || canView("reports");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [status, setStatus] =
    useState("all");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [minStock, setMinStock] =
    useState("");

  const [maxStock, setMaxStock] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(true);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [sortField, setSortField] =
    useState<SortField>("updatedAt");

  const [sortDescending, setSortDescending] =
    useState(true);

  const inventory = EMPTY_INVENTORY;

  const filteredInventory = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const result = inventory.filter(
      (item) => {
        if (
          query &&
          ![
            item.name,
            item.sku || "",
            item.category,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        if (
          category !== "all" &&
          item.category !== category
        ) {
          return false;
        }

        if (
          status !== "all" &&
          item.status !== status
        ) {
          return false;
        }

        if (minStock) {
          const minimum =
            Number(minStock);

          if (
            Number.isFinite(minimum) &&
            item.stock < minimum
          ) {
            return false;
          }
        }

        if (maxStock) {
          const maximum =
            Number(maxStock);

          if (
            Number.isFinite(maximum) &&
            item.stock > maximum
          ) {
            return false;
          }
        }

        if (fromDate) {
          const itemTime =
            new Date(item.updatedAt).getTime();

          const fromTime =
            new Date(
              `${fromDate}T00:00:00`,
            ).getTime();

          if (itemTime < fromTime) {
            return false;
          }
        }

        if (toDate) {
          const itemTime =
            new Date(item.updatedAt).getTime();

          const toTime =
            new Date(
              `${toDate}T23:59:59`,
            ).getTime();

          if (itemTime > toTime) {
            return false;
          }
        }

        return true;
      },
    );

    result.sort((a, b) => {
      let difference = 0;

      switch (sortField) {
        case "name":
          difference =
            a.name.localeCompare(
              b.name,
            );
          break;

        case "stock":
          difference =
            a.stock - b.stock;
          break;

        case "available":
          difference =
            a.available - b.available;
          break;

        case "inventoryValue":
          difference =
            a.inventoryValue -
            b.inventoryValue;
          break;

        case "updatedAt":
        default:
          difference =
            new Date(a.updatedAt).getTime() -
            new Date(b.updatedAt).getTime();
          break;
      }

      return sortDescending
        ? -difference
        : difference;
    });

    return result;
  }, [
    inventory,
    search,
    category,
    status,
    fromDate,
    toDate,
    minStock,
    maxStock,
    sortField,
    sortDescending,
  ]);

  const allSelected =
    filteredInventory.length > 0 &&
    filteredInventory.every((item) =>
      selectedIds.includes(item.id),
    );

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(
        selectedIds.filter(
          (id) =>
            !filteredInventory.some(
              (item) => item.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds([
      ...new Set([
        ...selectedIds,
        ...filteredInventory.map(
          (item) => item.id,
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
      setSortDescending(
        (current) => !current,
      );

      return;
    }

    setSortField(field);
    setSortDescending(true);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setFromDate("");
    setToDate("");
    setMinStock("");
    setMaxStock("");
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
            You do not have permission to view the Inventory Report.
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
                Inventory
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Warehouse className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Inventory Report
                </h1>

                <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                  Monitor stock availability, reserved inventory, reorder
                  levels, inventory valuation and stock health across the
                  catalogue.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/inventory"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Boxes className="h-4 w-4" />
              Inventory
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
          label="Total SKUs"
          value="—"
          description="Total products represented in the inventory source."
          icon={Package}
        />

        <SummaryCard
          label="Total Units"
          value="—"
          description="Current physical stock quantity."
          icon={Boxes}
        />

        <SummaryCard
          label="Available Units"
          value="—"
          description="Units available after reserved stock."
          icon={PackageCheck}
        />

        <SummaryCard
          label="Low Stock"
          value="—"
          description="Products at or below their reorder threshold."
          icon={AlertTriangle}
        />

        <SummaryCard
          label="Inventory Value"
          value="—"
          description="Stock valuation from the connected inventory source."
          icon={CircleDollarSign}
          dark
        />
      </section>

      {/* =========================================================
          STOCK HEALTH
      ========================================================== */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Stock Health
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Healthy Stock
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Actual stock health will be calculated from live inventory data.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Attention
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Low Stock
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Products requiring replenishment will be surfaced here.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <PackageOpen className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Critical
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Out of Stock
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Zero-stock products will be identified from live inventory.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <Layers3 className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Excess
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Overstock
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Overstock risk will be calculated from actual stock rules.
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
                Inventory Movement
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Stock additions, deductions, reservations and adjustments
                over the selected period.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Period
            </button>
          </div>

          <div className="flex min-h-[300px] items-center justify-center p-6">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <TrendingUp className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-sm font-bold text-slate-900">
                Inventory movement unavailable
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                The movement chart will use real inventory transactions once
                the existing inventory/order data source is connected.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-950">
              Inventory Valuation
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Product-level stock value from the database.
            </p>
          </div>

          <div className="flex min-h-[300px] items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CircleDollarSign className="h-6 w-6" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                No valuation data
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Valuation will not be estimated until the actual product
                cost fields and inventory records are available.
              </p>
            </div>
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
                Inventory Filters
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Filter live inventory records by stock, category, status and
                last update.
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
                placeholder="Search product name, SKU or category..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
                </FilterSelect>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stock Status
                </label>

                <FilterSelect
                  value={status}
                  onChange={setStatus}
                >
                  {STOCK_STATUS_OPTIONS.map(
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

                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  To Date
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Min Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(event) =>
                      setMinStock(
                        event.target.value,
                      )
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Max Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={maxStock}
                    onChange={(event) =>
                      setMaxStock(
                        event.target.value,
                      )
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          INVENTORY TABLE
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Inventory Records
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredInventory.length} matching inventory records
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
                  <PackageCheck className="h-3.5 w-3.5" />
                  Adjust Stock
                </button>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Selected
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

        {filteredInventory.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Boxes className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-900">
              No inventory records available
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              No inventory records have been loaded from the database. Stock
              quantities, reserved units and valuation are intentionally not
              estimated.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <FileBarChart2 className="h-3.5 w-3.5" />
              Waiting for live inventory data
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1250px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label="Select all inventory records"
                      />
                    </th>

                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Product"
                        field="name"
                        sortField={sortField}
                        sortDescending={sortDescending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Stock"
                        field="stock"
                        sortField={sortField}
                        sortDescending={sortDescending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Available"
                        field="available"
                        sortField={sortField}
                        sortDescending={sortDescending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Reorder Level
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Value"
                        field="inventoryValue"
                        sortField={sortField}
                        sortDescending={sortDescending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Updated"
                        field="updatedAt"
                        sortField={sortField}
                        sortDescending={sortDescending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map(
                    (item) => {
                      const selected =
                        selectedIds.includes(
                          item.id,
                        );

                      return (
                        <tr
                          key={item.id}
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
                                toggleRow(item.id)
                              }
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </td>

                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {item.name}
                              </p>

                              {item.sku && (
                                <p className="mt-1 font-mono text-[10px] text-slate-400">
                                  SKU: {item.sku}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {item.category}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">
                            {formatNumber(
                              item.stock,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">
                            {formatNumber(
                              item.available,
                            )}

                            {item.reserved >
                              0 && (
                              <p className="mt-1 text-[10px] font-normal text-slate-400">
                                Reserved:{" "}
                                {formatNumber(
                                  item.reserved,
                                )}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {formatNumber(
                              item.reorderLevel,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stockStatusClass(
                                item.status,
                              )}`}
                            >
                              {stockStatusLabel(
                                item.status,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(
                              item.inventoryValue,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-500">
                            {formatDate(
                              item.updatedAt,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <Link
                              href={`/admin/inventory/${item.id}`}
                              className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                              title="View inventory"
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
                Showing {filteredInventory.length} inventory records
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
          REPORTING NOTES
      ========================================================== */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-amber-900">
                No estimated inventory values
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Inventory quantity, valuation, reorder status and availability
                will come only from the existing product/inventory data
                source. This report does not create assumed stock figures.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Inventory report scope
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The final API-backed report can combine stock levels,
                reservations, adjustments, reorder thresholds, product
                categories and inventory valuation after the current
                StudyStow inventory implementation is inspected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER NAV
      ========================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <Link
          href="/admin/reports/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          Order Report
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}