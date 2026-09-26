"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Book = {
  _id?: string;
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  author?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  imageUrl?: string;
  coverImage?: string;
};

type Category = {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
};

function extractArray<T>(value: unknown, key?: string): T[] {
  if (Array.isArray(value)) return value as T[];

  if (
    value &&
    typeof value === "object" &&
    key &&
    key in value &&
    Array.isArray((value as Record<string, unknown>)[key])
  ) {
    return (value as Record<string, T[]>)[key];
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }

  return [];
}

function getBookId(book: Book) {
  return String(book._id ?? book.id ?? book.slug ?? "");
}

function getBookTitle(book: Book) {
  return book.title ?? book.name ?? "";
}

function getBookImage(book: Book) {
  return book.image ?? book.imageUrl ?? book.coverImage ?? "";
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  const [booksLoading, setBooksLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [booksError, setBooksError] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchBooks() {
      try {
        const response = await fetch("/api/books", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to fetch books");
        }

        const data = await response.json();
        const result = extractArray<Book>(data, "books");

        if (mounted) {
          setBooks(result);
          setBooksError(false);
        }
      } catch {
        if (mounted) {
          setBooks([]);
          setBooksError(true);
        }
      } finally {
        if (mounted) {
          setBooksLoading(false);
        }
      }
    }

    fetchBooks();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to fetch categories");
        }

        const data = await response.json();
        const result = extractArray<Category>(data, "categories");

        if (mounted) {
          setCategories(result);
          setCategoriesError(false);
        }
      } catch {
        if (mounted) {
          setCategories([]);
          setCategoriesError(true);
        }
      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredBooks = useMemo(() => books.slice(0, 8), [books]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      window.location.href = "/search";
      return;
    }

    window.location.href = `/search?q=${encodeURIComponent(value)}`;
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* ========================= HEADER ========================= */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[82px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">

          {/* BRAND */}
          <Link
            href="/"
            aria-label="studystow.com home"
            className="group flex shrink-0 items-center"
          >
            <div className="flex items-center">
              <span className="text-[24px] font-black tracking-[-0.06em] sm:text-[27px]">
                studystow
              </span>

              <span className="ml-1 text-[13px] font-semibold tracking-[-0.02em] text-black/55 sm:text-[14px]">
                .com
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="/"
              className="text-[14px] font-medium transition hover:opacity-50"
            >
              Home
            </Link>

            <Link
              href="/books"
              className="text-[14px] font-medium transition hover:opacity-50"
            >
              Books
            </Link>

            <Link
              href="/category"
              className="text-[14px] font-medium transition hover:opacity-50"
            >
              Categories
            </Link>

            <Link
              href="/wishlist"
              className="text-[14px] font-medium transition hover:opacity-50"
            >
              Wishlist
            </Link>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden h-10 items-center justify-center border border-black px-5 text-[13px] font-semibold transition hover:bg-black hover:text-white sm:flex"
            >
              Login
            </Link>

            <Link
              href="/cart"
              className="flex h-10 items-center justify-center border border-black bg-black px-5 text-[13px] font-semibold text-white transition hover:bg-white hover:text-black"
            >
              Cart
            </Link>
          </div>
        </div>

        {/* MOBILE NAV */}
        <div className="border-t border-black/10 lg:hidden">
          <nav className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-5 py-3 sm:px-8">
            <Link
              href="/"
              className="whitespace-nowrap text-[13px] font-medium"
            >
              Home
            </Link>

            <Link
              href="/books"
              className="whitespace-nowrap text-[13px] font-medium"
            >
              Books
            </Link>

            <Link
              href="/category"
              className="whitespace-nowrap text-[13px] font-medium"
            >
              Categories
            </Link>

            <Link
              href="/wishlist"
              className="whitespace-nowrap text-[13px] font-medium"
            >
              Wishlist
            </Link>

            <Link
              href="/login"
              className="whitespace-nowrap text-[13px] font-medium"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* ========================= HERO ========================= */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid min-h-[620px] max-w-[1440px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-24">

          {/* HERO LEFT */}
          <div>
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-black" />
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/50">
                studystow.com
              </span>
            </div>

            <h1 className="max-w-4xl text-[52px] font-black leading-[0.94] tracking-[-0.055em] sm:text-[68px] lg:text-[86px]">
              Find books.
              <br />
              Read more.
              <br />
              Keep growing.
            </h1>

            <p className="mt-8 max-w-[650px] text-[15px] leading-7 text-black/60 sm:text-[17px]">
              Explore the books available on studystow.com, search the
              catalogue, discover categories, and manage your shopping
              experience from one place.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/books"
                className="inline-flex h-12 items-center justify-center border border-black bg-black px-7 text-[13px] font-bold text-white transition hover:bg-white hover:text-black"
              >
                Explore Books
              </Link>

              <Link
                href="/category"
                className="inline-flex h-12 items-center justify-center border border-black bg-white px-7 text-[13px] font-bold transition hover:bg-black hover:text-white"
              >
                Explore Categories
              </Link>
            </div>
          </div>

          {/* SEARCH PANEL */}
          <div className="border border-black bg-black p-7 text-white sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
              Search the catalogue
            </p>

            <h2 className="mt-5 text-[32px] font-bold leading-tight tracking-[-0.04em]">
              What are you
              <br />
              looking for?
            </h2>

            <p className="mt-4 text-[14px] leading-6 text-white/55">
              Search the currently available StudyStow catalogue.
            </p>

            <form onSubmit={handleSearch} className="mt-8">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search books..."
                className="h-13 w-full border border-white/25 bg-white px-4 text-sm text-black outline-none placeholder:text-black/40 focus:border-white"
                aria-label="Search books"
              />

              <button
                type="submit"
                className="mt-3 h-12 w-full border border-white bg-white px-6 text-[13px] font-bold text-black transition hover:bg-black hover:text-white"
              >
                Search Catalogue
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ========================= TRUST / INFO STRIP ========================= */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid max-w-[1440px] divide-y divide-black/10 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-10">

          <div className="px-0 py-7 md:px-8 md:first:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
              01
            </p>
            <h3 className="mt-2 text-[17px] font-bold">
              Browse the catalogue
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-black/55">
              View the books currently available through the connected store
              catalogue.
            </p>
          </div>

          <div className="px-0 py-7 md:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
              02
            </p>
            <h3 className="mt-2 text-[17px] font-bold">
              Search what you need
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Search directly through the available books using the store
              search.
            </p>
          </div>

          <div className="px-0 py-7 md:px-8 md:last:pr-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
              03
            </p>
            <h3 className="mt-2 text-[17px] font-bold">
              Manage your account
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Access your account, wishlist, cart and available order
              functionality.
            </p>
          </div>
        </div>
      </section>

      {/* ========================= BOOKS ========================= */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
                Catalogue
              </p>

              <h2 className="mt-4 text-[38px] font-black tracking-[-0.045em] sm:text-[48px]">
                Latest books
              </h2>
            </div>

            <Link
              href="/books"
              className="w-fit border-b border-black pb-1 text-[13px] font-bold"
            >
              View all books →
            </Link>
          </div>

          {booksLoading ? (
            <div className="mt-12 border border-black/10 p-10 text-sm text-black/50">
              Loading catalogue...
            </div>
          ) : booksError ? (
            <div className="mt-12 border border-black/10 p-10">
              <p className="font-semibold">
                Catalogue unavailable.
              </p>
              <p className="mt-2 text-sm text-black/50">
                Books could not be loaded from the configured API.
              </p>
            </div>
          ) : featuredBooks.length === 0 ? (
            <div className="mt-12 border border-dashed border-black/20 p-14 text-center">
              <p className="text-lg font-semibold">
                No books available yet.
              </p>
              <p className="mt-2 text-sm text-black/50">
                Books added to the connected catalogue will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBooks.map((book) => {
                const title = getBookTitle(book);
                const id = getBookId(book);
                const image = getBookImage(book);

                const href = book.slug
                  ? `/books/${book.slug}`
                  : id
                    ? `/books/${id}`
                    : "/books";

                return (
                  <Link
                    key={id || title}
                    href={href}
                    className="group border border-black/10 transition hover:border-black"
                  >
                    <div className="aspect-[3/4] overflow-hidden border-b border-black/10 bg-black/[0.025]">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={title || "Book cover"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-center text-sm text-black/35">
                          No cover image
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="min-h-[48px] text-[15px] font-bold leading-6">
                        {title || "Untitled book"}
                      </h3>

                      {book.author ? (
                        <p className="mt-2 truncate text-[13px] text-black/50">
                          {book.author}
                        </p>
                      ) : null}

                      {typeof book.salePrice === "number" ? (
                        <p className="mt-5 text-[14px] font-bold">
                          {book.salePrice}
                        </p>
                      ) : typeof book.price === "number" ? (
                        <p className="mt-5 text-[14px] font-bold">
                          {book.price}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================= CATEGORIES ========================= */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
                Discover
              </p>

              <h2 className="mt-4 text-[38px] font-black tracking-[-0.045em] sm:text-[48px]">
                Shop by category
              </h2>
            </div>

            <Link
              href="/category"
              className="w-fit border-b border-black pb-1 text-[13px] font-bold"
            >
              View all categories →
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="mt-12 border border-black/10 p-10 text-sm text-black/50">
              Loading categories...
            </div>
          ) : categoriesError ? (
            <div className="mt-12 border border-black/10 p-10">
              <p className="font-semibold">
                Categories unavailable.
              </p>

              <p className="mt-2 text-sm text-black/50">
                Category data could not be loaded from the configured API.
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="mt-12 border border-dashed border-black/20 p-14 text-center">
              <p className="text-lg font-semibold">
                No categories available yet.
              </p>

              <p className="mt-2 text-sm text-black/50">
                Categories created in the catalogue will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => {
                const name = category.name ?? category.title ?? "";
                const slug =
                  category.slug ?? category._id ?? category.id ?? "";

                return (
                  <Link
                    key={slug || name}
                    href={`/category/${slug}`}
                    className="group border border-black/10 p-7 transition hover:bg-black hover:text-white"
                  >
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p className="text-[18px] font-bold">
                          {name || "Unnamed category"}
                        </p>

                        <p className="mt-3 text-[12px] text-black/45 transition group-hover:text-white/55">
                          Explore category
                        </p>
                      </div>

                      <span className="text-xl">↗</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================= FEATURE PANEL ========================= */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid max-w-[1440px] gap-0 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">

          <div className="border-b border-black/10 py-16 lg:border-b-0 lg:border-r lg:pr-14 lg:py-24">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
              Your account
            </p>

            <h2 className="mt-5 max-w-xl text-[38px] font-black leading-tight tracking-[-0.045em] sm:text-[50px]">
              Everything in one place.
            </h2>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-black/55">
              Use your StudyStow account to access the functionality available
              for your shopping and order experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center border border-black bg-black px-6 text-[13px] font-bold text-white transition hover:bg-white hover:text-black"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center border border-black px-6 text-[13px] font-bold transition hover:bg-black hover:text-white"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="py-16 lg:pl-14 lg:py-24">
            <div className="grid gap-8 sm:grid-cols-2">
              <Link
                href="/wishlist"
                className="group border-b border-black/15 pb-7"
              >
                <span className="text-2xl">♡</span>

                <h3 className="mt-5 text-[18px] font-bold">
                  Wishlist
                </h3>

                <p className="mt-2 text-[13px] leading-6 text-black/50">
                  Keep track of books you want to revisit.
                </p>

                <span className="mt-5 inline-block text-[12px] font-bold">
                  Open wishlist →
                </span>
              </Link>

              <Link
                href="/cart"
                className="group border-b border-black/15 pb-7"
              >
                <span className="text-2xl">□</span>

                <h3 className="mt-5 text-[18px] font-bold">
                  Shopping Cart
                </h3>

                <p className="mt-2 text-[13px] leading-6 text-black/50">
                  Review the books currently added to your cart.
                </p>

                <span className="mt-5 inline-block text-[12px] font-bold">
                  Open cart →
                </span>
              </Link>

              <Link
                href="/account/orders"
                className="group border-b border-black/15 pb-7"
              >
                <span className="text-2xl">↔</span>

                <h3 className="mt-5 text-[18px] font-bold">
                  Orders
                </h3>

                <p className="mt-2 text-[13px] leading-6 text-black/50">
                  Access your order area from your account.
                </p>

                <span className="mt-5 inline-block text-[12px] font-bold">
                  View orders →
                </span>
              </Link>

              <Link
                href="/contact"
                className="group border-b border-black/15 pb-7"
              >
                <span className="text-2xl">?</span>

                <h3 className="mt-5 text-[18px] font-bold">
                  Support
                </h3>

                <p className="mt-2 text-[13px] leading-6 text-black/50">
                  Use the available support and information pages.
                </p>

                <span className="mt-5 inline-block text-[12px] font-bold">
                  Contact →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= CTA ========================= */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-4xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
              studystow.com
            </p>

            <h2 className="mt-5 text-[46px] font-black leading-none tracking-[-0.055em] sm:text-[66px]">
              Your next book
              <br />
              starts here.
            </h2>

            <p className="mt-7 max-w-2xl text-[15px] leading-7 text-white/55">
              Explore the current catalogue and discover what is available on
              studystow.com.
            </p>

            <Link
              href="/books"
              className="mt-9 inline-flex h-12 items-center justify-center border border-white bg-white px-7 text-[13px] font-bold text-black transition hover:bg-black hover:text-white"
            >
              Explore Books
            </Link>
          </div>
        </div>
      </section>

      {/* ========================= FOOTER ========================= */}
      <footer className="bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-10">

          <div className="grid gap-12 md:grid-cols-4">

            {/* FOOTER BRAND */}
            <div className="md:col-span-1">
              <Link
                href="/"
                className="inline-flex items-baseline"
                aria-label="studystow.com home"
              >
                <span className="text-[23px] font-black tracking-[-0.06em]">
                  studystow
                </span>

                <span className="ml-1 text-[12px] font-semibold text-black/50">
                  .com
                </span>
              </Link>

              <p className="mt-5 max-w-xs text-[13px] leading-6 text-black/50">
                Online bookstore storefront for the StudyStow catalogue.
              </p>
            </div>

            {/* STORE */}
            <div>
              <h3 className="text-[13px] font-bold">Store</h3>

              <div className="mt-5 space-y-3 text-[13px] text-black/55">
                <Link href="/books" className="block hover:text-black">
                  Books
                </Link>

                <Link href="/category" className="block hover:text-black">
                  Categories
                </Link>

                <Link href="/wishlist" className="block hover:text-black">
                  Wishlist
                </Link>

                <Link href="/cart" className="block hover:text-black">
                  Cart
                </Link>
              </div>
            </div>

            {/* ACCOUNT */}
            <div>
              <h3 className="text-[13px] font-bold">Account</h3>

              <div className="mt-5 space-y-3 text-[13px] text-black/55">
                <Link href="/login" className="block hover:text-black">
                  Login
                </Link>

                <Link href="/register" className="block hover:text-black">
                  Register
                </Link>

                <Link href="/account" className="block hover:text-black">
                  My Account
                </Link>

                <Link
                  href="/account/orders"
                  className="block hover:text-black"
                >
                  Orders
                </Link>
              </div>
            </div>

            {/* INFORMATION */}
            <div>
              <h3 className="text-[13px] font-bold">Information</h3>

              <div className="mt-5 space-y-3 text-[13px] text-black/55">
                <Link href="/about" className="block hover:text-black">
                  About
                </Link>

                <Link href="/contact" className="block hover:text-black">
                  Contact
                </Link>

                <Link href="/faq" className="block hover:text-black">
                  FAQ
                </Link>

                <Link
                  href="/privacy-policy"
                  className="block hover:text-black"
                >
                  Privacy Policy
                </Link>

                <Link
                  href="/terms-and-conditions"
                  className="block hover:text-black"
                >
                  Terms & Conditions
                </Link>

                <Link
                  href="/refund-policy"
                  className="block hover:text-black"
                >
                  Refund Policy
                </Link>

                <Link
                  href="/shipping-policy"
                  className="block hover:text-black"
                >
                  Shipping Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-black/40">
              © {new Date().getFullYear()} studystow.com
            </p>

            <p className="text-[11px] text-black/40">
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}