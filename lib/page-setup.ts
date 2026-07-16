import { prisma } from "@/lib/prisma";
import type { ProductRecord } from "@/lib/store-types";

export type HomeCategoryCardSetup = {
  title: string;
  href: string;
  image: string;
};

export type HomeArticleCardSetup = {
  slug: string;
  title: string;
  image: string;
};

export type HomePageSetup = {
  saleLineOne: string;
  saleLineTwo: string;
  discountValue: string;
  discountSuffix: string;
  heroImageUrl: string;
  heroCardTitle: string;
  heroCardSubtitle: string;
  videoPosterUrl: string;
  videoUrl: string;
  videoTitle: string;
  videoBody: string;
  categoryCards: HomeCategoryCardSetup[];
  articleCards: HomeArticleCardSetup[];
};

export type SalesPageSetup = {
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  image: string;
  productSlugs: string[];
};

const HOME_PAGE_KEY = "page.home";

function salesPageKey(season: "summer" | "winter") {
  return `page.sales.${season}`;
}

const defaultHomeSetup: HomePageSetup = {
  saleLineOne: "Summer",
  saleLineTwo: "Sale",
  discountValue: "15",
  discountSuffix: "Off",
  heroImageUrl:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  heroCardTitle: "CoreSleep Calm",
  heroCardSubtitle: "Clean support for quieter bedrooms",
  videoPosterUrl:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  videoTitle: "Cooling comfort technology made simple",
  videoBody:
    "A muted product story section that feels modern without turning the homepage into a noisy promo reel.",
  categoryCards: [
    {
      title: "Mattresses",
      href: "/shop",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Pillows",
      href: "/pillows",
      image:
        "https://images.unsplash.com/photo-1582582429416-47f8f35f1c47?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Accessories",
      href: "/accessories",
      image:
        "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80"
    }
  ],
  articleCards: [
    {
      slug: "summer-sale-live-massively-discounted-deals-on-diamond-supreme-foam",
      title: "Summer sale and cooler sleep deals",
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    },
    {
      slug: "which-pillow-is-best-for-a-stiff-neck-expert-recommendations",
      title: "How to sleep cool in hot weather",
      image:
        "https://images.unsplash.com/photo-1505693537694-cd1d132d7d82?auto=format&fit=crop&w=1200&q=80"
    },
    {
      slug: "where-to-buy-high-quality-mattresses-in-pakistan-2026-buyers-guide",
      title: "The most trusted mattress buying guide",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-15"
    }
  ]
};

const defaultSalesSetup: Record<"summer" | "winter", SalesPageSetup> = {
  summer: {
    eyebrow: "Summer Sale",
    title: "Cooler sleep deals for warmer nights.",
    body:
      "Cooling comfort, lighter pillows and cleaner support products selected for heat-aware bedrooms and summer buying campaigns.",
    accent: "15% OFF",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    productSlugs: []
  },
  winter: {
    eyebrow: "Winter Sale",
    title: "Warmer comfort layers for the colder season.",
    body:
      "Plusher surfaces, room-friendly bedding essentials and support options curated for winter setups and comfort-led seasonal offers.",
    accent: "Cozy Picks",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80&sat=-10",
    productSlugs: []
  }
};

function normalizeCategoryCards(cards?: HomeCategoryCardSetup[]) {
  return defaultHomeSetup.categoryCards.map((fallbackCard, index) => ({
    title: cards?.[index]?.title || fallbackCard.title,
    href: cards?.[index]?.href || fallbackCard.href,
    image: cards?.[index]?.image || fallbackCard.image
  }));
}

function normalizeArticleCards(cards?: HomeArticleCardSetup[]) {
  return defaultHomeSetup.articleCards.map((fallbackCard, index) => ({
    slug: cards?.[index]?.slug || fallbackCard.slug,
    title: cards?.[index]?.title || fallbackCard.title,
    image: cards?.[index]?.image || fallbackCard.image
  }));
}

