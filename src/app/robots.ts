import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agniomega.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/admin/", "/vendor/", "/api/", "/checkout", "/cart", "/orders/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
