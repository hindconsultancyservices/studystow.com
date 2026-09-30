import Link from "next/link";
import {
  BookOpen,
  Search,
  ShoppingCart,
  Heart,
  Headphones,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ======================================================
          HEADER
          ====================================================== */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">
              About StudyStow
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Books made easier to discover
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              StudyStow is an online bookstore designed to make discovering,
              exploring, and purchasing books simple and convenient.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          INTRODUCTION
          ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Our Story
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              A simple place to find your next book
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Finding the right book should be straightforward. StudyStow
              brings books together in one online store so customers can
              browse available books, explore categories, and find products
              that match their interests.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Our focus is on providing a clean shopping experience where
              customers can discover books, view their details, add them to
              their cart, and place orders through the store.
            </p>

            <div className="mt-7">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Browse Books
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="rounded-3xl border bg-slate-50 p-8 sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen className="h-7 w-7" />
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Everything in one place
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              From discovering books to managing your orders, StudyStow is
              built around a straightforward online shopping experience.
            </p>

            <div className="mt-6 border-t pt-6">
              <p className="text-sm font-semibold text-slate-900">
                Discover. Explore. Order.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Browse the store and find books available through StudyStow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          WHAT WE OFFER
          ====================================================== */}
      <section className="border-y bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              What You Can Do
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              A straightforward shopping experience
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              StudyStow is designed around the things customers need when
              shopping for books online.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Search className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">
                Discover Books
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Browse the available collection and use search to find books
                more easily.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">
                Explore Categories
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore books through categories and individual book details.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShoppingCart className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">
                Shop Online
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add books to your cart and continue through the online
                checkout process.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Heart className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">
                Save Your Favorites
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep track of books you are interested in through your
                wishlist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          SHOPPING EXPERIENCE
          ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              The StudyStow Experience
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Built around a simple shopping journey
            </h2>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  1. Find a book
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Start by browsing the store or searching for a specific
                  book.
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  2. Explore the details
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open a book to view the information available for that
                  product.
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  3. Add to your cart
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add the books you want to purchase to your shopping cart.
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  4. Place your order
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Continue to checkout and complete your order using the
                  available payment and delivery options.
                </p>
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div>
            <div className="rounded-3xl border bg-slate-50 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Headphones className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                Need help?
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                If you have a question about a book, order, delivery, payment,
                or another part of your shopping experience, our contact page
                is available to help you get in touch.
              </p>

              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Contact StudyStow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          ACCOUNT SECTION
          ====================================================== */}
      <section className="border-t bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Your Account
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Keep your shopping organized
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your StudyStow account gives you access to account-related
              features such as your orders, profile, and saved books.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/account"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              My Account
            </Link>

            <Link
              href="/account/orders"
              className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-600"
            >
              View Orders
            </Link>

            <Link
              href="/wishlist"
              className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-600"
            >
              Wishlist
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA
          ====================================================== */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to explore?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Browse the StudyStow collection and discover books available
              through our online store.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Browse Books
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}