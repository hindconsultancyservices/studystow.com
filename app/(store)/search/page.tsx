import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import WishlistButton from "@/components/customer/WishlistButton";
import SearchBookActions from "@/components/customer/SearchBookActions";
import connectDB from "@/lib/db";
import Book from "@/models/Book";
import Category from "@/models/Category";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function getDiscount(
  price: number,
  originalPrice?: number
) {
  if (
    !originalPrice ||
    originalPrice <= price ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query = (params.q || "").trim();

  await connectDB();

  const searchFilter = query
    ? {
        published: true,
        $or: [
          {
            title: {
              $regex: query,
              $options: "i",
            },
          },
          {
            author: {
              $regex: query,
              $options: "i",
            },
          },
          {
            description: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      }
    : {
        published: true,
      };

  const books = await Book.find(searchFilter)
    .populate({
      path: "category",
      model: Category,
      select: "name slug",
    })
    .sort({
      createdAt: -1,
    })
    .lean();

  const results = books.map((book) => {
    const categoryName =
      book.category &&
      typeof book.category === "object" &&
      "name" in book.category &&
      typeof (book.category as { name?: unknown }).name ===
        "string"
        ? (book.category as { name: string }).name
        : "Uncategorized";

    return {
      id: String(book._id),
      slug: book.slug,
      title: book.title,
      author: book.author,
      category: categoryName,
      price: book.price,
      originalPrice: book.compareAtPrice,
      stock: book.stock,
      image: book.image,
    };
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          TOP HEADER
          Hidden as requested
      ====================================================== */}
      <section className="hidden border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-slate-900"
            >
              Home
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">
              Search
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Search className="h-4 w-4" />
              Book Search
            </div>

            {query ? (
              <>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Search Results
                </h1>

                <p className="mt-2 text-slate-600">
                  Showing results for{" "}
                  <span className="font-semibold text-slate-900">
                    &quot;{query}&quot;
                  </span>
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Search Books
                </h1>

                <p className="mt-2 text-slate-600">
                  Find books by title, author or description.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Result count */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {results.length}
            </span>{" "}
            {results.length === 1 ? "book" : "books"} found
          </p>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />

            <span className="text-sm text-slate-500">
              Latest books
            </span>
          </div>
        </div>

        {/* ===================================================
            RESULTS
        ==================================================== */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((book) => {
              const discount = getDiscount(
                book.price,
                book.originalPrice
              );

              return (
                <article
                  key={book.id}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* =================================================
                      IMAGE + WISHLIST
                  ================================================== */}
                  <div className="relative">
                    {/* Book image/link */}
                    <Link
                      href={`/books/${book.slug}`}
                      className="relative block"
                    >
                      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-100">
                        {book.image ? (
                          <img
                            src={book.image}
                            alt={book.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <BookOpen className="h-20 w-20 text-slate-300 transition duration-300 group-hover:scale-110" />
                        )}

                        {/* Discount */}
                        {discount > 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* =================================================
                        IMPORTANT:
                        WishlistButton is OUTSIDE Link.
                        It directly calls /api/wishlist.
                    ================================================== */}
                    <WishlistButton
                      bookId={String(book.id)}
                      bookSlug={book.slug}
                      showText={false}
                      className="absolute right-2 top-2 z-30 !flex !h-9 !w-9 !shrink-0 !items-center !justify-center !rounded-full !border-0 !bg-white/95 !p-0 !text-slate-600 !shadow-sm hover:!bg-white hover:!text-red-500 sm:right-3 sm:top-3 sm:!h-10 sm:!w-10"
                    />
                  </div>

                  {/* =================================================
                      DETAILS
                  ================================================== */}
                  <div className="p-4">
                    <Link href={`/books/${book.slug}`}>
                      <p className="mb-1 text-xs font-medium text-blue-600">
                        {book.category}
                      </p>

                      <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-900 transition group-hover:text-blue-600">
                        {book.title}
                      </h2>
                    </Link>

                    {/* Author */}
                    <p className="mt-1 truncate text-xs text-slate-500">
                      by {book.author}
                    </p>

                    {/* =================================================
                        PRICE
                    ================================================== */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        ₹
                        {Number(book.price).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      {book.originalPrice &&
                        book.originalPrice > book.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹
                            {Number(
                              book.originalPrice
                            ).toLocaleString("en-IN")}
                          </span>
                        )}
                    </div>

                    {/* =================================================
                        STOCK
                    ================================================== */}
                    <p
                      className={`mt-1 text-xs font-medium ${
                        book.stock <= 10
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {book.stock <= 0
                        ? "Out of stock"
                        : book.stock <= 10
                        ? `Only ${book.stock} left`
                        : "In stock"}
                    </p>

                    {/* =================================================
                        CART
                    ================================================== */}
                    <SearchBookActions
                      bookId={String(book.id)}
                      bookTitle={book.title}
                      stock={book.stock}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* =====================================================
             NO RESULTS
          ====================================================== */
          <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-8 w-8 text-slate-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No books found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              We couldn&apos;t find any books matching{" "}
              <span className="font-medium text-slate-700">
                &quot;{query}&quot;
              </span>
              .
            </p>

            <Link
              href="/books"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse All Books
            </Link>
          </div>
        )}

        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}
        <div className="mt-10 rounded-2xl border bg-white p-6 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-400" />

          <h3 className="mt-3 font-semibold text-slate-900">
            Can&apos;t find what you&apos;re looking for?
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Browse our complete book collection.
          </p>

          <Link
            href="/books"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View All Books

            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}