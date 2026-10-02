"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active?: boolean;
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
  category?:
    | {
        _id?: string;
        name?: string;
        slug?: string;
      }
    | string
    | null;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  books?: T;
  categories?: T;
  items?: T;
  message?: string;
};

function getArray<T>(response: ApiResponse<T[]>): T[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.books)) {
    return response.books;
  }

  if (Array.isArray(response.categories)) {
    return response.categories;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  return [];
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("en-IN");
}

function getDiscount(
  price: number,
  compareAtPrice?: number,
) {
  if (
    !compareAtPrice ||
    compareAtPrice <= price ||
    price <= 0
  ) {
    return 0;
  }

  return Math.round(
    ((compareAtPrice - price) /
      compareAtPrice) *
      100,
  );
}

function getCategoryName(book: Book) {
  if (
    book.category &&
    typeof book.category === "object"
  ) {
    return book.category.name || "Books";
  }

  return "Books";
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "B";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

export default function StoreHomePage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [allBooks, setAllBooks] =
    useState<Book[]>([]);

  const [featuredBooks, setFeaturedBooks] =
    useState<Book[]>([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [booksLoading, setBooksLoading] =
    useState(true);

  const [featuredLoading, setFeaturedLoading] =
    useState(true);

  const [categoriesError, setCategoriesError] =
    useState("");

  const [booksError, setBooksError] =
    useState("");

  const [featuredError, setFeaturedError] =
    useState("");

  const categoryScroller =
    useRef<HTMLDivElement | null>(null);

  const booksScroller =
    useRef<HTMLDivElement | null>(null);

  const featuredScroller =
    useRef<HTMLDivElement | null>(null);

  /*
   * ============================================================
   * LOAD CATEGORIES
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const response = await fetch(
          "/api/categories?active=true&limit=100",
          {
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as ApiResponse<
            Category[]
          >;

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Failed to load categories.",
          );
        }

        const data =
          getArray(result);

        if (!cancelled) {
          setCategories(data);
        }
      } catch (error) {
        console.error(
          "Categories loading error:",
          error,
        );

        if (!cancelled) {
          setCategoriesError(
            error instanceof Error
              ? error.message
              : "Failed to load categories.",
          );
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * LOAD ALL PUBLISHED BOOKS
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadAllBooks() {
      try {
        setBooksLoading(true);
        setBooksError("");

        const response = await fetch(
          "/api/books?published=true&limit=12",
          {
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as ApiResponse<
            Book[]
          >;

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Failed to load books.",
          );
        }

        const data =
          getArray(result);

        if (!cancelled) {
          setAllBooks(data);
        }
      } catch (error) {
        console.error(
          "All books loading error:",
          error,
        );

        if (!cancelled) {
          setBooksError(
            error instanceof Error
              ? error.message
              : "Failed to load books.",
          );
        }
      } finally {
        if (!cancelled) {
          setBooksLoading(false);
        }
      }
    }

    loadAllBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * LOAD FEATURED BOOKS
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedBooks() {
      try {
        setFeaturedLoading(true);
        setFeaturedError("");

        const response = await fetch(
          "/api/books?published=true&featured=true&limit=8",
          {
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as ApiResponse<
            Book[]
          >;

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Failed to load featured books.",
          );
        }

        const data =
          getArray(result);

        if (!cancelled) {
          setFeaturedBooks(data);
        }
      } catch (error) {
        console.error(
          "Featured books loading error:",
          error,
        );

        if (!cancelled) {
          setFeaturedError(
            error instanceof Error
              ? error.message
              : "Failed to load featured books.",
          );
        }
      } finally {
        if (!cancelled) {
          setFeaturedLoading(false);
        }
      }
    }

    loadFeaturedBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * HORIZONTAL SCROLL
   * ============================================================
   */

  function scrollContainer(
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right",
    amount = 500,
  ) {
    const element = ref.current;

    if (!element) {
      return;
    }

    element.scrollBy({
      left:
        direction === "left"
          ? -amount
          : amount,
      behavior: "smooth",
    });
  }

  /*
   * ============================================================
   * CATEGORY CARD
   * ============================================================
   */

  function CategoryStory({
    category,
  }: {
    category: Category;
  }) {
    return (
      <Link
        href={`/category/${category.slug}`}
        className="group flex w-[72px] shrink-0 flex-col items-center sm:w-[82px]"
        aria-label={`Open ${category.name} category`}
      >
        <div className="rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-[2px] shadow-sm transition duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-blue-200">
          <div className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-50 sm:h-[78px] sm:w-[78px]">
            {category.image ? (
              <img
                src={category.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7" />

                <span className="mt-0.5 text-[9px] font-bold text-blue-700 sm:text-[10px]">
                  {getInitials(
                    category.name,
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <span className="mt-2 line-clamp-2 w-full text-center text-[10px] font-semibold leading-3.5 text-slate-700 transition group-hover:text-blue-600 sm:text-xs">
          {category.name}
        </span>
      </Link>
    );
  }

  /*
   * ============================================================
   * BOOK CARD
   * ============================================================
   */

  function BookCard({
    book,
  }: {
    book: Book;
  }) {
    const discount = getDiscount(
      Number(book.price),
      Number(book.compareAtPrice),
    );

    return (
      <Link
        href={`/books/${book.slug}`}
        className="group w-[170px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:w-auto sm:rounded-2xl"
      >
        {/* IMAGE */}

        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-100">
          {discount > 0 && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-emerald-600 px-2 py-1 text-[9px] font-bold text-white shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
              {discount}% OFF
            </span>
          )}

          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
              <BookOpen className="h-10 w-10 text-slate-300 transition group-hover:scale-110 group-hover:text-blue-500 sm:h-12 sm:w-12" />
            </div>
          )}
        </div>

        {/* DETAILS */}

        <div className="p-3 sm:p-4">
          <p className="line-clamp-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600 sm:text-xs">
            {getCategoryName(book)}
          </p>

          <h3 className="mt-1 line-clamp-2 min-h-[2rem] text-xs font-bold leading-4 text-slate-900 sm:min-h-[2.5rem] sm:text-sm sm:leading-5">
            {book.title}
          </h3>

          <p className="mt-1 line-clamp-1 text-[10px] text-slate-500 sm:text-xs">
            {book.author}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-slate-950 sm:text-lg">
              ₹{formatMoney(book.price)}
            </span>

            {book.compareAtPrice &&
              Number(
                book.compareAtPrice,
              ) > Number(book.price) && (
                <span className="text-[10px] text-slate-400 line-through sm:text-xs">
                  ₹
                  {formatMoney(
                    book.compareAtPrice,
                  )}
                </span>
              )}
          </div>

          <p className="mt-1 text-[10px] font-medium sm:text-xs">
            {book.stock > 0 ? (
              <span className="text-emerald-600">
                In stock
              </span>
            ) : (
              <span className="text-red-600">
                Out of stock
              </span>
            )}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* ========================================================
          CATEGORY STORIES
      ======================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-9 lg:px-8">

          {/* HEADER */}

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-xs">
                Explore
              </p>

              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Categories
              </h1>
            </div>

            <Link
              href="/category"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 sm:text-sm"
            >
              All Categories
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {/* STORY ROW */}

          <div className="relative mt-5 sm:mt-7">

            {/* LEFT */}

            <button
              type="button"
              aria-label="Scroll categories left"
              onClick={() =>
                scrollContainer(
                  categoryScroller,
                  "left",
                  400,
                )
              }
              className="absolute -left-3 top-8 z-20 hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:border-blue-200 hover:text-blue-600 lg:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* SCROLLER */}

            <div
              ref={categoryScroller}
              className="flex gap-4 overflow-x-auto px-1 pb-2 sm:gap-6 sm:px-2"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle:
                  "none",
              }}
            >
              {categoriesLoading ? (
                Array.from({
                  length: 7,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="flex w-[72px] shrink-0 flex-col items-center sm:w-[82px]"
                  >
                    <div className="h-[68px] w-[68px] animate-pulse rounded-full bg-slate-100 sm:h-[78px] sm:w-[78px]" />

                    <div className="mt-2 h-3 w-12 animate-pulse rounded bg-slate-100" />
                  </div>
                ))
              ) : categoriesError ? (
                <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-xs text-red-700">
                  {categoriesError}
                </div>
              ) : categories.length > 0 ? (
                categories.map(
                  (category) => (
                    <CategoryStory
                      key={
                        category._id
                      }
                      category={
                        category
                      }
                    />
                  ),
                )
              ) : (
                <div className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-2 text-xs text-slate-500">
                    No categories available yet.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT */}

            <button
              type="button"
              aria-label="Scroll categories right"
              onClick={() =>
                scrollContainer(
                  categoryScroller,
                  "right",
                  400,
                )
              }
              className="absolute -right-3 top-8 z-20 hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:border-blue-200 hover:text-blue-600 lg:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* MOBILE HINT */}

          {!categoriesLoading &&
            categories.length > 4 && (
              <div className="mt-2 flex items-center justify-end gap-1 text-[9px] text-slate-400 sm:hidden">
                Swipe to explore
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
        </div>
      </section>

      {/* ========================================================
          ALL BOOKS
      ======================================================== */}

      <section className="bg-slate-50/60 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

          {/* HEADER */}

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-xs">
                Collection
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                All Books
              </h2>

              <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                Explore books from every category.
              </p>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 sm:text-sm"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {/* ERROR */}

          {booksError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {booksError}
            </div>
          )}

          {/* LOADING */}

          {booksLoading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white sm:rounded-2xl"
                >
                  <div className="aspect-[3/4] animate-pulse bg-slate-200" />

                  <div className="space-y-2 p-3 sm:p-4">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 animate-pulse rounded bg-slate-200" />

                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : allBooks.length > 0 ? (
            <>
              {/* DESKTOP GRID */}

              <div className="mt-6 hidden grid-cols-2 gap-4 sm:grid md:grid-cols-3 xl:grid-cols-4">
                {allBooks.map(
                  (book) => (
                    <BookCard
                      key={
                        book._id
                      }
                      book={book}
                    />
                  ),
                )}
              </div>

              {/* MOBILE HORIZONTAL ROW */}

              <div
                ref={booksScroller}
                className="mt-5 flex gap-3 overflow-x-auto pb-3 sm:hidden"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle:
                    "none",
                }}
              >
                {allBooks.map(
                  (book) => (
                    <BookCard
                      key={
                        book._id
                      }
                      book={book}
                    />
                  ),
                )}
              </div>

              {/* MOBILE HINT */}

              {allBooks.length >
                2 && (
                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400 sm:hidden">
                  Swipe to explore
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No books available yet
              </h3>

              <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                Published books will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          FEATURED BOOKS
      ======================================================== */}

      <section className="border-t border-slate-200 bg-white py-9 sm:py-14">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

          {/* HEADER */}

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-xs">
                Handpicked
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Featured Books
              </h2>

              <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                Books selected as featured from your store.
              </p>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 sm:text-sm"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {/* ERROR */}

          {featuredError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {featuredError}
            </div>
          )}

          {/* LOADING */}

          {featuredLoading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white sm:rounded-2xl"
                >
                  <div className="aspect-[3/4] animate-pulse bg-slate-200" />

                  <div className="space-y-2 p-3 sm:p-4">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 animate-pulse rounded bg-slate-200" />

                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <>
              {/* DESKTOP */}

              <div className="mt-6 hidden grid-cols-2 gap-4 sm:grid md:grid-cols-3 xl:grid-cols-4">
                {featuredBooks.map(
                  (book) => (
                    <BookCard
                      key={
                        book._id
                      }
                      book={book}
                    />
                  ),
                )}
              </div>

              {/* MOBILE */}

              <div
                ref={featuredScroller}
                className="mt-5 flex gap-3 overflow-x-auto pb-3 sm:hidden"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle:
                    "none",
                }}
              >
                {featuredBooks.map(
                  (book) => (
                    <BookCard
                      key={
                        book._id
                      }
                      book={book}
                    />
                  ),
                )}
              </div>

              {featuredBooks.length >
                2 && (
                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400 sm:hidden">
                  Swipe to explore
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-14 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No featured books
              </h3>

              <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                Featured and published books will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}