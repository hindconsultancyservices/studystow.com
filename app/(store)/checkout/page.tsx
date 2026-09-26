import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

const cartItems = [
  {
    id: "BK001",
    slug: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    price: 499,
    quantity: 1,
  },
  {
    id: "BK002",
    slug: "the-psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 399,
    quantity: 2,
  },
  {
    id: "BK004",
    slug: "ikigai",
    title: "Ikigai",
    author: "Héctor García & Francesc Miralles",
    price: 299,
    quantity: 1,
  },
];

const subtotal = cartItems.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);

const discount = 200;
const shipping = subtotal >= 999 ? 0 : 49;
const total = subtotal - discount + shipping;

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-slate-900"
            >
              Home
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link
              href="/cart"
              className="transition hover:text-slate-900"
            >
              Cart
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">
              Checkout
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <PackageCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Checkout
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Complete your order securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <MapPin className="h-4 w-4 text-slate-700" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Delivery Address
                    </h2>

                    <p className="text-xs text-slate-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Change
                </button>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-xl border-2 border-slate-900 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          Rahul Kumar
                        </p>

                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          HOME
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        House No. 123, Main Road,
                        <br />
                        Dhanbad, Jharkhand - 826001
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-700">
                        +91 98765 43210
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  + Add New Address
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="border-b px-5 py-4 sm:px-6">
                <h2 className="font-semibold text-slate-900">
                  Contact Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  We&apos;ll use this information for order updates.
                </p>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    defaultValue="Rahul Kumar"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    defaultValue="rahul@example.com"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="border-b px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <CreditCard className="h-4 w-4 text-slate-700" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Payment Method
                    </h2>

                    <p className="text-xs text-slate-500">
                      Choose your preferred payment method.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {/* Razorpay / Online */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-900 bg-slate-50 p-4">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    defaultChecked
                    className="mt-1 h-4 w-4 accent-slate-900"
                  />

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          Online Payment
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          UPI, Cards, Net Banking & Wallets
                        </p>
                      </div>

                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                        Secure
                      </span>
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:bg-slate-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    className="mt-1 h-4 w-4 accent-slate-900"
                  />

                  <div>
                    <p className="font-semibold text-slate-900">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Pay when your order is delivered.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Back */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </div>

          {/* Right Summary */}
          <aside>
            <div className="sticky top-6 rounded-2xl border bg-white shadow-sm">
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Order Summary
                </h2>
              </div>

              {/* Items */}
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-4"
                  >
                    <div className="flex h-14 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <BookOpen className="h-5 w-5 text-slate-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-slate-900">
                        {item.title}
                      </p>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">
                          Qty: {item.quantity}
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Discount
                  </span>

                  <span className="font-medium text-green-600">
                    -₹{discount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Shipping
                  </span>

                  <span
                    className={
                      shipping === 0
                        ? "font-semibold text-green-600"
                        : "font-medium text-slate-900"
                    }
                  >
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-slate-900">
                      ₹{total}
                    </span>
                  </div>

                  <p className="mt-1 text-right text-xs text-slate-400">
                    Inclusive of applicable taxes
                  </p>
                </div>

                {/* Place Order */}
                <button
                  type="button"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Place Order • ₹{total}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  By placing your order, you agree to our terms and
                  conditions.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-4 rounded-2xl border bg-white p-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Truck className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Fast & Secure Delivery
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Your books will be packed securely for delivery.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Secure Checkout
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Your payment information is protected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
