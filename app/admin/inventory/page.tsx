"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpToLine,
  BookOpen,
  Boxes,
  ChevronRight,
  Clock3,
  PackageCheck,
  RefreshCw,
  Search,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type StockStatus =
  | "all"
  | "in-stock"
  | "low-stock"
  | "out-of-stock";

type SortOption =
  | "updated"
  | "stock-high"
  | "stock-low"
  | "name";

interface InventoryBook {
  _id: string;
  title: string;
  author: string;
  sku: string;
  isbn?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  images?: string[];
  published: boolean;
  featured: boolean;
}

interface InventoryStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalUnits: number;
  inventoryValue: number;
  lowStockLimit: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface InventoryResponse {
  success: boolean;
  data: InventoryBook[];
  stats: InventoryStats;
  pagination: Pagination;
  message?: string;
}

const EMPTY_STATS: InventoryStats = {
  totalProducts: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
  totalUnits: 0,
  inventoryValue: 0,
  lowStockLimit: 5,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | Date) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStockStatus(
  stock: number,
  lowStockLimit: number
): Exclude<StockStatus, "all"> {
  if (stock <= 0) {
    return "out-of-stock";
  }

  if (stock <= lowStockLimit) {
    return "low-stock";
  }

  return "in-stock";
}

function getStatusLabel(status: Exclude<StockStatus, "all">) {
  switch (status) {
    case "in-stock":
      return "In Stock";

    case "low-stock":
      return "Low Stock";

    case "out-of-stock":
      return "Out of Stock";
  }
}

function statusStyles(
  status: Exclude<StockStatus, "all">
) {
  switch (status) {
    case "in-stock":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "low-stock":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";

    case "out-of-stock":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
  }
}

function stockBarClass(
  status: Exclude<StockStatus, "all">
) {
  switch (status) {
    case "in-stock":
      return "bg-emerald-500";

    case "low-stock":
      return "bg-amber-500";

    case "out-of-stock":
      return "bg-rose-500";
  }
}

function stockPercentage(
  stock: number,
  lowStockLimit: number
) {
  if (stock <= 0) {
    return 0;
  }

  const target = Math.max(
    lowStockLimit * 4,
    1
  );

  return Math.min(
    Math.round((stock / target) * 100),
    100
  );
}

