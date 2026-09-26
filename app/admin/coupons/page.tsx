import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  Percent,
  Plus,
  Search,
  TicketPercent,
  XCircle,
} from "lucide-react";

const coupons = [
  {
    id: "1",
    code: "WELCOME10",
    type: "Percentage",
    value: "10%",
    description: "10% off on first order",
    minOrder: "₹499",
    maxDiscount: "₹150",
    usage: 128,
    usageLimit: 500,
    status: "Active",
    startDate: "01 Sep 2026",
    endDate: "30 Sep 2026",
  },
  {
    id: "2",
    code: "BOOKS100",
    type: "Fixed",
    value: "₹100",
    description: "Flat ₹100 off on selected books",
    minOrder: "₹999",
    maxDiscount: "₹100",
    usage: 76,
    usageLimit: 200,
    status: "Active",
    startDate: "10 Sep 2026",
    endDate: "10 Oct 2026",
  },
  {
    id: "3",
    code: "STUDY20",
    type: "Percentage",
    value: "20%",
    description: "20% off for students",
    minOrder: "₹799",
    maxDiscount: "₹250",
    usage: 184,
    usageLimit: 300,
    status: "Active",
    startDate: "15 Sep 2026",
    endDate: "15 Oct 2026",
  },
  {
    id: "4",
    code: "FESTIVE25",
    type: "Percentage",
    value: "25%",
    description: "Festive season special discount",
    minOrder: "₹1,499",
    maxDiscount: "₹500",
    usage: 0,
    usageLimit: 1000,
    status: "Scheduled",
    startDate: "01 Oct 2026",
    endDate: "31 Oct 2026",
  },
  {
    id: "5",
    code: "READ50",
    type: "Fixed",
    value: "₹50",
    description: "Flat ₹50 off",
    minOrder: "₹399",
    maxDiscount: "₹50",
    usage: 412,
    usageLimit: 500,
    status: "Expired",
    startDate: "01 Aug 2026",
    endDate: "31 Aug 2026",
  },
];

const stats = [
  {
    label: "Total Coupons",
    value: "24",
    icon: TicketPercent,
    description: "All coupons",
  },
  {
    label: "Active",
    value: "12",
    icon: CheckCircle2,
    description: "Currently available",
  },
  {
    label: "Scheduled",
    value: "5",
    icon: Clock3,
    description: "Starting soon",
  },
  {
    label: "Expired",
    value: "7",
    icon: XCircle,
    description: "No longer active",
  },
];

function statusStyles(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Scheduled":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";
    case "Expired":
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

export default function AdminCouponsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href="/admin"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Back to admin dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <p className="text-sm font-medium text-blue-600">
                  Administration
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Coupons
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Create and manage discount coupons for your store.
                </p>
              </div>
            </div>

            <Link
              href="/admin/coupons/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search coupon code..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <select
                defaultValue="all"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                defaultValue="all"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
        </section>

        {/* Desktop Table */}
        <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Coupon
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Discount
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Minimum Order
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Usage
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Validity
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => {
                  const usagePercentage = Math.min(
                    (coupon.usage / coupon.usageLimit) * 100,
                    100,
                  );

                  return (
                    <tr
                      key={coupon.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                            <TicketPercent className="h-5 w-5 text-blue-600" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900">
                                {coupon.code}
                              </p>
                              <Copy className="h-3.5 w-3.5 text-slate-400" />
                            </div>

                            <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                              {coupon.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-slate-900">
                          {coupon.value}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {coupon.type}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-medium text-slate-700">
                          {coupon.minOrder}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Max off: {coupon.maxDiscount}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <div className="w-28">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">
                              {coupon.usage}
                            </span>
                            <span className="text-slate-400">
                              {coupon.usageLimit}
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{coupon.startDate}</span>
                        </div>
                        <p className="mt-1 pl-5 text-xs text-slate-400">
                          to {coupon.endDate}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                            coupon.status,
                          )}`}
                        >
                          {coupon.status}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/admin/coupons/${coupon.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Manage
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile Cards */}
        <section className="mt-6 space-y-4 lg:hidden">
          {coupons.map((coupon) => {
            const usagePercentage = Math.min(
              (coupon.usage / coupon.usageLimit) * 100,
              100,
            );

            return (
              <article
                key={coupon.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <TicketPercent className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {coupon.code}
                        </p>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {coupon.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                      coupon.status,
                    )}`}
                  >
                    {coupon.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Discount</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {coupon.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {coupon.type}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">Minimum Order</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {coupon.minOrder}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Max {coupon.maxDiscount}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        Usage
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-slate-900">
                      {coupon.usage} / {coupon.usageLimit}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {coupon.startDate}
                    </p>
                    <p className="mt-1 pl-5 text-xs text-slate-400">
                      to {coupon.endDate}
                    </p>
                  </div>

                  <Link
                    href={`/admin/coupons/${coupon.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Manage
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {/* Bottom info */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Coupon management
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Coupons can be configured with percentage or fixed discounts,
                minimum order values, maximum discount limits, usage limits and
                start/end dates. These rules will be validated again on the
                server when checkout is connected.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
