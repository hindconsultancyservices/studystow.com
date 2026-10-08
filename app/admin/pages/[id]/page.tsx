"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  FileText,
  Save,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

type PageType =
  | "homepage"
  | "static"
  | "legal"
  | "policy"
  | "support"
  | "custom";

type PageStatus = "published" | "draft";

type WebsitePage = {
  _id: string;
  title: string;
  slug: string;
  type: PageType;
  content: string;
  status: PageStatus;
  seoTitle?: string;
  seoDescription?: string;
  noIndex: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    name?: string;
    email?: string;
  } | null;
};

type ApiResponse = {
  success: boolean;
  data?: WebsitePage;
  message?: string;
};

export default function AdminPageEdit() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [page, setPage] =
    useState<WebsitePage | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    type: "custom" as PageType,
    content: "",
    status: "draft" as PageStatus,
    seoTitle: "",
    seoDescription: "",
    noIndex: false,
  });

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/pages/${encodeURIComponent(id)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch page"
        );
      }

      if (!result.data) {
        throw new Error("Page data not found");
      }

      const data = result.data;

      setPage(data);

      setForm({
        title: data.title || "",
        slug: data.slug || "",
        type: data.type || "custom",
        content: data.content || "",
        status: data.status || "draft",
        seoTitle: data.seoTitle || "",
        seoDescription:
          data.seoDescription || "",
        noIndex: Boolean(data.noIndex),
      });
    } catch (err) {
      console.error(
        "Load admin page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load page"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadPage();
    }
  }, [id]);

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.title.trim()) {
        throw new Error(
          "Page title is required"
        );
      }

      if (!form.slug.trim()) {
        throw new Error(
          "Page slug is required"
        );
      }

      const response = await fetch(
        `/api/admin/pages/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title.trim(),
            slug: form.slug.trim(),
            type: form.type,
            content: form.content,
            status: form.status,
            seoTitle:
              form.seoTitle.trim(),
            seoDescription:
              form.seoDescription.trim(),
            noIndex: form.noIndex,
          }),
        }
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update page"
        );
      }

      if (result.data) {
        setPage(result.data);

        setForm({
          title: result.data.title || "",
          slug: result.data.slug || "",
          type:
            result.data.type || "custom",
          content:
            result.data.content || "",
          status:
            result.data.status || "draft",
          seoTitle:
            result.data.seoTitle || "",
          seoDescription:
            result.data.seoDescription || "",
          noIndex:
            Boolean(result.data.noIndex),
        });
      }

      setSuccess(
        "Page updated successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Update page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update page"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!page) return;

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${page.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/admin/pages/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to delete page"
        );
      }

      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      console.error(
        "Delete page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete page"
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-7 w-7 animate-spin text-slate-400" />

            <p className="mt-3 text-sm text-slate-500">
              Loading page...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !page) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pages
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="font-bold text-red-900">
              Failed to load page
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadPage}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pages
          </Link>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                  {page.title}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Edit website page and SEO settings.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {page.status ===
                "published" && (
                <Link
                  href={page.slug}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  View Page
                </Link>
              )}

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              {success}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

            {/* Main */}
            <div className="space-y-6">

              {/* Basic information */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="font-bold text-slate-950">
                    Page Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Basic information about this page.
                  </p>
                </div>

                <div className="space-y-5 p-5">

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Page Title
                    </label>

                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        updateField(
                          "title",
                          e.target.value
                        )
                      }
                      required
                      maxLength={200}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      URL Slug
                    </label>

                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) =>
                        updateField(
                          "slug",
                          e.target.value
                        )
                      }
                      required
                      maxLength={200}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 font-mono text-sm text-slate-900 outline-none focus:border-slate-900"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Example: /about-us
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Page Type
                      </label>

                      <select
                        value={form.type}
                        onChange={(e) =>
                          updateField(
                            "type",
                            e.target.value
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-900"
                      >
                        <option value="custom">
                          Custom
                        </option>

                        <option value="homepage">
                          Homepage
                        </option>

                        <option value="static">
                          Static Page
                        </option>

                        <option value="legal">
                          Legal
                        </option>

                        <option value="policy">
                          Policy
                        </option>

                        <option value="support">
                          Support
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Status
                      </label>

                      <select
                        value={form.status}
                        onChange={(e) =>
                          updateField(
                            "status",
                            e.target.value
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-900"
                      >
                        <option value="draft">
                          Draft
                        </option>

                        <option value="published">
                          Published
                        </option>
                      </select>
                    </div>

                  </div>
                </div>
              </section>

              {/* Content */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="font-bold text-slate-950">
                    Page Content
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Content that will be stored for this page.
                  </p>
                </div>

                <div className="p-5">
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      updateField(
                        "content",
                        e.target.value
                      )
                    }
                    rows={18}
                    maxLength={50000}
                    placeholder="Write your page content here..."
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-900 outline-none focus:border-slate-900"
                  />

                  <p className="mt-2 text-right text-xs text-slate-400">
                    {form.content.length.toLocaleString()} / 50,000
                  </p>
                </div>
              </section>

              {/* SEO */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="font-bold text-slate-950">
                    SEO Settings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Configure how search engines see this page.
                  </p>
                </div>

                <div className="space-y-5 p-5">

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      SEO Title
                    </label>

                    <input
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) =>
                        updateField(
                          "seoTitle",
                          e.target.value
                        )
                      }
                      maxLength={200}
                      placeholder="SEO title"
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-900"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      {form.seoTitle.length}/200
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      SEO Description
                    </label>

                    <textarea
                      value={
                        form.seoDescription
                      }
                      onChange={(e) =>
                        updateField(
                          "seoDescription",
                          e.target.value
                        )
                      }
                      maxLength={500}
                      rows={5}
                      placeholder="SEO description"
                      className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-900"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      {form.seoDescription.length}/500
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      checked={form.noIndex}
                      onChange={(e) =>
                        updateField(
                          "noIndex",
                          e.target.checked
                        )
                      }
                      className="mt-0.5 h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        No Index
                      </span>

                      <span className="mt-1 block text-xs text-slate-500">
                        Tell search engines not to index this page.
                      </span>
                    </span>
                  </label>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">

              {/* Save */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </section>

              {/* Page status */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-slate-950">
                  Page Status
                </h2>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Current status
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        form.status ===
                        "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {form.status ===
                      "published"
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Metadata */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-slate-950">
                  Page Details
                </h2>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Page ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-slate-600">
                      {page._id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Created
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {new Date(
                        page.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {new Date(
                        page.updatedAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Author
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {page.author?.name ||
                        page.author?.email ||
                        "Admin"}
                    </p>
                  </div>
                </div>
              </section>

            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}