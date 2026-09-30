"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CreditCard,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";

type PaymentMethod = "cod";

type CartItem = {
  id?: string;
  book: string;
  title: string;
  slug: string;
  author?: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
};

type Address = {
  _id: string;
  id?: string;
  label?: string;
  name?: string;
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
};

type CouponResult = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discount: number;
};

const money = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function formatPrice(value: number) {
  const amount = Number(value);

  return `₹${money.format(
    Number.isFinite(amount) ? amount : 0,
  )}`;
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error(
      "API returned non-JSON response:",
      text.slice(0, 500),
    );

    throw new Error(
      "Server returned an invalid response. Please try again.",
    );
  }
}

export default function CheckoutForm() {
  const { data: session, status: sessionStatus } =
    useSession();

  const [cartItems, setCartItems] = useState<CartItem[]>(
    [],
  );

  const [addresses, setAddresses] = useState<Address[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [showAddresses, setShowAddresses] =
    useState(false);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [paymentMethod] =
    useState<PaymentMethod>("cod");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [newAddress, setNewAddress] = useState({
    label: "HOME",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  const [couponCode, setCouponCode] = useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponResult | null>(null);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] = useState("");

  const [error, setError] = useState("");

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [orderNumber, setOrderNumber] =
    useState("");

  /*
   * =====================================================
   * PRICING
   * =====================================================
   *
   * Cart comes from MongoDB through /api/cart.
   *
   * No fake shipping.
   * No fake tax.
   *
   * Until a real shipping/tax engine is connected:
   *
   * total = subtotal - validated coupon discount
   */

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  const discount = useMemo(() => {
    const value = Number(
      appliedCoupon?.discount ?? 0,
    );

    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    return Math.min(value, subtotal);
  }, [appliedCoupon, subtotal]);

  const shipping = 0;
  const tax = 0;

  const total = Math.max(
    subtotal + shipping + tax - discount,
    0,
  );

  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return (
        total + (Number(item.quantity) || 0)
      );
    }, 0);
  }, [cartItems]);

  const selectedAddress =
    addresses.find(
      (address) =>
        address._id === selectedAddressId,
    ) || addresses[0];

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setLoading(false);
      return;
    }

    setEmail(session.user?.email || "");
    setLoading(true);

    Promise.all([
      loadCart(),
      loadAddresses(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [
    sessionStatus,
    session?.user?.email,
  ]);

  /*
   * =====================================================
   * LOAD CART
   * =====================================================
   */

  async function loadCart() {
    try {
      setError("");

      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      const result = await readJsonResponse(
        response,
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to load cart.",
        );
      }

      /*
       * Supports both:
       *
       * { items: [...] }
       *
       * and:
       *
       * { success: true, data: { items: [...] } }
       */

      const payload =
        result?.data ?? result;

      const items = Array.isArray(
        payload?.items,
      )
        ? payload.items
        : [];

      setCartItems(items);
    } catch (error) {
      console.error(
        "Load cart error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load cart.",
      );
    }
  }

  /*
   * =====================================================
   * LOAD ADDRESSES
   * =====================================================
   */

  async function loadAddresses() {
    try {
      const response = await fetch(
        "/api/users/me/addresses",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result = await readJsonResponse(
        response,
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to load addresses.",
        );
      }

      const data = Array.isArray(
        result?.data,
      )
        ? result.data
        : [];

      const normalizedAddresses: Address[] =
        data.map((address: Address) => ({
          ...address,
          _id:
            address._id ||
            address.id ||
            "",
          fullName:
            address.fullName ||
            address.name ||
            "",
        }));

      setAddresses(normalizedAddresses);

      const defaultAddress =
        normalizedAddresses.find(
          (address) =>
            address.isDefault,
        ) ||
        normalizedAddresses[0];

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress._id,
        );

        setFullName(
          defaultAddress.fullName || "",
        );

        setPhone(
          defaultAddress.phone || "",
        );
      }
    } catch (error) {
      console.error(
        "Load addresses error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load addresses.",
      );
    }
  }

  /*
   * =====================================================
   * ADDRESS SELECTION
   * =====================================================
   */

  function handleSelectAddress(id: string) {
    setSelectedAddressId(id);
    setShowAddresses(false);
    setError("");

    const address = addresses.find(
      (item) => item._id === id,
    );

    if (address) {
      setFullName(
        address.fullName ||
          address.name ||
          "",
      );

      setPhone(address.phone || "");
    }
  }

  function handleNewAddressChange(
    field: keyof typeof newAddress,
    value: string | boolean,
  ) {
    setNewAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /*
   * =====================================================
   * ADD ADDRESS
   * =====================================================
   */

  async function handleAddAddress() {
    setError("");

    const cleanFullName =
      newAddress.fullName.trim();

    const cleanPhone =
      newAddress.phone.trim();

    const cleanAddressLine1 =
      newAddress.addressLine1.trim();

    const cleanCity =
      newAddress.city.trim();

    const cleanState =
      newAddress.state.trim();

    const cleanPostalCode =
      newAddress.postalCode.trim();

    if (
      !cleanFullName ||
      !cleanPhone ||
      !cleanAddressLine1 ||
      !cleanCity ||
      !cleanState ||
      !cleanPostalCode
    ) {
      setError(
        "Please fill all required address fields.",
      );
      return;
    }

    if (!/^\d{6}$/.test(cleanPostalCode)) {
      setError(
        "Pincode must be 6 digits.",
      );
      return;
    }

    try {
      setSavingAddress(true);

      const response = await fetch(
        "/api/users/me/addresses",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...newAddress,
            fullName: cleanFullName,
            phone: cleanPhone,
            addressLine1:
              cleanAddressLine1,
            city: cleanCity,
            state: cleanState,
            postalCode:
              cleanPostalCode,
          }),
        },
      );

      const result =
        await readJsonResponse(response);

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to save address.",
        );
      }

      const rawSavedAddress =
        result?.data;

      if (!rawSavedAddress) {
        throw new Error(
          "Address was saved but server returned no address data.",
        );
      }

      const savedAddress: Address = {
        ...rawSavedAddress,
        _id:
          rawSavedAddress._id ||
          rawSavedAddress.id ||
          "",
        fullName:
          rawSavedAddress.fullName ||
          rawSavedAddress.name ||
          cleanFullName,
      };

      setAddresses((previous) => {
        /*
         * If the new address is default,
         * remove default state from old addresses.
         */
        if (savedAddress.isDefault) {
          return [
            ...previous.map((address) => ({
              ...address,
              isDefault: false,
            })),
            savedAddress,
          ];
        }

        return [
          ...previous,
          savedAddress,
        ];
      });

      setSelectedAddressId(
        savedAddress._id,
      );

      setFullName(
        savedAddress.fullName || "",
      );

      setPhone(
        savedAddress.phone || "",
      );

      setNewAddress({
        label: "HOME",
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
      });

      setShowAddressForm(false);
      setShowAddresses(false);
      setError("");
    } catch (error) {
      console.error(
        "Save address error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save address.",
      );
    } finally {
      setSavingAddress(false);
    }
  }

  /*
   * =====================================================
   * COUPON
   * =====================================================
   */

  async function handleApplyCoupon() {
    setCouponError("");

    const code =
      couponCode.trim();

    if (!code) {
      setCouponError(
        "Please enter a coupon code.",
      );
      return;
    }

    if (subtotal <= 0) {
      setCouponError(
        "Your cart is empty.",
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
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            code,
            subtotal,
          }),
        },
      );

      const result =
        await readJsonResponse(response);

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Unable to apply coupon.",
        );
      }

      const discountValue = Number(
        result?.data?.discount || 0,
      );

      setAppliedCoupon({
        code:
          result?.data?.code ||
          code.toUpperCase(),

        type:
          result?.data?.type ||
          "percentage",

        value:
          Number(
            result?.data?.value || 0,
          ),

        discount:
          Number.isFinite(
            discountValue,
          ) &&
          discountValue > 0
            ? Math.min(
                discountValue,
                subtotal,
              )
            : 0,
      });

      setCouponCode("");
      setCouponError("");
    } catch (error) {
      setAppliedCoupon(null);

      setCouponError(
        error instanceof Error
          ? error.message
          : "Unable to apply coupon.",
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

  /*
   * =====================================================
   * VALIDATION
   * =====================================================
   */

  function validateCheckout() {
    if (!session?.user?.id) {
      return "Please login before checkout.";
    }

    if (cartItems.length === 0) {
      return "Your cart is empty.";
    }

    if (totalItems <= 0) {
      return "Your cart is empty.";
    }

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

    /*
     * Correct email regex.
     */
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim(),
      )
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  }

  /*
   * =====================================================
   * PLACE ORDER
   * =====================================================
   */

  async function handlePlaceOrder(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isPlacingOrder) {
      return;
    }

    setError("");

    const validationError =
      validateCheckout();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!selectedAddress) {
      setError(
        "Please select a delivery address.",
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
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            customer:
              session?.user?.id,

            items: cartItems.map(
              (item) => ({
                book: item.book,
                title: item.title,
                slug: item.slug,
                quantity:
                  Number(
                    item.quantity,
                  ),
                price:
                  Number(item.price),
                image:
                  item.image || "",
              }),
            ),

            shippingAddress: {
              fullName:
                selectedAddress.fullName ||
                selectedAddress.name ||
                fullName,

              phone:
                selectedAddress.phone ||
                phone,

              addressLine1:
                selectedAddress.addressLine1,

              addressLine2:
                selectedAddress.addressLine2 ||
                "",

              city:
                selectedAddress.city,

              state:
                selectedAddress.state,

              postalCode:
                selectedAddress.postalCode,

              country:
                selectedAddress.country ||
                "India",
            },

            subtotal,
            shipping,
            discount,
            tax,
            total,

            couponCode:
              appliedCoupon?.code || "",

            paymentMethod,

            paymentStatus:
              "pending",

            orderStatus:
              "pending",

            notes: "",
          }),
        },
      );

      const result =
        await readJsonResponse(response);

      if (
        !response.ok ||
        !result?.success
      ) {
        /*
         * Server may have newer price,
         * stock or cart information.
         */
        if (response.status === 409) {
          await loadCart();
        }

        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to place order.",
        );
      }

      const createdOrder = result?.data;

      if (!createdOrder?._id) {
        throw new Error(
          "Order was created but order ID was not returned.",
        );
      }

      window.location.href =
        `/order-success/${createdOrder._id}`;

      setOrderNumber(
        createdOrder?.orderNumber ||
          createdOrder?._id ||
          "",
      );

      /*
       * Only clear MongoDB cart AFTER
       * successful order creation.
       */
      await clearCart();

      setCartItems([]);
      setOrderPlaced(true);
    } catch (error) {
      console.error(
        "Place order error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to place order.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  }

  /*
   * =====================================================
   * CLEAR CART
   * =====================================================
   */

  async function clearCart() {
    try {
      const response =
        await fetch("/api/cart", {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({}),
        });

      if (!response.ok) {
        console.error(
          "Cart clear request failed:",
          response.status,
        );
      }
    } catch (error) {
      console.error(
        "Clear cart error:",
        error,
      );
    }

    /*
     * Only UI synchronization event.
     * NOT a data source.
     */
    try {
      window.dispatchEvent(
        new Event(
          "studystow-cart-updated",
        ),
      );
    } catch {
      // Browser event is optional.
    }
  }

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

        <p className="mt-4 text-sm text-slate-500">
          Loading checkout...
        </p>
      </div>
    );
  }

  /*
   * =====================================================
   * LOGIN REQUIRED
   * =====================================================
   */

  if (
    sessionStatus !==
    "authenticated"
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Login Required
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please login to continue
          checkout.
        </p>

        <Link
          href="/login"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Login
        </Link>
      </div>
    );
  }

  /*
   * =====================================================
   * SUCCESS
   * =====================================================
   */

  if (orderPlaced) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
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

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Your order has been received
          successfully. You can track
          your order from your account.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/account/orders"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View My Orders
          </Link>

          <Link
            href="/books"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * EMPTY CART
   * =====================================================
   */

  if (cartItems.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <BookOpen className="h-6 w-6 text-slate-500" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Your cart is empty
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Add a book to your cart
          before starting checkout.
        </p>

        <Link
          href="/books"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  /*
   * =====================================================
   * CHECKOUT
   * =====================================================
   */

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">

      {/* LEFT SIDE */}

      <div className="min-w-0 space-y-6">

        {/* DELIVERY ADDRESS */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <MapPin className="h-4 w-4 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Delivery Address
                </h2>

                <p className="text-xs text-slate-500">
                  Select where your order
                  should be delivered.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAddresses(
                  (previous) =>
                    !previous,
                )
              }
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              {showAddresses
                ? "Close"
                : "Change"}
            </button>
          </div>

          <div className="p-5 sm:p-6">

            {showAddresses && (
              <div className="mb-5 space-y-3">
                {addresses.map(
                  (address) => {
                    const selected =
                      address._id ===
                      selectedAddressId;

                    return (
                      <button
                        key={
                          address._id
                        }
                        type="button"
                        onClick={() =>
                          handleSelectAddress(
                            address._id,
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

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">
                                {
                                  address.fullName ||
                                  address.name
                                }
                              </p>

                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {address.label ||
                                  "ADDRESS"}
                              </span>
                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {
                                address.addressLine1
                              }

                              {address.addressLine2 && (
                                <>
                                  <br />
                                  {
                                    address.addressLine2
                                  }
                                </>
                              )}

                              <br />

                              {
                                address.city
                              }
                              ,{" "}
                              {
                                address.state
                              }{" "}
                              -{" "}
                              {
                                address.postalCode
                              }
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-700">
                              {
                                address.phone
                              }
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}

                {addresses.length ===
                  0 && (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No saved addresses
                    found. Add a new
                    delivery address
                    below.
                  </p>
                )}
              </div>
            )}

            {selectedAddress && (
              <div className="rounded-xl border-2 border-slate-900 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {
                          selectedAddress.fullName ||
                          selectedAddress.name
                        }
                      </p>

                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {selectedAddress.label ||
                          "ADDRESS"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {
                        selectedAddress.addressLine1
                      }

                      {selectedAddress.addressLine2 && (
                        <>
                          <br />
                          {
                            selectedAddress.addressLine2
                          }
                        </>
                      )}

                      <br />

                      {
                        selectedAddress.city
                      }
                      ,{" "}
                      {
                        selectedAddress.state
                      }{" "}
                      -{" "}
                      {
                        selectedAddress.postalCode
                      }
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {
                        selectedAddress.phone
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setShowAddressForm(
                  (previous) =>
                    !previous,
                )
              }
              className="mt-4 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              {showAddressForm
                ? "− Cancel"
                : "+ Add New Address"}
            </button>

            {showAddressForm && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">
                  Add New Address
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <input
                    value={
                      newAddress.fullName
                    }
                    onChange={(event) =>
                      handleNewAddressChange(
                        "fullName",
                        event.target.value,
                      )
                    }
                    placeholder="Full Name"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  />

                  <input
                    value={
                      newAddress.phone
                    }
                    onChange={(event) =>
                      handleNewAddressChange(
                        "phone",
                        event.target.value,
                      )
                    }
                    placeholder="Phone"
                    inputMode="tel"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  />

                  <input
                    value={
                      newAddress.addressLine1
                    }
                    onChange={(event) =>
                      handleNewAddressChange(
                        "addressLine1",
                        event.target.value,
                      )
                    }
                    placeholder="Address"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500 sm:col-span-2"
                  />

                  <input
                    value={
                      newAddress.addressLine2
                    }
                    onChange={(event) =>
                      handleNewAddressChange(
                        "addressLine2",
                        event.target.value,
                      )
                    }
                    placeholder="Address Line 2 (optional)"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500 sm:col-span-2"
                  />

                  <input
                    value={
                      newAddress.city
                    }
                    onChange={(event) =>
                      handleNewAddressChange(
                        "city",
                        event.target.value,
                      )
                    }
                    placeholder="City"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  />

                  <input
                    value={
                      newAddress.state
                    }
                    onChange={(event) =>
                      handleNewAddressChange(
                        "state",
                        event.target.value,
                      )
                    }
                    placeholder="State"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  />

                  <input
                    value={
                      newAddress.postalCode
                    }
                    onChange={(event) =>
                      handleNewAddressChange(
                        "postalCode",
                        event.target.value
                          .replace(
                            /\D/g,
                            "",
                          )
                          .slice(
                            0,
                            6,
                          ),
                      )
                    }
                    placeholder="Pincode"
                    inputMode="numeric"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  />

                  <input
                    value={
                      newAddress.country
                    }
                    onChange={(event) =>
                      handleNewAddressChange(
                        "country",
                        event.target.value,
                      )
                    }
                    placeholder="Country"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    handleAddAddress
                  }
                  disabled={
                    savingAddress
                  }
                  className="mt-5 h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingAddress
                    ? "Saving..."
                    : "Save Address"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CHECKOUT FORM */}

        <form
          id="checkout-form"
          onSubmit={
            handlePlaceOrder
          }
          className="space-y-6"
        >

          {/* CONTACT INFORMATION */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-slate-900">
                Contact Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                We&apos;ll use this
                information for your
                order.
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
                      event.target.value,
                    )
                  }
                  autoComplete="name"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"
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
                      event.target.value,
                    )
                  }
                  autoComplete="tel"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"
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
                      event.target.value,
                    )
                  }
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          {/* COUPON */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Tag className="h-4 w-4 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Coupon Code
                  </h2>

                  <p className="text-xs text-slate-500">
                    Apply a valid coupon
                    to your order.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-green-700">
                      {
                        appliedCoupon.code
                      }
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                      Discount:{" "}
                      {formatPrice(
                        discount,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeCoupon
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 transition hover:text-red-600"
                    aria-label="Remove coupon"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={
                      couponCode
                    }
                    onChange={(
                      event,
                    ) =>
                      setCouponCode(
                        event.target.value.toUpperCase(),
                      )
                    }
                    placeholder="Enter coupon code"
                    className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold uppercase outline-none focus:border-slate-500"
                  />

                  <button
                    type="button"
                    onClick={
                      handleApplyCoupon
                    }
                    disabled={
                      couponLoading
                    }
                    className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* PAYMENT */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <CreditCard className="h-4 w-4 text-slate-700" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Payment Method
                  </h2>

                  <p className="text-xs text-slate-500">
                    Select an available
                    payment method.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-900 bg-slate-50 p-4">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked
                  readOnly
                  className="mt-1 h-4 w-4 accent-slate-900"
                />

                <div>
                  <p className="font-semibold text-slate-900">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Pay when your
                    order is delivered.
                  </p>
                </div>
              </label>

              <p className="mt-3 text-xs text-slate-500">
                Online payment will
                appear here once a live
                payment gateway is
                connected.
              </p>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* MOBILE ORDER BUTTON */}

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
                : `Place Order • ${formatPrice(
                    total,
                  )}`}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT SIDE */}

      <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-4">

          {/* ORDER SUMMARY */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">
                  Order Summary
                </h2>

                <span className="text-xs font-medium text-slate-500">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </span>
              </div>
            </div>

            {/* PRODUCTS */}

            <div className="divide-y divide-slate-100">
              {cartItems.map(
                (item) => {
                  const itemTotal =
                    (Number(
                      item.price,
                    ) || 0) *
                    (Number(
                      item.quantity,
                    ) || 0);

                  return (
                    <div
                      key={
                        item.id ||
                        item.book
                      }
                      className="flex gap-3 p-4"
                    >
                      <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.title
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-5 w-5 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-slate-900">
                          {
                            item.title
                          }
                        </p>

                        {item.author && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {
                              item.author
                            }
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500">
                            Qty:{" "}
                            {
                              item.quantity
                            }
                          </span>

                          <span className="text-sm font-semibold text-slate-900">
                            {formatPrice(
                              itemTotal,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {/* PRICE */}

            <div className="space-y-3 border-t border-slate-200 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-medium text-slate-900">
                  {formatPrice(
                    subtotal,
                  )}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Discount
                  </span>

                  <span className="font-medium text-green-600">
                    -
                    {formatPrice(
                      discount,
                    )}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-slate-900">
                    {formatPrice(
                      total,
                    )}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={
                  isPlacingOrder
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PackageCheck className="h-4 w-4" />

                {isPlacingOrder
                  ? "Placing Order..."
                  : `Place Order • ${formatPrice(
                      total,
                    )}`}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                You will place this
                order using the
                selected delivery
                address.
              </p>
            </div>
          </div>

          {/* DELIVERY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <PackageCheck className="h-4 w-4 text-slate-700" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Delivery
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your selected delivery
                  address will be used
                  for this order.
                </p>

                {selectedAddress && (
                  <p className="mt-3 text-xs leading-5 text-slate-600">
                    {
                      selectedAddress.city
                    }
                    ,{" "}
                    {
                      selectedAddress.state
                    }{" "}
                    -{" "}
                    {
                      selectedAddress.postalCode
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BACK TO CART */}

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
        </div>
      </aside>
    </div>
  );
}