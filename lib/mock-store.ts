import { promises as fs } from "fs";
import path from "path";

import { ContentStatus, ContentType, OrderStatus, Prisma, ProductStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatCurrency as formatCurrencyForCountry } from "@/lib/format";
import { sendOrderConfirmationEmails } from "@/lib/notifications";
import type {
  BlogPostRecord,
  CartRecord,
  ContentRecord,
  CustomerProfileRecord,
  OrderRecord,
  PaymentMethod,
  ProductRecord,
  ProductVariantRecord,
  TestimonialRecord,
  WishlistRecord
} from "@/lib/store-types";

const dataDir = path.join(process.cwd(), "data");

const productInclude = {
  category: true,
  variants: {
    orderBy: { size: "asc" as const }
  },
  images: {
    orderBy: { sortOrder: "asc" as const }
  }
} satisfies Prisma.ProductInclude;

async function safeStoreRead<T>(label: string, fallback: T, query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(`[mock-store] ${label} failed`, error);
    return fallback;
  }
}

function getFilePath(fileName: string) {
  return path.join(dataDir, fileName);
}

async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const contents = await fs.readFile(getFilePath(fileName), "utf8");
    return JSON.parse(contents) as T;
  } catch {
    await writeJsonFile(fileName, fallback);
    return fallback;
  }
}

async function writeJsonFile<T>(fileName: string, data: T) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(getFilePath(fileName), JSON.stringify(data, null, 2));
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOrderPrefixForCategory(category: string) {
  const normalized = category.trim().toLowerCase();

  if (normalized === "mattresses" || normalized === "mattress") {
    return "MCB";
  }

  if (normalized === "pillows" || normalized === "pillow") {
    return "PCB";
  }

  if (normalized === "accessories" || normalized === "accessory") {
    return "ACB";
  }

  const firstLetter = normalized.charAt(0).toUpperCase() || "C";
  return `${firstLetter}CB`;
}

