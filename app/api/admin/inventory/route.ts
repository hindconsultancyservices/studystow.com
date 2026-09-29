import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Book from "@/models/Book";

type StockStatus =
  | "all"
  | "in-stock"
  | "low-stock"
  | "out-of-stock";

const DEFAULT_LOW_STOCK_LIMIT = 5;
const MAX_LIMIT = 100;

function isAdminSession(session: any) {
  return (
    session?.user?.role === "admin" &&
    Boolean(session.user.id)
  );
}

function parsePositiveInteger(
  value: string | null,
  fallback: number
) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

/*
|--------------------------------------------------------------------------
| GET /api/admin/inventory
|--------------------------------------------------------------------------
|
| Returns real inventory data from Book collection.
|
| Supported query params:
|
| ?search=physics
| ?status=all
| ?status=in-stock
| ?status=low-stock
| ?status=out-of-stock
| ?page=1
| ?limit=20
| ?lowStockLimit=5
|
*/
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminSession(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const requestedStatus =
      searchParams.get("status") || "all";

    const status: StockStatus = [
      "all",
      "in-stock",
      "low-stock",
      "out-of-stock",
    ].includes(requestedStatus)
      ? (requestedStatus as StockStatus)
      : "all";

    const page = parsePositiveInteger(
      searchParams.get("page"),
      1
    );

    const requestedLimit = parsePositiveInteger(
      searchParams.get("limit"),
      20
    );

    const limit = Math.min(
      requestedLimit,
      MAX_LIMIT
    );

    const lowStockLimitRaw = Number(
      searchParams.get("lowStockLimit")
    );

    const lowStockLimit =
      Number.isInteger(lowStockLimitRaw) &&
      lowStockLimitRaw >= 0 &&
      lowStockLimitRaw <= 100000
        ? lowStockLimitRaw
        : DEFAULT_LOW_STOCK_LIMIT;

    /*
    |--------------------------------------------------------------------------
    | Build MongoDB filter
    |--------------------------------------------------------------------------
    */

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          author: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
        {
          isbn: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status === "out-of-stock") {
      filter.stock = 0;
    }

    if (status === "low-stock") {
      filter.stock = {
        $gt: 0,
        $lte: lowStockLimit,
      };
    }

    if (status === "in-stock") {
      filter.stock = {
        $gt: lowStockLimit,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const skip = (page - 1) * limit;

    const [
      books,
      totalProducts,
      totalUnitsResult,
      inventoryValueResult,
      outOfStock,
      lowStock,
      inStock,
    ] = await Promise.all([
      Book.find(filter)
        .select(
          "_id title author sku price compareAtPrice stock image images published featured isbn"
        )
        .sort({
          stock: 1,
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Book.countDocuments(filter),

      Book.aggregate([
        {
          $group: {
            _id: null,
            totalUnits: {
              $sum: "$stock",
            },
          },
        },
      ]),

      Book.aggregate([
        {
          $project: {
            inventoryValue: {
              $multiply: [
                "$stock",
                "$price",
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: "$inventoryValue",
            },
          },
        },
      ]),

      Book.countDocuments({
        stock: 0,
      }),

      Book.countDocuments({
        stock: {
          $gt: 0,
          $lte: lowStockLimit,
        },
      }),

      Book.countDocuments({
        stock: {
          $gt: lowStockLimit,
        },
      }),
    ]);

    const totalUnits =
      totalUnitsResult[0]?.totalUnits ?? 0;

    const inventoryValue =
      inventoryValueResult[0]?.totalValue ?? 0;

    const totalPages =
      Math.ceil(totalProducts / limit);

    return NextResponse.json(
      {
        success: true,

        data: books,

        stats: {
          totalProducts:
            outOfStock +
            lowStock +
            inStock,

          inStock,

          lowStock,

          outOfStock,

          totalUnits,

          inventoryValue,

          lowStockLimit,
        },

        pagination: {
          page,
          limit,
          total: totalProducts,
          totalPages,
          hasNextPage:
            page < totalPages,
          hasPreviousPage:
            page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/admin/inventory error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inventory",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/inventory
|--------------------------------------------------------------------------
|
| Update stock for a book.
|
| Body:
|
| {
|   "sku": "BK001",
|   "stock": 25
| }
|
*/
export async function PATCH(
  request: NextRequest
) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!isAdminSession(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body is required",
        },
        { status: 400 }
      );
    }

    const data = body as Record<
      string,
      unknown
    >;

    /*
    |--------------------------------------------------------------------------
    | Validate SKU
    |--------------------------------------------------------------------------
    */

    const sku =
      typeof data.sku === "string"
        ? data.sku.trim().toUpperCase()
        : "";

    if (!sku) {
      return NextResponse.json(
        {
          success: false,
          message: "Book SKU is required",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate stock
    |--------------------------------------------------------------------------
    */

    const stock = data.stock;

    if (
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stock must be a non-negative whole number",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent unreasonable accidental values
    |--------------------------------------------------------------------------
    */

    if (stock > 1000000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stock value is too large",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find book
    |--------------------------------------------------------------------------
    */

    const book = await Book.findOne({
      sku,
    });

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: `Book with SKU "${sku}" was not found`,
        },
        { status: 404 }
      );
    }

    const previousStock = book.stock;

    /*
    |--------------------------------------------------------------------------
    | Update stock
    |--------------------------------------------------------------------------
    */

    book.stock = stock;

    await book.save();

    return NextResponse.json(
      {
        success: true,

        message: "Inventory updated successfully",

        data: {
          _id: book._id,
          title: book.title,
          sku: book.sku,
          previousStock,
          stock: book.stock,
          price: book.price,
          published: book.published,
          updatedAt: book.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "PATCH /api/admin/inventory error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update inventory",
      },
      { status: 500 }
    );
  }
}