"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Calculator,
  ChartNoAxesCombined,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileSpreadsheet,
  IndianRupee,
  Landmark,
  Package,
  ReceiptIndianRupee,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type ReportSection = {
  title: string;
  description: string;
  href: string;
  icon: typeof BarChart3;
};

const REPORT_SECTIONS: ReportSection[] = [
  {
    title: "Sales Report",
    description:
      "Sales, revenue, order performance, date-wise sales and product-wise performance.",
    href: "/admin/reports/sales",
    icon: BarChart3,
  },
  {
    title: "Profit & Loss",
    description:
      "Track revenue, cost, expenses, gross profit and net profit over selected periods.",
    href: "/admin/reports/profit-loss",
    icon: TrendingUp,
  },
  {
    title: "Expenses",
    description:
      "Manage operating expenses, expense categories and manually recorded business costs.",
    href: "/admin/reports/expenses",
    icon: ReceiptIndianRupee,
  },
  {
    title: "Expense Ledger",
    description:
      "Record individual small and large expenses with date, amount, category, payment method and notes.",
    href: "/admin/reports/expense-ledger",
    icon: ClipboardList,
  },
  {
    title: "Balance Sheet",
    description:
      "Track assets, liabilities, owner's equity and the overall financial position of the business.",
    href: "/admin/reports/balance-sheet",
    icon: Landmark,
  },
  {
    title: "Cash Flow",
    description:
      "Monitor cash received, cash paid, inflows, outflows and available cash movement.",
    href: "/admin/reports/cash-flow",
    icon: WalletCards,
  },
  {
    title: "Payments",
    description:
      "Review payment collections, Razorpay, COD, refunds and payment-related transactions.",
    href: "/admin/reports/payments",
    icon: CreditCard,
  },
  {
    title: "Tax & GST",
    description:
      "Track taxable sales, GST amounts, tax-related expenses and reporting periods.",
    href: "/admin/reports/tax-gst",
    icon: Calculator,
  },
  {
    title: "Inventory Report",
    description:
      "Review stock quantity, stock value, low stock, out-of-stock products and inventory movement.",
    href: "/admin/reports/inventory",
    icon: Boxes,
  },
  {
    title: "Order Report",
    description:
      "Analyse orders by status, date, customer, value, payment method and fulfillment stage.",
    href: "/admin/reports/orders",
    icon: ShoppingBag,
  },
  {
    title: "Customer Report",
    description:
      "Review customer activity, order history, purchasing behaviour and customer value.",
    href: "/admin/reports/customers",
    icon: Users,
  },
  {
    title: "Product Report",
    description:
      "Analyse book sales, quantity sold, revenue contribution, stock and product performance.",
    href: "/admin/reports/products",
    icon: BookOpen,
  },
];

function ReportCard({ section }: { section: ReportSection }) {
  const Icon = section.icon;

  return (
    <Link
      href={section.href}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Icon className="h-5 w-5" />
        </div>

        <div className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-colors group-hover:border-slate-300 group-hover:text-slate-900">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-base font-bold text-slate-950">
          {section.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {section.description}
        </p>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-950">
          Open report
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}

export default function ReportsPage() {
  const { isOwner, canView } = useAdminPermissions();

  const canAccessReports = isOwner || canView("reports");

  if (!canAccessReports) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <FileBarChart className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Access denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your administrator account does not have permission to access
            Reports.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FileBarChart className="h-4 w-4" />
              <span>Admin</span>
              <span>/</span>
              <span className="font-medium text-slate-700">
                Reports
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Reports
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
              Central reporting area for StudyStow. Sales, profitability,
              expenses, accounting, payments, inventory and business
              performance will be managed from here.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400"
            title="Available after report APIs are connected"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Overview */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Report Areas
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {REPORT_SECTIONS.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <ChartNoAxesCombined className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Reporting sections planned for the admin portal.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Financial
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                6
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Sales, profit, expenses, balance sheet, cash flow and tax.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Operations
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                4
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Inventory, orders, customers and products.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Manual Entries
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                Planned
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Manual income, expenses and accounting entries will be added
            through the relevant report sections.
          </p>
        </div>
      </section>

      {/* Report sections */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Report Sections
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Open a reporting area to manage and analyse its data.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <ArrowDownToLine className="h-4 w-4" />
            Export options will be available inside supported reports.
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {REPORT_SECTIONS.map((section) => (
            <ReportCard
              key={section.href}
              section={section}
            />
          ))}
        </div>
      </section>

      {/* Important note */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-sm font-bold">
              Reporting architecture
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              Each report section will have its own page, API layer and
              database model where required. Manual entries will be stored
              separately from automatically calculated store data so that
              actual StudyStow transactions are not overwritten.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-slate-700 px-4 py-3 text-xs font-semibold text-slate-300">
            Admin Reports
          </div>
        </div>
      </section>
    </div>
  );
}