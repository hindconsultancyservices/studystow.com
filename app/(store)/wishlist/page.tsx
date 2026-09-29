"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Trash2, ArrowLeft, PackageOpen } from "lucide-react";

type WishlistItem = {
  id: string;
  title: string;
  slug: string;
  author?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
};

const WISHLIST_KEY = "studystow-wishlist";
const CART_KEY = "studystow-cart";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  const removeFromWishlist = (id: string) => {
    const updated = items.filter((item) => item.id !== id);

    setItems(updated);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  };

  const addToCart = (item: WishlistItem) => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const cart = savedCart ? JSON.parse(savedCart) : [];

      const existingIndex = cart.findIndex(
        (cartItem: WishlistItem) => cartItem.id === item.id
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity =
          (cart[existingIndex].quantity || 1) + 1;
      } else {
        cart.push({
          ...item,
          quantity: 1,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      alert("Book added to cart");
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  if (!loaded) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="mt-8 h-32 rounded-xl bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/books"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                My Wishlist
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {items.length} {items.length === 1 ? "book" : "books"} saved
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <PackageOpen className="h-9 w-9 text-gray-400" />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Save books you love to your wishlist and come back to them
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <Link href={`/books/${item.slug}`}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PackageOpen className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label={`Remove ${item.title} from wishlist`}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-red-50"
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4">
                  <Link href={`/books/${item.slug}`}>
                    <h2 className="line-clamp-2 min-h-[48px] text-base font-semibold text-gray-900 transition hover:text-gray-600">
                      {item.title}
                    </h2>
                  </Link>

                  {item.author && (
                    <p className="mt-1 truncate text-sm text-gray-500">
                      by {item.author}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>

                    {item.compareAtPrice &&
                      item.compareAtPrice > item.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{item.compareAtPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
