import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Book from "@/models/Book";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const cart = await Cart.findOne({
      user: session.user.id,
    })
      .populate({
        path: "items.book",
        select:
          "title slug author price compareAtPrice stock image published",
      })
      .lean();

    if (!cart) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          subtotal: 0,
          itemCount: 0,
        },
      });
    }

    const items = (cart.items || [])
      .filter((item: any) => item.book)
      .map((item: any) => ({
        id: item._id?.toString(),
        book: item.book._id.toString(),
        title: item.book.title,
        slug: item.book.slug,
        author: item.book.author,
        price: Number(item.book.price),
        compareAtPrice: item.book.compareAtPrice
          ? Number(item.book.compareAtPrice)
          : undefined,
        quantity: Number(item.quantity),
        stock: Number(item.book.stock),
        image: item.book.image || "",
        published: item.book.published,
      }));

    const subtotal = items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const itemCount = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        items,
        subtotal,
        itemCount,
      },
    });
  } catch (error) {
    console.error("GET /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load cart.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const bookId = String(body.bookId || "");
    const quantity = Number(body.quantity || 1);

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          message: "Book ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity.",
        },
        { status: 400 }
      );
    }

    const book = await Book.findById(bookId).lean();

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Book not found.",
        },
        { status: 404 }
      );
    }

    if (!book.published) {
      return NextResponse.json(
        {
          success: false,
          message: "This book is not available.",
        },
        { status: 400 }
      );
    }

    if (book.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${book.stock} item(s) available.`,
        },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({
      user: session.user.id,
    });

    if (!cart) {
      cart = new Cart({
        user: session.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item: any) =>
        item.book.toString() === bookId
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + quantity;

      if (newQuantity > book.stock) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${book.stock} item(s) available.`,
          },
          { status: 400 }
        );
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        book: book._id,
        quantity,
      } as any);
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Book added to cart.",
    });
  } catch (error) {
    console.error("POST /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add item to cart.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const bookId = String(body.bookId || "");
    const quantity = Number(body.quantity);

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          message: "Book ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity.",
        },
        { status: 400 }
      );
    }

    const book = await Book.findById(bookId).lean();

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Book not found.",
        },
        { status: 404 }
      );
    }

    if (quantity > book.stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${book.stock} item(s) available.`,
        },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({
      user: session.user.id,
    });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found.",
        },
        { status: 404 }
      );
    }

    const item = cart.items.find(
      (item: any) =>
        item.book.toString() === bookId
    );

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Item not found in cart.",
        },
        { status: 404 }
      );
    }

    item.quantity = quantity;

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart updated.",
    });
  } catch (error) {
    console.error("PUT /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json().catch(
      () => ({})
    );

    const bookId = body.bookId
      ? String(body.bookId)
      : "";

    const cart = await Cart.findOne({
      user: session.user.id,
    });

    if (!cart) {
      return NextResponse.json({
        success: true,
        message: "Cart is already empty.",
      });
    }

    if (bookId) {
      cart.items = cart.items.filter(
        (item: any) =>
          item.book.toString() !== bookId
      );

      await cart.save();

      return NextResponse.json({
        success: true,
        message: "Item removed from cart.",
      });
    }

    cart.items = [];

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart cleared.",
    });
  } catch (error) {
    console.error("DELETE /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart.",
      },
      { status: 500 }
    );
  }
}