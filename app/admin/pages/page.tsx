import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";

type PageStatus = "Published" | "Draft";

type WebsitePage = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: PageStatus;
  views: number;
  seoTitle: string;
  updatedAt: string;
  author: string;
};

const pages: WebsitePage[] = [
  {
    id: "1",
    title: "Home",
    slug: "/",
    type: "Homepage",
    status: "Published",
    views: 18420,
    seoTitle: "StudyStow - Buy Books Online",
    updatedAt: "25 Sep 2026",
    author: "Admin",
  },
  {
    id: "2",
    title: "About Us",
    slug: "/about",
    type: "Static Page",
    status: "Published",
    views: 4280,
    seoTitle: "About StudyStow",
    updatedAt: "24 Sep 2026",
    author: "Admin",
  },
  {
    id: "3",
    title: "Contact Us",
    slug: "/contact",
    type: "Static Page",
    status: "Published",
    views: 2160,
    seoTitle: "Contact StudyStow",
    updatedAt: "23 Sep 2026",
    author: "Admin",
  },
  {
    id: "4",
    title: "Privacy Policy",
    slug: "/privacy-policy",
    type: "Legal",
    status: "Published",
    views: 980,
    seoTitle: "Privacy Policy - StudyStow",
    updatedAt: "20 Sep 2026",
    author: "Admin",
  },
  {
    id: "5",
    title: "Terms & Conditions",
    slug: "/terms",
    type: "Legal",
    status: "Published",
    views: 742,
    seoTitle: "Terms & Conditions - StudyStow",
    updatedAt: "20 Sep 2026",
    author: "Admin",
  },
  {
    id: "6",
    title: "Shipping Policy",
    slug: "/shipping-policy",
    type: "Policy",
    status: "Published",
    views: 624,
    seoTitle: "Shipping Policy - StudyStow",
    updatedAt: "18 Sep 2026",
    author: "Admin",
  },
  {
    id: "7",
    title: "Return & Refund Policy",
    slug: "/return-refund-policy",
    type: "Policy",
    status: "Published",
    views: 518,
    seoTitle: "Return & Refund Policy - StudyStow",
    updatedAt: "18 Sep 2026",
    author: "Admin",
  },
  {
    id: "8",
    title: "FAQ",
    slug: "/faq",
    type: "Support",
    status: "Draft",
    views: 0,
    seoTitle: "Frequently Asked Questions",
    updatedAt: "17 Sep 2026",
    author: "Admin",
  },
];

const statusStyles: Record<PageStatus, string> = {
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Draft: "bg-amber-50 text-amber-700 ring-amber-200",
};

function formatViews(views: number) {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }

  return views.toString();
}

export default function AdminPagesPage() {
  const publishedCount = pages.filter(
    (page) => page.status === "Published",
  ).length;

  const draftCount = pages.filter((page) => page.status === "Draft").length;

  const totalViews = pages.reduce((sum, page) => sum + page.views, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/admin" className="hover:text-slate-900">
              Admin
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">Pages</span>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Website Pages
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage website pages, content, URLs and SEO settings.
              </p>
            </div>

            <Link
              href="/admin/pages/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create New Page
            </Link>
          </div>
        </div>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Pages
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {pages.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              All website pages
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Published
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {publishedCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Globe className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-emerald-600">
              Live on website
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Drafts</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {draftCount}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Edit3 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-amber-600">
              Waiting for publishing
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Views
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {formatViews(totalViews)}
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Eye className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Page traffic
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
                  placeholder="Search page title, URL or SEO title..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  defaultValue="all"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                <select
                  defaultValue="all"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="all">All Types</option>
                  <option value="homepage">Homepage</option>
                  <option value="static">Static Page</option>
                  <option value="legal">Legal</option>
                  <option value="policy">Policy</option>
                  <option value="support">Support</option>
                </select>

                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Settings2 className="h-4 w-4" />
                  SEO Settings
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1100px]">
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
                    Views
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
                    key={page.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <FileText className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/admin/pages/${page.id}`}
                            className="block truncate text-sm font-semibold text-slate-950 hover:text-blue-600"
                          >
                            {page.title}
                          </Link>

                          <p className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500">
                            {page.seoTitle}
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
                        {page.type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[page.status]}`}
                      >
                        {page.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <Eye className="h-4 w-4 text-slate-400" />
                        {formatViews(page.views)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {page.updatedAt}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        by {page.author}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={page.slug}
                          target="_blank"
                          aria-label={`View ${page.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/admin/pages/${page.id}`}
                          aria-label={`Edit ${page.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          aria-label={`More options for ${page.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {pages.map((page) => (
              <div key={page.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/pages/${page.id}`}
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
                        {page.status}
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] text-slate-400">Type</p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {page.type}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-400">Views</p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {formatViews(page.views)}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-[11px] text-slate-400">
                            SEO Title
                          </p>
                          <p className="mt-1 truncate text-sm font-medium text-slate-700">
                            {page.seoTitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        Updated {page.updatedAt}
                      </p>

                      <div className="flex gap-1">
                        <Link
                          href={page.slug}
                          target="_blank"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
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
                1–{pages.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {pages.length}
              </span>{" "}
              pages
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-400"
              >
                Previous
              </button>

              <button
                type="button"
                className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
              >
                1
              </button>

              <button
                type="button"
                disabled
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-400"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Info */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
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
              Add a new custom page to your website.
            </p>
          </Link>

          <Link
            href="/admin/pages/seo"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Settings2 className="h-5 w-5" />
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
            </div>

            <h3 className="mt-4 font-bold text-slate-950">
              SEO Management
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage meta titles, descriptions and indexing settings.
            </p>
          </Link>

          <Link
            href="/admin/pages/settings"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Globe className="h-5 w-5" />
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
            </div>

            <h3 className="mt-4 font-bold text-slate-950">
              Page Settings
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Configure page visibility and website settings.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
