import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  Truck,
  MapPin,
  CreditCard,
  XCircle,
} from "lucide-react";
import { revalidatePath } from "next/cache";

import connectDB from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Order from "@/models/Order";
import Book from "@/models/Book";
import { getServerSession } from "next-auth";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700";

    case "shipped":
      return "bg-blue-100 text-blue-700";

    case "processing":
      return "bg-yellow-100 text-yellow-700";

    case "confirmed":
      return "bg-indigo-100 text-indigo-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircle2 className="h-5 w-5" />;

    case "shipped":
      return <Truck className="h-5 w-5" />;

    case "processing":
      return <Package className="h-5 w-5" />;

    default:
      return <Clock3 className="h-5 w-5" />;
  }
}

export default async function OrderDetailsPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  /*
   * Server Action
   * Cancels the current user's order and restores stock.
   */
  async function cancelOrder() {
    "use server";

    const currentSession = await getServerSession(authOptions);

    if (!currentSession?.user?.id) {
      redirect("/login");
    }

    await connectDB();

    const order = await Order.findOne({
      orderNumber: id,
      customer: currentSession.user.id,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    const currentStatus = String(
      order.orderStatus || "pending"
    ).toLowerCase();

    if (
      currentStatus !== "pending" &&
      currentStatus !== "confirmed"
    ) {
      throw new Error(
        "This order can no longer be cancelled."
      );
    }

    /*
     * Paid Razorpay orders should not be cancelled without
     * processing an actual refund first.
     */
    const paymentStatus = String(
      order.paymentStatus || "pending"
    ).toLowerCase();

    if (paymentStatus === "paid") {
      throw new Error(
        "Paid online orders cannot be cancelled until the refund is processed."
      );
    }

    /*
     * Change status first.
     *
     * This also protects against cancelling the same order
     * twice at the same time.
     */
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        customer: currentSession.user.id,
        orderStatus: {
          $in: ["pending", "confirmed"],
        },
      },
      {
        $set: {
          orderStatus: "cancelled",
        },
      },
      {
        new: true,
      }
    );

    if (!updatedOrder) {
      throw new Error(
        "This order can no longer be cancelled."
      );
    }

    /*
     * Restore stock for every ordered book.
     */
    const items = Array.isArray(updatedOrder.items)
      ? updatedOrder.items
      : [];

    for (const item of items) {
      const quantity = Number(item.quantity || 0);

      if (!quantity || quantity <= 0 || !item.book) {
        continue;
      }

      try {
        await Book.findByIdAndUpdate(
          item.book,
          {
            $inc: {
              stock: quantity,
            },
          }
        );
      } catch (stockError) {
        console.error(
          "Failed to restore stock for cancelled order:",
          stockError
        );
      }
    }

    /*
     * Refresh both order pages after cancellation.
     */
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${id}`);
  }

  await connectDB();

  /*
   * URL:
   * /account/orders/ST-111976-338079
   *
   * Only the logged-in user's order can be opened.
   */
  const orderData = await Order.findOne({
    orderNumber: id,
    customer: session.user.id,
  })
    .populate(
      "items.book",
      "title author slug image price compareAtPrice"
    )
    .lean();

  if (!orderData) {
    notFound();
  }

  const order = orderData as any;

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const subtotal = Number(order.subtotal || 0);
  const shipping = Number(order.shipping || 0);
  const discount = Number(order.discount || 0);
  const tax = Number(order.tax || 0);
  const total = Number(order.total || 0);

  const address = order.shippingAddress || {};

  const orderStatus = String(
    order.orderStatus || "pending"
  ).toLowerCase();

  const paymentStatus = String(
    order.paymentStatus || "pending"
  ).toLowerCase();

  const canCancel =
    (orderStatus === "pending" ||
      orderStatus === "confirmed") &&
    paymentStatus !== "paid";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Order Details
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {order.orderNumber}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Placed on{" "}
                {formatDate(order.createdAt)}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                order.orderStatus || "pending"
              )}`}
            >
              {getStatusIcon(
                order.orderStatus || "pending"
              )}

              {String(
                order.orderStatus || "pending"
              )
                .charAt(0)
                .toUpperCase() +
                String(
                  order.orderStatus || "pending"
                ).slice(1)}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Ordered Books */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Ordered Books
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Books included in this order
                </p>
              </div>

              <div className="divide-y divide-slate-200">
                {items.length > 0 ? (
                  items.map(
                    (item: any, index: number) => {
                      const book =
                        item.book &&
                        typeof item.book === "object"
                          ? item.book
                          : null;

                      const title =
                        book?.title ||
                        item.title ||
                        "Book";

                      const author =
                        book?.author ||
                        item.author ||
                        "";

                      const image =
                        book?.image ||
                        item.image ||
                        "";

                      const slug =
                        book?.slug || "";

                      const price = Number(
                        item.price ||
                          book?.price ||
                          0
                      );

                      const quantity = Number(
                        item.quantity || 0
                      );

                      return (
                        <div
                          key={
                            item._id?.toString() ||
                            `${
                              item.book?._id ||
                              item.book ||
                              "book"
                            }-${index}`
                          }
                          className="flex gap-4 p-5 sm:p-6"
                        >
                          {/* Image */}
                          <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {image ? (
                              <img
                                src={image}
                                alt={title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-slate-400" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            {slug ? (
                              <Link
                                href={`/books/${slug}`}
                                className="text-base font-bold text-slate-950 hover:underline"
                              >
                                {title}
                              </Link>
                            ) : (
                              <h3 className="text-base font-bold text-slate-950">
                                {title}
                              </h3>
                            )}

                            {author ? (
                              <p className="mt-1 text-sm text-slate-500">
                                by {author}
                              </p>
                            ) : null}

                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                              <span className="text-slate-500">
                                Quantity:{" "}
                                <strong className="text-slate-900">
                                  {quantity}
                                </strong>
                              </span>

                              <span className="text-slate-500">
                                Price:{" "}
                                <strong className="text-slate-900">
                                  {money(price)}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Total */}
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-500">
                              Item Total
                            </p>

                            <p className="mt-1 font-bold text-slate-950">
                              {money(
                                price * quantity
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No items were found for this order.
                  </div>
                )}
              </div>
            </section>

            {/* Delivery Address */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Delivery Address
                  </h2>

                  <p className="text-sm text-slate-500">
                    Shipping address used for this order
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">
                  {address.name || "Customer"}
                </p>

                {address.phone ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {address.phone}
                  </p>
                ) : null}

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {address.addressLine1}

                  {address.addressLine2
                    ? `, ${address.addressLine2}`
                    : ""}

                  <br />

                  {address.city}, {address.state}

                  <br />

                  {address.pincode}

                  {address.country
                    ? `, ${address.country}`
                    : ""}
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Payment */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <CreditCard className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Payment
                  </h2>

                  <p className="text-sm text-slate-500">
                    Payment information
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Method
                  </span>

                  <span className="font-semibold text-slate-900">
                    {String(
                      order.paymentMethod || "COD"
                    ).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Status
                  </span>

                  <span className="font-semibold text-slate-900">
                    {String(
                      order.paymentStatus ||
                        "pending"
                    )
                      .charAt(0)
                      .toUpperCase() +
                      String(
                        order.paymentStatus ||
                          "pending"
                      ).slice(1)}
                  </span>
                </div>
              </div>
            </section>

            {/* Order Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-950">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-slate-900">
                    {money(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Shipping
                  </span>

                  <span className="font-medium text-slate-900">
                    {money(shipping)}
                  </span>
                </div>

                {discount > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Discount
                    </span>

                    <span className="font-medium text-green-600">
                      -{money(discount)}
                    </span>
                  </div>
                ) : null}

                {tax > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Tax
                    </span>

                    <span className="font-medium text-slate-900">
                      {money(tax)}
                    </span>
                  </div>
                ) : null}

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-base font-bold text-slate-950">
                      Total
                    </span>

                    <span className="text-lg font-bold text-slate-950">
                      {money(total)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Cancel Order */}
            {canCancel ? (
              <form
                action={cancelOrder}
                className="w-full"
              >
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </button>
              </form>
            ) : null}

            <Link
              href="/books"
              className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}