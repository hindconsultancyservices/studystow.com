"use client";

import Image from "next/image";
import Link from "next/link";

type OrderItemProps = {
  item: {
    book?: {
      id?: string;
      _id?: string;
      title?: string;
      slug?: string;
      author?: string;
      image?: string;
    };
    title?: string;
    author?: string;
    image?: string;
    price: number;
    quantity: number;
    total?: number;
  };
};

export default function OrderItem({ item }: OrderItemProps) {
  const title = item.book?.title || item.title || "Book";
  const author = item.book?.author || item.author || "";
  const image = item.book?.image || item.image || "";
  const slug = item.book?.slug;

  const price = Number(item.price || 0);
  const quantity = Number(item.quantity || 1);
  const total = Number(item.total ?? price * quantity);

  const content = (
    <div className="flex gap-4 border-b border-gray-200 py-5">
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 font-semibold text-gray-900">
          {title}
        </h3>

        {author && (
          <p className="mt-1 text-sm text-gray-500">
            {author}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Qty: {quantity}
          </p>

          <p className="font-semibold text-gray-900">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          ₹{price.toLocaleString("en-IN")} × {quantity}
        </p>
      </div>
    </div>
  );

  if (slug) {
    return (
      <Link
        href={`/books/${slug}`}
        className="block transition hover:bg-gray-50"
      >
        {content}
      </Link>
    );
  }

  return content;
}