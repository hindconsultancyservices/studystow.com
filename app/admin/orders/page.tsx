import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

type Order = {
  id: string;
  customer: string;
  email: string;
  initials: string;
  items: number;
  productPreview: string;
  amount: number;
  status: OrderStatus;
  payment: PaymentStatus;
  date: string;
  time: string;
  method: string;
};

const orders: Order[] = [
  {
    id: "SS-2026-1048",
    customer: "Rahul Kumar",
    email: "rahul@example.com",
    initials: "RK",
    items: 3,
    productPreview: "Atomic Habits + 2 more",
    amount: 1299,
    status: "Delivered",
    payment: "Paid",
    date: "25 Sep 2026",
    time: "10:42 AM",
    method: "Razorpay",
  },
  {
    id: "SS-2026-1047",
    customer: "Priya Sharma",
    email: "priya@example.com",
    initials: "PS",
    items: 2,
    productPreview: "The Psychology of Money",
    amount: 899,
    status: "Shipped",
    payment: "Paid",
    date: "25 Sep 2026",
    time: "09:18 AM",
    method: "Razorpay",
  },
  {
    id: "SS-2026-1046",
    customer: "Amit Singh",
    email: "amit@example.com",
    initials: "AS",
    items: 1,
    productPreview: "Deep Work",
    amount: 549,
    status: "Processing",
    payment: "Paid",
    date: "24 Sep 2026",
    time: "06:31 PM",
    method: "Razorpay",
  },
  {
    id: "SS-2026-1045",
    customer: "Neha Verma",
    email: "neha@example.com",
    initials: "NV",
    items: 4,
    productPreview: "Self Help Collection",
    amount: 1849,
    status: "Pending",
    payment: "Pending",
    date: "24 Sep 2026",
    time: "03:25 PM",
    method: "Cash on Delivery",
  },
  {
    id: "SS-2026-1044",
    customer: "Vikas Gupta",
    email: "vikas@example.com",
    initials: "VG",
    items: 2,
    productPreview: "Think and Grow Rich",
    amount: 749,
    status: "Delivered",
    payment: "Paid",
    date: "23 Sep 2026",
    time: "11:08 AM",
    method: "Razorpay",
  },
  {
    id: "SS-2026-1043",
    customer: "Anjali Das",
    email: "anjali@example.com",
    initials: "AD",
    items: 1,
    productPreview: "Ikigai",
    amount: 399,
    status: "Cancelled",
    payment: "Refunded",
    date: "23 Sep 2026",
    time: "09:47 AM",
    method: "Razorpay",
  },
  {
    id: "SS-2026-1042",
    customer: "Saurabh Roy",
    email: "saurabh@example.com",
    initials: "SR",
    items: 5,
    productPreview: "Business Books Bundle",
    amount: 2399,
    status: "Shipped",
    payment: "Paid",
    date: "22 Sep 2026",
    time: "04:16 PM",
    method: "Razorpay",
  },
  {
    id: "SS-2026-1041",
    customer: "Pooja Singh",
    email: "pooja@example.com",
    initials: "PS",
    items: 2,
    productPreview: "The Alchemist + Ikigai",
    amount: 798,
    status: "Processing",
    payment: "Paid",
    date: "22 Sep 2026",
    time: "01:32 PM",
    method: "Razorpay",
  },
];

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Processing: "bg-blue-50 text-blue-700 ring-blue-200",
  Shipped: "bg-violet-50 text-violet-700 ring-violet-200",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const paymentStyles: Record<PaymentStatus, string> = {
  Paid: "text-emerald-700",
  Pending: "text-amber-700",
  Failed: "text-red-700",
  Refunded: "text-slate-500",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminOrdersPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
              <Link href="/admin" className="hover:text-slate-900">
                Admin
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-slate-900">Orders</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage, track and process all customer orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export Orders
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Orders
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  1,248
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUp className="h-3.5 w-3.5" />
              12.5% vs last month
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Revenue
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  ₹8.42L
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUp className="h-3.5 w-3.5" />
              18.2% vs last month
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Orders
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">36</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 text-xs font-medium text-amber-600">
              Needs attention
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Delivered
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">1,086</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Truck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUp className="h-3.5 w-3.5" />
              87% fulfillment rate
            </div>
          </div>
        </section>

        {/* Main Card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  placeholder="Search order ID, customer or email..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  defaultValue="all"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  defaultValue="all"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>

                <select
                  defaultValue="30"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="all">All time</option>
                </select>

                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4" />
                  More Filters
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
                    Order
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Items
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-slate-950 hover:text-blue-600"
                      >
                        {order.id}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {order.initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {order.customer}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {order.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {order.items} {order.items === 1 ? "item" : "items"}
                      </p>
                      <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500">
                        {order.productPreview}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-950">
                        {formatCurrency(order.amount)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className={`text-sm font-semibold ${paymentStyles[order.payment]}`}
                      >
                        {order.payment}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {order.method}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {order.date}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {order.time}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        aria-label={`View ${order.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {orders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-bold text-slate-950"
                    >
                      {order.id}
                    </Link>

                    <p className="mt-1 text-xs text-slate-500">
                      {order.date} · {order.time}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {order.initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {order.customer}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {order.email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-xs text-slate-500">Items</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {order.items} {order.items === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Amount</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {formatCurrency(order.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Payment</p>
                    <p
                      className={`mt-1 text-sm font-semibold ${paymentStyles[order.payment]}`}
                    >
                      {order.payment}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Method</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {order.method}
                    </p>
                  </div>
                </div>

                <p className="mt-3 truncate text-xs text-slate-500">
                  {order.productPreview}
                </p>

                <Link
                  href={`/admin/orders/${order.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  View Order
                </Link>
              </div>
            ))}
          </div>

          {/* Footer / Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">1–8</span>{" "}
              of <span className="font-semibold text-slate-700">1,248</span>{" "}
              orders
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
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
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                2
              </button>

              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                3
              </button>

              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Summary */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Processing
                </p>
                <p className="text-xs text-slate-500">
                  18 orders awaiting packing
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  In Transit
                </p>
                <p className="text-xs text-slate-500">
                  24 orders with courier
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Customers
                </p>
                <p className="text-xs text-slate-500">
                  892 customers placed orders
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