function normalizeVariantSizes(sizes: string[]) {
  const seen = new Set<string>();

  return sizes
    .map((size) => size.trim())
    .filter(Boolean)
    .filter((size) => {
      const normalized = size.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function normalizeVariantFirmness(values: string[]) {
  const seen = new Set<string>();

  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const normalized = value.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function buildVariantSku(slug: string, size: string, productId: string, index: number) {
  const slugPart = slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const sizePart = size.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const productPart = productId.replace(/[^a-zA-Z0-9]+/g, "").slice(-6).toUpperCase();
  return `${slugPart}-${sizePart || "STANDARD"}-${productPart}-${index + 1}`;
}

const sizeDisplayOrder = ["Single", "Queen", "King", "Standard"] as const;

function sortVariantSizes<T extends { size: string; firmness: string }>(variants: T[]) {
  return [...variants].sort((left, right) => {
    const leftSizeIndex = sizeDisplayOrder.indexOf(left.size as (typeof sizeDisplayOrder)[number]);
    const rightSizeIndex = sizeDisplayOrder.indexOf(right.size as (typeof sizeDisplayOrder)[number]);
    const normalizedLeftSizeIndex = leftSizeIndex === -1 ? Number.MAX_SAFE_INTEGER : leftSizeIndex;
    const normalizedRightSizeIndex = rightSizeIndex === -1 ? Number.MAX_SAFE_INTEGER : rightSizeIndex;

    if (normalizedLeftSizeIndex !== normalizedRightSizeIndex) {
      return normalizedLeftSizeIndex - normalizedRightSizeIndex;
    }

    return left.firmness.localeCompare(right.firmness);
  });
}

function isLegacyFlatMattressVariantSetup(
  product: Prisma.ProductGetPayload<{
    include: typeof productInclude;
  }>
) {
  if (product.category.slug !== "mattresses" || product.variants.length === 0) {
    return false;
  }

  const firmnessValues = Array.from(new Set(product.variants.map((variant) => variant.firmness.toLowerCase())));
  const salePrices = Array.from(new Set(product.variants.map((variant) => toNumber(variant.salePrice ?? variant.price))));

  return firmnessValues.length === 1 && !firmnessValues.includes("soft") && !firmnessValues.includes("hard") && salePrices.length === 1;
}

async function ensureMattressVariantsReady(
  product: Prisma.ProductGetPayload<{
    include: typeof productInclude;
  }> | null
) {
  if (!product || !isLegacyFlatMattressVariantSetup(product)) {
    return product;
  }

  const uniqueSizes = normalizeVariantSizes(product.variants.map((variant) => variant.size));
  const baseVariant = product.variants[0];
  const baseSalePrice = toNumber(baseVariant.salePrice ?? baseVariant.price);
  const baseCompareAtPrice = baseVariant.salePrice ? toNumber(baseVariant.price) : undefined;
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const softnessOptions = ["Soft", "Hard"];
  const sizeDeltaMap: Record<string, number> = {
    Single: 0,
    Queen: 200,
    King: 400,
    Standard: 0
  };
  const pairCount = Math.max(uniqueSizes.length * softnessOptions.length, 1);
  const baseStock = Math.max(1, Math.floor(totalStock / pairCount));
  const extraStock = Math.max(0, totalStock - baseStock * pairCount);
  let createdIndex = 0;

  await prisma.productVariant.createMany({
    data: uniqueSizes.flatMap((size) =>
      softnessOptions.map((firmness) => {
        const delta = sizeDeltaMap[size] ?? 0;
        const salePrice = baseSalePrice + delta;
        const compareAtPrice = typeof baseCompareAtPrice === "number" ? baseCompareAtPrice + delta : undefined;
        const variant = {
          productId: product.id,
          sku: buildVariantSku(product.slug, `${size}-${firmness}`, product.id, createdIndex),
          size,
          firmness,
          height: baseVariant.height,
          price: compareAtPrice ?? salePrice,
          salePrice: compareAtPrice ? salePrice : null,
          stock: baseStock + (createdIndex < extraStock ? 1 : 0)
        };
        createdIndex += 1;
        return variant;
      })
    ),
    skipDuplicates: true
  });

  return getProductEntityBySlug(product.slug);
}

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
}

function parseVariantMatrix(
  variantMatrix: string | undefined,
  fallback: {
    slug: string;
    productId: string;
    sizes: string[];
    firmness: string;
    price: number;
    compareAtPrice?: number;
    inventory: number;
  }
) {
  const lines = (variantMatrix ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    const firmnessValues = normalizeVariantFirmness(
      fallback.firmness
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );
    const firmnessList = firmnessValues.length > 0 ? firmnessValues : [fallback.firmness || "Standard"];
    const sizeCount = Math.max(fallback.sizes.length * firmnessList.length, 1);
    const baseStock = Math.max(1, Math.floor(fallback.inventory / sizeCount));
    const extra = Math.max(0, fallback.inventory - baseStock * sizeCount);
    const variants: Array<Omit<ProductVariantRecord, "id">> = [];

    fallback.sizes.forEach((size) => {
      firmnessList.forEach((firmness, index) => {
        const variantIndex = variants.length;
        const originalPrice =
          fallback.compareAtPrice && fallback.compareAtPrice > fallback.price
            ? fallback.compareAtPrice
            : fallback.price;
        const salePrice =
          fallback.compareAtPrice && fallback.compareAtPrice > fallback.price ? fallback.price : undefined;

        variants.push({
          sku: buildVariantSku(fallback.slug, `${size}-${firmness}`, fallback.productId, variantIndex),
          size,
          firmness,
          height: "Standard",
          price: originalPrice,
          compareAtPrice: salePrice,
          stock: baseStock + (variantIndex < extra ? 1 : 0)
        });
      });
    });

    return variants;
  }

  return lines.map((line, index) => {
    const [sizeRaw, firmnessRaw, priceRaw, compareAtRaw, stockRaw, heightRaw] = line.split("|").map((item) => item.trim());
    const size = sizeRaw || "Standard";
    const firmness = firmnessRaw || fallback.firmness || "Standard";
    const actualPrice = Number(priceRaw) || fallback.price;
    const compareAtValue = Number(compareAtRaw);
    const compareAtPrice = Number.isFinite(compareAtValue) && compareAtValue > actualPrice ? compareAtValue : undefined;
    const stock = Math.max(0, Number(stockRaw) || 0);
    const height = heightRaw || "Standard";

    return {
      sku: buildVariantSku(fallback.slug, `${size}-${firmness}`, fallback.productId, index),
      size,
      firmness,
      height,
      price: compareAtPrice ?? actualPrice,
      compareAtPrice: compareAtPrice ? actualPrice : undefined,
      stock
    } satisfies Omit<ProductVariantRecord, "id">;
  });
}

function toProductRecord(
  product: Prisma.ProductGetPayload<{
    include: typeof productInclude;
  }>
): ProductRecord {
  const softHardVariants = product.variants.filter((variant) => {
    const normalized = variant.firmness.toLowerCase();
    return normalized === "soft" || normalized === "hard";
  });
  const variants = softHardVariants.length > 0 ? softHardVariants : product.variants;
  const primaryVariant = variants[0];
  const currentPrice = primaryVariant ? toNumber(primaryVariant.salePrice ?? primaryVariant.price) : 0;
  const compareAtPrice =
    primaryVariant && primaryVariant.salePrice ? toNumber(primaryVariant.price) : undefined;
  const mappedVariants = sortVariantSizes(
    variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    firmness: variant.firmness,
    height: variant.height,
    price: toNumber(variant.salePrice ?? variant.price),
    compareAtPrice: variant.salePrice ? toNumber(variant.price) : undefined,
    stock: variant.stock
    }))
  ) satisfies ProductVariantRecord[];

  return {
    id: product.id,
    slug: product.slug,
    name: product.title,
    category: product.category.name,
    description: product.shortDescription ?? "",
    longDescription: product.description ?? "",
    price: currentPrice,
    compareAtPrice,
    badge: product.badge ?? "Featured",
    firmness: product.firmness ?? "Balanced",
    material: product.material ?? "Premium comfort layer",
    image: product.images[0]?.url ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    gallery: product.images.map((item) => item.url),
    features: Array.isArray(product.featureBullets)
      ? product.featureBullets.filter((item): item is string => typeof item === "string")
      : [],
    sizes: Array.from(new Set(mappedVariants.map((item) => item.size))),
    firmnessOptions: Array.from(new Set(mappedVariants.map((item) => item.firmness))),
    variants: mappedVariants,
    variantMatrix: mappedVariants
      .map((item) => [item.size, item.firmness, item.price, item.compareAtPrice ?? "", item.stock, item.height].join("|"))
      .join("\n"),
    support: product.support ?? "",
    feel: product.feel ?? "",
    status: product.status === ProductStatus.ACTIVE ? "active" : "draft",
    inventory: variants.reduce((total, item) => total + item.stock, 0),
    rating: product.ratingAverage,
    reviewCount: product.reviewCount
  };
}

function isProductEntity(
  product: Awaited<ReturnType<typeof getProductEntityBySlug>>
): product is NonNullable<Awaited<ReturnType<typeof getProductEntityBySlug>>> {
  return product !== null;
}

function toTestimonialRecord(
  review: Prisma.ReviewGetPayload<{
    include: {
      product: {
        select: {
          id: true;
          slug: true;
          title: true;
        };
      };
      user: {
        select: {
          name: true;
        };
      };
    };
  }>
): TestimonialRecord {
  return {
    id: review.id,
    productId: review.productId,
    productSlug: review.product.slug,
    productName: review.product.title,
    customerName: review.customerName ?? review.user?.name ?? "Customer",
    customerCity: review.customerCity ?? "Pakistan",
    rating: review.rating,
    title: review.title ?? undefined,
    body: review.body,
    verified: review.verified,
    featuredOnHome: review.featuredOnHome,
    status:
      review.status === "APPROVED" ? "approved" : review.status === "REJECTED" ? "rejected" : "pending",
    createdAt: review.createdAt.toISOString()
  };
}

