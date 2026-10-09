"use client";

import Link from "next/link";
import {
  AlertTriangle,
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
  Eye,
  FileBarChart2,
  Filter,
  Package,
  PackageCheck,
  PackageOpen,
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

type ProductStatus =
  | "active"
  | "draft"
  | "archived"
  | "out-of-stock";

type InventoryStatus =
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "overstock";

type ProductRecord = {
  id: string;
  name: string;
  sku?: string;
  category: string;
  status: ProductStatus;
  inventoryStatus: InventoryStatus;
  unitsSold: number;
  orders: number;
  customers: number;
  grossSales: number;
  discount: number;
  refund: number;
  netSales: number;
  averageSellingPrice: number;
  stock: number;
  reserved: number;
  inventoryValue: number;
  updatedAt: string;
};

type SortField =
  | "name"
  | "category"
  | "unitsSold"
  | "orders"
  | "customers"
  | "grossSales"
  | "netSales"
  | "stock"
  | "inventoryValue"
  | "updatedAt";

const EMPTY_PRODUCTS: ProductRecord[] = [];

const PRODUCT_STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Product Statuses",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "archived",
    label: "Archived",
  },
  {
    value: "out-of-stock",
    label: "Out of Stock",
  },
];

const INVENTORY_STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Inventory Statuses",
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

