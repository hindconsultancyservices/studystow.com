"use client";

import { Heart } from "lucide-react";

type WishlistButtonProps = {
  bookTitle: string;
};

export default function WishlistButton({
  bookTitle,
}: WishlistButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Add ${bookTitle} to wishlist`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-slate-50"
    >
      <Heart className="h-4 w-4 text-slate-600" />
    </button>
  );
}