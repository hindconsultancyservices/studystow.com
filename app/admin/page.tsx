
"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Mail,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type Book = {
  _id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  image?: string;
  featured?: boolean;
  published?: boolean;
  category?: {
    _id?: string;
    name?: string;
    slug?: string;
  } | null;
};

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  createdAt: string;
};

type Review = {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  verifiedPurchase: boolean;
  createdAt: string;
  book?: {
    _id?: string;
    title?: string;
    slug?: string;
    image?: string;
  } | null;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
};

type ContactStatus =
  | "new"
  | "contacted"
  | "in-progress"
  | "completed";

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  requirement: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt?: string;
};

type CustomerStats = {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomers: number;
};

type ReviewStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
};

type ContactStats = {
  total: number;
  new: number;
  contacted: number;
  inProgress: number;
  completed: number;
};

type DashboardData = {
  books: Book[];
  customers: Customer[];
  customerStats: CustomerStats;
  reviews: Review[];
  reviewStats: ReviewStats;
  contacts: Contact[];
  contactStats: ContactStats;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  items?: T;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  stats?: Record<string, number | undefined>;
};

type AdminModule =
  | "dashboard"
  | "books"
  | "categories"
  | "inventory"
  | "orders"
  | "customers"
  | "coupons"
  | "reviews"
  | "pages"
  | "reports"
  | "payments"
  | "adminUsers"
  | "settings"
  | "analytics"
  | "contact"
  | "auditLogs";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  module?: AdminModule;
  icon: typeof BookOpen;
  keywords: string;
};

const EMPTY_CUSTOMER_STATS: CustomerStats = {
  totalCustomers: 0,
  activeCustomers: 0,
  inactiveCustomers: 0,
  newCustomers: 0,
};

const EMPTY_REVIEW_STATS: ReviewStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  averageRating: 0,
};

const EMPTY_CONTACT_STATS: ContactStats = {
  total: 0,
  new: 0,
  contacted: 0,
  inProgress: 0,
  completed: 0,
};

const INITIAL_DATA: DashboardData = {
  books: [],
  customers: [],
  customerStats: EMPTY_CUSTOMER_STATS,
  reviews: [],
  reviewStats: EMPTY_REVIEW_STATS,
  contacts: [],
  contactStats: EMPTY_CONTACT_STATS,
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Add Book",
    description: "Create a new book listing.",
    href: "/admin/books/new",
    module: "books",
    icon: BookOpen,
    keywords: "book product catalogue listing create",
  },
  {
    title: "Manage Books",
    description: "Update book details and publishing status.",
    href: "/admin/books",
    module: "books",
    icon: ShoppingBag,
    keywords: "books products edit publish",
  },
  {
    title: "Orders",
    description: "Review customer orders and payments.",
    href: "/admin/orders",
    module: "orders",
    icon: Package,
    keywords: "orders payments delivery",
  },
  {
    title: "Inventory",
    description: "Monitor stock and availability.",
    href: "/admin/inventory",
    module: "inventory",
    icon: BarChart3,
    keywords: "stock inventory low stock",
  },
  {
    title: "Customers",
    description: "View customer accounts.",
    href: "/admin/customers",
    module: "customers",
    icon: Users,
    keywords: "customers users accounts",
  },
  {
    title: "Reviews",
    description: "Manage ratings and feedback.",
    href: "/admin/reviews",
    module: "reviews",
    icon: MessageSquare,
    keywords: "reviews ratings moderation feedback",
  },
  {
    title: "Contact Messages",
    description: "Review website enquiries.",
    href: "/admin/contact",
    module: "contact",
    icon: Mail,
    keywords: "contact messages enquiries leads",
  },
  {
    title: "Reports",
    description: "Open administrative reports.",
    href: "/admin/reports",
    module: "reports",
    icon: BarChart3,
    keywords: "reports analytics finance sales",
  },
  {
    title: "Roles & Permissions",
    description: "Manage team access and permissions.",
    href: "/admin/roles-permissions",
    module: "adminUsers",
    icon: ShieldCheck,
    keywords: "roles permissions team access security",
  },
];

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeNumber(value));
}

function formatDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name?: string): string {
  if (!name?.trim()) return "U";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStockStatus(stockValue: number) {
  const stock = safeNumber(stockValue);

  if (stock <= 0) {
    return {
      text: "Out of stock",
      className: "border-red-200 bg-red-50 text-red-700",
      dotClass: "bg-red-500",
      priority: 0,
    };
  }

  if (stock <= 5) {
    return {
      text: `${stock} left`,
      className: "border-amber-200 bg-amber-50 text-amber-800",
      dotClass: "bg-amber-500",
      priority: 1,
    };
  }

  return {
    text: "In stock",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
    priority: 2,
  };
}

function getContactStatusStyle(status: ContactStatus): string {
  switch (status) {
    case "new":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "contacted":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "in-progress":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getContactStatusLabel(status: ContactStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "in-progress":
      return "In progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function getReviewStatusStyle(status: Review["status"]): string {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function RatingStars({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, safeNumber(rating)));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= safeRating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

async function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Invalid response from ${url}. Check the API route and authentication.`
    );
  }

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed: ${url}`);
  }

  return data;
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
  href,
  linkText = "View all",
}: {
  title: string;
  description: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h2 className="text-sm font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-700 transition hover:text-black"
        >
          {linkText}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  loading,
  accent = "slate",
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: typeof BookOpen;
  href?: string;
  loading: boolean;
  accent?: "slate" | "amber" | "blue" | "red" | "green";
}) {
  const accents = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    green: "bg-emerald-50 text-emerald-700",
  };

  const content = (
    <div className="flex h-full items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {loading ? "—" : value}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {loading ? "Loading data…" : subtitle}
        </p>
      </div>

      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );

  const className =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition " +
    (href
      ? "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      : "");

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function AdminDashboardPage() {
  const { canView } = useAdminPermissions();

  const [data, setData] = useState<DashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setContactError("");

      try {
        const requests = await Promise.allSettled([
          canView("books")
            ? fetchJson<Book[]>("/api/admin/books?limit=1000")
            : Promise.resolve(null),

          canView("customers")
            ? fetchJson<Customer[]>("/api/admin/customers?limit=1000")
            : Promise.resolve(null),

          canView("reviews")
            ? fetchJson<Review[]>("/api/admin/reviews?limit=10&page=1")
            : Promise.resolve(null),
        ]);

        const booksResult = requests[0];
        const customersResult = requests[1];
        const reviewsResult = requests[2];

        const booksResponse =
          booksResult.status === "fulfilled" ? booksResult.value : null;
        const customersResponse =
          customersResult.status === "fulfilled"
            ? customersResult.value
            : null;
        const reviewsResponse =
          reviewsResult.status === "fulfilled" ? reviewsResult.value : null;

        const failures: string[] = [];

        if (booksResult.status === "rejected") {
          failures.push("Books");
        }
        if (customersResult.status === "rejected") {
          failures.push("Customers");
        }
        if (reviewsResult.status === "rejected") {
          failures.push("Reviews");
        }

        const books = Array.isArray(booksResponse?.data)
          ? booksResponse.data
          : [];

        const customers = Array.isArray(customersResponse?.data)
          ? customersResponse.data
          : [];

        const customerStats: CustomerStats = {
          totalCustomers: safeNumber(
            customersResponse?.stats?.totalCustomers ??
              customersResponse?.pagination?.total
          ),
          activeCustomers: safeNumber(
            customersResponse?.stats?.activeCustomers
          ),
          inactiveCustomers: safeNumber(
            customersResponse?.stats?.inactiveCustomers
          ),
          newCustomers: safeNumber(customersResponse?.stats?.newCustomers),
        };

        const reviews = Array.isArray(reviewsResponse?.data)
          ? reviewsResponse.data
          : [];

        const reviewStats: ReviewStats = {
          total: safeNumber(
            reviewsResponse?.stats?.total ??
              reviewsResponse?.pagination?.total
          ),
          pending: safeNumber(reviewsResponse?.stats?.pending),
          approved: safeNumber(reviewsResponse?.stats?.approved),
          rejected: safeNumber(reviewsResponse?.stats?.rejected),
          averageRating: safeNumber(reviewsResponse?.stats?.averageRating),
        };

        setData((current) => ({
          ...current,
          books,
          customers,
          customerStats,
          reviews,
          reviewStats,
        }));

        if (failures.length > 0) {
          setError(
            `${failures.join(", ")} data could not be loaded. Check the relevant API route and your permissions.`
          );
        }

        if (canView("contact")) {
          try {
            const contactsResponse = await fetchJson<Contact[]>(
              "/api/admin/contact?limit=5"
            );

            const contacts = Array.isArray(contactsResponse.data)
              ? contactsResponse.data
              : Array.isArray(contactsResponse.items)
                ? contactsResponse.items
                : [];

            const contactStats: ContactStats = {
              total: safeNumber(
                contactsResponse.stats?.total ??
                  contactsResponse.pagination?.total ??
                  contacts.length
              ),
              new: safeNumber(
                contactsResponse.stats?.new ??
                  contacts.filter((item) => item.status === "new").length
              ),
              contacted: safeNumber(
                contactsResponse.stats?.contacted ??
                  contacts.filter((item) => item.status === "contacted").length
              ),
              inProgress: safeNumber(
                contactsResponse.stats?.inProgress ??
                  contactsResponse.stats?.in_progress ??
                  contacts.filter((item) => item.status === "in-progress").length
              ),
              completed: safeNumber(
                contactsResponse.stats?.completed ??
                  contacts.filter((item) => item.status === "completed").length
              ),
            };

            setData((current) => ({
              ...current,
              contacts,
              contactStats,
            }));
          } catch (contactErr) {
            console.error("Contact dashboard error:", contactErr);

            setContactError(
              contactErr instanceof Error
                ? contactErr.message
                : "Unable to load contact messages."
            );

            setData((current) => ({
              ...current,
              contacts: [],
              contactStats: EMPTY_CONTACT_STATS,
            }));
          }
        } else {
          setData((current) => ({
            ...current,
            contacts: [],
            contactStats: EMPTY_CONTACT_STATS,
          }));
        }

        setLastUpdated(new Date());
      } catch (loadError) {
        console.error("Admin dashboard error:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canView]
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const totalBooks = data.books.length;
    const publishedBooks = data.books.filter(
      (book) => book.published !== false
    ).length;
    const featuredBooks = data.books.filter(
      (book) => book.featured === true
    ).length;
    const totalStock = data.books.reduce(
      (total, book) => total + Math.max(0, safeNumber(book.stock)),
      0
    );
    const lowStockBooks = data.books.filter(
      (book) => safeNumber(book.stock) > 0 && safeNumber(book.stock) <= 5
    ).length;
    const outOfStockBooks = data.books.filter(
      (book) => safeNumber(book.stock) <= 0
    ).length;

    return {
      totalBooks,
      publishedBooks,
      featuredBooks,
      totalStock,
      lowStockBooks,
      outOfStockBooks,
      totalCustomers: data.customerStats.totalCustomers,
      activeCustomers: data.customerStats.activeCustomers,
      totalReviews: data.reviewStats.total,
      pendingReviews: data.reviewStats.pending,
      totalContacts: data.contactStats.total,
      newContacts: data.contactStats.new,
    };
  }, [data]);

  const lowStockBooks = useMemo(
    () =>
      [...data.books]
        .filter((book) => safeNumber(book.stock) <= 5)
        .sort((a, b) => safeNumber(a.stock) - safeNumber(b.stock))
        .slice(0, 6),
    [data.books]
  );

  const recentCustomers = useMemo(
    () =>
      [...data.customers]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [data.customers]
  );

  const recentReviews = useMemo(
    () =>
      [...data.reviews]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [data.reviews]
  );

  const recentContacts = useMemo(
    () =>
      [...data.contacts]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [data.contacts]
  );

  const filteredActions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return QUICK_ACTIONS.filter((action) => {
      if (action.module && !canView(action.module)) {
        return false;
      }

      if (!query) return true;

      return `${action.title} ${action.description} ${action.keywords}`
        .toLowerCase()
        .includes(query);
    });
  }, [search, canView]);

  const hasInventoryAlerts =
    stats.lowStockBooks > 0 || stats.outOfStockBooks > 0;

  return (
    <main className="min-w-0 space-y-6 pb-8">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-7 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              StudyStow Administration
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Your bookstore operations, inventory, customers and customer
              feedback — all in one place.
            </p>

            {lastUpdated && (
              <p className="mt-3 text-xs text-slate-400">
                Last updated:{" "}
                {lastUpdated.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={loading || refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              {refreshing ? "Refreshing…" : "Refresh data"}
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View store
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid border-t border-slate-100 bg-slate-50/70 sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
              <BookOpen className="h-4 w-4 text-slate-700" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Catalogue</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {loading ? "Loading…" : `${formatNumber(stats.totalBooks)} books`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
              <Users className="h-4 w-4 text-slate-700" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Community</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {loading
                  ? "Loading…"
                  : `${formatNumber(stats.totalCustomers)} customers`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-4 sm:px-7">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
              <Mail className="h-4 w-4 text-slate-700" />
            </div>
            <div>
              <p className="text-xs text-slate-500">New enquiries</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {loading ? "Loading…" : formatNumber(stats.newContacts)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partial API errors */}
      {error && (
        <section
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-900">
                Some dashboard data is unavailable
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={refreshing}
              className="shrink-0 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        </section>
      )}

      {/* Main stats */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Store overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current figures returned by your admin APIs.
            </p>
          </div>
          <span className="text-xs text-slate-400">Live API data</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {canView("books") && (
            <StatCard
              title="Total books"
              value={formatNumber(stats.totalBooks)}
              subtitle={`${formatNumber(stats.publishedBooks)} published`}
              icon={BookOpen}
              href="/admin/books"
              loading={loading}
            />
          )}

          {canView("customers") && (
            <StatCard
              title="Customers"
              value={formatNumber(stats.totalCustomers)}
              subtitle={`${formatNumber(stats.activeCustomers)} active accounts`}
              icon={Users}
              href="/admin/customers"
              loading={loading}
              accent="blue"
            />
          )}

          {canView("reviews") && (
            <StatCard
              title="Customer reviews"
              value={formatNumber(stats.totalReviews)}
              subtitle={`${formatNumber(stats.pendingReviews)} awaiting moderation`}
              icon={MessageSquare}
              href="/admin/reviews"
              loading={loading}
              accent="amber"
            />
          )}

          {canView("contact") && (
            <StatCard
              title="Contact enquiries"
              value={formatNumber(stats.totalContacts)}
              subtitle={`${formatNumber(stats.newContacts)} new messages`}
              icon={Mail}
              href="/admin/contact"
              loading={loading}
              accent={stats.newContacts > 0 ? "blue" : "slate"}
            />
          )}
        </div>
      </section>

      {/* Inventory metrics */}
      {canView("inventory") && (
        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-950">
              Inventory health
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Stock levels calculated from the books returned by the API.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total units"
              value={formatNumber(stats.totalStock)}
              subtitle="Combined available stock"
              icon={Package}
              href="/admin/inventory"
              loading={loading}
            />

            <StatCard
              title="Low stock"
              value={formatNumber(stats.lowStockBooks)}
              subtitle="Books with 1–5 units"
              icon={Clock3}
              href="/admin/inventory"
              loading={loading}
              accent="amber"
            />

            <StatCard
              title="Out of stock"
              value={formatNumber(stats.outOfStockBooks)}
              subtitle="Books with no available units"
              icon={XCircle}
              href="/admin/inventory"
              loading={loading}
              accent="red"
            />

            <StatCard
              title="Featured books"
              value={formatNumber(stats.featuredBooks)}
              subtitle="Marked as featured"
              icon={Star}
              href="/admin/books"
              loading={loading}
              accent="green"
            />
          </div>
        </section>
      )}

      {/* Inventory and customers */}
      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        {canView("inventory") && (
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeading
              title="Inventory alerts"
              description="Books that may need a stock update."
              href="/admin/inventory"
            />

            {loading ? (
              <div className="space-y-4 p-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex animate-pulse gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-2/3 rounded bg-slate-100" />
                      <div className="h-3 w-1/3 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : lowStockBooks.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No stock alerts"
                description="No books with five or fewer units were found in the loaded catalogue."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockBooks.map((book) => {
                  const stock = getStockStatus(book.stock);

                  return (
                    <div
                      key={book._id}
                      className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                        <BookOpen className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/books/${encodeURIComponent(book.sku)}/edit`}
                          className="block truncate text-sm font-semibold text-slate-900 hover:underline"
                        >
                          {book.title}
                        </Link>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          SKU: {book.sku || "Not provided"}
                          {book.category?.name
                            ? ` · ${book.category.name}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${stock.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${stock.dotClass}`} />
                          {stock.text}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatCurrency(book.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasInventoryAlerts && !loading && (
              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
                <Link
                  href="/admin/inventory"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-black"
                >
                  Review inventory
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {canView("customers") && (
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeading
              title="Recent customers"
              description="Latest customer records returned by the API."
              href="/admin/customers"
            />

            {loading ? (
              <div className="space-y-4 p-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex animate-pulse gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                      <div className="h-3 w-2/3 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentCustomers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No customer records"
                description="Customer records will appear here when the customers API returns them."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCustomers.map((customer) => (
                  <div
                    key={customer._id}
                    className="flex items-center gap-3 px-5 py-4 sm:px-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
                      {getInitials(customer.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {customer.name || "Unnamed customer"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {customer.email}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500">
                        {formatDate(customer.createdAt)}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 text-[10px] font-semibold ${
                          customer.active
                            ? "text-emerald-700"
                            : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            customer.active ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        {customer.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Contact enquiries */}
      {canView("contact") && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            title="Recent contact enquiries"
            description="Messages submitted through your website contact form."
            href="/admin/contact"
            linkText="Manage enquiries"
          />

          {contactError ? (
            <div className="p-5 sm:p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  Contact messages could not be loaded
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-red-700">
                  {contactError}
                </p>
                <button
                  type="button"
                  onClick={() => void loadDashboard(true)}
                  className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading contact enquiries…
            </div>
          ) : recentContacts.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No contact enquiries"
              description="New website messages will appear here when the contact API returns them."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/60 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                      <Mail className="h-4 w-4 text-slate-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {contact.name}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getContactStatusStyle(contact.status)}`}
                        >
                          {getContactStatusLabel(contact.status)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </span>
                        {contact.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {contact.phone}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {contact.service && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                            {contact.service}
                          </span>
                        )}
                        {contact.company && (
                          <span className="text-xs text-slate-400">
                            {contact.company}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {contact.requirement}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:justify-end lg:border-0 lg:pt-0">
                    <p className="text-xs text-slate-500">
                      {formatDate(contact.createdAt)}
                    </p>
                    <Link
                      href="/admin/contact"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Open
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!contactError && !loading && (
            <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/70 sm:grid-cols-4">
              {[
                { label: "New", value: data.contactStats.new },
                { label: "Contacted", value: data.contactStats.contacted },
                { label: "In progress", value: data.contactStats.inProgress },
                { label: "Completed", value: data.contactStats.completed },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-b border-r border-slate-100 px-4 py-3 last:border-r-0 sm:border-b-0"
                >
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatNumber(item.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Reviews */}
      {canView("reviews") && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            title="Recent reviews"
            description="Latest customer ratings and written feedback."
            href="/admin/reviews"
            linkText="Manage reviews"
          />

          <div className="grid gap-0 xl:grid-cols-[0.75fr_1.25fr]">
            <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6 xl:border-b-0 xl:border-r">
              <p className="text-xs font-medium text-slate-500">
                Average rating
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-bold tracking-tight text-slate-950">
                  {loading
                    ? "—"
                    : data.reviewStats.averageRating.toFixed(1)}
                </span>
                <span className="pb-1 text-sm text-slate-400">/ 5</span>
              </div>

              <div className="mt-3">
                <RatingStars rating={data.reviewStats.averageRating} />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {loading
                  ? "Loading review statistics…"
                  : `${formatNumber(data.reviewStats.total)} total reviews reported by the API.`}
              </p>

              <div className="mt-5 space-y-3">
                {[
                  {
                    label: "Approved",
                    value: data.reviewStats.approved,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Pending",
                    value: data.reviewStats.pending,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Rejected",
                    value: data.reviewStats.rejected,
                    color: "bg-red-400",
                  },
                ].map((item) => {
                  const total = Math.max(1, data.reviewStats.total);
                  const width = Math.min(
                    100,
                    (item.value / total) * 100
                  );

                  return (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-semibold text-slate-800">
                          {loading ? "—" : formatNumber(item.value)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${item.color}`}
                          style={{ width: `${loading ? 0 : width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading reviews…
                </div>
              ) : recentReviews.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No reviews available"
                  description="Customer feedback will appear here when returned by the reviews API."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentReviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex flex-col gap-3 p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {review.title || "Customer review"}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getReviewStatusStyle(review.status)}`}
                        >
                          {review.status}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified purchase
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        {review.book?.title || "Book unavailable"}
                      </p>

                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {review.comment}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        <RatingStars rating={review.rating} />
                        <span className="text-xs text-slate-500">
                          {review.user?.name || "Customer"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(review.createdAt)}
                        </span>
                        <span className="ml-auto text-xs font-medium text-slate-500">
                          {safeNumber(review.rating).toFixed(1)} / 5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-slate-700" />
              <h2 className="text-base font-bold text-slate-950">
                Quick actions
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Search and open an administration section.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search admin sections…"
              aria-label="Search admin sections"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        {filteredActions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <Search className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-900">
              No matching sections
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try another search term or clear your search.
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  data-rbac-module={action.module}
                  className="group flex min-w-0 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition group-hover:bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {action.title}
                      </h3>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-900" />
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>StudyStow Administration</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Permission-aware dashboard
        </span>
      </footer>
    </main>
  );
}