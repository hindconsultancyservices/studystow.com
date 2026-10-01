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
  Menu,
  X,
  BookOpen,
  Home,
  Grid2X2,
  HelpCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  FileText,
  Info,
  Mail,
  UserCircle,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        throw new Error(`Cart request failed: ${response.status}`);
      }

      const data: CartResponse = await response.json();

      /*
       * Prefer server-calculated itemCount.
       */
      if (
        typeof data.itemCount === "number" &&
        Number.isFinite(data.itemCount)
      ) {
        setCartCount(Math.max(0, data.itemCount));
        return;
      }

      /*
       * Fallback if API doesn't return itemCount.
       */
      if (Array.isArray(data.items)) {
        const total = data.items.reduce((sum, item) => {
          const quantity = Number(item?.quantity ?? 0);

          return (
            sum +
            (Number.isFinite(quantity) && quantity > 0 ? quantity : 0)
          );
        }, 0);

        setCartCount(total);
        return;
      }

      setCartCount(0);
    } catch (error) {
      console.error("Failed to load cart count:", error);
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
     */
    function handleCartUpdate() {
      loadCartCount();
    }

    /*
     * Refresh cart when user returns to tab.
     */
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
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

  /*
   * Lock page scrolling while mobile menu is open.
   */
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /*
   * Close mobile menu when navigating.
   */
  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const isLoggedIn = status === "authenticated";

  return (
    <header className="sticky top-0 z-[100] border-b bg-white">

      {/* ======================================================
          HEADER TOP ROW
          ====================================================== */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">

        {/* ====================================================
            MOBILE MENU BUTTON
            ==================================================== */}
        <button
          type="button"
          aria-label={
            mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-700
            transition
            hover:bg-slate-50
            hover:text-slate-950
            md:hidden
          "
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* ====================================================
            LOGO
            ==================================================== */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="StudyStow Home"
          onClick={closeMobileMenu}
        >
          <span
            role="img"
            aria-label="Studystow.com"
            className="
              block
              h-14
              w-[155px]
              bg-[#155DFC]
              sm:h-20
              sm:w-[220px]
            "
            style={{
              maskImage: "url('/images/logo/logo.png')",
              WebkitMaskImage: "url('/images/logo/logo.png')",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "left center",
              WebkitMaskPosition: "left center",
              maskSize: "contain",
              WebkitMaskSize: "contain",
            }}
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
            DESKTOP SEARCH
            ==================================================== */}
        <form
          action="/search"
          className="ml-auto hidden w-full max-w-md md:block"
        >
          <div className="relative">

            <Search
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="search"
              name="q"
              placeholder="Search books..."
              className="
                h-10
                w-full
                rounded-xl
                border
                bg-slate-50
                pl-10
                pr-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-slate-400
                focus:bg-white
              "
            />

          </div>
        </form>

        {/* ====================================================
            RIGHT SIDE ACTIONS
            ==================================================== */}
        <div className="ml-auto flex items-center gap-0.5 md:ml-0 md:gap-1">

          {/* ==================================================
              WISHLIST
              Desktop only
              ================================================== */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="
              hidden
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-600
              transition
              hover:bg-slate-50
              hover:text-slate-900
              sm:flex
              sm:h-10
              sm:w-10
              sm:rounded-xl
            "
          >
            <Heart className="h-5 w-5" />
          </Link>

          {/* ==================================================
              CART
              ================================================== */}
          <Link
            href="/cart"
            aria-label={`Shopping Cart${
              cartCount > 0 ? `, ${cartCount} items` : ""
            }`}
            className="
              relative
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-600
              transition
              hover:bg-slate-50
              hover:text-slate-900
              sm:h-10
              sm:w-10
              sm:rounded-xl
            "
          >
            <ShoppingCart className="h-5 w-5" />

            {!cartLoading && cartCount > 0 && (
              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  flex
                  min-h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  px-1
                  text-[10px]
                  font-bold
                  leading-none
                  text-white
                "
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* ==================================================
              MOBILE ACCOUNT
              ================================================== */}
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            aria-label={isLoggedIn ? "Account" : "Log in"}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-600
              transition
              hover:bg-slate-50
              hover:text-slate-900
              sm:hidden
            "
          >
            <User className="h-5 w-5" />
          </Link>

          {/* ==================================================
              DESKTOP CUSTOMER AUTH
              ================================================== */}
          {status === "loading" ? (
            <div
              className="
                hidden
                h-10
                w-24
                animate-pulse
                rounded-xl
                bg-slate-100
                sm:block
              "
            />
          ) : isLoggedIn ? (
            <Link
              href="/account"
              className="
                hidden
                h-10
                items-center
                gap-2
                rounded-xl
                px-3
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-50
                hover:text-slate-900
                sm:flex
              "
            >
              <User className="h-4 w-4" />
              Account
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">

              <Link
                href="/login"
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  px-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:border-slate-300
                  hover:bg-slate-50
                  hover:text-slate-900
                "
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>

              <Link
                href="/register"
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  bg-slate-900
                  px-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800
                "
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
      <div
        className="
          border-t
          bg-white
          px-3
          py-2.5
          md:hidden
        "
      >
        <form action="/search">

          <div className="relative">

            <Search
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="search"
              name="q"
              placeholder="Search books..."
              className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-slate-400
                focus:bg-white
              "
            />

          </div>

        </form>
      </div>

      {/* ======================================================
          MOBILE MENU OVERLAY + DRAWER
          ====================================================== */}
          {mobileMenuOpen && (
          <div className="fixed inset-0 z-[110] md:hidden">

          {/* ==================================================
              BACKDROP
              ================================================== */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
            className="
              absolute
              inset-0
              bg-slate-950/40
              backdrop-blur-[2px]
            "
          />

          {/* ==================================================
              MENU PANEL
              ================================================== */}
          <aside
            className="
            absolute
            left-0
            top-0
            z-[120]
            flex
            h-full
            w-[88%]
            max-w-sm
            flex-col
            bg-white
            shadow-2xl
          "
          >

            {/* ==================================================
                MENU HEADER
                ================================================== */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">

              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center"
              >
                <span
                  role="img"
                  aria-label="Studystow.com"
                  className="
                    block
                    h-10
                    w-[130px]
                    bg-[#155DFC]
                  "
                  style={{
                    maskImage: "url('/images/logo/logo.png')",
                    WebkitMaskImage: "url('/images/logo/logo.png')",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "left center",
                    WebkitMaskPosition: "left center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                />
              </Link>

              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-600
                  transition
                  hover:bg-slate-100
                  hover:text-slate-950
                "
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* ==================================================
                MENU CONTENT
                ================================================== */}
            <div className="flex-1 overflow-y-auto pb-6">

              {/* ==================================================
                  PRIMARY SHOP LINKS
                  ================================================== */}
              <div className="border-b px-3 py-3">

                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Shop
                </p>

                {/* BOOKS */}
                <Link
                  href="/books"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    bg-slate-950
                    px-3
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    active:scale-[0.99]
                  "
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <BookOpen className="h-4 w-4" />
                  </span>

                  <span>Books</span>
                </Link>

                {/* CATEGORIES */}
                <Link
                  href="/category"
                  onClick={closeMobileMenu}
                  className="
                    mt-2
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3.5
                    text-sm
                    font-semibold
                    text-slate-800
                    transition
                    hover:bg-slate-50
                    active:bg-slate-100
                  "
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Grid2X2 className="h-4 w-4 text-slate-700" />
                  </span>

                  <span>Categories</span>
                </Link>

              </div>

              {/* ==================================================
                  QUICK ACCESS
                  ================================================== */}
              <div className="border-b px-3 py-3">

                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Quick Access
                </p>

                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <Home className="h-4 w-4 text-slate-500" />
                  Home
                </Link>

                <Link
                  href="/search"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <Search className="h-4 w-4 text-slate-500" />
                  Search Books
                </Link>

                <Link
                  href="/wishlist"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <Heart className="h-4 w-4 text-slate-500" />
                  Wishlist
                </Link>

                <Link
                  href={isLoggedIn ? "/account" : "/login"}
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <UserCircle className="h-4 w-4 text-slate-500" />
                  {isLoggedIn ? "My Account" : "Log in"}
                </Link>

              </div>

              {/* ==================================================
                  INFORMATION
                  ================================================== */}
              <div className="border-b px-3 py-3">

                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Information
                </p>

                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <Info className="h-4 w-4 text-slate-500" />
                  About Us
                </Link>

                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <Mail className="h-4 w-4 text-slate-500" />
                  Contact Us
                </Link>

                <Link
                  href="/faq"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <HelpCircle className="h-4 w-4 text-slate-500" />
                  FAQ
                </Link>

              </div>

              {/* ==================================================
                  CUSTOMER SUPPORT
                  ================================================== */}
              <div className="px-3 py-3">

                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Customer Support
                </p>

                <Link
                  href="/shipping-policy"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <Truck className="h-4 w-4 text-slate-500" />
                  Shipping Policy
                </Link>

                <Link
                  href="/refund-policy"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <RotateCcw className="h-4 w-4 text-slate-500" />
                  Refund Policy
                </Link>

                <Link
                  href="/privacy-policy"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  Privacy Policy
                </Link>

                <Link
                  href="/terms-and-conditions"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  Terms & Conditions
                </Link>

              </div>

            </div>
          </aside>
        </div>
      )}
    </header>
  );
}