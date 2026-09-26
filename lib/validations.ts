import { z } from "zod";

// ============================================================
// COMMON VALIDATIONS
// ============================================================

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address");

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^[6-9]\d{9}$/,
    "Please enter a valid 10-digit Indian mobile number"
  );

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .max(120, "Slug must not exceed 120 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug can contain only lowercase letters, numbers and hyphens"
  );

const objectIdSchema = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Invalid ID"
  );


// ============================================================
// AUTHENTICATION
// ============================================================

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: emailSchema,

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),

  phone: phoneSchema.optional(),

  role: z
    .enum(["customer", "admin"])
    .default("customer"),

  active: z
    .boolean()
    .default(true),
});


export const loginSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "Password is required"),
});


export const forgotPasswordSchema = z.object({
  email: emailSchema,
});


export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, "Reset token is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
});


// ============================================================
// USER
// ============================================================

export const userCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100),

  email: emailSchema,

  password: z
    .string()
    .min(8)
    .max(100),

  phone: phoneSchema.optional(),

  role: z
    .enum(["customer", "admin"])
    .default("customer"),

  active: z
    .boolean()
    .default(true),
});


export const userUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  email: emailSchema.optional(),

  phone: phoneSchema.optional(),

  role: z
    .enum(["customer", "admin"])
    .optional(),

  active: z
    .boolean()
    .optional(),
});


// ============================================================
// CATEGORY
// ============================================================

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required")
    .max(100),

  slug: slugSchema,

  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  image: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  parent: objectIdSchema
    .nullable()
    .optional(),

  featured: z
    .boolean()
    .default(false),

  active: z
    .boolean()
    .default(true),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .default(0),
});


// ============================================================
// BOOK
// ============================================================

export const bookSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Book title is required")
      .max(200),

    slug: slugSchema,

    author: z
      .string()
      .trim()
      .min(2, "Author name is required")
      .max(150),

    description: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .or(z.literal("")),

    category: objectIdSchema,

    price: z
      .number()
      .min(0, "Price cannot be negative"),

    compareAtPrice: z
      .number()
      .min(0)
      .optional(),

    stock: z
      .number()
      .int()
      .min(0, "Stock cannot be negative")
      .default(0),

    sku: z
      .string()
      .trim()
      .min(1)
      .max(100),

    isbn: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal("")),

    image: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    images: z
      .array(z.string().trim())
      .default([]),

    publisher: z
      .string()
      .trim()
      .max(150)
      .optional()
      .or(z.literal("")),

    language: z
      .string()
      .trim()
      .max(50)
      .optional()
      .or(z.literal("")),

    pages: z
      .number()
      .int()
      .min(1)
      .optional(),

    featured: z
      .boolean()
      .default(false),

    published: z
      .boolean()
      .default(true),
  })
  .refine(
    (data) =>
      data.compareAtPrice === undefined ||
      data.compareAtPrice >= data.price,
    {
      message:
        "Compare-at price must be greater than or equal to the selling price",
      path: ["compareAtPrice"],
    }
  );


// ============================================================
// CART ITEM
// ============================================================

export const cartItemSchema = z.object({
  book: objectIdSchema,

  quantity: z
    .number()
    .int()
    .min(1)
    .max(10),
});


// ============================================================
// ADDRESS
// ============================================================

export const addressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100),

  phone: phoneSchema,

  addressLine1: z
    .string()
    .trim()
    .min(5)
    .max(200),

  addressLine2: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .min(2)
    .max(100),

  state: z
    .string()
    .trim()
    .min(2)
    .max(100),

  pincode: z
    .string()
    .trim()
    .regex(
      /^\d{6}$/,
      "Please enter a valid 6-digit pincode"
    ),

  country: z
    .string()
    .trim()
    .default("India"),
});


// ============================================================
// ORDER
// ============================================================

