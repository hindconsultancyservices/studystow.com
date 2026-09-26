import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  User,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

const orderItems = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    sku: "BOOK-ATH-001",
    price: 499,
    quantity: 2,
    total: 998,
  },
  {
    id: "2",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    sku: "BOOK-POM-002",
    price: 399,
    quantity: 1,
    total: 399,
  },
  {
    id: "3",
    title: "Deep Work",
    author: "Cal Newport",
    sku: "BOOK-DPW-003",
    price: 449,
    quantity: 1,
    total: 449,
  },
];

const timeline = [
  {
    title: "Order Delivered",
    description: "Order was successfully delivered to the customer.",
    date: "25 Sep 2026",
    time: "10:42 AM",
    completed: true,
  },
  {
    title: "Out for Delivery",
    description: "Courier partner picked up the order for final delivery.",
    date: "25 Sep 2026",
    time: "07:18 AM",
    completed: true,
  },
  {
    title: "Shipped",
    description: "Order was handed over to the courier partner.",
    date: "24 Sep 2026",
    time: "04:35 PM",
    completed: true,
  },
  {
    title: "Processing",
    description: "Order was packed and prepared for shipment.",
    date: "24 Sep 2026",
    time: "01:22 PM",
    completed: true,
  },
  {
    title: "Order Placed",
    description: "Customer successfully placed the order.",
    date: "24 Sep 2026",
    time: "12:48 PM",
    completed: true,
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/admin" className="hover:text-slate-900">
              Admin
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link href="/admin/orders" className="hover:text-slate-900">
              Orders
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">{id}</span>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href="/admin/orders"
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Order #{id}
                </h1>

                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  Delivered
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Placed on 24 September 2026 at 12:48 PM
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Update Status
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                <Package className="h-4 w-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-700">
                <Check className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-emerald-900">
                  Order delivered successfully
                </p>
                <p className="mt-0.5 text-sm text-emerald-700">
                  Delivered on 25 September 2026 at 10:42 AM.
                </p>
              </div>
            </div>

            <span className="text-sm font-semibold text-emerald-800">
              Payment: Paid
            </span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Order Items */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Order Items
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    4 items in this order
                  </p>
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  Subtotal: ₹1,846
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {orderItems.map((item) => (
                  <div key={item.id} className="p-5">
                    <div className="flex gap-4">
                      <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-center text-[10px] font-bold text-slate-400">
                        BOOK
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-950">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              by {item.author}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                              SKU: {item.sku}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="font-bold text-slate-950">
                              {formatCurrency(item.total)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatCurrency(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery Timeline */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Order Timeline
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Complete history of this order.
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-[11px] top-3 h-[calc(100%-25px)] w-px bg-slate-200" />

                <div className="space-y-7">
                  {timeline.map((event) => (
                    <div key={`${event.title}-${event.date}`} className="relative flex gap-4">
                      <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold text-slate-900">
                            {event.title}
                          </p>

                          <p className="text-xs text-slate-400">
                            {event.date} · {event.time}
                          </p>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Shipping Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                  <Truck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Shipping Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    Courier and tracking details
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Courier Partner
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    Delhivery
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Tracking ID
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      DL123456789IN
                    </p>

                    <button
                      type="button"
                      aria-label="Copy tracking ID"
                      className="text-slate-400 hover:text-slate-900"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Tracking
                  </p>

                  <Link
                    href="#"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Track shipment
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Customer Notes */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Customer Note
              </h2>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Please deliver the package between 10 AM and 6 PM. Call before
                delivery if possible.
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Customer */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">Customer</h2>
                  <p className="text-sm text-slate-500">
                    Customer information
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                  RK
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">Rahul Kumar</p>
                  <p className="truncate text-sm text-slate-500">
                    rahul@example.com
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  +91 98765 43210
                </div>

                <Link
                  href="/admin/customers/rahul-kumar"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View customer profile
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Delivery Address
                  </h2>
                  <p className="text-sm text-slate-500">
                    Shipping destination
                  </p>
                </div>
              </div>

              <div className="text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-900">Rahul Kumar</p>
                <p>Flat 204, Green Residency</p>
                <p>Bank More</p>
                <p>Dhanbad, Jharkhand 826001</p>
                <p>India</p>
                <p className="mt-2 font-medium text-slate-700">
                  +91 98765 43210
                </p>
              </div>
            </section>

            {/* Payment Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Payment Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Razorpay payment
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₹1,846
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-medium text-emerald-600">
                    -₹100
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium text-slate-900">₹50</span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-lg font-bold text-slate-950">
                      ₹1,796
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-emerald-50 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CircleDollarSign className="h-4 w-4" />
                  Payment successful
                </div>

                <p className="mt-1 text-xs text-emerald-600">
                  Razorpay ID: pay_RZP123456789
                </p>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-950">Quick Actions</h2>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Print Invoice
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Update Shipping
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <span>Cancel Order</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
