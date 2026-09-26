import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Book from "@/models/Book";

const orderItemSchema = z.object({
  book: z.string().min(1, "Book ID is required"),
  title: z.string().min(1, "Book title is required"),
  slug: z.string().min(1, "Book slug is required"),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  image: z.string().optional().default(""),
});

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().optional().default("India"),
});

const orderSchema = z.object({
  customer: z.string().min(1, "Customer ID is required"),

  items: z
    .array(orderItemSchema)
    .min(1, "At least one item is required"),

  shippingAddress: addressSchema,

  billingAddress: addressSchema.optional(),

  subtotal: z.number().min(0),
  shipping: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),

  paymentMethod: z
    .enum(["cod", "razorpay"])
    .default("cod"),

  paymentStatus: z
    .enum(["pending", "paid", "failed", "refunded"])
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

  notes: z.string().max(1000).optional().default(""),
});


// GET /api/orders
//
// Examples:
// /api/orders
// /api/orders?page=1&limit=20
// /api/orders?status=delivered
// /api/orders?paymentStatus=paid
// /api/orders?customer=USER_ID
// /api/orders?search=ORD-1001
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 20), 1),
      100
    );

    const search = searchParams.get("search")?.trim() || "";
    const customer = searchParams.get("customer")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const paymentStatus =
      searchParams.get("paymentStatus")?.trim() || "";

    const filter: Record<string, unknown> = {};

    if (customer) {
      filter.customer = customer;
    }

    if (status) {
      filter.orderStatus = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.$or = [
        {
          orderNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.fullName": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.phone": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}


// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    /*
     * Verify books and calculate item totals from DB.
     * This prevents a client from sending fake prices.
     */
    const bookIds = data.items.map((item) => item.book);

    const books = await Book.find({
      _id: { $in: bookIds },
    }).lean();

    if (books.length !== bookIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more books were not found",
        },
        { status: 400 }
      );
    }

    const bookMap = new Map(
      books.map((book) => [String(book._id), book])
    );

    let calculatedSubtotal = 0;

    const verifiedItems = data.items.map((item) => {
      const book = bookMap.get(item.book);

      if (!book) {
        throw new Error(`Book not found: ${item.book}`);
      }

      const price = Number(book.price);
      const quantity = item.quantity;

      calculatedSubtotal += price * quantity;

      return {
        book: book._id,
        title: book.title,
        slug: book.slug,
        quantity,
        price,
        image: book.image || "",
      };
    });

    /*
     * Calculate total on server.
     */
    const shipping = data.shipping;
    const discount = data.discount;
    const tax = data.tax;

    const calculatedTotal =
      calculatedSubtotal +
      shipping +
      tax -
      discount;

    if (calculatedTotal < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order total",
        },
        { status: 400 }
      );
    }

    /*
     * Generate unique order number.
     */
    let orderNumber = "";

    for (let attempt = 0; attempt < 5; attempt++) {
      const random = Math.floor(
        100000 + Math.random() * 900000
      );

      orderNumber = `ST-${Date.now()
        .toString()
        .slice(-6)}-${random}`;

      const exists = await Order.exists({
        orderNumber,
      });

      if (!exists) {
        break;
      }
    }

    if (!orderNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to generate order number",
        },
        { status: 500 }
      );
    }

    /*
     * Create order.
     */
    const order = await Order.create({
      orderNumber,

      customer: data.customer,

      items: verifiedItems,

      shippingAddress: data.shippingAddress,

      billingAddress:
        data.billingAddress || data.shippingAddress,

      subtotal: calculatedSubtotal,
      shipping,
      discount,
      tax,
      total: calculatedTotal,

      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,

      orderStatus: data.orderStatus,

      notes: data.notes,
    });

    /*
     * Reduce stock after successful order.
     */
    for (const item of verifiedItems) {
      const result = await Book.updateOne(
        {
          _id: item.book,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );

      if (result.modifiedCount === 0) {
        /*
         * Stock race-condition protection.
         * In a high-volume production system this should
         * be handled with a MongoDB transaction.
         */
        console.error(
          `Stock update failed for book ${item.book}`
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