export const orderSchema = z.object({
  customer: objectIdSchema.optional(),

  items: z
    .array(
      z.object({
        book: objectIdSchema,

        title: z
          .string()
          .trim()
          .min(1),

        quantity: z
          .number()
          .int()
          .min(1)
          .max(10),

        price: z
          .number()
          .min(0),

        image: z
          .string()
          .optional()
          .or(z.literal("")),
      })
    )
    .min(1, "Order must contain at least one item"),

  shippingAddress: addressSchema,

  billingAddress: addressSchema.optional(),

  subtotal: z
    .number()
    .min(0),

  shipping: z
    .number()
    .min(0)
    .default(0),

  discount: z
    .number()
    .min(0)
    .default(0),

  tax: z
    .number()
    .min(0)
    .default(0),

  total: z
    .number()
    .min(0),

  paymentMethod: z
    .enum(["cod", "razorpay"]),

  paymentStatus: z
    .enum([
      "pending",
      "paid",
      "failed",
      "refunded",
    ])
    .default("pending"),

  orderStatus: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .default("pending"),

  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),
});


// ============================================================
// ORDER STATUS UPDATE
// ============================================================

export const orderStatusUpdateSchema = z.object({
  orderStatus: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),

  paymentStatus: z
    .enum([
      "pending",
      "paid",
      "failed",
      "refunded",
    ])
    .optional(),

  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),
});


// ============================================================
// PAYMENT
// ============================================================

export const createPaymentSchema = z.object({
  orderId: objectIdSchema,
});


export const verifyPaymentSchema = z.object({
  razorpayOrderId: z
    .string()
    .min(1),

  razorpayPaymentId: z
    .string()
    .min(1),

  razorpaySignature: z
    .string()
    .min(1),

  orderId: objectIdSchema,
});


// ============================================================
// PAGE / CMS
// ============================================================

export const pageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2)
    .max(200),

  slug: slugSchema,

  content: z
    .string()
    .min(1, "Page content is required"),

  excerpt: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  featuredImage: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  metaTitle: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("")),

  metaDescription: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  status: z
    .enum(["draft", "published"])
    .default("draft"),

  featured: z
    .boolean()
    .default(false),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .default(0),
});


// ============================================================
// CONTACT FORM
// ============================================================

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  email: emailSchema,

  subject: z
    .string()
    .trim()
    .min(2, "Subject is required")
    .max(200),

  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must not exceed 5000 characters"),
});


// ============================================================
// COUPON
// ============================================================

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(30),

  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  discountType: z
    .enum(["percentage", "fixed"]),

  discountValue: z
    .number()
    .min(0),

  minimumOrderAmount: z
    .number()
    .min(0)
    .default(0),

  maximumDiscount: z
    .number()
    .min(0)
    .optional(),

  usageLimit: z
    .number()
    .int()
    .min(1)
    .optional(),

  expiresAt: z
    .coerce
    .date()
    .optional(),

  active: z
    .boolean()
    .default(true),
});


// ============================================================
// SEARCH
// ============================================================

export const searchSchema = z.object({
  search: z
    .string()
    .trim()
    .max(200)
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(12),
});


// ============================================================
// PAGINATION
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(12),
});


// ============================================================
// TYPE EXPORTS
// ============================================================

export type RegisterInput =
  z.infer<typeof registerSchema>;

export type LoginInput =
  z.infer<typeof loginSchema>;

export type UserCreateInput =
  z.infer<typeof userCreateSchema>;

export type CategoryInput =
  z.infer<typeof categorySchema>;

export type BookInput =
  z.infer<typeof bookSchema>;

export type AddressInput =
  z.infer<typeof addressSchema>;

export type OrderInput =
  z.infer<typeof orderSchema>;

export type ContactInput =
  z.infer<typeof contactSchema>;

export type PageInput =
  z.infer<typeof pageSchema>;

export type CouponInput =
  z.infer<typeof couponSchema>;

export type PaginationInput =
  z.infer<typeof paginationSchema>;
