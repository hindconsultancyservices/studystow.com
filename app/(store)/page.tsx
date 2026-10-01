"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Headphones,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
  featured?: boolean;
};

type Book = {
  _id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  stock: number;
  category?: {
    _id?: string;
    name?: string;
    slug?: string;
  } | null;
};

const benefits = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick & reliable delivery across India",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Safe and trusted checkout experience",
  },
  {
    icon: BookOpen,
    title: "Quality Books",
    description: "Carefully selected books for every reader",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "We're here whenever you need us",
  },
];

function getDiscount(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("en-IN");
}

export default function StorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHomepageData() {
      try {
        setLoading(true);
        setError("");

        const [booksResponse, categoriesResponse] = await Promise.all([
          fetch("/api/books?published=true&featured=true&limit=8", {
            cache: "no-store",
          }),
          fetch("/api/categories?active=true&limit=6", {
            cache: "no-store",
          }),
        ]);

        const booksText = await booksResponse.text();
        const categoriesText = await categoriesResponse.text();

        let booksResult: any = {};
        let categoriesResult: any = {};

        try {
          booksResult = booksText ? JSON.parse(booksText) : {};
        } catch {
          throw new Error("Invalid books API response.");
        }

        try {
          categoriesResult = categoriesText
            ? JSON.parse(categoriesText)
            : {};
        } catch {
          throw new Error("Invalid categories API response.");
        }

        if (!booksResponse.ok || !booksResult.success) {
          throw new Error(
            booksResult.message || "Failed to load books.",
          );
        }

        if (!categoriesResponse.ok || !categoriesResult.success) {
          throw new Error(
            categoriesResult.message || "Failed to load categories.",
          );
        }

        setFeaturedBooks(
          Array.isArray(booksResult.data) ? booksResult.data : [],
        );

        setCategories(
          Array.isArray(categoriesResult.data)
            ? categoriesResult.data
            : [],
        );
      } catch (err: any) {
        console.error("Homepage data error:", err);

        setError(
          err?.message || "Failed to load homepage data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomepageData();
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* =========================================================
          DESKTOP / TABLET HERO
          Hidden only on phones.
          Desktop design remains intact.
      ========================================================= */}
      <section className="hidden border-b bg-gradient-to-br from-slate-50 via-white to-blue-50 sm:block">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
          <div className="grid items-center gap-7 lg:grid-cols-2 lg:gap-16">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm sm:mb-5 sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Discover your next great read
              </div>

              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Books that help you{" "}
                <span className="text-blue-600">
                  learn, grow & achieve.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-7">
                Explore our collection of books on personal
                growth, finance, productivity, business,
                fiction and more.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:flex-row sm:gap-3">
                <Link
                  href="/books"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white transition hover:bg-slate-800 sm:px-6 sm:py-3.5 sm:text-sm"
                >
                  Explore Books
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>

                <Link
                  href="/books"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-6 sm:py-3.5 sm:text-sm"
                >
                  Browse Categories
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] text-slate-500 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3 sm:text-sm">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" />
                  Secure checkout
                </span>

                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 shrink-0 text-blue-600 sm:h-4 sm:w-4" />
                  Fast delivery
                </span>

                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-violet-600 sm:h-4 sm:w-4" />
                  Easy ordering
                </span>
              </div>
            </div>

            {/* Featured Preview */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-blue-100/50 blur-3xl" />

              <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:rounded-3xl sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 sm:text-sm">
                      Featured collection
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                      Read. Learn. Grow.
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white sm:h-12 sm:w-12 sm:rounded-2xl">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                {loading ? (
                  <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-2.5 sm:rounded-2xl sm:p-3"
                      >
                        <div className="aspect-[3/4] rounded-lg bg-slate-200 sm:rounded-xl" />
                        <div className="mt-2 h-3.5 rounded bg-slate-200 sm:mt-3 sm:h-4" />
                        <div className="mt-1.5 h-2.5 w-2/3 rounded bg-slate-200 sm:mt-2 sm:h-3" />
                      </div>
                    ))}
                  </div>
                ) : featuredBooks.length > 0 ? (
                  <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4">
                    {featuredBooks.slice(0, 4).map((book) => (
                      <Link
                        key={book._id}
                        href={`/books/${book.slug}`}
                        className="group rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 sm:rounded-2xl sm:p-3"
                      >
                        <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-slate-100 sm:rounded-xl">
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                          ) : (
                            <BookOpen className="h-8 w-8 text-slate-400 sm:h-10 sm:w-10" />
                          )}
                        </div>

                        <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-900 sm:mt-3 sm:text-sm">
                          {book.title}
                        </p>

                        <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 sm:text-xs">
                          {book.author}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center sm:mt-6 sm:rounded-2xl sm:px-5 sm:py-10">
                    <BookOpen className="mx-auto h-9 w-9 text-slate-300 sm:h-10 sm:w-10" />
                    <p className="mt-3 text-xs text-slate-500 sm:text-sm">
                      No featured books available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MOBILE BOOKSTORE HEADER
          No banner / slogan / promotional content.
      ========================================================= */}
      <section className="border-b bg-white sm:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                StudyStow
              </p>

              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950">
                Featured Books
              </h1>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-slate-700"
            >
              View all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          BENEFITS
          Desktop unchanged.
          Mobile kept compact.
      ========================================================= */}
      <section className="hidden border-b bg-white sm:block">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y px-0 sm:px-6 lg:grid-cols-4 lg:divide-y-0 lg:px-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="flex items-start gap-2.5 px-3 py-4 sm:gap-3 sm:px-6 sm:py-6 lg:px-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 sm:h-10 sm:w-10 sm:rounded-xl">
                  <Icon className="h-4 w-4 text-slate-700 sm:h-5 sm:w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-slate-900 sm:text-sm">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 hidden text-xs leading-5 text-slate-500 sm:block">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          MOBILE FEATURED BOOKS
          This appears before categories on phone.
      ========================================================= */}
      <section className="bg-slate-50 py-5 sm:hidden">
        <div className="px-3">

          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-600">
                Handpicked
              </p>

              <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-950">
                Featured Books
              </h2>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-600"
            >
              See all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700">
              {error}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-2.5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[3/4] bg-slate-200" />

                  <div className="space-y-2 p-2.5">
                    <div className="h-2.5 w-1/3 rounded bg-slate-200" />
                    <div className="h-4 rounded bg-slate-200" />
                    <div className="h-3 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {featuredBooks.map((book) => {
                const discount = getDiscount(
                  Number(book.price),
                  Number(book.compareAtPrice),
                );

                return (
                  <Link
                    key={book._id}
                    href={`/books/${book.slug}`}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition active:scale-[0.985]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                      {discount > 0 && (
                        <div className="absolute left-1.5 top-1.5 z-10 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                          {discount}% OFF
                        </div>
                      )}

                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-white">
                          <BookOpen className="h-9 w-9 text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="p-2.5">
                      <p className="line-clamp-1 text-[9px] font-semibold uppercase tracking-wide text-blue-600">
                        {book.category?.name || "Books"}
                      </p>

                      <h3 className="mt-1 line-clamp-2 min-h-[2.25rem] text-[12px] font-semibold leading-[1.15rem] text-slate-900">
                        {book.title}
                      </h3>

                      <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                        {book.author}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <span className="text-[13px] font-bold text-slate-950">
                          ₹{formatMoney(book.price)}
                        </span>

                        {book.compareAtPrice &&
                          Number(book.compareAtPrice) >
                            Number(book.price) && (
                            <span className="text-[9px] text-slate-400 line-through">
                              ₹{formatMoney(book.compareAtPrice)}
                            </span>
                          )}
                      </div>

                      <div className="mt-1">
                        {book.stock > 0 ? (
                          <span className="text-[9px] font-medium text-emerald-600">
                            In stock
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-red-600">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
              <BookOpen className="mx-auto h-9 w-9 text-slate-300" />

              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                No featured books
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Featured books will appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
          Desktop same.
          Mobile 2 columns.
      ========================================================= */}
      <section className="py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-600 sm:text-sm">
                Browse by interest
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:mt-2 sm:text-3xl">
                Explore Categories
              </h2>

              <p className="mt-1.5 hidden max-w-2xl text-xs text-slate-500 sm:block sm:text-base">
                Find books based on what you want to learn,
                improve or enjoy.
              </p>
            </div>

            <Link
              href="/books"
              className="hidden w-fit items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 sm:inline-flex sm:text-sm"
            >
              View all books
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition active:scale-[0.985] hover:-translate-y-1 hover:border-blue-200 hover:shadow-md sm:rounded-2xl sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 transition group-hover:bg-blue-100 sm:h-11 sm:w-11 sm:rounded-xl">
                      <BookOpen className="h-4 w-4 text-slate-700 group-hover:text-blue-600 sm:h-5 sm:w-5" />
                    </div>

                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500 sm:h-5 sm:w-5" />
                  </div>

                  <h3 className="mt-2.5 line-clamp-1 text-[12px] font-semibold text-slate-900 sm:mt-5 sm:text-lg">
                    {category.name}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-sm sm:leading-6">
                    {category.description ||
                      "Explore books in this category."}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center sm:mt-8 sm:rounded-2xl sm:px-6 sm:py-12">
              <BookOpen className="mx-auto h-9 w-9 text-slate-300 sm:h-10 sm:w-10" />

              <p className="mt-3 text-xs text-slate-500 sm:text-sm">
                No categories available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          DESKTOP FEATURED BOOKS
          Hidden on mobile because mobile version is above.
      ========================================================= */}
      <section className="hidden border-y bg-slate-50 py-10 sm:block sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-sm">
                Handpicked for you
              </p>

              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:mt-2 sm:text-3xl">
                Featured Books
              </h2>

              <p className="mt-2 text-xs text-slate-500 sm:text-base">
                Books marked as featured from your admin panel.
              </p>
            </div>

            <Link
              href="/books"
              className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 sm:text-sm"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 sm:mt-8 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm">
              {error}
            </div>
          ) : loading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white sm:rounded-2xl"
                >
                  <div className="aspect-[4/5] bg-slate-200" />

                  <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
                    <div className="h-2.5 w-1/3 rounded bg-slate-200 sm:h-3" />
                    <div className="h-4 rounded bg-slate-200 sm:h-5" />
                    <div className="h-3 w-2/3 rounded bg-slate-200 sm:h-4" />
                    <div className="h-4 w-1/2 rounded bg-slate-200 sm:h-5" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {featuredBooks.map((book) => {
                const discount = getDiscount(
                  Number(book.price),
                  Number(book.compareAtPrice),
                );

                return (
                  <Link
                    key={book._id}
                    href={`/books/${book.slug}`}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                      {discount > 0 && (
                        <div className="absolute left-2 top-2 z-10 rounded-full bg-emerald-600 px-2 py-1 text-[9px] font-bold text-white sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">
                          {discount}% OFF
                        </div>
                      )}

                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-white">
                          <BookOpen className="h-10 w-10 text-slate-300 transition group-hover:scale-105 group-hover:text-blue-400 sm:h-16 sm:w-16" />
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <p className="line-clamp-1 text-[10px] font-medium text-blue-600 sm:text-xs">
                        {book.category?.name || "Uncategorized"}
                      </p>

                      <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-900 sm:min-h-0 sm:text-base">
                        {book.title}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 sm:text-sm">
                        {book.author}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                        <span className="text-sm font-bold text-slate-900 sm:text-base">
                          ₹{formatMoney(book.price)}
                        </span>

                        {book.compareAtPrice &&
                          Number(book.compareAtPrice) >
                            Number(book.price) && (
                            <span className="text-[10px] text-slate-400 line-through sm:text-xs">
                              ₹{formatMoney(book.compareAtPrice)}
                            </span>
                          )}
                      </div>

                      <div className="mt-1.5 text-[10px] sm:mt-2 sm:text-xs">
                        {book.stock > 0 ? (
                          <span className="font-medium text-emerald-600">
                            In stock
                          </span>
                        ) : (
                          <span className="font-medium text-red-600">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center sm:mt-8 sm:rounded-2xl sm:px-6 sm:py-16">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300 sm:h-12 sm:w-12" />

              <h3 className="mt-4 text-base font-semibold text-slate-900 sm:text-lg">
                No featured books
              </h3>

              <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                Admin panel se kisi book ko Featured + Published mark karo.
              </p>

              <Link
                href="/books"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white sm:px-5 sm:text-sm"
              >
                Browse All Books
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          DESKTOP CTA
          Completely hidden on mobile.
      ========================================================= */}
      <section className="hidden py-10 sm:block sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-slate-950 px-5 py-8 text-center sm:rounded-3xl sm:px-10 sm:py-14">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 sm:h-14 sm:w-14 sm:rounded-2xl">
              <BookOpen className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>

            <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-bold tracking-tight text-white sm:mt-5 sm:text-4xl">
              Your next great book is waiting.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-xs leading-5 text-slate-300 sm:mt-4 sm:text-base sm:leading-6">
              Explore our collection and find something
              worth reading, learning from and remembering.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:flex sm:justify-center sm:gap-3">
              <Link
                href="/books"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-950 transition hover:bg-slate-100 sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Shop Books
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/10 sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Search Books
              </Link>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}