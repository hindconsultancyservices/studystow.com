import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Book from "@/models/Book";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("analytics", "view");

    if (!auth.ok) {
      return auth.response;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30";

    const days =
      range === "today"
        ? 1
        : range === "7"
          ? 7
          : range === "90"
            ? 90
            : range === "12m"
              ? 365
              : 30;

    const start = new Date();
    start.setDate(start.getDate() - days);

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - days);

    const cancelledOrderStatus = "cancelled" as const;

    const dateFilter = {
      createdAt: { $gte: start },
      orderStatus: { $ne: cancelledOrderStatus },
    } as const;

    const previousDateFilter = {
      createdAt: {
        $gte: previousStart,
        $lt: start,
      },
      orderStatus: { $ne: cancelledOrderStatus },
    } as const;

    const [
      revenueResult,
      previousRevenueResult,
      orderCount,
      previousOrderCount,
      customerCount,
      previousCustomerCount,
      booksSoldResult,
      topBooks,
      categoryPerformance,
      orderStatuses,
      paymentMethods,
      recentOrders,
      lowStock,
      inventoryStats,
      refundedResult,
      discountResult,
    ] = await Promise.all([
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),

      Order.aggregate([
        { $match: previousDateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),

      Order.countDocuments(dateFilter),

      Order.countDocuments(previousDateFilter),

      User.countDocuments({
        role: "customer",
        createdAt: { $gte: start },
      }),

      User.countDocuments({
        role: "customer",
        createdAt: {
          $gte: previousStart,
          $lt: start,
        },
      }),

      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            quantity: { $sum: "$items.quantity" },
          },
        },
      ]),

      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.book",
            sold: { $sum: "$items.quantity" },
            revenue: {
              $sum: {
                $multiply: [
                  "$items.quantity",
                  "$items.price",
                ],
              },
            },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "book",
          },
        },
        { $unwind: "$book" },
        {
          $project: {
            _id: 0,
            title: "$book.title",
            sold: 1,
            revenue: 1,
            stock: "$book.stock",
          },
        },
      ]),

      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "books",
            localField: "items.book",
            foreignField: "_id",
            as: "book",
          },
        },
        { $unwind: "$book" },
        {
          $lookup: {
            from: "categories",
            localField: "book.category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $group: {
            _id: "$category._id",
            name: { $first: "$category.name" },
            sales: { $sum: "$items.quantity" },
            revenue: {
              $sum: {
                $multiply: [
                  "$items.quantity",
                  "$items.price",
                ],
              },
            },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$paymentMethod",
            orders: { $sum: 1 },
            amount: { $sum: "$total" },
          },
        },
      ]),

      Order.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("customer", "name email")
        .lean(),

      Book.find({ stock: { $lte: 10 } })
        .sort({ stock: 1 })
        .limit(10)
        .select("title stock")
        .lean(),

      Book.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalUnits: { $sum: "$stock" },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$stock", 0] },
                      { $lte: ["$stock", 10] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            outOfStock: {
              $sum: {
                $cond: [
                  { $eq: ["$stock", 0] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start },
            paymentStatus: "refunded",
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            amount: { $sum: "$discount" },
          },
        },
      ]),
    ]);

    const revenue = revenueResult[0]?.total || 0;
    const previousRevenue =
      previousRevenueResult[0]?.total || 0;

    const booksSold =
      booksSoldResult[0]?.quantity || 0;

    const averageOrderValue =
      orderCount > 0 ? revenue / orderCount : 0;

    const revenueChange =
      previousRevenue > 0
        ? ((revenue - previousRevenue) /
            previousRevenue) *
          100
        : 0;

    const orderChange =
      previousOrderCount > 0
        ? ((orderCount - previousOrderCount) /
            previousOrderCount) *
          100
        : 0;

    const customerChange =
      previousCustomerCount > 0
        ? ((customerCount - previousCustomerCount) /
            previousCustomerCount) *
          100
        : 0;

    const totalCategoryRevenue =
      categoryPerformance.reduce(
        (sum: number, item: any) =>
          sum + Number(item.revenue || 0),
        0
      );

    return NextResponse.json({
      success: true,
      data: {
        range,
        metrics: {
          revenue,
          orders: orderCount,
          customers: customerCount,
          averageOrderValue,
          booksSold,
          revenueChange,
          orderChange,
          customerChange,
        },

        orderStatuses: orderStatuses.map((item: any) => ({
          name: item._id,
          count: item.count,
          percentage:
            orderCount > 0
              ? Math.round(
                  (item.count / orderCount) * 100
                )
              : 0,
        })),

        topBooks,

        categories: categoryPerformance.map(
          (item: any) => ({
            name: item.name,
            sales: item.sales,
            revenue: item.revenue,
            percentage:
              totalCategoryRevenue > 0
                ? Math.round(
                    (item.revenue /
                      totalCategoryRevenue) *
                      100
                  )
                : 0,
          })
        ),

        paymentMethods,

        recentOrders: recentOrders.map(
          (order: any) => ({
            id: order.orderNumber,
            customer:
              order.customer?.name ||
              order.customer?.email ||
              "Guest",
            amount: order.total,
            status: order.orderStatus,
            payment: order.paymentMethod,
            createdAt: order.createdAt,
          })
        ),

        inventory: {
          ...inventoryStats[0],
          lowStockItems: lowStock,
        },

        refunds: {
          amount: refundedResult[0]?.amount || 0,
          orders: refundedResult[0]?.orders || 0,
        },

        discounts: {
          amount: discountResult[0]?.amount || 0,
        },

        unavailable: [
          "trafficSources",
          "devices",
          "pageViews",
          "conversionRate",
        ],
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load analytics",
      },
      { status: 500 }
    );
  }
}