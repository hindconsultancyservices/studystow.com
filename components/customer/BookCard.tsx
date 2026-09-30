"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type CartItemProps = {
  item: {
    book: {
      id?: string;
      _id?: string;
      title: string;
      slug: string;
      author?: string;
      image?: string;
      price: number;
    };
    quantity: number;
  };
  onUpdate?: () => void;
  onRemove?: () => void;
};

export default function CartItem({
  item,
  onUpdate,
  onRemove,
}: CartItemProps) {
  const [loading, setLoading] = useState(false);

  const bookId = String(item.book.id || item.book._id || "");
  const total = Number(item.book.price || 0) * item.quantity;

  async function updateQuantity(quantity: number) {
    if (!bookId || quantity < 1 || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart.");
      }

      window.dispatchEvent(new Event("studystow-cart-updated"));
      onUpdate?.();
    } catch (error) {
      console.error("Cart update error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem() {
    if (!bookId || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item.");
      }

      window.dispatchEvent(new Event("studystow-cart-updated"));
      onRemove?.();
    } catch (error) {
      console.error("Remove cart item error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4 border-b border-gray-200 py-5">
      <Link
        href={`/books/${item.book.slug}`}
        className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100"
      >
        {item.book.image ? (
          <Image
            src={item.book.image}
            alt={item.book.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/books/${item.book.slug}`}
          className="line-clamp-2 font-semibold text-gray-900 hover:text-gray-600"
        >
          {item.book.title}
        </Link>

        {item.book.author && (
          <p className="mt-1 text-sm text-gray-500">
            {item.book.author}
          </p>
        )}

        <p className="mt-2 font-semibold text-gray-900">
          ₹{Number(item.book.price).toLocaleString("en-IN")}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              type="button"
              disabled={loading || item.quantity <= 1}
              onClick={() => updateQuantity(item.quantity - 1)}
              className="p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="min-w-10 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <button
              type="button"
              disabled={loading}
              onClick={() => updateQuantity(item.quantity + 1)}
              className="p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">
              ₹{total.toLocaleString("en-IN")}
            </span>

            <button
              type="button"
              disabled={loading}
              onClick={removeItem}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              aria-label="Remove item"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}