function toBlogPostRecord(post: Prisma.PostGetPayload<Record<string, never>>): BlogPostRecord {
  const categories = Array.isArray(post.categories)
    ? post.categories.filter((item): item is string => typeof item === "string")
    : [post.category];
  const bodyIntro = Array.isArray(post.bodyIntro)
    ? post.bodyIntro.filter((item): item is string => typeof item === "string")
    : [];
  const sections = Array.isArray(post.sections)
    ? post.sections.filter(
        (item): item is BlogPostRecord["sections"][number] =>
          typeof item === "object" && item !== null && "heading" in item && "paragraphs" in item
      )
    : [];
  const faq = Array.isArray(post.faq)
    ? post.faq.filter(
        (item): item is BlogPostRecord["faq"][number] =>
          typeof item === "object" && item !== null && "question" in item && "answer" in item
      )
    : [];
  const tags = Array.isArray(post.tags)
    ? post.tags.filter((item): item is string => typeof item === "string")
    : [];
  const relatedSlugs = Array.isArray(post.relatedSlugs)
    ? post.relatedSlugs.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    author: post.author,
    publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? post.createdAt.toISOString().slice(0, 10),
    categories,
    featured: post.featured,
    readTime: post.readTime,
    bodyIntro,
    sections,
    faq,
    tags,
    relatedSlugs
  };
}

function toContentRecord(entry: Prisma.ContentEntryGetPayload<Record<string, never>>): ContentRecord {
  return {
    id: entry.id,
    type:
      entry.type === ContentType.POLICY ? "policy" : entry.type === ContentType.HOMEPAGE ? "homepage" : "guide",
    title: entry.title,
    slug: entry.slug,
    summary: entry.summary,
    status: entry.status === ContentStatus.ACTIVE ? "active" : "draft"
  };
}

function normalizePaymentMethod(method: string): PaymentMethod {
  if (method === "stripe_card" || method === "bank_transfer" || method === "cash_on_delivery") {
    return method;
  }

  return "cash_on_delivery";
}

function getPaymentStatus(method: PaymentMethod): OrderRecord["paymentStatus"] {
  if (method === "stripe_card") {
    return "requires_action";
  }

  if (method === "bank_transfer") {
    return "awaiting_transfer";
  }

  return "cod_pending";
}

function buildAddressLine(addressLine1: string, addressLine2?: string) {
  return [addressLine1, addressLine2].filter(Boolean).join(", ");
}

function toOrderRecord(
  order: Prisma.OrderGetPayload<{
    include: {
      items: true;
      payments: true;
    };
  }>
): OrderRecord {
  const addressSnapshot =
    typeof order.addressSnapshot === "object" && order.addressSnapshot !== null ? order.addressSnapshot : {};
  const snapshot = addressSnapshot as Record<string, string>;
  const firstPayment = order.payments[0];
  const paymentMethod = normalizePaymentMethod(
    firstPayment?.provider === "stripe"
      ? "stripe_card"
      : firstPayment?.provider === "bank_transfer"
        ? "bank_transfer"
        : "cash_on_delivery"
  );

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    sessionId: snapshot.sessionId ?? "",
    customerName: snapshot.customerName ?? "",
    customerEmail: snapshot.customerEmail ?? "",
    customerPhone: snapshot.customerPhone ?? "",
    city: snapshot.city ?? "",
    address: snapshot.address ?? "",
    addressLine2: snapshot.addressLine2 ?? "",
    state: snapshot.state ?? "",
    postalCode: snapshot.postalCode ?? "",
    country: snapshot.country ?? "",
    notes: snapshot.notes ?? "",
    paymentMethod,
    paymentStatus: firstPayment?.status ?? getPaymentStatus(paymentMethod),
    orderStatus:
      order.status === "PROCESSING"
        ? "processing"
        : order.status === "PAID"
          ? "paid"
          : order.status === "SHIPPED"
            ? "shipped"
            : order.status === "DELIVERED"
              ? "delivered"
              : order.status === "CANCELLED"
                ? "cancelled"
                : "pending",
    shippingStatus: order.shippingStatus,
    items: order.items.map((item) => {
      const productSnapshot =
        typeof item.productSnapshot === "object" && item.productSnapshot !== null ? item.productSnapshot : {};
      const record = productSnapshot as Record<string, string | number>;

        return {
          productSlug: String(record.productSlug ?? ""),
          name: String(record.name ?? ""),
          selectedSize: String(record.selectedSize ?? ""),
          selectedFirmness: String(record.selectedFirmness ?? ""),
          quantity: item.quantity,
          unitPrice: toNumber(item.price),
          lineTotal: item.quantity * toNumber(item.price)
        };
      }),
    subtotal: toNumber(order.subtotalAmount),
    shippingFee: toNumber(order.shippingAmount),
    total: toNumber(order.totalAmount),
    paymentReference: firstPayment?.providerSessionId ?? "",
    paymentClientSecret: firstPayment?.providerClientSecret ?? undefined,
    createdAt: order.createdAt.toISOString()
  };
}

async function getProductsByCategorySlug(categorySlug: string) {
  return safeStoreRead(`getProductsByCategorySlug:${categorySlug}`, [] as ProductRecord[], async () => {
    const products = await prisma.product.findMany({
      where: { category: { slug: categorySlug } },
      include: productInclude,
      orderBy: { createdAt: "desc" }
    });

    const normalizedProducts = await Promise.all(products.map((product) => ensureMattressVariantsReady(product)));

    return normalizedProducts.filter(isProductEntity).map(toProductRecord).sort((left, right) => right.price - left.price);
  });
}

async function getProductEntityBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productInclude
  });
}

export function formatCurrency(value: number, country?: string) {
  return formatCurrencyForCountry(value, country);
}

export async function getProducts() {
  return getProductsByCategorySlug("mattresses");
}

export async function getPillows() {
  return getProductsByCategorySlug("pillows");
}

export async function getAccessories() {
  return getProductsByCategorySlug("accessories");
}

