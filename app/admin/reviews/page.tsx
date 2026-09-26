import Link from "next/link";
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
} from "lucide-react";

type ReviewStatus = "Approved" | "Pending" | "Rejected";

type Review = {
  id: string;
  product: string;
  customer: string;
  email: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  date: string;
  verifiedPurchase: boolean;
};

const reviews: Review[] = [
  {
    id: "REV-1048",
    product: "Atomic Habits",
    customer: "Rahul Kumar",
    email: "rahul@example.com",
    rating: 5,
    title: "Excellent book",
    comment:
      "Very useful book with practical ideas. The content is easy to understand and implement.",
    status: "Approved",
    date: "25 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-1047",
    product: "The Psychology of Money",
    customer: "Priya Sharma",
    email: "priya@example.com",
    rating: 5,
    title: "Must read",
    comment:
      "One of the best books about money and personal finance. Highly recommended.",
    status: "Pending",
    date: "25 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-1046",
    product: "Deep Work",
    customer: "Amit Singh",
    email: "amit@example.com",
    rating: 4,
    title: "Very informative",
    comment:
      "Good book for improving focus and productivity. Some chapters are a little repetitive.",
    status: "Pending",
    date: "24 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-1045",
    product: "Ikigai",
    customer: "Neha Verma",
    email: "neha@example.com",
    rating: 4,
    title: "Simple and meaningful",
    comment:
      "A nice and easy read. The concepts are simple but worth thinking about.",
    status: "Approved",
    date: "24 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-1044",
    product: "The Alchemist",
    customer: "Vikas Gupta",
    email: "vikas@example.com",
    rating: 5,
    title: "Beautiful story",
    comment:
      "Loved the story and the message behind it. The book quality was also good.",
    status: "Approved",
    date: "23 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-1043",
    product: "Think and Grow Rich",
    customer: "Anjali Das",
    email: "anjali@example.com",
    rating: 2,
    title: "Not what I expected",
    comment:
      "The book was okay but I did not find the content as useful as expected.",
    status: "Rejected",
    date: "22 Sep 2026",
    verifiedPurchase: false,
  },
  {
    id: "REV-1042",
    product: "Rich Dad Poor Dad",
    customer: "Saurabh Roy",
    email: "saurabh@example.com",
    rating: 5,
    title: "Great finance book",
    comment:
      "Very easy to understand and changed the way I think about money.",
    status: "Approved",
    date: "21 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-1041",
    product: "The 7 Habits of Highly Effective People",
    customer: "Pooja Singh",
    email: "pooja@example.com",
    rating: 4,
    title: "Helpful concepts",
    comment:
      "Good book with useful concepts for both personal and professional life.",
    status: "Pending",
    date: "20 Sep 2026",
    verifiedPurchase: true,
  },
];

const statusStyles: Record<ReviewStatus, string> = {
  Approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending:
    "bg-amber-50 text-amber-700 border-amber-200",
  Rejected:
    "bg-red-50 text-red-700 border-red-200",
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
  if (status === "Approved") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "Rejected") {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  return <Clock3 className="h-3.5 w-3.5" />;
}

export default function AdminReviewPage() {
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved"
  ).length;
  const pendingReviews = reviews.filter(
    (review) => review.status === "Pending"
  ).length;
  const rejectedReviews = reviews.filter(
    (review) => review.status === "Rejected"
  ).length;

  const averageRating =
    reviews.reduce((total, review) => total + review.rating, 0) /
    reviews.length;

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
        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Reviews
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalReviews}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  All customer reviews
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Reviews
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {pendingReviews}
                </p>
                <p className="mt-1 text-xs text-amber-600">
                  Waiting for moderation
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 p-3">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Approved Reviews
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {approvedReviews}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  Published on store
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Rating
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </p>
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Across all reviews
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Rating Breakdown */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Rating Overview
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Distribution of customer ratings.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(
                (review) => review.rating === rating
              ).length;

              const percentage = Math.round((count / totalReviews) * 100);

              return (
                <div
                  key={rating}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {rating}
                      </span>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>

                    <span className="text-xs text-gray-500">
                      {count} reviews
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${percentage}%` }}
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
                placeholder="Search reviews, customers or products..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                defaultValue="all"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-900"
              >
                <option value="all">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                defaultValue="all"
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
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
          </div>
        </section>

        {/* Desktop Table */}
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
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Review</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Rating</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {review.title}
                          </p>

                          {review.verifiedPurchase && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {review.product}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {review.comment}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                          {review.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {review.customer
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.customer}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.email}
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
                        {review.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        {review.date}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/review/${review.id}`}
                          aria-label={`View ${review.id}`}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {review.status === "Pending" && (
                          <>
                            <button
                              type="button"
                              aria-label={`Approve ${review.id}`}
                              className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              aria-label={`Reject ${review.id}`}
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          aria-label={`More options for ${review.id}`}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
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

          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">1</span> to{" "}
              <span className="font-medium text-gray-900">
                {reviews.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {reviews.length}
              </span>{" "}
              reviews
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400"
              >
                Previous
              </button>

              <button
                type="button"
                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"
              >
                1
              </button>

              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Reviews */}
        <section className="space-y-4 lg:hidden">
          <div>
            <h2 className="font-semibold text-gray-900">
              Customer Reviews
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review moderation and customer feedback.
            </p>
          </div>

          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {review.title}
                    </h3>

                    {review.verifiedPurchase && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs font-medium text-gray-500">
                    {review.product}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyles[review.status]}`}
                >
                  <StatusIcon status={review.status} />
                  {review.status}
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                    {review.customer
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <p className="truncate text-sm font-medium text-gray-900">
                        {review.customer}
                      </p>
                    </div>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {review.email}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {review.date}
                  </span>

                  <span>{review.id}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/review/${review.id}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>

                {review.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-700 transition hover:bg-emerald-100"
                      aria-label={`Approve ${review.id}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-red-700 transition hover:bg-red-100"
                      aria-label={`Reject ${review.id}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  aria-label={`More options for ${review.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2.5 text-gray-600 transition hover:bg-gray-50"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Moderation Information */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              Pending Moderation
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Review pending customer feedback before publishing it on the
              storefront.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              Published Reviews
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Approved reviews are visible on the corresponding book detail
              pages.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              Customer Feedback
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Use ratings and review feedback to understand product
              satisfaction.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
