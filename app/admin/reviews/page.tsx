"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Star,
  Search,
  Filter,
  Eye,
  Check,
  X,
  MessageSquare,
  TrendingUp,
  Clock3,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Package,
  User,
  CalendarDays,
  RefreshCw,
  Trash2,
} from "lucide-react";

type ReviewStatus = "approved" | "pending" | "rejected";

type Review = {
  _id: string;
  book: {
    _id: string;
    title: string;
    slug: string;
    image?: string;
  } | null;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  rating: number;
  title?: string;
  comment: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

type ApiResponse = {
  success: boolean;
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: Stats;
  message?: string;
};

const statusStyles: Record<ReviewStatus, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels: Record<ReviewStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function StatusIcon({ status }: { status: ReviewStatus }) {
  if (status === "approved") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "rejected") {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  return <Clock3 className="h-3.5 w-3.5" />;
}

function getInitials(name?: string) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0,
    ratingBreakdown: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ReviewStatus>("all");
  const [rating, setRating] = useState<"all" | "1" | "2" | "3" | "4" | "5">(
    "all"
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [actionId, setActionId] = useState<string | null>(null);

  const limit = 10;

  const fetchReviews = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (status !== "all") {
          params.set("status", status);
        }

        if (rating !== "all") {
          params.set("rating", rating);
        }

        const response = await fetch(`/api/reviews?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch reviews");
        }

        setReviews(result.data || []);
        setStats(
          result.stats || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            averageRating: 0,
            ratingBreakdown: {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            },
          }
        );

        setTotalPages(result.pagination?.totalPages || 1);
        setTotalReviews(result.pagination?.total || 0);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, rating, search, status]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchReviews]);

  useEffect(() => {
    setPage(1);
  }, [search, status, rating]);

  async function updateReviewStatus(
    reviewId: string,
    nextStatus: ReviewStatus
  ) {
    try {
      setActionId(reviewId);
      setError("");

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update review");
      }

      await fetchReviews(true);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  }

  async function deleteReview(reviewId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(reviewId);
      setError("");

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete review");
      }

      if (reviews.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchReviews(true);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  }

  const ratingRows = useMemo(() => {
    return [5, 4, 3, 2, 1] as const;
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <Link
                  href="/admin"
                  className="transition hover:text-gray-900"
                >
                  Admin
                </Link>

                <span>/</span>

                <span className="text-gray-900">Reviews</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Review Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer reviews, ratings and moderation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchReviews(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                Refresh
              </button>

              <Link
                href="/admin/books"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Package className="h-4 w-4" />
                Manage Books
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-red-800">
                Failed to load reviews
              </p>

              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchReviews(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Reviews"
            value={stats.total}
            description="All customer reviews"
            icon={<MessageSquare className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-50"
          />

          <StatCard
            title="Pending Reviews"
            value={stats.pending}
            description="Waiting for moderation"
            descriptionClass="text-amber-600"
            icon={<Clock3 className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-50"
          />

          <StatCard
            title="Approved Reviews"
            value={stats.approved}
            description="Published on store"
            descriptionClass="text-emerald-600"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
          />

          <StatCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            description="Across all reviews"
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            iconBg="bg-purple-50"
            suffix={
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            }
          />
        </section>

        {/* Rating Breakdown */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Rating Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Distribution of customer ratings.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-5">
            {ratingRows.map((ratingValue) => {
              const count =
                stats.ratingBreakdown[ratingValue] || 0;

              const percentage =
                stats.total > 0
                  ? Math.round((count / stats.total) * 100)
                  : 0;

              return (
                <div
                  key={ratingValue}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {ratingValue}
                      </span>

                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>

                    <span className="text-xs text-gray-500">
                      {count} reviews
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {percentage}% of reviews
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reviews, customers or products..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as "all" | ReviewStatus
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-900"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={rating}
                onChange={(event) =>
                  setRating(
                    event.target.value as
                      | "all"
                      | "1"
                      | "2"
                      | "3"
                      | "4"
                      | "5"
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-900"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setRating("all");
                  setPage(1);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* Desktop */}
        <section className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Customer Reviews
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review moderation and customer feedback.
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <LoadingTable />
            ) : reviews.length === 0 ? (
              <EmptyReviews />
            ) : (
              <table className="w-full min-w-[1150px]">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Review</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {reviews.map((review) => {
                    const busy = actionId === review._id;

                    return (
                      <tr
                        key={review._id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="max-w-md">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {review.title || "Customer Review"}
                              </p>

                              {review.verifiedPurchase && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                  Verified
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs font-medium text-gray-500">
                              {review.book?.title ||
                                "Book unavailable"}
                            </p>

                            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                              {review.comment}
                            </p>

                            <p className="mt-2 text-xs text-gray-400">
                              {review._id}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                              {getInitials(review.user?.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {review.user?.name ||
                                  "Unknown customer"}
                              </p>

                              <p className="truncate text-xs text-gray-500">
                                {review.user?.email ||
                                  "Email unavailable"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <RatingStars rating={review.rating} />

                          <p className="mt-1 text-xs text-gray-500">
                            {review.rating}/5
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[review.status]}`}
                          >
                            <StatusIcon status={review.status} />
                            {statusLabels[review.status]}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {formatDate(review.createdAt)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/reviews/${review._id}`}
                              aria-label={`View review ${review._id}`}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            {review.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    updateReviewStatus(
                                      review._id,
                                      "approved"
                                    )
                                  }
                                  aria-label={`Approve ${review._id}`}
                                  className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Check className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    updateReviewStatus(
                                      review._id,
                                      "rejected"
                                    )
                                  }
                                  aria-label={`Reject ${review._id}`}
                                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                deleteReview(review._id)
                              }
                              aria-label={`Delete ${review._id}`}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {busy ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              aria-label={`More options for ${review._id}`}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && reviews.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalReviews}
              limit={limit}
              currentCount={reviews.length}
              onPageChange={setPage}
            />
          )}
        </section>

        {/* Mobile */}
        <section className="space-y-4 lg:hidden">
          <div>
            <h2 className="font-semibold text-gray-900">
              Customer Reviews
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review moderation and customer feedback.
            </p>
          </div>

          {loading ? (
            <MobileLoading />
          ) : reviews.length === 0 ? (
            <EmptyReviews />
          ) : (
            <>
              {reviews.map((review) => {
                const busy = actionId === review._id;

                return (
                  <article
                    key={review._id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {review.title || "Customer Review"}
                          </h3>

                          {review.verifiedPurchase && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {review.book?.title ||
                            "Book unavailable"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyles[review.status]}`}
                      >
                        <StatusIcon status={review.status} />
                        {statusLabels[review.status]}
                      </span>
                    </div>

                    <div className="mt-4">
                      <RatingStars rating={review.rating} />

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {review.comment}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {getInitials(review.user?.name)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-gray-400" />

                            <p className="truncate text-sm font-medium text-gray-900">
                              {review.user?.name ||
                                "Unknown customer"}
                            </p>
                          </div>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {review.user?.email ||
                              "Email unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(review.createdAt)}
                        </span>

                        <span className="max-w-[150px] truncate">
                          {review._id}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/admin/reviews/${review._id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>

                      {review.status === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateReviewStatus(
                                review._id,
                                "approved"
                              )
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateReviewStatus(
                                review._id,
                                "rejected"
                              )
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteReview(review._id)}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2.5 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {busy ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}

              <Pagination
                page={page}
                totalPages={totalPages}
                total={totalReviews}
                limit={limit}
                currentCount={reviews.length}
                onPageChange={setPage}
              />
            </>
          )}
        </section>

        {/* Moderation Information */}
        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<Clock3 className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-50"
            title="Pending Moderation"
            description="Review pending customer feedback before publishing it on the storefront."
          />

          <InfoCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            title="Published Reviews"
            description="Approved reviews are visible on the corresponding book detail pages."
          />

          <InfoCard
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-50"
            title="Customer Feedback"
            description="Use ratings and review feedback to understand product satisfaction."
          />
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  descriptionClass = "text-gray-500",
  icon,
  iconBg,
  suffix,
}: {
  title: string;
  value: string | number;
  description: string;
  descriptionClass?: string;
  icon: React.ReactNode;
  iconBg: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {value}
            </p>

            {suffix}
          </div>

          <p className={`mt-1 text-xs ${descriptionClass}`}>
            {description}
          </p>
        </div>

        <div className={`rounded-lg p-3 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  limit,
  currentCount,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  currentCount: number;
  onPageChange: (page: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min((page - 1) * limit + currentCount, total);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium text-gray-900">
          {start}
        </span>{" "}
        to{" "}
        <span className="font-medium text-gray-900">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-900">
          {total}
        </span>{" "}
        reviews
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <span className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white">
          {page}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-lg bg-gray-100"
        />
      ))}
    </div>
  );
}

function MobileLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-xl bg-gray-200"
        />
      ))}
    </div>
  );
}

function EmptyReviews() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <MessageSquare className="h-6 w-6 text-gray-400" />
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">
        No reviews found
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        No customer reviews match the current search and filters.
      </p>
    </div>
  );
}