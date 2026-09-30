"use client";

type LoadingStateProps = {
  message?: string;
  className?: string;
};

export default function LoadingState({
  message = "Loading...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex min-h-[300px] flex-col items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

      <p className="mt-4 text-sm font-medium text-gray-600">
        {message}
      </p>
    </div>
  );
}