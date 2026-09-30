"use client";

import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max,
  disabled = false,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const increase = () => {
    if (max === undefined || quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300">
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || quantity <= min}
        className="flex h-10 w-10 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="flex h-10 min-w-12 items-center justify-center border-x border-gray-300 px-3 text-sm font-semibold text-gray-900">
        {quantity}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={disabled || (max !== undefined && quantity >= max)}
        className="flex h-10 w-10 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}