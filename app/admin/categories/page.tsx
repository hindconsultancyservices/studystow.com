import Link from "next/link";

const categories = [
  {
    id: "CAT001",
    name: "Self Help",
    slug: "self-help",
    description: "Books for personal growth and self improvement.",
    books: 48,
    status: "Active",
  },
  {
    id: "CAT002",
    name: "Finance",
    slug: "finance",
    description: "Personal finance, investing and business books.",
    books: 36,
    status: "Active",
  },
  {
    id: "CAT003",
    name: "Productivity",
    slug: "productivity",
    description: "Books about productivity, focus and time management.",
    books: 27,
    status: "Active",
  },
  {
    id: "CAT004",
    name: "Fiction",
    slug: "fiction",
    description: "Novels, stories and other fiction books.",
    books: 72,
    status: "Active",
  },
  {
    id: "CAT005",
    name: "Education",
    slug: "education",
    description: "Academic and educational books.",
    books: 64,
    status: "Active",
  },
  {
    id: "CAT006",
    name: "Biography",
    slug: "biography",
    description: "Biographies and life stories of notable people.",
    books: 21,
    status: "Inactive",
  },
];

export default function AdminCategoriesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage book categories.
            </p>
          </div>

          <Link
            href="/admin/categories/new"
            className="w-fit rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + Add Category
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Categories
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {categories.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Categories
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {
                categories.filter(
                  (category) => category.status === "Active"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Books
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {categories.reduce(
                (total, category) => total + category.books,
                0
              )}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
          <label
            htmlFor="category-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search Categories
          </label>

          <input
            id="category-search"
            type="text"
            placeholder="Search by category name or slug..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* Categories */}
        <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="font-semibold text-gray-900">
              All Categories
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your bookstore categories.
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Slug
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Books
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {category.name}
                        </p>

                        <p className="mt-1 max-w-md text-sm text-gray-500">
                          {category.description}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ID: {category.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        /category/{category.slug}
                      </code>
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-semibold text-gray-900">
                        {category.books}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          category.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/category/${category.slug}`}
                          className="rounded-lg border px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y md:hidden">
            {categories.map((category) => (
              <div key={category.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      {category.description}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      ID: {category.id}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      category.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {category.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Slug
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-gray-900">
                      {category.slug}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Books
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {category.books}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/category/${category.slug}`}
                    className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </Link>

                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">
            Category Management
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Categories will be connected to your books collection.
            Once MongoDB is connected, adding, editing, activating,
            and deactivating categories will update the actual
            production database.
          </p>
        </div>
      </div>
    </main>
  );
}
