import { promises as fs } from "fs";
import path from "path";

import {
  ContentStatus,
  ContentType,
  PrismaClient,
  ProductStatus,
  ReviewStatus,
  UserRole
} from "@prisma/client";

import type { BlogPostRecord, ContentRecord, OrderRecord, ProductRecord } from "@/lib/store-types";

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), "data");

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toProductStatus(status: ProductRecord["status"]) {
  return status === "active" ? ProductStatus.ACTIVE : ProductStatus.DRAFT;
}

function toContentStatus(status: ContentRecord["status"]) {
  return status === "active" ? ContentStatus.ACTIVE : ContentStatus.DRAFT;
}

function toContentType(type: ContentRecord["type"]) {
  switch (type) {
    case "policy":
      return ContentType.POLICY;
    case "homepage":
      return ContentType.HOMEPAGE;
    default:
      return ContentType.GUIDE;
  }
}

async function readJsonFile<T>(fileName: string) {
  const filePath = path.join(dataDir, fileName);
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents) as T;
}

async function seedAdminUsers() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: {
        role: UserRole.ADMIN
      },
      create: {
        email,
        name: "Corebed Admin",
        role: UserRole.ADMIN
      }
    });
  }
}

async function seedProducts() {
  const [mattresses, pillows, accessories] = await Promise.all([
    readJsonFile<ProductRecord[]>("products.json"),
    readJsonFile<ProductRecord[]>("pillows.json"),
    readJsonFile<ProductRecord[]>("accessories.json")
  ]);

  const products = [...mattresses, ...pillows, ...accessories];
  const categoryCache = new Map<string, string>();

  for (const record of products) {
    const categoryName = record.category.trim();
    const categorySlug =
      categoryName.toLowerCase() === "mattresses"
        ? "mattresses"
        : categoryName.toLowerCase() === "pillows"
          ? "pillows"
          : categoryName.toLowerCase() === "accessories"
            ? "accessories"
            : slugify(categoryName);

    let categoryId = categoryCache.get(categorySlug);

    if (!categoryId) {
      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: {
          name: categoryName,
          description: `${categoryName} collection`
        },
        create: {
          name: categoryName,
          slug: categorySlug,
          description: `${categoryName} collection`
        }
      });

      categoryId = category.id;
      categoryCache.set(categorySlug, category.id);
    }

    const product = await prisma.product.upsert({
      where: { slug: record.slug },
      update: {
        categoryId,
        title: record.name,
        brand: "Corebed",
        shortDescription: record.description,
        description: record.longDescription,
        badge: record.badge,
        firmness: record.firmness,
        material: record.material,
        support: record.support,
        feel: record.feel,
        featureBullets: record.features,
        featured: record.badge.toLowerCase().includes("best") || record.badge.toLowerCase().includes("luxury"),
        status: toProductStatus(record.status),
        ratingAverage: record.rating,
        reviewCount: record.reviewCount
      },
      create: {
        categoryId,
        title: record.name,
        slug: record.slug,
        brand: "Corebed",
        shortDescription: record.description,
        description: record.longDescription,
        badge: record.badge,
        firmness: record.firmness,
        material: record.material,
        support: record.support,
        feel: record.feel,
        featureBullets: record.features,
        featured: record.badge.toLowerCase().includes("best") || record.badge.toLowerCase().includes("luxury"),
        status: toProductStatus(record.status),
        ratingAverage: record.rating,
        reviewCount: record.reviewCount
      }
    });

    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: product.id },
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

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });

    const gallery = Array.from(new Set([record.image, ...record.gallery]));

    for (const [index, image] of gallery.entries()) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: image,
          alt: `${record.name} image ${index + 1}`,
          sortOrder: index
        }
      });
    }

    const sizeCount = Math.max(record.sizes.length, 1);
    const baseStock = Math.max(1, Math.floor(record.inventory / sizeCount));
    const extra = Math.max(0, record.inventory - baseStock * sizeCount);

    for (const [index, size] of record.sizes.entries()) {
      const originalPrice = record.compareAtPrice && record.compareAtPrice > record.price ? record.compareAtPrice : record.price;
      const salePrice = record.compareAtPrice && record.compareAtPrice > record.price ? record.price : null;

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `${record.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${size.toUpperCase()}`,
          size,
          firmness: record.firmness,
          height: "Standard",
          price: originalPrice,
          salePrice,
          stock: baseStock + (index < extra ? 1 : 0)
        }
      });
    }
  }
}

