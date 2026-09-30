import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Book from "@/models/Book";
import Coupon from "@/models/Coupon";

const orderItemSchema = z.object({
  book: z.string().min(1, "Book ID is required"),
  title: z.string().min(1, "Book title is required"),
  slug: z.string().min(1, "Book slug is required"),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  image: z.string().optional().default(""),
});

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(3, "Postal code is required"),
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
  tax: z.number().min(0),
  total: z.number().min(0),

  couponCode: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default(""),

  paymentMethod: z
    .enum(["cod", "razorpay"])
    .default("cod"),

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
    .max(1000)
    .optional()
    .default(""),
});

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

// ============================================================
// GET /api/orders
// ============================================================

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") || 20),
        1
      ),
      100
    );

    const search =
      searchParams.get("search")?.trim() || "";

    const customer =
      searchParams.get("customer")?.trim() || "";

    const status =
      searchParams.get("status")?.trim() || "";

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
          "shippingAddress.name": {
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
        .populate(
          "customer",
          "name email phone"
        )
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
    console.error(
      "GET /api/orders error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/orders
// ============================================================

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validation =
      orderSchema.safeParse(body);

    if (!validation.success) {
      console.error(
        "Order validation error:",
        validation.error.flatten()
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data",
          errors:
            validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // --------------------------------------------------------
    // GET BOOKS FROM DATABASE
    // --------------------------------------------------------

    const bookIds = data.items.map(
      (item) => item.book
    );

    const books = await Book.find({
      _id: { $in: bookIds },
    }).lean();

    if (books.length !== bookIds.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more books were not found.",
        },
        { status: 400 }
      );
    }

    const bookMap = new Map(
      books.map((book) => [
        String(book._id),
        book,
      ])
    );

    // --------------------------------------------------------
    // VERIFY PRICE + STOCK
    // --------------------------------------------------------

    let calculatedSubtotal = 0;

    const verifiedItems = data.items.map(
      (item) => {
        const book = bookMap.get(item.book);

        if (!book) {
          throw new Error(
            `Book not found: ${item.book}`
          );
        }

        const quantity = item.quantity;
        const price = Number(book.price || 0);
        const stock = Number(book.stock || 0);

        if (stock < quantity) {
          throw new Error(
            `"${book.title}" has only ${stock} item(s) in stock.`
          );
        }

        calculatedSubtotal +=
          price * quantity;

        return {
          book: book._id,
          title: book.title,
          quantity,
          price,
          image: book.image || "",
        };
      }
    );

    calculatedSubtotal =
      Math.round(
        calculatedSubtotal * 100
      ) / 100;

    // --------------------------------------------------------
    // SHIPPING + TAX
    // --------------------------------------------------------

    const shipping = Number(data.shipping || 0);
    const tax = Number(data.tax || 0);

    // --------------------------------------------------------
    // COUPON
    // --------------------------------------------------------

    let calculatedDiscount = 0;
    let coupon = null;

    if (data.couponCode) {
      coupon = await Coupon.findOne({
        code: data.couponCode
          .trim()
          .toUpperCase(),
      });

      if (!coupon) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid coupon code.",
          },
          { status: 400 }
        );
      }

      const now = new Date();

      if (!coupon.active) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This coupon is inactive.",
          },
          { status: 400 }
        );
      }

      if (
        now < new Date(coupon.startDate)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This coupon is not active yet.",
          },
          { status: 400 }
        );
      }

      if (
        now > new Date(coupon.endDate)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This coupon has expired.",
          },
          { status: 400 }
        );
      }

      if (
        coupon.usageLimit !==
          undefined &&
        coupon.usageCount >=
          coupon.usageLimit
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Coupon usage limit has been reached.",
          },
          { status: 400 }
        );
      }

      if (
        calculatedSubtotal <
        coupon.minOrderAmount
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
          },
          { status: 400 }
        );
      }

      if (coupon.type === "percentage") {
        calculatedDiscount =
          (calculatedSubtotal *
            coupon.value) /
          100;

        if (
          coupon.maxDiscountAmount !==
            undefined &&
          calculatedDiscount >
            coupon.maxDiscountAmount
        ) {
          calculatedDiscount =
            coupon.maxDiscountAmount;
        }
      } else {
        calculatedDiscount =
          coupon.value;
      }

      calculatedDiscount = Math.min(
        calculatedDiscount,
        calculatedSubtotal
      );

      calculatedDiscount =
        Math.round(
          calculatedDiscount * 100
        ) / 100;
    }

    // --------------------------------------------------------
    // FINAL TOTAL
    // --------------------------------------------------------

    const calculatedTotal =
      calculatedSubtotal +
      shipping +
      tax -
      calculatedDiscount;

    if (calculatedTotal < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order total.",
        },
        { status: 400 }
      );
    }

    const finalTotal =
      Math.round(
        calculatedTotal * 100
      ) / 100;

    // --------------------------------------------------------
    // ORDER NUMBER
    // --------------------------------------------------------

    let orderNumber = "";
    let uniqueOrderNumber = false;

    for (let attempt = 0; attempt < 5; attempt++) {
      const random = Math.floor(
        100000 +
          Math.random() * 900000
      );

      orderNumber = `ST-${Date.now()
        .toString()
        .slice(-6)}-${random}`;

      const exists =
        await Order.exists({
          orderNumber,
        });

      if (!exists) {
        uniqueOrderNumber = true;
        break;
      }
    }

    if (!uniqueOrderNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to generate order number.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------------
    // MAP ADDRESS TO ORDER SCHEMA
    // --------------------------------------------------------

    const shippingAddress =
      mapAddress(data.shippingAddress);

    const billingAddress =
      data.billingAddress
        ? mapAddress(data.billingAddress)
        : shippingAddress;

    // --------------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------------

    const order = await Order.create({
      orderNumber,

      customer: data.customer,

      items: verifiedItems,

      shippingAddress,

      billingAddress,

      subtotal: calculatedSubtotal,

      shipping,

      discount: calculatedDiscount,

      tax,

      total: finalTotal,

      paymentMethod:
        data.paymentMethod,

      paymentStatus:
        data.paymentStatus,

      orderStatus:
        data.orderStatus,

      notes: data.notes || "",
    });

    // --------------------------------------------------------
    // REDUCE STOCK
    // --------------------------------------------------------

    for (const item of verifiedItems) {
      const result =
        await Book.updateOne(
          {
            _id: item.book,
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          }
        );

      if (result.modifiedCount === 0) {
        console.error(
          `Stock update failed for book ${item.book}`
        );
      }
    }

    // --------------------------------------------------------
    // COUPON USAGE
    // --------------------------------------------------------

    if (
      coupon &&
      data.paymentMethod === "cod"
    ) {
      await Coupon.updateOne(
        {
          _id: coupon._id,

          ...(coupon.usageLimit !==
            undefined && {
            usageCount: {
              $lt: coupon.usageLimit,
            },
          }),
        },
        {
          $inc: {
            usageCount: 1,
          },
        }
      );
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Order created successfully.",

        data: {
          ...order.toObject(),

          subtotal:
            calculatedSubtotal,

          discount:
            calculatedDiscount,

          total:
            finalTotal,

          couponCode:
            coupon?.code || "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/orders error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create order.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}