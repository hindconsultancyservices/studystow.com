"use client";

import Link from "next/link";
import { PackageOpen } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonHref?: string;
};

export default function EmptyState({
  title = "Nothing here yet",
  message = "There is no data to display.",
  buttonText,
  buttonHref = "/",
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <PackageOpen className="h-7 w-7 text-gray-500" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-500">
        {message}
      </p>

      {buttonText && (
        <Link
          href={buttonHref}
          className="mt-6 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}