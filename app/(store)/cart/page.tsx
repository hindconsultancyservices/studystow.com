import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
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
    originalPrice: 699,
    quantity: 1,
  },
  {
    id: "BK002",
    slug: "the-psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 399,
    originalPrice: 599,
    quantity: 2,
  },
  {
    id: "BK004",
    slug: "ikigai",
    title: "Ikigai",
    author: "Héctor García & Francesc Miralles",
    price: 299,
    originalPrice: 399,
    quantity: 1,
  },
];

const subtotal = cartItems.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);

const originalTotal = cartItems.reduce(
  (total, item) => total + item.originalPrice * item.quantity,
  0
);

const totalSavings = originalTotal - subtotal;
const shipping = subtotal >= 999 ? 0 : 49;
const total = subtotal + shipping;

export default function CartPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-slate-900"
            >
              Home
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">
              Shopping Cart
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Your Shopping Cart
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {cartItems.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}{" "}
                items in your cart
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div>
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
                <h2 className="font-semibold text-slate-900">
                  Cart Items
                </h2>

                <span className="text-sm text-slate-500">
                  {cartItems.length} products
                </span>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex gap-4">
                      {/* Book image */}
                      <Link
                        href={`/books/${item.slug}`}
                        className="flex h-28 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:h-32 sm:w-24"
                      >
                        <BookOpen className="h-10 w-10 text-slate-300" />
                      </Link>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/books/${item.slug}`}
                              className="font-semibold text-slate-900 transition hover:text-blue-600"
                            >
                              {item.title}
                            </Link>

                            <p className="mt-1 text-sm text-slate-500">
                              by {item.author}
                            </p>
                          </div>

                          <button
                            type="button"
                            aria-label={`Remove ${item.title}`}
                            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">
                            ₹{item.price}
                          </span>

                          <span className="text-sm text-slate-400 line-through">
                            ₹{item.originalPrice}
                          </span>
                        </div>

                        {/* Quantity + total */}
                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="flex items-center rounded-lg border">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="flex h-9 min-w-9 items-center justify-center border-x px-2 text-sm font-semibold text-slate-900">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-400">
                              Item total
                            </p>

                            <p className="font-bold text-slate-900">
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings */}
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-green-800">
                    You are saving ₹{totalSavings}
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Great choice! These books are currently available
                    at discounted prices.
                  </p>
                </div>

                <ShieldCheck className="hidden h-7 w-7 shrink-0 text-green-600 sm:block" />
              </div>
            </div>

            {/* Continue shopping */}
            <Link
              href="/books"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <aside>
            <div className="sticky top-6 rounded-2xl border bg-white shadow-sm">
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-4 p-5">
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
                    -₹{totalSavings}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Shipping
                  </span>

                  {shipping === 0 ? (
                    <span className="font-semibold text-green-600">
                      FREE
                    </span>
                  ) : (
                    <span className="font-medium text-slate-900">
                      ₹{shipping}
                    </span>
                  )}
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

                <Link
                  href="/checkout"
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Proceed to Checkout
                </Link>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <Truck className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Free delivery on ₹999+
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Your order will be securely packed and delivered
                      to your address.
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
