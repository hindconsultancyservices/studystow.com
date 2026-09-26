import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create a URL-friendly slug.
 */
export function slugify(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Convert a string to title case.
 */
export function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
}

/**
 * Truncate text without cutting unnecessarily.
 */
export function truncate(value: string, length: number): string {
  if (value.length <= length) return value;
  return `${value.slice(0, Math.max(0, length - 3)).trim()}...`;
}

/**
 * Format INR currency.
 */
export function formatCurrency(
  amount: number,
  currency = "INR"
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Alias for price formatting.
 */
export function formatPrice(amount: number): string {
  return formatCurrency(amount, "INR");
}

/**
 * Calculate discount percentage.
 */
export function calculateDiscount(
  originalPrice: number,
  sellingPrice: number
): number {
  if (originalPrice <= 0 || sellingPrice >= originalPrice) {
    return 0;
  }

  return Math.round(
    ((originalPrice - sellingPrice) / originalPrice) * 100
  );
}

/**
 * Calculate discount amount.
 */
export function calculateDiscountAmount(
  originalPrice: number,
  sellingPrice: number
): number {
  return Math.max(0, originalPrice - sellingPrice);
}

/**
 * Calculate cart subtotal.
 */
export function calculateSubtotal(
  items: Array<{
    price: number;
    quantity: number;
  }>
): number {
  return items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

/**
 * Calculate total quantity in cart.
 */
export function calculateCartQuantity(
  items: Array<{
    quantity: number;
  }>
): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calculate order total.
 */
export function calculateOrderTotal(
  subtotal: number,
  shipping = 0,
  discount = 0,
  tax = 0
): number {
  return Math.max(
    0,
    subtotal + shipping + tax - discount
  );
}

/**
 * Calculate shipping charge.
 */
export function calculateShipping(
  subtotal: number,
  freeShippingThreshold = 999,
  shippingCharge = 59
): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= freeShippingThreshold) return 0;

  return shippingCharge;
}

/**
 * Round monetary values to two decimal places.
 */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate pagination values.
 */
export function getPagination(
  page: number,
  limit: number,
  total: number
) {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.max(1, Math.floor(limit));
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const currentPage = Math.min(safePage, totalPages);
  const skip = (currentPage - 1) * safeLimit;

  return {
    page: currentPage,
    limit: safeLimit,
    skip,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Format a date for display.
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(parsedDate);
}

/**
 * Format date and time.
 */
export function formatDateTime(
  date: Date | string | number
): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

/**
 * Generate a unique order number.
 */
export function generateOrderNumber(): string {
  const now = new Date();

  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `ST-${datePart}-${randomPart}`;
}

/**
 * Check whether a value is empty.
 */
export function isEmpty(
  value: unknown
): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Safely parse JSON.
 */
export function safeJsonParse<T>(
  value: string,
  fallback: T
): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check whether a string is a valid email.
 */
export function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}

/**
 * Check whether a string is a valid phone number.
 */
export function isValidPhone(
  phone: string
): boolean {
  return /^[6-9]\d{9}$/.test(
    phone.replace(/\s+/g, "")
  );
}

/**
 * Check whether a value is a valid MongoDB ObjectId.
 */
export function isValidObjectId(
  value: string
): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

/**
 * Sleep helper.
 */
export function sleep(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );
}
