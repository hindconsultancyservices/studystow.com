"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Save,
  Truck,
  User,
  XCircle,
} from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

type PaymentMethod = "cod" | "razorpay";

interface Customer {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface OrderItem {
  book?: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Address {
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Order {
  _id: string;
  orderNumber: string;

  customer?: Customer | null;

  items: OrderItem[];

  shippingAddress: Address;
  billingAddress?: Address | null;

  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClasses(status: string) {
  switch (status) {
    case "delivered":
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "shipped":
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "confirmed":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "cancelled":
    case "failed":
    case "refunded":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "delivered":
      return <CheckCircle2 className="h-4 w-4" />;

    case "shipped":
      return <Truck className="h-4 w-4" />;

    case "processing":
    case "confirmed":
      return <Package className="h-4 w-4" />;

    case "cancelled":
      return <XCircle className="h-4 w-4" />;

    default:
      return <Clock3 className="h-4 w-4" />;
  }
}

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address?: Address | null;
}) {
  if (!address) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">No address available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        {address.name && (
          <p className="font-medium text-gray-900">{address.name}</p>
        )}

        {address.phone && <p>{address.phone}</p>}

        {address.addressLine1 && <p>{address.addressLine1}</p>}

        {address.addressLine2 && <p>{address.addressLine2}</p>}

        {(address.city || address.state || address.postalCode) && (
          <p>
            {[address.city, address.state, address.postalCode]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}

        {address.country && <p>{address.country}</p>}
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const orderId = decodeURIComponent(params.id);

  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [orderStatus, setOrderStatus] =
    useState<OrderStatus>("pending");

  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("pending");

  const [notes, setNotes] = useState("");

  const loadOrder = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `/api/admin/orders/${encodeURIComponent(orderId)}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load order"
          );
        }

        const data: Order = result.data;

        setOrder(data);
        setOrderStatus(data.orderStatus);
        setPaymentStatus(data.paymentStatus);
        setNotes(data.notes || "");
      } catch (err) {
        console.error("Load order error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load order"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  async function saveChanges() {
    if (!order) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus,
            paymentStatus,
            notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update order"
        );
      }

      setOrder(result.data);

      setOrderStatus(result.data.orderStatus);
      setPaymentStatus(result.data.paymentStatus);
      setNotes(result.data.notes || "");
    } catch (err) {
      console.error("Update order error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading order...
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-4 sm:p-6">
        <Link
          href="/admin/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">
            Failed to load order
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            onClick={() => loadOrder()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const customerName =
    order.customer?.name || "Guest Customer";

  const customerEmail =
    order.customer?.email || "No email";

  const totalItems = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/orders"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {order.orderNumber}
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                  order.orderStatus
                )}`}
              >
                {getStatusIcon(order.orderStatus)}
                {getStatusLabel(order.orderStatus)}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <button
            onClick={() => loadOrder(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Order Items */}
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Order Items
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {totalItems} item
                      {totalItems !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.book || item.title}-${index}`}
                    className="flex gap-4 p-5"
                  >
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Unit price: {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(
                          item.price * item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Addresses */}
            <div className="grid gap-6 md:grid-cols-2">
              <AddressBlock
                title="Shipping Address"
                address={order.shippingAddress}
              />

              <AddressBlock
                title="Billing Address"
                address={
                  order.billingAddress ||
                  order.shippingAddress
                }
              />
            </div>

            {/* Customer */}
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">
                  Customer
                </h2>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium text-gray-900">
                  {customerName}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {customerEmail}
                </p>

                {order.customer?.phone && (
                  <p className="mt-1 text-sm text-gray-500">
                    {order.customer.phone}
                  </p>
                )}
              </div>
            </section>

            {/* Payment Information */}
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">
                  Payment Information
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">
                    Payment Method
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {order.paymentMethod === "razorpay"
                      ? "Razorpay"
                      : "Cash on Delivery"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Payment Status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                      order.paymentStatus
                    )}`}
                  >
                    {getStatusLabel(order.paymentStatus)}
                  </span>
                </div>

                {order.razorpayOrderId && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Razorpay Order ID
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-gray-900">
                      {order.razorpayOrderId}
                    </p>
                  </div>
                )}

                {order.razorpayPaymentId && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Razorpay Payment ID
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-gray-900">
                      {order.razorpayPaymentId}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-gray-900">
                Order Notes
              </h2>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={4}
                placeholder="Add internal notes about this order..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Order Summary */}
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.shipping)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Discount
                  </span>

                  <span className="font-medium text-red-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Tax
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.tax)}
                  </span>
                </div>

                <div className="my-3 border-t border-gray-200" />

                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-gray-900">
                    Total
                  </span>

                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </section>

            {/* Update Order */}
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-900">
                Update Order
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="orderStatus"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Order Status
                  </label>

                  <select
                    id="orderStatus"
                    value={orderStatus}
                    onChange={(event) =>
                      setOrderStatus(
                        event.target.value as OrderStatus
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="paymentStatus"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Payment Status
                  </label>

                  <select
                    id="paymentStatus"
                    value={paymentStatus}
                    onChange={(event) =>
                      setPaymentStatus(
                        event.target.value as PaymentStatus
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Order Timeline */}
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-5 font-semibold text-gray-900">
                Order Timeline
              </h2>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <Package className="h-4 w-4 text-gray-600" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order placed
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {order.updatedAt !== order.createdAt && (
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <RefreshCw className="h-4 w-4 text-gray-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order updated
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      order.orderStatus === "cancelled"
                        ? "bg-red-50"
                        : "bg-emerald-50"
                    }`}
                  >
                    {order.orderStatus === "cancelled" ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current status
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {getStatusLabel(order.orderStatus)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}