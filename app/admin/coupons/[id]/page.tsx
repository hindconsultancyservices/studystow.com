"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Copy,
  Percent,
  Save,
  Trash2,
  TicketPercent,
  XCircle,
} from "lucide-react";

type Coupon = {
  _id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  status: string;
};

export default function CouponManagePage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    loadCoupon();
  }, [id]);

  async function loadCoupon() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/coupons/${id}`,
        {
          cache: "no-store",
        }
      );

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
          result.message || "Failed to load coupon."
        );
      }

      setCoupon(result.data);
    } catch (err: any) {
      console.error("Load coupon error:", err);

      setError(
        err?.message || "Failed to load coupon."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof Coupon,
    value: any
  ) {
    if (!coupon) return;

    setCoupon({
      ...coupon,
      [field]: value,
    });
  }

  function formatDateForInput(
    value?: string
  ) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const offset =
      date.getTimezoneOffset() * 60000;

    return new Date(
      date.getTime() - offset
    )
      .toISOString()
      .slice(0, 16);
  }

  async function handleSave() {
    if (!coupon) return;

    setError("");
    setSuccess("");

    if (!coupon.code.trim()) {
      setError("Coupon code is required.");
      return;
    }

    if (!coupon.value || Number(coupon.value) <= 0) {
      setError(
        "Discount value must be greater than 0."
      );
      return;
    }

    if (
      coupon.type === "percentage" &&
      Number(coupon.value) > 100
    ) {
      setError(
        "Percentage discount cannot exceed 100%."
      );
      return;
    }

    if (
      new Date(coupon.endDate) <=
      new Date(coupon.startDate)
    ) {
      setError(
        "End date must be after start date."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/coupons/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: coupon.code,
            description: coupon.description || "",
            type: coupon.type,
            value: Number(coupon.value),
            minOrderAmount: Number(
              coupon.minOrderAmount || 0
            ),
            maxDiscountAmount:
              coupon.maxDiscountAmount !==
                undefined &&
              coupon.maxDiscountAmount !== null
                ? Number(
                    coupon.maxDiscountAmount
                  )
                : "",
            usageLimit:
              coupon.usageLimit !== undefined &&
              coupon.usageLimit !== null
                ? Number(coupon.usageLimit)
                : "",
            perUserLimit:
              coupon.perUserLimit !== undefined &&
              coupon.perUserLimit !== null
                ? Number(coupon.perUserLimit)
                : "",
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            active: coupon.active,
          }),
        }
      );

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
          result.message ||
            "Failed to update coupon."
        );
      }

      setCoupon(result.data);
      setSuccess("Coupon updated successfully.");
    } catch (err: any) {
      console.error("Update coupon error:", err);

      setError(
        err?.message || "Failed to update coupon."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!coupon) return;

    const confirmed = window.confirm(
      `Delete coupon "${coupon.code}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/coupons/${id}`,
        {
          method: "DELETE",
        }
      );

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
          result.message ||
            "Failed to delete coupon."
        );
      }

      router.push("/admin/coupons");
      router.refresh();
    } catch (err: any) {
      console.error("Delete coupon error:", err);

      setError(
        err?.message || "Failed to delete coupon."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function copyCode() {
    if (!coupon?.code) return;

    try {
      await navigator.clipboard.writeText(
        coupon.code
      );

      setSuccess("Coupon code copied.");
    } catch {
      setError("Failed to copy coupon code.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">
              Loading coupon...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!coupon) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <XCircle className="mx-auto h-10 w-10 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              Coupon not found
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error || "This coupon does not exist."}
            </p>

            <Link
              href="/admin/coupons"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Coupons
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const usagePercent =
    coupon.usageLimit &&
    coupon.usageLimit > 0
      ? Math.min(
          100,
          (coupon.usageCount /
            coupon.usageLimit) *
            100
        )
      : 0;

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

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-blue-600">
                Coupon Management
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {coupon.code}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    coupon.status === "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : coupon.status ===
                          "Scheduled"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {coupon.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Manage coupon settings and usage.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Discount
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {coupon.type === "percentage"
                ? `${coupon.value}%`
                : `₹${coupon.value}`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Used
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {coupon.usageCount}
              {coupon.usageLimit
                ? ` / ${coupon.usageLimit}`
                : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Minimum Order
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              ₹{coupon.minOrderAmount || 0}
            </p>
          </div>
        </section>

        {/* Basic */}
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
                Update coupon details.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Coupon Code
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={coupon.code}
                  onChange={(e) =>
                    updateField(
                      "code",
                      e.target.value.toUpperCase()
                    )
                  }
                  maxLength={50}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={copyCode}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Copy code"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Discount Type
              </label>

              <select
                value={coupon.type}
                onChange={(e) =>
                  updateField(
                    "type",
                    e.target.value
                  )
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
                value={coupon.description || ""}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
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
                Configure discount conditions.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Discount Value
              </label>

              <div className="relative mt-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={coupon.value}
                  onChange={(e) =>
                    updateField(
                      "value",
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {coupon.type === "percentage"
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
                  value={coupon.minOrderAmount}
                  onChange={(e) =>
                    updateField(
                      "minOrderAmount",
                      e.target.value
                    )
                  }
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
                  value={
                    coupon.maxDiscountAmount ??
                    ""
                  }
                  onChange={(e) =>
                    updateField(
                      "maxDiscountAmount",
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
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
                Current usage: {coupon.usageCount}
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
                value={coupon.usageLimit ?? ""}
                onChange={(e) =>
                  updateField(
                    "usageLimit",
                    e.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {coupon.usageLimit && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Usage</span>
                    <span>
                      {coupon.usageCount} /{" "}
                      {coupon.usageLimit}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${usagePercent}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Per User Limit
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={coupon.perUserLimit ?? ""}
                onChange={(e) =>
                  updateField(
                    "perUserLimit",
                    e.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* Dates */}
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
                Set the active period.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Start Date
              </label>

              <input
                type="datetime-local"
                value={formatDateForInput(
                  coupon.startDate
                )}
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
                End Date
              </label>

              <input
                type="datetime-local"
                value={formatDateForInput(
                  coupon.endDate
                )}
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
                Turn this coupon on or off.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateField(
                  "active",
                  !coupon.active
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                coupon.active
                  ? "bg-blue-600"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  coupon.active
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
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

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />

            {deleting
              ? "Deleting..."
              : "Delete Coupon"}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/coupons"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}