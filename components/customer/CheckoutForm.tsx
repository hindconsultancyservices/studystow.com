"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
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

  const [error, setError] =
    useState("");

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const selectedAddress =
    addresses.find(
      (address) =>
        address.id === selectedAddressId
    ) ?? addresses[0];

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
      setError("Please fill all address fields.");
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

    setIsPlacingOrder(true);

    /*
      Actual order API / Razorpay integration
      will be connected here later.
    */

    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    setIsPlacingOrder(false);
    setOrderPlaced(true);
  }

  if (orderPlaced) {
    return (
      <div className="space-y-6">
        {/* Success */}
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Order Placed Successfully
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your order has been received successfully.
            We&apos;ll send the order updates to your
            email and phone number.
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
                Where should we deliver your order?
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
            {showAddresses ? "Close" : "Change"}
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* Address List */}
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

          {/* Selected Address */}
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

          {/* Add Address */}
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

          {/* New Address Form */}
          {showAddressForm && (
            <div className="mt-5 rounded-xl border bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">
                Add New Address
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={newAddress.name}
                    onChange={(event) =>
                      handleNewAddressChange(
                        "name",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(event) =>
                      handleNewAddressChange(
                        "phone",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="+91"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <input
                    type="text"
                    value={newAddress.address}
                    onChange={(event) =>
                      handleNewAddressChange(
                        "address",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="House No., Street, Area"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    City
                  </label>

                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(event) =>
                      handleNewAddressChange(
                        "city",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    State
                  </label>

                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(event) =>
                      handleNewAddressChange(
                        "state",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Pincode
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(event) =>
                      handleNewAddressChange(
                        "pincode",
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    placeholder="826001"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAddress}
                className="mt-5 h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Checkout Form */}
      <form
        onSubmit={handlePlaceOrder}
        className="space-y-6"
      >
        {/* Contact Information */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Contact Information
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              We&apos;ll use this information for order
              updates.
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
                  setFullName(event.target.value)
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
                  setPhone(event.target.value)
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
                  setEmail(event.target.value)
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>
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
                  Choose your preferred payment method.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5 sm:p-6">
            {/* Online */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                paymentMethod === "online"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="online"
                checked={
                  paymentMethod === "online"
                }
                onChange={() =>
                  setPaymentMethod("online")
                }
                className="mt-1 h-4 w-4 accent-slate-900"
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Online Payment
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      UPI, Cards, Net Banking &amp;
                      Wallets
                    </p>
                  </div>

                  <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                    Secure
                  </span>
                </div>
              </div>
            </label>

            {/* COD */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                paymentMethod === "cod"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={
                  paymentMethod === "cod"
                }
                onChange={() =>
                  setPaymentMethod("cod")
                }
                className="mt-1 h-4 w-4 accent-slate-900"
              />

              <div>
                <p className="font-semibold text-slate-900">
                  Cash on Delivery
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Pay when your order is delivered.
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

        {/* Mobile Place Order */}
        <div className="lg:hidden">
          <button
            type="submit"
            disabled={isPlacingOrder}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />

            {isPlacingOrder
              ? "Placing Order..."
              : "Place Order"}
          </button>
        </div>

        {/* Back */}
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

/*
  Place Order button used by checkout/page.tsx

  NOTE:
  The main checkout form contains the actual submit logic.
  This component is kept separately so the right-side
  Order Summary can trigger the same form.
*/

CheckoutForm.PlaceOrder = function PlaceOrder({
  total,
}: {
  total: number;
}) {
  return (
    <button
      type="submit"
      form="checkout-form"
      className="hidden"
      aria-hidden="true"
    >
      Place Order ₹{total}
    </button>
  );
};