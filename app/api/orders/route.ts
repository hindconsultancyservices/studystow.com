
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";

import Order from "@/models/Order";
import Book from "@/models/Book";
import Coupon from "@/models/Coupon";

export const dynamic = "force-dynamic";

const orderItemSchema = z.object({
  book: z.string().min(1, "Book ID is required"),
  title: z.string().optional(),
  slug: z.string().optional(),
  quantity: z.number().int().min(1),
  price: z.number().min(0).optional(),
  image: z.string().optional().default(""),
});

const addressSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(7),
  addressLine1: z.string().trim().min(3),
  addressLine2: z.string().optional().default(""),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  postalCode: z.string().trim().min(3),
  country: z.string().optional().default("India"),
});

const orderSchema = z.object({
  customer: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),

  // Accepted for compatibility with the existing checkout UI.
  // These amounts are NOT trusted; the server recalculates them.
  subtotal: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  total: z.number().min(0).optional(),

  couponCode: z.string().trim().max(50).optional().default(""),
  paymentMethod: z.enum(["cod", "razorpay"]).default("cod"),
  notes: z.string().max(1000).optional().default(""),
});

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function mapAddress(address: z.infer<typeof addressSchema>) {
  return {
    name: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || "",
    city: address.city,
    state: address.state,
    pincode: address.postalCode,
    country: address.country || "India",
  };
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

/**
 * GET /api/orders
 *
 * Customer access is restricted to the authenticated customer's
 * own orders. Admin order management uses /api/admin/orders.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return jsonError("Please login to view your orders.", 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const requestedCustomer = searchParams.get("customer")?.trim();

    if (
      requestedCustomer &&
      requestedCustomer.toLowerCase() !== userId.toLowerCase()
    ) {
      return jsonError("You can only view your own orders.", 403);
    }

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 20), 1),
      100
    );

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const paymentStatus =
      searchParams.get("paymentStatus")?.trim() || "";

    const filter: Record<string, unknown> = {
      customer: userId,
    };

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        {
          orderNumber: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          "shippingAddress.name": {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          "shippingAddress.phone": {
            $regex: escapedSearch,
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
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return jsonError("Failed to fetch orders.", 500);
  }
}

/**
 * POST /api/orders
 *
 * Prices, shipping, discounts and tax are calculated server-side.
 */
export async function POST(request: NextRequest) {
  const reservedStock: Array<{
    bookId: string;
    quantity: number;
  }> = [];

  let orderCreated = false;

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // The current checkout/cart/address implementation is account-based.
    if (!userId) {
      return jsonError(
        "Please login before placing an order.",
        401
      );
    }

    const body = await request.json();
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data.",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return jsonError("Invalid customer account.", 400);
    }

    if (
      !mongoose.Types.ObjectId.isValid(data.customer) ||
      data.customer.toLowerCase() !== userId.toLowerCase()
    ) {
      return jsonError(
        "Order customer must match your authenticated account.",
        403
      );
    }

    await connectDB();

    const settings = await getStoreSettings();

    if (
      data.paymentMethod === "cod" &&
      !settings.codEnabled
    ) {
      return jsonError(
        "Cash on Delivery is currently disabled.",
        400
      );
    }

    if (
      data.paymentMethod === "razorpay" &&
      (!settings.razorpayEnabled || !settings.razorpayConfigured)
    ) {
      return jsonError(
        "Online payment is currently unavailable.",
        400
      );
    }

    // Combine repeated cart lines for the same book.
    const quantities = new Map<string, number>();

    for (const item of data.items) {
      if (!mongoose.Types.ObjectId.isValid(item.book)) {
        return jsonError("Invalid book ID.", 400);
      }

      quantities.set(
        item.book,
        (quantities.get(item.book) || 0) + item.quantity
      );
    }

    const bookIds = [...quantities.keys()];

    const books = await Book.find({
      _id: { $in: bookIds },
    }).lean();

    if (books.length !== bookIds.length) {
      return jsonError(
        "One or more books were not found.",
        400
      );
    }

    const bookMap = new Map(
      books.map((book) => [String(book._id), book])
    );

    let calculatedSubtotal = 0;

    const verifiedItems = bookIds.map((bookId) => {
      const book = bookMap.get(bookId);

      if (!book) {
        throw new Error(`Book not found: ${bookId}`);
      }

      const quantity = quantities.get(bookId) || 0;
      const price = Number(book.price || 0);
      const stock = Number(book.stock || 0);

      if (quantity <= 0 || stock < quantity) {
        throw new Error(
          `"${book.title}" does not have enough stock. Available: ${stock}.`
        );
      }

      calculatedSubtotal += price * quantity;

      return {
        book: book._id,
        title: book.title,
        quantity,
        price,
        image: book.image || "",
      };
    });

    calculatedSubtotal = roundMoney(calculatedSubtotal);

    // Validate and calculate the coupon on the server.
    let calculatedDiscount = 0;
    let coupon: any = null;

    const couponCode = data.couponCode.trim().toUpperCase();

    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon || !coupon.active) {
        return jsonError(
          "This coupon is invalid or inactive.",
          400
        );
      }

      const now = new Date();

      if (
        now < new Date(coupon.startDate) ||
        now > new Date(coupon.endDate)
      ) {
        return jsonError(
          "This coupon is outside its valid date range.",
          400
        );
      }

      if (
        coupon.usageLimit !== undefined &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        return jsonError(
          "Coupon usage limit has been reached.",
          400
        );
      }

      if (calculatedSubtotal < Number(coupon.minOrderAmount || 0)) {
        return jsonError(
          `Minimum order amount is ₹${coupon.minOrderAmount}.`,
          400
        );
      }

      if (coupon.type === "percentage") {
        calculatedDiscount =
          (calculatedSubtotal * Number(coupon.value)) / 100;

        if (coupon.maxDiscountAmount !== undefined) {
          calculatedDiscount = Math.min(
            calculatedDiscount,
            Number(coupon.maxDiscountAmount)
          );
        }
      } else {
        calculatedDiscount = Number(coupon.value);
      }

      calculatedDiscount = roundMoney(
        Math.min(
          Math.max(calculatedDiscount, 0),
          calculatedSubtotal
        )
      );
    }

    const discountedSubtotal = Math.max(
      calculatedSubtotal - calculatedDiscount,
      0
    );

    // Shipping is determined by persisted settings, not request data.
    let shipping = 0;

    if (settings.shippingEnabled) {
      const qualifiesForFreeShipping =
        settings.freeShippingEnabled &&
        discountedSubtotal >= settings.freeShippingAmount;

      shipping = qualifiesForFreeShipping
        ? 0
        : Math.max(settings.shippingCharge, 0);
    }

    // The configured default GST rate is applied to the discounted
    // subtotal. Product-specific GST rates are not modelled here.
    const tax = settings.gstEnabled
      ? roundMoney(
          discountedSubtotal *
            (Math.max(settings.defaultGstRate, 0) / 100)
        )
      : 0;

    const finalTotal = roundMoney(
      discountedSubtotal + shipping + tax
    );

    if (!Number.isFinite(finalTotal) || finalTotal < 0) {
      return jsonError("Invalid order total.", 400);
    }

    // Generate a unique human-readable order number.
    let orderNumber = "";
    let uniqueOrderNumber = false;

    for (let attempt = 0; attempt < 5; attempt++) {
      const random = Math.floor(
        100000 + Math.random() * 900000
      );

      orderNumber = `ST-${Date.now()
        .toString()
        .slice(-6)}-${random}`;

      if (!(await Order.exists({ orderNumber }))) {
        uniqueOrderNumber = true;
        break;
      }
    }

    if (!uniqueOrderNumber) {
      return jsonError(
        "Unable to generate order number.",
        500
      );
    }

    // Reserve inventory atomically to avoid overselling.
    for (const item of verifiedItems) {
      const result = await Book.updateOne(
        {
          _id: item.book,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        }
      );

      if (result.modifiedCount !== 1) {
        await Promise.all(
          reservedStock.map((reserved) =>
            Book.updateOne(
              { _id: reserved.bookId },
              { $inc: { stock: reserved.quantity } }
            )
          )
        );

        reservedStock.length = 0;

        return jsonError(
          "Stock changed while placing your order. Refresh the cart and try again.",
          409
        );
      }

      reservedStock.push({
        bookId: String(item.book),
        quantity: item.quantity,
      });
    }

    const shippingAddress = mapAddress(data.shippingAddress);

    const billingAddress = data.billingAddress
      ? mapAddress(data.billingAddress)
      : shippingAddress;

    const order = await Order.create({
      orderNumber,
      customer: userId,
      items: verifiedItems,
      shippingAddress,
      billingAddress,

      subtotal: calculatedSubtotal,
      shipping,
      discount: calculatedDiscount,
      tax,
      total: finalTotal,

      paymentMethod: data.paymentMethod,

      // Never accept payment/order status supplied by the browser.
      paymentStatus: "pending",
      orderStatus: "pending",

      notes: data.notes || "",
    });

    orderCreated = true;

    // For COD, count coupon use at order creation. Online payment
    // usage should be finalized when payment is verified.
    if (coupon && data.paymentMethod === "cod") {
      try {
        await Coupon.updateOne(
          {
            _id: coupon._id,
            ...(coupon.usageLimit !== undefined
              ? { usageCount: { $lt: coupon.usageLimit } }
              : {}),
          },
          {
            $inc: { usageCount: 1 },
          }
        );
      } catch (couponError) {
        console.error(
          "Coupon usage update failed after order creation:",
          couponError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        data: {
          ...order.toObject(),
          subtotal: calculatedSubtotal,
          shipping,
          discount: calculatedDiscount,
          tax,
          total: finalTotal,
          couponCode: coupon?.code || "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // If creation failed after reserving stock, release the reservation.
    if (!orderCreated && reservedStock.length > 0) {
      try {
        await connectDB();

        await Promise.all(
          reservedStock.map((reserved) =>
            Book.updateOne(
              { _id: reserved.bookId },
              { $inc: { stock: reserved.quantity } }
            )
          )
        );
      } catch (restoreError) {
        console.error(
          "Failed to restore reserved stock:",
          restoreError
        );
      }
    }

    console.error("POST /api/orders error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create order.";

    return jsonError(message, 500);
  }
}
