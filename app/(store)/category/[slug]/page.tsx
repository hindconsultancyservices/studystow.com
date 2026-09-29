"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";

type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  stock: number;
};

type CartItem = Book & {
  quantity: number;
};

const books: Book[] = [
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

const categoryInfo: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  "self-help": {
    name: "Self Help",
    description:
      "Personal growth, habits, mindset and practical books for everyday improvement.",
  },
  finance: {
    name: "Finance",
    description:
      "Money, investing, personal finance and wealth-building books.",
  },
  productivity: {
    name: "Productivity",
    description:
      "Books to improve focus, time management, efficiency and productivity.",
  },
  fiction: {
    name: "Fiction",
    description:
      "Stories, novels and timeless fiction from popular authors.",
  },
  business: {
    name: "Business",
    description:
      "Entrepreneurship, leadership, management and business strategy books.",
  },
  spirituality: {
    name: "Spirituality",
    description:
      "Books about spirituality, inner peace, mindfulness and personal reflection.",
  },
};

const WISHLIST_KEY = "studystow-wishlist";
const CART_KEY = "studystow-cart";

function getDiscount(price: number, originalPrice: number) {
  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

export default function CategorySlugPage() {
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? params.slug.toLowerCase()
      : "";

  const category = categoryInfo[slug];

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem(WISHLIST_KEY);

      const savedCart =
        localStorage.getItem(CART_KEY);

      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);

        if (Array.isArray(parsed)) {
          setWishlist(
            parsed
              .map((item) =>
                typeof item === "string"
                  ? item
                  : item?.id
              )
              .filter(Boolean)
          );
        }
      }

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load category data:",
        error
      );
    }
  }, []);

  const categoryBooks = useMemo(() => {
    if (!category) return [];

    return books.filter(
      (book) => book.category === category.name
    );
  }, [category]);

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  function toggleWishlist(book: Book) {
    const exists = wishlist.includes(book.id);

    const nextWishlist = exists
      ? wishlist.filter((id) => id !== book.id)
      : [...wishlist, book.id];

    setWishlist(nextWishlist);

    const wishlistBooks = books.filter((item) =>
      nextWishlist.includes(item.id)
    );

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(wishlistBooks)
    );

    showMessage(
      exists
        ? `${book.title} removed from wishlist`
        : `${book.title} added to wishlist`
    );
  }

  function addToCart(book: Book) {
    const existing = cart.find(
      (item) => item.id === book.id
    );

    let nextCart: CartItem[];

    if (existing) {
      if (existing.quantity >= book.stock) {
        showMessage(
          `Only ${book.stock} copies available`
        );
        return;
      }

      nextCart = cart.map((item) =>
        item.id === book.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    } else {
      nextCart = [
        ...cart,
        {
          ...book,
          quantity: 1,
        },
      ];
    }

    setCart(nextCart);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(nextCart)
    );

    showMessage(`${book.title} added to cart`);
  }

  // Invalid category
  if (!category) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <BookOpen className="mx-auto h-14 w-14 text-slate-300" />

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Category Not Found
          </h1>

          <p className="mt-2 text-slate-500">
            The category you are looking for does not exist.
          </p>

          <Link
            href="/category"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Toast */}
      {message && (
        <div className="fixed right-4 top-20 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {message}
        </div>
      )}

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

            <Link
              href="/category"
              className="transition hover:text-slate-900"
            >
              Categories
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">
              {category.name}
            </span>
          </div>

          {/* Title */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <BookOpen className="h-4 w-4" />
              StudyStow Collection
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {category.name} Books
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              {category.description}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {categoryBooks.length}
              </span>{" "}
              books available
            </p>
          </div>
        </div>
      </section>

      {/* Books */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {categoryBooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {categoryBooks.map((book) => {
              const discount = getDiscount(
                book.price,
                book.originalPrice
              );

              const isWishlisted =
                wishlist.includes(book.id);

              return (
                <article
                  key={book.id}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative">
                    <Link
                      href={`/books/${book.slug}`}
                      className="block"
                    >
                      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-slate-100">
                        <BookOpen className="h-20 w-20 text-slate-300 transition duration-300 group-hover:scale-110" />

                        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                          {discount}% OFF
                        </span>
                      </div>
                    </Link>

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleWishlist(book)
                      }
                      aria-label={
                        isWishlisted
                          ? `Remove ${book.title} from wishlist`
                          : `Add ${book.title} to wishlist`
                      }
                      className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm transition hover:text-red-500"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <Link
                      href={`/books/${book.slug}`}
                    >
                      <p className="text-xs font-medium text-blue-600">
                        {book.category}
                      </p>

                      <h2 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-900 transition group-hover:text-blue-600">
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
                      disabled={book.stock <= 0}
                      onClick={() =>
                        addToCart(book)
                      }
                      className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <ShoppingCart className="h-4 w-4" />

                      {book.stock <= 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No books in this category
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no books available in this category.
            </p>

            <Link
              href="/books"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse All Books
            </Link>
          </div>
        )}

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white p-6 sm:flex-row">
          <div>
            <h3 className="font-semibold text-slate-900">
              Explore another category
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Discover more books from StudyStow.
            </p>
          </div>

          <Link
            href="/category"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            All Categories
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}