import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/api", "/brand"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
