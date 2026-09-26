import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  CircleDollarSign,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  ShoppingBag,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";

const customers = [
  {
    id: "CUS-1001",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Dhanbad, Jharkhand",
    orders: 12,
    spent: "₹8,499",
    joined: "12 Sep 2026",
    status: "Active",
  },
  {
    id: "CUS-1002",
    name: "Priya Singh",
    email: "priya.singh@example.com",
    phone: "+91 98765 12345",
    location: "Ranchi, Jharkhand",
    orders: 8,
    spent: "₹5,799",
    joined: "10 Sep 2026",
    status: "Active",
  },
  {
    id: "CUS-1003",
    name: "Aman Kumar",
    email: "aman.kumar@example.com",
    phone: "+91 91234 56789",
    location: "Patna, Bihar",
    orders: 5,
    spent: "₹3,249",
    joined: "08 Sep 2026",
    status: "Active",
  },
  {
    id: "CUS-1004",
    name: "Sneha Verma",
    email: "sneha.verma@example.com",
    phone: "+91 99887 66554",
    location: "Kolkata, West Bengal",
    orders: 3,
    spent: "₹1,899",
    joined: "05 Sep 2026",
    status: "Inactive",
  },
  {
    id: "CUS-1005",
    name: "Rohit Gupta",
    email: "rohit.gupta@example.com",
    phone: "+91 97654 32109",
    location: "Bokaro, Jharkhand",
    orders: 16,
    spent: "₹11,299",
    joined: "01 Sep 2026",
    status: "Active",
  },
  {
    id: "CUS-1006",
    name: "Neha Kumari",
    email: "neha.kumari@example.com",
    phone: "+91 93456 78901",
    location: "Jamshedpur, Jharkhand",
    orders: 7,
    spent: "₹4,599",
    joined: "28 Aug 2026",
    status: "Active",
  },
  {
    id: "CUS-1007",
    name: "Vikas Raj",
    email: "vikas.raj@example.com",
    phone: "+91 92345 67890",
    location: "Gaya, Bihar",
    orders: 1,
    spent: "₹499",
    joined: "24 Aug 2026",
    status: "Inactive",
  },
  {
    id: "CUS-1008",
    name: "Anjali Das",
    email: "anjali.das@example.com",
    phone: "+91 94567 89012",
    location: "Bhubaneswar, Odisha",
    orders: 10,
    spent: "₹7,149",
    joined: "20 Aug 2026",
    status: "Active",
  },
];

const stats = [
  {
    label: "Total Customers",
    value: "1,248",
    change: "+12.5%",
    description: "vs last month",
    icon: Users,
  },
  {
    label: "Active Customers",
    value: "1,106",
    change: "+8.4%",
    description: "currently active",
    icon: UserCheck,
  },
  {
    label: "New Customers",
    value: "86",
    change: "+14.2%",
    description: "this month",
    icon: UserPlus,
  },
  {
    label: "Inactive",
    value: "142",
    change: "-3.8%",
    description: "currently inactive",
    icon: UserX,
  },
];

function statusStyles(status: string) {
  if (status === "Active") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }

  return "bg-slate-100 text-slate-600 ring-slate-500/20";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminCustomersPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href="/admin"
                aria-label="Back to admin dashboard"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <p className="text-sm font-medium text-blue-600">
                  Administration
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Customers
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage customers registered on your store.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/orders"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ShoppingBag className="h-4 w-4" />
                Orders
              </Link>
            </div>
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

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      stat.change.startsWith("-")
                        ? "text-rose-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {stat.change}
                  </span>

                  <span className="text-xs text-slate-400">
                    {stat.description}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Search & Filters */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                placeholder="Search by name, email, phone or customer ID..."
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
                <option value="inactive">Inactive</option>
              </select>

              <select
                defaultValue="newest"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="newest">Newest Joined</option>
                <option value="oldest">Oldest Joined</option>
                <option value="orders-high">Most Orders</option>
                <option value="spent-high">Highest Spent</option>
              </select>
            </div>
          </div>
        </section>

        {/* Desktop Table */}
        <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Orders
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Spent
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
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                          {getInitials(customer.name)}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <p className="flex items-center gap-2 text-sm text-slate-700">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {customer.email}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {customer.phone}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {customer.location}
                      </p>

                      <p className="mt-1 pl-5 text-xs text-slate-400">
                        Joined {customer.joined}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">
                          {customer.orders}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">
                          {customer.spent}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                          customer.status,
                        )}`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile Cards */}
        <section className="mt-6 space-y-4 lg:hidden">
          {customers.map((customer) => (
            <article
              key={customer.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {getInitials(customer.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {customer.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {customer.id}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                    customer.status,
                  )}`}
                >
                  {customer.status}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <span className="truncate">{customer.email}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <span>{customer.phone}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>
                  <span>{customer.location}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Orders</span>
                  </div>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {customer.orders}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Total Spent</span>
                  </div>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {customer.spent}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-400">Joined</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {customer.joined}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`More options for ${customer.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    View
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Footer Info */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <Users className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Customer management
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Customer profiles, order history, addresses, account status
                and lifetime spending will be connected to the database when
                the customer API and authentication layer are implemented.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
