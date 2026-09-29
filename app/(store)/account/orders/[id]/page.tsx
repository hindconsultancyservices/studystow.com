import Link from "next/link";

const order = {
  id: "ORD-2026-00125",
  date: "26 September 2026",
  status: "Delivered",
  payment: "Paid",
  paymentMethod: "UPI",
  items: [
    {
      title: "Atomic Habits",
      author: "James Clear",
      price: 499,
      quantity: 1,
    },
    {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      price: 399,
      quantity: 1,
    },
  ],
  shipping: {
    name: "Customer Name",
    phone: "+91 98765 43210",
    address: "123 Main Road",
    city: "Dhanbad",
    state: "Jharkhand",
    pincode: "826001",
  },
};

export default function OrderDetailsPage() {
  const subtotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = 50;
  const discount = 100;
  const total = subtotal + shipping - discount;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account/orders"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Orders
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Details
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Order #{order.id} · {order.date}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Items */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-gray-900">
                Items in your order
              </h2>

              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    {/* Book Image */}
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-md bg-gray-100">
                      <span className="text-3xl">📕</span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          By {item.author}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="mt-3 font-semibold text-gray-900 sm:mt-0">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery Address */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-gray-900">
                Delivery Address
              </h2>

              <div className="text-sm leading-6 text-gray-600">
                <p className="font-semibold text-gray-900">
                  {order.shipping.name}
                </p>

                <p>{order.shipping.phone}</p>

                <p className="mt-2">
                  {order.shipping.address}
                  <br />
                  {order.shipping.city}, {order.shipping.state}
                  <br />
                  PIN - {order.shipping.pincode}
                </p>
              </div>
            </section>

            {/* Order Status */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Order Status
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">Order Delivered</p>
                    <p className="text-sm text-gray-500">
                      Your order has been delivered successfully.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">Shipped</p>
                    <p className="text-sm text-gray-500">
                      Your order was shipped to your address.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">Order Confirmed</p>
                    <p className="text-sm text-gray-500">
                      Your order has been confirmed.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Price Summary */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">₹{shipping}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium text-green-600">
                    -₹{discount}
                  </span>
                </div>

                <div className="my-4 border-t" />

                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Payment
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-green-600">
                    {order.payment}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
                Download Invoice
              </button>

              <Link
                href="/account/orders"
                className="block w-full rounded-lg border bg-white px-5 py-3 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                View All Orders
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
