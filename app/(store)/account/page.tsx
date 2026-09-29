import Link from "next/link";

const recentOrders = [
  {
    id: "ORD-2026-00125",
    date: "26 September 2026",
    amount: 848,
    status: "Delivered",
  },
  {
    id: "ORD-2026-00118",
    date: "22 September 2026",
    amount: 1299,
    status: "Shipped",
  },
  {
    id: "ORD-2026-00105",
    date: "15 September 2026",
    amount: 599,
    status: "Processing",
  },
];

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            My Account
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome back, Customer!
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="h-fit rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 border-b px-2 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 font-bold text-white">
                C
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Customer Name
                </p>

                <p className="text-xs text-gray-500">
                  customer@example.com
                </p>
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              <Link
                href="/account"
                className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900"
              >
                Dashboard
              </Link>

              <Link
                href="/account/orders"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                My Orders
              </Link>

              <Link
                href="/account/profile"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                My Profile
              </Link>

              <Link
                href="/account/addresses"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Addresses
              </Link>

              <Link
                href="/account/wishlist"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Wishlist
              </Link>

              <button
                type="button"
                className="w-full rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Dashboard */}
          <section className="lg:col-span-3">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/account/orders"
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📦</span>
                  <span className="text-2xl font-bold text-gray-900">
                    12
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Total Orders
                </p>
              </Link>

              <Link
                href="/account/orders"
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🚚</span>
                  <span className="text-2xl font-bold text-gray-900">
                    2
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Active Orders
                </p>
              </Link>

              <Link
                href="/account/wishlist"
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">♡</span>
                  <span className="text-2xl font-bold text-gray-900">
                    5
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Wishlist
                </p>
              </Link>

              <Link
                href="/account/addresses"
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📍</span>
                  <span className="text-2xl font-bold text-gray-900">
                    2
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Addresses
                </p>
              </Link>
            </div>

            {/* Recent Orders */}
            <div className="mt-6 rounded-xl border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b p-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your latest book purchases
                  </p>
                </div>

                <Link
                  href="/account/orders"
                  className="text-sm font-semibold text-gray-900 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="font-semibold text-gray-900 hover:underline"
                      >
                        {order.id}
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        {order.date}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <span className="font-semibold text-gray-900">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile + Address */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Profile */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h2>

                  <Link
                    href="/account/profile"
                    className="text-sm font-semibold text-gray-900 hover:underline"
                  >
                    Edit
                  </Link>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="mt-1 font-medium text-gray-900">
                      Customer Name
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="mt-1 font-medium text-gray-900">
                      customer@example.com
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="mt-1 font-medium text-gray-900">
                      +91 98765 43210
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Default Address
                  </h2>

                  <Link
                    href="/account/addresses"
                    className="text-sm font-semibold text-gray-900 hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                <div className="mt-5 text-sm leading-6 text-gray-600">
                  <p className="font-semibold text-gray-900">
                    Customer Name
                  </p>

                  <p>123 Main Road</p>
                  <p>Dhanbad, Jharkhand</p>
                  <p>PIN - 826001</p>
                  <p>+91 98765 43210</p>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6 rounded-xl bg-gray-900 p-6 text-white sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Looking for your next book?
                  </h2>

                  <p className="mt-1 text-sm text-gray-300">
                    Explore our collection and discover something new.
                  </p>
                </div>

                <Link
                  href="/books"
                  className="w-fit rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  Browse Books
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