export async function getCatalogProducts() {
  return safeStoreRead("getCatalogProducts", [] as ProductRecord[], async () => {
    const products = await prisma.product.findMany({
      include: productInclude,
      orderBy: { createdAt: "desc" }
    });

    const normalizedProducts = await Promise.all(products.map((product) => ensureMattressVariantsReady(product)));

    return normalizedProducts.filter(isProductEntity).map(toProductRecord).sort((left, right) => right.price - left.price);
  });
}

export async function getCatalogProductBySlug(slug: string) {
  return safeStoreRead(`getCatalogProductBySlug:${slug}`, null as ProductRecord | null, async () => {
    const product = await getProductEntityBySlug(slug);
    const normalizedProduct = await ensureMattressVariantsReady(product);

    return normalizedProduct ? toProductRecord(normalizedProduct) : null;
  });
}

export async function getFeaturedProducts() {
  return safeStoreRead("getFeaturedProducts", [] as ProductRecord[], async () => {
    const products = await prisma.product.findMany({
      where: { featured: true, status: ProductStatus.ACTIVE },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 3
    });

    const normalizedProducts = await Promise.all(products.map((product) => ensureMattressVariantsReady(product)));

    return normalizedProducts.filter(isProductEntity).map(toProductRecord);
  });
}

export async function getProductBySlug(slug: string) {
  return safeStoreRead(`getProductBySlug:${slug}`, undefined, async () => {
    const product = await ensureMattressVariantsReady(await getProductEntityBySlug(slug));
    return product?.category.slug === "mattresses" ? toProductRecord(product) : undefined;
  });
}

export async function getProductSlugs() {
  return safeStoreRead("getProductSlugs", [] as string[], async () => {
    const products = await prisma.product.findMany({
      where: { category: { slug: "mattresses" } },
      select: { slug: true }
    });

    return products.map((product) => product.slug);
  });
}

export async function getPillowBySlug(slug: string) {
  return safeStoreRead(`getPillowBySlug:${slug}`, undefined, async () => {
    const product = await ensureMattressVariantsReady(await getProductEntityBySlug(slug));
    return product?.category.slug === "pillows" ? toProductRecord(product) : undefined;
  });
}

export async function getPillowSlugs() {
  return safeStoreRead("getPillowSlugs", [] as string[], async () => {
    const products = await prisma.product.findMany({
      where: { category: { slug: "pillows" } },
      select: { slug: true }
    });

    return products.map((product) => product.slug);
  });
}

export async function getAccessoryBySlug(slug: string) {
  return safeStoreRead(`getAccessoryBySlug:${slug}`, undefined, async () => {
    const product = await ensureMattressVariantsReady(await getProductEntityBySlug(slug));
    return product?.category.slug === "accessories" ? toProductRecord(product) : undefined;
  });
}

export async function getAccessorySlugs() {
  return safeStoreRead("getAccessorySlugs", [] as string[], async () => {
    const products = await prisma.product.findMany({
      where: { category: { slug: "accessories" } },
      select: { slug: true }
    });

    return products.map((product) => product.slug);
  });
}

export async function getContentEntries() {
  return safeStoreRead("getContentEntries", [] as ContentRecord[], async () => {
    const entries = await prisma.contentEntry.findMany({
      orderBy: { createdAt: "desc" }
    });

    return entries.map(toContentRecord);
  });
}

export async function getBlogPosts() {
  return safeStoreRead("getBlogPosts", [] as BlogPostRecord[], async () => {
    const posts = await prisma.post.findMany({
      where: { status: ContentStatus.ACTIVE },
      orderBy: { publishedAt: "desc" }
    });

    return posts.map(toBlogPostRecord);
  });
}

export async function getBlogPostBySlug(slug: string) {
  return safeStoreRead(`getBlogPostBySlug:${slug}`, undefined, async () => {
    const post = await prisma.post.findUnique({ where: { slug } });
    return post ? toBlogPostRecord(post) : undefined;
  });
}

export async function getBlogPostSlugs() {
  return safeStoreRead("getBlogPostSlugs", [] as string[], async () => {
    const posts = await prisma.post.findMany({ select: { slug: true } });
    return posts.map((post) => post.slug);
  });
}

export async function getCustomerProfileByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { id: "asc" }]
      }
    }
  });

  if (!user) {
    return null;
  }

  const primaryAddress = user.addresses[0];

  return {
    email: user.email,
    name: user.name ?? "",
    phone: user.phone ?? "",
    addressLine1: primaryAddress?.line1 ?? "",
    addressLine2: "",
    city: primaryAddress?.city ?? "",
    state: primaryAddress?.state ?? "",
    postalCode: primaryAddress?.postalCode ?? "",
    country: primaryAddress?.country ?? "Pakistan"
  } satisfies CustomerProfileRecord;
}

export async function upsertCustomerProfile(input: CustomerProfileRecord) {
  const email = input.email.toLowerCase();

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: input.name,
      phone: input.phone
    },
    create: {
      email,
      name: input.name,
      phone: input.phone
    }
  });

  const existingAddress = await prisma.address.findFirst({
    where: { userId: user.id, isDefault: true }
  });

  if (existingAddress) {
    await prisma.address.update({
      where: { id: existingAddress.id },
      data: {
        name: input.name,
        phone: input.phone,
        line1: input.addressLine1,
        city: input.city,
        state: input.state || null,
        country: input.country,
        postalCode: input.postalCode || null,
        isDefault: true
      }
    });
  } else {
    await prisma.address.create({
      data: {
        userId: user.id,
        name: input.name,
        phone: input.phone,
        line1: input.addressLine1,
        city: input.city,
        state: input.state || null,
        country: input.country,
        postalCode: input.postalCode || null,
        isDefault: true
      }
    });
  }

  return user;
}

export async function createBlogPost(
  input: Omit<BlogPostRecord, "id" | "relatedSlugs" | "bodyIntro" | "sections" | "faq" | "tags">
) {
  await prisma.post.create({
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      image: input.image,
      category: input.categories[0] ?? "All",
      categories: input.categories,
      content: input.excerpt,
      author: input.author,
      featured: input.featured,
      readTime: input.readTime,
      bodyIntro: [input.excerpt],
      sections: [
        {
          heading: "Draft section",
          paragraphs: ["Replace this draft section with final editorial copy from the admin workflow."]
        }
      ],
      faq: [
        {
          question: "Draft FAQ",
          answer: "Replace this placeholder FAQ once the final article is reviewed."
        }
      ],
      tags: [],
      relatedSlugs: [],
      status: ContentStatus.ACTIVE,
      seoTitle: input.title,
      seoSummary: input.excerpt,
      publishedAt: new Date(input.publishedAt)
    }
  });
}

