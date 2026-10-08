"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Category = {
  _id: string;
  name: string;
  slug?: string;
};

type Book = {
  _id: string;
  title: string;
  slug: string;
  author: string;
  description?: string;

  category: Category | string;

  price: number;
  compareAtPrice?: number;

  stock: number;
  sku: string;
  isbn?: string;

  image?: string;
  images: string[];

  publisher?: string;
  language?: string;
  pages?: number;

  featured: boolean;
  published: boolean;

  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success?: boolean;
  data?: Book;
  message?: string;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getCategoryName(category: Category | string) {
  if (typeof category === "string") {
    return category;
  }

  return category?.name || "Uncategorized";
}

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminBookDetailsPage({
  params,
}: PageProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBook() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        if (!id) {
          throw new Error("Book SKU is missing.");
        }

        const response = await fetch(
          `/api/admin/books/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: ApiResponse = await response.json();

        /*
         * API response:
         * {
         *   success: true,
         *   data: book
         * }
         *
         * Error response:
         * {
         *   success: false,
         *   message: "..."
         * }
         */

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load book."
          );
        }

        if (!data?.data) {
          throw new Error("Book data was not returned.");
        }

        setBook(data.data);
      } catch (err) {
        console.error("Admin book details error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load book."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [params]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-200" />

            <div className="mt-5 h-8 w-72 rounded bg-gray-200" />

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="h-96 rounded-xl bg-gray-200" />

              <div className="h-96 rounded-xl bg-gray-200 lg:col-span-2" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error
   */
  if (error || !book) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Unable to load book
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error || "Book not found."}
            </p>

            <div className="mt-5 flex gap-3">
              <Link
                href="/admin/books"
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Back to Books
              </Link>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const categoryName = getCategoryName(book.category);

  const discount =
    book.compareAtPrice &&
    book.compareAtPrice > book.price
      ? Math.round(
          ((book.compareAtPrice - book.price) /
            book.compareAtPrice) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin/books"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              ← Back to Books
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {book.title}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  book.published
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {book.published ? "Published" : "Draft"}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              SKU: {book.sku}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/admin/books/${encodeURIComponent(
                book.sku
              )}/edit`}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Edit Book
            </Link>
          </div>
        </div>

        {/* Main */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Image */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
              {book.image ? (
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="px-6 text-center">
                  <div className="text-5xl">📚</div>

                  <p className="mt-3 text-sm font-medium text-gray-500">
                    No cover image
                  </p>
                </div>
              )}
            </div>

            {book.images?.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 text-sm font-semibold text-gray-700">
                  Additional Images
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {book.images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="aspect-square overflow-hidden rounded-lg border bg-gray-50"
                    >
                      <img
                        src={image}
                        alt={`${book.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Details */}
          <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Book Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Info
                label="Title"
                value={book.title}
              />

              <Info
                label="Author"
                value={book.author}
              />

              <Info
                label="Category"
                value={categoryName}
              />

              <Info
                label="SKU"
                value={book.sku}
              />

              <Info
                label="ISBN"
                value={book.isbn || "—"}
              />

              <Info
                label="Publisher"
                value={book.publisher || "—"}
              />

              <Info
                label="Language"
                value={book.language || "—"}
              />

              <Info
                label="Pages"
                value={
                  book.pages
                    ? book.pages.toLocaleString("en-IN")
                    : "—"
                }
              />
            </div>

            {/* Description */}
            <div className="mt-6 border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Description
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                {book.description || "No description available."}
              </p>
            </div>
          </section>
        </div>

        {/* Price + Inventory */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">

          {/* Price */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500">
              Selling Price
            </h2>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₹{book.price.toLocaleString("en-IN")}
            </p>

            {book.compareAtPrice &&
              book.compareAtPrice > book.price && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-400 line-through">
                    ₹
                    {book.compareAtPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    {discount}% OFF
                  </span>
                </div>
              )}
          </section>

          {/* Stock */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500">
              Current Stock
            </h2>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {book.stock.toLocaleString("en-IN")}
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                book.stock === 0
                  ? "bg-red-100 text-red-700"
                  : book.stock <= 10
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {book.stock === 0
                ? "Out of Stock"
                : book.stock <= 10
                ? "Low Stock"
                : "In Stock"}
            </span>
          </section>

          {/* Featured */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500">
              Featured
            </h2>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {book.featured ? "Yes" : "No"}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {book.featured
                ? "This book is marked as featured."
                : "This book is not featured."}
            </p>
          </section>
        </div>

        {/* Dates */}
        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Record Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Info
              label="Created"
              value={formatDateTime(book.createdAt)}
            />

            <Info
              label="Last Updated"
              value={formatDateTime(book.updatedAt)}
            />

            <Info
              label="Created Date"
              value={formatDate(book.createdAt)}
            />

            <Info
              label="MongoDB ID"
              value={book._id}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}