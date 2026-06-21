import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecosolar.es";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/cuenta/", "/checkout/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
