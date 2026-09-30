
import Link from "next/link";
import { ChevronRight, PackageCheck } from "lucide-react";

import CheckoutForm from "@/components/customer/CheckoutForm";

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
                Review your order and complete your purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CheckoutForm />
      </section>
    </main>
  );
}
