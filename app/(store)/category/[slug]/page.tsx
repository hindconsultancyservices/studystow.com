import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Layers,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    name: "Self Help",
    slug: "self-help",
    description:
      "Personal growth, habits, mindset and practical books for everyday improvement.",
  },
  {
    name: "Finance",
    slug: "finance",
    description:
      "Money, investing, personal finance and wealth-building books.",
  },
  {
    name: "Productivity",
    slug: "productivity",
    description:
      "Books to improve focus, time management, efficiency and productivity.",
  },
  {
    name: "Fiction",
    slug: "fiction",
    description:
      "Stories, novels and timeless fiction from popular authors.",
  },
  {
    name: "Business",
    slug: "business",
    description:
      "Entrepreneurship, leadership, management and business strategy books.",
  },
  {
    name: "Spirituality",
    slug: "spirituality",
    description:
      "Books about spirituality, inner peace, mindfulness and personal reflection.",
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-slate-900"
            >
              Home
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">
              Categories
            </span>
          </div>

          {/* Title */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Layers className="h-4 w-4" />
              StudyStow Collection
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Book Categories
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Explore books by category and find your next great read.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-slate-900">
                <BookOpen className="h-6 w-6 text-slate-700 transition group-hover:text-white" />
              </div>

              {/* Content */}
              <h2 className="mt-5 text-xl font-bold text-slate-900 transition group-hover:text-blue-600">
                {category.name}
              </h2>

              <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                {category.description}
              </p>

              {/* Link */}
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                Browse Books
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white p-6 sm:flex-row">
          <div>
            <h3 className="font-semibold text-slate-900">
              Looking for something else?
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Browse our complete collection of books.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View All Books
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