async function seedContent() {
  const entries = await readJsonFile<ContentRecord[]>("content.json");

  for (const entry of entries) {
    await prisma.contentEntry.upsert({
      where: { slug: entry.slug },
      update: {
        title: entry.title,
        summary: entry.summary,
        type: toContentType(entry.type),
        status: toContentStatus(entry.status)
      },
      create: {
        title: entry.title,
        slug: entry.slug,
        summary: entry.summary,
        type: toContentType(entry.type),
        status: toContentStatus(entry.status)
      }
    });
  }
}

async function seedBlogPosts() {
  const posts = await readJsonFile<BlogPostRecord[]>("blog-posts.json");

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        image: post.image,
        category: post.categories[0] ?? "All",
        categories: post.categories,
        content: JSON.stringify({
          bodyIntro: post.bodyIntro,
          sections: post.sections,
          faq: post.faq
        }),
        author: post.author,
        featured: post.featured,
        readTime: post.readTime,
        bodyIntro: post.bodyIntro,
        sections: post.sections,
        faq: post.faq,
        tags: post.tags,
        relatedSlugs: post.relatedSlugs,
        status: ContentStatus.ACTIVE,
        seoTitle: post.title,
        seoSummary: post.excerpt,
        publishedAt: new Date(post.publishedAt)
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        image: post.image,
        category: post.categories[0] ?? "All",
        categories: post.categories,
        content: JSON.stringify({
          bodyIntro: post.bodyIntro,
          sections: post.sections,
          faq: post.faq
        }),
        author: post.author,
        featured: post.featured,
        readTime: post.readTime,
        bodyIntro: post.bodyIntro,
        sections: post.sections,
        faq: post.faq,
        tags: post.tags,
        relatedSlugs: post.relatedSlugs,
        status: ContentStatus.ACTIVE,
        seoTitle: post.title,
        seoSummary: post.excerpt,
        publishedAt: new Date(post.publishedAt)
      }
    });
  }
}

async function seedOrders() {
  const orders = await readJsonFile<OrderRecord[]>("orders.json");

  for (const order of orders) {
    await prisma.order.deleteMany({
      where: { orderNumber: order.orderNumber }
    });

    await prisma.order.create({
      data: {
        orderNumber: order.orderNumber,
        status: order.orderStatus === "processing" ? "PROCESSING" : "PENDING",
        paymentStatus: order.paymentStatus,
        shippingStatus: order.orderStatus,
        subtotalAmount: order.subtotal,
        shippingAmount: order.shippingFee,
        totalAmount: order.total,
        addressSnapshot: {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          city: order.city,
          address: order.address,
          notes: order.notes,
          sessionId: order.sessionId
        },
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.createdAt),
        items: {
          create: order.items.map((item) => ({
            productSnapshot: item,
            quantity: item.quantity,
            price: item.unitPrice,
            discount: 0
          }))
        },
        payments: {
          create: {
            provider:
              order.paymentMethod === "stripe_card"
                ? "stripe"
                : order.paymentMethod === "bank_transfer"
                  ? "bank_transfer"
                  : "cash_on_delivery",
            providerSessionId: order.paymentReference,
            status: order.paymentStatus,
            amount: order.total,
            currency: "PKR"
          }
        }
      }
    });
  }
}

async function main() {
  await seedAdminUsers();
  await seedProducts();
  await seedContent();
  await seedBlogPosts();
  await seedOrders();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
