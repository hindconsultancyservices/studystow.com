"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SearchBookActionsProps = {
  bookId: string;
  bookTitle: string;
  stock: number;
};

export default function SearchBookActions({
  bookId,
  bookTitle,
  stock,
}: SearchBookActionsProps) {
  const router = useRouter();

  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAddToCart() {
    if (stock <= 0 || adding) return;

    setAdding(true);
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
          quantity: 1,
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`
        );
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

      setMessage("Added to cart");

      window.setTimeout(() => {
        setMessage("");
      }, 1800);
    } catch (error) {
      console.error(
        "Search page add to cart error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to add book to cart."
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={stock <= 0 || adding}
        aria-label={`Add ${bookTitle} to cart`}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
          stock <= 0
            ? "cursor-not-allowed bg-slate-200 text-slate-400"
            : adding
            ? "cursor-wait bg-[#10182d] text-white"
            : "bg-[#10182d] text-white hover:bg-slate-800"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />

        {stock <= 0
          ? "Out of Stock"
          : adding
          ? "Adding..."
          : "Cart"}
      </button>

      {message && (
        <p
          className={`mt-2 text-center text-[11px] font-medium ${
            message === "Added to cart"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}