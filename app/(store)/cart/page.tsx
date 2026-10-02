"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useSession } from "next-auth/react";

type CartItem = {
  id?: string;
  book: string;
  title: string;
  slug: string;
  author?: string;
  price: number;
  compareAtPrice?: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  stock: number;
};

type CartResponse = {
  items?: CartItem[];
  subtotal?: number;
  itemCount?: number;
};

const CART_UPDATED_EVENT = "studystow-cart-updated";

function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event(CART_UPDATED_EVENT)
    );
  }
}

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;
}

export default function CartPage() {
  const { status } = useSession();

  const [items, setItems] = useState<CartItem[]>(
    []
  );

  const [subtotal, setSubtotal] = useState(0);

  const [itemCount, setItemCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingBookId, setUpdatingBookId] =
    useState("");

  const [removingBookId, setRemovingBookId] =
    useState("");

  const [clearing, setClearing] =
    useState(false);

  /*
   * ==========================================================
   * LOAD CART FROM MONGODB
   * ==========================================================
   *
   * /api/cart is the single source of truth.
   *
   * It returns:
   *
   * {
   *   items,
   *   subtotal,
   *   itemCount
   * }
   */
  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      /*
       * Not logged in.
       */
      if (response.status === 401) {
        setItems([]);
        setSubtotal(0);
        setItemCount(0);

        setError(
          "Please log in to view your cart."
        );

        return;
      }

      const result = await response.json();

if (!response.ok) {
  throw new Error(
    result?.message || "Failed to load cart."
  );
}

const payload = result?.data ?? result;

const cartItems = Array.isArray(payload?.items)
  ? payload.items
  : [];

setItems(cartItems);

setSubtotal(
  Number(payload?.subtotal || 0)
);

setItemCount(
  Number(payload?.itemCount || 0)
);
    } catch (error) {
      console.error(
        "Load cart error:",
        error
      );

      setItems([]);
      setSubtotal(0);
      setItemCount(0);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load cart."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    loadCart();

    /*
     * Refresh cart after Add to Cart,
     * update quantity, remove, etc.
     */
    function handleCartUpdate() {
      loadCart();
    }

    window.addEventListener(
      CART_UPDATED_EVENT,
      handleCartUpdate
    );

    /*
     * Refresh when user comes back to the tab.
     */
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible"
      ) {
        loadCart();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        CART_UPDATED_EVENT,
        handleCartUpdate
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [status]);

  /*
   * ==========================================================
   * UPDATE QUANTITY
   * ==========================================================
   */
  async function updateQuantity(
    bookId: string,
    quantity: number
  ) {
    if (quantity < 1) {
      return;
    }

    try {
      setUpdatingBookId(bookId);
      setError("");

      const response = await fetch(
        "/api/cart",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            bookId,
            quantity,
          }),
        }
      );

      const result =
        await response.json();

      if (response.status === 401) {
        setError(
          "Please log in to update your cart."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to update cart."
        );
      }

      /*
       * Get fresh prices, stock and quantities
       * from MongoDB after update.
       */
      await loadCart();

      notifyCartUpdated();
    } catch (error) {
      console.error(
        "Update cart error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update cart."
      );
    } finally {
      setUpdatingBookId("");
    }
  }

  /*
   * ==========================================================
   * REMOVE ITEM
   * ==========================================================
   */
  async function removeItem(bookId: string) {
    try {
      setRemovingBookId(bookId);
      setError("");

      const response = await fetch(
        "/api/cart",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            bookId,
          }),
        }
      );

      const result =
        await response.json();

      if (response.status === 401) {
        setError(
          "Please log in to update your cart."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to remove item."
        );
      }

      /*
       * Reload directly from MongoDB.
       */
      await loadCart();

      notifyCartUpdated();
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove item."
      );
    } finally {
      setRemovingBookId("");
    }
  }

  /*
   * ==========================================================
   * CLEAR CART
   * ==========================================================
   */
  async function clearCart() {
    try {
      setClearing(true);
      setError("");

      const response = await fetch(
        "/api/cart",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const result =
        await response.json();

      if (response.status === 401) {
        setError(
          "Please log in to update your cart."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to clear cart."
        );
      }

      /*
       * Immediately clear UI.
       */
      setItems([]);
      setSubtotal(0);
      setItemCount(0);

      notifyCartUpdated();
    } catch (error) {
      console.error(
        "Clear cart error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to clear cart."
      );
    } finally {
      setClearing(false);
    }
  }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */
  if (
    status === "loading" ||
    loading
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="hidden border-b bg-white sm:block">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-5 w-32 rounded bg-slate-200" />

              <div className="mt-6 h-10 w-48 rounded bg-slate-200" />

              <div className="mt-3 h-5 w-64 rounded bg-slate-100" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ==========================================================
   * NOT LOGGED IN
   * ==========================================================
   */
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="hidden border-b bg-white sm:block">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/"
                className="transition hover:text-slate-900"
              >
                Home
              </Link>

              <ChevronRight className="h-4 w-4" />

              <span className="font-medium text-slate-900">
                Cart
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Shopping Cart
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed bg-white px-6 py-20 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-6 text-xl font-semibold text-slate-900">
              Please log in
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Log in to view and manage your
              MongoDB cart.
            </p>

            <Link
              href="/login?callbackUrl=/cart"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Log in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */
  if (
    error &&
    items.length === 0
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="hidden border-b bg-white sm:block">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/"
                className="transition hover:text-slate-900"
              >
                Home
              </Link>

              <ChevronRight className="h-4 w-4" />

              <span className="font-medium text-slate-900">
                Cart
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Shopping Cart
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-white px-6 py-16 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              Unable to load your cart
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadCart}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ==========================================================
   * EMPTY CART
   * ==========================================================
   */
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="hidden border-b bg-white sm:block">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/"
                className="transition hover:text-slate-900"
              >
                Home
              </Link>

              <ChevronRight className="h-4 w-4" />

              <span className="font-medium text-slate-900">
                Cart
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Shopping Cart
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Your cart is currently empty.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <ShoppingCart className="h-9 w-9 text-slate-400" />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-slate-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Looks like you haven&apos;t added
              any books to your cart yet.
            </p>

            <Link
              href="/books"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Books
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ==========================================================
   * TOTAL
   * ==========================================================
   *
   * Only MongoDB cart subtotal is used.
   *
   * No fake discount.
   * No fake shipping.
   * No fake tax.
   */
  const discount = 0;
  const shipping = 0;

  const total = Math.max(
    subtotal +
      shipping -
      discount,
    0
  );

  /*
   * ==========================================================
   * CART
   * ==========================================================
   */
  return (
    <main className="min-h-screen bg-slate-50">
      {/* ======================================================
          HEADER
          ====================================================== */}
      <section className="hidden border-b bg-white sm:block">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-slate-900"
            >
              Home
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">
              Cart
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Shopping Cart
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {itemCount}{" "}
                  {itemCount === 1
                    ? "item"
                    : "items"}{" "}
                  in your cart
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearCart}
              disabled={clearing}
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />

              {clearing
                ? "Clearing..."
                : "Clear Cart"}
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
          ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* ==================================================
              CART ITEMS
              ================================================== */}
          <div className="min-w-0 space-y-4">
            {items.map((item) => {
              const itemTotal =
                Number(item.price || 0) *
                Number(item.quantity || 0);

              const busy =
                updatingBookId === item.book ||
                removingBookId === item.book;

              const comparePrice =
                Number(
                  item.compareAtPrice ??
                    item.originalPrice ??
                    0
                );

              return (
                <article
                  key={
                    item.id ||
                    item.book
                  }
                  className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >
                  <div className="flex gap-4">
                    {/* BOOK IMAGE */}
                    <Link
                      href={`/books/${item.slug}`}
                      className="shrink-0"
                    >
                      <div className="flex h-32 w-24 items-center justify-center overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-28">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-10 w-10 text-slate-300" />
                        )}
                      </div>
                    </Link>

                    {/* BOOK INFO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/books/${item.slug}`}
                          >
                            <h2 className="line-clamp-2 text-base font-semibold text-slate-900 transition hover:text-slate-600 sm:text-lg">
                              {item.title}
                            </h2>
                          </Link>

                          {item.author && (
                            <p className="mt-1 truncate text-sm text-slate-500">
                              by {item.author}
                            </p>
                          )}
                        </div>

                        {/* REMOVE */}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            removeItem(
                              item.book
                            )
                          }
                          aria-label={`Remove ${item.title} from cart`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* PRICE */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(
                            item.price
                          )}
                        </span>

                        {comparePrice >
                          Number(
                            item.price || 0
                          ) && (
                          <span className="text-sm text-slate-400 line-through">
                            {formatPrice(
                              comparePrice
                            )}
                          </span>
                        )}
                      </div>

                      {/* QUANTITY + TOTAL */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex h-10 items-center overflow-hidden rounded-lg border border-slate-200">
                          {/* MINUS */}
                          <button
                            type="button"
                            disabled={
                              busy ||
                              item.quantity <=
                                1
                            }
                            onClick={() =>
                              updateQuantity(
                                item.book,
                                item.quantity -
                                  1
                              )
                            }
                            className="flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          {/* QUANTITY */}
                          <span className="flex h-full min-w-10 items-center justify-center border-x border-slate-200 px-2 text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </span>

                          {/* PLUS */}
                          <button
                            type="button"
                            disabled={
                              busy ||
                              item.quantity >=
                                item.stock
                            }
                            onClick={() =>
                              updateQuantity(
                                item.book,
                                item.quantity +
                                  1
                              )
                            }
                            className="flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* ITEM TOTAL */}
                        <p className="text-base font-bold text-slate-900">
                          {formatPrice(
                            itemTotal
                          )}
                        </p>
                      </div>

                      {/* STOCK */}
                      {item.quantity >=
                        item.stock && (
                        <p className="mt-2 text-xs font-medium text-orange-600">
                          Maximum available
                          quantity reached.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {/* CONTINUE SHOPPING */}
            <div className="pt-2">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDEBAR
              ================================================== */}
          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="space-y-4">

              {/* ORDER SUMMARY */}
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="border-b px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-3 p-5">
                  {/* SUBTOTAL */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-900">
                      {formatPrice(
                        subtotal
                      )}
                    </span>
                  </div>

                  {/* DISCOUNT */}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Discount
                      </span>

                      <span className="font-medium text-green-600">
                        -
                        {formatPrice(
                          discount
                        )}
                      </span>
                    </div>
                  )}

                  {/* SHIPPING */}
                  {shipping > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Shipping
                      </span>

                      <span className="font-medium text-slate-900">
                        {formatPrice(
                          shipping
                        )}
                      </span>
                    </div>
                  )}

                  {/* TOTAL */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Total
                      </span>

                      <span className="text-2xl font-bold text-slate-900">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* CHECKOUT */}
                  <Link
                    href="/checkout"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Proceed to Checkout

                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* DELIVERY + SECURITY */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="space-y-5">

                  {/* DELIVERY */}
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Truck className="h-4 w-4 text-slate-700" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Delivery
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Delivery details are
                        handled during checkout.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* SECURITY */}
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <ShieldCheck className="h-4 w-4 text-slate-700" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Secure Checkout
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your checkout information
                        is protected.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}