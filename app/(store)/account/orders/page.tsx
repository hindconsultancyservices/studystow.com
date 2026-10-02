"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
};

type OrderItem = {
  _id?: string;
  title?: string;
  quantity?: number;
  price?: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  createdAt?: string;
  total?: number;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  items?: OrderItem[];
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function extractArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }

  if (
    value &&
    typeof value === "object" &&
    "orders" in value &&
    Array.isArray((value as { orders: unknown }).orders)
  ) {
    return (value as { orders: T[] }).orders;
  }

  return [];
}

function normalizeStatus(value?: string) {
  return String(value || "").trim().toLowerCase();
}

function capitalize(value?: string) {
  if (!value) return "Unknown";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [cancellingOrderId, setCancellingOrderId] =
    useState<string | null>(null);

  async function loadOrders(showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const email = session?.user?.email?.trim();

      if (!email) {
        throw new Error("User email not found.");
      }

      const userResponse = await fetch(
        `/api/users?search=${encodeURIComponent(email)}&limit=1`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      let userData: ApiResponse<User[]> | null = null;

      try {
        userData = await userResponse.json();
      } catch {
        userData = null;
      }

      if (!userResponse.ok || !userData?.success) {
        throw new Error(
          userData?.message || "Unable to load your account."
        );
      }

      const users = extractArray<User>(userData.data);
      const currentUser = users[0];

      if (!currentUser?._id) {
        throw new Error("User account not found.");
      }

      setUser(currentUser);

      const ordersResponse = await fetch(
        `/api/orders?customer=${encodeURIComponent(
          currentUser._id
        )}&limit=100`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      let ordersData: ApiResponse<Order[]> | null = null;

      try {
        ordersData = await ordersResponse.json();
      } catch {
        ordersData = null;
      }

      if (!ordersResponse.ok || !ordersData?.success) {
        throw new Error(
          ordersData?.message || "Unable to load your orders."
        );
      }

      const loadedOrders = extractArray<Order>(ordersData.data);

      setOrders(loadedOrders);
    } catch (err) {
      console.error("Orders loading error:", err);

      setOrders([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your orders."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      return;
    }

    let mounted = true;

    async function initialLoad() {
      try {
        setLoading(true);
        setError("");

        const email = session?.user?.email?.trim();

        if (!email) {
          throw new Error("User email not found.");
        }

        const userResponse = await fetch(
          `/api/users?search=${encodeURIComponent(email)}&limit=1`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        let userData: ApiResponse<User[]> | null = null;

        try {
          userData = await userResponse.json();
        } catch {
          userData = null;
        }

        if (!userResponse.ok || !userData?.success) {
          throw new Error(
            userData?.message || "Unable to load your account."
          );
        }

        const users = extractArray<User>(userData.data);
        const currentUser = users[0];

        if (!currentUser?._id) {
          throw new Error("User account not found.");
        }

        if (!mounted) return;

        setUser(currentUser);

        const ordersResponse = await fetch(
          `/api/orders?customer=${encodeURIComponent(
            currentUser._id
          )}&limit=100`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        let ordersData: ApiResponse<Order[]> | null = null;

        try {
          ordersData = await ordersResponse.json();
        } catch {
          ordersData = null;
        }

        if (!ordersResponse.ok || !ordersData?.success) {
          throw new Error(
            ordersData?.message || "Unable to load your orders."
          );
        }

        const loadedOrders = extractArray<Order>(
          ordersData.data
        );

        if (!mounted) return;

        setOrders(loadedOrders);
      } catch (err) {
        console.error("Orders loading error:", err);

        if (!mounted) return;

        setOrders([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your orders."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      mounted = false;
    };
  }, [sessionStatus, session?.user?.email]);

  async function cancelOrder(order: Order) {
    const orderId = order.orderNumber || order._id;

    if (!orderId) {
      setError("Order ID is missing.");
      return;
    }

    const status = normalizeStatus(order.orderStatus);

    if (status !== "pending" && status !== "confirmed") {
      setError("This order can no longer be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${
        order.orderNumber || order._id
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(order._id);
      setError("");

      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "cancel",
          }),
        }
      );

      let data: ApiResponse<unknown> | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to cancel this order."
        );
      }

      await loadOrders(false);
    } catch (err) {
      console.error("Cancel order error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel this order."
      );
    } finally {
      setCancellingOrderId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter(
      (order) =>
        normalizeStatus(order.orderStatus) === filter
    );
  }, [orders, filter]);

  function formatDate(date?: string) {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatAmount(amount?: number) {
    const numericAmount = Number(amount ?? 0);

    if (!Number.isFinite(numericAmount)) {
      return "₹0";
    }

    return `₹${numericAmount.toLocaleString("en-IN")}`;
  }

  function statusClass(status?: string) {
    switch (normalizeStatus(status)) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "shipped":
        return "bg-blue-100 text-blue-700";

      case "processing":
      case "confirmed":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function paymentStatusClass(status?: string) {
    switch (normalizeStatus(status)) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "refunded":
        return "bg-purple-100 text-purple-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function paymentMethodLabel(method?: string) {
    const normalized = normalizeStatus(method);

    if (normalized === "razorpay") {
      return "Razorpay";
    }

    if (
      normalized === "cod" ||
      normalized === "cash_on_delivery" ||
      normalized === "cash-on-delivery"
    ) {
      return "Cash on Delivery";
    }

    return method
      ? capitalize(method.replace(/[_-]/g, " "))
      : "Payment method unavailable";
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />

            <div className="mt-3 h-4 w-64 rounded bg-gray-200" />

            <div className="mt-8 grid gap-6 lg:grid-cols-4">
              <div className="h-72 rounded-xl bg-gray-200" />

              <div className="lg:col-span-3">
                <div className="h-14 rounded-xl bg-gray-200" />

                <div className="mt-4 h-56 rounded-xl bg-gray-200" />

                <div className="mt-4 h-56 rounded-xl bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Please login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to view your orders.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    user?.name || session.user?.name || "Customer";

  const displayEmail =
    user?.email || session.user?.email || "";

  const initial =
    displayName.charAt(0).toUpperCase() || "C";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Account
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and track your book orders.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="h-fit rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 border-b px-2 pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 font-bold uppercase text-white">
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {displayName}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {displayEmail}
                </p>
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              <Link
                href="/account"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Account
              </Link>

              <Link
                href="/account/orders"
                className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900"
              >
                My Orders
              </Link>

              <Link
                href="/account/profile"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                My Profile
              </Link>

              <Link
                href="/account/addresses"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Addresses
              </Link>

              <button
                type="button"
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="w-full rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </nav>
          </aside>

          {/* Orders */}
          <section className="lg:col-span-3">
            {/* Filters */}
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {[
                  ["all", "All Orders"],
                  ["pending", "Pending"],
                  ["confirmed", "Confirmed"],
                  ["processing", "Processing"],
                  ["shipped", "Shipped"],
                  ["delivered", "Delivered"],
                  ["cancelled", "Cancelled"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      filter === value
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="mt-6 space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
                  <div className="text-4xl">📦</div>

                  <h2 className="mt-4 text-lg font-semibold text-gray-900">
                    No orders found
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {filter === "all"
                      ? "You have not placed any orders yet."
                      : `You don't have any ${filter} orders.`}
                  </p>

                  {filter === "all" && (
                    <Link
                      href="/books"
                      className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      Browse Books
                    </Link>
                  )}
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const orderStatus = normalizeStatus(
                    order.orderStatus
                  );

                  const paymentStatus = normalizeStatus(
                    order.paymentStatus
                  );

                  const orderItems = Array.isArray(order.items)
                    ? order.items
                    : [];

                  const canCancel =
                    orderStatus === "pending" ||
                    orderStatus === "confirmed";

                  const isCancelling =
                    cancellingOrderId === order._id;

                  return (
                    <article
                      key={order._id}
                      className="overflow-hidden rounded-xl border bg-white shadow-sm"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col gap-4 border-b bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Order
                          </p>

                          <h2 className="mt-1 font-semibold text-gray-900">
                            {order.orderNumber || order._id}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              orderStatus
                            )}`}
                          >
                            {capitalize(orderStatus)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass(
                              paymentStatus
                            )}`}
                          >
                            {capitalize(paymentStatus)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y">
                        {orderItems.length === 0 ? (
                          <div className="p-5 text-sm text-gray-500">
                            No item details available for this
                            order.
                          </div>
                        ) : (
                          orderItems.map((item, index) => {
                            const quantity = Number(
                              item.quantity ?? 0
                            );

                            const price = Number(
                              item.price ?? 0
                            );

                            const title =
                              item.title ||
                              "Book details unavailable";

                            return (
                              <div
                                key={
                                  item._id ||
                                  `${order._id}-${index}`
                                }
                                className="flex gap-4 p-5"
                              >
                                <div className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      No image
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900">
                                    {title}
                                  </p>

                                  <p className="mt-1 text-sm text-gray-500">
                                    Qty: {quantity}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">
                                    {formatAmount(
                                      price * quantity
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500">
                                    {formatAmount(price)} each
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col gap-5 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* Payment */}
                        <div>
                          <p className="text-xs text-gray-500">
                            Payment
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {paymentMethodLabel(
                              order.paymentMethod
                            )}
                          </p>
                        </div>

                        {/* Total + Actions */}
                        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                          {/* Total */}
                          <div className="text-left sm:mr-2 sm:text-right">
                            <p className="text-xs text-gray-500">
                              Total
                            </p>

                            <p className="font-bold text-gray-900">
                              {formatAmount(order.total)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                            {canCancel && (
                              <button
                                type="button"
                                onClick={() =>
                                  cancelOrder(order)
                                }
                                disabled={isCancelling}
                                className="w-full rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                              >
                                {isCancelling
                                  ? "Cancelling..."
                                  : "Cancel Order"}
                              </button>
                            )}

                            <Link
                              href={`/account/orders/${
                                order.orderNumber ||
                                order._id
                              }`}
                              className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-50 sm:w-auto"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}