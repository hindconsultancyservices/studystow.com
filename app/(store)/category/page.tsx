import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Book from "@/models/Book";

export const dynamic = "force-dynamic";

export default async function CategoryPage() {
  await connectDB();

  const categories = await Category.find({
    active: true,
  })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const categoryIds = categories.map(
    (category) => category._id
  );

  const bookCounts = await Book.aggregate([
    {
      $match: {
        published: true,
        category: { $in: categoryIds },
      },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    bookCounts.map((item) => [
      String(item._id),
      item.count,
    ])
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
          Hidden on mobile
          Visible from sm/tablet/laptop upward
         ===================================================== */}
      <section className="hidden border-b bg-white sm:block">
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

          {/* Heading */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <BookOpen className="h-4 w-4" />
              StudyStow Collection
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Browse Categories
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Explore books by category and find your next great read.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {categories.length}
              </span>{" "}
              {categories.length === 1
                ? "category"
                : "categories"}{" "}
              available
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
         ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const count =
                countMap.get(
                  String(category._id)
                ) ?? 0;

              return (
                <Link
                  key={String(category._id)}
                  href={`/category/${category.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg sm:p-6"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-slate-900 sm:h-12 sm:w-12">
                      <FolderOpen className="h-5 w-5 text-slate-600 transition group-hover:text-white sm:h-6 sm:w-6" />
                    </div>

                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700 sm:h-5 sm:w-5" />
                  </div>

                  {/* Category Name */}
                  <h2 className="mt-4 line-clamp-2 text-base font-bold text-slate-900 sm:mt-5 sm:text-xl">
                    {category.name}
                  </h2>

                  {/* Description */}
                  {category.description ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                      {category.description}
                    </p>
                  ) : (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm">
                      Explore books in this category.
                    </p>
                  )}

                  {/* Book Count */}
                  <div className="mt-4 border-t border-slate-100 pt-3 sm:mt-5 sm:pt-4">
                    <span className="text-xs font-semibold text-blue-600 sm:text-sm">
                      {count}{" "}
                      {count === 1
                        ? "book"
                        : "books"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* =================================================
             EMPTY STATE
             ================================================= */
          <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FolderOpen className="h-8 w-8 text-slate-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No categories found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No active categories are available right now.
            </p>

            <Link
              href="/books"
              className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse All Books
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}