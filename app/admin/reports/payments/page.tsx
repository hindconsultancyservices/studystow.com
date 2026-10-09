"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Download,
  ExternalLink,
  FileBarChart2,
  Filter,
  Landmark,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially-refunded"
  | "cancelled";

type PaymentMethod =
  | "card"
  | "upi"
  | "netbanking"
  | "wallet"
  | "cod"
  | "bank-transfer"
  | "other";

type PaymentRecord = {
  id: string;
  transactionId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  gateway: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  fee: number;
  refundAmount: number;
  netAmount: number;
  currency: string;
};

type SortField =
  | "date"
  | "transactionId"
  | "orderNumber"
  | "customerName"
  | "amount"
  | "fee"
  | "netAmount";

const EMPTY_PAYMENTS: PaymentRecord[] = [];

const PAYMENT_STATUS_OPTIONS = [
  {
    value: "all",
    label: "All Payment Statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "paid",
    label: "Paid",
  },
  {
    value: "failed",
    label: "Failed",
  },
  {
    value: "refunded",
    label: "Refunded",
  },
  {
    value: "partially-refunded",
    label: "Partially Refunded",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const PAYMENT_METHOD_OPTIONS = [
  {
    value: "all",
    label: "All Payment Methods",
  },
  {
    value: "card",
    label: "Card",
  },
  {
    value: "upi",
    label: "UPI",
  },
  {
    value: "netbanking",
    label: "Net Banking",
  },
  {
    value: "wallet",
    label: "Wallet",
  },
  {
    value: "cod",
    label: "Cash on Delivery",
  },
  {
    value: "bank-transfer",
    label: "Bank Transfer",
  },
  {
    value: "other",
    label: "Other",
  },
];

function formatCurrency(
  value: number,
  currency = "INR",
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(
    value,
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function displayStatus(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function methodLabel(
  method: PaymentMethod,
) {
  switch (method) {
    case "card":
      return "Card";

    case "upi":
      return "UPI";

    case "netbanking":
      return "Net Banking";

    case "wallet":
      return "Wallet";

    case "cod":
      return "Cash on Delivery";

    case "bank-transfer":
      return "Bank Transfer";

    case "other":
      return "Other";

    default:
      return method;
  }
}

function statusClass(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";

    case "pending":
      return "bg-amber-50 text-amber-700";

    case "failed":
      return "bg-red-50 text-red-700";

    case "refunded":
      return "bg-orange-50 text-orange-700";

    case "partially-refunded":
      return "bg-violet-50 text-violet-700";

    case "cancelled":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function methodClass(method: PaymentMethod) {
  switch (method) {
    case "upi":
      return "bg-blue-50 text-blue-700";

    case "card":
      return "bg-violet-50 text-violet-700";

    case "netbanking":
      return "bg-cyan-50 text-cyan-700";

    case "wallet":
      return "bg-fuchsia-50 text-fuchsia-700";

    case "cod":
      return "bg-amber-50 text-amber-700";

    case "bank-transfer":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  dark = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Wallet;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        dark
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              dark
                ? "text-slate-400"
                : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-3 text-2xl font-bold tracking-tight ${
              dark
                ? "text-white"
                : "text-slate-950"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            dark
              ? "bg-white/10 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p
        className={`mt-3 text-xs leading-5 ${
          dark
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      >
        {children}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function SortButton({
  label,
  field,
  sortField,
  descending,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  descending: boolean;
  onSort: (field: SortField) => void;
}) {
  const active = field === sortField;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:text-slate-950"
    >
      {label}

      {active ? (
        descending ? (
          <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUp className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />
      )}
    </button>
  );
}

export default function PaymentsReportPage() {
  const {
    isOwner,
    canView,
  } = useAdminPermissions();

  const canAccess =
    isOwner || canView("reports");

  const [search, setSearch] =
    useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("all");

  const [paymentMethod, setPaymentMethod] =
    useState("all");

  const [gateway, setGateway] =
    useState("all");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [minAmount, setMinAmount] =
    useState("");

  const [maxAmount, setMaxAmount] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(true);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [sortField, setSortField] =
    useState<SortField>("date");

  const [descending, setDescending] =
    useState(true);

  const payments = EMPTY_PAYMENTS;

  const availableGateways = useMemo(() => {
    return Array.from(
      new Set(
        payments
          .map((payment) => payment.gateway)
          .filter(Boolean),
      ),
    );
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const result = payments.filter(
      (payment) => {
        if (
          query &&
          ![
            payment.transactionId,
            payment.orderNumber,
            payment.customerName,
            payment.gateway,
            payment.id,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        if (
          paymentStatus !== "all" &&
          payment.status !== paymentStatus
        ) {
          return false;
        }

        if (
          paymentMethod !== "all" &&
          payment.method !== paymentMethod
        ) {
          return false;
        }

        if (
          gateway !== "all" &&
          payment.gateway !== gateway
        ) {
          return false;
        }

        if (minAmount) {
          const minimum =
            Number(minAmount);

          if (
            Number.isFinite(minimum) &&
            payment.amount < minimum
          ) {
            return false;
          }
        }

        if (maxAmount) {
          const maximum =
            Number(maxAmount);

          if (
            Number.isFinite(maximum) &&
            payment.amount > maximum
          ) {
            return false;
          }
        }

        if (fromDate) {
          const paymentTime =
            new Date(payment.date).getTime();

          const fromTime =
            new Date(
              `${fromDate}T00:00:00`,
            ).getTime();

          if (paymentTime < fromTime) {
            return false;
          }
        }

        if (toDate) {
          const paymentTime =
            new Date(payment.date).getTime();

          const toTime =
            new Date(
              `${toDate}T23:59:59`,
            ).getTime();

          if (paymentTime > toTime) {
            return false;
          }
        }

        return true;
      },
    );

    result.sort((a, b) => {
      let difference = 0;

      switch (sortField) {
        case "transactionId":
          difference =
            a.transactionId.localeCompare(
              b.transactionId,
            );
          break;

        case "orderNumber":
          difference =
            a.orderNumber.localeCompare(
              b.orderNumber,
            );
          break;

        case "customerName":
          difference =
            a.customerName.localeCompare(
              b.customerName,
            );
          break;

        case "amount":
          difference =
            a.amount - b.amount;
          break;

        case "fee":
          difference =
            a.fee - b.fee;
          break;

        case "netAmount":
          difference =
            a.netAmount - b.netAmount;
          break;

        case "date":
        default:
          difference =
            new Date(a.date).getTime() -
            new Date(b.date).getTime();
          break;
      }

      return descending
        ? -difference
        : difference;
    });

    return result;
  }, [
    payments,
    search,
    paymentStatus,
    paymentMethod,
    gateway,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    sortField,
    descending,
  ]);

  const allSelected =
    filteredPayments.length > 0 &&
    filteredPayments.every((payment) =>
      selectedIds.includes(payment.id),
    );

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(
        selectedIds.filter(
          (id) =>
            !filteredPayments.some(
              (payment) =>
                payment.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds([
      ...new Set([
        ...selectedIds,
        ...filteredPayments.map(
          (payment) => payment.id,
        ),
      ]),
    ]);
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id,
          )
        : [...current, id],
    );
  };

  const handleSort = (
    field: SortField,
  ) => {
    if (sortField === field) {
      setDescending(
        (current) => !current,
      );

      return;
    }

    setSortField(field);
    setDescending(true);
  };

  const clearFilters = () => {
    setSearch("");
    setPaymentStatus("all");
    setPaymentMethod("all");
    setGateway("all");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  if (!canAccess) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Access denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You do not have permission to view the Payments Report.
          </p>

          <Link
            href="/admin/reports"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1700px] space-y-6">
      {/* =========================================================
          HEADER
      ========================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <Link
                href="/admin/reports"
                className="transition hover:text-slate-950"
              >
                Reports
              </Link>

              <ArrowRight className="h-3.5 w-3.5" />

              <span className="text-slate-900">
                Payments
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <CreditCard className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Payments Report
                </h1>

                <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                  Monitor successful payments, failures, refunds, gateway
                  fees, payment methods and net settlement across the
                  store.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4" />
              Orders
            </Link>

            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          SUMMARY
      ========================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Total Payments"
          value="—"
          description="Total payment transactions in the selected period."
          icon={CreditCard}
        />

        <SummaryCard
          label="Collected"
          value="—"
          description="Successfully captured or settled payment value."
          icon={CheckCircle2}
        />

        <SummaryCard
          label="Failed"
          value="—"
          description="Payment transactions that did not complete."
          icon={AlertCircle}
        />

        <SummaryCard
          label="Refunded"
          value="—"
          description="Value returned to customers through refunds."
          icon={RotateCcw}
        />

        <SummaryCard
          label="Net Settlement"
          value="—"
          description="Net amount after refunds and payment processing costs."
          icon={CircleDollarSign}
          dark
        />
      </section>

      {/* =========================================================
          PAYMENT HEALTH
      ========================================================== */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Success
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Payment Success Rate
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Calculated from real successful and attempted transactions.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>

          <p className="mt-2 text-right text-xs font-semibold text-slate-400">
            —
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <AlertCircle className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Risk
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Failed Payments
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Failed payment activity by gateway and payment method.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>

          <p className="mt-2 text-right text-xs font-semibold text-slate-400">
            —
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <RotateCcw className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Returns
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Refund Rate
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Refund volume against completed payments.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>

          <p className="mt-2 text-right text-xs font-semibold text-slate-400">
            —
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Zap className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Processing
            </span>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-950">
            Gateway Performance
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Gateway-level success and failure analysis.
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-slate-950" />
          </div>

          <p className="mt-2 text-right text-xs font-semibold text-slate-400">
            —
          </p>
        </div>
      </section>

      {/* =========================================================
          ANALYTICS
      ========================================================== */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Payment Volume & Settlement
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Payment collection, refund and net settlement movement over
                the selected reporting period.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Reporting Period
            </button>
          </div>

          <div className="flex min-h-[310px] items-center justify-center p-6">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BarChart3 className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-sm font-bold text-slate-900">
                Payment analytics unavailable
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                The chart will be generated from actual payment transactions,
                refunds and gateway settlement data after the payment report
                API is connected.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-950">
              Payment Methods
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Real payment method distribution.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {[
              "UPI",
              "Card",
              "Net Banking",
              "Wallet",
              "Cash on Delivery",
            ].map((label) => (
              <div key={label}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-700">
                    {label}
                  </span>

                  <span className="text-xs font-semibold text-slate-400">
                    —
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-0 rounded-full bg-slate-950" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          GATEWAY SUMMARY
      ========================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Landmark className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Gateway Reconciliation
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Compare payment records, gateway fees, refunds and expected
                net settlement with the connected payment provider.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Gateway Captured
            </p>

            <p className="mt-3 text-xl font-bold text-slate-950">
              —
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Captured payment value from gateway records.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Processing Fees
            </p>

            <p className="mt-3 text-xl font-bold text-slate-950">
              —
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Fees charged by payment providers.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Refunds
            </p>

            <p className="mt-3 text-xl font-bold text-slate-950">
              —
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Amount returned through completed refunds.
            </p>
          </div>

          <div className="rounded-xl border border-slate-950 bg-slate-950 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Expected Net
            </p>

            <p className="mt-3 text-xl font-bold text-white">
              —
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Expected settlement after applicable deductions.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          FILTERS
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <SlidersHorizontal className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Payment Filters
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Filter transactions by gateway, payment method, status,
                date and amount.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (current) => !current,
                )
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5" />
              {showFilters
                ? "Hide Filters"
                : "Show Filters"}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-5 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search transaction ID, order number, customer or gateway..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Payment Status
                </label>

                <FilterSelect
                  value={paymentStatus}
                  onChange={setPaymentStatus}
                >
                  {PAYMENT_STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </FilterSelect>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Payment Method
                </label>

                <FilterSelect
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                >
                  {PAYMENT_METHOD_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </FilterSelect>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Gateway
                </label>

                <FilterSelect
                  value={gateway}
                  onChange={setGateway}
                >
                  <option value="all">
                    All Gateways
                  </option>

                  {availableGateways.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ),
                  )}
                </FilterSelect>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  From Date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  To Date
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Minimum Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minAmount}
                  onChange={(event) =>
                    setMinAmount(
                      event.target.value,
                    )
                  }
                  placeholder="₹ 0"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Maximum Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxAmount}
                  onChange={(event) =>
                    setMaxAmount(
                      event.target.value,
                    )
                  }
                  placeholder="₹ 0"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="flex items-end sm:col-span-2 xl:justify-end">
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Filtered:
                  </span>{" "}
                  {formatNumber(
                    filteredPayments.length,
                  )}{" "}
                  transactions
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          TRANSACTIONS
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Payment Transactions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredPayments.length} matching transactions
              {selectedIds.length > 0
                ? ` · ${selectedIds.length} selected`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <>
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Selected
                </button>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reconcile
                </button>
              </>
            )}

            <button
              type="button"
              disabled
              className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CreditCard className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-900">
              No payment transactions available
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              No payment records have been loaded from the connected payment
              source. Collection, fees, refunds and settlement values are
              intentionally not estimated.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <FileBarChart2 className="h-3.5 w-3.5" />
              Waiting for payment API + database data
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1550px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label="Select all payment transactions"
                      />
                    </th>

                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Transaction"
                        field="transactionId"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Date"
                        field="date"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Order"
                        field="orderNumber"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left">
                      <SortButton
                        label="Customer"
                        field="customerName"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Gateway
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Method
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Amount"
                        field="amount"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Fee"
                        field="fee"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="px-4 py-3 text-right">
                      <SortButton
                        label="Net"
                        field="netAmount"
                        sortField={sortField}
                        descending={descending}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map(
                    (payment) => {
                      const selected =
                        selectedIds.includes(
                          payment.id,
                        );

                      return (
                        <tr
                          key={payment.id}
                          className={`transition hover:bg-slate-50 ${
                            selected
                              ? "bg-slate-50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleRow(
                                  payment.id,
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-mono text-xs font-semibold text-slate-900">
                              {
                                payment.transactionId
                              }
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-slate-400">
                              {payment.id}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                            {formatDate(
                              payment.date,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {
                                payment.orderNumber
                              }
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-medium text-slate-900">
                              {
                                payment.customerName
                              }
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {payment.gateway}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${methodClass(
                                payment.method,
                              )}`}
                            >
                              {methodLabel(
                                payment.method,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                                payment.status,
                              )}`}
                            >
                              {displayStatus(
                                payment.status,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-950">
                            {formatCurrency(
                              payment.amount,
                              payment.currency,
                            )}

                            {payment.refundAmount >
                              0 && (
                              <p className="mt-1 text-[10px] font-normal text-orange-600">
                                Refunded:{" "}
                                {formatCurrency(
                                  payment.refundAmount,
                                  payment.currency,
                                )}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {formatCurrency(
                              payment.fee,
                              payment.currency,
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-950">
                            {formatCurrency(
                              payment.netAmount,
                              payment.currency,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <Link
                              href={`/admin/orders/${payment.orderNumber}`}
                              className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                              title="Open related order"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing {filteredPayments.length} transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white">
                  1
                </span>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-400"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* =========================================================
          DATA INTEGRITY / RECONCILIATION
      ========================================================== */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Payment data integrity
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Payment amounts, gateway fees, refunds and settlement
                figures must come from authenticated server-side payment
                records. This page does not estimate or invent financial
                values.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Landmark className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Reconciliation workflow
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Once the current StudyStow payment model and Razorpay/payment
                APIs are inspected, this report can reconcile captured
                payments, refunds, gateway charges and expected settlement
                values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/reports/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            Order Report
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/reports/expenses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            Expense Report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}