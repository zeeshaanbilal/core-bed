import type { Metadata } from "next";

import { getCurrencyConfig } from "@/lib/format";
import type { BlogFaqRecord, BlogPostRecord, ProductRecord } from "@/lib/store-types";

export const defaultKeywords = [
  "Corebed",
  "CoreSleep",
  "natural mattress",
  "mattress Pakistan",
  "cooling mattress",
  "orthopedic mattress",
  "latex mattress",
  "memory foam pillow",
  "sleep accessories",
  "mattress online Pakistan",
  "premium mattress store",
  "bedroom comfort"
];

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function buildMetadata(input: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  const url = absoluteUrl(input.path ?? "/");
  const image = input.image || absoluteUrl("/opengraph-image.png");

  return {
    title: input.title,
    description: input.description,
    keywords: [...defaultKeywords, ...(input.keywords ?? [])],
    alternates: {
      canonical: url
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "Corebed Natural Mattress",
      type: "website",
      images: [
        {
          url: image,
          alt: input.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image]
    }
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Corebed Natural Mattress",
    alternateName: "CoreSleep",
    url: getSiteUrl(),
    logo: absoluteUrl("/corebed-logo.png"),
    email: "contact@corebed.com",
    telephone: "+15855029662",
    sameAs: [
      "https://facebook.com/corebedmattress",
      "https://instagram.com/core.bed",
      "https://youtube.com/@core_bed",
      "https://tiktok.com/@corebedmattress"
    ]
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Corebed Natural Mattress",
    url: getSiteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function buildProductSchema(product: ProductRecord, path: string, country = "Pakistan") {
  const { currency } = getCurrencyConfig(country);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image, ...product.gallery].filter(Boolean),
    sku: product.variants[0]?.sku ?? product.slug,
    brand: {
      "@type": "Brand",
      name: "Corebed"
    },
    category: product.category,
    url: absoluteUrl(path),
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount
          }
        : undefined,
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      availability: variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      price: variant.price,
      priceCurrency: currency,
      sku: variant.sku,
      url: absoluteUrl(path),
      itemCondition: "https://schema.org/NewCondition"
    }))
  };
}

export function buildArticleSchema(post: BlogPostRecord, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [post.image],
    author: {
      "@type": "Person",
      name: post.author
    },
    publisher: {
      "@type": "Organization",
      name: "Corebed Natural Mattress",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/corebed-logo.png")
      }
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: absoluteUrl(path)
  };
}

export function buildFaqSchema(faqItems: BlogFaqRecord[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
