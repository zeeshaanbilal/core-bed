import type { MetadataRoute } from "next";

import { getAccessorySlugs, getBlogPostSlugs, getPillowSlugs, getProductSlugs } from "@/lib/mock-store";
import { getSiteUrl } from "@/lib/seo";
import { storeLocations } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const staticRoutes = [
    "",
    "/shop",
    "/pillows",
    "/accessories",
    "/blog",
    "/faq",
    "/materials",
    "/reviews",
    "/compare",
    "/guides",
    "/search",
    "/store-locator",
    "/sales/summer",
    "/sales/winter"
  ];

  let productSlugs: string[] = [];
  let pillowSlugs: string[] = [];
  let accessorySlugs: string[] = [];
  let blogSlugs: string[] = [];

  try {
    [productSlugs, pillowSlugs, accessorySlugs, blogSlugs] = await Promise.all([
      getProductSlugs(),
      getPillowSlugs(),
      getAccessorySlugs(),
      getBlogPostSlugs()
    ]);
  } catch (error) {
    console.error("[sitemap] failed to load dynamic slugs", error);
  }

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7
    })),
    ...productSlugs.map((slug) => ({
      url: `${siteUrl}/shop/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...pillowSlugs.map((slug) => ({
      url: `${siteUrl}/pillows/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...accessorySlugs.map((slug) => ({
      url: `${siteUrl}/accessories/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...blogSlugs.map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75
    })),
    ...storeLocations.map((location) => ({
      url: `${siteUrl}/store-locator/${location.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];
}
