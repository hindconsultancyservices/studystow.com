import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpToLine,
  BookOpen,
  Boxes,
  ChevronRight,
  Clock3,
  PackageCheck,
  Search,
  TrendingDown,
  Warehouse,
} from "lucide-react";

const inventory = [
  {
    id: "BK-1001",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Help",
    sku: "SS-AH-001",
    stock: 42,
    reserved: 4,
    available: 38,
    reorderLevel: 10,
    status: "In Stock",
    updated: "Today, 10:32 AM",
  },
  {
    id: "BK-1002",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finance",
    sku: "SS-POM-002",
    stock: 18,
    reserved: 3,
    available: 15,
    reorderLevel: 10,
    status: "In Stock",
    updated: "Today, 09:18 AM",
  },
  {
    id: "BK-1003",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Productivity",
    sku: "SS-DW-003",
    stock: 7,
    reserved: 2,
    available: 5,
    reorderLevel: 10,
    status: "Low Stock",
    updated: "Today, 08:45 AM",
  },
  {
    id: "BK-1004",
    title: "Ikigai",
    author: "Héctor García & Francesc Miralles",
    category: "Spirituality",
    sku: "SS-IKI-004",
    stock: 3,
    reserved: 1,
    available: 2,
    reorderLevel: 8,
    status: "Low Stock",
    updated: "Yesterday, 06:20 PM",
  },
  {
    id: "BK-1005",
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    sku: "SS-ALC-005",
    stock: 0,
    reserved: 0,
    available: 0,
    reorderLevel: 10,
    status: "Out of Stock",
    updated: "Yesterday, 04:12 PM",
  },
  {
    id: "BK-1006",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    category: "Business",
    sku: "SS-TGR-006",
    stock: 25,
    reserved: 5,
    available: 20,
    reorderLevel: 10,
    status: "In Stock",
    updated: "Yesterday, 02:35 PM",
  },
  {
    id: "BK-1007",
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    category: "Finance",
    sku: "SS-RDPD-007",
    stock: 9,
    reserved: 2,
    available: 7,
    reorderLevel: 12,
    status: "Low Stock",
    updated: "18 Sep 2026, 05:42 PM",
  },
  {
    id: "BK-1008",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    category: "Self Help",
    sku: "SS-7H-008",
    stock: 31,
    reserved: 4,
    available: 27,
    reorderLevel: 10,
    status: "In Stock",
    updated: "18 Sep 2026, 11:10 AM",
  },
];

const stats = [
  {
    label: "Total Products",
    value: "486",
    description: "Products in inventory",
    icon: Boxes,
  },
  {
    label: "In Stock",
    value: "412",
    description: "Healthy stock levels",
    icon: PackageCheck,
  },
  {
    label: "Low Stock",
    value: "48",
    description: "Need replenishment",
    icon: AlertTriangle,
  },
  {
    label: "Out of Stock",
    value: "26",
    description: "Currently unavailable",
    icon: TrendingDown,
  },
];

function statusStyles(status: string) {
  switch (status) {
    case "In Stock":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Low Stock":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "Out of Stock":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

function stockBarClass(status: string) {
  switch (status) {
    case "In Stock":
      return "bg-emerald-500";
    case "Low Stock":
      return "bg-amber-500";
    case "Out of Stock":
      return "bg-rose-500";
    default:
      return "bg-slate-400";
  }
}

function stockPercentage(stock: number, reorderLevel: number) {
  if (stock <= 0) {
    return 0;
  }

  return Math.min(Math.round((stock / Math.max(reorderLevel * 4, 1)) * 100), 100);
}

export default function AdminInventoryPage() {
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
                  Inventory
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor stock levels and manage your book inventory.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/admin/books"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4" />
                Manage Books
              </Link>

              <Link
                href="/admin/inventory/stock"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <ArrowUpToLine className="h-4 w-4" />
                Update Stock
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

                <p className="mt-3 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Inventory Alerts */}
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Low stock alert
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-800/80">
                  48 products are below their recommended reorder level.
                </p>

                <Link
                  href="/admin/inventory?status=low-stock"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-800"
                >
                  View low stock
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <TrendingDown className="h-5 w-5 text-rose-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-rose-900">
                  Out of stock
                </p>

                <p className="mt-1 text-sm leading-6 text-rose-800/80">
                  26 books are currently unavailable for purchase.
                </p>

                <Link
                  href="/admin/inventory?status=out-of-stock"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rose-800"
                >
                  View unavailable
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <Warehouse className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Inventory activity
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-800/80">
                  Stock levels were updated 18 times today.
                </p>

                <Link
                  href="/admin/inventory/history"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-800"
                >
                  View history
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                placeholder="Search by book, author or SKU..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <select
                defaultValue="all"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              <select
                defaultValue="updated"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="updated">Recently Updated</option>
                <option value="stock-high">Highest Stock</option>
                <option value="stock-low">Lowest Stock</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </section>

        {/* Desktop Table */}
        <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reserved
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Available
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Updated
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const percentage = stockPercentage(
                    item.stock,
                    item.reorderLevel,
                  );

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <BookOpen className="h-5 w-5 text-slate-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[250px] truncate font-semibold text-slate-900">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.author}
                            </p>

                            <p className="mt-1 text-xs text-blue-600">
                              {item.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {item.sku}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="w-28">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">
                              {item.stock}
                            </span>

                            <span className="text-xs text-slate-400">
                              min {item.reorderLevel}
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${stockBarClass(
                                item.status,
                              )}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="font-medium text-slate-700">
                          {item.reserved}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span className="font-bold text-slate-900">
                          {item.available}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {item.updated}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/admin/inventory/${item.id}`}
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
          {inventory.map((item) => {
            const percentage = stockPercentage(
              item.stock,
              item.reorderLevel,
            );

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <BookOpen className="h-5 w-5 text-slate-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {item.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {item.author}
                      </p>

                      <p className="mt-1 text-xs text-blue-600">
                        {item.sku}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Total Stock</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {item.stock}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Available</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {item.available}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${stockBarClass(
                        item.status,
                      )}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Reserved: {item.reserved}
                    </span>

                    <span className="text-slate-400">
                      Reorder at: {item.reorderLevel}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">Category</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {item.category}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">Last Updated</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {item.updated}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                  <Link
                    href={`/admin/inventory/${item.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Manage Stock
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {/* Inventory Information */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <Warehouse className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Inventory management
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Stock, reserved quantity and available quantity will be
                calculated from real orders and inventory records. Stock
                changes should be validated on the server to prevent
                overselling during checkout.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/admin/books"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Back to Books
          </Link>

          <Link
            href="/admin/inventory/history"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Clock3 className="h-4 w-4" />
            Inventory History
          </Link>
        </div>
      </div>
    </main>
  );
}
