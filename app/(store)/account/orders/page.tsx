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
  title: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const email = session.user?.email;

        if (!email) {
          throw new Error("User email not found");
        }

        // Get logged-in user's MongoDB ID
        const userResponse = await fetch(
          `/api/users?search=${encodeURIComponent(
            email
          )}&limit=1`,
          {
            cache: "no-store",
          }
        );

        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.success) {
          throw new Error(
            userData.message || "Failed to load user"
          );
        }

        const currentUser = userData.data?.[0];

        if (!currentUser) {
          throw new Error("User account not found");
        }

        setUser(currentUser);

        // Get only this user's orders
        const ordersResponse = await fetch(
          `/api/orders?customer=${encodeURIComponent(
            currentUser._id
          )}&limit=100`,
          {
            cache: "no-store",
          }
        );

        const ordersData = await ordersResponse.json();

        if (!ordersResponse.ok || !ordersData.success) {
          throw new Error(
            ordersData.message || "Failed to load orders"
          );
        }

        setOrders(
          Array.isArray(ordersData.data)
            ? ordersData.data
            : []
        );
      } catch (err) {
        console.error("Orders loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [sessionStatus, session?.user?.email]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter(
      (order) => order.orderStatus === filter
    );
  }, [orders, filter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "shipped":
        return "bg-blue-100 text-blue-700";

      case "processing":
      case "confirmed":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const paymentStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "refunded":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and track your book orders.
          </p>
        </div>

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
                {(user?.name || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {user?.name || "Customer"}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {user?.email || session.user?.email}
                </p>
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              <Link
                href="/account"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Dashboard
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

              <Link
                href="/account/wishlist"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Wishlist
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
                filteredOrders.map((order) => (
                  <div
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
                          {order.orderNumber}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus
                            .charAt(0)
                            .toUpperCase() +
                            order.orderStatus.slice(1)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus
                            .charAt(0)
                            .toUpperCase() +
                            order.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y">
                      {order.items?.map((item, index) => (
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
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl">
                                📚
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">
                              {item.title}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatAmount(
                                item.price *
                                  item.quantity
                              )}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatAmount(item.price)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-4 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-500">
                          Payment
                        </p>

                        <p className="mt-1 text-sm font-medium capitalize text-gray-900">
                          {order.paymentMethod ===
                          "razorpay"
                            ? "Razorpay"
                            : "Cash on Delivery"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Total
                          </p>

                          <p className="font-bold text-gray-900">
                            {formatAmount(order.total)}
                          </p>
                        </div>

                        <Link
                          href={`/account/orders/${order.orderNumber}`}
                          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}