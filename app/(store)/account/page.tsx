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

type Order = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
};

type Address = {
  _id: string;
  label?: string;

  // Backend/order structure
  name?: string;
  fullName?: string;

  phone: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  state: string;

  pincode?: string;
  postalCode?: string;

  country?: string;
  isDefault?: boolean;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const ACTIVE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
];

export default function AccountPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      if (sessionStatus === "unauthenticated") {
        setLoading(false);
      }

      return;
    }

    let cancelled = false;

    async function loadAccount() {
      try {
        setLoading(true);
        setError("");

        const email = session?.user?.email?.trim();

        if (!email) {
          throw new Error("Your account email could not be found.");
        }

        /*
         * ==========================================================
         * 1. LOAD CURRENT USER FROM MONGODB
         * ==========================================================
         */

        const userResponse = await fetch(
          `/api/users?search=${encodeURIComponent(email)}&limit=1`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );

        const userResult: ApiResponse<User[]> =
          await userResponse.json().catch(() => ({}));

        if (!userResponse.ok || !userResult.success) {
          throw new Error(
            userResult.message || "Failed to load your account."
          );
        }

        const currentUser = Array.isArray(userResult.data)
          ? userResult.data[0]
          : null;

        if (!currentUser?._id) {
          throw new Error("Your account was not found.");
        }

        if (cancelled) return;

        const sessionUserName = session?.user?.name;

        setUser({
          _id: String(currentUser._id),
          name: currentUser.name || sessionUserName || "Customer",
          email: currentUser.email || email,
          phone: currentUser.phone || "",
        });

        /*
         * ==========================================================
         * 2. LOAD ORDERS
         * ==========================================================
         */

        try {
          const ordersResponse = await fetch(
            `/api/orders?customer=${encodeURIComponent(
              String(currentUser._id)
            )}&limit=100`,
            {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept: "application/json",
                "Cache-Control": "no-cache",
              },
            }
          );

          const ordersResult: ApiResponse<Order[]> =
            await ordersResponse.json().catch(() => ({}));

          if (!ordersResponse.ok || !ordersResult.success) {
            throw new Error(
              ordersResult.message || "Failed to load orders."
            );
          }

          if (!cancelled) {
            setOrders(
              Array.isArray(ordersResult.data)
                ? ordersResult.data
                : []
            );
          }
        } catch (orderError) {
          console.error("Account orders error:", orderError);

          if (!cancelled) {
            setOrders([]);
          }
        }

        /*
         * ==========================================================
         * 3. LOAD ADDRESSES
         * ==========================================================
         */

        try {
          const addressesResponse = await fetch(
            "/api/users/me/addresses",
            {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept: "application/json",
                "Cache-Control": "no-cache",
              },
            }
          );

          const addressesResult =
            await addressesResponse.json().catch(() => ({}));

          if (!addressesResponse.ok) {
            throw new Error(
              addressesResult?.message ||
                "Failed to load addresses."
            );
          }

          const addressList = Array.isArray(
            addressesResult?.data
          )
            ? addressesResult.data
            : Array.isArray(addressesResult?.addresses)
            ? addressesResult.addresses
            : [];

          if (!cancelled) {
            setAddresses(addressList);
          }
        } catch (addressError) {
          console.error(
            "Account addresses error:",
            addressError
          );

          if (!cancelled) {
            setAddresses([]);
          }
        }

        /*
         * ==========================================================
         * 4. LOAD WISHLIST FROM MONGODB
         * ==========================================================
         *
         * Do NOT use localStorage as the source of truth.
         */

        try {
          const wishlistResponse = await fetch(
            "/api/wishlist",
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: {
                Accept: "application/json",
                "Cache-Control": "no-cache",
              },
            }
          );

          const wishlistResult =
            await wishlistResponse.json().catch(() => ({}));

          if (!wishlistResponse.ok) {
            throw new Error(
              wishlistResult?.message ||
                "Failed to load wishlist."
            );
          }

          const wishlistItems = Array.isArray(
            wishlistResult?.items
          )
            ? wishlistResult.items
            : Array.isArray(wishlistResult?.data)
            ? wishlistResult.data
            : [];

          if (!cancelled) {
            setWishlistCount(wishlistItems.length);
          }
        } catch (wishlistError) {
          console.error(
            "Account wishlist error:",
            wishlistError
          );

          if (!cancelled) {
            setWishlistCount(0);
          }
        }
      } catch (err) {
        console.error("Account loading error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Some account data could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [
    sessionStatus,
    session?.user?.email,
    session?.user?.name,
  ]);

  /*
   * ==========================================================
   * DERIVED DATA
   * ==========================================================
   */

  const activeOrders = useMemo(() => {
    return orders.filter((order) =>
      ACTIVE_ORDER_STATUSES.includes(order.orderStatus)
    ).length;
  }, [orders]);

  const defaultAddress = useMemo(() => {
    return (
      addresses.find(
        (address) => address.isDefault === true
      ) ||
      addresses[0] ||
      null
    );
  }, [addresses]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  }, [orders]);

  /*
   * ==========================================================
   * HELPERS
   * ==========================================================
   */

  function formatDate(date: string) {
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

  function formatAmount(amount: number) {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  }

  function statusClass(status: string) {
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

      case "pending":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getAddressName(address: Address) {
    return (
      address.fullName ||
      address.name ||
      "Customer"
    );
  }

  function getPincode(address: Address) {
    return (
      address.pincode ||
      address.postalCode ||
      ""
    );
  }

  /*
   * ==========================================================
   * SESSION LOADING
   * ==========================================================
   */

  if (sessionStatus === "loading") {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />

            <div className="mt-3 h-4 w-64 rounded bg-gray-200" />

            <div className="mt-8 grid gap-6 lg:grid-cols-4">
              <div className="h-72 rounded-xl bg-gray-200" />

              <div className="lg:col-span-3">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-32 rounded-xl bg-gray-200"
                    />
                  ))}
                </div>

                <div className="mt-6 h-80 rounded-xl bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * NOT LOGGED IN
   * ==========================================================
   */

  if (sessionStatus !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Please login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to access your account.
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

  /*
   * ==========================================================
   * DISPLAY DATA
   * ==========================================================
   */

  const displayName =
    user?.name ||
    session.user?.name ||
    "Customer";

  const displayEmail =
    user?.email ||
    session.user?.email ||
    "";

  const initial =
    displayName.charAt(0).toUpperCase() || "C";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            My Account
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {displayName}!
          </p>
        </div>

        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">

          {/* ====================================================
              SIDEBAR
              ==================================================== */}

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
                className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900"
              >
                Account
              </Link>

              <Link
                href="/account/orders"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
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

          {/* ====================================================
              MAIN
              ==================================================== */}

          <section className="lg:col-span-3">

            {/* ==================================================
                STATS
                ================================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <Link
                href="/account/orders"
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📦</span>

                  <span className="text-2xl font-bold text-gray-900">
                    {orders.length}
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Total Orders
                </p>
              </Link>

              <Link
                href="/account/orders"
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🚚</span>

                  <span className="text-2xl font-bold text-gray-900">
                    {activeOrders}
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Active Orders
                </p>
              </Link>

              

              <Link
                href="/account/addresses"
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📍</span>

                  <span className="text-2xl font-bold text-gray-900">
                    {addresses.length}
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Addresses
                </p>
              </Link>

            </div>

            {/* ==================================================
                RECENT ORDERS
                ================================================== */}

            <div className="mt-6 rounded-xl border bg-white shadow-sm">

              <div className="flex items-center justify-between border-b p-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your latest book purchases
                  </p>
                </div>

                <Link
                  href="/account/orders"
                  className="text-sm font-semibold text-gray-900 hover:underline"
                >
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    Loading account data...
                  </p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    You have not placed any orders yet.
                  </p>

                  <Link
                    href="/books"
                    className="mt-4 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Browse Books
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <Link
                          href={`/account/orders/${order.orderNumber}`}
                          className="font-semibold text-gray-900 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <span className="font-semibold text-gray-900">
                          {formatAmount(order.total)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus
                            ? order.orderStatus
                                .charAt(0)
                                .toUpperCase() +
                              order.orderStatus.slice(1)
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* ==================================================
                PROFILE + ADDRESS
                ================================================== */}

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {/* Personal Information */}

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h2>

                  <Link
                    href="/account/profile"
                    className="text-sm font-semibold text-gray-900 hover:underline"
                  >
                    Edit
                  </Link>
                </div>

                <div className="mt-5 space-y-4 text-sm">

                  <div>
                    <p className="text-gray-500">
                      Name
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {user?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-all font-medium text-gray-900">
                      {user?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Phone
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {user?.phone || "Not added"}
                    </p>
                  </div>

                </div>
              </div>

              {/* Default Address */}

              <div className="rounded-xl border bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Default Address
                  </h2>

                  <Link
                    href="/account/addresses"
                    className="text-sm font-semibold text-gray-900 hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                {defaultAddress ? (
                  <div className="mt-5 text-sm leading-6 text-gray-600">

                    <p className="font-semibold text-gray-900">
                      {getAddressName(defaultAddress)}
                    </p>

                    <p>
                      {defaultAddress.addressLine1}
                    </p>

                    {defaultAddress.addressLine2 && (
                      <p>
                        {defaultAddress.addressLine2}
                      </p>
                    )}

                    <p>
                      {defaultAddress.city},{" "}
                      {defaultAddress.state}
                    </p>

                    <p>
                      {defaultAddress.country ||
                        "India"}

                      {getPincode(defaultAddress) && (
                        <>
                          {" - "}
                          {getPincode(defaultAddress)}
                        </>
                      )}
                    </p>

                    <p>
                      {defaultAddress.phone}
                    </p>

                  </div>
                ) : (
                  <div className="mt-5">
                    <p className="text-sm text-gray-500">
                      No address added yet.
                    </p>

                    <Link
                      href="/account/addresses"
                      className="mt-3 inline-block text-sm font-semibold text-gray-900 hover:underline"
                    >
                      Add Address →
                    </Link>
                  </div>
                )}

              </div>

            </div>

            {/* ==================================================
                CONTINUE SHOPPING
                ================================================== */}

            <div className="mt-6 rounded-xl bg-gray-900 p-6 text-white sm:p-8">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div>
                  <h2 className="text-lg font-semibold">
                    Looking for your next book?
                  </h2>

                  <p className="mt-1 text-sm text-gray-300">
                    Explore our collection and discover something new.
                  </p>
                </div>

                <Link
                  href="/books"
                  className="w-fit rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                >
                  Browse Books
                </Link>

              </div>

            </div>

          </section>
        </div>
      </div>
    </main>
  );
}