export async function updateBlogPost(
  id: string,
  input: Omit<BlogPostRecord, "id" | "relatedSlugs" | "bodyIntro" | "sections" | "faq" | "tags">
) {
  await prisma.post.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      image: input.image,
      category: input.categories[0] ?? "All",
      categories: input.categories,
      author: input.author,
      featured: input.featured,
      readTime: input.readTime,
      publishedAt: new Date(input.publishedAt),
      seoTitle: input.title,
      seoSummary: input.excerpt
    }
  });
}

export async function deleteBlogPost(id: string) {
  await prisma.post.delete({ where: { id } });
}

async function getOrCreateCart(sessionId: string) {
  const existing = await prisma.cart.findUnique({ where: { sessionId } });
  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: {
      sessionId,
      currency: "PKR"
    }
  });
}

export async function getCart(sessionId: string): Promise<CartRecord> {
  if (!sessionId || sessionId === "demo-session") {
    return {
      sessionId: sessionId || "demo-session",
      items: [],
      updatedAt: new Date().toISOString()
    };
  }

  return safeStoreRead(
    `getCart:${sessionId}`,
    {
      sessionId,
      items: [],
      updatedAt: new Date().toISOString()
    } satisfies CartRecord,
    async () => {
      const cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              variant: true
            }
          }
        }
      });

      return {
        sessionId,
        items:
          cart?.items.map((item) => ({
            id: item.id,
            productSlug: item.variantId,
            quantity: item.quantity,
            selectedSize: item.variant.size,
            unitPrice: toNumber(item.unitPriceSnapshot)
          })) ?? [],
        updatedAt: cart?.updatedAt.toISOString() ?? new Date().toISOString()
      };
    }
  );
}

export async function getCartDetail(sessionId: string) {
  if (!sessionId || sessionId === "demo-session") {
    return {
      sessionId: sessionId || "demo-session",
      items: [],
      subtotal: 0,
      shippingFee: 0,
      total: 0
    };
  }

  return safeStoreRead(
    `getCartDetail:${sessionId}`,
    {
      sessionId,
      items: [],
      subtotal: 0,
      shippingFee: 0,
      total: 0
    },
    async () => {
      const cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: productInclude
                  }
                }
              }
            }
          }
        }
      });

      const items =
        cart?.items.map((item) => {
          const product = toProductRecord(item.variant.product);
          const unitPrice = toNumber(item.unitPriceSnapshot);

          return {
            id: item.id,
            productSlug: product.slug,
            quantity: item.quantity,
            selectedSize: item.variant.size,
            selectedFirmness: item.variant.firmness,
            unitPrice,
            product,
            lineTotal: unitPrice * item.quantity
          };
        }) ?? [];

      const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
      const shippingFee = subtotal > 1500 ? 0 : items.length > 0 ? 65 : 0;

      return {
        sessionId,
        items,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee
      };
    }
  );
}

export async function addCartItem(input: {
  sessionId: string;
  productSlug: string;
  quantity: number;
  selectedSize: string;
  selectedFirmness?: string;
}) {
  const product = await prisma.product.findUnique({
    where: { slug: input.productSlug },
    include: {
      variants: {
        orderBy: { size: "asc" }
      }
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const variant =
    product.variants.find(
      (item) =>
        item.size === input.selectedSize &&
        (!input.selectedFirmness || item.firmness.toLowerCase() === input.selectedFirmness.toLowerCase())
    ) ??
    product.variants.find((item) => item.size === input.selectedSize) ??
    product.variants[0];

  if (!variant) {
    throw new Error("Product variant not found");
  }

  const cart = await getOrCreateCart(input.sessionId);
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      variantId: variant.id
    }
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + Math.max(1, input.quantity)
      }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: variant.id,
        quantity: Math.max(1, input.quantity),
        unitPriceSnapshot: variant.salePrice ?? variant.price
      }
    });
  }
}

export async function updateCartItem(input: {
  sessionId: string;
  itemId: string;
  quantity: number;
}) {
  const cart = await prisma.cart.findUnique({ where: { sessionId: input.sessionId } });

  if (!cart) {
    return;
  }

  if (input.quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: {
        id: input.itemId,
        cartId: cart.id
      }
    });
    return;
  }

  await prisma.cartItem.updateMany({
    where: {
      id: input.itemId,
      cartId: cart.id
    },
    data: {
      quantity: input.quantity
    }
  });
}

export async function removeCartItem(sessionId: string, itemId: string) {
  const cart = await prisma.cart.findUnique({ where: { sessionId } });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cartId: cart.id
    }
  });
}

export async function clearCart(sessionId: string) {
  const cart = await prisma.cart.findUnique({ where: { sessionId } });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });
}

