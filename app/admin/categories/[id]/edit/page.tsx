"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
};

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : String(params.id);

  const [category, setCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------
  // Fetch category
  // -----------------------------
  useEffect(() => {
    if (!id) return;

    async function fetchCategory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/categories/${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch category"
          );
        }

        const data: Category = result.data;

        setCategory(data);

        setName(data.name || "");
        setSlug(data.slug || "");
        setDescription(data.description || "");
        setImage(data.image || "");
        setFeatured(Boolean(data.featured));
        setActive(Boolean(data.active));
        setSortOrder(String(data.sortOrder ?? 0));
      } catch (err) {
        console.error(
          "Fetch category error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load category"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [id]);

  // -----------------------------
  // Submit
  // -----------------------------
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanSlug = slug.trim().toLowerCase();
    const cleanDescription = description.trim();
    const cleanImage = image.trim();

    if (!cleanName) {
      setError("Category name is required.");
      return;
    }

    if (!cleanSlug) {
      setError("Slug is required.");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setError(
        "Slug can contain only lowercase letters, numbers and hyphens."
      );
      return;
    }

    const numericSortOrder = Number(sortOrder);

    if (
      !Number.isInteger(numericSortOrder) ||
      numericSortOrder < 0
    ) {
      setError("Sort order must be a whole number 0 or greater.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/categories/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            slug: cleanSlug,
            description: cleanDescription,
            image: cleanImage,
            featured,
            active,
            sortOrder: numericSortOrder,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update category"
        );
      }

      setSuccess("Category updated successfully.");

      setTimeout(() => {
        router.push("/admin/categories");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "Update category error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update category"
      );
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading category...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------
  // Error / not found
  // -----------------------------
  if (!category) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/admin/categories"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Categories
          </Link>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="font-semibold text-red-700">
              Category not found
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error || "This category does not exist."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div>
          <Link
            href="/admin/categories"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Categories
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Edit Category
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the category information stored in MongoDB.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          {/* Basic Information */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="mt-6 space-y-5">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="e.g. Mathematics"
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Slug
                </label>

                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(
                      event.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    )
                  }
                  placeholder="e.g. mathematics"
                  maxLength={120}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-2 text-xs text-gray-500">
                  URL: /category/{slug || "category-name"}
                </p>
              </div>

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
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe this category..."
                  rows={5}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {description.length}/500
                </p>
              </div>

              {/* Image */}
              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Image URL
                </label>

                <input
                  id="image"
                  type="text"
                  value={image}
                  onChange={(event) =>
                    setImage(event.target.value)
                  }
                  placeholder="/images/categories/math.jpg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Optional. You can use a public image path or URL.
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Category Settings
            </h2>

            <div className="mt-6 space-y-5">

              {/* Sort Order */}
              <div>
                <label
                  htmlFor="sortOrder"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Sort Order
                </label>

                <input
                  id="sortOrder"
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Lower numbers appear first.
                </p>
              </div>

              {/* Active */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) =>
                    setActive(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Active Category
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Active categories can be displayed on the
                    storefront.
                  </p>
                </div>
              </label>

              {/* Featured */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Featured Category
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Mark this category as featured.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">
                {success}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/categories"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}