"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Heart,
  ShoppingCart,
} from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

type Book = {
  _id: string;
  slug: string;
  title: string;
  author: string;
  category:
    | string
    | {
        _id?: string;
        name?: string;
        slug?: string;
      };
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
};

type CartItem = {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  image?: string;
  quantity: number;
};

const WISHLIST_KEY = "studystow-wishlist";
const CART_KEY = "studystow-cart";

function getDiscount(
  price: number,
  originalPrice: number
) {
  if (!originalPrice || originalPrice <= price) {
    return 0;
  }

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

  const [category, setCategory] =
    useState<Category | null>(null);

  const [books, setBooks] = useState<Book[]>([]);

  const [loading, setLoading] = useState(true);

  const [notFound, setNotFound] =
    useState(false);

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (!slug) return;

    async function loadCategory() {
      try {
        setLoading(true);
        setNotFound(false);

        // Get real category
        const categoryResponse =
          await fetch(
            `/api/categories?active=true`,
            {
              cache: "no-store",
            }
          );

        if (!categoryResponse.ok) {
          throw new Error(
            "Failed to load categories"
          );
        }

        const categoryData =
          await categoryResponse.json();

        const categories =
          Array.isArray(categoryData?.data)
            ? categoryData.data
            : Array.isArray(categoryData?.categories)
              ? categoryData.categories
              : [];

        const foundCategory =
          categories.find(
            (item: Category) =>
              item.slug?.toLowerCase() === slug
          );

        if (!foundCategory) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Get real books for this category
        const booksResponse =
          await fetch(
            `/api/books?published=true&category=${encodeURIComponent(
              foundCategory._id
            )}&limit=100`,
            {
              cache: "no-store",
            }
          );

        if (!booksResponse.ok) {
          throw new Error(
            "Failed to load books"
          );
        }

        const booksData =
          await booksResponse.json();

        const realBooks = Array.isArray(
          booksData?.data
        )
          ? booksData.data
          : [];

        setBooks(realBooks);
      } catch (error) {
        console.error(
          "Failed to load category:",
          error
        );

        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [slug]);

  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem(
          WISHLIST_KEY
        );

      const savedCart =
        localStorage.getItem(CART_KEY);

      if (savedWishlist) {
        const parsed =
          JSON.parse(savedWishlist);

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
        const parsed =
          JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load cart/wishlist:",
        error
      );
    }
  }, []);

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  function toggleWishlist(book: Book) {
    const bookId = book._id;

    const exists =
      wishlist.includes(bookId);

    const nextWishlist = exists
      ? wishlist.filter(
          (id) => id !== bookId
        )
      : [...wishlist, bookId];

    setWishlist(nextWishlist);

    const wishlistBooks = books
      .filter((item) =>
        nextWishlist.includes(item._id)
      )
      .map((item) => ({
        id: item._id,
        title: item.title,
        slug: item.slug,
        author: item.author,
        price: item.price,
        compareAtPrice:
          item.compareAtPrice,
        image: item.image,
      }));

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
    if (book.stock <= 0) {
      showMessage("Book is out of stock");
      return;
    }

    const existing = cart.find(
      (item) => item.id === book._id
    );

    let nextCart: CartItem[];

    const categoryName =
      typeof book.category === "object"
        ? book.category?.name || ""
        : book.category || "";

    if (existing) {
      if (
        existing.quantity >= book.stock
      ) {
        showMessage(
          `Only ${book.stock} copies available`
        );
        return;
      }

      nextCart = cart.map((item) =>
        item.id === book._id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
              price: book.price,
              originalPrice:
                book.compareAtPrice ||
                book.price,
              stock: book.stock,
              image: book.image,
            }
          : item
      );
    } else {
      nextCart = [
        ...cart,
        {
          id: book._id,
          title: book.title,
          slug: book.slug,
          author: book.author,
          category: categoryName,
          price: book.price,
          originalPrice:
            book.compareAtPrice ||
            book.price,
          stock: book.stock,
          image: book.image,
          quantity: 1,
        },
      ];
    }

    setCart(nextCart);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(nextCart)
    );

    showMessage(
      `${book.title} added to cart`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-4 py-20 text-center">
          <BookOpen className="mx-auto h-12 w-12 animate-pulse text-slate-300" />

          <p className="mt-4 text-sm text-slate-500">
            Loading category...
          </p>
        </section>
      </main>
    );
  }

  if (notFound || !category) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <BookOpen className="mx-auto h-14 w-14 text-slate-300" />

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Category Not Found
          </h1>

          <p className="mt-2 text-slate-500">
            The category you are looking for
            does not exist.
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
      {message && (
        <div className="fixed right-4 top-20 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {message}
        </div>
      )}

      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <BookOpen className="h-4 w-4" />
              StudyStow Collection
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {category.name} Books
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              {category.description ||
                `Explore books available in ${category.name}.`}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {books.length}
              </span>{" "}
              books available
            </p>
          </div>
        </div>
      </section>

      {/* Books */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {books.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => {
              const originalPrice =
                Number(
                  book.compareAtPrice || 0
                );

              const discount =
                getDiscount(
                  book.price,
                  originalPrice
                );

              const isWishlisted =
                wishlist.includes(
                  book._id
                );

              return (
                <article
                  key={book._id}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative">
                    <Link
                      href={`/books/${book.slug}`}
                      className="block"
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

                        {discount > 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </Link>

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
                        {typeof book.category ===
                        "object"
                          ? book.category?.name
                          : book.category}
                      </p>

                      <h2 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-900 transition group-hover:text-blue-600">
                        {book.title}
                      </h2>
                    </Link>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      by {book.author}
                    </p>

                    {/* Price */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        ₹
                        {Number(
                          book.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      {originalPrice >
                        book.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹
                          {originalPrice.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
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

                    <button
                      type="button"
                      disabled={
                        book.stock <= 0
                      }
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
              There are currently no books available
              in this category.
            </p>

            <Link
              href="/books"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition"
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