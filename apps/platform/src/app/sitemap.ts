import type { MetadataRoute } from "next";

import { getSeoConfig, getSeoRoutes } from "@ultra/modules";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getSeoConfig();

  return getSeoRoutes()
    .filter((route) => !config.sitemap.excludedPaths.includes(route.path))
    .map((route) => ({
      url: new URL(route.path, config.siteUrl).toString(),
      lastModified: route.lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          config.locales.map((locale) => [
            locale,
            new URL(`/${locale}${route.path}`, config.siteUrl).toString(),
          ]),
        ),
      },
    }));
}
