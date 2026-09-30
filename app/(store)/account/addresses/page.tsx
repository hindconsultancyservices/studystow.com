"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

type Address = {
  _id?: string;
  id?: string;
  label?: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

type AddressForm = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const emptyForm: AddressForm = {
  label: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

function getAddressId(address: Address) {
  return String(address._id ?? address.id ?? "");
}

function extractAddresses(value: unknown): Address[] {
  if (Array.isArray(value)) {
    return value as Address[];
  }

  if (
    value &&
    typeof value === "object" &&
    "addresses" in value &&
    Array.isArray((value as { addresses: unknown }).addresses)
  ) {
    return (value as { addresses: Address[] }).addresses;
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  ) {
    return (value as { data: Address[] }).data;
  }

  return [];
}

export default function AddressesPage() {
  const { data: session, status } = useSession();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    let mounted = true;

    async function loadAddresses() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/users/me/addresses", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load addresses."
          );
        }

        if (mounted) {
          setAddresses(extractAddresses(data));
        }
      } catch (loadError) {
        if (mounted) {
          setAddresses([]);

          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load addresses."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAddresses();

    return () => {
      mounted = false;
    };
  }, [status]);

  function updateField(
    field: keyof AddressForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAddForm() {
    setEditingId("");
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(address: Address) {
    setEditingId(getAddressId(address));

    setForm({
      label: address.label ?? "",
      fullName: address.fullName ?? "",
      phone: address.phone ?? "",
      addressLine1: address.addressLine1 ?? "",
      addressLine2: address.addressLine2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postalCode: address.postalCode ?? "",
      country: address.country ?? "India",
      isDefault: Boolean(address.isDefault),
    });

    setError("");
    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId("");
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const payload = {
      label: form.label.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
      isDefault: form.isDefault,
    };

    if (
      !payload.fullName ||
      !payload.phone ||
      !payload.addressLine1 ||
      !payload.city ||
      !payload.state ||
      !payload.postalCode ||
      !payload.country
    ) {
      setError("Please fill in all required address fields.");
      return;
    }

    try {
      setSaving(true);

      const endpoint = editingId
        ? `/api/users/me/addresses/${encodeURIComponent(editingId)}`
        : "/api/users/me/addresses";

      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: unknown = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const apiMessage =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message?: unknown }).message ===
            "string"
            ? (data as { message: string }).message
            : "Unable to save the address.";

        throw new Error(apiMessage);
      }

      const updatedAddresses = extractAddresses(data);

      if (updatedAddresses.length > 0) {
        setAddresses(updatedAddresses);
      } else {
        const refreshedResponse = await fetch(
          "/api/users/me/addresses",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (refreshedResponse.ok) {
          const refreshedData =
            await refreshedResponse.json();

          setAddresses(extractAddresses(refreshedData));
        }
      }

      const wasEditing = Boolean(editingId);

      setShowForm(false);
      setEditingId("");
      setForm(emptyForm);

      setMessage(
        wasEditing
          ? "Address updated successfully."
          : "Address added successfully."
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the address."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(addressId: string) {
    if (!addressId) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this address?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingId(addressId);

    try {
      const response = await fetch(
        `/api/users/me/addresses/${encodeURIComponent(
          addressId
        )}`,
        {
          method: "DELETE",
        }
      );

      let data: unknown = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const apiMessage =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message?: unknown }).message ===
            "string"
            ? (data as { message: string }).message
            : "Unable to delete the address.";

        throw new Error(apiMessage);
      }

      setAddresses((current) =>
        current.filter(
          (address) => getAddressId(address) !== addressId
        )
      );

      setMessage("Address removed successfully.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the address."
      );
    } finally {
      setDeletingId("");
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-64 rounded bg-gray-200" />

            <div className="mt-8 grid gap-6 lg:grid-cols-4">
              <div className="h-72 rounded-xl bg-gray-200" />

              <div className="lg:col-span-3">
                <div className="h-40 rounded-xl bg-gray-200" />
                <div className="mt-6 h-64 rounded-xl bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Please login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to manage your addresses.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    session.user?.name || "Customer";

  const displayEmail =
    session.user?.email || "";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Account
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            My Addresses
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your saved delivery addresses.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="h-fit rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 border-b px-2 pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 font-bold uppercase text-white">
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {displayName}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {displayEmail}
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
                className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900"
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
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="w-full rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </nav>
          </aside>

          {/* Main */}
          <section className="lg:col-span-3">
            {/* Top */}
            <div className="rounded-xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Saved Addresses
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {addresses.length === 0
                      ? "No saved addresses"
                      : `${addresses.length} ${
                          addresses.length === 1
                            ? "address"
                            : "addresses"
                        } saved`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="w-fit rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  + Add Address
                </button>
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b pb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editingId
                        ? "Edit Address"
                        : "Add New Address"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Enter your delivery details below.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="label"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Address Label
                      </label>

                      <input
                        id="label"
                        type="text"
                        value={form.label}
                        onChange={(event) =>
                          updateField(
                            "label",
                            event.target.value
                          )
                        }
                        placeholder="Home"
                        disabled={saving}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Full Name *
                      </label>

                      <input
                        id="fullName"
                        type="text"
                        value={form.fullName}
                        onChange={(event) =>
                          updateField(
                            "fullName",
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                        placeholder="Recipient name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Phone *
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          updateField(
                            "phone",
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                        placeholder="Phone number"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Country *
                      </label>

                      <input
                        id="country"
                        type="text"
                        value={form.country}
                        onChange={(event) =>
                          updateField(
                            "country",
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                        placeholder="India"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="addressLine1"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Address Line 1 *
                      </label>

                      <input
                        id="addressLine1"
                        type="text"
                        value={form.addressLine1}
                        onChange={(event) =>
                          updateField(
                            "addressLine1",
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                        placeholder="House, street, building"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="addressLine2"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Address Line 2
                      </label>

                      <input
                        id="addressLine2"
                        type="text"
                        value={form.addressLine2}
                        onChange={(event) =>
                          updateField(
                            "addressLine2",
                            event.target.value
                          )
                        }
                        disabled={saving}
                        placeholder="Apartment, landmark, area"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        City *
                      </label>

                      <input
                        id="city"
                        type="text"
                        value={form.city}
                        onChange={(event) =>
                          updateField(
                            "city",
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                        placeholder="City"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        State *
                      </label>

                      <input
                        id="state"
                        type="text"
                        value={form.state}
                        onChange={(event) =>
                          updateField(
                            "state",
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                        placeholder="State"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="postalCode"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Postal Code *
                      </label>

                      <input
                        id="postalCode"
                        type="text"
                        value={form.postalCode}
                        onChange={(event) =>
                          updateField(
                            "postalCode",
                            event.target.value
                          )
                        }
                        required
                        disabled={saving}
                        placeholder="Postal code"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-5">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={(event) =>
                          updateField(
                            "isDefault",
                            event.target.checked
                          )
                        }
                        disabled={saving}
                        className="h-4 w-4 accent-black"
                      />

                      <span className="text-sm font-medium text-gray-700">
                        Use as my default address
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeForm}
                      disabled={saving}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                        ? "Update Address"
                        : "Save Address"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Address List */}
            <div className="mt-6">
              {addresses.length === 0 ? (
                <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-500">
                    📍
                  </div>

                  <h2 className="mt-5 text-lg font-semibold text-gray-900">
                    No saved addresses
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                    Add a delivery address to make checkout
                    faster.
                  </p>

                  <button
                    type="button"
                    onClick={openAddForm}
                    className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {addresses.map((address) => {
                    const addressId = getAddressId(address);

                    return (
                      <article
                        key={addressId}
                        className="rounded-xl border bg-white p-6 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-lg font-semibold text-gray-900">
                                {address.label || "Address"}
                              </h2>

                              {address.isDefault && (
                                <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white">
                                  Default
                                </span>
                              )}
                            </div>

                            {address.fullName && (
                              <p className="mt-4 font-medium text-gray-900">
                                {address.fullName}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 space-y-1 text-sm leading-6 text-gray-600">
                          {address.addressLine1 && (
                            <p>{address.addressLine1}</p>
                          )}

                          {address.addressLine2 && (
                            <p>{address.addressLine2}</p>
                          )}

                          {(address.city ||
                            address.state ||
                            address.postalCode) && (
                            <p>
                              {[address.city, address.state]
                                .filter(Boolean)
                                .join(", ")}

                              {address.postalCode
                                ? ` - ${address.postalCode}`
                                : ""}
                            </p>
                          )}

                          {address.country && (
                            <p>{address.country}</p>
                          )}

                          {address.phone && (
                            <p className="pt-2 font-medium text-gray-900">
                              {address.phone}
                            </p>
                          )}
                        </div>

                        <div className="mt-6 flex gap-2 border-t pt-5">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(address)
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(addressId)
                            }
                            disabled={
                              deletingId === addressId
                            }
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === addressId
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
