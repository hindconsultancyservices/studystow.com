"use client";

import Link from "next/link";
import {
  ArrowUp,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

type Customer = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type OrderItem = {
  book: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  customer: Customer | null;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress: ShippingAddress;
};

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
};

type ShippingAddress = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

};

type ApiResponse = {
  success: boolean;
  data: Order[];
  stats: Stats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-violet-50 text-violet-700 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const paymentStyles: Record<PaymentStatus, string> = {
  paid: "text-emerald-700",
  pending: "text-amber-700",
  failed: "text-red-700",
  refunded: "text-slate-500",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(name?: string) {
  if (!name) return "CU";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [days, setDays] = useState("30");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("status", status);
      params.set("payment", payment);
      params.set("days", days);

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/admin/orders?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch orders"
        );
      }

      setOrders(result.data || []);
      setStats(
        result.stats || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
        }
      );

      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  }, [page, status, payment, days, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [fetchOrders]);

  function handleFilterChange(
    setter: (value: string) => void,
    value: string
  ) {
    setter(value);
    setPage(1);
  }

  function getProductPreview(order: Order) {
    if (order.items.length === 0) {
      return "No items";
    }

    if (order.items.length === 1) {
      return order.items[0].title;
    }

    return `${order.items[0].title} + ${
      order.items.length - 1
    } more`;
  }

  function exportOrders() {
    if (!orders.length) return;

    const header = [
      "Order",
      "Customer",
      "Email",
      "Items",
      "Amount",
      "Payment",
      "Payment Status",
      "Order Status",
      "Date",
    ];

    const rows = orders.map((order) => [
      order.orderNumber,
      order.customer?.name || "Guest",
      order.customer?.email || "",
      order.itemCount,
      order.total,
      order.paymentMethod,
      order.paymentStatus,
      order.orderStatus,
      order.createdAt,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `studystow-orders-page-${page}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/admin"
                className="hover:text-slate-900"
              >
                Admin
              </Link>

              <ChevronRight className="h-4 w-4" />

              <span className="text-slate-900">
                Orders
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage, track and process customer orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={exportOrders}
              disabled={!orders.length}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Orders
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {stats.totalOrders.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Paid Revenue
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {stats.pendingOrders}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-amber-600">
              Needs attention
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Delivered
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {stats.deliveredOrders}
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Truck className="h-5 w-5" />
              </div>
            </div>

            {stats.totalOrders > 0 && (
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ArrowUp className="h-3.5 w-3.5" />

                {Math.round(
                  (stats.deliveredOrders /
                    stats.totalOrders) *
                    100
                )}
                % fulfillment
              </div>
            )}
          </div>
        </section>

        {/* Main */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search order ID, customer or phone..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={status}
                  onChange={(event) =>
                    handleFilterChange(
                      setStatus,
                      event.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
                >
                  <option value="all">
                    All Status
                  </option>
                  <option value="pending">
                    Pending
                  </option>
                  <option value="confirmed">
                    Confirmed
                  </option>
                  <option value="processing">
                    Processing
                  </option>
                  <option value="shipped">
                    Shipped
                  </option>
                  <option value="delivered">
                    Delivered
                  </option>
                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>

                <select
                  value={payment}
                  onChange={(event) =>
                    handleFilterChange(
                      setPayment,
                      event.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
                >
                  <option value="all">
                    All Payments
                  </option>
                  <option value="paid">
                    Paid
                  </option>
                  <option value="pending">
                    Pending
                  </option>
                  <option value="failed">
                    Failed
                  </option>
                  <option value="refunded">
                    Refunded
                  </option>
                </select>

                <select
                  value={days}
                  onChange={(event) =>
                    handleFilterChange(
                      setDays,
                      event.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
                >
                  <option value="7">
                    Last 7 days
                  </option>
                  <option value="30">
                    Last 30 days
                  </option>
                  <option value="90">
                    Last 90 days
                  </option>
                  <option value="all">
                    All time
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          )}

          {/* Empty */}
          {!loading && !error && orders.length === 0 && (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-2xl bg-slate-100 p-4">
                <Package className="h-7 w-7 text-slate-500" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No orders found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                There are no orders matching the current
                filters.
              </p>
            </div>
          )}

          {/* Desktop */}
          {!loading && !error && orders.length > 0 && (
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Items
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="font-semibold text-slate-950 hover:text-blue-600"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                            {getInitials(
                              order.customer?.name ||
                                order.shippingAddress?.name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {order.customer?.name ||
                                order.shippingAddress?.name ||
                                "Guest Customer"}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {order.customer?.email ||
                                "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {order.itemCount}{" "}
                          {order.itemCount === 1
                            ? "item"
                            : "items"}
                        </p>

                        <p className="mt-0.5 max-w-[190px] truncate text-xs text-slate-500">
                          {getProductPreview(order)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-950">
                          {formatCurrency(order.total)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className={`text-sm font-semibold ${paymentStyles[order.paymentStatus]}`}
                        >
                          {formatStatus(
                            order.paymentStatus
                          )}
                        </p>

                        <p className="mt-0.5 text-xs capitalize text-slate-500">
                          {order.paymentMethod}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[order.orderStatus]}`}
                        >
                          {formatStatus(
                            order.orderStatus
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(
                            order.createdAt
                          )}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatTime(
                            order.createdAt
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          aria-label={`View ${order.orderNumber}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile */}
          {!loading &&
            !error &&
            orders.length > 0 && (
              <div className="divide-y divide-slate-100 lg:hidden">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="font-bold text-slate-950"
                        >
                          {order.orderNumber}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            order.createdAt
                          )}{" "}
                          ·{" "}
                          {formatTime(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[order.orderStatus]}`}
                      >
                        {formatStatus(
                          order.orderStatus
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        {getInitials(
                          order.customer?.name ||
                            order.shippingAddress?.name
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {order.customer?.name ||
                            order.shippingAddress?.name ||
                            "Guest Customer"}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {order.customer?.email ||
                            "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Items
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {order.itemCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {formatCurrency(
                            order.total
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Payment
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${paymentStyles[order.paymentStatus]}`}
                        >
                          {formatStatus(
                            order.paymentStatus
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Method
                        </p>

                        <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 truncate text-xs text-slate-500">
                      {getProductPreview(order)}
                    </p>

                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" />
                      View Order
                    </Link>
                  </div>
                ))}
              </div>
            )}

          {/* Pagination */}
          {!loading &&
            !error &&
            total > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      (page - 1) * limit + 1,
                      total
                    )}
                    –
                    {Math.min(
                      page * limit,
                      total
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {total}
                  </span>{" "}
                  orders
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((value) =>
                        Math.max(value - 1, 1)
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                    {page}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((value) =>
                        Math.min(
                          value + 1,
                          totalPages
                        )
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </section>

        {/* Bottom */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Package className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Processing
                </p>

                <p className="text-xs text-slate-500">
                  {stats.processingOrders} orders awaiting processing
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Truck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  In Transit
                </p>

                <p className="text-xs text-slate-500">
                  {stats.shippedOrders} shipped orders
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Delivered
                </p>

                <p className="text-xs text-slate-500">
                  {stats.deliveredOrders} delivered orders
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}