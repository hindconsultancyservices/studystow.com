"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
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

  return Math.round(
    ((compareAtPrice - price) / compareAtPrice) * 100,
  );
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

        const [booksResponse, categoriesResponse] =
          await Promise.all([
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
          booksResult = booksText
            ? JSON.parse(booksText)
            : {};
        } catch {
          throw new Error("Invalid books API response.");
        }

        try {
          categoriesResult = categoriesText
            ? JSON.parse(categoriesText)
            : {};
        } catch {
          throw new Error(
            "Invalid categories API response.",
          );
        }

        if (!booksResponse.ok || !booksResult.success) {
          throw new Error(
            booksResult.message ||
              "Failed to load books.",
          );
        }

        if (
          !categoriesResponse.ok ||
          !categoriesResult.success
        ) {
          throw new Error(
            categoriesResult.message ||
              "Failed to load categories.",
          );
        }

        setFeaturedBooks(
          Array.isArray(booksResult.data)
            ? booksResult.data
            : [],
        );

        setCategories(
          Array.isArray(categoriesResult.data)
            ? categoriesResult.data
            : [],
        );
      } catch (err: any) {
        console.error(
          "Homepage data error:",
          err,
        );

        setError(
          err?.message ||
            "Failed to load homepage data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomepageData();
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Discover your next great read
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Books that help you{" "}
                <span className="text-blue-600">
                  learn, grow & achieve.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Explore our collection of books on
                personal growth, finance,
                productivity, business, fiction
                and more.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/books"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Explore Books
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/books"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Browse Categories
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Secure checkout
                </span>

                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  Fast delivery
                </span>

                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-violet-600" />
                  Easy ordering
                </span>
              </div>
            </div>

            {/* Featured Preview */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-blue-100/50 blur-3xl" />

              <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Featured collection
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-950">
                      Read. Learn. Grow.
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>

                {loading ? (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="aspect-[3/4] rounded-xl bg-slate-200" />
                        <div className="mt-3 h-4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
                      </div>
                    ))}
                  </div>
                ) : featuredBooks.length > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {featuredBooks
                      .slice(0, 4)
                      .map((book) => (
                        <Link
                          key={book._id}
                          href={`/books/${book.slug}`}
                          className="group rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                        >
                          <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                            {book.image ? (
                              <img
                                src={book.image}
                                alt={book.title}
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            ) : (
                              <BookOpen className="h-10 w-10 text-slate-400" />
                            )}
                          </div>

                          <p className="mt-3 line-clamp-1 text-sm font-semibold text-slate-900">
                            {book.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {book.author}
                          </p>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">
                      No featured books available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y px-4 sm:px-6 lg:grid-cols-4 lg:divide-y-0 lg:px-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="flex items-start gap-3 px-4 py-6 sm:px-6 lg:px-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Browse by interest
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Explore Categories
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                Find books based on what you want
                to learn, improve or enjoy.
              </p>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all books
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-blue-100">
                      <BookOpen className="h-5 w-5 text-slate-700 group-hover:text-blue-600" />
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {category.description ||
                      "Explore books in this category."}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-3 text-sm text-slate-500">
                No categories available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Books */}
      <section className="border-y bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Handpicked for you
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Featured Books
              </h2>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Books marked as featured from your admin panel.
              </p>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : loading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[4/5] bg-slate-200" />

                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                    <div className="h-5 rounded bg-slate-200" />
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-5 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBooks.map((book) => {
                const discount = getDiscount(
                  Number(book.price),
                  Number(book.compareAtPrice),
                );

                return (
                  <Link
                    key={book._id}
                    href={`/books/${book.slug}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                      {discount > 0 && (
                        <div className="absolute left-3 top-3 z-10 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
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
                          <BookOpen className="h-16 w-16 text-slate-300 transition group-hover:scale-105 group-hover:text-blue-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs font-medium text-blue-600">
                        {book.category?.name ||
                          "Uncategorized"}
                      </p>

                      <h3 className="mt-1 line-clamp-1 font-semibold text-slate-900">
                        {book.title}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {book.author}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          ₹{formatMoney(book.price)}
                        </span>

                        {book.compareAtPrice &&
                          Number(book.compareAtPrice) >
                            Number(book.price) && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹
                              {formatMoney(
                                book.compareAtPrice,
                              )}
                            </span>
                          )}
                      </div>

                      <div className="mt-2 text-xs">
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
            <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No featured books
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Admin panel se kisi book ko
                Featured + Published mark karo.
              </p>

              <Link
                href="/books"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Browse All Books
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <BookOpen className="h-7 w-7 text-white" />
            </div>

            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your next great book is waiting.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Explore our collection and find something
              worth reading, learning from and remembering.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/books"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Shop Books
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Search Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} StudyStow.
            All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            <span>
              Built for readers and lifelong learners.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}