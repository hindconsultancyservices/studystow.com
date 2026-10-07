"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success?: boolean;
  data?: Customer;
  message?: string;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminCustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCustomer() {
      try {
        setLoading(true);
        setError("");

        const resolvedParams = await params;

        if (cancelled) return;

        const id = resolvedParams.id;

        setCustomerId(id);

        const response = await fetch(
          `/api/admin/customers/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        let data: ApiResponse = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok || !data.success || !data.data) {
          throw new Error(
            data.message || "Unable to load customer."
          );
        }

        if (!cancelled) {
          setCustomer(data.data);
        }
      } catch (err) {
        console.error(
          "Admin customer details error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load customer."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="mt-3 h-8 w-64 rounded bg-slate-200" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="h-44 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 animate-pulse" />
            <div className="h-72 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            <Link
              href="/admin/customers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Link>

            <h1 className="mt-4 text-2xl font-bold text-slate-950">
              Customer Details
            </h1>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load customer
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error || "Customer was not found."}
            </p>

            <Link
              href="/admin/customers"
              className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Back to Customers
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Link>

          <div className="mt-4">
            <p className="text-sm font-medium text-blue-600">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Customer Details
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700">
                {getInitials(customer.name)}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {customer.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customer ID: {customer._id}
                </p>
              </div>
            </div>

            <div>
              {customer.active ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <CheckCircle2 className="h-4 w-4" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/20">
                  <XCircle className="h-4 w-4" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Customer Information */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Customer Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Registered account information from MongoDB.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <InfoItem
              icon={UserCircle2}
              label="Full Name"
              value={customer.name || "—"}
            />

            <InfoItem
              icon={Mail}
              label="Email"
              value={customer.email || "—"}
            />

            <InfoItem
              icon={Phone}
              label="Phone"
              value={customer.phone || "No phone added"}
            />

            <InfoItem
              icon={ShieldCheck}
              label="Role"
              value={customer.role || "customer"}
            />

            <InfoItem
              icon={CalendarDays}
              label="Joined"
              value={formatDateTime(customer.createdAt)}
            />

            <InfoItem
              icon={Clock3}
              label="Last Updated"
              value={formatDateTime(customer.updatedAt)}
            />
          </div>
        </section>

        {/* Account Status */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <User className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Account Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This customer account is currently{" "}
                <span className="font-semibold text-slate-700">
                  {customer.active
                    ? "active"
                    : "inactive"}
                </span>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Future Section */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <User className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Customer record
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                This page displays the customer account
                stored in your MongoDB database. Orders,
                addresses, wishlist and other customer
                activity can be connected here separately.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Link>
        </div>

        {/* Prevent unused variable lint issue */}
        <span className="hidden">{customerId}</span>
      </div>
    </main>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}