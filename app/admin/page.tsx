"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  category?:
    | {
        _id?: string;
        name?: string;
        slug?: string;
      }
    | null;
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
  book?:
    | {
        _id?: string;
        title?: string;
        slug?: string;
        image?: string;
      }
    | null;
  user?:
    | {
        _id?: string;
        name?: string;
        email?: string;
      }
    | null;
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
  reviewStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    averageRating: number;
  };
  contacts: Contact[];
  contactStats: ContactStats;
};

type BooksResponse = {
  success: boolean;
  data?: Book[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

type CustomersResponse = {
  success: boolean;
  data?: Customer[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  stats?: {
    totalCustomers?: number;
    activeCustomers?: number;
    inactiveCustomers?: number;
    newCustomers?: number;
  };
};

type ReviewsResponse = {
  success: boolean;
  data?: Review[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  stats?: {
    total?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    averageRating?: number;
  };
};

type ContactsResponse = {
  success: boolean;
  data?: Contact[];
  items?: Contact[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  stats?: {
    total?: number;
    new?: number;
    contacted?: number;
    inProgress?: number;
    in_progress?: number;
    completed?: number;
  };
};

const EMPTY_REVIEW_STATS = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  averageRating: 0,
};

const EMPTY_CUSTOMER_STATS = {
  totalCustomers: 0,
  activeCustomers: 0,
  inactiveCustomers: 0,
  newCustomers: 0,
};

const EMPTY_CONTACT_STATS: ContactStats = {
  total: 0,
  new: 0,
  contacted: 0,
  inProgress: 0,
  completed: 0,
};

function formatDate(date: string) {
  if (!date) return "—";

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

function getInitials(name?: string) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStockStatus(stock: number) {
  if (stock <= 0) {
    return {
      text: "Out of stock",
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (stock <= 5) {
    return {
      text: `${stock} left`,
      className:
        "border-yellow-200 bg-yellow-50 text-yellow-700",
    };
  }

  return {
    text: "In stock",
    className:
      "border-green-200 bg-green-50 text-green-700",
  };
}

function getContactStatusStyle(status: ContactStatus) {
  switch (status) {
    case "new":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "contacted":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "in-progress":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "completed":
      return "border-green-200 bg-green-50 text-green-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getContactStatusLabel(status: ContactStatus) {
  switch (status) {
    case "new":
      return "New";

    case "contacted":
      return "Contacted";

    case "in-progress":
      return "In Progress";

    case "completed":
      return "Completed";

    default:
      return status;
  }
}

function RatingStars({ rating }: { rating: number }) {
  const safeRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  );

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= safeRating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Invalid server response from ${url}. Please check the API route.`
    );
  }

  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message ||
        "Failed to load dashboard data."
    );
  }

  return data as T;
}

export default function AdminDashboardPage() {
  const { canView } = useAdminPermissions();

  const [data, setData] = useState<DashboardData>({
    books: [],
    customers: [],
    customerStats: EMPTY_CUSTOMER_STATS,
    reviews: [],
    reviewStats: EMPTY_REVIEW_STATS,
    contacts: [],
    contactStats: EMPTY_CONTACT_STATS,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [contactError, setContactError] =
    useState("");

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        setError("");
        setContactError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        /*
         * Contact API is intentionally handled separately.
         * If contact API has an issue, Books / Customers /
         * Reviews dashboard should still load.
         */

        const [
          booksResponse,
          customersResponse,
          reviewsResponse,
        ] = await Promise.all([
          canView("books")
            ? fetchJson<BooksResponse>("/api/admin/books?limit=1000")
            : Promise.resolve(null),

          canView("customers")
            ? fetchJson<CustomersResponse>("/api/admin/customers?limit=1000")
            : Promise.resolve(null),

          canView("reviews")
            ? fetchJson<ReviewsResponse>("/api/admin/reviews?limit=10&page=1")
            : Promise.resolve(null),
        ]);

        const books = Array.isArray(
          booksResponse?.data
        )
          ? booksResponse.data
          : [];

        const customers = Array.isArray(
          customersResponse?.data
        )
          ? customersResponse.data
          : [];

        const safeCustomersResponse: CustomersResponse =
  customersResponse ?? {
    success: false,
    data: [],
    stats: {
      totalCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      newCustomers: 0,
    },
  };

const customerStats: CustomerStats = {
  totalCustomers: Number(
    safeCustomersResponse.stats?.totalCustomers ?? 0
  ),

  activeCustomers: Number(
    safeCustomersResponse.stats?.activeCustomers ?? 0
  ),

  inactiveCustomers: Number(
    safeCustomersResponse.stats?.inactiveCustomers ?? 0
  ),

  newCustomers: Number(
    safeCustomersResponse.stats?.newCustomers ?? 0
  ),
};

        const reviews = Array.isArray(
          reviewsResponse?.data
        )
          ? reviewsResponse.data
          : [];

        const safeReviewsResponse: ReviewsResponse =
  reviewsResponse ?? {
    success: false,
    data: [],
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      averageRating: 0,
    },
    pagination: {
      total: 0,
    },
  };

        const reviewStats = {
          total: Number(
            safeReviewsResponse.stats?.total ??
              safeReviewsResponse.pagination?.total ??
              0
          ),

          pending: Number(
            safeReviewsResponse.stats?.pending ?? 0
          ),

          approved: Number(
            safeReviewsResponse.stats?.approved ?? 0
          ),

          rejected: Number(
            safeReviewsResponse.stats?.rejected ?? 0
          ),

          averageRating: Number(
            safeReviewsResponse.stats?.averageRating ??
              0
          ),
        };

        setData((current) => ({
          ...current,
          books,
          customers,
          customerStats,
          reviews,
          reviewStats,
        }));

        /*
         * Load contacts independently.
         */
        if (canView("contact")) {
          try {
            const contactsResponse =
              await fetchJson<ContactsResponse>("/api/admin/contact?limit=5");

          const contacts = Array.isArray(
            contactsResponse.data
          )
            ? contactsResponse.data
            : Array.isArray(
                  contactsResponse.items
                )
              ? contactsResponse.items
              : [];

          const contactStats: ContactStats = {
            total: Number(
              contactsResponse.stats?.total ??
                contactsResponse.pagination
                  ?.total ??
                contacts.length
            ),

            new: Number(
              contactsResponse.stats?.new ??
                contacts.filter(
                  (item) => item.status === "new"
                ).length
            ),

            contacted: Number(
              contactsResponse.stats
                ?.contacted ??
                contacts.filter(
                  (item) =>
                    item.status === "contacted"
                ).length
            ),

            inProgress: Number(
              contactsResponse.stats
                ?.inProgress ??
                contactsResponse.stats
                  ?.in_progress ??
                contacts.filter(
                  (item) =>
                    item.status ===
                    "in-progress"
                ).length
            ),

            completed: Number(
              contactsResponse.stats
                ?.completed ??
                contacts.filter(
                  (item) =>
                    item.status ===
                    "completed"
                ).length
            ),
          };

          setData((current) => ({
            ...current,
            contacts,
            contactStats,
          }));
          } catch (contactErr) {
            console.error(
              "Contact dashboard error:",
              contactErr
            );

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
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
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
      (total, book) =>
        total +
        Math.max(0, Number(book.stock) || 0),
      0
    );

    const lowStockBooks = data.books.filter(
      (book) =>
        book.stock > 0 && book.stock <= 5
    ).length;

    const outOfStockBooks = data.books.filter(
      (book) => book.stock <= 0
    ).length;

    return {
      totalBooks,
      publishedBooks,
      featuredBooks,
      totalStock,
      lowStockBooks,
      outOfStockBooks,

      totalCustomers:
        data.customerStats.totalCustomers,

      activeCustomers:
        data.customerStats.activeCustomers,

      totalReviews: data.reviewStats.total,
      pendingReviews: data.reviewStats.pending,

      totalContacts:
        data.contactStats.total,

      newContacts:
        data.contactStats.new,
    };
  }, [data]);

  const lowStockBooks = useMemo(() => {
    return [...data.books]
      .filter((book) => book.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);
  }, [data.books]);

  const recentCustomers = useMemo(() => {
    return [...data.customers]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [data.customers]);

  const recentReviews = useMemo(() => {
    return [...data.reviews]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [data.reviews]);

  const recentContacts = useMemo(() => {
    return [...data.contacts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [data.contacts]);

  return (
    <div className="min-h-full">
      {/* Dashboard Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              StudyStow Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Monitor your bookstore, inventory,
              customers, reviews and contact enquiries
              from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void loadDashboard(true)
              }
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View Store
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Dashboard Error */}
      {error && (
        <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-red-800">
                Dashboard data load failed
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadDashboard(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </section>
      )}

      {/* Main Statistics */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Books */}
        <Link
          data-rbac-module="books"
          href="/admin/books"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Books
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : stats.totalBooks}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {loading
                  ? "Loading..."
                  : `${stats.publishedBooks} published`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <BookOpen className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </Link>

        {/* Customers */}
        <Link
          data-rbac-module="customers"
          href="/admin/customers"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Customers
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : stats.totalCustomers}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {loading
                  ? "Loading..."
                  : `${stats.activeCustomers} active accounts`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Users className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </Link>

        {/* Reviews */}
        <Link
          data-rbac-module="reviews"
          href="/admin/reviews"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Reviews
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : stats.totalReviews}
              </p>

              <p className="mt-2 text-xs text-yellow-600">
                {loading
                  ? "Loading..."
                  : `${stats.pendingReviews} pending moderation`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <MessageSquare className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </Link>

        {/* Contact Messages */}
        <Link
          data-rbac-module="contact"
          href="/admin/contact"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Contact Messages
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : stats.totalContacts}
              </p>

              <p
                className={`mt-2 text-xs ${
                  stats.newContacts > 0
                    ? "font-semibold text-blue-600"
                    : "text-slate-500"
                }`}
              >
                {loading
                  ? "Loading..."
                  : `${stats.newContacts} new enquiries`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Link>

        {/* Rating */}
        <div data-rbac-module="reviews" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Average Rating
              </p>

              <div className="mt-2 flex items-center gap-2">
                <p className="text-3xl font-bold text-slate-900">
                  {loading
                    ? "—"
                    : data.reviewStats.averageRating.toFixed(
                        1
                      )}
                </p>

                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Across submitted reviews
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Star className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Summary */}
      <section data-rbac-module="inventory" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/inventory"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : stats.totalStock}
              </p>
            </div>

            <Package className="h-5 w-5 text-slate-500" />
          </div>
        </Link>

        <Link
          href="/admin/inventory"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Low Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-600">
                {loading
                  ? "—"
                  : stats.lowStockBooks}
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-yellow-600" />
          </div>
        </Link>

        <Link
          href="/admin/inventory"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Out of Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {loading
                  ? "—"
                  : stats.outOfStockBooks}
              </p>
            </div>

            <XCircle className="h-5 w-5 text-red-600" />
          </div>
        </Link>

        <Link
          href="/admin/books"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Featured Books
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : stats.featuredBooks}
              </p>
            </div>

            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        </Link>
      </section>

      {/* Inventory + Customers */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Inventory Alert */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Inventory Alert
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Books that need stock attention.
              </p>
            </div>

            <Link
              href="/admin/inventory"
              className="text-sm font-semibold text-slate-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading inventory...
            </div>
          ) : lowStockBooks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />

              <p className="mt-3 font-semibold text-slate-900">
                Inventory looks good
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No books currently need stock
                attention.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockBooks.map((book) => {
                const stock = getStockStatus(
                  book.stock
                );

                return (
                  <div
                    key={book._id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/books/${encodeURIComponent(
                          book.sku
                        )}/edit`}
                        className="block truncate text-sm font-semibold text-slate-900 hover:underline"
                      >
                        {book.title}
                      </Link>

                      <p className="mt-1 text-xs text-slate-500">
                        SKU: {book.sku}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${stock.className}`}
                    >
                      {stock.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div data-rbac-module="customers" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Customers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest customer registrations.
              </p>
            </div>

            <Link
              href="/admin/customers"
              className="text-sm font-semibold text-slate-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading customers...
            </div>
          ) : recentCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 font-semibold text-slate-900">
                No customers yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Customer registrations will appear
                here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentCustomers.map((customer) => (
                <div
                  key={customer._id}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {getInitials(customer.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {customer.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {customer.email}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-slate-500">
                      {formatDate(
                        customer.createdAt
                      )}
                    </p>

                    <span
                      className={`mt-1 inline-block text-[10px] font-semibold ${
                        customer.active
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {customer.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Contact Messages */}
      <section data-rbac-module="contact" className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">
                Recent Contact Messages
              </h2>

              {stats.newContacts > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {stats.newContacts} New
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Latest enquiries submitted through the
              website contact form.
            </p>
          </div>

          <Link
            href="/admin/contact"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-700 hover:underline"
          >
            View All Messages
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {contactError ? (
          <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-800">
                Contact messages unavailable
              </p>

              <p className="mt-1 text-sm text-red-700">
                {contactError}
              </p>

              <Link
                href="/admin/contact"
                className="mt-3 inline-flex text-sm font-semibold text-red-800 underline"
              >
                Open Contact Messages
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading contact messages...
          </div>
        ) : recentContacts.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-900">
              No contact messages yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Website enquiries will appear here when
              customers submit the contact form.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentContacts.map((contact) => (
              <div
                key={contact._id}
                className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    {getInitials(contact.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {contact.name}
                      </p>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getContactStatusStyle(
                          contact.status
                        )}`}
                      >
                        {getContactStatusLabel(
                          contact.status
                        )}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5" />
                        {contact.email}
                      </span>

                      {contact.phone && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                        {contact.service}
                      </span>

                      {contact.company && (
                        <span className="text-xs text-slate-400">
                          {contact.company}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                      {contact.requirement}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {formatDate(
                        contact.createdAt
                      )}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Enquiry
                    </p>
                  </div>

                  <Link
                    href="/admin/contact"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                  >
                    View
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Reviews */}
      <section data-rbac-module="reviews" className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Reviews
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest customer feedback.
            </p>
          </div>

          <Link
            href="/admin/reviews"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-700 hover:underline"
          >
            Manage Reviews
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading reviews...
          </div>
        ) : recentReviews.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-900">
              No reviews yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Customer reviews will appear here once
              submitted.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentReviews.map((review) => (
              <div
                key={review._id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      {review.title ||
                        "Customer Review"}
                    </p>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        review.status ===
                        "approved"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : review.status ===
                              "pending"
                            ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                            : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {review.status}
                    </span>

                    {review.verifiedPurchase && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {review.book?.title ||
                      "Book unavailable"}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {review.comment}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <RatingStars
                      rating={review.rating}
                    />

                    <span className="text-xs text-slate-400">
                      {review.user?.name ||
                        "Customer"}
                    </span>

                    <span className="text-xs text-slate-400">
                      {formatDate(
                        review.createdAt
                      )}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/reviews/${review._id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="mt-6">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quickly access the main administration
            sections.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Link
            href="/admin/books/new"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          >
            <BookOpen className="h-5 w-5 text-slate-700" />

            <h3 className="mt-4 font-semibold text-slate-900">
              Add Book
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add a new book to your store.
            </p>

            <ChevronRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </Link>

          <Link
            data-rbac-module="orders"
            href="/admin/orders"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          >
            <Package className="h-5 w-5 text-slate-700" />

            <h3 className="mt-4 font-semibold text-slate-900">
              Orders
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer orders and payments.
            </p>

            <ChevronRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </Link>

          <Link
            data-rbac-module="inventory"
            href="/admin/inventory"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          >
            <Package className="h-5 w-5 text-slate-700" />

            <h3 className="mt-4 font-semibold text-slate-900">
              Inventory
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Monitor stock and availability.
            </p>

            <ChevronRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </Link>

          <Link
            data-rbac-module="reviews"
            href="/admin/reviews"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          >
            <MessageSquare className="h-5 w-5 text-slate-700" />

            <h3 className="mt-4 font-semibold text-slate-900">
              Reviews
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Moderate customer reviews.
            </p>

            <ChevronRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </Link>

          <Link
            data-rbac-module="contact"
            href="/admin/contact"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          >
            <Mail className="h-5 w-5 text-blue-600" />

            <h3 className="mt-4 font-semibold text-slate-900">
              Contact Messages
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              View and manage website enquiries.
            </p>

            <div className="mt-3 flex items-center gap-2">
              {stats.newContacts > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                  {stats.newContacts} New
                </span>
              )}

              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Dashboard Footer */}
      <div className="mt-8 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        StudyStow Admin Panel
      </div>
    </div>
  );
}