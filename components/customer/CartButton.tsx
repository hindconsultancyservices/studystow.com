"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

type CartButtonProps = {
  bookId: string;
  bookSlug?: string;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
};

export default function CartButton({
  bookId,
  bookSlug = "",
  quantity = 1,
  className = "",
  children = "Add to Cart",
}: CartButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAddToCart() {
    if (!bookId || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookId,
          quantity,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        const callbackUrl = bookSlug
          ? `/books/${bookSlug}`
          : "/cart";

        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            callbackUrl
          )}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to add book to cart."
        );
      }

      setMessage("Added to cart.");

      window.dispatchEvent(
        new Event("studystow-cart-updated")
      );

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Cart button error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to add to cart."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={loading || !bookId}
        className={`flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <ShoppingCart className="h-4 w-4" />

        {loading ? "Adding..." : children}
      </button>

      {message && (
        <p className="mt-2 text-center text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}