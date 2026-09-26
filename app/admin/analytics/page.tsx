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
import { useState, type ReactNode } from "react";

type Range = "Today" | "7 Days" | "30 Days" | "90 Days" | "12 Months";

const revenueData = [
  { month: "Apr", revenue: 118000, orders: 142 },
  { month: "May", revenue: 146000, orders: 168 },
  { month: "Jun", revenue: 132000, orders: 151 },
  { month: "Jul", revenue: 171000, orders: 194 },
  { month: "Aug", revenue: 198000, orders: 221 },
  { month: "Sep", revenue: 214000, orders: 238 },
];

const topBooks = [
  {
    rank: 1,
    title: "NCERT Mathematics Class 10",
    category: "School Books",
    sold: 384,
    revenue: 115200,
    stock: 42,
  },
  {
    rank: 2,
    title: "Physics for Class 12",
    category: "Science",
    sold: 326,
    revenue: 130400,
    stock: 27,
  },
  {
    rank: 3,
    title: "English Grammar & Composition",
    category: "English",
    sold: 291,
    revenue: 72750,
    stock: 64,
  },
  {
    rank: 4,
    title: "Objective General Knowledge",
    category: "Competitive Exams",
    sold: 268,
    revenue: 93800,
    stock: 19,
  },
  {
    rank: 5,
    title: "Indian Polity",
    category: "UPSC",
    sold: 214,
    revenue: 107000,
    stock: 8,
  },
];

const categories = [
  { name: "School Books", sales: 684, revenue: 238400, percentage: 31 },
  { name: "Competitive Exams", sales: 492, revenue: 189600, percentage: 25 },
  { name: "Science", sales: 386, revenue: 156800, percentage: 18 },
  { name: "College Books", sales: 278, revenue: 121500, percentage: 13 },
  { name: "English", sales: 214, revenue: 78400, percentage: 9 },
  { name: "Other", sales: 130, revenue: 58200, percentage: 4 },
];

const recentOrders = [
  {
    id: "#SS-10482",
    customer: "Rahul Kumar",
    amount: 1299,
    status: "Delivered",
    payment: "Razorpay",
    time: "12 min ago",
  },
  {
    id: "#SS-10481",
    customer: "Priya Sharma",
    amount: 849,
    status: "Processing",
    payment: "COD",
    time: "28 min ago",
  },
  {
    id: "#SS-10480",
    customer: "Aman Singh",
    amount: 2199,
    status: "Shipped",
    payment: "Razorpay",
    time: "42 min ago",
  },
  {
    id: "#SS-10479",
    customer: "Neha Verma",
    amount: 599,
    status: "Pending",
    payment: "COD",
    time: "1 hr ago",
  },
  {
    id: "#SS-10478",
    customer: "Vikash Kumar",
    amount: 1649,
    status: "Delivered",
    payment: "Razorpay",
    time: "1 hr ago",
  },
];

const trafficSources = [
  { name: "Google Organic", visitors: 12480, percentage: 44 },
  { name: "Direct", visitors: 6840, percentage: 24 },
  { name: "Instagram", visitors: 3980, percentage: 14 },
  { name: "Facebook", visitors: 2640, percentage: 9 },
  { name: "Referral", visitors: 1720, percentage: 6 },
  { name: "Other", visitors: 800, percentage: 3 },
];

const paymentMethods = [
  { name: "Razorpay", amount: 516400, orders: 682, percentage: 61 },
  { name: "Cash on Delivery", amount: 248700, orders: 302, percentage: 29 },
  { name: "Other", amount: 77400, orders: 100, percentage: 10 },
];

const activities = [
  {
    icon: ShoppingBag,
    title: "New order received",
    description: "#SS-10482 · Rahul Kumar",
    time: "12 min ago",
  },
  {
    icon: Users,
    title: "New customer registered",
    description: "Priya Sharma created an account",
    time: "25 min ago",
  },
  {
    icon: Package,
    title: "Low stock alert",
    description: "Indian Polity has only 8 units left",
    time: "41 min ago",
  },
  {
    icon: TicketPercent,
    title: "Coupon used",
    description: "WELCOME10 used on order #SS-10479",
    time: "1 hr ago",
  },
  {
    icon: RefreshCcw,
    title: "Order status updated",
    description: "#SS-10480 marked as shipped",
    time: "1 hr ago",
  },
];

