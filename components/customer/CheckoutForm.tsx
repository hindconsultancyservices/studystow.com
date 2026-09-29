"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";

type PaymentMethod = "online" | "cod";

type Address = {
  id: string;
  name: string;
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

type CouponResult = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discount: number;
};

const initialAddresses: Address[] = [
  {
    id: "address-1",
    name: "Rahul Kumar",
    label: "HOME",
    address: "House No. 123, Main Road",
    city: "Dhanbad",
    state: "Jharkhand",
    pincode: "826001",
    phone: "+91 98765 43210",
  },
];

export default function CheckoutForm() {
  const { data: session } = useSession();

  const customerId =
    (session?.user as { id?: string; _id?: string; customerId?: string } | undefined)?.id ||
    (session?.user as { id?: string; _id?: string; customerId?: string } | undefined)?._id ||
    (session?.user as { id?: string; _id?: string; customerId?: string } | undefined)?.customerId ||
    "";

  /*
   * Demo cart data.
   * Later this should come from your real cart API/context.
   */
  const cartItems = [
    {
      book: "BK001",
      title: "Atomic Habits",
      slug: "atomic-habits",
      price: 499,
      quantity: 1,
      image: "",
    },
    {
      book: "BK002",
      title: "The Psychology of Money",
      slug: "the-psychology-of-money",
      price: 399,
      quantity: 2,
      image: "",
    },
    {
      book: "BK004",
      title: "Ikigai",
      slug: "ikigai",
      price: 299,
      quantity: 1,
      image: "",
    },
  ];

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 999 ? 0 : 49;
  const tax = 0;

  const [addresses, setAddresses] =
    useState<Address[]>(initialAddresses);

  const [selectedAddressId, setSelectedAddressId] =
    useState("address-1");

  const [showAddresses, setShowAddresses] =
    useState(false);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("online");

  const [fullName, setFullName] =
    useState("Rahul Kumar");

  const [phone, setPhone] =
    useState("+91 98765 43210");

  const [email, setEmail] =
    useState("rahul@example.com");

  const [newAddress, setNewAddress] =
    useState({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    });

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponResult | null>(null);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  const [error, setError] =
    useState("");

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [orderNumber, setOrderNumber] =
    useState("");

  const selectedAddress =
    addresses.find(
      (address) =>
        address.id === selectedAddressId
    ) ?? addresses[0];

  /*
   * Current coupon discount.
   */
  const discount =
    appliedCoupon?.discount ?? 0;

  const total = Math.max(
    subtotal + shipping + tax - discount,
    0
  );

  function handleSelectAddress(id: string) {
    setSelectedAddressId(id);
    setShowAddresses(false);
    setError("");
  }

  function handleNewAddressChange(
    field: keyof typeof newAddress,
    value: string
  ) {
    setNewAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleAddAddress() {
    setError("");

    if (
      !newAddress.name.trim() ||
      !newAddress.address.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !newAddress.pincode.trim() ||
      !newAddress.phone.trim()
    ) {
      setError(
        "Please fill all address fields."
      );
      return;
    }

    if (!/^\d{6}$/.test(newAddress.pincode)) {
      setError("Pincode must be 6 digits.");
      return;
    }

    const address: Address = {
      id: `address-${Date.now()}`,
      name: newAddress.name.trim(),
      label: "HOME",
      address: newAddress.address.trim(),
      city: newAddress.city.trim(),
      state: newAddress.state.trim(),
      pincode: newAddress.pincode.trim(),
      phone: newAddress.phone.trim(),
    };

    setAddresses((previous) => [
      ...previous,
      address,
    ]);

    setSelectedAddressId(address.id);

    setNewAddress({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    });

    setShowAddressForm(false);
    setShowAddresses(false);
  }

  /*
   * Apply coupon.
   */
  async function handleApplyCoupon() {
    setCouponError("");

    const code = couponCode.trim();

    if (!code) {
      setCouponError(
        "Please enter a coupon code."
      );
      return;
    }

    try {
      setCouponLoading(true);

      const response = await fetch(
        "/api/coupons/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            subtotal,
          }),
        }
      );

      const text = await response.text();

      let result: any = {};

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Invalid server response."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to apply coupon."
        );
      }

      setAppliedCoupon({
        code:
          result.data?.code ||
          code.toUpperCase(),
        type:
          result.data?.type ||
          "percentage",
        value:
          Number(result.data?.value || 0),
        discount:
          Number(
            result.data?.discount || 0
          ),
      });

      setCouponCode("");
    } catch (err: any) {
      setAppliedCoupon(null);

      setCouponError(
        err?.message ||
          "Unable to apply coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponCode("");
  }

  function validateCheckout() {
    if (!selectedAddress) {
      return "Please select a delivery address.";
    }

    if (!fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!email.trim()) {
      return "Please enter your email address.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!paymentMethod) {
      return "Please select a payment method.";
    }

    return "";
  }

  async function handlePlaceOrder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const validationError =
      validateCheckout();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!selectedAddress) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    try {
      setIsPlacingOrder(true);

      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            /*
             * Replace this with actual logged-in
             * customer ID from session.
             */
            customer: customerId,

            items: cartItems.map((item) => ({
              book: item.book,
              title: item.title,
              slug: item.slug,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
            })),

            shippingAddress: {
              fullName:
                selectedAddress.name ||
                fullName,

              phone:
                selectedAddress.phone ||
                phone,

              addressLine1:
                selectedAddress.address,

              addressLine2: "",

              city:
                selectedAddress.city,

              state:
                selectedAddress.state,

              postalCode:
                selectedAddress.pincode,

              country: "India",
            },

            subtotal,

            shipping,

            discount,

            tax,

            total,

            couponCode:
              appliedCoupon?.code || "",

            paymentMethod:
              paymentMethod === "online"
                ? "razorpay"
                : "cod",

            paymentStatus:
              paymentMethod === "cod"
                ? "pending"
                : "pending",

            orderStatus:
              paymentMethod === "cod"
                ? "pending"
                : "pending",

            notes: "",
          }),
        }
      );

      const text = await response.text();

      let result: any = {};

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Invalid server response."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to place order."
        );
      }

      setOrderNumber(
        result.data?.orderNumber || ""
      );

      /*
       * COD order is completed.
       *
       * Razorpay should NOT show success here.
       * Razorpay verification should be connected
       * separately before marking online payment paid.
       */
      if (paymentMethod === "cod") {
        setOrderPlaced(true);
      } else {
        /*
         * Temporary:
         * Razorpay integration should be started here.
         */
        setError(
          "Order created. Razorpay payment integration is required before completing online payment."
        );
      }
    } catch (err: any) {
      console.error(
        "Place order error:",
        err
      );

      setError(
        err?.message ||
          "Failed to place order."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (orderPlaced) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Order Placed Successfully
          </h2>

          {orderNumber && (
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Order #{orderNumber}
            </p>
          )}

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your order has been received
            successfully. We&apos;ll send the
            order updates to your email and
            phone number.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/account/orders"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View My Orders
            </Link>

            <Link
              href="/books"
              className="inline-flex h-11 items-center justify-center rounded-xl border bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delivery Address */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <MapPin className="h-4 w-4 text-slate-700" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Delivery Address
              </h2>

              <p className="text-xs text-slate-500">
                Where should we deliver your
                order?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAddresses(
                (previous) => !previous
              )
            }
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {showAddresses
              ? "Close"
              : "Change"}
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {showAddresses && (
            <div className="mb-4 space-y-3">
              {addresses.map((address) => {
                const selected =
                  address.id ===
                  selectedAddressId;

                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() =>
                      handleSelectAddress(
                        address.id
                      )
                    }
                    className={`w-full rounded-xl border-2 p-4 text-left transition ${
                      selected
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          selected
                            ? "bg-slate-900"
                            : "border border-slate-300"
                        }`}
                      >
                        {selected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {address.name}
                          </p>

                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {address.label}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {address.address}
                          <br />
                          {address.city},{" "}
                          {address.state} -{" "}
                          {address.pincode}
                        </p>

                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {address.phone}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedAddress && (
            <div className="rounded-xl border-2 border-slate-900 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      {selectedAddress.name}
                    </p>

                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {selectedAddress.label}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {selectedAddress.address}
                    <br />
                    {selectedAddress.city},{" "}
                    {selectedAddress.state} -{" "}
                    {selectedAddress.pincode}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedAddress.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setShowAddressForm(
                (previous) => !previous
              )
            }
            className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {showAddressForm
              ? "− Cancel"
              : "+ Add New Address"}
          </button>

          {showAddressForm && (
            <div className="mt-5 rounded-xl border bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">
                Add New Address
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["name", "Full Name"],
                    ["phone", "Phone"],
                    ["address", "Address"],
                    ["city", "City"],
                    ["state", "State"],
                    ["pincode", "Pincode"],
                  ] as const
                ).map(
                  ([field, label]) => (
                    <div
                      key={field}
                      className={
                        field ===
                        "address"
                          ? "sm:col-span-2"
                          : ""
                      }
                    >
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {label}
                      </label>

                      <input
                        type={
                          field === "phone"
                            ? "tel"
                            : "text"
                        }
                        inputMode={
                          field === "pincode"
                            ? "numeric"
                            : undefined
                        }
                        maxLength={
                          field === "pincode"
                            ? 6
                            : undefined
                        }
                        value={
                          newAddress[
                            field
                          ]
                        }
                        onChange={(event) =>
                          handleNewAddressChange(
                            field,
                            field ===
                              "pincode"
                              ? event.target.value.replace(
                                  /\D/g,
                                  ""
                                )
                              : event.target
                                  .value
                          )
                        }
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                        placeholder={
                          field ===
                          "pincode"
                            ? "826001"
                            : `Enter ${label.toLowerCase()}`
                        }
                      />
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={
                  handleAddAddress
                }
                className="mt-5 h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <form
        id="checkout-form"
        onSubmit={handlePlaceOrder}
        className="space-y-6"
      >
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Contact Information
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              We&apos;ll use this information
              for order updates.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Coupon */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <Tag className="h-4 w-4 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Coupon Code
                </h2>

                <p className="text-xs text-slate-500">
                  Apply a valid coupon to get
                  discount.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <div>
                  <p className="text-sm font-bold text-green-700">
                    {appliedCoupon.code}
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    Discount applied:
                    {" "}
                    ₹{discount}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeCoupon}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) =>
                    setCouponCode(
                      event.target.value.toUpperCase()
                    )
                  }
                  placeholder="Enter coupon code"
                  className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold uppercase outline-none focus:border-slate-400"
                />

                <button
                  type="button"
                  onClick={
                    handleApplyCoupon
                  }
                  disabled={couponLoading}
                  className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {couponLoading
                    ? "Applying..."
                    : "Apply"}
                </button>
              </div>
            )}

            {couponError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {couponError}
              </p>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <CreditCard className="h-4 w-4 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Payment Method
                </h2>

                <p className="text-xs text-slate-500">
                  Choose your preferred payment
                  method.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5 sm:p-6">
            {/* Online */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                paymentMethod ===
                "online"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="online"
                checked={
                  paymentMethod ===
                  "online"
                }
                onChange={() =>
                  setPaymentMethod(
                    "online"
                  )
                }
                className="mt-1 h-4 w-4 accent-slate-900"
              />

              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  Online Payment
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  UPI, Cards, Net Banking
                  &amp; Wallets
                </p>
              </div>

              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                Secure
              </span>
            </label>

            {/* COD */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                paymentMethod ===
                "cod"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={
                  paymentMethod ===
                  "cod"
                }
                onChange={() =>
                  setPaymentMethod(
                    "cod"
                  )
                }
                className="mt-1 h-4 w-4 accent-slate-900"
              />

              <div>
                <p className="font-semibold text-slate-900">
                  Cash on Delivery
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Pay when your order is
                  delivered.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Mobile */}
        <div className="lg:hidden">
          <button
            type="submit"
            disabled={
              isPlacingOrder
            }
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />

            {isPlacingOrder
              ? "Placing Order..."
              : `Place Order • ₹${total}`}
          </button>
        </div>

        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </form>
    </div>
  );
}