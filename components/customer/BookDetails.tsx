"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

type Category = {
  name: string;
  slug: string;
};

type Book = {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: Category;
  price: number;
  originalPrice: number;
  stock: number;
  isbn: string;
  publisher: string;
  language: string;
  pages: number;
  description: string;
  image?: string;
  images?: string[];
};

type CartItem = {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  image?: string;
  quantity: number;
};

type BookDetailsProps = {
  book: Book;
};

const WISHLIST_KEY = "studystow-wishlist";
const CART_KEY = "studystow-cart";

export default function BookDetails({
  book,
}: BookDetailsProps) {
  const [quantity, setQuantity] = useState(1);

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [cartMessage, setCartMessage] =
    useState("");

  const [wishlistMessage, setWishlistMessage] =
    useState("");

  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem(WISHLIST_KEY);

      if (!savedWishlist) return;

      const wishlist = JSON.parse(savedWishlist);

      if (Array.isArray(wishlist)) {
        setIsWishlisted(
          wishlist.some(
            (item: { id: string }) =>
              item.id === book.id
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );
    }
  }, [book.id]);

  function addToCart() {
    try {
      const savedCart =
        localStorage.getItem(CART_KEY);

      const cart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : [];

      const existingIndex = cart.findIndex(
        (item) => item.id === book.id
      );

      if (existingIndex >= 0) {
        const newQuantity =
          cart[existingIndex].quantity + quantity;

        cart[existingIndex].quantity = Math.min(
          newQuantity,
          book.stock
        );

        cart[existingIndex].price = book.price;
        cart[existingIndex].originalPrice =
          book.originalPrice;
        cart[existingIndex].stock = book.stock;
        cart[existingIndex].image = book.image;
      } else {
        cart.push({
          id: book.id,
          title: book.title,
          slug: book.slug,
          author: book.author,
          category: book.category.name,
          price: book.price,
          originalPrice: book.originalPrice,
          stock: book.stock,
          image: book.image,
          quantity,
        });
      }

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );

      setCartMessage(
        `${quantity} ${
          quantity === 1 ? "copy" : "copies"
        } added to cart.`
      );

      setTimeout(() => {
        setCartMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Failed to add book to cart:",
        error
      );
    }
  }

  function toggleWishlist() {
    try {
      const savedWishlist =
        localStorage.getItem(WISHLIST_KEY);

      const wishlist = savedWishlist
        ? JSON.parse(savedWishlist)
        : [];

      if (!Array.isArray(wishlist)) return;

      const exists = wishlist.some(
        (item: { id: string }) =>
          item.id === book.id
      );

      let updatedWishlist;

      if (exists) {
        updatedWishlist = wishlist.filter(
          (item: { id: string }) =>
            item.id !== book.id
        );

        setIsWishlisted(false);
        setWishlistMessage(
          "Removed from wishlist."
        );
      } else {
        updatedWishlist = [
          ...wishlist,
          {
            id: book.id,
            title: book.title,
            slug: book.slug,
            author: book.author,
            price: book.price,
            compareAtPrice:
              book.originalPrice,
            image: book.image,
          },
        ];

        setIsWishlisted(true);
        setWishlistMessage(
          "Added to wishlist."
        );
      }

      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(updatedWishlist)
      );

      setTimeout(() => {
        setWishlistMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Failed to update wishlist:",
        error
      );
    }
  }

  function buyNow() {
    try {
      const savedCart =
        localStorage.getItem(CART_KEY);

      const cart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : [];

      const existingIndex = cart.findIndex(
        (item) => item.id === book.id
      );

      const cartBook: CartItem = {
        id: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author,
        category: book.category.name,
        price: book.price,
        originalPrice: book.originalPrice,
        stock: book.stock,
        image: book.image,
        quantity,
      };

      if (existingIndex >= 0) {
        cart[existingIndex] = cartBook;
      } else {
        cart.push(cartBook);
      }

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );

      window.location.href = "/checkout";
    } catch (error) {
      console.error(
        "Failed to process Buy Now:",
        error
      );
    }
  }

  const discount =
    book.originalPrice > book.price
      ? Math.round(
          ((book.originalPrice - book.price) /
            book.originalPrice) *
            100
        )
      : 0;

  const galleryImages = [
    ...(book.image ? [book.image] : []),
    ...(book.images || []),
  ].filter(Boolean);

  return (
    <>
      {/* Product Section */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Book Image */}
        <div>
          <div className="flex min-h-[480px] items-center justify-center overflow-hidden rounded-2xl border bg-gray-50 p-8">
            {book.image ? (
              <img
                src={book.image}
                alt={book.title}
                className="max-h-[430px] max-w-full rounded-lg object-contain shadow-lg"
              />
            ) : (
              <div className="flex h-[380px] w-[270px] items-center justify-center rounded-lg bg-gray-200 text-7xl shadow-lg">
                📚
              </div>
            )}
          </div>

          {/* Additional Images */}
          {galleryImages.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {galleryImages.map(
                (image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50"
                  >
                    <img
                      src={image}
                      alt={`${book.title} ${
                        index + 1
                      }`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div>
          <Link
            href={`/category/${book.category.slug}`}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            {book.category.name}
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {book.title}
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            by{" "}
            <span className="font-medium text-gray-900">
              {book.author}
            </span>
          </p>

          {/* Price */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ₹
              {book.price.toLocaleString(
                "en-IN"
              )}
            </span>

            {book.originalPrice >
              book.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹
                  {book.originalPrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

                {discount > 0 && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    {discount}% OFF
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mt-5">
            {book.stock > 0 ? (
              <p className="text-sm font-medium text-green-600">
                ✓ In Stock ({book.stock} available)
              </p>
            ) : (
              <p className="text-sm font-medium text-red-600">
                Out of Stock
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-7">
            <label className="block text-sm font-semibold text-gray-900">
              Quantity
            </label>

            <div className="mt-2 flex h-11 w-fit items-center overflow-hidden rounded-lg border border-gray-300">
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.max(1, value - 1)
                  )
                }
                disabled={quantity <= 1}
                className="flex h-full w-11 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="flex h-full w-12 items-center justify-center border-x text-sm font-semibold text-gray-900">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(
                      book.stock,
                      value + 1
                    )
                  )
                }
                disabled={
                  book.stock <= 0 ||
                  quantity >= book.stock
                }
                className="flex h-full w-11 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {cartMessage && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {cartMessage}
            </div>
          )}

          {wishlistMessage && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              {wishlistMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={book.stock <= 0}
              onClick={addToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-900 px-6 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>

            <button
              type="button"
              disabled={book.stock <= 0}
              onClick={buyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={toggleWishlist}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition ${
              isWishlisted
                ? "border-red-200 bg-red-50 text-red-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : ""
              }`}
            />

            {isWishlisted
              ? "Remove from Wishlist"
              : "Add to Wishlist"}
          </button>

          {/* Delivery */}
          <div className="mt-8 rounded-xl border bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">
              Delivery Information
            </h2>

            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <div className="flex gap-3">
                <Truck className="h-5 w-5 shrink-0 text-gray-600" />
                <span>
                  Free delivery on eligible orders
                </span>
              </div>

              <div className="flex gap-3">
                <RotateCcw className="h-5 w-5 shrink-0 text-gray-600" />
                <span>
                  Easy returns within the applicable
                  return period
                </span>
              </div>

              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-gray-600" />
                <span>
                  Secure payment at checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="mt-12 border-t pt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          About This Book
        </h2>

        <p className="mt-4 max-w-4xl leading-7 text-gray-600">
          {book.description ||
            "No description available."}
        </p>
      </section>

      {/* Book Details */}
      <section className="mt-10 border-t pt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Book Details
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Author", book.author],
            ["Category", book.category.name],
            ["ISBN", book.isbn || "Not available"],
            [
              "Publisher",
              book.publisher || "Not available",
            ],
            ["Language", book.language],
            [
              "Pages",
              book.pages
                ? String(book.pages)
                : "Not available",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border p-5"
            >
              <p className="text-sm text-gray-500">
                {label}
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-10 border-t pt-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Reviews
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Reviews will appear here after they
            are submitted and approved.
          </p>
        </div>

        <div className="mt-6 rounded-xl border p-6">
          <p className="text-sm leading-6 text-gray-600">
            No reviews available for this book yet.
          </p>
        </div>
      </section>

      {/* Back */}
      <div className="mt-10 border-t pt-8">
        <Link
          href="/books"
          className="text-sm font-semibold text-gray-900 hover:underline"
        >
          ← Continue Shopping
        </Link>
      </div>
    </>
  );
}