const lowStock = [
  { title: "Indian Polity", stock: 8 },
  { title: "Objective General Knowledge", stock: 19 },
  { title: "Physics for Class 12", stock: 27 },
  { title: "Biology NCERT Class 11", stock: 12 },
  { title: "Chemistry Class 12", stock: 15 },
];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Delivered: "bg-emerald-50 text-emerald-700",
    Processing: "bg-blue-50 text-blue-700",
    Shipped: "bg-violet-50 text-violet-700",
    Pending: "bg-amber-50 text-amber-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
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

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
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
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30 Days");
  const [rangeOpen, setRangeOpen] = useState(false);

  const maxRevenue = Math.max(...revenueData.map((item) => item.revenue));

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
              Track your store performance, sales, customers and inventory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setRangeOpen((value) => !value)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <CalendarDays className="h-4 w-4" />
                {range}
                <ChevronDown className="h-4 w-4" />
              </button>

              {rangeOpen && (
                <div className="absolute right-0 top-12 z-30 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {(["Today", "7 Days", "30 Days", "90 Days", "12 Months"] as Range[]).map(
                    (item) => (
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
                    )
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value="₹8,42,600"
            change="18.6%"
            icon={<CircleDollarSign className="h-5 w-5" />}
            subtitle="vs previous period"
          />

          <MetricCard
            title="Total Orders"
            value="1,084"
            change="12.4%"
            icon={<ShoppingBag className="h-5 w-5" />}
            subtitle="orders placed"
          />

          <MetricCard
            title="Total Customers"
            value="2,846"
            change="9.8%"
            icon={<Users className="h-5 w-5" />}
            subtitle="registered customers"
          />

          <MetricCard
            title="Average Order Value"
            value="₹777"
            change="5.2%"
            icon={<Wallet className="h-5 w-5" />}
            subtitle="average per order"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-500">
                Page Views
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">28,460</p>
            <p className="mt-1 text-xs text-emerald-600">+14.2% growth</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-500">
                Conversion Rate
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">3.82%</p>
            <p className="mt-1 text-xs text-emerald-600">+0.64% growth</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-500">
                Books Sold
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">2,184</p>
            <p className="mt-1 text-xs text-emerald-600">+16.8% growth</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <RefreshCcw className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-500">
                Returning Customers
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">34.6%</p>
            <p className="mt-1 text-xs text-emerald-600">+3.1% growth</p>
          </div>
        </div>

        {/* Revenue Chart + Order Summary */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <SectionHeader
              icon={<BarChart3 className="h-5 w-5" />}
              title="Revenue Overview"
              description="Monthly revenue and order performance"
              action={
                <span className="text-xs font-medium text-slate-400">
                  Last 6 months
                </span>
              }
            />

            <div className="relative h-80">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[250000, 200000, 150000, 100000, 50000, 0].map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-3 border-b border-dashed border-slate-100"
                  >
                    <span className="w-12 text-right text-[10px] text-slate-400">
                      {value === 0 ? "0" : `₹${value / 1000}k`}
                    </span>
                    <div className="h-px flex-1" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 ml-16 flex items-end justify-around gap-3 pb-7 pt-3">
                {revenueData.map((item) => {
                  const height = Math.max(
                    8,
                    (item.revenue / maxRevenue) * 88
                  );

                  return (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <div className="mb-2 text-xs font-semibold text-slate-600">
                        ₹{Math.round(item.revenue / 1000)}k
                      </div>

                      <div
                        className="w-full max-w-14 rounded-t-lg bg-slate-800 transition-all hover:bg-slate-700"
                        style={{ height: `${height}%` }}
                        title={`${item.month}: ${formatCurrency(item.revenue)}`}
                      />

                      <div className="mt-3 text-xs font-medium text-slate-400">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Order Status"
              description="Current order distribution"
            />

            <div className="space-y-5">
              {[
                {
                  name: "Delivered",
                  count: 682,
                  percentage: 63,
                  icon: CheckCircle2,
                },
                {
                  name: "Processing",
                  count: 168,
                  percentage: 15,
                  icon: Clock3,
                },
                {
                  name: "Shipped",
                  count: 142,
                  percentage: 13,
                  icon: Package,
                },
                {
                  name: "Pending",
                  count: 62,
                  percentage: 6,
                  icon: AlertTriangle,
                },
                {
                  name: "Cancelled",
                  count: 30,
                  percentage: 3,
                  icon: XCircle,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {item.count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
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
                  {topBooks.map((book) => (
                    <tr
                      key={book.rank}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                            #{book.rank}
                          </span>

                          <div>
                            <p className="max-w-[220px] truncate text-sm font-semibold text-slate-800">
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {book.category}
                            </p>
                          </div>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<BarChart3 className="h-5 w-5" />}
              title="Category Performance"
              description="Sales distribution by category"
            />

            <div className="space-y-5">
              {categories.map((category) => (
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
                        {formatCurrency(category.revenue)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {category.percentage}%
                      </p>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic + Payment */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<Globe2 className="h-5 w-5" />}
              title="Traffic Sources"
              description="Where your customers are coming from"
            />

            <div className="space-y-5">
              {trafficSources.map((source) => (
                <div key={source.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {source.name}
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {source.visitors.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-700"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>

                  <div className="mt-1 text-right text-xs text-slate-400">
                    {source.percentage}% of traffic
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<CreditCard className="h-5 w-5" />}
              title="Payment Methods"
              description="Revenue and orders by payment method"
            />

            <div className="space-y-5">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <CreditCard className="h-4 w-4 text-slate-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {method.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {method.orders} orders
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(method.amount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {method.percentage}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customers + Devices */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <SectionHeader
              icon={<Users className="h-5 w-5" />}
              title="Customer Analytics"
              description="New and returning customer activity"
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">New Customers</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  1,862
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  14.8%
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Returning</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">984</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  8.6%
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Repeat Purchase Rate</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">34.6%</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  3.1%
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-100 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  Customer Growth
                </span>
                <span className="text-xs text-slate-400">
                  Last 6 months
                </span>
              </div>

              <div className="flex h-28 items-end gap-4">
                {[42, 51, 48, 67, 76, 92].map((height, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full max-w-12 rounded-t-lg bg-slate-700"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-slate-400">
                      {["Apr", "May", "Jun", "Jul", "Aug", "Sep"][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<Monitor className="h-5 w-5" />}
              title="Devices"
              description="Customer device usage"
            />

            <div className="space-y-5">
              {[
                {
                  name: "Mobile",
                  percentage: 67,
                  icon: Smartphone,
                },
                {
                  name: "Desktop",
                  percentage: 27,
                  icon: Monitor,
                },
                {
                  name: "Tablet",
                  percentage: 6,
                  icon: Tablet,
                },
              ].map((device) => {
                const Icon = device.icon;

                return (
                  <div key={device.name}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">
                          {device.name}
                        </span>
                      </div>

                      <span className="text-sm font-bold text-slate-900">
                        {device.percentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inventory + Coupons/Refunds */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <SectionHeader
              icon={<Package className="h-5 w-5" />}
              title="Inventory Insights"
              description="Products that need attention"
              action={
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  5 items need attention
                </span>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {lowStock.map((item) => (
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
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total Products</p>
                <p className="mt-1 text-xl font-bold text-slate-900">1,284</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Low Stock</p>
                <p className="mt-1 text-xl font-bold text-amber-600">37</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Out of Stock</p>
                <p className="mt-1 text-xl font-bold text-red-600">12</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<TicketPercent className="h-5 w-5" />}
              title="Coupons & Refunds"
              description="Discount and refund performance"
            />

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Coupons Used</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">286</p>
                <p className="mt-1 text-xs text-slate-400">
                  26.4% of all orders
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Discount Given</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  ₹48,620
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Average discount ₹170
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-red-600">Refunded Amount</p>
                <p className="mt-1 text-2xl font-bold text-red-700">₹18,450</p>
                <p className="mt-1 text-xs text-red-500">23 refunded orders</p>
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
            action={
              <button
                type="button"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                View all
              </button>
            }
          />

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
                {recentOrders.map((order) => (
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
                      {order.payment}
                    </td>

                    <td className="py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-4 text-sm text-slate-400">
                      {order.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity + Performance */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<RefreshCcw className="h-5 w-5" />}
              title="Recent Activity"
              description="Latest store events"
            />

            <div className="space-y-5">
              {activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={`${activity.title}-${activity.time}`}
                    className="flex gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {activity.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {activity.description}
                          </p>
                        </div>

                        <span className="shrink-0 text-[11px] text-slate-400">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<TrendingUp className="h-5 w-5" />}
              title="Performance Summary"
              description="Key business indicators"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
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

                <span className="font-bold text-emerald-600">+18.6%</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
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

                <span className="font-bold text-emerald-600">+12.4%</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
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

                <span className="font-bold text-emerald-600">+9.8%</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Conversion Rate
                    </p>
                    <p className="text-xs text-slate-400">
                      Visitors converted to orders
                    </p>
                  </div>
                </div>

                <span className="font-bold text-slate-900">3.82%</span>
              </div>

              <div className="rounded-xl bg-slate-900 p-5 text-white">
                <p className="text-sm font-medium text-slate-300">
                  Store Performance
                </p>
                <p className="mt-2 text-2xl font-bold">Strong Growth</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Revenue, orders and customer acquisition are showing positive
                  movement during the selected reporting period.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics data shown on this page is currently sample data.
          </div>

          <span className="text-xs text-slate-400">
            Ready for MongoDB/API integration
          </span>
        </div>
      </div>
    </div>
  );
}