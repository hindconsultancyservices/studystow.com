
import type { MetadataRoute } from "next";

const SITE_URL = "https://www.studystow.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/checkout/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}