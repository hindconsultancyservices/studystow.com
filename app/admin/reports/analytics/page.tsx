"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Download,
  Eye,
  Globe2,
  LayoutDashboard,
  Monitor,
  Package,
  RefreshCcw,
  ShoppingBag,
  Smartphone,
  Tablet,
  TicketPercent,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
  AlertTriangle,
  Clock3,
  IndianRupee,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Range =
  | "Today"
  | "7 Days"
  | "30 Days"
  | "90 Days"
  | "12 Months";

type AnalyticsData = {
  range: string;

  metrics: {
    revenue: number;
    orders: number;
    customers: number;
    averageOrderValue: number;
    booksSold: number;
    revenueChange: number;
    orderChange: number;
    customerChange: number;
  };

  orderStatuses: {
    name: string;
    count: number;
    percentage: number;
  }[];

  topBooks: {
    title: string;
    sold: number;
    revenue: number;
    stock: number;
  }[];

  categories: {
    name: string;
    sales: number;
    revenue: number;
    percentage: number;
  }[];

  paymentMethods: {
    _id: string;
    orders: number;
    amount: number;
  }[];

  recentOrders: {
    id: string;
    customer: string;
    amount: number;
    status: string;
    payment: string;
    createdAt: string;
  }[];

  inventory: {
    totalProducts: number;
    totalUnits: number;
    lowStock: number;
    outOfStock: number;
    lowStockItems: {
      title: string;
      stock: number;
    }[];
  };

  refunds: {
    amount: number;
    orders: number;
  };

  discounts: {
    amount: number;
  };

  unavailable: string[];
};

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatPercent(value: number) {
  const number = Number(value || 0);

  return `${number >= 0 ? "+" : ""}${number.toFixed(1)}%`;
}

function formatPaymentMethod(value: string) {
  if (value === "razorpay") return "Razorpay";
  if (value === "cod") return "Cash on Delivery";

  return value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : "Other";
}

