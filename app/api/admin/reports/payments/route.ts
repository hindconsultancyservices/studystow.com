import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDate(value: string | null, endOfDay = false) {
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

function normalizeStatus(value: unknown): string {
  return String(value ?? "unknown").trim().toLowerCase();
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

    const search = searchParams.get("search")?.trim();
    const paymentStatus = searchParams.get("status")?.trim().toLowerCase();
    const paymentMethod = searchParams
      .get("method")
      ?.trim()
      .toLowerCase();

    const from = getDate(searchParams.get("from"));
    const to = getDate(searchParams.get("to"), true);

    if (from === null || to === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date filter.",
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
      filter.paymentStatus = new RegExp(
        `^${escapeRegex(paymentStatus)}$`,
        "i"
      );
    }

    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = new RegExp(
        `^${escapeRegex(paymentMethod)}$`,
        "i"
      );
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { orderNumber: regex },
        { paymentId: regex },
        { razorpayPaymentId: regex },
        { transactionId: regex },
        { paymentMethod: regex },
      ];
    }

    const [orders, totalRecords, summaryOrders] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),

      Order.find(filter)
        .select(
          "totalAmount total paymentStatus paymentMethod paymentId razorpayPaymentId transactionId createdAt"
        )
        .lean(),
    ]);

    let totalPayments = 0;
    let successfulPayments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;
    let refundedPayments = 0;

    let successfulAmount = 0;
    let pendingAmount = 0;
    let failedAmount = 0;
    let refundedAmount = 0;

    const methodTotals: Record<
      string,
      { count: number; amount: number }
    > = {};

    for (const order of summaryOrders as any[]) {
      const status = normalizeStatus(order.paymentStatus);
      const method = String(order.paymentMethod ?? "unknown");
      const amount = getAmount(order.totalAmount ?? order.total);

      totalPayments++;

      if (!methodTotals[method]) {
        methodTotals[method] = { count: 0, amount: 0 };
      }

      methodTotals[method].count++;
      methodTotals[method].amount += amount;

      if (
        ["paid", "completed", "success", "successful"].includes(status)
      ) {
        successfulPayments++;
        successfulAmount += amount;
      } else if (
        ["pending", "processing", "created", "authorized"].includes(status)
      ) {
        pendingPayments++;
        pendingAmount += amount;
      } else if (
        ["failed", "failure"].includes(status)
      ) {
        failedPayments++;
        failedAmount += amount;
      } else if (
        ["refunded", "partially_refunded"].includes(status)
      ) {
        refundedPayments++;
        refundedAmount += amount;
      }
    }

    const payments = (orders as any[]).map((order) => {
      const status = normalizeStatus(order.paymentStatus);

      return {
        id: String(order._id),
        orderNumber: order.orderNumber ?? String(order._id),
        paymentId:
          order.paymentId ??
          order.razorpayPaymentId ??
          order.transactionId ??
          "",
        paymentMethod: order.paymentMethod ?? "unknown",
        paymentStatus: status,
        amount: getAmount(order.totalAmount ?? order.total),
        currency: order.currency ?? "INR",
        date: order.createdAt ?? null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payments report fetched successfully.",
        data: payments,
        summary: {
          totalPayments,
          successfulPayments,
          pendingPayments,
          failedPayments,
          refundedPayments,
          successfulAmount,
          pendingAmount,
          failedAmount,
          refundedAmount,
          methodTotals,
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
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[PAYMENTS_REPORT_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payments report.",
      },
      { status: 500 }
    );
  }
}
