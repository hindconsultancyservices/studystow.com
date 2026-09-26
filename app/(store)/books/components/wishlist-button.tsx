"use client";

import { useState } from "react";

interface WishlistButtonProps {
  bookId: string;
  bookTitle: string;
}

export default function WishlistButton({
  bookId,
  bookTitle,
}: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);

  function handleWishlist(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    setSaved((current) => !current);

    // Production me yahan wishlist API call connect karna hai.
    console.log(
      saved
        ? `Removed ${bookId} from wishlist`
        : `Added ${bookId} to wishlist`
    );
  }

  return (
    <button
      type="button"
      aria-label={
        saved
          ? `Remove ${bookTitle} from wishlist`
          : `Add ${bookTitle} to wishlist`
      }
      onClick={handleWishlist}
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-slate-50"
    >
      <svg
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 ${
          saved ? "text-red-500" : "text-slate-600"
        }`}
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
