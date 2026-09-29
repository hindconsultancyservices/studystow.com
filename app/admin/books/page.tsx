"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Book = {
  _id: string;
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  stock: number;
  status: "Published" | "Draft" | "Out of Stock";
  image?: string;
};

function getStockClass(stock: number) {
  if (stock === 0) {
    return "bg-red-100 text-red-700";
  }

  if (stock <= 10) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
}

function getStatusClass(status: Book["status"]) {
  if (status === "Published") {
    return "bg-green-100 text-green-700";
  }

  if (status === "Out of Stock") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/books", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load books.");
        }

        setBooks(Array.isArray(data) ? data : data.books || []);
      } catch (err) {
        console.error("Admin books fetch error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load books."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(books.map((book) => book.category).filter(Boolean))
    ).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        !searchValue ||
        book.id.toLowerCase().includes(searchValue) ||
        book.title.toLowerCase().includes(searchValue) ||
        book.author.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "all" || book.category === category;

      const matchesStatus =
        status === "all" || book.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [books, search, category, status]);

  const publishedCount = books.filter(
    (book) => book.status === "Published"
  ).length;

  const lowStockCount = books.filter(
    (book) => book.stock > 0 && book.stock <= 10
  ).length;

  const outOfStockCount = books.filter(
    (book) => book.stock === 0
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Books
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage bookstore books, inventory and publishing status.
            </p>
          </div>

          <Link
            href="/admin/books/new"
            className="inline-flex w-fit items-center rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + Add New Book
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Books</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : books.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Published</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : publishedCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Low Stock</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : lowStockCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Out of Stock</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : outOfStockCount}
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search Books
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, author or book ID..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div className="w-full lg:w-52">
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
              >
                <option value="all">All Categories</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-52">
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
              >
                <option value="all">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Unable to load books</p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Books Table */}
        <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                All Books
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading books..."
                  : `${filteredBooks.length} books found`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading books from database...
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-gray-900">
                No books found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Book
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Price
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Stock
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredBooks.map((book) => (
                      <tr
                        key={book._id || book.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {book.image ? (
                              <img
                                src={book.image}
                                alt={book.title}
                                className="h-16 w-12 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xl">
                                📚
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-900">
                                {book.title}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {book.author}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                ID: {book.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {book.category}
                          </span>
                        </td>

                        <td className="px-6 py-5 font-semibold text-gray-900">
                          ₹{Number(book.price || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStockClass(
                              Number(book.stock || 0)
                            )}`}
                          >
                            {book.stock}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              book.status
                            )}`}
                          >
                            {book.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/books/${encodeURIComponent(
                                book.id
                              )}`}
                              className="rounded-lg border px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </Link>

                            <Link
                              href={`/admin/books/${encodeURIComponent(
                                book.id
                              )}/edit`}
                              className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y md:hidden">
                {filteredBooks.map((book) => (
                  <div
                    key={book._id || book.id}
                    className="p-5"
                  >
                    <div className="flex gap-4">
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          className="h-20 w-16 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                          📚
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {book.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {book.author}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ID: {book.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="mt-1 font-medium text-gray-900">
                          {book.category}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          ₹
                          {Number(book.price || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Stock</p>

                        <span
                          className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStockClass(
                            Number(book.stock || 0)
                          )}`}
                        >
                          {book.stock}
                        </span>
                      </div>

                      <div>
                        <p className="text-gray-500">Status</p>

                        <span
                          className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            book.status
                          )}`}
                        >
                          {book.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <Link
                        href={`/admin/books/${encodeURIComponent(
                          book.id
                        )}`}
                        className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </Link>

                      <Link
                        href={`/admin/books/${encodeURIComponent(
                          book.id
                        )}/edit`}
                        className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}