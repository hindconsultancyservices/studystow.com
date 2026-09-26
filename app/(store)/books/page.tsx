import Link from "next/link";
import type { ReactNode } from "react";

type IconProps = { className?: string };

function Icon({ className, children }: IconProps & { children: ReactNode }) {
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
const ChevronRight = (props: IconProps) => <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>;
const Filter = (props: IconProps) => <Icon {...props}><path d="M4 6h16M7 12h10m-7 6h4" /></Icon>;
const Heart = (props: IconProps) => <Icon {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></Icon>;
const Search = (props: IconProps) => <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>;
const ShoppingCart = (props: IconProps) => <Icon {...props}><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M3 4h2l2.7 11.2a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 1.9-1.4L21 8H6" /></Icon>;
const Star = (props: IconProps) => <Icon {...props}><polygon points="12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.8 5.8 21 7 14.2 2 9.3 8.9 8.3 12 2" /></Icon>;

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

const categories = [
  "All Books",
  "Self Help",
  "Finance",
  "Productivity",
  "Fiction",
  "Business",
  "Spirituality",
];

function getDiscount(price: number, originalPrice: number) {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export default function BooksPage() {
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
              Books
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <BookOpen className="h-4 w-4" />
                StudyStow Books
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Explore Our Books
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Discover books across self-help, finance, business,
                fiction, productivity and more.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {books.length}
              </span>{" "}
              books available
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-700" />
                <h2 className="font-semibold text-slate-900">
                  Categories
                </h2>
              </div>

              <div className="space-y-1">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    type="button"
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      index === 0
                        ? "bg-slate-900 font-medium text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Books */}
          <div>
            {/* Search + filters */}
            <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Search books, authors..."
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <select
                  defaultValue="featured"
                  className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {/* Mobile categories */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    type="button"
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                      index === 0
                        ? "bg-slate-900 text-white"
                        : "border bg-white text-slate-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => {
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
                          onClick={(event) => event.preventDefault()}
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

                      {/* Add to cart */}
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

            {/* Bottom CTA */}
            <div className="mt-10 rounded-2xl border bg-white p-6 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-400" />

              <h3 className="mt-3 font-semibold text-slate-900">
                Looking for something specific?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Search our collection to find your next book.
              </p>

              <Link
                href="/search"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Search className="h-4 w-4" />
                Search Books
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
