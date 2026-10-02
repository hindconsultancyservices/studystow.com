"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

type WishlistApiItem = {
  id?: string;
  _id?: string;
  title?: string;
  slug?: string;
  author?: string;
  price?: number;
  compareAtPrice?: number;
  image?: string;
};

type WishlistApiResponse = {
  success?: boolean;
  items?: WishlistApiItem[];
  message?: string;
  error?: string;
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
  const router = useRouter();

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

  // MongoDB wishlist IDs
  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [wishlistLoadingId, setWishlistLoadingId] =
    useState<string | null>(null);

  // MongoDB cart
  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [message, setMessage] =
    useState("");

  /*
   * =====================================================
   * LOAD CATEGORY + BOOKS
   * =====================================================
   */
  useEffect(() => {
    if (!slug) return;

    async function loadCategory() {
      try {
        setLoading(true);
        setNotFound(false);

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
            : Array.isArray(
                  categoryData?.categories
                )
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

  /*
   * =====================================================
   * LOAD MONGODB WISHLIST
   * =====================================================
   */
  async function loadWishlist() {
    try {
      const response = await fetch(
        "/api/wishlist",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setWishlist([]);
        }

        return;
      }

      const data: WishlistApiResponse =
        await response.json();

      if (
        !data?.success ||
        !Array.isArray(data.items)
      ) {
        setWishlist([]);
        return;
      }

      const ids = data.items
        .map(
          (item) =>
            item.id || item._id
        )
        .filter(Boolean)
        .map(String);

      setWishlist(ids);
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );
    }
  }

  /*
   * =====================================================
   * LOAD MONGODB CART
   * =====================================================
   */
  async function loadCart() {
    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      const items =
        Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data?.items)
            ? data.data.items
            : Array.isArray(data?.data)
              ? data.data
              : [];

      if (Array.isArray(items)) {
        setCart(items);
      }
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );
    }
  }

  /*
   * =====================================================
   * INITIAL WISHLIST + CART
   * =====================================================
   */
  useEffect(() => {
    loadWishlist();
    loadCart();

    function refreshWishlist() {
      loadWishlist();
    }

    function handleVisibility() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadWishlist();
        loadCart();
      }
    }

    window.addEventListener(
      "studystow-wishlist-updated",
      refreshWishlist
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "studystow-wishlist-updated",
        refreshWishlist
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  /*
   * =====================================================
   * MESSAGE
   * =====================================================
   */
  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  /*
   * =====================================================
   * MONGODB WISHLIST TOGGLE
   * =====================================================
   */
  async function toggleWishlist(book: Book) {
    const bookId = String(book._id);

    if (!bookId || wishlistLoadingId) {
      return;
    }

    const exists =
      wishlist.includes(bookId);

    setWishlistLoadingId(bookId);

    try {
      const response = await fetch(
        "/api/wishlist",
        {
          method: exists
            ? "DELETE"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookId,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            `/category/${slug}`
          )}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to update wishlist."
        );
      }

      setWishlist((current) =>
        exists
          ? current.filter(
              (id) => id !== bookId
            )
          : [...current, bookId]
      );

      window.dispatchEvent(
        new Event(
          "studystow-wishlist-updated"
        )
      );

      showMessage(
        exists
          ? `${book.title} removed from wishlist`
          : `${book.title} added to wishlist`
      );
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      showMessage(
        "Unable to update wishlist"
      );
    } finally {
      setWishlistLoadingId(null);
    }
  }

  /*
   * =====================================================
   * MONGODB CART
   * =====================================================
   */
  async function addToCart(book: Book) {
  if (book.stock <= 0) {
    showMessage("Book is out of stock");
    return;
  }

  try {
    const existingCartItem = cart.find(
      (item) => String(item.id) === String(book._id)
    );

    const currentQuantity =
      existingCartItem?.quantity || 0;

    if (currentQuantity >= book.stock) {
      showMessage(
        book.stock === 1
          ? "Only 1 item available"
          : `Only ${book.stock} items available`
      );
      return;
    }

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        bookId: String(book._id),
        quantity: 1,
      }),
    });

    const data = await response
      .json()
      .catch(() => null);

    if (response.status === 401) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/category/${slug}`
        )}`
      );
      return;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Unable to add to cart."
      );
    }

    await loadCart();

    window.dispatchEvent(
      new Event("studystow-cart-updated")
    );

    showMessage(`${book.title} added to cart`);
  } catch (error) {
    console.error("Cart error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to add to cart";

    showMessage(errorMessage);
  }
}

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */
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

  /*
   * =====================================================
   * NOT FOUND
   * =====================================================
   */
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

      {/* =====================================================
          HEADER
          Hidden on mobile
         ===================================================== */}
      <section className="hidden border-b bg-white sm:block">
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

      {/* =====================================================
          BOOKS
          Exact responsive card sizing from /books page
         ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {books.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => {
              const originalPrice =
                Number(
                  book.compareAtPrice || 0
                );

              const discount =
                getDiscount(
                  Number(book.price),
                  originalPrice
                );

              const isWishlisted =
                wishlist.includes(
                  String(book._id)
                );

              const wishlistLoading =
                wishlistLoadingId ===
                String(book._id);

              return (
                <article
                  key={book._id}
                  className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl"
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
                          <BookOpen className="h-14 w-14 text-slate-300 transition duration-300 group-hover:scale-110 sm:h-20 sm:w-20" />
                        )}

                        {discount > 0 && (
                          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleWishlist(book)
                      }
                      disabled={
                        wishlistLoading
                      }
                      aria-label={
                        isWishlisted
                          ? `Remove ${book.title} from wishlist`
                          : `Add ${book.title} to wishlist`
                      }
                      title={
                        isWishlisted
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 p-0 text-slate-600 shadow-sm transition hover:bg-white hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
                    >
                      <Heart
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-3 sm:p-4">
                    <Link
                      href={`/books/${book.slug}`}
                    >
                      <p className="text-[10px] font-medium text-blue-600 sm:text-xs">
                        {typeof book.category ===
                        "object"
                          ? book.category?.name
                          : book.category}
                      </p>

                      <h2 className="mt-1 line-clamp-2 min-h-[32px] text-xs font-semibold text-slate-900 transition group-hover:text-blue-600 sm:min-h-[40px] sm:text-sm">
                        {book.title}
                      </h2>
                    </Link>

                    <p className="mt-1 truncate text-[10px] text-slate-500 sm:text-xs">
                      by {book.author}
                    </p>

                    {/* Price */}
                    <div className="mt-2 flex items-center gap-2 sm:mt-3">
                      <span className="text-base font-bold text-slate-900 sm:text-lg">
                        ₹
                        {Number(
                          book.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      {originalPrice >
                        Number(book.price) && (
                        <span className="text-[10px] text-slate-400 line-through sm:text-xs">
                          ₹
                          {originalPrice.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <p
                      className={`mt-1 text-[10px] font-medium sm:text-xs ${
                        book.stock <= 10
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {book.stock <= 0
                        ? "Out"
                        : book.stock <= 10
                          ? `Only ${book.stock} left`
                          : "In stock"}
                    </p>

                    {/* Cart */}
                    <button
                      type="button"
                      disabled={
                        book.stock <= 0
                      }
                      onClick={() =>
                        addToCart(book)
                      }
                      className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:mt-4 sm:h-10 sm:gap-2 sm:text-sm"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

                      <span className="sm:hidden">
                        {book.stock <= 0
                          ? "Out"
                          : "Cart"}
                      </span>

                      <span className="hidden sm:inline">
                        {book.stock <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </span>
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