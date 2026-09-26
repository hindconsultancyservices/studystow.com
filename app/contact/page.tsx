import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Contact Us
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              We&apos;re here to help
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Have a question about a book, order, delivery, payment, or
              anything else? Send us a message and our team will get back to
              you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold">Get in touch</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose any of the options below to contact the StudyStow team.
              </p>
            </div>

            {/* Email */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold">Email</h3>

                  <a
                    href="mailto:support@studystow.com"
                    className="mt-1 block text-sm text-slate-600 hover:text-blue-600"
                  >
                    support@studystow.com
                  </a>

                  <p className="mt-1 text-xs text-slate-500">
                    We usually reply within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Phone className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold">Phone</h3>

                  <a
                    href="tel:+919999999999"
                    className="mt-1 block text-sm text-slate-600 hover:text-blue-600"
                  >
                    +91 99999 99999
                  </a>

                  <p className="mt-1 text-xs text-slate-500">
                    Monday to Saturday
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold">Address</h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    StudyStow
                    <br />
                    India
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold">Business Hours</h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Monday - Saturday
                    <br />
                    10:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MessageSquare className="h-6 w-6" />
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                  Send us a message
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Fill out the form below and we&apos;ll get back to you as
                  soon as possible.
                </p>
              </div>

              <form
                action="/api/contact"
                method="POST"
                className="space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Phone + Subject */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 99999 99999"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-medium"
                    >
                      Subject
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Order Number */}
                <div>
                  <label
                    htmlFor="orderNumber"
                    className="mb-2 block text-sm font-medium"
                  >
                    Order Number
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="orderNumber"
                    name="orderNumber"
                    type="text"
                    placeholder="e.g. ST-123456"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    placeholder="Write your message here..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Send Message
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="border-t bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              Looking for something specific?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              You may find the answer faster in your account or by browsing
              our store.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/books"
              className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-600"
            >
              Browse Books
            </Link>

            <Link
              href="/account/orders"
              className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-600"
            >
              Track Orders
            </Link>

            <Link
              href="/account"
              className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-600"
            >
              My Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
