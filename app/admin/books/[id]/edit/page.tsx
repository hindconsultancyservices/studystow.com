"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Category = {
  _id: string;
  name: string;
  slug: string;
  active?: boolean;
};

type Book = {
  _id: string;
  title: string;
  slug: string;
  author: string;
  description?: string;

  category:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
      };

  price: number;
  compareAtPrice?: number;

  stock: number;
  sku: string;
  isbn?: string;

  image?: string;
  images?: string[];

  publisher?: string;
  language?: string;
  pages?: number;

  featured: boolean;
  published: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();

  const sku = useMemo(() => {
    const value = params?.id;

    if (Array.isArray(value)) {
      return decodeURIComponent(value[0] || "")
        .trim()
        .toUpperCase();
    }

    return decodeURIComponent(String(value || ""))
      .trim()
      .toUpperCase();
  }, [params]);

  const [book, setBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");

  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");

  const [stock, setStock] = useState("");
  const [bookSku, setBookSku] = useState("");
  const [isbn, setIsbn] = useState("");

  const [image, setImage] = useState("");
  const [imagesText, setImagesText] = useState("");

  const [publisher, setPublisher] = useState("");
  const [language, setLanguage] = useState("English");
  const [pages, setPages] = useState("");

  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  /* -----------------------------------------
     LOAD BOOK + CATEGORIES
  ----------------------------------------- */

  useEffect(() => {
    if (!sku) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [bookResponse, categoriesResponse] =
          await Promise.all([
            fetch(`/api/books/${encodeURIComponent(sku)}`, {
              cache: "no-store",
            }),
            fetch("/api/categories?active=true", {
              cache: "no-store",
            }),
          ]);

        const bookResult: ApiResponse<Book> =
          await bookResponse.json();

        const categoriesResult: ApiResponse<Category[]> =
          await categoriesResponse.json();

        if (!bookResponse.ok || !bookResult.success) {
          throw new Error(
            bookResult.message || "Failed to load book"
          );
        }

        if (
          !categoriesResponse.ok ||
          !categoriesResult.success
        ) {
          throw new Error(
            categoriesResult.message ||
              "Failed to load categories"
          );
        }

        if (!bookResult.data) {
          throw new Error("Book data was not returned");
        }

        const loadedBook = bookResult.data;

        setBook(loadedBook);

        setTitle(loadedBook.title || "");
        setSlug(loadedBook.slug || "");
        setAuthor(loadedBook.author || "");
        setDescription(loadedBook.description || "");

        if (typeof loadedBook.category === "string") {
          setCategory(loadedBook.category);
        } else {
          setCategory(loadedBook.category?._id || "");
        }

        setPrice(
          loadedBook.price !== undefined
            ? String(loadedBook.price)
            : ""
        );

        setCompareAtPrice(
          loadedBook.compareAtPrice !== undefined
            ? String(loadedBook.compareAtPrice)
            : ""
        );

        setStock(
          loadedBook.stock !== undefined
            ? String(loadedBook.stock)
            : "0"
        );

        setBookSku(loadedBook.sku || "");
        setIsbn(loadedBook.isbn || "");

        setImage(loadedBook.image || "");

        setImagesText(
          Array.isArray(loadedBook.images)
            ? loadedBook.images.join("\n")
            : ""
        );

        setPublisher(loadedBook.publisher || "");
        setLanguage(loadedBook.language || "English");

        setPages(
          loadedBook.pages !== undefined
            ? String(loadedBook.pages)
            : ""
        );

        setFeatured(Boolean(loadedBook.featured));
        setPublished(
          loadedBook.published === undefined
            ? true
            : Boolean(loadedBook.published)
        );

        setCategories(
          Array.isArray(categoriesResult.data)
            ? categoriesResult.data
            : []
        );
      } catch (err) {
        console.error("Edit book load error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load book"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sku]);

  /* -----------------------------------------
     SLUG GENERATOR
  ----------------------------------------- */

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);

    /*
      Only auto-update slug when it is still
      matching the previous title pattern.
      User can manually edit slug afterwards.
    */
    if (!book) {
      setSlug(generateSlug(value));
      return;
    }

    const oldGeneratedSlug = generateSlug(book.title);

    if (!slug || slug === oldGeneratedSlug) {
      setSlug(generateSlug(value));
    }
  };

  /* -----------------------------------------
     SUBMIT
  ----------------------------------------- */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanTitle = title.trim();
    const cleanSlug = slug.trim().toLowerCase();
    const cleanAuthor = author.trim();
    const cleanSku = bookSku.trim().toUpperCase();

    if (!cleanTitle) {
      setError("Book title is required.");
      return;
    }

    if (!cleanSlug) {
      setError("Book slug is required.");
      return;
    }

    if (!cleanAuthor) {
      setError("Author is required.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!cleanSku) {
      setError("SKU is required.");
      return;
    }

    if (Number(stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    const parsedPrice = Number(price);
    const parsedCompareAtPrice =
      compareAtPrice.trim() === ""
        ? undefined
        : Number(compareAtPrice);

    const parsedStock = Number(stock);

    const parsedPages =
      pages.trim() === ""
        ? undefined
        : Number(pages);

    if (
      parsedCompareAtPrice !== undefined &&
      (Number.isNaN(parsedCompareAtPrice) ||
        parsedCompareAtPrice < 0)
    ) {
      setError("Compare-at price is invalid.");
      return;
    }

    if (
      parsedPages !== undefined &&
      (!Number.isInteger(parsedPages) ||
        parsedPages < 1)
    ) {
      setError("Pages must be a positive whole number.");
      return;
    }

    const images = imagesText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: cleanTitle,
      slug: cleanSlug,
      author: cleanAuthor,
      description: description.trim(),

      category,

      price: parsedPrice,
      compareAtPrice: parsedCompareAtPrice,

      stock: parsedStock,
      sku: cleanSku,
      isbn: isbn.trim(),

      image: image.trim(),
      images,

      publisher: publisher.trim(),
      language: language.trim() || "English",
      pages: parsedPages,

      featured,
      published,
    };

    try {
      setSaving(true);

      const response = await fetch(
        `/api/books/${encodeURIComponent(sku)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result: ApiResponse<Book> =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update book"
        );
      }

      setSuccess("Book updated successfully.");

      if (result.data) {
        setBook(result.data);
      }

      /*
        Small delay so user can see success message,
        then return to books list.
      */
      setTimeout(() => {
        router.push("/admin/books");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error("Update book error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update book"
      );
    } finally {
      setSaving(false);
    }
  };

  /* -----------------------------------------
     LOADING
  ----------------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-200" />

            <div className="mt-6 h-8 w-64 rounded bg-gray-200" />

            <div className="mt-8 space-y-6">
              <div className="h-32 rounded-xl bg-gray-200" />
              <div className="h-32 rounded-xl bg-gray-200" />
              <div className="h-32 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* -----------------------------------------
     ERROR / NOT FOUND
  ----------------------------------------- */

  if (!book) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/admin/books"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Books
          </Link>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-semibold text-red-800">
              Unable to load book
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error || "The requested book was not found."}
            </p>

            <Link
              href="/admin/books"
              className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Back to Books
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* -----------------------------------------
     FORM
  ----------------------------------------- */

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-8">
          <Link
            href="/admin/books"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Books
          </Link>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Book
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update the book information and save changes.
              </p>
            </div>

            <div className="rounded-lg border bg-white px-4 py-2">
              <p className="text-xs text-gray-500">
                SKU
              </p>

              <p className="font-mono text-sm font-semibold text-gray-900">
                {book.sku}
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* BASIC INFORMATION */}

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Main information displayed to customers.
              </p>
            </div>

            <div className="grid gap-6 p-6">
              {/* TITLE */}

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Book Title *
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    handleTitleChange(event.target.value)
                  }
                  required
                  maxLength={200}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Enter book title"
                />
              </div>

              {/* SLUG */}

              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Slug *
                </label>

                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(
                      generateSlug(event.target.value)
                    )
                  }
                  required
                  maxLength={120}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="book-slug"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Example: atomic-habits
                </p>
              </div>

              {/* AUTHOR */}

              <div>
                <label
                  htmlFor="author"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Author *
                </label>

                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(event) =>
                    setAuthor(event.target.value)
                  }
                  required
                  maxLength={150}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Author name"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category *
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No active categories found. Create an
                    active category before changing this book.
                  </p>
                )}
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={6}
                  maxLength={5000}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Write book description..."
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {description.length}/5000
                </p>
              </div>
            </div>
          </section>

          {/* PRICING & INVENTORY */}

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Pricing & Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Price, stock and product identification.
              </p>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              {/* PRICE */}

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Price (₹) *
                </label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="499"
                />
              </div>

              {/* COMPARE PRICE */}

              <div>
                <label
                  htmlFor="compareAtPrice"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Compare-at Price (₹)
                </label>

                <input
                  id="compareAtPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(event) =>
                    setCompareAtPrice(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="699"
                />
              </div>

              {/* STOCK */}

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Stock *
                </label>

                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(event) =>
                    setStock(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="50"
                />
              </div>

              {/* SKU */}

              <div>
                <label
                  htmlFor="sku"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  SKU *
                </label>

                <input
                  id="sku"
                  type="text"
                  value={bookSku}
                  onChange={(event) =>
                    setBookSku(
                      event.target.value.toUpperCase()
                    )
                  }
                  required
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm uppercase outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="BK001"
                />

                <p className="mt-1 text-xs text-gray-500">
                  SKU should remain unique.
                </p>
              </div>

              {/* ISBN */}

              <div className="sm:col-span-2">
                <label
                  htmlFor="isbn"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  ISBN
                </label>

                <input
                  id="isbn"
                  type="text"
                  value={isbn}
                  onChange={(event) =>
                    setIsbn(event.target.value)
                  }
                  maxLength={30}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="9781234567890"
                />
              </div>
            </div>
          </section>

          {/* MEDIA */}

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Images
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Use public image URLs or your configured
                image storage URLs.
              </p>
            </div>

            <div className="grid gap-6 p-6">
              {/* PRIMARY IMAGE */}

              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Primary Image URL
                </label>

                <input
                  id="image"
                  type="url"
                  value={image}
                  onChange={(event) =>
                    setImage(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="https://example.com/book.jpg"
                />

                {image && (
                  <div className="mt-4 overflow-hidden rounded-lg border bg-gray-50">
                    <img
                      src={image}
                      alt={title || "Book image"}
                      className="h-48 w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ADDITIONAL IMAGES */}

              <div>
                <label
                  htmlFor="images"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Additional Image URLs
                </label>

                <textarea
                  id="images"
                  value={imagesText}
                  onChange={(event) =>
                    setImagesText(event.target.value)
                  }
                  rows={5}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder={
                    "https://example.com/book-1.jpg\nhttps://example.com/book-2.jpg"
                  }
                />

                <p className="mt-1 text-xs text-gray-500">
                  Put one image URL per line.
                </p>
              </div>
            </div>
          </section>

          {/* PUBLICATION DETAILS */}

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Publication Details
              </h2>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              {/* PUBLISHER */}

              <div>
                <label
                  htmlFor="publisher"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Publisher
                </label>

                <input
                  id="publisher"
                  type="text"
                  value={publisher}
                  onChange={(event) =>
                    setPublisher(event.target.value)
                  }
                  maxLength={150}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Publisher name"
                />
              </div>

              {/* LANGUAGE */}

              <div>
                <label
                  htmlFor="language"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Language
                </label>

                <input
                  id="language"
                  type="text"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                  maxLength={50}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="English"
                />
              </div>

              {/* PAGES */}

              <div>
                <label
                  htmlFor="pages"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Pages
                </label>

                <input
                  id="pages"
                  type="number"
                  min="1"
                  step="1"
                  value={pages}
                  onChange={(event) =>
                    setPages(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="320"
                />
              </div>
            </div>
          </section>

          {/* STATUS */}

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Visibility
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Control how this book appears in the store.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* FEATURED */}

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Featured book
                  </span>

                  <span className="block text-sm text-gray-500">
                    Show this book in featured sections.
                  </span>
                </span>
              </label>

              {/* PUBLISHED */}

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) =>
                    setPublished(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Published
                  </span>

                  <span className="block text-sm text-gray-500">
                    Published books can appear in the
                    customer storefront.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/books"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}