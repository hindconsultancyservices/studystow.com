"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
};

type WishlistBook = {
  _id?: string;
  id?: string;
  title?: string;
  slug?: string;
  author?: string;
  price?: number;
  compareAtPrice?: number;
  image?: string;
  stock?: number;
  published?: boolean;
};

type WishlistResponse = {
  success?: boolean;
  message?: string;
  items?: unknown[];
};

function getBookId(book: WishlistBook) {
  return String(book._id || book.id || "");
}

function extractWishlistItems(data: unknown): unknown[] {
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown[] }).items)
  ) {
    return (data as { items: unknown[] }).items;
  }

  return [];
}

function normalizeBook(item: unknown): WishlistBook | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const raw = item as {
    book?: unknown;
    _id?: unknown;
    id?: unknown;
    title?: unknown;
    slug?: unknown;
    author?: unknown;
    price?: unknown;
    compareAtPrice?: unknown;
    image?: unknown;
    stock?: unknown;
    published?: unknown;
  };

  const source =
    raw.book &&
    typeof raw.book === "object"
      ? (raw.book as Record<string, unknown>)
      : raw;

  const id = String(
    source._id ||
      source.id ||
      raw._id ||
      raw.id ||
      ""
  );

  const title = String(source.title || "").trim();
  const slug = String(source.slug || "").trim();

  if (!id || !title || !slug) {
    return null;
  }

  const price = Number(source.price ?? 0);

  const compareAtPrice =
    source.compareAtPrice !== undefined &&
    source.compareAtPrice !== null
      ? Number(source.compareAtPrice)
      : undefined;

  const stock =
    source.stock !== undefined &&
    source.stock !== null
      ? Number(source.stock)
      : 0;

  return {
    _id: id,
    title,
    slug,
    author: source.author
      ? String(source.author)
      : "",
    price: Number.isFinite(price) ? price : 0,
    compareAtPrice:
      compareAtPrice !== undefined &&
      Number.isFinite(compareAtPrice)
        ? compareAtPrice
        : undefined,
    image: source.image
      ? String(source.image)
      : "",
    stock: Number.isFinite(stock) ? stock : 0,
    published:
      source.published !== false,
  };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<WishlistBook[]>([]);

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [cartId, setCartId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUser() {
    const email = session?.user?.email?.trim();

    if (!email) {
      return;
    }

    const response = await fetch(
      `/api/users?search=${encodeURIComponent(
        email
      )}&limit=1`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );

    const data = await response
      .json()
      .catch(() => null);

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message ||
          "Unable to load your account."
      );
    }

    const users = Array.isArray(data.data)
      ? data.data
      : [];

    if (users[0]?._id) {
      setUser(users[0]);
    }
  }

  async function loadWishlist() {
    const response = await fetch(
      "/api/wishlist",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );

    const data: WishlistResponse | null =
      await response
        .json()
        .catch(() => null);

    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message ||
          "Unable to load wishlist."
      );
    }

    const items = extractWishlistItems(data);

    const normalizedBooks = items
      .map(normalizeBook)
      .filter(
        (
          book
        ): book is WishlistBook =>
          Boolean(book)
      );

    setBooks(normalizedBooks);
  }

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") {
        setLoading(false);
      }

      return;
    }

    let mounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        await Promise.all([
          loadUser(),
          loadWishlist(),
        ]);
      } catch (loadError) {
        console.error(
          "Wishlist loading error:",
          loadError
        );

        if (!mounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load wishlist."
        );

        setBooks([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, [status, session?.user?.email]);

  async function removeFromWishlist(
    bookId: string
  ) {
    if (!bookId || removingId) {
      return;
    }

    try {
      setRemovingId(bookId);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/wishlist",
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            bookId,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to remove from wishlist."
        );
      }

      setBooks((current) =>
        current.filter(
          (book) =>
            getBookId(book) !== bookId
        )
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new Event(
            "studystow-wishlist-updated"
          )
        );
      }

      setMessage(
        "Book removed from wishlist."
      );
    } catch (removeError) {
      console.error(
        "Remove wishlist error:",
        removeError
      );

      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove from wishlist."
      );
    } finally {
      setRemovingId("");
    }
  }

  async function addToCart(bookId: string) {
    if (!bookId || cartId) {
      return;
    }

    try {
      setCartId(bookId);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/cart",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            bookId,
            quantity: 1,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Please login to add books to your cart."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to add book to cart."
        );
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new Event(
            "studystow-cart-updated"
          )
        );
      }

      setMessage(
        "Book added to cart."
      );
    } catch (cartError) {
      console.error(
        "Add to cart error:",
        cartError
      );

      setError(
        cartError instanceof Error
          ? cartError.message
          : "Unable to add book to cart."
      );
    } finally {
      setCartId("");
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-4 h-8 w-48 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-64 rounded bg-gray-200" />

            <div className="mt-8 grid gap-6 lg:grid-cols-4">
              <div className="h-72 rounded-xl bg-gray-200" />

              <div className="lg:col-span-3">
                <div className="h-24 rounded-xl bg-gray-200" />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="h-96 rounded-xl bg-gray-200" />
                  <div className="h-96 rounded-xl bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Please login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to view your wishlist.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    user?.name ||
    session.user?.name ||
    "Customer";

  const displayEmail =
    user?.email ||
    session.user?.email ||
    "";

  const initial =
    displayName.charAt(0).toUpperCase() ||
    "C";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Account
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            My Wishlist
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Save books you want to buy later.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="h-fit rounded-xl border bg-white p-4 shadow-sm">
  <div className="flex items-center gap-3 border-b px-2 pb-5">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 font-bold uppercase text-white">
      {initial}
    </div>

    <div className="min-w-0">
      <p className="truncate font-semibold text-gray-900">
        {displayName}
      </p>

      <p className="truncate text-xs text-gray-500">
        {displayEmail}
      </p>
    </div>
  </div>

  <nav className="mt-4 space-y-1">
    <Link
      href="/account"
      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
    >
      Account
    </Link>

    <Link
      href="/account/orders"
      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
    >
      My Orders
    </Link>

    <Link
      href="/account/profile"
      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
    >
      My Profile
    </Link>

    <Link
      href="/account/addresses"
      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
    >
      Addresses
    </Link>

    <Link
      href="/wishlist"
      className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900"
    >
      Wishlist
    </Link>

    <button
      type="button"
      onClick={() =>
        signOut({
          callbackUrl: "/login",
        })
      }
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  </nav>
</aside>

          {/* Main */}
          <section className="lg:col-span-3">
            <div className="rounded-xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Saved Books
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {books.length}{" "}
                    {books.length === 1
                      ? "book"
                      : "books"}{" "}
                    in your wishlist
                  </p>
                </div>
              </div>
            </div>

            {books.length === 0 ? (
              <div className="mt-6 rounded-xl border bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                  ♡
                </div>

                <h2 className="mt-5 text-lg font-semibold text-gray-900">
                  Your wishlist is empty
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  Browse our books and save your
                  favorite books here.
                </p>

                <Link
                  href="/books"
                  className="mt-5 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Browse Books
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {books.map((book) => {
                  const bookId =
                    getBookId(book);

                  const price = Number(
                    book.price ?? 0
                  );

                  const compareAtPrice =
                    Number(
                      book.compareAtPrice ?? 0
                    );

                  const hasDiscount =
                    compareAtPrice > price;

                  const stock = Number(
                    book.stock ?? 0
                  );

                  const isOutOfStock =
                    !Number.isFinite(stock) ||
                    stock <= 0;

                  return (
                    <article
                      key={
                        bookId ||
                        book.slug
                      }
                      className="overflow-hidden rounded-xl border bg-white shadow-sm"
                    >
                      {/* Image */}
                      <Link
                        href={`/books/${book.slug}`}
                        className="block"
                      >
                        <div className="relative aspect-[4/3] bg-gray-100">
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={
                                book.title ||
                                "Book"
                              }
                              className="h-full w-full object-contain p-5"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-5">
                        <Link
                          href={`/books/${book.slug}`}
                          className="hover:text-gray-600"
                        >
                          <h3 className="line-clamp-2 font-semibold text-gray-900">
                            {book.title}
                          </h3>
                        </Link>

                        {book.author && (
                          <p className="mt-1 text-sm text-gray-500">
                            by {book.author}
                          </p>
                        )}

                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₹
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹
                              {compareAtPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}
                        </div>

                        {isOutOfStock && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            Out of stock
                          </p>
                        )}

                        {!isOutOfStock &&
                          stock <= 5 && (
                            <p className="mt-2 text-xs font-medium text-orange-600">
                              Only {stock} left
                            </p>
                          )}

                        {/* Actions */}
                        <div className="mt-5 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              removeFromWishlist(
                                bookId
                              )
                            }
                            disabled={
                              !bookId ||
                              removingId ===
                                bookId
                            }
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {removingId ===
                            bookId
                              ? "Removing..."
                              : "Remove"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              addToCart(
                                bookId
                              )
                            }
                            disabled={
                              isOutOfStock ||
                              !bookId ||
                              cartId === bookId
                            }
                            className="flex-1 rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : cartId ===
                                bookId
                              ? "Adding..."
                              : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}