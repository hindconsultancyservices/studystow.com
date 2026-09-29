import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import connectDB from "@/lib/db";
import Book from "@/models/Book";
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

  await connectDB();

  const bookData = await Book.findOne({
    slug,
    published: true,
  })
    .populate("category", "name slug")
    .lean();

  if (!bookData) {
    notFound();
  }

  const categoryInfo =
    typeof bookData.category === "object" &&
    bookData.category !== null &&
    "name" in bookData.category &&
    "slug" in bookData.category
      ? {
          name: String(
            (bookData.category as unknown as { name?: unknown }).name,
          ),
          slug: String(
            (bookData.category as unknown as { slug?: unknown }).slug,
          ),
        }
      : {
          name: "Uncategorized",
          slug: "uncategorized",
        };

  const book = {
    id: bookData._id.toString(),
    title: bookData.title,
    slug: bookData.slug,
    author: bookData.author,
    category: categoryInfo,

    price: Number(bookData.price || 0),
    originalPrice: Number(
      bookData.compareAtPrice || bookData.price || 0,
    ),

    stock: Number(bookData.stock || 0),

    isbn: bookData.isbn || "",
    publisher: bookData.publisher || "",
    language: bookData.language || "English",
    pages: Number(bookData.pages || 0),

    description:
      bookData.description ||
      "No description available.",

    image: bookData.image || "",
    images: Array.isArray(bookData.images)
      ? bookData.images
      : [],
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
            href={`/category/${book.category.slug}`}
            className="hover:text-gray-900"
          >
            {book.category.name}
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