function formatOrderStatus(value: string) {
  if (!value) return "Unknown";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getRangeParam(range: Range) {
  switch (range) {
    case "Today":
      return "today";
    case "7 Days":
      return "7";
    case "90 Days":
      return "90";
    case "12 Months":
      return "12m";
    default:
      return "30";
  }
}

function getTimeAgo(date: string) {
  const created = new Date(date).getTime();
  const now = Date.now();

  const seconds = Math.floor((now - created) / 1000);

  if (seconds < 60) {
    return `${Math.max(seconds, 1)} sec ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const styles: Record<string, string> = {
    delivered: "bg-emerald-50 text-emerald-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-violet-50 text-violet-700",
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-cyan-50 text-cyan-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[normalized] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {formatOrderStatus(status)}
    </span>
  );
}

function MetricCard({
  title,
  value,
  change,
  positive = true,
  icon,
  subtitle,
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: ReactNode;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}

          {change}
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <div className="text-slate-700">{icon}</div>

          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>
        </div>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function EmptyData({
  text = "No data available",
}: {
  text?: string;
}) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
      {text}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30 Days");
  const [rangeOpen, setRangeOpen] = useState(false);

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/analytics?range=${getRangeParam(range)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load analytics"
          );
        }

        if (!cancelled) {
          setAnalytics(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load analytics"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [range]);

  function exportReport() {
    if (!analytics) return;

    const blob = new Blob(
      [JSON.stringify(analytics, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `studystow-analytics-${getRangeParam(
      range
    )}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-72 rounded-lg bg-slate-200" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="h-80 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-700">
            Failed to load analytics
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const metrics = analytics.metrics;

  const maxBookRevenue = Math.max(
    ...analytics.topBooks.map((book) => book.revenue),
    1
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="space-y-7 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LayoutDashboard className="h-4 w-4" />
              Admin
              <span>/</span>
              Analytics
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Analytics & Reports
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Real-time store performance from MongoDB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setRangeOpen((value) => !value)
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <CalendarDays className="h-4 w-4" />

                {range}

                <ChevronDown className="h-4 w-4" />
              </button>

              {rangeOpen && (
                <div className="absolute right-0 top-12 z-30 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {(
                    [
                      "Today",
                      "7 Days",
                      "30 Days",
                      "90 Days",
                      "12 Months",
                    ] as Range[]
                  ).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setRange(item);
                        setRangeOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                        range === item
                          ? "bg-slate-100 font-semibold text-slate-900"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={exportReport}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.revenue)}
            change={formatPercent(
              metrics.revenueChange
            )}
            positive={metrics.revenueChange >= 0}
            icon={
              <CircleDollarSign className="h-5 w-5" />
            }
            subtitle={`vs previous ${range.toLowerCase()}`}
          />

          <MetricCard
            title="Total Orders"
            value={metrics.orders.toLocaleString(
              "en-IN"
            )}
            change={formatPercent(metrics.orderChange)}
            positive={metrics.orderChange >= 0}
            icon={
              <ShoppingBag className="h-5 w-5" />
            }
            subtitle="orders placed"
          />

          <MetricCard
            title="New Customers"
            value={metrics.customers.toLocaleString(
              "en-IN"
            )}
            change={formatPercent(
              metrics.customerChange
            )}
            positive={metrics.customerChange >= 0}
            icon={<Users className="h-5 w-5" />}
            subtitle="new customers"
          />

          <MetricCard
            title="Average Order Value"
            value={formatCurrency(
              metrics.averageOrderValue
            )}
            change="—"
            icon={<Wallet className="h-5 w-5" />}
            subtitle="average per order"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-slate-500" />

              <span className="text-sm font-medium text-slate-500">
                Books Sold
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {metrics.booksSold.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              during selected period
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-500" />

              <span className="text-sm font-medium text-slate-500">
                Total Products
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {analytics.inventory.totalProducts.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              books in inventory
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />

              <span className="text-sm font-medium text-slate-500">
                Low Stock
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-amber-600">
              {analytics.inventory.lowStock}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              products need attention
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />

              <span className="text-sm font-medium text-slate-500">
                Out of Stock
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-red-600">
              {analytics.inventory.outOfStock}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              products unavailable
            </p>
          </div>
        </div>

        {/* Revenue + Order Status */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <SectionHeader
              icon={<BarChart3 className="h-5 w-5" />}
              title="Revenue Overview"
              description={`Revenue for selected ${range.toLowerCase()}`}
              action={
                <span className="text-xs font-medium text-slate-400">
                  {formatCurrency(metrics.revenue)}
                </span>
              }
            />

            {analytics.topBooks.length === 0 ? (
              <EmptyData text="No sales data available for this period" />
            ) : (
              <div className="space-y-5">
                {analytics.topBooks.map((book) => {
                  const width = Math.max(
                    5,
                    (book.revenue / maxBookRevenue) * 100
                  );

                  return (
                    <div key={book.title}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="truncate text-sm font-medium text-slate-700">
                          {book.title}
                        </span>

                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {formatCurrency(book.revenue)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-800"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Order Status"
              description="Orders during selected period"
            />

            <div className="space-y-5">
              {analytics.orderStatuses.length === 0 ? (
                <EmptyData text="No orders found" />
              ) : (
                analytics.orderStatuses.map((item) => {
                  let Icon = Clock3;

                  if (item.name === "delivered") {
                    Icon = CheckCircle2;
                  } else if (
                    item.name === "cancelled"
                  ) {
                    Icon = XCircle;
                  } else if (item.name === "shipped") {
                    Icon = Package;
                  } else if (
                    item.name === "pending"
                  ) {
                    Icon = AlertTriangle;
                  }

                  return (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-500" />

                          <span className="text-sm font-medium text-slate-700">
                            {formatOrderStatus(
                              item.name
                            )}
                          </span>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {item.count}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-800"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Top Books + Categories */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<BookOpen className="h-5 w-5" />}
              title="Top Selling Books"
              description="Best performing products"
            />

            {analytics.topBooks.length === 0 ? (
              <EmptyData text="No book sales found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Book
                      </th>

                      <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Sold
                      </th>

                      <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Revenue
                      </th>

                      <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Stock
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analytics.topBooks.map(
                      (book, index) => (
                        <tr
                          key={book.title}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                                #{index + 1}
                              </span>

                              <p className="max-w-[240px] truncate text-sm font-semibold text-slate-800">
                                {book.title}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 text-sm font-semibold text-slate-700">
                            {book.sold}
                          </td>

                          <td className="py-4 text-sm font-semibold text-slate-700">
                            {formatCurrency(book.revenue)}
                          </td>

                          <td className="py-4">
                            <span
                              className={`text-sm font-semibold ${
                                book.stock <= 10
                                  ? "text-red-600"
                                  : "text-slate-700"
                              }`}
                            >
                              {book.stock}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<BarChart3 className="h-5 w-5" />}
              title="Category Performance"
              description="Sales distribution by category"
            />

            {analytics.categories.length === 0 ? (
              <EmptyData text="No category sales found" />
            ) : (
              <div className="space-y-5">
                {analytics.categories.map(
                  (category) => (
                    <div key={category.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {category.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {category.sales} books sold
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">
                            {formatCurrency(
                              category.revenue
                            )}
                          </p>

                          <p className="text-xs text-slate-400">
                            {category.percentage}%
                          </p>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-800"
                          style={{
                            width: `${category.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment + unavailable analytics */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<CreditCard className="h-5 w-5" />}
              title="Payment Methods"
              description="Revenue and orders by payment method"
            />

            {analytics.paymentMethods.length === 0 ? (
              <EmptyData text="No payment data found" />
            ) : (
              <div className="space-y-5">
                {analytics.paymentMethods.map(
                  (method) => {
                    const totalPaymentOrders =
                      analytics.paymentMethods.reduce(
                        (sum, item) =>
                          sum + item.orders,
                        0
                      );

                    const percentage =
                      totalPaymentOrders > 0
                        ? Math.round(
                            (method.orders /
                              totalPaymentOrders) *
                              100
                          )
                        : 0;

                    return (
                      <div
                        key={method._id}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                              <CreditCard className="h-4 w-4 text-slate-600" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {formatPaymentMethod(
                                  method._id
                                )}
                              </p>

                              <p className="text-xs text-slate-400">
                                {method.orders} orders
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">
                              {formatCurrency(
                                method.amount
                              )}
                            </p>

                            <p className="text-xs text-slate-400">
                              {percentage}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-800"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<Globe2 className="h-5 w-5" />}
              title="Store Analytics"
              description="Analytics requiring additional tracking"
            />

            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                <Eye className="h-5 w-5 text-slate-500" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Page Views
                  </p>

                  <p className="text-xs text-slate-400">
                    Requires website analytics tracking
                  </p>
                </div>

                <span className="ml-auto text-xs font-semibold text-slate-400">
                  N/A
                </span>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                <Monitor className="h-5 w-5 text-slate-500" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Device Analytics
                  </p>

                  <p className="text-xs text-slate-400">
                    Requires device tracking
                  </p>
                </div>

                <span className="ml-auto text-xs font-semibold text-slate-400">
                  N/A
                </span>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                <TrendingUp className="h-5 w-5 text-slate-500" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Conversion Rate
                  </p>

                  <p className="text-xs text-slate-400">
                    Requires visitor + order tracking
                  </p>
                </div>

                <span className="ml-auto text-xs font-semibold text-slate-400">
                  N/A
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <SectionHeader
              icon={<Package className="h-5 w-5" />}
              title="Inventory Insights"
              description="Products that need attention"
              action={
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  {analytics.inventory.lowStock} items need attention
                </span>
              }
            />

            {analytics.inventory.lowStockItems.length === 0 ? (
              <EmptyData text="No low-stock products" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {analytics.inventory.lowStockItems.map(
                  (item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.title}
                        </p>
                      </div>

                      <span className="ml-3 shrink-0 text-sm font-bold text-red-600">
                        {item.stock} left
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Total Products
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {analytics.inventory.totalProducts}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Low Stock
                </p>

                <p className="mt-1 text-xl font-bold text-amber-600">
                  {analytics.inventory.lowStock}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Out of Stock
                </p>

                <p className="mt-1 text-xl font-bold text-red-600">
                  {analytics.inventory.outOfStock}
                </p>
              </div>
            </div>
          </div>

          {/* Refunds */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<TicketPercent className="h-5 w-5" />}
              title="Coupons & Refunds"
              description="Real order discount data"
            />

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Discount Given
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    analytics.discounts.amount
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-red-600">
                  Refunded Amount
                </p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  {formatCurrency(
                    analytics.refunds.amount
                  )}
                </p>

                <p className="mt-1 text-xs text-red-500">
                  {analytics.refunds.orders} refunded orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Recent Orders"
            description="Latest transactions from your store"
          />

          {analytics.recentOrders.length === 0 ? (
            <EmptyData text="No orders found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Order
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Customer
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Amount
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Payment
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.recentOrders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="py-4 text-sm font-semibold text-slate-800">
                          {order.id}
                        </td>

                        <td className="py-4 text-sm text-slate-600">
                          {order.customer}
                        </td>

                        <td className="py-4 text-sm font-semibold text-slate-800">
                          {formatCurrency(order.amount)}
                        </td>

                        <td className="py-4 text-sm text-slate-600">
                          {formatPaymentMethod(
                            order.payment
                          )}
                        </td>

                        <td className="py-4">
                          <StatusBadge
                            status={order.status}
                          />
                        </td>

                        <td className="py-4 text-sm text-slate-400">
                          {getTimeAgo(order.createdAt)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            icon={<TrendingUp className="h-5 w-5" />}
            title="Performance Summary"
            description="Real business indicators"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <IndianRupee className="h-5 w-5 text-slate-500" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Revenue Growth
                  </p>

                  <p className="text-xs text-slate-400">
                    Compared with previous period
                  </p>
                </div>
              </div>

              <p
                className={`mt-3 text-xl font-bold ${
                  metrics.revenueChange >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {formatPercent(
                  metrics.revenueChange
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-slate-500" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Order Growth
                  </p>

                  <p className="text-xs text-slate-400">
                    Compared with previous period
                  </p>
                </div>
              </div>

              <p
                className={`mt-3 text-xl font-bold ${
                  metrics.orderChange >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {formatPercent(
                  metrics.orderChange
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-500" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Customer Growth
                  </p>

                  <p className="text-xs text-slate-400">
                    New customers this period
                  </p>
                </div>
              </div>

              <p
                className={`mt-3 text-xl font-bold ${
                  metrics.customerChange >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {formatPercent(
                  metrics.customerChange
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />

            Analytics connected to MongoDB/API.
          </div>

          <span className="text-xs text-slate-400">
            Selected period: {range}
          </span>
        </div>
      </div>
    </div>
  );
}