import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Package,
  Search,
  Settings,
  Star,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

type ReviewStatus = "Approved" | "Pending" | "Rejected";

type Review = {
  id: string;
  customer: string;
  email: string;
  product: string;
  productSlug: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  date: string;
  verifiedPurchase: boolean;
};

const reviews: Review[] = [
  {
    id: "REV-2026-00125",
    customer: "Rahul Kumar",
    email: "rahul@example.com",
    product: "Atomic Habits",
    productSlug: "atomic-habits",
    rating: 5,
    title: "Excellent book",
    comment:
      "Very useful book with practical ideas. The content is easy to understand and implement.",
    status: "Approved",
    date: "26 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-2026-00124",
    customer: "Priya Sharma",
    email: "priya@example.com",
    product: "The Psychology of Money",
    productSlug: "the-psychology-of-money",
    rating: 5,
    title: "Must read",
    comment:
      "One of the best books about money and personal finance. Highly recommended.",
    status: "Pending",
    date: "25 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-2026-00123",
    customer: "Amit Singh",
    email: "amit@example.com",
    product: "Deep Work",
    productSlug: "deep-work",
    rating: 4,
    title: "Very informative",
    comment:
      "Good book for improving focus and productivity. Some chapters are a little repetitive.",
    status: "Pending",
    date: "25 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-2026-00122",
    customer: "Neha Verma",
    email: "neha@example.com",
    product: "Ikigai",
    productSlug: "ikigai",
    rating: 4,
    title: "Simple and meaningful",
    comment:
      "A nice and easy read. The concepts are simple but worth thinking about.",
    status: "Approved",
    date: "24 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-2026-00121",
    customer: "Vikas Gupta",
    email: "vikas@example.com",
    product: "The Alchemist",
    productSlug: "the-alchemist",
    rating: 5,
    title: "Beautiful story",
    comment:
      "Loved the story and the message behind it. The book quality was also good.",
    status: "Approved",
    date: "23 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-2026-00120",
    customer: "Anjali Das",
    email: "anjali@example.com",
    product: "Think and Grow Rich",
    productSlug: "think-and-grow-rich",
    rating: 2,
    title: "Not what I expected",
    comment:
      "The book was okay but I did not find the content as useful as expected.",
    status: "Rejected",
    date: "22 Sep 2026",
    verifiedPurchase: false,
  },
  {
    id: "REV-2026-00119",
    customer: "Saurabh Roy",
    email: "saurabh@example.com",
    product: "Rich Dad Poor Dad",
    productSlug: "rich-dad-poor-dad",
    rating: 5,
    title: "Great finance book",
    comment:
      "Very easy to understand and changed the way I think about money.",
    status: "Approved",
    date: "21 Sep 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-2026-00118",
    customer: "Pooja Singh",
    email: "pooja@example.com",
    product: "The 7 Habits of Highly Effective People",
    productSlug: "the-7-habits-of-highly-effective-people",
    rating: 4,
    title: "Helpful concepts",
    comment:
      "Good book with useful concepts for both personal and professional life.",
    status: "Pending",
    date: "20 Sep 2026",
    verifiedPurchase: true,
  },
];

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Books",
    href: "/admin/books",
    icon: BookOpen,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FileText,
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: FileText,
  },
  {
    label: "Reviews",
    href: "/admin/review",
    icon: MessageSquare,
  },
  {
    label: "Pages",
    href: "/admin/pages",
    icon: FileText,
  },
];