export async function createOrderFromCart(input: {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  state?: string;
  postalCode?: string;
  country: string;
  notes: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentClientSecret?: string;
  paymentStatus?: string;
  orderStatus?: "PENDING" | "PAID" | "PROCESSING";
  clearCart?: boolean;
}) {
  const cart = await getCartDetail(input.sessionId);

  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const orderCount = await prisma.order.count();
  const primaryCategory = cart.items[0]?.product.category ?? "";
  const orderPrefix = getOrderPrefixForCategory(primaryCategory);
  const orderNumber = `${orderPrefix}-${String(orderCount + 1001)}`;
  const paymentReference =
    input.paymentReference ??
    (input.paymentMethod === "stripe_card"
      ? `cs_test_${Math.random().toString(36).slice(2, 10)}`
      : input.paymentMethod === "bank_transfer"
        ? `bank_${Math.random().toString(36).slice(2, 10)}`
        : `cod_${Math.random().toString(36).slice(2, 10)}`);
  const user = await prisma.user.findUnique({
    where: { email: input.customerEmail.toLowerCase() }
  });

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user?.id,
      status: input.orderStatus ?? "PENDING",
      paymentStatus: input.paymentStatus ?? getPaymentStatus(input.paymentMethod),
      shippingStatus: "pending",
      subtotalAmount: cart.subtotal,
      shippingAmount: cart.shippingFee,
      totalAmount: cart.total,
      addressSnapshot: {
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        city: input.city,
        address: buildAddressLine(input.addressLine1, input.addressLine2),
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? "",
        state: input.state ?? "",
        postalCode: input.postalCode ?? "",
        country: input.country,
        notes: input.notes,
        sessionId: input.sessionId
      },
      items: {
        create: cart.items.map((item) => ({
          productSnapshot: {
            productSlug: item.product.slug,
            name: item.product.name,
            selectedSize: item.selectedSize,
            selectedFirmness: item.selectedFirmness ?? ""
          },
          quantity: item.quantity,
          price: item.unitPrice,
          discount: 0
        }))
      },
      payments: {
        create: {
          provider:
            input.paymentMethod === "stripe_card"
              ? "stripe"
              : input.paymentMethod === "bank_transfer"
                ? "bank_transfer"
                : "cash_on_delivery",
          providerSessionId: paymentReference,
          providerClientSecret: input.paymentClientSecret,
          status: input.paymentStatus ?? getPaymentStatus(input.paymentMethod),
          amount: cart.total,
          currency: "PKR"
        }
      }
    },
    include: {
      items: true,
      payments: true
    }
  });

  const orderRecord = toOrderRecord(order);

  if (input.paymentMethod !== "stripe_card") {
    const emailResult = await sendOrderConfirmationEmails(orderRecord);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        customerNotifiedAt: emailResult.customer.ok ? new Date() : undefined,
        adminNotifiedAt: emailResult.admin.ok ? new Date() : undefined
      }
    });
  }

  if (input.clearCart !== false) {
    await clearCart(input.sessionId);
  }
  return orderRecord;
}

export async function getOrderByPaymentReference(paymentReference: string) {
  const order = await prisma.order.findFirst({
    where: {
      payments: {
        some: {
          providerSessionId: paymentReference
        }
      }
    },
    include: {
      items: true,
      payments: true
    }
  });

  return order ? toOrderRecord(order) : null;
}

type StripeOrderSyncInput = {
  paymentReference: string;
  paymentStatus: string;
  orderStatus: "PENDING" | "PAID" | "PROCESSING" | "CANCELLED";
  shippingStatus: string;
  rawWebhook?: Prisma.InputJsonValue;
};

export async function syncStripeOrderStatus(input: StripeOrderSyncInput) {
  const payment = await prisma.payment.findFirst({
    where: {
      provider: "stripe",
      providerSessionId: input.paymentReference
    },
    include: {
      order: true
    }
  });

  if (!payment) {
    return null;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: input.paymentStatus,
      rawWebhook: input.rawWebhook
    }
  });

  const order = await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      status:
        input.orderStatus === "PAID"
          ? OrderStatus.PAID
          : input.orderStatus === "PROCESSING"
            ? OrderStatus.PROCESSING
            : input.orderStatus === "CANCELLED"
              ? OrderStatus.CANCELLED
              : OrderStatus.PENDING,
      paymentStatus: input.paymentStatus,
      shippingStatus: input.shippingStatus
    },
    include: {
      items: true,
      payments: true
    }
  });

  const orderRecord = toOrderRecord(order);

  if (
    input.orderStatus === "PAID" &&
    (!order.customerNotifiedAt || !order.adminNotifiedAt)
  ) {
    const emailResult = await sendOrderConfirmationEmails(orderRecord);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        customerNotifiedAt: order.customerNotifiedAt ?? (emailResult.customer.ok ? new Date() : undefined),
        adminNotifiedAt: order.adminNotifiedAt ?? (emailResult.admin.ok ? new Date() : undefined)
      }
    });
  }

  const addressSnapshot =
    typeof order.addressSnapshot === "object" && order.addressSnapshot !== null ? order.addressSnapshot : {};
  const snapshot = addressSnapshot as Record<string, string>;

  if (input.orderStatus === "PAID" && snapshot.sessionId) {
    await clearCart(snapshot.sessionId);
  }

  return orderRecord;
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      payments: true
    },
    orderBy: { createdAt: "desc" }
  });

  return orders.map(toOrderRecord);
}

export async function updateOrderStatus(input: {
  id: string;
  orderStatus: "PENDING" | "PROCESSING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: string;
  shippingStatus: string;
}) {
  await prisma.order.update({
    where: { id: input.id },
    data: {
      status:
        input.orderStatus === "PAID"
          ? OrderStatus.PAID
          : input.orderStatus === "PROCESSING"
            ? OrderStatus.PROCESSING
            : input.orderStatus === "SHIPPED"
              ? OrderStatus.SHIPPED
              : input.orderStatus === "DELIVERED"
                ? OrderStatus.DELIVERED
                : input.orderStatus === "CANCELLED"
                  ? OrderStatus.CANCELLED
                  : OrderStatus.PENDING,
      paymentStatus: input.paymentStatus,
      shippingStatus: input.shippingStatus
    }
  });
}

export async function getAdminDashboardStats() {
  const [products, orders, content] = await Promise.all([
    getCatalogProducts(),
    getOrders(),
    getContentEntries()
  ]);

  return {
    revenue: orders.reduce((total, order) => total + order.total, 0),
    orderCount: orders.length,
    productCount: products.length,
    lowStockCount: products.filter((product) => product.inventory <= 6).length,
    publishedContentCount: content.filter((entry) => entry.status === "active").length
  };
}

async function recalculateProductReviewStats(productId: string) {
  const approved = await prisma.review.findMany({
    where: {
      productId,
      status: "APPROVED"
    },
    select: {
      rating: true
    }
  });

  const reviewCount = approved.length;
  const ratingAverage =
    reviewCount > 0 ? approved.reduce((total, review) => total + review.rating, 0) / reviewCount : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      reviewCount,
      ratingAverage
    }
  });
}

