import Link from "next/link";
import { ChevronRight } from "lucide-react";

import BookDetails from "@/components/customer/BookDetails";

type BookPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BookPage({
  params,
}: BookPageProps) {
  const { slug } = await params;

  /*
   * Temporary book data.
   *
   * Abhi demo ke liye.
   * Baad me isi jagah MongoDB se
   * slug ke basis par book fetch karenge.
   */
  const book = {
    id: "BK001",
    title: "Atomic Habits",
    slug,
    author: "James Clear",
    category: "Self Help",
    price: 499,
    originalPrice: 699,
    rating: 4.8,
    reviews: 124,
    stock: 24,
    isbn: "9780735211292",
    publisher: "Avery",
    language: "English",
    pages: 320,
    description:
      "Atomic Habits is a practical guide to building good habits, breaking bad ones, and making small changes that lead to remarkable results.",
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/"
            className="hover:text-gray-900"
          >
            Home
          </Link>

          <ChevronRight className="h-4 w-4" />

          <Link
            href="/books"
            className="hover:text-gray-900"
          >
            Books
          </Link>

          <ChevronRight className="h-4 w-4" />

          <Link
            href={`/category/${book.category
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            className="hover:text-gray-900"
          >
            {book.category}
          </Link>

          <ChevronRight className="h-4 w-4" />

          <span className="text-gray-900">
            {book.title}
          </span>
        </nav>

        <BookDetails book={book} />
      </div>
    </main>
  );
}