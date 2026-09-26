"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

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
country: "",
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
let mounted = true;


async function loadAddresses() {
  setLoading(true);
  setError("");

  try {
    const response = await fetch("/api/users/me/addresses", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load addresses.");
    }

    const data = await response.json();
    const result = extractAddresses(data);

    if (mounted) {
      setAddresses(result);
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


}, []);

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
  country: address.country ?? "",
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

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


setError("");
setMessage("");
setSaving(true);

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
  setSaving(false);
  return;
}

try {
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
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Unable to save the address.";

    throw new Error(apiMessage);
  }

  const updatedAddresses = extractAddresses(data);

  if (updatedAddresses.length > 0) {
    setAddresses(updatedAddresses);
  } else {
    const refreshedResponse = await fetch("/api/users/me/addresses", {
      method: "GET",
      cache: "no-store",
    });

    if (refreshedResponse.ok) {
      const refreshedData = await refreshedResponse.json();
      setAddresses(extractAddresses(refreshedData));
    }
  }

  setShowForm(false);
  setEditingId("");
  setForm(emptyForm);
  setMessage(
    editingId
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


setError("");
setMessage("");
setDeletingId(addressId);

try {
  const response = await fetch(
    `/api/users/me/addresses/${encodeURIComponent(addressId)}`,
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
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Unable to delete the address.";

    throw new Error(apiMessage);
  }

  setAddresses((current) =>
    current.filter((address) => getAddressId(address) !== addressId)
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

return ( <main className="min-h-screen bg-white text-black">


  {/* HEADER */}
  <header className="border-b border-black/10 bg-white">
    <div className="mx-auto flex min-h-[82px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
      <Link
        href="/"
        aria-label="studystow.com home"
        className="inline-flex shrink-0 items-baseline"
      >
        <span className="text-[25px] font-black tracking-[-0.06em] sm:text-[28px]">
          studystow
        </span>

        <span className="ml-1 text-[13px] font-semibold text-black/50 sm:text-[14px]">
          .com
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/account"
          className="hidden h-10 items-center border border-black px-5 text-[12px] font-bold transition hover:bg-black hover:text-white sm:flex"
        >
          My Account
        </Link>

        <Link
          href="/cart"
          className="flex h-10 items-center border border-black bg-black px-5 text-[12px] font-bold text-white transition hover:bg-white hover:text-black"
        >
          Cart
        </Link>
      </div>
    </div>
  </header>

  <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">

    {/* BREADCRUMB */}
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-black/45">
      <Link href="/account" className="hover:text-black">
        Account
      </Link>

      <span>/</span>

      <span className="text-black">Addresses</span>
    </div>

    {/* PAGE HEADER */}
    <div className="mt-8 flex flex-col justify-between gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
          Account
        </p>

        <h1 className="mt-4 text-[42px] font-black tracking-[-0.05em] sm:text-[54px]">
          Addresses
        </h1>

        <p className="mt-4 max-w-xl text-[14px] leading-6 text-black/55">
          Manage the delivery addresses saved to your studystow.com
          account.
        </p>
      </div>

      <button
        type="button"
        onClick={openAddForm}
        className="inline-flex h-11 items-center justify-center border border-black bg-black px-6 text-[12px] font-bold text-white transition hover:bg-white hover:text-black"
      >
        + Add address
      </button>
    </div>

    {/* STATUS */}
    {error ? (
      <div
        role="alert"
        className="mt-6 border border-black bg-black px-4 py-3 text-[13px] text-white"
      >
        {error}
      </div>
    ) : null}

    {message ? (
      <div
        role="status"
        className="mt-6 border border-black/15 bg-black/[0.025] px-4 py-3 text-[13px]"
      >
        {message}
      </div>
    ) : null}

    {/* FORM */}
    {showForm ? (
      <section className="mt-10 border border-black">
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
              {editingId ? "Edit address" : "New address"}
            </p>

            <h2 className="mt-2 text-[24px] font-black tracking-[-0.03em]">
              {editingId ? "Update address" : "Add a new address"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            className="w-fit text-[12px] font-bold underline underline-offset-4"
          >
            Cancel
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 p-6 sm:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="label"
                className="mb-2 block text-[12px] font-bold"
              >
                Address label
              </label>

              <input
                id="label"
                type="text"
                value={form.label}
                onChange={(event) =>
                  updateField("label", event.target.value)
                }
                placeholder="e.g. Home"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-[12px] font-bold"
              >
                Full name *
              </label>

              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                placeholder="Enter recipient name"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-[12px] font-bold"
              >
                Phone *
              </label>

              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder="Enter phone number"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="mb-2 block text-[12px] font-bold"
              >
                Country *
              </label>

              <input
                id="country"
                type="text"
                value={form.country}
                onChange={(event) =>
                  updateField("country", event.target.value)
                }
                placeholder="Enter country"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                required
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="addressLine1"
                className="mb-2 block text-[12px] font-bold"
              >
                Address line 1 *
              </label>

              <input
                id="addressLine1"
                type="text"
                value={form.addressLine1}
                onChange={(event) =>
                  updateField("addressLine1", event.target.value)
                }
                placeholder="House / street / building"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                required
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="addressLine2"
                className="mb-2 block text-[12px] font-bold"
              >
                Address line 2
              </label>

              <input
                id="addressLine2"
                type="text"
                value={form.addressLine2}
                onChange={(event) =>
                  updateField("addressLine2", event.target.value)
                }
                placeholder="Apartment / landmark / area"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-[12px] font-bold"
              >
                City *
              </label>

              <input
                id="city"
                type="text"
                value={form.city}
                onChange={(event) =>
                  updateField("city", event.target.value)
                }
                placeholder="Enter city"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-2 block text-[12px] font-bold"
              >
                State *
              </label>

              <input
                id="state"
                type="text"
                value={form.state}
                onChange={(event) =>
                  updateField("state", event.target.value)
                }
                placeholder="Enter state"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="mb-2 block text-[12px] font-bold"
              >
                Postal code *
              </label>

              <input
                id="postalCode"
                type="text"
                value={form.postalCode}
                onChange={(event) =>
                  updateField("postalCode", event.target.value)
                }
                placeholder="Enter postal code"
                className="h-12 w-full border border-black px-4 text-[13px] outline-none focus:ring-2 focus:ring-black"
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="border-t border-black/10 pt-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) =>
                  updateField("isDefault", event.target.checked)
                }
                className="h-4 w-4 accent-black"
                disabled={saving}
              />

              <span className="text-[13px] font-medium">
                Use this as my default address
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="h-11 border border-black px-6 text-[12px] font-bold transition hover:bg-black hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-11 border border-black bg-black px-6 text-[12px] font-bold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update address"
                  : "Save address"}
            </button>
          </div>
        </form>
      </section>
    ) : null}

    {/* ADDRESSES LIST */}
    <section className="mt-10">
      {loading ? (
        <div className="border border-black/10 p-10 text-center text-[13px] text-black/50">
          Loading your addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div className="border border-dashed border-black/20 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-black text-xl">
            +
          </div>

          <h2 className="mt-6 text-[20px] font-bold">
            No saved addresses
          </h2>

          <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-black/50">
            You have not added a delivery address yet. Add one when you
            are ready.
          </p>

          <button
            type="button"
            onClick={openAddForm}
            className="mt-7 h-11 border border-black bg-black px-6 text-[12px] font-bold text-white transition hover:bg-white hover:text-black"
          >
            Add an address
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {addresses.map((address) => {
            const addressId = getAddressId(address);

            return (
              <article
                key={addressId}
                className="border border-black/10 p-6 transition hover:border-black sm:p-7"
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[17px] font-bold">
                        {address.label || "Address"}
                      </h2>

                      {address.isDefault ? (
                        <span className="border border-black px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em]">
                          Default
                        </span>
                      ) : null}
                    </div>

                    {address.fullName ? (
                      <p className="mt-4 text-[14px] font-semibold">
                        {address.fullName}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-[13px] leading-6 text-black/60">
                  {address.addressLine1 ? (
                    <p>{address.addressLine1}</p>
                  ) : null}

                  {address.addressLine2 ? (
                    <p>{address.addressLine2}</p>
                  ) : null}

                  {address.city ||
                  address.state ||
                  address.postalCode ? (
                    <p>
                      {[address.city, address.state]
                        .filter(Boolean)
                        .join(", ")}
                      {address.postalCode
                        ? ` - ${address.postalCode}`
                        : ""}
                    </p>
                  ) : null}

                  {address.country ? (
                    <p>{address.country}</p>
                  ) : null}

                  {address.phone ? (
                    <p className="pt-2 text-black/75">
                      {address.phone}
                    </p>
                  ) : null}
                </div>

                <div className="mt-7 flex flex-wrap gap-2 border-t border-black/10 pt-5">
                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    className="h-9 border border-black px-4 text-[11px] font-bold transition hover:bg-black hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(addressId)}
                    disabled={deletingId === addressId}
                    className="h-9 border border-black px-4 text-[11px] font-bold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
    </section>
  </div>

  {/* FOOTER */}
  <footer className="border-t border-black/10 bg-white">
    <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-8 text-[11px] text-black/40 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
      <Link
        href="/"
        className="inline-flex w-fit items-baseline"
      >
        <span className="text-[18px] font-black tracking-[-0.06em] text-black">
          studystow
        </span>

        <span className="ml-1 text-[10px] font-semibold text-black/45">
          .com
        </span>
      </Link>

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/privacy-policy" className="hover:text-black">
          Privacy Policy
        </Link>

        <Link
          href="/terms-and-conditions"
          className="hover:text-black"
        >
          Terms & Conditions
        </Link>

        <Link href="/contact" className="hover:text-black">
          Contact
        </Link>
      </div>
    </div>
  </footer>
</main>


);
}
