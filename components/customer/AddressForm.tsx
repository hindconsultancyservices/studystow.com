"use client";

import { FormEvent, useState } from "react";

type AddressFormProps = {
  onSuccess?: (address: any) => void;
  onCancel?: () => void;
};

export default function AddressForm({
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    label: "HOME",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.addressLine1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postalCode.trim()
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(form.postalCode.trim())) {
      setMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/users/me/addresses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            label: form.label,
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
            country: form.country.trim() || "India",
            isDefault: form.isDefault,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setMessage("Please login first.");
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Failed to save address."
        );
      }

      setMessage("Address saved successfully.");

      onSuccess?.(data.data);

      setForm({
        fullName: "",
        phone: "",
        email: "",
        label: "HOME",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
      });
    } catch (error) {
      console.error("Address form error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save address."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Add New Address
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter your delivery address.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Full Name *
          </label>

          <input
            type="text"
            value={form.fullName}
            onChange={(e) =>
              updateField("fullName", e.target.value)
            }
            placeholder="Enter full name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Phone *
          </label>

          <input
            type="tel"
            value={form.phone}
            onChange={(e) =>
              updateField(
                "phone",
                e.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            placeholder="10-digit mobile number"
            maxLength={10}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Email
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              updateField("email", e.target.value)
            }
            placeholder="Enter email address"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />
        </div>

        {/* Label */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Address Type
          </label>

          <select
            value={form.label}
            onChange={(e) =>
              updateField("label", e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          >
            <option value="HOME">Home</option>
            <option value="WORK">Work</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Address *
          </label>

          <input
            type="text"
            value={form.addressLine1}
            onChange={(e) =>
              updateField(
                "addressLine1",
                e.target.value
              )
            }
            placeholder="House no., street, area"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            required
          />
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Address Line 2
          </label>

          <input
            type="text"
            value={form.addressLine2}
            onChange={(e) =>
              updateField(
                "addressLine2",
                e.target.value
              )
            }
            placeholder="Landmark, apartment, locality"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />
        </div>

        {/* City */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            City *
          </label>

          <input
            type="text"
            value={form.city}
            onChange={(e) =>
              updateField("city", e.target.value)
            }
            placeholder="City"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            required
          />
        </div>

        {/* State */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            State *
          </label>

          <input
            type="text"
            value={form.state}
            onChange={(e) =>
              updateField("state", e.target.value)
            }
            placeholder="State"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            required
          />
        </div>

        {/* PIN */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            PIN Code *
          </label>

          <input
            type="text"
            inputMode="numeric"
            value={form.postalCode}
            onChange={(e) =>
              updateField(
                "postalCode",
                e.target.value.replace(/\D/g, "").slice(0, 6)
              )
            }
            placeholder="6-digit PIN"
            maxLength={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            required
          />
        </div>

        {/* Country */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Country
          </label>

          <input
            type="text"
            value={form.country}
            onChange={(e) =>
              updateField("country", e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />
        </div>
      </div>

      {/* Default */}
      <label className="mt-5 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) =>
            updateField("isDefault", e.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300"
        />

        <span className="text-sm text-gray-700">
          Make this my default address
        </span>
      </label>

      {/* Message */}
      {message && (
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Address"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}