export default function AdminInventoryPage() {
  const [books, setBooks] = useState<
    InventoryBook[]
  >([]);

  const [stats, setStats] =
    useState<InventoryStats>(EMPTY_STATS);

  const [pagination, setPagination] =
    useState<Pagination>({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<StockStatus>("all");

  const [sort, setSort] =
    useState<SortOption>("updated");

  const [page, setPage] = useState(1);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [updatingSku, setUpdatingSku] =
    useState<string | null>(null);

  const [editingSku, setEditingSku] =
    useState<string | null>(null);

  const [stockInputs, setStockInputs] =
    useState<Record<string, string>>({});

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadInventory = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");
        setSuccessMessage("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        params.set("status", status);
        params.set("page", String(page));
        params.set("limit", "20");
        params.set(
          "lowStockLimit",
          String(stats.lowStockLimit || 5)
        );

        const response = await fetch(
          `/api/admin/inventory?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          (await response.json()) as InventoryResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to load inventory"
          );
        }

        setBooks(result.data || []);
        setStats(
          result.stats || EMPTY_STATS
        );
        setPagination(
          result.pagination || {
            page,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (err) {
        console.error(
          "Inventory fetch error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load inventory"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      search,
      status,
      stats.lowStockLimit,
    ]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadInventory();
    }, search.trim() ? 350 : 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    loadInventory,
  ]);

  /*
   * Reset pagination whenever filters change.
   */
  useEffect(() => {
    setPage(1);
  }, [status]);

  /*
   * Local sorting.
   *
   * The API already sorts by stock/update.
   * This gives the admin additional table sorting
   * without changing the database.
   */
  const sortedBooks = useMemo(() => {
    const result = [...books];

    switch (sort) {
      case "stock-high":
        result.sort(
          (a, b) => b.stock - a.stock
        );
        break;

      case "stock-low":
        result.sort(
          (a, b) => a.stock - b.stock
        );
        break;

      case "name":
        result.sort((a, b) =>
          a.title.localeCompare(
            b.title,
            "en",
            {
              sensitivity: "base",
            }
          )
        );
        break;

      case "updated":
      default:
        break;
    }

    return result;
  }, [books, sort]);

  async function updateStock(
    book: InventoryBook
  ) {
    const rawValue =
      stockInputs[book.sku] ??
      String(book.stock);

    const newStock = Number(rawValue);

    if (
      !Number.isInteger(newStock) ||
      newStock < 0
    ) {
      setError(
        "Stock must be a non-negative whole number."
      );
      return;
    }

    if (newStock > 1_000_000) {
      setError(
        "Stock value is too large."
      );
      return;
    }

    if (newStock === book.stock) {
      setEditingSku(null);
      return;
    }

    try {
      setUpdatingSku(book.sku);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        "/api/admin/inventory",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sku: book.sku,
            stock: newStock,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update stock"
        );
      }

      setEditingSku(null);

      setStockInputs((current) => {
        const next = { ...current };
        delete next[book.sku];
        return next;
      });

      setSuccessMessage(
        `${book.title} stock updated successfully.`
      );

      await loadInventory(true);
    } catch (err) {
      console.error(
        "Stock update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update stock"
      );
    } finally {
      setUpdatingSku(null);
    }
  }

  function startEditing(
    book: InventoryBook
  ) {
    setError("");
    setSuccessMessage("");

    setEditingSku(book.sku);

    setStockInputs((current) => ({
      ...current,
      [book.sku]: String(book.stock),
    }));
  }

  function cancelEditing(
    sku: string
  ) {
    setEditingSku(null);

    setStockInputs((current) => {
      const next = { ...current };
      delete next[sku];
      return next;
    });
  }

  function handleStatusChange(
    value: StockStatus
  ) {
    setStatus(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href="/admin"
                aria-label="Back to admin dashboard"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <p className="text-sm font-medium text-blue-600">
                  Administration
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Inventory
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor stock levels and manage
                  your book inventory.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/admin/books"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4" />
                Manage Books
              </Link>

              <button
                type="button"
                onClick={() =>
                  loadInventory(true)
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Inventory error
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-xs font-semibold text-rose-700 hover:text-rose-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {successMessage}
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Products
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : stats.totalProducts}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Boxes className="h-5 w-5 text-slate-700" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Products in inventory
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  In Stock
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : stats.inStock}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <PackageCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Above low-stock threshold
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Low Stock
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : stats.lowStock}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {stats.lowStockLimit} units or less
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Out of Stock
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : stats.outOfStock}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                <TrendingDown className="h-5 w-5 text-rose-600" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Currently unavailable
            </p>
          </div>
        </section>

        {/* Inventory Summary */}
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Boxes className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Total inventory units
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : stats.totalUnits.toLocaleString(
                        "en-IN"
                      )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current quantity across all books
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <Warehouse className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Inventory value
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : formatCurrency(
                        stats.inventoryValue
                      )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Stock quantity × current selling price
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Alerts */}
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Link
            href="/admin/inventory?status=low-stock"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Low stock alert
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-800/80">
                  {stats.lowStock}{" "}
                  {stats.lowStock === 1
                    ? "product is"
                    : "products are"}{" "}
                  at or below the current
                  low-stock threshold.
                </p>

                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-800">
                  View low stock
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/inventory?status=out-of-stock"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-5 transition hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <TrendingDown className="h-5 w-5 text-rose-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-rose-900">
                  Out of stock
                </p>

                <p className="mt-1 text-sm leading-6 text-rose-800/80">
                  {stats.outOfStock}{" "}
                  {stats.outOfStock === 1
                    ? "book is"
                    : "books are"}{" "}
                  currently unavailable.
                </p>

                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rose-800">
                  View unavailable
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                  setPage(1);
                }}
                placeholder="Search by book, author or SKU..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <select
                value={status}
                onChange={(event) =>
                  handleStatusChange(
                    event.target
                      .value as StockStatus
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Stock
                </option>

                <option value="in-stock">
                  In Stock
                </option>

                <option value="low-stock">
                  Low Stock
                </option>

                <option value="out-of-stock">
                  Out of Stock
                </option>
              </select>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value as SortOption
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="updated">
                  Recently Updated
                </option>

                <option value="stock-high">
                  Highest Stock
                </option>

                <option value="stock-low">
                  Lowest Stock
                </option>

                <option value="name">
                  Name A-Z
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-slate-400" />

            <p className="mt-3 text-sm text-slate-500">
              Loading inventory...
            </p>
          </section>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          sortedBooks.length === 0 && (
            <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Boxes className="mx-auto h-10 w-10 text-slate-300" />

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No inventory found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                No books match the current search
                or stock filter.
              </p>
            </section>
          )}

        {/* Desktop Table */}
        {!loading &&
          sortedBooks.length > 0 && (
            <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Product
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        SKU
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Stock
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Value
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Updated
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {sortedBooks.map(
                      (book) => {
                        const currentStatus =
                          getStockStatus(
                            book.stock,
                            stats.lowStockLimit
                          );

                        const percentage =
                          stockPercentage(
                            book.stock,
                            stats.lowStockLimit
                          );

                        const isEditing =
                          editingSku ===
                          book.sku;

                        const isUpdating =
                          updatingSku ===
                          book.sku;

                        return (
                          <tr
                            key={book._id}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                                  {book.image ? (
                                    <img
                                      src={
                                        book.image
                                      }
                                      alt={
                                        book.title
                                      }
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <BookOpen className="h-5 w-5 text-slate-500" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[260px] truncate font-semibold text-slate-900">
                                    {book.title}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {book.author}
                                  </p>

                                  {!book.published && (
                                    <span className="mt-1 inline-flex text-xs font-medium text-amber-600">
                                      Unpublished
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {book.sku}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <div className="w-36">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="1000000"
                                      value={
                                        stockInputs[
                                          book.sku
                                        ] ??
                                        String(
                                          book.stock
                                        )
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setStockInputs(
                                          (
                                            current
                                          ) => ({
                                            ...current,
                                            [book.sku]:
                                              event
                                                .target
                                                .value,
                                          })
                                        )
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateStock(
                                            book
                                          )
                                        }
                                        disabled={
                                          isUpdating
                                        }
                                        className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                      >
                                        {isUpdating
                                          ? "Saving..."
                                          : "Save"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          cancelEditing(
                                            book.sku
                                          )
                                        }
                                        disabled={
                                          isUpdating
                                        }
                                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-slate-900">
                                        {
                                          book.stock
                                        }
                                      </span>

                                      <span className="text-xs text-slate-400">
                                        units
                                      </span>
                                    </div>

                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                      <div
                                        className={`h-full rounded-full ${stockBarClass(
                                          currentStatus
                                        )}`}
                                        style={{
                                          width: `${percentage}%`,
                                        }}
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(
                                  book.stock *
                                    book.price
                                )}
                              </span>

                              <p className="mt-1 text-xs text-slate-400">
                                {formatCurrency(
                                  book.price
                                )}{" "}
                                / unit
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                                  currentStatus
                                )}`}
                              >
                                {getStatusLabel(
                                  currentStatus
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock3 className="h-3.5 w-3.5" />

                                <span>
                                  —
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditing(
                                      book
                                    )
                                  }
                                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  Update
                                </button>

                                <Link
                                  href={`/admin/books/${encodeURIComponent(
                                    book.sku
                                  )}/edit`}
                                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                                >
                                  Manage
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        {/* Mobile Cards */}
        {!loading &&
          sortedBooks.length > 0 && (
            <section className="mt-6 space-y-4 lg:hidden">
              {sortedBooks.map((book) => {
                const currentStatus =
                  getStockStatus(
                    book.stock,
                    stats.lowStockLimit
                  );

                const percentage =
                  stockPercentage(
                    book.stock,
                    stats.lowStockLimit
                  );

                const isEditing =
                  editingSku === book.sku;

                const isUpdating =
                  updatingSku === book.sku;

                return (
                  <article
                    key={book._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {book.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {book.author}
                          </p>

                          <p className="mt-1 text-xs text-blue-600">
                            {book.sku}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                          currentStatus
                        )}`}
                      >
                        {getStatusLabel(
                          currentStatus
                        )}
                      </span>
                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">
                            Total Stock
                          </p>

                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            {book.stock}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            Value
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {formatCurrency(
                              book.stock *
                                book.price
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${stockBarClass(
                            currentStatus
                          )}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {book.stock} units
                        </span>

                        <span className="text-slate-400">
                          Low stock:{" "}
                          {stats.lowStockLimit}
                        </span>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-4 rounded-xl border border-slate-200 p-4">
                        <label className="text-xs font-semibold text-slate-600">
                          New stock quantity
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="1000000"
                          value={
                            stockInputs[
                              book.sku
                            ] ??
                            String(book.stock)
                          }
                          onChange={(event) =>
                            setStockInputs(
                              (current) => ({
                                ...current,
                                [book.sku]:
                                  event.target
                                    .value,
                              })
                            )
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateStock(
                                book
                              )
                            }
                            disabled={
                              isUpdating
                            }
                            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Saving..."
                              : "Save Stock"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              cancelEditing(
                                book.sku
                              )
                            }
                            disabled={
                              isUpdating
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 p-3">
                        <p className="text-xs text-slate-400">
                          Price
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatCurrency(
                            book.price
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 p-3">
                        <p className="text-xs text-slate-400">
                          Published
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {book.published
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(book)
                        }
                        className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white"
                      >
                        Update Stock
                      </button>

                      <Link
                        href={`/admin/books/${encodeURIComponent(
                          book.sku
                        )}/edit`}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700"
                      >
                        Manage
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

        {/* Pagination */}
        {!loading &&
          pagination.totalPages > 1 && (
            <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(pagination.page - 1) *
                    pagination.limit +
                    (pagination.total > 0
                      ? 1
                      : 0)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    pagination.page *
                      pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.total}
                </span>{" "}
                products
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          current - 1,
                          1
                        )
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="px-2 text-sm font-medium text-slate-500">
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </section>
          )}

        {/* Inventory Information */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <Warehouse className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Inventory management
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Inventory quantities are stored against
                the actual book records. Stock updates are
                validated on the server before being saved.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/admin/books"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Back to Books
          </Link>

          <button
            type="button"
            onClick={() =>
              loadInventory(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh Inventory
          </button>
        </div>
      </div>
    </main>
  );
}