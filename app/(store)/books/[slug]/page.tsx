import Link from "next/link";

type BookPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;

  // Temporary demo data.
  // Production mein yahan MongoDB/API se book fetch hogi.
  const book = {
    id: "BK001",
    title: "Atomic Habits",
    slug,
    author: "James Clear",
    category: "Self Help",
    price: 499,
    originalPrice: 699,
    rating: 4.8,
    reviews: 124,
    stock: 24,
    isbn: "9780735211292",
    publisher: "Avery",
    language: "English",
    pages: 320,
    description:
      "Atomic Habits is a practical guide to building good habits, breaking bad ones, and making small changes that lead to remarkable results.",
  };

  const discount = Math.round(
    ((book.originalPrice - book.price) / book.originalPrice) * 100
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>

          <span>/</span>

          <Link href="/books" className="hover:text-gray-900">
            Books
          </Link>

          <span>/</span>

          <Link
            href={`/category/${book.category
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            className="hover:text-gray-900"
          >
            {book.category}
          </Link>

          <span>/</span>

          <span className="text-gray-900">
            {book.title}
          </span>
        </nav>

        {/* Product Section */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Book Image */}
          <div>
            <div className="flex min-h-[480px] items-center justify-center rounded-2xl border bg-gray-50 p-8">
              <div className="flex h-[380px] w-[270px] items-center justify-center rounded-lg bg-gray-200 text-7xl shadow-lg">
                📚
              </div>
            </div>

            {/* Image thumbnails */}
            <div className="mt-4 flex gap-3">
              <div className="flex h-20 w-16 items-center justify-center rounded-lg border-2 border-gray-900 bg-gray-100 text-2xl">
                📚
              </div>

              <div className="flex h-20 w-16 items-center justify-center rounded-lg border bg-gray-50 text-2xl">
                📖
              </div>

              <div className="flex h-20 w-16 items-center justify-center rounded-lg border bg-gray-50 text-2xl">
                📕
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <Link
              href={`/category/${book.category
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900"
            >
              {book.category}
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

            {/* Rating */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-lg">★</span>

                <span className="font-semibold text-gray-900">
                  {book.rating}
                </span>
              </div>

              <span className="text-gray-300">|</span>

              <span className="text-sm text-gray-500">
                {book.reviews} customer reviews
              </span>
            </div>

            {/* Price */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{book.price.toLocaleString("en-IN")}
              </span>

              <span className="text-lg text-gray-400 line-through">
                ₹{book.originalPrice.toLocaleString("en-IN")}
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                {discount}% OFF
              </span>
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
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-900"
              >
                Quantity
              </label>

              <select
                id="quantity"
                defaultValue="1"
                className="mt-2 w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
              >
                {[1, 2, 3, 4, 5].map((quantity) => (
                  <option key={quantity} value={quantity}>
                    {quantity}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-lg border border-gray-900 px-6 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="flex-1 rounded-lg bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist */}
            <button
              type="button"
              className="mt-3 w-full rounded-lg border px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ♡ Add to Wishlist
            </button>

            {/* Delivery */}
            <div className="mt-8 rounded-xl border bg-gray-50 p-5">
              <h2 className="font-semibold text-gray-900">
                Delivery Information
              </h2>

              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <p>🚚 Free delivery on eligible orders</p>
                <p>↩ Easy returns within the applicable return period</p>
                <p>🔒 Secure payment at checkout</p>
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
            {book.description}
          </p>
        </section>

        {/* Book Details */}
        <section className="mt-10 border-t pt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Book Details
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Author
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {book.author}
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Category
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {book.category}
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                ISBN
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {book.isbn}
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Publisher
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {book.publisher}
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Language
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {book.language}
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">
                Pages
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {book.pages}
              </p>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-10 border-t pt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Customer Reviews
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {book.reviews} reviews for this book
              </p>
            </div>

            <button
              type="button"
              className="w-fit rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Write a Review
            </button>
          </div>

          <div className="mt-6 rounded-xl border p-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">★★★★★</span>

              <span className="font-semibold text-gray-900">
                5.0
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Customer reviews will be loaded from MongoDB in the
              production version.
            </p>
          </div>
        </section>

        {/* Back to Books */}
        <div className="mt-10 border-t pt-8">
          <Link
            href="/books"
            className="text-sm font-semibold text-gray-900 hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
