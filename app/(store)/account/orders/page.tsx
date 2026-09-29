import Link from "next/link";

const orders = [
  {
    id: "ORD-2026-00125",
    date: "26 September 2026",
    items: [
      {
        title: "Atomic Habits",
        author: "James Clear",
        quantity: 1,
        price: 499,
      },
      {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        quantity: 1,
        price: 349,
      },
    ],
    total: 848,
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "ORD-2026-00118",
    date: "22 September 2026",
    items: [
      {
        title: "Ikigai",
        author: "Héctor García",
        quantity: 1,
        price: 399,
      },
      {
        title: "Deep Work",
        author: "Cal Newport",
        quantity: 1,
        price: 900,
      },
    ],
    total: 1299,
    status: "Shipped",
    payment: "Paid",
  },
  {
    id: "ORD-2026-00105",
    date: "15 September 2026",
    items: [
      {
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        quantity: 1,
        price: 599,
      },
    ],
    total: 599,
    status: "Processing",
    payment: "Paid",
  },
  {
    id: "ORD-2026-00096",
    date: "8 September 2026",
    items: [
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        quantity: 2,
        price: 399,
      },
    ],
    total: 798,
    status: "Delivered",
    payment: "Paid",
  },
];

function getStatusClass(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700";

    case "Shipped":
      return "bg-blue-100 text-blue-700";

    case "Processing":
      return "bg-yellow-100 text-yellow-700";

    case "Cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to My Account
          </Link>

          <div className="mt-5">
            <h1 className="text-2xl font-bold text-gray-900">
              My Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage all your book orders.
            </p>
          </div>
        </div>

        {/* Layout */}
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
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Dashboard
              </Link>

              <Link
                href="/account/orders"
                className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900"
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

          {/* Orders */}
          <section className="lg:col-span-3">
            {/* Summary */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Orders
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Active Orders
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {
                    orders.filter(
                      (order) =>
                        order.status === "Processing" ||
                        order.status === "Shipped"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Delivered
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {
                    orders.filter(
                      (order) => order.status === "Delivered"
                    ).length
                  }
                </p>
              </div>
            </div>

            {/* Order List */}
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                >
                  {/* Order Header */}
                  <div className="flex flex-col gap-4 border-b bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Order ID
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {order.id}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Ordered on {order.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${index}`}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex gap-4">
                          {/* Book Image Placeholder */}
                          <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                            📚
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              by {item.author}
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{item.price.toLocaleString("en-IN")}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Price per item
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-col gap-4 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Payment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {order.payment}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:items-end">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          Order Total
                        </span>

                        <span className="text-lg font-bold text-gray-900">
                          ₹{order.total.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Link
                        href={`/account/orders/${order.id}`}
                        className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                      >
                        View Order Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
                <div className="text-4xl">📦</div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  No orders yet
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  You have not placed any orders yet.
                </p>

                <Link
                  href="/books"
                  className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Browse Books
                </Link>
              </div>
            )}

            {/* Continue Shopping */}
            <div className="mt-6 rounded-xl bg-gray-900 p-6 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    Looking for another book?
                  </h2>

                  <p className="mt-1 text-sm text-gray-300">
                    Explore our collection and find your next read.
                  </p>
                </div>

                <Link
                  href="/books"
                  className="w-fit rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
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
