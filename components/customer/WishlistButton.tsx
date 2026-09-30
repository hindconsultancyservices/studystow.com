"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

type WishlistButtonProps = {
  bookId: string;
  bookSlug?: string;
  className?: string;
  showText?: boolean;
};

export default function WishlistButton({
  bookId,
  bookSlug = "",
  className = "",
  showText = true,
}: WishlistButtonProps) {
  const router = useRouter();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkWishlist() {
      try {
        const response = await fetch("/api/wishlist", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!data?.success || !Array.isArray(data.items)) {
          return;
        }

        const exists = data.items.some(
          (item: { id?: string; _id?: string }) =>
            String(item.id || item._id) === String(bookId)
        );

        if (!cancelled) {
          setIsWishlisted(exists);
        }
      } catch (error) {
        console.error("Failed to check wishlist:", error);
      }
    }

    if (bookId) {
      checkWishlist();
    }

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  async function toggleWishlist() {
    if (!bookId || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: isWishlisted ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            bookSlug ? `/books/${bookSlug}` : "/wishlist"
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

      const newState = !isWishlisted;

      setIsWishlisted(newState);

      window.dispatchEvent(
        new Event("studystow-wishlist-updated")
      );
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={loading || !bookId}
      aria-label={
        isWishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      title={
        isWishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
        isWishlisted
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-gray-300 text-gray-700 hover:bg-gray-50"
      } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Heart
        className={`h-4 w-4 ${
          isWishlisted
            ? "fill-red-500 text-red-500"
            : ""
        }`}
      />

      {showText &&
        (loading
          ? "Updating..."
          : isWishlisted
          ? "Remove from Wishlist"
          : "Add to Wishlist")}
    </button>
  );
}