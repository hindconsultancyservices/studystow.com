"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Star,
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

type BookDetailsProps = {
  book: Book;
};

type CustomerReview = {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  user?: {
    name?: string;
  };
};

type RatingBreakdown = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export default function BookDetails({
  book,
}: BookDetailsProps) {
  const router = useRouter();

  /*
   * ==========================================================
   * AUTH
   * ==========================================================
   */

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  /*
   * ==========================================================
   * PRODUCT / CART / WISHLIST STATE
   * ==========================================================
   */

  const [quantity, setQuantity] = useState(1);

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [cartMessage, setCartMessage] =
    useState("");

  const [wishlistMessage, setWishlistMessage] =
    useState("");

  const [cartLoading, setCartLoading] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [buyNowLoading, setBuyNowLoading] =
    useState(false);

  /*
   * ==========================================================
   * REVIEW STATE
   * ==========================================================
   */

  const [reviews, setReviews] = useState<
    CustomerReview[]
  >([]);

  const [reviewStats, setReviewStats] =
    useState<{
      total: number;
      averageRating: number;
      ratingBreakdown: RatingBreakdown;
    }>({
      total: 0,
      averageRating: 0,
      ratingBreakdown: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    });

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviewTitle, setReviewTitle] =
    useState("");

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [reviewMessage, setReviewMessage] =
    useState("");

  const [reviewError, setReviewError] =
    useState("");

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  /*
   * ==========================================================
   * CHECK WISHLIST FROM MONGODB
   * ==========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function checkWishlist() {
      try {
        const response = await fetch(
          "/api/wishlist",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          if (!cancelled) {
            setIsWishlisted(false);
          }

          return;
        }

        const data =
          await response.json().catch(
            () => null
          );

        if (
          !response.ok ||
          !data?.success
        ) {
          return;
        }

        const items = Array.isArray(
          data.items
        )
          ? data.items
          : [];

        const exists = items.some(
          (
            item: {
              id?: string;
              _id?: string;
            }
          ) =>
            String(
              item.id || item._id
            ) === String(book.id)
        );

        if (!cancelled) {
          setIsWishlisted(exists);
        }
      } catch (error) {
        console.error(
          "Failed to check wishlist:",
          error
        );
      }
    }

    checkWishlist();

    return () => {
      cancelled = true;
    };
  }, [book.id]);

  /*
   * ==========================================================
   * LOAD REVIEWS FROM MONGODB
   * ==========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setReviewsLoading(true);

      try {
        const response = await fetch(
          `/api/reviews?bookId=${encodeURIComponent(
            book.id
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json().catch(
            () => null
          );

        if (
          !response.ok ||
          !data?.success
        ) {
          if (!cancelled) {
            setReviews([]);
            setReviewStats({
              total: 0,
              averageRating: 0,
              ratingBreakdown: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
              },
            });
          }

          return;
        }

        if (!cancelled) {
          const ratingBreakdown =
            data.stats
              ?.ratingBreakdown || {};

          setReviews(
            Array.isArray(data.data)
              ? data.data
              : []
          );

          setReviewStats({
            total: Number(
              data.stats?.total || 0
            ),

            averageRating: Number(
              data.stats?.averageRating ||
                0
            ),

            ratingBreakdown: {
              1: Number(
                ratingBreakdown[1] || 0
              ),
              2: Number(
                ratingBreakdown[2] || 0
              ),
              3: Number(
                ratingBreakdown[3] || 0
              ),
              4: Number(
                ratingBreakdown[4] || 0
              ),
              5: Number(
                ratingBreakdown[5] || 0
              ),
            },
          });
        }
      } catch (error) {
        console.error(
          "Failed to load reviews:",
          error
        );

        if (!cancelled) {
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [book.id]);

  /*
   * ==========================================================
   * ADD TO CART
   * ==========================================================
   */

  async function addToCart() {
    if (
      book.stock <= 0 ||
      cartLoading ||
      buyNowLoading
    ) {
      return;
    }

    setCartLoading(true);
    setCartMessage("");

    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookId: book.id,
            quantity,
          }),
        }
      );

      const data =
        await response.json().catch(
          () => null
        );

      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            `/books/${book.slug}`
          )}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to add book to cart."
        );
      }

      setCartMessage(
        `${quantity} ${
          quantity === 1
            ? "copy"
            : "copies"
        } added to cart.`
      );

      window.dispatchEvent(
        new Event(
          "studystow-cart-updated"
        )
      );

      setTimeout(() => {
        setCartMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Failed to add book to cart:",
        error
      );

      setCartMessage(
        error instanceof Error
          ? error.message
          : "Unable to add book to cart."
      );

      setTimeout(() => {
        setCartMessage("");
      }, 3000);
    } finally {
      setCartLoading(false);
    }
  }

  /*
   * ==========================================================
   * TOGGLE WISHLIST - MONGODB
   * ==========================================================
   */

  async function toggleWishlist() {
    if (wishlistLoading) {
      return;
    }

    setWishlistLoading(true);
    setWishlistMessage("");

    try {
      /*
       * REMOVE FROM WISHLIST
       */

      if (isWishlisted) {
        const response = await fetch(
          "/api/wishlist",
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              bookId: book.id,
            }),
          }
        );

        const data =
          await response.json().catch(
            () => null
          );

        if (response.status === 401) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(
              `/books/${book.slug}`
            )}`
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to remove from wishlist."
          );
        }

        setIsWishlisted(false);
        setWishlistMessage(
          "Removed from wishlist."
        );
      }

      /*
       * ADD TO WISHLIST
       */

      else {
        const response = await fetch(
          "/api/wishlist",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              bookId: book.id,
            }),
          }
        );

        const data =
          await response.json().catch(
            () => null
          );

        if (response.status === 401) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(
              `/books/${book.slug}`
            )}`
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to add to wishlist."
          );
        }

        setIsWishlisted(true);
        setWishlistMessage(
          "Added to wishlist."
        );
      }

      /*
       * Notify account/header/wishlist
       */

      window.dispatchEvent(
        new Event(
          "studystow-wishlist-updated"
        )
      );

      setTimeout(() => {
        setWishlistMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Failed to update wishlist:",
        error
      );

      setWishlistMessage(
        error instanceof Error
          ? error.message
          : "Unable to update wishlist."
      );

      setTimeout(() => {
        setWishlistMessage("");
      }, 3000);
    } finally {
      setWishlistLoading(false);
    }
  }

  /*
   * ==========================================================
   * BUY NOW
   * ==========================================================
   */

  async function buyNow() {
    if (
      book.stock <= 0 ||
      cartLoading ||
      buyNowLoading
    ) {
      return;
    }

    setBuyNowLoading(true);
    setCartMessage("");

    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookId: book.id,
            quantity,
          }),
        }
      );

      const data =
        await response.json().catch(
          () => null
        );

      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            `/books/${book.slug}`
          )}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to prepare checkout."
        );
      }

      window.dispatchEvent(
        new Event(
          "studystow-cart-updated"
        )
      );

      router.push("/checkout");
    } catch (error) {
      console.error(
        "Failed to process Buy Now:",
        error
      );

      setCartMessage(
        error instanceof Error
          ? error.message
          : "Unable to proceed to checkout."
      );

      setBuyNowLoading(false);

      setTimeout(() => {
        setCartMessage("");
      }, 3000);
    }
  }

  /*
   * ==========================================================
   * SUBMIT REVIEW
   * ==========================================================
   */

  async function submitReview(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setReviewError("");
    setReviewMessage("");

    if (
      sessionStatus === "loading"
    ) {
      return;
    }

    if (!session?.user) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/books/${book.slug}`
        )}`
      );

      return;
    }

    const cleanComment =
      reviewComment.trim();

    const cleanTitle =
      reviewTitle.trim();

    if (!cleanComment) {
      setReviewError(
        "Please write your review."
      );

      return;
    }

    if (
      cleanComment.length < 3
    ) {
      setReviewError(
        "Review must contain at least 3 characters."
      );

      return;
    }

    setReviewLoading(true);

    try {
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookId: book.id,
            rating: reviewRating,
            title: cleanTitle,
            comment: cleanComment,
          }),
        }
      );

      const data =
        await response.json().catch(
          () => null
        );

      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            `/books/${book.slug}`
          )}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to submit review."
        );
      }

      /*
       * New review is pending.
       * It should not appear in public
       * approved reviews immediately.
       */

      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);

      setReviewMessage(
        data?.message ||
          "Review submitted successfully. It will appear after approval."
      );
    } catch (error) {
      console.error(
        "Failed to submit review:",
        error
      );

      setReviewError(
        error instanceof Error
          ? error.message
          : "Unable to submit review."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  /*
   * ==========================================================
   * CALCULATIONS
   * ==========================================================
   */

  const discount =
    book.originalPrice > book.price
      ? Math.round(
          ((book.originalPrice -
            book.price) /
            book.originalPrice) *
            100
        )
      : 0;

  const galleryImages = [
    ...(book.image
      ? [book.image]
      : []),
    ...(book.images || []),
  ].filter(Boolean);

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <>
      {/* ======================================================
          PRODUCT SECTION
          ====================================================== */}

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
                ✓ In Stock (
                {book.stock} available)
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
                  setQuantity(
                    (value) =>
                      Math.max(
                        1,
                        value - 1
                      )
                  )
                }
                disabled={
                  quantity <= 1 ||
                  cartLoading ||
                  buyNowLoading
                }
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
                  setQuantity(
                    (value) =>
                      Math.min(
                        book.stock,
                        value + 1
                      )
                  )
                }
                disabled={
                  book.stock <= 0 ||
                  quantity >= book.stock ||
                  cartLoading ||
                  buyNowLoading
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
              disabled={
                book.stock <= 0 ||
                cartLoading ||
                buyNowLoading
              }
              onClick={addToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-900 px-6 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" />

              {cartLoading
                ? "Adding..."
                : "Add to Cart"}
            </button>

            <button
              type="button"
              disabled={
                book.stock <= 0 ||
                cartLoading ||
                buyNowLoading
              }
              onClick={buyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {buyNowLoading
                ? "Processing..."
                : "Buy Now"}
            </button>
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition ${
              isWishlisted
                ? "border-red-200 bg-red-50 text-red-600"
                : "text-gray-700 hover:bg-gray-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : ""
              }`}
            />

            {wishlistLoading
              ? "Updating..."
              : isWishlisted
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
                  Free delivery on eligible
                  orders
                </span>
              </div>

              <div className="flex gap-3">
                <RotateCcw className="h-5 w-5 shrink-0 text-gray-600" />

                <span>
                  Easy returns within the
                  applicable return period
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

      {/* ======================================================
          DESCRIPTION
          ====================================================== */}

      <section className="mt-12 border-t pt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          About This Book
        </h2>

        <p className="mt-4 max-w-4xl leading-7 text-gray-600">
          {book.description ||
            "No description available."}
        </p>
      </section>

      {/* ======================================================
          BOOK DETAILS
          ====================================================== */}

      <section className="mt-10 border-t pt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Book Details
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Author", book.author],
            [
              "Category",
              book.category.name,
            ],
            [
              "ISBN",
              book.isbn || "Not available",
            ],
            [
              "Publisher",
              book.publisher ||
                "Not available",
            ],
            ["Language", book.language],
            [
              "Pages",
              book.pages
                ? String(book.pages)
                : "Not available",
            ],
          ].map(
            ([label, value]) => (
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
            )
          )}
        </div>
      </section>

      {/* ======================================================
          CUSTOMER REVIEWS
          ====================================================== */}

      <section className="mt-10 border-t pt-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Reviews
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Reviews from customers who have
            shared their experience with this
            book.
          </p>
        </div>

        {/* Rating Summary */}
        <div className="mt-6 grid gap-6 rounded-xl border p-6 md:grid-cols-[220px_1fr]">
          {/* Average */}
          <div className="flex flex-col items-center justify-center border-b pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <p className="text-5xl font-bold text-gray-900">
              {reviewStats.averageRating.toFixed(
                1
              )}
            </p>

            <div className="mt-2 flex">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-5 w-5 ${
                    index <
                    Math.round(
                      reviewStats.averageRating
                    )
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {reviewStats.total}{" "}
              {reviewStats.total === 1
                ? "review"
                : "reviews"}
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(
              (rating) => {
                const count =
                  reviewStats
                    .ratingBreakdown[
                    rating as
                      | 1
                      | 2
                      | 3
                      | 4
                      | 5
                  ];

                const percentage =
                  reviewStats.total > 0
                    ? (count /
                        reviewStats.total) *
                      100
                    : 0;

                return (
                  <div
                    key={rating}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-12 shrink-0 text-gray-600">
                      {rating} star
                    </span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-gray-500">
                      {count}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Write Review */}
        <div className="mt-6 rounded-xl border p-6">
          <h3 className="text-lg font-bold text-gray-900">
            Write a Review
          </h3>

          {sessionStatus ===
          "loading" ? (
            <p className="mt-3 text-sm text-gray-500">
              Checking your account...
            </p>
          ) : session?.user ? (
            <form
              onSubmit={submitReview}
              className="mt-5 space-y-5"
            >
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  Your Rating
                </label>

                <div className="mt-2 flex gap-1">
                  {Array.from({
                    length: 5,
                  }).map(
                    (_, index) => {
                      const rating =
                        index + 1;

                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setReviewRating(
                              rating
                            )
                          }
                          className="rounded p-1 transition hover:bg-gray-100"
                          aria-label={`${rating} star`}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              rating <=
                              reviewRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="review-title"
                  className="block text-sm font-semibold text-gray-900"
                >
                  Review Title
                </label>

                <input
                  id="review-title"
                  type="text"
                  value={reviewTitle}
                  onChange={(event) =>
                    setReviewTitle(
                      event.target.value
                    )
                  }
                  maxLength={150}
                  placeholder="Give your review a title"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                />
              </div>

              {/* Comment */}
              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-sm font-semibold text-gray-900"
                >
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value
                    )
                  }
                  rows={5}
                  maxLength={3000}
                  placeholder="Share your experience with this book"
                  className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                  required
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {reviewComment.length}/3000
                </p>
              </div>

              {/* Error */}
              {reviewError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reviewError}
                </div>
              )}

              {/* Success */}
              {reviewMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {reviewMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  reviewLoading ||
                  !reviewComment.trim()
                }
                className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reviewLoading
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

              <p className="text-xs text-gray-500">
                Your review will be visible
                after admin approval.
              </p>
            </form>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Please login to write a
                review.
              </p>

              <Link
                href={`/login?callbackUrl=${encodeURIComponent(
                  `/books/${book.slug}`
                )}`}
                className="mt-3 inline-block text-sm font-semibold text-gray-900 hover:underline"
              >
                Login to Review
              </Link>
            </div>
          )}
        </div>

        {/* Approved Reviews */}
        <div className="mt-6 space-y-4">
          {reviewsLoading ? (
            <div className="rounded-xl border p-6">
              <p className="text-sm text-gray-500">
                Loading reviews...
              </p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <article
                key={String(
                  review._id
                )}
                className="rounded-xl border p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({
                        length: 5,
                      }).map(
                        (_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index <
                              Number(
                                review.rating ||
                                  0
                              )
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        )
                      )}
                    </div>

                    {review.title && (
                      <h3 className="mt-2 font-semibold text-gray-900">
                        {review.title}
                      </h3>
                    )}
                  </div>

                  <span className="text-xs text-gray-400">
                    {review.createdAt
                      ? new Date(
                          review.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : ""}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {review.comment}
                </p>

                <p className="mt-4 text-sm font-medium text-gray-900">
                  {review.user?.name ||
                    "Customer"}
                </p>

                {review.verifiedPurchase && (
                  <p className="mt-1 text-xs font-medium text-green-600">
                    Verified Purchase
                  </p>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-xl border p-6">
              <p className="text-sm leading-6 text-gray-600">
                No approved reviews
                available for this book
                yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          BACK
          ====================================================== */}

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