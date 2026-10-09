import type { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import Book from "@/models/Book";
import Category from "@/models/Category";
import Page from "@/models/Page";

const SITE_URL = "https://studystow.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
const staticPages: MetadataRoute.Sitemap = [
{
url: SITE_URL,
changeFrequency: "daily",
priority: 1,
},
{
url: `${SITE_URL}/books`,
changeFrequency: "daily",
priority: 0.9,
},
{
url: `${SITE_URL}/category`,
changeFrequency: "weekly",
priority: 0.8,
},
{
url: `${SITE_URL}/search`,
changeFrequency: "weekly",
priority: 0.7,
},
{
url: `${SITE_URL}/about`,
changeFrequency: "monthly",
priority: 0.5,
},
{
url: `${SITE_URL}/contact`,
changeFrequency: "monthly",
priority: 0.5,
},
{
url: `${SITE_URL}/faq`,
changeFrequency: "monthly",
priority: 0.5,
},
{
url: `${SITE_URL}/privacy-policy`,
changeFrequency: "yearly",
priority: 0.3,
},
{
url: `${SITE_URL}/refund-policy`,
changeFrequency: "yearly",
priority: 0.3,
},
{
url: `${SITE_URL}/shipping-policy`,
changeFrequency: "yearly",
priority: 0.3,
},
{
url: `${SITE_URL}/terms-and-conditions`,
changeFrequency: "yearly",
priority: 0.3,
},
];

try {
await connectDB();


// Only include published books in the public sitemap.
const books = await Book.find({ status: "published" })
  .select("slug updatedAt")
  .lean();

// Only include published categories.
const categories = await Category.find({ status: "published" })
  .select("slug updatedAt")
  .lean();

// CMS pages are added only when their status is published.
const pages = await Page.find({ status: "published" })
  .select("slug updatedAt")
  .lean();

const bookPages: MetadataRoute.Sitemap = books
  .filter((book) => typeof book.slug === "string" && book.slug.length > 0)
  .map((book) => ({
    url: `${SITE_URL}/books/${encodeURIComponent(book.slug)}`,
    lastModified: book.updatedAt ?? undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

const categoryPages: MetadataRoute.Sitemap = categories
  .filter(
    (category) =>
      typeof category.slug === "string" && category.slug.length > 0,
  )
  .map((category) => ({
    url: `${SITE_URL}/category/${encodeURIComponent(category.slug)}`,
    lastModified: category.updatedAt ?? undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

const cmsPages: MetadataRoute.Sitemap = pages
  .filter((page) => typeof page.slug === "string" && page.slug.length > 0)
  .filter(
    (page) =>
      ![
        "admin",
        "login",
        "register",
        "account",
        "books",
        "category",
        "search",
        "about",
        "contact",
        "faq",
        "cart",
        "checkout",
        "wishlist",
        "privacy-policy",
        "refund-policy",
        "shipping-policy",
        "terms-and-conditions",
      ].includes(page.slug),
  )
  .map((page) => ({
    url: `${SITE_URL}/${encodeURIComponent(page.slug)}`,
    lastModified: page.updatedAt ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

return [
  ...staticPages,
  ...bookPages,
  ...categoryPages,
  ...cmsPages,
];


} catch (error) {
console.error("Failed to generate StudyStow sitemap:", error);


// Keep the known public static URLs available if the database is down.
return staticPages;


}
}
