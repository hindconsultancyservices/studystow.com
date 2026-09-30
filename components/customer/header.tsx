"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
} from "lucide-react";

type CartResponse = {
  items?: Array<{
    quantity?: number;
  }>;
  itemCount?: number;
};

export default function Header() {
  const { data: session, status } = useSession();

  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  async function loadCartCount() {
    /*
     * No logged-in user = no personal MongoDB cart.
     */
    if (status !== "authenticated") {
      setCartCount(0);
      return;
    }

    try {
      setCartLoading(true);

      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.status === 401) {
        setCartCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Cart request failed: ${response.status}`
        );
      }

      const data: CartResponse =
        await response.json();

      /*
       * Prefer server-calculated itemCount.
       * This comes directly from MongoDB-backed /api/cart.
       */
      if (
        typeof data.itemCount === "number" &&
        Number.isFinite(data.itemCount)
      ) {
        setCartCount(
          Math.max(0, data.itemCount)
        );
        return;
      }

      /*
       * Fallback if API doesn't return itemCount.
       */
      if (Array.isArray(data.items)) {
        const total = data.items.reduce(
          (sum, item) => {
            const quantity = Number(
              item?.quantity ?? 0
            );

            return (
              sum +
              (Number.isFinite(quantity) &&
              quantity > 0
                ? quantity
                : 0)
            );
          },
          0
        );

        setCartCount(total);
        return;
      }

      setCartCount(0);
    } catch (error) {
      console.error(
        "Failed to load cart count:",
        error
      );

      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    loadCartCount();

    /*
     * Same-tab cart updates.
     *
     * BookDetails dispatches:
     * studystow-cart-updated
     */
    function handleCartUpdate() {
      loadCartCount();
    }

    /*
     * When user returns to the tab/page,
     * refresh the database cart count.
     */
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible"
      ) {
        loadCartCount();
      }
    }

    window.addEventListener(
      "studystow-cart-updated",
      handleCartUpdate
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "studystow-cart-updated",
        handleCartUpdate
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [status, session?.user?.id]);

  const isLoggedIn =
    status === "authenticated";

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      {/* ======================================================
          HEADER CONTAINER
          ====================================================== */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* ====================================================
            LOGO
            ==================================================== */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="StudyStow Home"
        >
          <img
            src="/images/logo/logo.png"
            alt="StudyStow"
            className="h-10 w-auto object-contain sm:h-11"
          />
        </Link>

        {/* ====================================================
            DESKTOP NAVIGATION
            ==================================================== */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Home
          </Link>

          <Link
            href="/books"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Books
          </Link>

          <Link
            href="/category"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Categories
          </Link>
        </nav>

        {/* ====================================================
            SEARCH
            ==================================================== */}
        <form
          action="/search"
          className="ml-auto hidden w-full max-w-md md:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              name="q"
              placeholder="Search books..."
              className="h-10 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>
        </form>

        {/* ====================================================
            RIGHT SIDE ACTIONS
            ==================================================== */}
        <div className="flex items-center gap-1">

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Heart className="h-5 w-5" />
          </Link>

          {/* ==================================================
              CART
              ================================================== */}
          <Link
            href="/cart"
            aria-label={`Shopping Cart${
              cartCount > 0
                ? `, ${cartCount} items`
                : ""
            }`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ShoppingCart className="h-5 w-5" />

            {!cartLoading &&
              cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold leading-none text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
          </Link>

          {/* ==================================================
              CUSTOMER AUTH
              ================================================== */}

          {status === "loading" ? (
            <div className="hidden h-10 w-24 animate-pulse rounded-xl bg-slate-100 sm:block" />
          ) : isLoggedIn ? (
            <Link
              href="/account/profile"
              className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 sm:flex"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>

              <Link
                href="/register"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          MOBILE SEARCH
          ====================================================== */}
      <div className="border-t bg-white px-4 py-3 md:hidden sm:px-6">
        <form action="/search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              name="q"
              placeholder="Search books..."
              className="h-10 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>
        </form>
      </div>

      {/* ======================================================
          MOBILE AUTH
          ====================================================== */}
      <div className="flex items-center justify-center gap-2 border-t bg-white px-4 py-3 sm:hidden">
        {status === "loading" ? (
          <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-100" />
        ) : isLoggedIn ? (
          <Link
            href="/account/profile"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>

            <Link
              href="/register"
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}