function formatCurrency(
  value: number | null | undefined,
) {
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

function formatNumber(
  value: number | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN").format(
    value,
  );
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

function displayStatus(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function productStatusClass(
  status: ProductStatus,
) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700";

    case "draft":
      return "bg-amber-50 text-amber-700";

    case "archived":
      return "bg-slate-100 text-slate-600";

    case "out-of-stock":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function inventoryStatusClass(
  status: InventoryStatus,
) {
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
  icon: typeof Package;
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
              dark
                ? "text-slate-400"
                : "text-slate-400"
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

function AnalyticsPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BarChart3;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[270px] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="mt-5 text-sm font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ProductsReportPage() {
  const {
    isOwner,
    canView,
  } = useAdminPermissions();

  const canAccess =
    isOwner || canView("reports");

  const [search, setSearch] =
    useState("");

  const [productStatus, setProductStatus] =
    useState("all");

  const [inventoryStatus, setInventoryStatus] =
    useState("all");

  const [category, setCategory] =
    useState("all");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(true);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [sortField, setSortField] =
    useState<SortField>("netSales");

  const [descending, setDescending] =
    useState(true);

  const products = EMPTY_PRODUCTS;

  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter(Boolean),
      ),
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const result = products.filter(
      (product) => {
        if (
          query &&
          ![
            product.name,
            product.sku || "",
            product.category,
            product.id,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        if (
          productStatus !== "all" &&
          product.status !== productStatus
        ) {
          return false;
        }

        if (
          inventoryStatus !== "all" &&
          product.inventoryStatus !==
            inventoryStatus
        ) {
          return false;
        }

        if (
          category !== "all" &&
          product.category !== category
        ) {
          return false;
        }

        if (fromDate) {
          const updatedTime =
            new Date(
              product.updatedAt,
            ).getTime();

          const fromTime =
            new Date(
              `${fromDate}T00:00:00`,
            ).getTime();

          if (updatedTime < fromTime) {
            return false;
          }
        }

        if (toDate) {
          const updatedTime =
            new Date(
              product.updatedAt,
            ).getTime();

          const toTime =
            new Date(
              `${toDate}T23:59:59`,
            ).getTime();

          if (updatedTime > toTime) {
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

        case "category":
          difference =
            a.category.localeCompare(
              b.category,
            );
          break;

        case "unitsSold":
          difference =
            a.unitsSold - b.unitsSold;
          break;

        case "orders":
          difference =
            a.orders - b.orders;
          break;

        case "customers":
          difference =
            a.customers - b.customers;
          break;

        case "grossSales":
          difference =
            a.grossSales - b.grossSales;
          break;

        case "netSales":
          difference =
            a.netSales - b.netSales;
          break;

        case "stock":
          difference =
            a.stock - b.stock;
          break;

        case "inventoryValue":
          difference =
            a.inventoryValue -
            b.inventoryValue;
          break;

        case "updatedAt":
        default:
          difference =
            new Date(
              a.updatedAt,
            ).getTime() -
            new Date(
              b.updatedAt,
            ).getTime();
          break;
      }

      return descending
        ? -difference
        : difference;
    });

    return result;
  }, [
    products,
    search,
    productStatus,
    inventoryStatus,
    category,
    fromDate,
    toDate,
    sortField,
    descending,
  ]);

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) =>
      selectedIds.includes(product.id),
    );

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(
        selectedIds.filter(
          (id) =>
            !filteredProducts.some(
              (product) =>
                product.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds([
      ...new Set([
        ...selectedIds,
        ...filteredProducts.map(
          (product) => product.id,
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
    setProductStatus("all");
    setInventoryStatus("all");
    setCategory("all");
    setFromDate("");
    setToDate("");
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
            You do not have permission to view the Product Report.
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
    <main className="mx-auto w-full max-w-[1750px] space-y-6">
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
                Products
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Package className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Product Report
                </h1>

                <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                  Analyse product sales performance, customer demand,
                  inventory position, product status and catalogue-level
                  financial performance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/books"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Package className="h-4 w-4" />
              Products
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
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          label="Total Products"
          value="—"
          description="Products available in the connected catalogue."
          icon={Package}
        />

        <SummaryCard
          label="Active Products"
          value="—"
          description="Products currently marked active."
          icon={PackageCheck}
        />

        <SummaryCard
          label="Units Sold"
          value="—"
          description="Total product units sold in the reporting period."
          icon={ShoppingCart}
        />

        <SummaryCard
          label="Net Sales"
          value="—"
          description="Net sales attributed to products."
          icon={CircleDollarSign}
        />

        <SummaryCard
          label="Low Stock"
          value="—"
          description="Products at or below the configured stock threshold."
          icon={AlertTriangle}
        />

        <SummaryCard
          label="Inventory Value"
          value="—"
          description="Inventory valuation from the connected inventory source."
          icon={WalletCards}
          dark
        />
      </section>

      {/* =========================================================
          PRODUCT HEALTH
      ========================================================== */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Performance
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Best Selling Products
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Top products ranked by actual net sales.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-300">
              —
            </span>

            <span className="text-xs text-slate-400">
              sales
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <PackageOpen className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Inventory
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Out of Stock
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Products with no available inventory.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-300">
              —
            </span>

            <span className="text-xs text-slate-400">
              products
            </span>
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
            Products requiring inventory attention.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-300">
              —
            </span>

            <span className="text-xs text-slate-400">
              products
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Demand
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Customers per Product
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Unique buyers associated with product purchases.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-300">
              —
            </span>

            <span className="text-xs text-slate-400">
              average
            </span>
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
                Product Sales Trend
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Product-level sales performance across the reporting period.
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

          <AnalyticsPlaceholder
            icon={BarChart3}
            title="Product sales trend unavailable"
            description="The chart will use actual order-line and product data after the Product Report API is connected. No synthetic trend data is displayed."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-950">
              Category Performance
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Product contribution by category.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {[
              "Top Category",
              "Second Category",
              "Third Category",
              "Other Categories",
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

                <p className="mt-2 text-[10px] text-right text-slate-400">
                  Share —
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          TOP PRODUCTS
      ========================================================== */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <TrendingUp className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Top Products by Sales
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Products ranked by actual net sales.
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
                    Units — · Orders — · Customers —
                  </p>
                </div>

                <span className="text-sm font-bold text-slate-300">
                  —
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <PackageOpen className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Inventory Attention
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Products requiring stock action.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {[
              "Low Stock Products",
              "Out of Stock Products",
              "Overstock Products",
              "Reserved Stock",
              "Slow Moving Products",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <AlertTriangle className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    {label}
                  </span>
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
                Product Filters
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Filter the catalogue by product state, inventory state,
                category and update period.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (current) => !current,
                )
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
                placeholder="Search product name, SKU, category or product ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product Status
                </label>

                <FilterSelect
                  value={productStatus}
                  onChange={setProductStatus}
                >
                  {PRODUCT_STATUS_OPTIONS.map(
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
                  Inventory Status
                </label>

                <FilterSelect
                  value={inventoryStatus}
                  onChange={setInventoryStatus}
                >
                  {INVENTORY_STATUS_OPTIONS.map(
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
                  Updated From
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
                  Updated To
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
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          PRODUCT TABLE
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Product Performance
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredProducts.length} matching products
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
                  <Eye className="h-3.5 w-3.5" />
                  Review Selected
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

        {filteredProducts.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Package className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-900">
              No product records available
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              No product reporting records have been loaded from the current
              data source. Sales, stock and valuation metrics are intentionally
              not estimated.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <FileBarChart2 className="h-3.5 w-3.5" />
              Waiting for live product data
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1800px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label="Select all products"
                      />
                    </th>

                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Product"
                        field="name"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Category"
                        field="category"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Product Status
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inventory
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Units Sold"
                        field="unitsSold"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Orders"
                        field="orders"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Customers"
                        field="customers"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Gross Sales"
                        field="grossSales"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Discount
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Refund
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

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Avg. Selling Price
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Stock"
                        field="stock"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Inventory Value"
                        field="inventoryValue"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Updated"
                        field="updatedAt"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(
                    (product) => {
                      const selected =
                        selectedIds.includes(
                          product.id,
                        );

                      return (
                        <tr
                          key={product.id}
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
                                  product.id,
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </td>

                          <td className="px-4 py-4">
                            <div>
                              <p className="max-w-[250px] truncate font-semibold text-slate-900">
                                {product.name}
                              </p>

                              {product.sku && (
                                <p className="mt-1 font-mono text-[10px] text-slate-400">
                                  SKU:{" "}
                                  {product.sku}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {product.category}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${productStatusClass(
                                product.status,
                              )}`}
                            >
                              {displayStatus(
                                product.status,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${inventoryStatusClass(
                                product.inventoryStatus,
                              )}`}
                            >
                              {displayStatus(
                                product.inventoryStatus,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800">
                            {formatNumber(
                              product.unitsSold,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-700">
                            {formatNumber(
                              product.orders,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-700">
                            {formatNumber(
                              product.customers,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-700">
                            {formatCurrency(
                              product.grossSales,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {formatCurrency(
                              product.discount,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-orange-600">
                            {formatCurrency(
                              product.refund,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-950">
                            {formatCurrency(
                              product.netSales,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-700">
                            {formatCurrency(
                              product.averageSellingPrice,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800">
                            {formatNumber(
                              product.stock,
                            )}

                            {product.reserved >
                              0 && (
                              <p className="mt-1 text-[10px] font-normal text-slate-400">
                                Reserved{" "}
                                {formatNumber(
                                  product.reserved,
                                )}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-950">
                            {formatCurrency(
                              product.inventoryValue,
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-slate-500">
                            {formatDate(
                              product.updatedAt,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <button
                              type="button"
                              disabled
                              className="inline-flex rounded-lg p-2 text-slate-300"
                              title="Product details will be enabled after API integration"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
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
                Showing {filteredProducts.length} products
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
          PRODUCT KPI PANELS
      ========================================================== */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <CircleDollarSign className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Revenue Efficiency
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Product-level revenue indicators.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {[
              "Average Selling Price",
              "Revenue per Product",
              "Revenue per Order",
              "Discount Rate",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
              >
                <span className="text-sm text-slate-600">
                  {label}
                </span>

                <span className="text-sm font-bold text-slate-300">
                  —
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Customer Demand
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Customer behaviour across products.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {[
              "Unique Buying Customers",
              "Repeat Buyers",
              "Orders per Customer",
              "Customers per Product",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
              >
                <span className="text-sm text-slate-600">
                  {label}
                </span>

                <span className="text-sm font-bold text-slate-300">
                  —
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <PackageCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Inventory Efficiency
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Stock position and inventory performance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {[
              "Stock Turnover",
              "Sell-through Rate",
              "Low Stock Rate",
              "Out of Stock Rate",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
              >
                <span className="text-sm text-slate-600">
                  {label}
                </span>

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
              Product report data integrity
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Product sales, customer counts, inventory quantities, valuation,
              discounts and refunds must come from the real StudyStow
              product, order and inventory sources. This report does not
              fabricate product metrics.
            </p>

            <p className="mt-2 text-xs leading-5 text-amber-700">
              The backend version should inspect the current Book/Product,
              Order and Inventory implementations before defining report
              aggregations.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          RELATED REPORTS
      ========================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/reports/sales"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <CircleDollarSign className="h-5 w-5" />
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-950">
            Sales Report
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Analyse sales generated by products.
          </p>
        </Link>

        <Link
          href="/admin/reports/inventory"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <PackageCheck className="h-5 w-5" />
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-950">
            Inventory Report
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Review stock, availability and valuation.
          </p>
        </Link>

        <Link
          href="/admin/reports/orders"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ShoppingCart className="h-5 w-5" />
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-950">
            Order Report
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Drill into order-level product demand.
          </p>
        </Link>

        <Link
          href="/admin/reports/profit-loss"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <BarChart3 className="h-5 w-5" />
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-950">
            Profit & Loss
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            See product costs and sales contribution to profitability.
          </p>
        </Link>
      </section>

      {/* =========================================================
          FOOTER
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
          href="/admin/reports/inventory"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          Inventory Report
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}