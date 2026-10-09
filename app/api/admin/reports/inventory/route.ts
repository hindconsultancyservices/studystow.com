import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getNumericValue(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
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
    const category = searchParams.get("category")?.trim();
    const stockStatus = searchParams.get("stockStatus")?.trim().toLowerCase();

    const filter: Record<string, any> = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { title: regex },
        { name: regex },
        { isbn: regex },
        { sku: regex },
        { slug: regex },
      ];
    }

    if (category && category.toLowerCase() !== "all") {
      filter.category = category;
    }

    if (stockStatus && stockStatus !== "all") {
      switch (stockStatus) {
        case "in-stock":
          filter.stock = { $gt: 0 };
          break;

        case "out-of-stock":
          filter.stock = { $lte: 0 };
          break;

        case "low-stock":
          filter.stock = { $gt: 0, $lte: 10 };
          break;

        default:
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid stockStatus. Use all, in-stock, low-stock, or out-of-stock.",
            },
            { status: 400 }
          );
      }
    }

    const [books, totalRecords, allBooks, categories] = await Promise.all([
      Book.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Book.countDocuments(filter),

      Book.find({})
        .select("title name stock quantity price costPrice category sku isbn")
        .lean(),

      Book.distinct("category"),
    ]);

    let totalProducts = allBooks.length;
    let totalUnits = 0;
    let totalInventoryValue = 0;
    let totalCostValue = 0;
    let inStockProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    for (const book of allBooks as any[]) {
      const stock = Math.max(
        0,
        getNumericValue(book.stock ?? book.quantity)
      );

      const price = Math.max(0, getNumericValue(book.price));
      const costPrice = Math.max(0, getNumericValue(book.costPrice));

      totalUnits += stock;
      totalInventoryValue += stock * price;
      totalCostValue += stock * costPrice;

      if (stock <= 0) {
        outOfStockProducts++;
      } else if (stock <= 10) {
        lowStockProducts++;
      } else {
        inStockProducts++;
      }
    }

    const inventory = (books as any[]).map((book) => {
      const stock = Math.max(
        0,
        getNumericValue(book.stock ?? book.quantity)
      );

      const price = Math.max(0, getNumericValue(book.price));
      const costPrice = Math.max(0, getNumericValue(book.costPrice));

      let status = "in-stock";

      if (stock <= 0) {
        status = "out-of-stock";
      } else if (stock <= 10) {
        status = "low-stock";
      }

      return {
        id: String(book._id),
        title: book.title ?? book.name ?? "",
        sku: book.sku ?? "",
        isbn: book.isbn ?? "",
        category:
          typeof book.category === "string"
            ? book.category
            : book.category?.name ?? "",
        stock,
        price,
        costPrice,
        inventoryValue: stock * price,
        costValue: stock * costPrice,
        status,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inventory report fetched successfully.",
        data: inventory,
        summary: {
          totalProducts,
          totalUnits,
          inStockProducts,
          lowStockProducts,
          outOfStockProducts,
          totalInventoryValue,
          totalCostValue,
          currency: "INR",
        },
        categories: categories
          .map((item: any) =>
            typeof item === "string" ? item : item?.name
          )
          .filter(Boolean)
          .sort((a: string, b: string) => a.localeCompare(b)),
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
    console.error("[INVENTORY_REPORT_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inventory report.",
      },
      { status: 500 }
    );
  }
}
