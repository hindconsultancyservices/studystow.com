import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

import CheckoutForm from "@/components/customer/CheckoutForm";

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
      {/* Page Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
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

          {/* Title */}
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

      {/* Checkout Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Side */}
          <CheckoutForm />

          {/* Right Side */}
          <aside>
            {/* Order Summary */}
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
                    {shipping === 0
                      ? "FREE"
                      : `₹${shipping}`}
                  </span>
                </div>

                {/* Total */}
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
                  By placing your order, you agree to our terms
                  and conditions.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-4 rounded-2xl border bg-white p-4">
              <div className="space-y-4">
                {/* Delivery */}
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

                {/* Security */}
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

            {/* Back To Cart */}
            <Link
              href="/cart"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}