export async function createTestimonial(input: {
  productSlug: string;
  customerName: string;
  customerCity: string;
  rating: number;
  title?: string;
  body: string;
  userEmail?: string;
}) {
  const product = await prisma.product.findUnique({
    where: { slug: input.productSlug },
    select: { id: true }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const user = input.userEmail
    ? await prisma.user.findUnique({
        where: { email: input.userEmail.toLowerCase() },
        select: { id: true }
      })
    : null;

  const review = await prisma.review.create({
    data: {
      productId: product.id,
      userId: user?.id,
      customerName: input.customerName,
      customerCity: input.customerCity,
      rating: Math.min(5, Math.max(1, input.rating)),
      title: input.title,
      body: input.body,
      verified: Boolean(user?.id),
      status: "PENDING"
    },
    include: {
      product: {
        select: { id: true, slug: true, title: true }
      },
      user: {
        select: { name: true }
      }
    }
  });

  return toTestimonialRecord(review);
}

export async function getApprovedTestimonialsForHome() {
  return safeStoreRead("getApprovedTestimonialsForHome", [] as TestimonialRecord[], async () => {
    const reviews = await prisma.review.findMany({
      where: {
        status: "APPROVED",
        featuredOnHome: true
      },
      include: {
        product: {
          select: { id: true, slug: true, title: true }
        },
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 8
    });

    return reviews.map(toTestimonialRecord);
  });
}

export async function getApprovedTestimonialsForProduct(productSlug: string) {
  return safeStoreRead(`getApprovedTestimonialsForProduct:${productSlug}`, [] as TestimonialRecord[], async () => {
    const reviews = await prisma.review.findMany({
      where: {
        status: "APPROVED",
        product: {
          slug: productSlug
        }
      },
      include: {
        product: {
          select: { id: true, slug: true, title: true }
        },
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 6
    });

    return reviews.map(toTestimonialRecord);
  });
}

export async function getTestimonialsForAdmin() {
  const reviews = await prisma.review.findMany({
    include: {
      product: {
        select: { id: true, slug: true, title: true }
      },
      user: {
        select: { name: true }
      }
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return reviews.map(toTestimonialRecord);
}

export async function moderateTestimonial(input: {
  id: string;
  status: "approved" | "rejected" | "pending";
  featuredOnHome: boolean;
}) {
  const review = await prisma.review.update({
    where: { id: input.id },
    data: {
      status: input.status === "approved" ? "APPROVED" : input.status === "rejected" ? "REJECTED" : "PENDING",
      featuredOnHome: input.status === "approved" ? input.featuredOnHome : false
    },
    include: {
      product: {
        select: { id: true }
      }
    }
  });

  await recalculateProductReviewStats(review.product.id);
}

export async function getWishlist(sessionId: string) {
  return getWishlistForScope({ sessionId });
}

async function getWishlistForScope(input: { sessionId?: string; userEmail?: string }) {
  const products = await getCatalogProducts();

  if (input.userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: input.userEmail.toLowerCase() },
      include: { wishlist: true }
    });

    const slugs = user?.wishlist.map((item) => item.productId) ?? [];
    return products.filter((product) => slugs.includes(product.id));
  }

  const wishlists = await readJsonFile<WishlistRecord[]>("wishlist.json", []);
  const wishlist = wishlists.find((entry) => entry.sessionId === input.sessionId);
  const slugs = wishlist?.productSlugs ?? [];
  return products.filter((product) => slugs.includes(product.slug));
}

export async function getWishlistByUserEmail(userEmail: string) {
  return getWishlistForScope({ userEmail });
}

export async function getWishlistCount(input: { sessionId?: string; userEmail?: string }) {
  const products = await getWishlistForScope(input);
  return products.length;
}

export async function addWishlistItem(sessionId: string, productSlug: string, userEmail?: string) {
  if (userEmail) {
    const [user, product] = await Promise.all([
      prisma.user.upsert({
        where: { email: userEmail.toLowerCase() },
        update: {},
        create: { email: userEmail.toLowerCase() }
      }),
      prisma.product.findUnique({
        where: { slug: productSlug },
        select: { id: true }
      })
    ]);

    if (!product) {
      throw new Error("Product not found");
    }

    await prisma.wishlistItem.upsert({
      where: {
        id: `${user.id}:${product.id}`
      },
      update: {},
      create: {
        id: `${user.id}:${product.id}`,
        userId: user.id,
        productId: product.id
      }
    });
    return;
  }

  const wishlists = await readJsonFile<WishlistRecord[]>("wishlist.json", []);
  const existing = wishlists.find((entry) => entry.sessionId === sessionId);

  if (!existing) {
    wishlists.push({
      sessionId,
      productSlugs: [productSlug],
      updatedAt: new Date().toISOString()
    });
  } else if (!existing.productSlugs.includes(productSlug)) {
    existing.productSlugs.push(productSlug);
    existing.updatedAt = new Date().toISOString();
  }

  await writeJsonFile("wishlist.json", wishlists);
}

export async function removeWishlistItem(sessionId: string, productSlug: string, userEmail?: string) {
  if (userEmail) {
    const [user, product] = await Promise.all([
      prisma.user.findUnique({
        where: { email: userEmail.toLowerCase() },
        select: { id: true }
      }),
      prisma.product.findUnique({
        where: { slug: productSlug },
        select: { id: true }
      })
    ]);

    if (!user || !product) {
      return;
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId: product.id
      }
    });
    return;
  }

  const wishlists = await readJsonFile<WishlistRecord[]>("wishlist.json", []);
  const existing = wishlists.find((entry) => entry.sessionId === sessionId);

  if (!existing) {
    return;
  }

  existing.productSlugs = existing.productSlugs.filter((slug) => slug !== productSlug);
  existing.updatedAt = new Date().toISOString();
  await writeJsonFile("wishlist.json", wishlists);
}

export async function isProductWishlisted(input: { productSlug: string; sessionId?: string; userEmail?: string }) {
  if (input.userEmail) {
    const [user, product] = await Promise.all([
      prisma.user.findUnique({
        where: { email: input.userEmail.toLowerCase() },
        select: { id: true }
      }),
      prisma.product.findUnique({
        where: { slug: input.productSlug },
        select: { id: true }
      })
    ]);

    if (!user || !product) {
      return false;
    }

    const saved = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productId: product.id
      },
      select: { id: true }
    });

    return Boolean(saved);
  }

  const wishlists = await readJsonFile<WishlistRecord[]>("wishlist.json", []);
  const wishlist = wishlists.find((entry) => entry.sessionId === input.sessionId);
  return Boolean(wishlist?.productSlugs.includes(input.productSlug));
}

