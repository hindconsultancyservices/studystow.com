import Link from "next/link";
import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function Icon({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const BookOpen = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v19H4.5A2.5 2.5 0 0 0 2 23z" />
    <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v19h6.5A2.5 2.5 0 0 1 22 23z" />
  </Icon>
);

const ChevronRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

const ArrowRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
);

const categories = [
  {
    name: "Self Help",
    slug: "self-help",
    description:
      "Books on personal growth, habits, motivation and better living.",
    count: 2,
  },
  {
    name: "Finance",
    slug: "finance",
    description:
      "Learn about money, investing, financial freedom and wealth.",
    count: 2,
  },
  {
    name: "Productivity",
    slug: "productivity",
    description:
      "Improve focus, time management and your everyday productivity.",
    count: 1,
  },
  {
    name: "Fiction",
    slug: "fiction",
    description:
      "Explore novels, stories and timeless works of fiction.",
    count: 1,
  },
  {
    name: "Business",
    slug: "business",
    description:
      "Books covering entrepreneurship, leadership and business.",
    count: 1,
  },
  {
    name: "Spirituality",
    slug: "spirituality",
    description:
      "Explore mindfulness, inner peace and spiritual development.",
    count: 1,
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
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

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <BookOpen className="h-4 w-4" />
                StudyStow Books
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Browse Categories
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Explore our collection by category and find books
                that match your interests and learning goals.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {categories.length}
              </span>{" "}
              categories available
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Intro Card */}
        <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Find your next book
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose a category below to explore available books.
              </p>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <BookOpen className="h-4 w-4" />
              View All Books
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                  <BookOpen className="h-6 w-6" />
                </div>

                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900" />
              </div>

              {/* Category */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-slate-900 transition group-hover:text-blue-600">
                  {category.name}
                </h2>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                  {category.description}
                </p>
              </div>

              {/* Bottom */}
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium text-slate-500">
                  {category.count}{" "}
                  {category.count === 1 ? "Book" : "Books"}
                </span>

                <span className="text-sm font-semibold text-slate-700 transition group-hover:text-blue-600">
                  View Books
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 rounded-2xl border bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto h-9 w-9 text-slate-400" />

          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            Can&apos;t decide what to read?
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Explore our complete collection and discover your next
            favorite book.
          </p>

          <Link
            href="/books"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse All Books
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}