function getStatusClass(status: ReviewStatus) {
  switch (status) {
    case "Approved":
      return "border-green-200 bg-green-50 text-green-700";
    case "Pending":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "Rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function getStatusIcon(status: ReviewStatus) {
  if (status === "Approved") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "Rejected") {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  return <Clock3 className="h-3.5 w-3.5" />;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
    reviews.reduce((sum, review) => sum + review.rating, 0) /
    reviews.length;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <Link href="/admin" className="hover:text-gray-900">
                  Admin
                </Link>

                <ChevronRight className="h-4 w-4" />

                <span className="text-gray-900">Reviews</span>
              </div>

              <p className="text-sm font-medium text-gray-500">
                Customer Feedback
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                Reviews
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Review, moderate and manage customer feedback for your books.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              View Store
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Admin Navigation */}
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <nav className="flex min-w-max">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/admin/review";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm transition sm:px-5 ${
                    active
                      ? "border-gray-900 font-semibold text-gray-900"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Breadcrumb / Quick Links */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          <ChevronRight className="h-4 w-4" />

          <span className="font-medium text-gray-900">Reviews</span>
        </div>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalReviews}
                </p>
                <p className="mt-3 text-xs text-gray-500">
                  All customer feedback
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <MessageSquare className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Reviews</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {pendingReviews}
                </p>
                <p className="mt-3 text-xs font-medium text-yellow-600">
                  Need moderation
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
                <Clock3 className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {approvedReviews}
                </p>
                <p className="mt-3 text-xs font-medium text-green-600">
                  Visible on store
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>

                <div className="mt-2 flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </p>

                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  From all submitted reviews
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Star className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
          {/* Section Header */}
          <div className="border-b p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Customer Reviews
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage reviews submitted for products in your store.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin/books"
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <BookOpen className="h-4 w-4" />
                  Books
                </Link>

                <Link
                  href="/admin/customers"
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Users className="h-4 w-4" />
                  Customers
                </Link>

                <Link
                  href="/admin/pages"
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4" />
                  Pages
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b bg-gray-50/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="search"
                  placeholder="Search by review, customer, product or review ID..."
                  className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                />
              </div>

              <select
                defaultValue="all"
                className="rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-900"
              >
                <option value="all">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                defaultValue="all"
                className="rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-900"
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
                className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Review
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rating
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5">
                      <div className="max-w-md">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {review.title}
                          </p>

                          {review.verifiedPurchase && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                              Verified Purchase
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/books/${review.productSlug}`}
                          className="mt-1 inline-block text-xs font-medium text-gray-500 hover:text-gray-900 hover:underline"
                        >
                          {review.product}
                        </Link>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                          {review.comment}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                          {review.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                          {getInitials(review.customer)}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href="/admin/customers"
                            className="block truncate text-sm font-semibold text-gray-900 hover:underline"
                          >
                            {review.customer}
                          </Link>

                          <p className="truncate text-xs text-gray-500">
                            {review.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <RatingStars rating={review.rating} />

                      <p className="mt-1 text-xs text-gray-500">
                        {review.rating}/5
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                          review.status
                        )}`}
                      >
                        {getStatusIcon(review.status)}
                        {review.status}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock3 className="h-4 w-4 text-gray-400" />
                        {review.date}
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/review/${review.id}`}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          aria-label="View review"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {review.status === "Pending" && (
                          <>
                            <button
                              type="button"
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                              aria-label="Approve review"
                            >
                              <Check className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              aria-label="Reject review"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                          aria-label="More options"
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

          {/* Mobile */}
          <div className="divide-y lg:hidden">
            {reviews.map((review) => (
              <article key={review.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {review.title}
                      </h3>

                      {review.verifiedPurchase && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          Verified
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/books/${review.productSlug}`}
                      className="mt-1 block text-xs font-medium text-gray-500 hover:text-gray-900 hover:underline"
                    >
                      {review.product}
                    </Link>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                      review.status
                    )}`}
                  >
                    {getStatusIcon(review.status)}
                    {review.status}
                  </span>
                </div>

                <div className="mt-4">
                  <RatingStars rating={review.rating} />

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {review.comment}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t pt-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                    {getInitials(review.customer)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {review.customer}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {review.email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/review/${review.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>

                  {review.status === "Pending" && (
                    <>
                      <button
                        type="button"
                        className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-green-700 hover:bg-green-100"
                        aria-label="Approve review"
                      >
                        <Check className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-red-700 hover:bg-red-100"
                        aria-label="Reject review"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="rounded-lg border px-3 py-2.5 text-gray-600 hover:bg-gray-50"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {reviews.length}
              </span>{" "}
              reviews
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="rounded-lg border px-3 py-2 text-sm text-gray-400"
              >
                Previous
              </button>

              <button
                type="button"
                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
              >
                1
              </button>

              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* Connected Admin Sections */}
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/books"
            className="group rounded-xl border bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <BookOpen className="h-5 w-5 text-gray-700" />
              </div>

              <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Book Reviews
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage books and open their storefront pages.
            </p>
          </Link>

          <Link
            href="/admin/customers"
            className="group rounded-xl border bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <UserRound className="h-5 w-5 text-gray-700" />
              </div>

              <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Customers
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Open customer accounts related to reviews.
            </p>
          </Link>

          <Link
            href="/admin/pages"
            className="group rounded-xl border bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <FileText className="h-5 w-5 text-gray-700" />
              </div>

              <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Website Pages
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage homepage, policies, FAQ and website pages.
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="group rounded-xl border bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Package className="h-5 w-5 text-gray-700" />
              </div>

              <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Orders
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Check verified purchases and customer orders.
            </p>
          </Link>
        </section>

        {/* Review Summary */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">
              Review Moderation
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current review publishing status.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Approved Reviews</span>
                  <span className="font-semibold text-gray-900">
                    {approvedReviews}/{totalReviews}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${(approvedReviews / totalReviews) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Pending Reviews</span>
                  <span className="font-semibold text-gray-900">
                    {pendingReviews}/{totalReviews}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-yellow-500"
                    style={{
                      width: `${(pendingReviews / totalReviews) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Rejected Reviews</span>
                  <span className="font-semibold text-gray-900">
                    {rejectedReviews}/{totalReviews}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${(rejectedReviews / totalReviews) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Review Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Connected admin sections.
                </p>
              </div>

              <Settings className="h-5 w-5 text-gray-400" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/admin/categories"
                className="rounded-lg border p-4 hover:bg-gray-50"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Categories
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Manage book categories
                </p>
              </Link>

              <Link
                href="/admin/inventory"
                className="rounded-lg border p-4 hover:bg-gray-50"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Inventory
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Check product availability
                </p>
              </Link>

              <Link
                href="/admin/coupons"
                className="rounded-lg border p-4 hover:bg-gray-50"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Coupons
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Manage promotional codes
                </p>
              </Link>

              <Link
                href="/admin/pages"
                className="rounded-lg border p-4 hover:bg-gray-50"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Pages
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Manage website content
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">
          StudyStow Admin Panel
        </div>
      </div>
    </main>
  );
}