function normalizeHomeSetup(value?: Partial<HomePageSetup> | null): HomePageSetup {
  return {
    saleLineOne: value?.saleLineOne || defaultHomeSetup.saleLineOne,
    saleLineTwo: value?.saleLineTwo || defaultHomeSetup.saleLineTwo,
    discountValue: value?.discountValue || defaultHomeSetup.discountValue,
    discountSuffix: value?.discountSuffix || defaultHomeSetup.discountSuffix,
    heroImageUrl: value?.heroImageUrl || defaultHomeSetup.heroImageUrl,
    heroCardTitle: value?.heroCardTitle || defaultHomeSetup.heroCardTitle,
    heroCardSubtitle: value?.heroCardSubtitle || defaultHomeSetup.heroCardSubtitle,
    videoPosterUrl: value?.videoPosterUrl || defaultHomeSetup.videoPosterUrl,
    videoUrl: value?.videoUrl || defaultHomeSetup.videoUrl,
    videoTitle: value?.videoTitle || defaultHomeSetup.videoTitle,
    videoBody: value?.videoBody || defaultHomeSetup.videoBody,
    categoryCards: normalizeCategoryCards(value?.categoryCards),
    articleCards: normalizeArticleCards(value?.articleCards)
  };
}

function normalizeSalesSetup(
  season: "summer" | "winter",
  value?: Partial<SalesPageSetup> | null
): SalesPageSetup {
  const fallback = defaultSalesSetup[season];

  return {
    eyebrow: value?.eyebrow || fallback.eyebrow,
    title: value?.title || fallback.title,
    body: value?.body || fallback.body,
    accent: value?.accent || fallback.accent,
    image: value?.image || fallback.image,
    productSlugs: Array.isArray(value?.productSlugs) ? value!.productSlugs.filter(Boolean) : fallback.productSlugs
  };
}

export async function getHomePageSetup() {
  const setting = await prisma.setting.findUnique({
    where: { key: HOME_PAGE_KEY }
  });

  return normalizeHomeSetup((setting?.valueJson as Partial<HomePageSetup> | null) ?? null);
}

export async function getSalesPageSetup(season: "summer" | "winter") {
  const setting = await prisma.setting.findUnique({
    where: { key: salesPageKey(season) }
  });

  return normalizeSalesSetup(season, (setting?.valueJson as Partial<SalesPageSetup> | null) ?? null);
}

export async function saveHomePageSetup(input: HomePageSetup) {
  await prisma.setting.upsert({
    where: { key: HOME_PAGE_KEY },
    update: { valueJson: input },
    create: {
      key: HOME_PAGE_KEY,
      valueJson: input
    }
  });
}

export async function saveSalesPageSetup(season: "summer" | "winter", input: SalesPageSetup) {
  await prisma.setting.upsert({
    where: { key: salesPageKey(season) },
    update: { valueJson: input },
    create: {
      key: salesPageKey(season),
      valueJson: input
    }
  });
}

export function parseDelimitedCategoryCards(value: string) {
  const cards = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", href = "", image = ""] = line.split("|").map((part) => part.trim());
      return { title, href, image };
    })
    .filter((card) => card.title && card.href && card.image);

  return normalizeCategoryCards(cards);
}

export function parseDelimitedArticleCards(value: string) {
  const cards = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [slug = "", title = "", image = ""] = line.split("|").map((part) => part.trim());
      return { slug, title, image };
    })
    .filter((card) => card.slug && card.title && card.image);

  return normalizeArticleCards(cards);
}

export function stringifyCategoryCards(cards: HomeCategoryCardSetup[]) {
  return cards.map((card) => `${card.title} | ${card.href} | ${card.image}`).join("\n");
}

export function stringifyArticleCards(cards: HomeArticleCardSetup[]) {
  return cards.map((card) => `${card.slug} | ${card.title} | ${card.image}`).join("\n");
}

export function resolveSaleProducts(
  allProducts: ProductRecord[],
  slugs: string[],
  fallback: ProductRecord[]
) {
  const mapped = slugs
    .map((slug) => allProducts.find((product) => product.slug === slug))
    .filter((product): product is ProductRecord => Boolean(product));

  return mapped.length > 0 ? mapped : fallback.filter(Boolean);
}
