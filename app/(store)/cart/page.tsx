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

type CartItem = {
  id: string;
  title: string;
  slug: string;
  author?: string;
  price: number;
  compareAtPrice?: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  stock?: number;
};

const CART_KEY = "studystow-cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (!savedCart) {
        setItems([]);
        return;
      }

      const parsed = JSON.parse(savedCart);

      setItems(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }

  function saveCart(updatedItems: CartItem[]) {
    setItems(updatedItems);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(updatedItems)
    );
  }

  function increaseQuantity(id: string) {
    const updatedItems = items.map((item) => {
      if (item.id !== id) return item;

      const maxStock = item.stock ?? 99;

      return {
        ...item,
        quantity: Math.min(
          item.quantity + 1,
          maxStock
        ),
      };
    });

    saveCart(updatedItems);
  }

  function decreaseQuantity(id: string) {
    const updatedItems = items
      .map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          quantity: item.quantity - 1,
        };
      })
      .filter((item) => item.quantity > 0);

    saveCart(updatedItems);
  }

  function removeItem(id: string) {
    saveCart(
      items.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    setItems([]);
  }

  const subtotal = items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const discount =
    subtotal >= 1000 ? 200 : 0;

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 999
        ? 0
        : 49;

  const total =
    subtotal - discount + shipping;

  const totalItems = items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const remainingForFreeShipping =
    Math.max(0, 999 - subtotal);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="border-b bg-white">
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

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="border-b bg-white">
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
              Looks like you haven&apos;t added any
              books to your cart yet.
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <section className="border-b bg-white">
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
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}{" "}
                  in your cart
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT - CART ITEMS */}
          <div className="min-w-0 space-y-4">
            {items.map((item) => {
              const itemTotal =
                item.price * item.quantity;

              const maxStock =
                item.stock ?? 99;

              const comparePrice =
                item.compareAtPrice ??
                item.originalPrice;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >
                  <div className="flex gap-4">
                    {/* IMAGE */}
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

                    {/* DETAILS */}
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

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.id)
                          }
                          aria-label={`Remove ${item.title} from cart`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* PRICE */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">
                          ₹
                          {item.price.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        {comparePrice &&
                          comparePrice > item.price && (
                            <span className="text-sm text-slate-400 line-through">
                              ₹
                              {comparePrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}
                      </div>

                      {/* QUANTITY + TOTAL */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex h-10 items-center overflow-hidden rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                            className="flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="flex h-full min-w-10 items-center justify-center border-x border-slate-200 px-2 text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.id
                              )
                            }
                            disabled={
                              item.quantity >=
                              maxStock
                            }
                            className="flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="text-base font-bold text-slate-900">
                          ₹
                          {itemTotal.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      {item.stock !== undefined &&
                        item.quantity >=
                          item.stock && (
                          <p className="mt-2 text-xs font-medium text-orange-600">
                            Maximum available quantity reached.
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

          {/* RIGHT COLUMN */}
          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="space-y-4">
              {/* ORDER SUMMARY */}
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="border-b bg-white px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-900">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Discount
                    </span>

                    <span className="font-medium text-green-600">
                      {discount > 0
                        ? `-₹${discount.toLocaleString(
                            "en-IN"
                          )}`
                        : "₹0"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Shipping
                    </span>

                    <span
                      className={
                        shipping === 0
                          ? "font-semibold text-green-600"
                          : "font-medium text-slate-900"
                      }
                    >
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping}`}
                    </span>
                  </div>

                  {/* FREE SHIPPING PROGRESS */}
                  {subtotal < 999 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start gap-2">
                        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />

                        <p className="text-xs leading-5 text-slate-600">
                          Add{" "}
                          <span className="font-bold text-slate-900">
                            ₹
                            {remainingForFreeShipping.toLocaleString(
                              "en-IN"
                            )}
                          </span>{" "}
                          more to get{" "}
                          <span className="font-semibold text-slate-900">
                            FREE delivery
                          </span>
                          .
                        </p>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all"
                          style={{
                            width: `${Math.min(
                              (subtotal / 999) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                        <span>₹0</span>
                        <span>₹999</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />

                        <p className="text-xs font-semibold text-green-700">
                          You&apos;ve unlocked FREE delivery!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TOTAL */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Total
                      </span>

                      <span className="text-2xl font-bold text-slate-900">
                        ₹
                        {total.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-right text-xs text-slate-400">
                      Inclusive of applicable taxes
                    </p>
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

              {/* BENEFITS */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="space-y-5">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Truck className="h-4 w-4 text-slate-700" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Free Delivery
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Free delivery on orders above ₹999.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <ShieldCheck className="h-4 w-4 text-slate-700" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Secure Checkout
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your checkout information is protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRUST NOTE */}
              <div className="rounded-xl bg-slate-100 px-4 py-3 text-center">
                <p className="text-xs text-slate-500">
                  Safe & secure shopping with StudyStow
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}