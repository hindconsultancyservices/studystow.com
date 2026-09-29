"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type BookForm = {
  id: string;
  title: string;
  author: string;
  category: string;
  price: string;
  originalPrice: string;
  stock: string;
  status: "Published" | "Draft";
  description: string;
  isbn: string;
  publisher: string;
  language: string;
  pages: string;
  image: string;
};

const initialForm: BookForm = {
  id: "",
  title: "",
  author: "",
  category: "",
  price: "",
  originalPrice: "",
  stock: "",
  status: "Draft",
  description: "",
  isbn: "",
  publisher: "",
  language: "English",
  pages: "",
  image: "",
};

const categories = [
  "Self Help",
  "Finance",
  "Productivity",
  "Fiction",
  "Business",
  "Spirituality",
];

export default function NewBookPage() {
  const [form, setForm] = useState<BookForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<K extends keyof BookForm>(
    field: K,
    value: BookForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const id = form.id.trim().toUpperCase();
    const title = form.title.trim();
    const author = form.author.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const originalPrice = form.originalPrice
      ? Number(form.originalPrice)
      : undefined;
    const stock = Number(form.stock);

    if (!id) {
      setError("Book ID is required.");
      return;
    }

    if (!/^BK[0-9]+$/i.test(id)) {
      setError("Book ID must be in format like BK001, BK002, etc.");
      return;
    }

    if (!title) {
      setError("Book title is required.");
      return;
    }

    if (!author) {
      setError("Author name is required.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid selling price.");
      return;
    }

    if (
      originalPrice !== undefined &&
      (!Number.isFinite(originalPrice) || originalPrice <= 0)
    ) {
      setError("Please enter a valid original price.");
      return;
    }

    if (
      originalPrice !== undefined &&
      originalPrice < price
    ) {
      setError(
        "Original price should be greater than or equal to selling price."
      );
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number and cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          title,
          author,
          category,
          price,
          ...(originalPrice !== undefined
            ? { originalPrice }
            : {}),
          stock,
          status: form.status,
          description: form.description.trim(),
          isbn: form.isbn.trim(),
          publisher: form.publisher.trim(),
          language: form.language.trim(),
          pages: form.pages
            ? Number(form.pages)
            : undefined,
          image: form.image.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to create book."
        );
      }

      setSuccess("Book created successfully.");

      const createdId =
        data?.book?.id ||
        data?.id ||
        id;

      setTimeout(() => {
        window.location.href = `/admin/books/${encodeURIComponent(
          createdId
        )}`;
      }, 700);
    } catch (err) {
      console.error("Create book error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the book."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <Link
            href="/admin/books"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Books
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Add New Book
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add a new book to your StudyStow inventory.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          {/* Basic Information */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="border-b pb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the main details of the book.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {/* Book ID */}
              <div>
                <label
                  htmlFor="id"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Book ID *
                </label>

                <input
                  id="id"
                  type="text"
                  value={form.id}
                  onChange={(e) =>
                    updateField(
                      "id",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="BK006"
                  maxLength={30}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Example: BK001, BK002, BK006
                </p>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Book Title *
                </label>

                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    updateField("title", e.target.value)
                  }
                  placeholder="Atomic Habits"
                  maxLength={200}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Author */}
              <div>
                <label
                  htmlFor="author"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Author *
                </label>

                <input
                  id="author"
                  type="text"
                  value={form.author}
                  onChange={(e) =>
                    updateField("author", e.target.value)
                  }
                  placeholder="James Clear"
                  maxLength={150}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category *
                </label>

                <select
                  id="category"
                  value={form.category}
                  onChange={(e) =>
                    updateField(
                      "category",
                      e.target.value
                    )
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Publisher */}
              <div>
                <label
                  htmlFor="publisher"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Publisher
                </label>

                <input
                  id="publisher"
                  type="text"
                  value={form.publisher}
                  onChange={(e) =>
                    updateField(
                      "publisher",
                      e.target.value
                    )
                  }
                  placeholder="Publisher name"
                  maxLength={150}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Language */}
              <div>
                <label
                  htmlFor="language"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Language
                </label>

                <input
                  id="language"
                  type="text"
                  value={form.language}
                  onChange={(e) =>
                    updateField(
                      "language",
                      e.target.value
                    )
                  }
                  placeholder="English"
                  maxLength={50}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="border-b pb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Pricing & Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Set the selling price and available stock.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Selling Price (₹) *
                </label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    updateField("price", e.target.value)
                  }
                  placeholder="499"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Original Price */}
              <div>
                <label
                  htmlFor="originalPrice"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Original Price (₹)
                </label>

                <input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.originalPrice}
                  onChange={(e) =>
                    updateField(
                      "originalPrice",
                      e.target.value
                    )
                  }
                  placeholder="599"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Stock */}
              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Stock *
                </label>

                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) =>
                    updateField("stock", e.target.value)
                  }
                  placeholder="24"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
          </section>

          {/* Book Details */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="border-b pb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Additional Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Optional information about the book.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Write a short description of the book..."
                  rows={6}
                  maxLength={5000}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {form.description.length}/5000
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {/* ISBN */}
                <div>
                  <label
                    htmlFor="isbn"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    ISBN
                  </label>

                  <input
                    id="isbn"
                    type="text"
                    value={form.isbn}
                    onChange={(e) =>
                      updateField(
                        "isbn",
                        e.target.value
                      )
                    }
                    placeholder="9780000000000"
                    maxLength={30}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                {/* Pages */}
                <div>
                  <label
                    htmlFor="pages"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Pages
                  </label>

                  <input
                    id="pages"
                    type="number"
                    min="1"
                    step="1"
                    value={form.pages}
                    onChange={(e) =>
                      updateField(
                        "pages",
                        e.target.value
                      )
                    }
                    placeholder="320"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value as
                          | "Published"
                          | "Draft"
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Published">
                      Published
                    </option>
                  </select>
                </div>
              </div>

              {/* Image */}
              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Book Cover Image URL
                </label>

                <input
                  id="image"
                  type="url"
                  value={form.image}
                  onChange={(e) =>
                    updateField(
                      "image",
                      e.target.value
                    )
                  }
                  placeholder="https://example.com/book-cover.jpg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Optional. Image upload can be connected separately.
                </p>
              </div>
            </div>
          </section>

          {/* Messages */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p className="font-semibold">
                Unable to create book
              </p>

              <p className="mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              <p className="font-semibold">
                {success}
              </p>

              <p className="mt-1">
                Opening the new book...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/books"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating Book..." : "Create Book"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}