"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function Icon({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const BookOpen = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v19H4.5A2.5 2.5 0 0 0 2 23z" />
    <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v19h6.5A2.5 2.5 0 0 1 22 23z" />
  </Icon>
);

const ChevronRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

const Filter = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M7 12h10m-7 6h4" />
  </Icon>
);

const ShoppingCart = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M3 4h2l2.7 11.2a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 1.9-1.4L21 8H6" />
  </Icon>
);

const Heart = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20.8 8.6c0 5.4-8.8 10.4-8.8 10.4S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" />
  </Icon>
);

type Category = {
  _id: string;
  name: string;
  slug?: string;
};

type ApiBook = {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category:
    | string
    | {
        _id?: string;
        name?: string;
        slug?: string;
      }
    | null;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  isbn?: string;
  image?: string;
  images?: string[];
  publisher?: string;
  language?: string;
  pages?: number;
  featured: boolean;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Book = {
  id: string;
  mongoId: string;
  sku: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  images: string[];
  publisher?: string;
  language?: string;
  pages?: number;
};

type CartItem = Book & {
  quantity: number;
};

type BooksApiResponse = {
  success?: boolean;
  data?: ApiBook[];
  books?: ApiBook[];
  message?: string;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

type CategoriesApiResponse = {
  success?: boolean;
  data?: Category[];
  categories?: Category[];
  message?: string;
};

const WISHLIST_KEY = "studystow-wishlist";
const CART_KEY = "studystow-cart";

function getDiscount(price: number, originalPrice?: number) {
  if (
    !originalPrice ||
    originalPrice <= price ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function normalizeImageUrl(image?: string) {
  if (!image) return "";

  const value = image.trim();

  if (!value) return "";

  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `/${value.replace(/^\/+/, "")}`;
}

function getCategoryName(
  category:
    | string
    | {
        _id?: string;
        name?: string;
        slug?: string;
      }
    | null
    | undefined
) {
  if (!category) return "Uncategorized";

  if (typeof category === "string") {
    return category;
  }

  return category.name || "Uncategorized";
}

function convertApiBook(book: ApiBook): Book {
  return {
    id: book.sku || book._id,
    mongoId: book._id,
    sku: book.sku,
    slug: book.slug,
    title: book.title,
    author: book.author,
    category: getCategoryName(book.category),
    price: Number(book.price) || 0,
    originalPrice:
      typeof book.compareAtPrice === "number"
        ? book.compareAtPrice
        : undefined,
    stock: Math.max(0, Number(book.stock) || 0),
    image: normalizeImageUrl(book.image),
    images: Array.isArray(book.images)
      ? book.images
          .map((image) => normalizeImageUrl(image))
          .filter(Boolean)
      : [],
    publisher: book.publisher,
    language: book.language,
    pages: book.pages,
  };
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);

  const [categories, setCategories] = useState<string[]>([
    "All Books",
  ]);

  const [selectedCategory, setSelectedCategory] =
    useState("All Books");

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ------------------------------------------------------------
  // Load localStorage + URL search
  // ------------------------------------------------------------

  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem(WISHLIST_KEY);

      const savedCart =
        localStorage.getItem(CART_KEY);

      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);

        if (Array.isArray(parsed)) {
          const ids = parsed
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.id || item?.sku
            )
            .filter(Boolean);

          setWishlist(ids);
        }
      }

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }

      const params = new URLSearchParams(
        window.location.search
      );

      setSearchQuery(
        params.get("q")?.trim() || ""
      );
    } catch (storageError) {
      console.error(
        "Failed to load local storage:",
        storageError
      );
    }
  }, []);

  // ------------------------------------------------------------
  // Fetch real books from MongoDB through API
  // ------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function fetchBooks() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/books?published=true&limit=100",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result: BooksApiResponse =
          await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message ||
              "Failed to fetch books"
          );
        }

        const apiBooks =
          result.data || result.books || [];

        const normalizedBooks =
          apiBooks
            .filter(
              (book) =>
                book &&
                book.published !== false
            )
            .map(convertApiBook);

        if (!cancelled) {
          setBooks(normalizedBooks);
        }
      } catch (fetchError) {
        console.error(
          "Failed to fetch books:",
          fetchError
        );

        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load books"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------------------
  // Fetch real categories from MongoDB
  // ------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const response = await fetch(
          "/api/categories",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const result: CategoriesApiResponse =
          await response.json();

        const apiCategories =
          result.data ||
          result.categories ||
          [];

        const names = apiCategories
          .map((category) => category?.name)
          .filter(
            (name): name is string =>
              Boolean(name)
          );

        if (!cancelled && names.length > 0) {
          setCategories([
            "All Books",
            ...Array.from(new Set(names)),
          ]);
        }
      } catch (categoryError) {
        console.error(
          "Failed to fetch categories:",
          categoryError
        );
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------------------
  // Filter books
  // ------------------------------------------------------------

  const filteredBooks = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return books.filter((book) => {
      const matchesCategory =
        selectedCategory === "All Books" ||
        book.category === selectedCategory;

      const matchesSearch =
        !query ||
        book.title
          .toLowerCase()
          .includes(query) ||
        book.author
          .toLowerCase()
          .includes(query) ||
        book.category
          .toLowerCase()
          .includes(query) ||
        book.sku
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    books,
    selectedCategory,
    searchQuery,
  ]);

  // ------------------------------------------------------------
  // Toast helper
  // ------------------------------------------------------------

  function showMessage(text: string) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  // ------------------------------------------------------------
  // Wishlist
  // ------------------------------------------------------------

  function saveWishlist(
    nextWishlist: string[]
  ) {
    setWishlist(nextWishlist);

    const wishlistBooks = books.filter(
      (book) =>
        nextWishlist.includes(book.id) ||
        nextWishlist.includes(book.sku)
    );

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(wishlistBooks)
    );
  }

  function toggleWishlist(book: Book) {
    const exists =
      wishlist.includes(book.id) ||
      wishlist.includes(book.sku);

    const nextWishlist = exists
      ? wishlist.filter(
          (id) =>
            id !== book.id &&
            id !== book.sku
        )
      : [...wishlist, book.id];

    saveWishlist(nextWishlist);

    showMessage(
      exists
        ? `${book.title} removed from wishlist`
        : `${book.title} added to wishlist`
    );
  }

  // ------------------------------------------------------------
  // Cart
  // ------------------------------------------------------------

  function addToCart(book: Book) {
    if (book.stock <= 0) {
      showMessage(
        `${book.title} is out of stock`
      );
      return;
    }

    const existingItem = cart.find(
      (item) =>
        item.id === book.id ||
        item.sku === book.sku
    );

    let nextCart: CartItem[];

    if (existingItem) {
      if (
        existingItem.quantity >=
        book.stock
      ) {
        showMessage(
          `Only ${book.stock} copies available`
        );
        return;
      }

      nextCart = cart.map((item) =>
        item.id === book.id ||
        item.sku === book.sku
          ? {
              ...item,
              ...book,
              quantity:
                item.quantity + 1,
            }
          : item
      );
    } else {
      nextCart = [
        ...cart,
        {
          ...book,
          quantity: 1,
        },
      ];
    }

    setCart(nextCart);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(nextCart)
    );

    showMessage(
      `${book.title} added to cart`
    );
  }

  // ------------------------------------------------------------
  // Reset filters
  // ------------------------------------------------------------

  function resetFilters() {
    setSelectedCategory("All Books");
    setSearchQuery("");

    window.history.replaceState(
      {},
      "",
      "/books"
    );
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Toast */}
      {message && (
        <div className="fixed right-4 top-20 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {message}
        </div>
      )}

      {/* ======================================================
          BOOKS HEADER
          Hidden on mobile
          Visible from sm/tablet/laptop upward
         ====================================================== */}
      <section className="hidden border-b bg-white sm:block">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 sm:mb-6 sm:gap-2 sm:text-sm">
            <Link
              href="/"
              className="transition hover:text-slate-900"
            >
              Home
            </Link>

            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

            <span className="font-medium text-slate-900">
              Books
            </span>
          </div>

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end md:gap-5">
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 sm:mb-3 sm:gap-2 sm:text-sm">
                <BookOpen className="h-4 w-4" />
                StudyStow Books
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Explore Our Books
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-600 sm:mt-2 sm:text-base sm:leading-normal">
                Discover books across self-help,
                finance, business, fiction,
                productivity and more.
              </p>
            </div>

            <div className="text-xs text-slate-500 sm:text-sm">
              <span className="font-semibold text-slate-900">
                {loading
                  ? "..."
                  : filteredBooks.length}
              </span>{" "}
              books available
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
         ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

          {/* ==================================================
              DESKTOP CATEGORY SIDEBAR
              Hidden on mobile
             ================================================== */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-700" />

                <h2 className="font-semibold text-slate-900">
                  Categories
                </h2>
              </div>

              <div className="space-y-1">
                {categories.map(
                  (category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        selectedCategory ===
                        category
                          ? "bg-slate-900 font-medium text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {category}
                    </button>
                  )
                )}
              </div>
            </div>
          </aside>

          {/* ==================================================
              BOOKS
             ================================================== */}
          <div>
            {/* Search info */}
            {searchQuery && (
              <div className="mb-5 rounded-xl border bg-white px-4 py-3 text-sm text-slate-600">
                Search results for{" "}
                <span className="font-semibold text-slate-900">
                  "{searchQuery}"
                </span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
                <h3 className="font-semibold text-red-800">
                  Unable to load books
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({
                  length: 8,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                  >
                    <div className="aspect-[3/4] animate-pulse bg-slate-200" />

                    <div className="space-y-3 p-4">
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

                      <div className="h-5 w-full animate-pulse rounded bg-slate-200" />

                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />

                      <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200" />

                      <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBooks.length > 0 ? (
              /* Grid */
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {filteredBooks.map(
                  (book) => {
                    const discount =
                      getDiscount(
                        book.price,
                        book.originalPrice
                      );

                    const isWishlisted =
                      wishlist.includes(
                        book.id
                      ) ||
                      wishlist.includes(
                        book.sku
                      );

                    const imageUrl =
                      book.image ||
                      book.images[0] ||
                      "";

                    return (
                      <article
                        key={book.mongoId}
                        className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        {/* Image */}
                        <div className="relative">
                          <Link
                            href={`/books/${book.slug}`}
                            className="relative block"
                          >
                            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-100">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={book.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  loading="lazy"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <BookOpen className="h-20 w-20 text-slate-300 transition duration-300 group-hover:scale-110" />
                              )}

                              {discount > 0 && (
                                <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>
                          </Link>

                          {/* Wishlist */}
                          <button
                            type="button"
                            aria-label={
                              isWishlisted
                                ? `Remove ${book.title} from wishlist`
                                : `Add ${book.title} to wishlist`
                            }
                            onClick={() =>
                              toggleWishlist(
                                book
                              )
                            }
                            className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-slate-600 shadow-sm transition hover:text-red-500"
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                isWishlisted
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* Details */}
                        <div className="p-4">
                          <Link
                            href={`/books/${book.slug}`}
                          >
                            <p className="mb-1 text-xs font-medium text-blue-600">
                              {book.category}
                            </p>

                            <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-900 transition group-hover:text-blue-600">
                              {book.title}
                            </h2>
                          </Link>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            by {book.author}
                          </p>

                          {/* Price */}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-900">
                              ₹
                              {book.price.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            {book.originalPrice &&
                              book.originalPrice >
                                book.price && (
                                <span className="text-xs text-slate-400 line-through">
                                  ₹
                                  {book.originalPrice.toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              )}
                          </div>

                          {/* SKU */}
                          <p className="mt-1 text-[11px] text-slate-400">
                            SKU: {book.sku}
                          </p>

                          {/* Stock */}
                          <p
                            className={`mt-1 text-xs font-medium ${
                              book.stock <= 0
                                ? "text-red-600"
                                : book.stock <= 10
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {book.stock <= 0
                              ? "Out of stock"
                              : book.stock <= 10
                              ? `Only ${book.stock} left`
                              : "In stock"}
                          </p>

                          {/* Add to cart */}
                          <button
                            type="button"
                            disabled={
                              book.stock <= 0
                            }
                            onClick={() =>
                              addToCart(book)
                            }
                            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <ShoppingCart className="h-4 w-4" />

                            {book.stock <= 0
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            ) : (
              /* Empty */
              <div className="rounded-2xl border bg-white px-6 py-16 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300" />

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No books found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search or choose
                  a different category.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Show All Books
                </button>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-10 rounded-2xl border bg-white p-6 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-400" />

              <h3 className="mt-3 font-semibold text-slate-900">
                Looking for something
                specific?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Use the search from the header
                to find your next book.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}