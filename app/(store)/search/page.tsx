import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Heart,
  Search,
  ShoppingCart,
  Star,
  SlidersHorizontal,
} from "lucide-react";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

const books = [
  {
    id: "BK001",
    slug: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Help",
    price: 499,
    originalPrice: 699,
    rating: 4.8,
    reviews: 124,
    stock: 24,
  },
  {
    id: "BK002",
    slug: "the-psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finance",
    price: 399,
    originalPrice: 599,
    rating: 4.7,
    reviews: 98,
    stock: 18,
  },
  {
    id: "BK003",
    slug: "rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "Finance",
    price: 349,
    originalPrice: 499,
    rating: 4.6,
    reviews: 86,
    stock: 12,
  },
  {
    id: "BK004",
    slug: "ikigai",
    title: "Ikigai",
    author: "Héctor García & Francesc Miralles",
    category: "Self Help",
    price: 299,
    originalPrice: 399,
    rating: 4.5,
    reviews: 76,
    stock: 30,
  },
  {
    id: "BK005",
    slug: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Productivity",
    price: 449,
    originalPrice: 599,
    rating: 4.7,
    reviews: 64,
    stock: 15,
  },
  {
    id: "BK006",
    slug: "the-alchemist",
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 145,
    stock: 22,
  },
  {
    id: "BK007",
    slug: "think-and-grow-rich",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    category: "Business",
    price: 329,
    originalPrice: 449,
    rating: 4.5,
    reviews: 71,
    stock: 9,
  },
  {
    id: "BK008",
    slug: "the-power-of-now",
    title: "The Power of Now",
    author: "Eckhart Tolle",
    category: "Spirituality",
    price: 379,
    originalPrice: 499,
    rating: 4.6,
    reviews: 59,
    stock: 17,
  },
];

function getDiscount(price: number, originalPrice: number) {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query = (params.q || "").trim();

  const normalizedQuery = query.toLowerCase();

  const results = normalizedQuery
    ? books.filter((book) => {
        return (
          book.title.toLowerCase().includes(normalizedQuery) ||
          book.author.toLowerCase().includes(normalizedQuery) ||
          book.category.toLowerCase().includes(normalizedQuery)
        );
      })
    : books;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
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
              Search
            </span>
          </div>

          {/* Title */}
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
                  Find books by title, author or category.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Box */}
        <form
          action="/search"
          method="GET"
          className="mb-7 rounded-2xl border bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search books, authors or categories..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </form>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {results.length}
            </span>{" "}
            {results.length === 1 ? "book" : "books"} found
          </p>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />

            <select
              defaultValue="featured"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="featured">Featured</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Results */}
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
                  {/* Image */}
                  <Link
                    href={`/books/${book.slug}`}
                    className="relative block"
                  >
                    <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-100">
                      <BookOpen className="h-20 w-20 text-slate-300 transition duration-300 group-hover:scale-110" />

                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                        {discount}% OFF
                      </span>

                      <button
                        type="button"
                        aria-label={`Add ${book.title} to wishlist`}
                        onClick={(event) =>
                          event.preventDefault()
                        }
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-slate-50"
                      >
                        <Heart className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="p-4">
                    <Link href={`/books/${book.slug}`}>
                      <p className="mb-1 text-xs font-medium text-blue-600">
                        {book.category}
                      </p>

                      <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-900 transition group-hover:text-blue-600">
                        {book.title}
                      </h2>
                    </Link>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      by {book.author}
                    </p>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                      <span className="text-sm font-semibold text-slate-800">
                        {book.rating}
                      </span>

                      <span className="text-xs text-slate-400">
                        ({book.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        ₹{book.price}
                      </span>

                      <span className="text-xs text-slate-400 line-through">
                        ₹{book.originalPrice}
                      </span>
                    </div>

                    {/* Stock */}
                    <p
                      className={`mt-1 text-xs font-medium ${
                        book.stock <= 10
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {book.stock <= 10
                        ? `Only ${book.stock} left`
                        : "In stock"}
                    </p>

                    {/* Cart */}
                    <button
                      type="button"
                      className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* No Results */
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
              . Try another title, author or category.
            </p>

            <Link
              href="/books"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse All Books
            </Link>
          </div>
        )}

        {/* Bottom CTA */}
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
