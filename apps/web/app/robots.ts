import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/register", "/vendor/login"],
        disallow: ["/dashboard", "/vendor", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
