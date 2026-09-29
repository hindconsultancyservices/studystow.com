"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Percent,
  Save,
  TicketPercent,
} from "lucide-react";

export default function NewCouponPage() {
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    perUserLimit: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(
    field: string,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.code.trim()) {
      setError("Coupon code is required.");
      return;
    }

    if (!form.value || Number(form.value) <= 0) {
      setError("Discount value must be greater than 0.");
      return;
    }

    if (
      form.type === "percentage" &&
      Number(form.value) > 100
    ) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Start date and end date are required.");
      return;
    }

    if (
      new Date(form.endDate) <=
      new Date(form.startDate)
    ) {
      setError("End date must be after start date.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          description: form.description.trim(),
          type: form.type,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount
            ? Number(form.minOrderAmount)
            : 0,
          maxDiscountAmount:
            form.maxDiscountAmount
              ? Number(form.maxDiscountAmount)
              : undefined,
          usageLimit: form.usageLimit
            ? Number(form.usageLimit)
            : undefined,
          perUserLimit: form.perUserLimit
            ? Number(form.perUserLimit)
            : undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          active: form.active,
        }),
      });

      const text = await response.text();

      let result: any = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create coupon."
        );
      }

      setSuccess("Coupon created successfully.");

      setForm({
        code: "",
        description: "",
        type: "percentage",
        value: "",
        minOrderAmount: "",
        maxDiscountAmount: "",
        usageLimit: "",
        perUserLimit: "",
        startDate: "",
        endDate: "",
        active: true,
      });
    } catch (err: any) {
      console.error("Create coupon error:", err);

      setError(
        err?.message || "Failed to create coupon."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <Link
              href="/admin/coupons"
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <p className="text-sm font-medium text-blue-600">
                Administration
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Create Coupon
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create a new discount coupon for your store.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <TicketPercent className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Basic Information
                </h2>

                <p className="text-sm text-slate-500">
                  Enter the coupon details.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Coupon Code *
                </label>

                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    updateField(
                      "code",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="WELCOME10"
                  maxLength={50}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Discount Type *
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    updateField("type", e.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="percentage">
                    Percentage
                  </option>
                  <option value="fixed">
                    Fixed Amount
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="10% off on first order"
                  rows={3}
                  maxLength={500}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Discount */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Percent className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Discount Rules
                </h2>

                <p className="text-sm text-slate-500">
                  Configure how much the customer receives.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Discount Value *
                </label>

                <div className="relative mt-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) =>
                      updateField(
                        "value",
                        e.target.value
                      )
                    }
                    placeholder={
                      form.type === "percentage"
                        ? "10"
                        : "100"
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    {form.type === "percentage"
                      ? "%"
                      : "₹"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Minimum Order Amount
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      updateField(
                        "minOrderAmount",
                        e.target.value
                      )
                    }
                    placeholder="499"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Maximum Discount
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maxDiscountAmount}
                    onChange={(e) =>
                      updateField(
                        "maxDiscountAmount",
                        e.target.value
                      )
                    }
                    placeholder="150"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Leave empty for no maximum.
                </p>
              </div>
            </div>
          </section>

          {/* Usage */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Usage Limits
                </h2>

                <p className="text-sm text-slate-500">
                  Control how many times the coupon can be used.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Total Usage Limit
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={(e) =>
                    updateField(
                      "usageLimit",
                      e.target.value
                    )
                  }
                  placeholder="500"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Leave empty for unlimited usage.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Per User Limit
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.perUserLimit}
                  onChange={(e) =>
                    updateField(
                      "perUserLimit",
                      e.target.value
                    )
                  }
                  placeholder="1"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Leave empty for unlimited uses per customer.
                </p>
              </div>
            </div>
          </section>

          {/* Validity */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <CalendarDays className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Coupon Validity
                </h2>

                <p className="text-sm text-slate-500">
                  Set when this coupon can be used.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Start Date *
                </label>

                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) =>
                    updateField(
                      "startDate",
                      e.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  End Date *
                </label>

                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) =>
                    updateField(
                      "endDate",
                      e.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Active */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  Coupon Active
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Enable this coupon immediately.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  updateField(
                    "active",
                    e.target.checked
                  )
                }
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </section>

          {/* Messages */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/coupons"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />

              {saving
                ? "Creating..."
                : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}