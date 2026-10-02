"use client";

import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  PackageOpen,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

type WishlistItem = {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  author?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  stock?: number;
  published?: boolean;
  wishlistId?: string;
};

function normalizeImageUrl(image?: string) {
  if (!image) return "";

  const value = image.trim();

  if (!value) return "";

  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `/${value.replace(/^\/+/, "")}`;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [addingToCartId, setAddingToCartId] = useState("");

  // ------------------------------------------------------------
  // Toast
  // ------------------------------------------------------------

  function showMessage(text: string) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  // ------------------------------------------------------------
  // Load wishlist from MongoDB
  // ------------------------------------------------------------

  async function loadWishlist() {
    try {
      setLoaded(false);

      const response = await fetch("/api/wishlist", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.status === 401) {
        setItems([]);
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to load wishlist."
        );
      }

      const wishlistItems = Array.isArray(result?.items)
        ? result.items
        : [];

      const normalizedItems: WishlistItem[] =
        wishlistItems
          .filter(
            (item: any) =>
              item &&
              item.id &&
              item.title &&
              item.slug
          )
          .map((item: any) => ({
            id: String(item.id),
            _id: item._id
              ? String(item._id)
              : undefined,
            title: String(item.title),
            slug: String(item.slug),
            author: item.author
              ? String(item.author)
              : undefined,
            price: Number(item.price) || 0,
            compareAtPrice:
              item.compareAtPrice !== undefined
                ? Number(item.compareAtPrice)
                : undefined,
            image: normalizeImageUrl(item.image),
            stock: Number(item.stock) || 0,
            published:
              item.published !== false,
            wishlistId: item.wishlistId
              ? String(item.wishlistId)
              : undefined,
          }));

      setItems(normalizedItems);
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );

      setItems([]);

      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to load wishlist."
      );
    } finally {
      setLoaded(true);
    }
  }

  // ------------------------------------------------------------
  // Initial load
  // ------------------------------------------------------------

  useEffect(() => {
    loadWishlist();

    function handleWishlistUpdate() {
      loadWishlist();
    }

    window.addEventListener(
      "studystow-wishlist-updated",
      handleWishlistUpdate
    );

    return () => {
      window.removeEventListener(
        "studystow-wishlist-updated",
        handleWishlistUpdate
      );
    };
  }, []);

  // ------------------------------------------------------------
  // Remove from wishlist
  // ------------------------------------------------------------

  async function removeFromWishlist(
    bookId: string,
    title: string
  ) {
    if (removingId) return;

    try {
      setRemovingId(bookId);

      const response = await fetch(
        "/api/wishlist",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookId,
          }),
        }
      );

      const result =
        await response.json().catch(() => null);

      if (response.status === 401) {
        showMessage("Please login first.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to remove book from wishlist."
        );
      }

      setItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== bookId
        )
      );

      window.dispatchEvent(
        new Event("studystow-wishlist-updated")
      );

      showMessage(
        `${title} removed from wishlist`
      );
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to remove book."
      );
    } finally {
      setRemovingId("");
    }
  }

  // ------------------------------------------------------------
  // Add to cart
  // ------------------------------------------------------------

  async function addToCart(item: WishlistItem) {
    if (addingToCartId) return;

    if (
      typeof item.stock === "number" &&
      item.stock <= 0
    ) {
      showMessage(
        `${item.title} is out of stock`
      );
      return;
    }

    try {
      setAddingToCartId(item.id);

      const response = await fetch(
        "/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookId: item.id,
            quantity: 1,
          }),
        }
      );

      const result =
        await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(
          "/wishlist"
        )}`;
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Unable to add book to cart."
        );
      }

      window.dispatchEvent(
        new Event("studystow-cart-updated")
      );

      showMessage(
        `${item.title} added to cart`
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to add book to cart."
      );
    } finally {
      setAddingToCartId("");
    }
  }

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------

  if (!loaded) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border bg-white"
                >
                  <div className="aspect-[3/4] bg-gray-200" />

                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-10 w-full rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Toast */}
      {message && (
        <div className="fixed right-4 top-20 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {message}
        </div>
      )}

      {/* ======================================================
          HEADER
          Hidden on mobile
          Visible from sm/tablet/laptop upward
         ====================================================== */}

      <section className="hidden border-b bg-white sm:block">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Continue Shopping */}

          <Link
            href="/books"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          {/* Wishlist Heading */}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                My Wishlist
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {items.length}{" "}
                {items.length === 1
                  ? "book"
                  : "books"}{" "}
                saved
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
         ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {items.length === 0 ? (
          /* ==================================================
             EMPTY WISHLIST
             ================================================== */

          <div className="rounded-2xl border border-dashed bg-white px-5 py-16 text-center sm:px-6 sm:py-20">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <PackageOpen className="h-9 w-9 text-gray-400" />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Save books you love to your
              wishlist and come back to them
              whenever you are ready to buy.
            </p>

            <Link
              href="/books"
              className="mt-7 inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          /* ==================================================
             WISHLIST GRID
             2 columns on mobile
             ================================================== */

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const imageUrl =
                normalizeImageUrl(item.image);

              const hasDiscount =
                typeof item.compareAtPrice ===
                  "number" &&
                item.compareAtPrice >
                  item.price;

              const isRemoving =
                removingId === item.id;

              const isAddingToCart =
                addingToCartId === item.id;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:rounded-2xl"
                >
                  {/* =================================================
                      IMAGE
                     ================================================= */}

                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <Link
                      href={`/books/${item.slug}`}
                      className="block h-full w-full"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PackageOpen className="h-10 w-10 text-gray-300 sm:h-12 sm:w-12" />
                        </div>
                      )}
                    </Link>

                    {/* Remove */}

                    <button
                      type="button"
                      disabled={isRemoving}
                      onClick={() =>
                        removeFromWishlist(
                          item.id,
                          item.title
                        )
                      }
                      aria-label={`Remove ${item.title} from wishlist`}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
                    >
                      <Trash2 className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  {/* =================================================
                      DETAILS
                     ================================================= */}

                  <div className="p-3 sm:p-4">
                    <Link
                      href={`/books/${item.slug}`}
                    >
                      <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-900 transition hover:text-gray-600 sm:min-h-[48px] sm:text-base">
                        {item.title}
                      </h2>
                    </Link>

                    {/* Author */}

                    {item.author && (
                      <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                        by {item.author}
                      </p>
                    )}

                    {/* Price */}

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
                      <span className="text-base font-bold text-gray-900 sm:text-lg">
                        ₹
                        {item.price.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      {hasDiscount && (
                        <span className="text-[11px] text-gray-400 line-through sm:text-sm">
                          ₹
                          {item.compareAtPrice!.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}
                    </div>

                    {/* Stock */}

                    {typeof item.stock ===
                      "number" && (
                      <p
                        className={`mt-1 text-xs font-medium ${
                          item.stock <= 0
                            ? "text-red-600"
                            : item.stock <= 10
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {item.stock <= 0
                          ? "Out of stock"
                          : item.stock <= 10
                          ? `Only ${item.stock} left`
                          : "In stock"}
                      </p>
                    )}

                    {/* Add to Cart */}

                    <button
                      type="button"
                      disabled={
                        isAddingToCart ||
                        (typeof item.stock ===
                          "number" &&
                          item.stock <= 0)
                      }
                      onClick={() =>
                        addToCart(item)
                      }
                      className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-black px-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 sm:mt-4 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

                      <span className="sm:hidden">
                        {item.stock !==
                          undefined &&
                        item.stock <= 0
                          ? "Out"
                          : isAddingToCart
                          ? "..."
                          : "Cart"}
                      </span>

                      <span className="hidden sm:inline">
                        {item.stock !==
                          undefined &&
                        item.stock <= 0
                          ? "Out of Stock"
                          : isAddingToCart
                          ? "Adding..."
                          : "Add to Cart"}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}