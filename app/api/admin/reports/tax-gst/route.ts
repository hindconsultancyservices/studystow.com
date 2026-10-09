
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

function getAmount(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function isPaidOrder(order: any): boolean {
  return order.paymentStatus === "paid";
}

function getOrderAmounts(order: any) {
  return {
    subtotal: roundMoney(getAmount(order.subtotal)),
    discount: roundMoney(getAmount(order.discount)),
    shipping: roundMoney(getAmount(order.shipping)),
    tax: roundMoney(getAmount(order.tax)),
    total: roundMoney(getAmount(order.total)),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") || "20", 10) || 20
      )
    );

    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"), true);
    const search = searchParams.get("search")?.trim();
    const paymentStatus = searchParams
      .get("status")
      ?.trim()
      .toLowerCase();

    const orderStatus = searchParams
      .get("orderStatus")
      ?.trim()
      .toLowerCase();

    if (from === null || to === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date. Use YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        {
          success: false,
          message: "Start date cannot be after end date.",
        },
        { status: 400 }
      );
    }

    const filter: Record<string, any> = {};

    if (from || to) {
      filter.createdAt = {};

      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    if (paymentStatus && paymentStatus !== "all") {
      const allowedStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded",
      ];

      if (!allowedStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment status.",
          },
          { status: 400 }
        );
      }

      filter.paymentStatus = paymentStatus;
    }

    if (orderStatus && orderStatus !== "all") {
      const allowedOrderStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedOrderStatuses.includes(orderStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid order status.",
          },
          { status: 400 }
        );
      }

      filter.orderStatus = orderStatus;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { orderNumber: regex },
        { razorpayOrderId: regex },
        { razorpayPaymentId: regex },
        { "shippingAddress.name": regex },
        { "shippingAddress.phone": regex },
        { "shippingAddress.pincode": regex },
      ];
    }

    const [orders, totalRecords, paidOrders] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),

      Order.find({
        ...filter,
        paymentStatus: "paid",
      })
        .select(
          "orderNumber subtotal discount shipping tax total paymentStatus orderStatus paymentMethod createdAt"
        )
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    let paidOrderCount = 0;
    let taxableSales = 0;
    let totalTax = 0;
    let paidShipping = 0;
    let paidDiscount = 0;
    let paidOrderValue = 0;

    for (const order of paidOrders as any[]) {
      const amounts = getOrderAmounts(order);

      paidOrderCount++;
      taxableSales += Math.max(0, amounts.subtotal - amounts.discount);
      totalTax += amounts.tax;
      paidShipping += amounts.shipping;
      paidDiscount += amounts.discount;
      paidOrderValue += amounts.total;
    }

    const data = (orders as any[]).map((order) => {
      const amounts = getOrderAmounts(order);

      return {
        id: String(order._id),
        orderNumber: order.orderNumber,
        date: order.createdAt ?? null,

        customer: {
          name: order.shippingAddress?.name ?? "",
          phone: order.shippingAddress?.phone ?? "",
          city: order.shippingAddress?.city ?? "",
          state: order.shippingAddress?.state ?? "",
          pincode: order.shippingAddress?.pincode ?? "",
          country: order.shippingAddress?.country ?? "",
        },

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,

        subtotal: amounts.subtotal,
        discount: amounts.discount,
        shipping: amounts.shipping,
        tax: amounts.tax,
        total: amounts.total,

        // The Order schema stores one tax amount, not separate GST components.
        cgst: null,
        sgst: null,
        igst: null,
        gstBreakdownAvailable: false,

        currency: "INR",
        includedInPaidSummary: isPaidOrder(order),
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "GST report fetched successfully.",
        data,

        summary: {
          paidOrderCount,
          taxableSales: roundMoney(taxableSales),
          totalTax: roundMoney(totalTax),
          paidShipping: roundMoney(paidShipping),
          paidDiscount: roundMoney(paidDiscount),
          paidOrderValue: roundMoney(paidOrderValue),

          // Separate GST components cannot be determined from Order.tax alone.
          cgst: null,
          sgst: null,
          igst: null,
          gstBreakdownAvailable: false,

          currency: "INR",
        },

        pagination: {
          page,
          limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
          hasNextPage: page * limit < totalRecords,
          hasPreviousPage: page > 1,
        },

        filters: {
          from: searchParams.get("from") || null,
          to: searchParams.get("to") || null,
          status: paymentStatus || "all",
          orderStatus: orderStatus || "all",
          search: search || "",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[GST_REPORT_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch GST report.",
      },
      { status: 500 }
    );
  }
}
