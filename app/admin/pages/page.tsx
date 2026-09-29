"use client";

import Link from "next/link";
import {
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  Globe,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type PageStatus = "published" | "draft";

type PageType =
  | "homepage"
  | "static"
  | "legal"
  | "policy"
  | "support"
  | "custom";

type WebsitePage = {
  _id: string;
  title: string;
  slug: string;
  type: PageType;
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
  data: WebsitePage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    published: number;
    drafts: number;
  };
  message?: string;
};

const typeLabels: Record<PageType, string> = {
  homepage: "Homepage",
  static: "Static Page",
  legal: "Legal",
  policy: "Policy",
  support: "Support",
  custom: "Custom",
};

const statusStyles: Record<PageStatus, string> = {
  published:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft:
    "bg-amber-50 text-amber-700 ring-amber-200",
};

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<WebsitePage[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
  });

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    });

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [type, setType] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const loadPages = useCallback(
    async (pageNumber = 1, refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(pageNumber)
        );

        params.set("limit", "10");

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (status !== "all") {
          params.set("status", status);
        }

        if (type !== "all") {
          params.set("type", type);
        }

        const response = await fetch(
          `/api/pages?${params.toString()}`,
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
              "Failed to load pages"
          );
        }

        setPages(result.data || []);

        setPagination(
          result.pagination
        );

        setStats(result.stats);
      } catch (err) {
        console.error(
          "Admin pages error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load pages"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status, type]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPages(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [loadPages]);

  async function handleDelete(
    page: WebsitePage
  ) {
    const confirmed =
      window.confirm(
        `Delete "${page.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) return;

    try {
      setDeletingId(page._id);
      setError("");

      const response = await fetch(
        `/api/pages/${page._id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to delete page"
        );
      }

      await loadPages(
        pagination.page,
        true
      );
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
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/admin"
              className="hover:text-slate-900"
            >
              Admin
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">
              Pages
            </span>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Website Pages
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage website content, URLs and SEO settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  loadPages(
                    pagination.page,
                    true
                  )
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </button>

              <Link
                href="/admin/pages/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create New Page
              </Link>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-800">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Stats */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Pages
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : stats.total}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Real MongoDB pages
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Published
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : stats.published}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Globe className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-emerald-600">
              Live pages
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Drafts
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : stats.drafts}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Edit3 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-amber-600">
              Not published
            </p>
          </div>
        </section>

        {/* Main */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search title, URL or SEO title..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="all">
                    All Status
                  </option>
                  <option value="published">
                    Published
                  </option>
                  <option value="draft">
                    Draft
                  </option>
                </select>

                <select
                  value={type}
                  onChange={(event) =>
                    setType(
                      event.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="all">
                    All Types
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
                  <option value="custom">
                    Custom
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="mx-auto h-7 w-7 animate-spin text-slate-400" />

              <p className="mt-3 text-sm text-slate-500">
                Loading pages...
              </p>
            </div>
          ) : pages.length === 0 ? (
            /* Empty */
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <FileText className="h-6 w-6 text-slate-500" />
              </div>

              <h2 className="mt-4 font-semibold text-slate-950">
                No pages found
              </h2>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                {search ||
                status !== "all" ||
                type !== "all"
                  ? "Try changing your search or filters."
                  : "Create your first website page to start managing your content."}
              </p>

              {!search &&
                status === "all" &&
                type === "all" && (
                  <Link
                    href="/admin/pages/new"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    Create Page
                  </Link>
                )}
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Page
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        URL
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Type
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Updated
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {pages.map((page) => (
                      <tr
                        key={page._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <FileText className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <Link
                                href={`/admin/pages/${page._id}`}
                                className="block truncate text-sm font-semibold text-slate-950 hover:text-blue-600"
                              >
                                {page.title}
                              </Link>

                              <p className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500">
                                {page.seoTitle ||
                                  "No SEO title"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {page.slug}
                          </code>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-slate-700">
                            {
                              typeLabels[
                                page.type
                              ]
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[page.status]}`}
                          >
                            {page.status ===
                            "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {formatDate(
                              page.updatedAt
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {page.author?.name ||
                              "Admin"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {page.status ===
                              "published" && (
                              <Link
                                href={
                                  page.slug ===
                                  "/"
                                    ? "/"
                                    : page.slug
                                }
                                target="_blank"
                                aria-label={`View ${page.title}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            )}

                            <Link
                              href={`/admin/pages/${page._id}`}
                              aria-label={`Edit ${page.title}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                page._id
                              }
                              onClick={() =>
                                handleDelete(
                                  page
                                )
                              }
                              aria-label={`Delete ${page.title}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId ===
                              page._id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {pages.map((page) => (
                  <div
                    key={page._id}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/admin/pages/${page._id}`}
                              className="block truncate text-sm font-bold text-slate-950"
                            >
                              {page.title}
                            </Link>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {page.slug}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[page.status]}`}
                          >
                            {page.status ===
                            "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-400">
                            Type
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {
                              typeLabels[
                                page.type
                              ]
                            }
                          </p>

                          <p className="mt-3 text-[11px] text-slate-400">
                            SEO Title
                          </p>

                          <p className="mt-1 truncate text-sm font-medium text-slate-700">
                            {page.seoTitle ||
                              "No SEO title"}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-slate-400">
                            Updated{" "}
                            {formatDate(
                              page.updatedAt
                            )}
                          </p>

                          <div className="flex gap-1">
                            {page.status ===
                              "published" && (
                              <Link
                                href={
                                  page.slug
                                }
                                target="_blank"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            )}

                            <Link
                              href={`/admin/pages/${page._id}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                page._id
                              }
                              onClick={() =>
                                handleDelete(
                                  page
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      (pagination.page -
                        1) *
                        pagination.limit +
                        1,
                      pagination.total
                    )}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      pagination.page *
                        pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.total}
                  </span>{" "}
                  pages
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={
                      pagination.page <= 1
                    }
                    onClick={() =>
                      loadPages(
                        pagination.page - 1
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Previous
                  </button>

                  <span className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                    {pagination.page}
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.page >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      loadPages(
                        pagination.page + 1
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Bottom */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/pages/new"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Plus className="h-5 w-5" />
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
            </div>

            <h3 className="mt-4 font-bold text-slate-950">
              Create New Page
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add a new page to your website.
            </p>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-emerald-50 p-2.5 w-fit text-emerald-600">
              <Globe className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-bold text-slate-950">
              SEO-ready Pages
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Every page supports SEO title,
              description and no-index control.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}