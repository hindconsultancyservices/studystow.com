// ============================================================
// CUSTOMER HEADER
// ============================================================

import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
} from "lucide-react";

export default function Header() {
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
          className="shrink-0 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
        >
          StudyStow
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

            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />

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


          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>


          {/* Account */}
          <Link
            href="/account"
            className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 sm:flex"
          >
            <User className="h-4 w-4" />
            Account
          </Link>

        </div>

      </div>


      {/* ======================================================
          MOBILE SEARCH
          ====================================================== */}

      <div className="border-t bg-white px-4 py-3 md:hidden sm:px-6">

        <form action="/search">

          <div className="relative">

            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              name="q"
              placeholder="Search books..."
              className="h-10 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />

          </div>

        </form>

      </div>

    </header>
  );
}