export async function searchStore(query: string) {
  const term = query.trim().toLowerCase();

  if (!term) {
    return {
      products: [] as ProductRecord[],
      posts: [] as BlogPostRecord[]
    };
  }

  const [products, posts] = await Promise.all([getCatalogProducts(), getBlogPosts()]);

  return {
    products: products.filter((product) =>
      [product.name, product.category, product.description, product.material, product.firmness, product.support]
        .join(" ")
        .toLowerCase()
        .includes(term)
    ),
    posts: posts.filter((post) =>
      [post.title, post.excerpt, post.author, post.categories.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
  };
}

async function replaceProductVariants(
  productId: string,
  input: Omit<ProductRecord, "id" | "rating" | "reviewCount">
) {
  const variantRows = parseVariantMatrix((input as ProductRecord & { variantMatrix?: string }).variantMatrix, {
    slug: input.slug,
    productId,
    sizes: normalizeVariantSizes(input.sizes),
    firmness: input.firmness,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    inventory: input.inventory
  });

  await prisma.productVariant.createMany({
    data: variantRows.map((variant) => ({
      productId,
      sku: variant.sku,
      size: variant.size,
      firmness: variant.firmness,
      height: variant.height,
      price: variant.compareAtPrice ?? variant.price,
      salePrice: variant.compareAtPrice ? variant.price : null,
      stock: variant.stock
    }))
  });
}

export async function createProduct(input: Omit<ProductRecord, "id" | "rating" | "reviewCount">) {
  const categoryName = input.category.trim();
  const category = await prisma.category.upsert({
    where: { slug: slugify(categoryName) },
    update: { name: categoryName },
    create: {
      name: categoryName,
      slug: slugify(categoryName)
    }
  });

  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      title: input.name,
      slug: input.slug,
      brand: "Corebed",
      shortDescription: input.description,
      description: input.longDescription,
      badge: input.badge,
      firmness: input.firmness,
      material: input.material,
      support: input.support,
      feel: input.feel,
      featureBullets: input.features,
      status: input.status === "active" ? ProductStatus.ACTIVE : ProductStatus.DRAFT
    }
  });

  const gallery = Array.from(new Set([input.image, ...input.gallery].filter(Boolean)));

  await prisma.productImage.createMany({
    data: gallery.map((image, index) => ({
      productId: product.id,
      url: image,
      alt: `${input.name} image ${index + 1}`,
      sortOrder: index
    }))
  });

  await replaceProductVariants(product.id, input);

  const created = await getProductEntityBySlug(input.slug);
  const normalizedCreated = await ensureMattressVariantsReady(created);

  if (!normalizedCreated) {
    throw new Error("Unable to load created product");
  }

  return toProductRecord(normalizedCreated);
}

export async function updateProduct(
  id: string,
  input: Omit<ProductRecord, "id" | "rating" | "reviewCount">
) {
  const categoryName = input.category.trim();
  const category = await prisma.category.upsert({
    where: { slug: slugify(categoryName) },
    update: { name: categoryName },
    create: {
      name: categoryName,
      slug: slugify(categoryName)
    }
  });

  await prisma.product.update({
    where: { id },
    data: {
      categoryId: category.id,
      title: input.name,
      slug: input.slug,
      shortDescription: input.description,
      description: input.longDescription,
      badge: input.badge,
      firmness: input.firmness,
      material: input.material,
      support: input.support,
      feel: input.feel,
      featureBullets: input.features,
      status: input.status === "active" ? ProductStatus.ACTIVE : ProductStatus.DRAFT
    }
  });

  const existingVariants = await prisma.productVariant.findMany({
    where: { productId: id },
    select: { id: true }
  });

  if (existingVariants.length > 0) {
    await prisma.cartItem.deleteMany({
      where: {
        variantId: {
          in: existingVariants.map((variant) => variant.id)
        }
      }
    });
  }

  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productVariant.deleteMany({ where: { productId: id } });

  const gallery = Array.from(new Set([input.image, ...input.gallery].filter(Boolean)));
  await prisma.productImage.createMany({
    data: gallery.map((image, index) => ({
      productId: id,
      url: image,
      alt: `${input.name} image ${index + 1}`,
      sortOrder: index
    }))
  });

  await replaceProductVariants(id, input);

  const updated = await getProductEntityBySlug(input.slug);
  const normalizedUpdated = await ensureMattressVariantsReady(updated);

  if (!normalizedUpdated) {
    throw new Error("Unable to load updated product");
  }

  return toProductRecord(normalizedUpdated);
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}

export async function createContentEntry(input: Omit<ContentRecord, "id">) {
  await prisma.contentEntry.create({
    data: {
      type:
        input.type === "policy" ? ContentType.POLICY : input.type === "homepage" ? ContentType.HOMEPAGE : ContentType.GUIDE,
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      status: input.status === "active" ? ContentStatus.ACTIVE : ContentStatus.DRAFT
    }
  });
}

export async function updateContentEntry(id: string, input: Omit<ContentRecord, "id">) {
  await prisma.contentEntry.update({
    where: { id },
    data: {
      type:
        input.type === "policy" ? ContentType.POLICY : input.type === "homepage" ? ContentType.HOMEPAGE : ContentType.GUIDE,
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      status: input.status === "active" ? ContentStatus.ACTIVE : ContentStatus.DRAFT
    }
  });
}

export async function deleteContentEntry(id: string) {
  await prisma.contentEntry.delete({ where: { id } });
}
