"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type CategoryWithBooks = Category & {
  books: number;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithBooks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/categories", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch categories"
        );
      }

      const apiCategories: Category[] = result.data || [];

      /*
       * Book count abhi /api/categories se nahi aa raha.
       * Isliye har category ka count /api/books se calculate karenge.
       */
      let books: any[] = [];

      try {
        const booksResponse = await fetch(
          "/api/books?limit=1000",
          {
            cache: "no-store",
          }
        );

        const booksResult = await booksResponse.json();

        if (booksResponse.ok && booksResult.success) {
          books = booksResult.data || [];
        }
      } catch (bookError) {
        console.error(
          "Failed to fetch books for category counts:",
          bookError
        );
      }

      const categoryBookCounts: Record<string, number> = {};

      for (const book of books) {
        const categoryId =
          typeof book.category === "object" && book.category
            ? book.category._id
            : book.category;

        if (categoryId) {
          const key = String(categoryId);

          categoryBookCounts[key] =
            (categoryBookCounts[key] || 0) + 1;
        }
      }

      const normalizedCategories: CategoryWithBooks[] =
        apiCategories.map((category) => ({
          ...category,
          books:
            categoryBookCounts[String(category._id)] || 0,
        }));

      setCategories(normalizedCategories);
    } catch (err) {
      console.error(
        "Admin categories fetch error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [categories, search]);

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.active
  ).length;

  const totalBooks = categories.reduce(
    (total, category) => total + category.books,
    0
  );

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
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage your real book categories.
            </p>
          </div>

          <Link
            href="/admin/categories/new"
            className="w-fit rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + Add Category
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Categories
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : totalCategories}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Categories
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : activeCategories}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Books
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : totalBooks}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
          <label
            htmlFor="category-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search Categories
          </label>

          <input
            id="category-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by category name, slug or description..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Failed to load categories
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchCategories}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Categories */}
        <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">

          <div className="border-b p-5">
            <h2 className="font-semibold text-gray-900">
              All Categories
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Showing categories directly from MongoDB.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-500">
                Loading categories...
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            filteredCategories.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {search
                    ? "No categories found"
                    : "No categories yet"}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {search
                    ? "Try a different search term."
                    : "Create your first category to get started."}
                </p>

                {!search && (
                  <Link
                    href="/admin/categories/new"
                    className="mt-5 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    + Add Category
                  </Link>
                )}
              </div>
            )}

          {/* Desktop Table */}
          {!loading &&
            filteredCategories.length > 0 && (
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Slug
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Books
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredCategories.map((category) => (
                      <tr
                        key={category._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {category.name}
                            </p>

                            <p className="mt-1 max-w-md text-sm text-gray-500">
                              {category.description ||
                                "No description"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              ID: {category._id}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            /category/{category.slug}
                          </code>
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-semibold text-gray-900">
                            {category.books}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              category.active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {category.active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/category/${category.slug}`}
                              className="rounded-lg border px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </Link>

                            <Link
                              href={`/admin/categories/${category._id}/edit`}
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
            )}

          {/* Mobile Cards */}
          {!loading &&
            filteredCategories.length > 0 && (
              <div className="divide-y md:hidden">
                {filteredCategories.map((category) => (
                  <div
                    key={category._id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                          {category.description ||
                            "No description"}
                        </p>

                        <p className="mt-2 break-all text-xs text-gray-400">
                          ID: {category._id}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          category.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Slug
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-gray-900">
                          {category.slug}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Books
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {category.books}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/category/${category.slug}`}
                        className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </Link>

                      <Link
                        href={`/admin/categories/${category._id}/edit`}
                        className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">
            Category Management
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Categories are loaded from MongoDB. Book counts are
            calculated from the books assigned to each category.
            If no books have been added yet, the count will be 0.
          </p>
        </div>
      </div>
    </main>
  );
}