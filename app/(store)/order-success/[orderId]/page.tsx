import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Book from "@/models/Book";
import "@/models/User";

type OrderSuccessPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { orderId } = await params;

  await connectDB();

  const order = await Order.findById(orderId)
    .populate("customer", "name email phone")
    .lean();

  if (!order) {
    notFound();
  }

  async function cancelOrder() {
    "use server";

    await connectDB();

    const currentOrder = await Order.findById(orderId);

    if (!currentOrder) {
      throw new Error("Order not found.");
    }

    if (
      currentOrder.orderStatus !== "pending" &&
      currentOrder.orderStatus !== "confirmed"
    ) {
      throw new Error(
        "This order can no longer be cancelled."
      );
    }

    if (
      String(currentOrder.paymentMethod).toLowerCase() ===
        "razorpay" &&
      String(currentOrder.paymentStatus).toLowerCase() ===
        "paid"
    ) {
      throw new Error(
        "Paid online orders cannot be cancelled until the refund is processed."
      );
    }

    currentOrder.orderStatus = "cancelled";
    await currentOrder.save();

    for (const item of currentOrder.items) {
      if (!item.book) {
        continue;
      }

      await Book.findByIdAndUpdate(item.book, {
        $inc: {
          stock: Number(item.quantity || 0),
        },
      });
    }

    revalidatePath("/account/orders");

    revalidatePath(
      `/account/orders/${currentOrder.orderNumber}`
    );

    revalidatePath(
      `/order-success/${currentOrder._id}`
    );
  }

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const shippingAddress = order.shippingAddress;

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const canCancel =
    order.orderStatus === "pending" ||
    order.orderStatus === "confirmed";

  const razorpayPaid =
    String(order.paymentMethod).toLowerCase() ===
      "razorpay" &&
    String(order.paymentStatus).toLowerCase() ===
      "paid";

  const showCancelButton =
    canCancel && !razorpayPaid;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Success Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Order Placed Successfully
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Thank you for your order. Your order has been
              successfully placed and is now being processed.
            </p>

            <div className="mt-5 rounded-lg border bg-slate-50 px-5 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Order Number
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {order.orderNumber}
              </p>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Package className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Order Items
                  </h2>

                  <p className="text-xs text-slate-500">
                    {items.length}{" "}
                    {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item: any, index: number) => (
                  <div
                    key={`${String(item.book)}-${index}`}
                    className="flex gap-4 p-5"
                  >
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      {item.slug && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.slug}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                        <span>
                          Qty:{" "}
                          <strong className="text-slate-900">
                            {item.quantity}
                          </strong>
                        </span>

                        <span>
                          Price:{" "}
                          <strong className="text-slate-900">
                            ₹
                            {Number(
                              item.price
                            ).toLocaleString("en-IN")}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-slate-900">
                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Delivery Address
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your order will be delivered here
                  </p>
                </div>
              </div>

              <div className="p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  {shippingAddress?.name}
                </p>

                <p className="mt-2">
                  {shippingAddress?.addressLine1}
                </p>

                {shippingAddress?.addressLine2 && (
                  <p>{shippingAddress.addressLine2}</p>
                )}

                <p>
                  {shippingAddress?.city},{" "}
                  {shippingAddress?.state}
                </p>

                <p>
                  {shippingAddress?.pincode},{" "}
                  {shippingAddress?.country}
                </p>

                <p className="mt-2">
                  Phone:{" "}
                  <span className="font-medium text-slate-900">
                    {shippingAddress?.phone}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <CreditCard className="h-5 w-5 text-slate-700" />
                </div>

                <h2 className="font-semibold text-slate-900">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹
                    {Number(order.subtotal).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Shipping
                  </span>

                  <span className="font-medium text-slate-900">
                    {Number(order.shipping) === 0
                      ? "Free"
                      : `₹${Number(
                          order.shipping
                        ).toLocaleString("en-IN")}`}
                  </span>
                </div>

                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Discount
                    </span>

                    <span className="font-medium text-green-600">
                      -₹
                      {Number(
                        order.discount
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {Number(order.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Tax
                    </span>

                    <span className="font-medium text-slate-900">
                      ₹
                      {Number(order.tax).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-slate-900">
                      ₹
                      {Number(order.total).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>

                {/* Payment */}
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Payment
                  </p>

                  <p className="mt-1 font-semibold capitalize text-slate-900">
                    {order.paymentMethod === "razorpay"
                      ? "Razorpay"
                      : "Cash on Delivery"}
                  </p>

                  <p className="mt-1 text-xs capitalize text-slate-500">
                    Status: {order.paymentStatus}
                  </p>
                </div>

                {/* Order Status */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Order Status
                  </p>

                  <p className="mt-1 font-semibold capitalize text-slate-900">
                    {order.orderStatus}
                  </p>
                </div>

                {/* Cancel Order */}
                {showCancelButton && (
                  <form action={cancelOrder} className="pt-1">
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  </form>
                )}

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Order
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/books"
                    className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}