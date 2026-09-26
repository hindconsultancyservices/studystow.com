// ============================================================
// STUDYSTOW - GLOBAL CONSTANTS
// ============================================================

/**
 * Site information
 */
export const SITE_NAME = "StudyStow";

export const SITE_DESCRIPTION =
  "Buy books online at StudyStow. Discover books across multiple categories and get them delivered to your doorstep.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@studystow.com";

export const SUPPORT_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 99999 99999";

export const DEFAULT_COUNTRY = "India";


// ============================================================
// CURRENCY
// ============================================================

export const CURRENCY = "INR";

export const CURRENCY_SYMBOL = "₹";

export const DEFAULT_LOCALE = "en-IN";


// ============================================================
// USER ROLES
// ============================================================

export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

export type UserRole =
  (typeof USER_ROLES)[keyof typeof USER_ROLES];


// ============================================================
// ORDER STATUS
// ============================================================

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];


// ============================================================
// PAYMENT STATUS
// ============================================================

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];


// ============================================================
// PAYMENT METHODS
// ============================================================

export const PAYMENT_METHODS = {
  COD: "cod",
  RAZORPAY: "razorpay",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];


// ============================================================
// BOOK STATUS
// ============================================================

export const BOOK_STATUS = {
  PUBLISHED: "published",
  DRAFT: "draft",
} as const;

export type BookStatus =
  (typeof BOOK_STATUS)[keyof typeof BOOK_STATUS];


// ============================================================
// PAGE STATUS
// ============================================================

export const PAGE_STATUS = {
  PUBLISHED: "published",
  DRAFT: "draft",
} as const;

export type PageStatus =
  (typeof PAGE_STATUS)[keyof typeof PAGE_STATUS];


// ============================================================
// PRODUCT CATEGORIES
// ============================================================

export const BOOK_CATEGORIES = [
  {
    name: "Self Help",
    slug: "self-help",
  },
  {
    name: "Finance",
    slug: "finance",
  },
  {
    name: "Productivity",
    slug: "productivity",
  },
  {
    name: "Fiction",
    slug: "fiction",
  },
  {
    name: "Business",
    slug: "business",
  },
  {
    name: "Spirituality",
    slug: "spirituality",
  },
] as const;


// ============================================================
// PAGINATION
// ============================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;


// ============================================================
// SHIPPING
// ============================================================

export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 999,
  STANDARD_CHARGE: 79,
  ESTIMATED_MIN_DAYS: 3,
  ESTIMATED_MAX_DAYS: 7,
} as const;


// ============================================================
// CART
// ============================================================

export const CART = {
  STORAGE_KEY: "studystow-cart",
  MAX_QUANTITY_PER_ITEM: 10,
} as const;


// ============================================================
// WISHLIST
// ============================================================

export const WISHLIST = {
  STORAGE_KEY: "studystow-wishlist",
} as const;


// ============================================================
// COUPONS
// ============================================================

export const COUPON = {
  MIN_CODE_LENGTH: 3,
  MAX_CODE_LENGTH: 30,
} as const;


// ============================================================
// ORDER
// ============================================================

export const ORDER = {
  ORDER_NUMBER_PREFIX: "STW",
  MAX_ITEMS_PER_ORDER: 50,
} as const;


// ============================================================
// VALIDATION
// ============================================================

export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,

  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,

  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,

  BOOK_TITLE_MAX_LENGTH: 200,
  BOOK_DESCRIPTION_MAX_LENGTH: 5000,

  CATEGORY_NAME_MAX_LENGTH: 100,
  SLUG_MAX_LENGTH: 120,
} as const;


// ============================================================
// CONTACT
// ============================================================

export const CONTACT_SUBJECTS = [
  {
    value: "order",
    label: "Order Related",
  },
  {
    value: "payment",
    label: "Payment Related",
  },
  {
    value: "shipping",
    label: "Shipping & Delivery",
  },
  {
    value: "return",
    label: "Return & Refund",
  },
  {
    value: "product",
    label: "Product Related",
  },
  {
    value: "account",
    label: "Account Related",
  },
  {
    value: "other",
    label: "Other",
  },
] as const;


// ============================================================
// NAVIGATION
// ============================================================

export const STORE_NAVIGATION = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Books",
    href: "/books",
  },
  {
    label: "Categories",
    href: "/category",
  },
  {
    label: "Wishlist",
    href: "/wishlist",
  },
] as const;


// ============================================================
// ADMIN NAVIGATION
// ============================================================

export const ADMIN_NAVIGATION = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Books",
    href: "/admin/books",
  },
  {
    label: "Orders",
    href: "/admin/orders",
  },
  {
    label: "Customers",
    href: "/admin/customers",
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
  },
  {
    label: "Categories",
    href: "/admin/categories",
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
  },
  {
    label: "Pages",
    href: "/admin/pages",
  },
  {
    label: "Reviews",
    href: "/admin/review",
  },
] as const;


// ============================================================
// API
// ============================================================

export const API_ROUTES = {
  BOOKS: "/api/books",
  CATEGORIES: "/api/categories",
  ORDERS: "/api/orders",
  USERS: "/api/users",
  PAYMENTS: "/api/payments",
  PAGES: "/api/pages",
  CONTACT: "/api/contact",
} as const;


// ============================================================
// HTTP / API MESSAGES
// ============================================================

export const API_MESSAGES = {
  SUCCESS: "Request successful",
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",

  INVALID_REQUEST: "Invalid request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource already exists",
  VALIDATION_FAILED: "Validation failed",
  INTERNAL_ERROR: "Internal server error",
} as const;


// ============================================================
// LOCAL STORAGE
// ============================================================

export const STORAGE_KEYS = {
  CART: "studystow-cart",
  WISHLIST: "studystow-wishlist",
} as const;


// ============================================================
// CACHE / REVALIDATION
// ============================================================

export const REVALIDATE = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
} as const;


// ============================================================
// REGEX
// ============================================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  PHONE: /^[6-9]\d{9}$/,

  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  PINCODE: /^\d{6}$/,
} as const;
