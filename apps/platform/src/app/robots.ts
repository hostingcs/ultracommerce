import type { MetadataRoute } from "next";

import { getSeoConfig } from "@ultra/modules";

export default function robots(): MetadataRoute.Robots {
  const config = getSeoConfig();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: config.sitemap.excludedPaths,
    },
    sitemap: `${config.siteUrl}/sitemap.xml`,
    host: config.siteUrl,
  };
}
