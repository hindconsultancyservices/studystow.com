// ============================================================
// STUDYSTOW - COMMON UTILITY FUNCTIONS
// ============================================================

/**
 * Convert any value into a URL-friendly slug.
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


// ============================================================
// STRING HELPERS
// ============================================================

export function capitalize(value: string): string {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}


export function truncate(
  value: string,
  length: number
): string {
  if (!value) return "";

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length).trim()}...`;
}


// ============================================================
// CURRENCY
// ============================================================

export function formatCurrency(
  amount: number,
  currency = "INR"
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}


export function formatPrice(
  amount: number
): string {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}


// ============================================================
// NUMBER HELPERS
// ============================================================

export function roundPrice(
  amount: number,
  decimals = 2
): number {
  const multiplier = Math.pow(10, decimals);

  return Math.round(amount * multiplier) / multiplier;
}


export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}


// ============================================================
// DISCOUNT
// ============================================================

export function calculateDiscountPercentage(
  originalPrice: number,
  salePrice: number
): number {
  if (
    originalPrice <= 0 ||
    salePrice < 0 ||
    salePrice >= originalPrice
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - salePrice) / originalPrice) * 100
  );
}


export function calculateDiscountAmount(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice <= salePrice) {
    return 0;
  }

  return roundPrice(originalPrice - salePrice);
}


// ============================================================
// CART / ORDER TOTALS
// ============================================================

export interface CartItemForCalculation {
  price: number;
  quantity: number;
}


export function calculateSubtotal(
  items: CartItemForCalculation[]
): number {
  return roundPrice(
    items.reduce(
      (total, item) =>
        total + Number(item.price) * Number(item.quantity),
      0
    )
  );
}


export function calculateOrderTotal({
  subtotal,
  shipping = 0,
  discount = 0,
  tax = 0,
}: {
  subtotal: number;
  shipping?: number;
  discount?: number;
  tax?: number;
}): number {
  return roundPrice(
    Math.max(
      0,
      Number(subtotal) +
        Number(shipping) +
        Number(tax) -
        Number(discount)
    )
  );
}


// ============================================================
// SHIPPING
// ============================================================

export function calculateShipping(
  subtotal: number,
  freeShippingThreshold = 999,
  shippingCharge = 79
): number {
  if (subtotal <= 0) {
    return 0;
  }

  return subtotal >= freeShippingThreshold
    ? 0
    : shippingCharge;
}


// ============================================================
// PAGINATION
// ============================================================

export function normalizePage(
  page: number | string | undefined,
  defaultPage = 1
): number {
  const parsed = Number(page);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return defaultPage;
  }

  return Math.floor(parsed);
}


export function normalizeLimit(
  limit: number | string | undefined,
  defaultLimit = 12,
  maxLimit = 100
): number {
  const parsed = Number(limit);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return defaultLimit;
  }

  return Math.min(
    Math.floor(parsed),
    maxLimit
  );
}


export function calculateTotalPages(
  total: number,
  limit: number
): number {
  if (limit <= 0) return 0;

  return Math.ceil(total / limit);
}


export function getPaginationSkip(
  page: number,
  limit: number
): number {
  return Math.max(0, (page - 1) * limit);
}


// ============================================================
// DATE HELPERS
// ============================================================

export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    options || {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
}


export function formatDateTime(
  date: Date | string | number
): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}


// ============================================================
// ORDER NUMBER
// ============================================================

export function generateOrderNumber(
  prefix = "STW"
): string {
  const timestamp = Date.now()
    .toString()
    .slice(-8);

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `${prefix}-${timestamp}-${random}`;
}


// ============================================================
// ID HELPERS
// ============================================================

export function isValidObjectId(
  value: string
): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}


// ============================================================
// EMAIL
// ============================================================

export function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}


// ============================================================
// PHONE
// ============================================================

export function isValidIndianPhone(
  phone: string
): boolean {
  return /^[6-9]\d{9}$/.test(
    phone.replace(/\D/g, "")
  );
}


// ============================================================
// PINCODE
// ============================================================

export function isValidIndianPincode(
  pincode: string
): boolean {
  return /^\d{6}$/.test(
    pincode.trim()
  );
}


// ============================================================
// SAFE JSON PARSE
// ============================================================

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


// ============================================================
// EMPTY VALUE
// ============================================================

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

  return false;
}


// ============================================================
// CLASS NAME HELPER
// ============================================================

export function cn(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes
    .filter(Boolean)
    .join(" ");
}


// ============================================================
// DELAY
// ============================================================

export function sleep(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );
}
