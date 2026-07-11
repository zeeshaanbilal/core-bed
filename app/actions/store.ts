"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureCartSessionId } from "@/lib/cart-session";
import { getCurrentUser, requireAdminUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site-url";
import { createStripeEmbeddedCheckoutSession, isStripeServerReady } from "@/lib/stripe";
import {
  addCartItem,
  addWishlistItem,
  createBlogPost,
  createContentEntry,
  createOrderFromCart,
  createProduct,
  createTestimonial,
  deleteBlogPost,
  deleteContentEntry,
  deleteProduct,
  getCartDetail,
  moderateTestimonial,
  removeCartItem,
  removeWishlistItem,
  updateBlogPost,
  updateCartItem,
  updateContentEntry,
  updateOrderStatus,
  updateProduct,
  upsertCustomerProfile
} from "@/lib/mock-store";
import type { PaymentMethod } from "@/lib/store-types";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

async function assertAdminUser() {
  const user = await requireAdminUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
}

export async function addToCartAction(formData: FormData) {
  const sessionId = await ensureCartSessionId();
  await addCartItem({
    sessionId,
    productSlug: getString(formData, "productSlug"),
    selectedSize: getString(formData, "selectedSize"),
    selectedFirmness: getString(formData, "selectedFirmness"),
    quantity: getNumber(formData, "quantity", 1)
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/pillows");
  revalidatePath("/accessories");
  revalidatePath("/cart");
}

export async function updateCartQuantityAction(formData: FormData) {
  const sessionId = await ensureCartSessionId();
  await updateCartItem({
    sessionId,
    itemId: getString(formData, "itemId"),
    quantity: getNumber(formData, "quantity", 1)
  });

  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const sessionId = await ensureCartSessionId();
  await removeCartItem(sessionId, getString(formData, "itemId"));
  revalidatePath("/cart");
  revalidatePath("/");
}

export async function submitCheckoutAction(formData: FormData) {
  const sessionId = await ensureCartSessionId();
  const paymentMethod: PaymentMethod = "stripe_card";
  const customerName = getString(formData, "customerName");
  const customerEmail = getString(formData, "customerEmail");
  const customerPhone = getString(formData, "customerPhone");
  const city = getString(formData, "city");
  const addressLine1 = getString(formData, "addressLine1");
  const addressLine2 = getString(formData, "addressLine2");
  const state = getString(formData, "state");
  const postalCode = getString(formData, "postalCode");
  const country = getString(formData, "country") || "Pakistan";
  const notes = getString(formData, "notes");

  await upsertCustomerProfile({
    email: customerEmail,
    name: customerName,
    phone: customerPhone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country
  });

  if (!isStripeServerReady()) {
    redirect("/checkout?error=Stripe%20is%20not%20configured%20yet.%20Add%20live%20keys%20to%20enable%20card%20checkout.");
  }

  const cart = await getCartDetail(sessionId);

  if (cart.items.length === 0) {
    redirect("/checkout?error=Your%20cart%20is%20empty.");
  }

  const siteUrl = getSiteUrl();
  const checkoutSession = await createStripeEmbeddedCheckoutSession({
    customerEmail,
    returnUrl: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      cartSessionId: sessionId,
      customerName,
      customerEmail,
      customerPhone,
      city,
      addressLine1,
      addressLine2,
      state,
      postalCode,
      country,
      notes
    },
    lineItems: [
      ...cart.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "pkr",
          product_data: {
            name: item.product.name,
            description: `${item.selectedSize} / ${item.selectedFirmness || item.product.firmness} / ${item.product.category}`,
            images: item.product.gallery.slice(0, 1)
          },
          unit_amount: Math.round(item.unitPrice * 100)
        }
      })),
      ...(cart.shippingFee > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "pkr",
                product_data: {
                  name: "Shipping"
                },
                unit_amount: Math.round(cart.shippingFee * 100)
              }
            }
          ]
        : [])
    ]
  });

  if (!checkoutSession.id || !checkoutSession.client_secret) {
    redirect("/checkout?error=Unable%20to%20start%20Stripe%20embedded%20checkout.");
  }

  await createOrderFromCart({
    sessionId,
    customerName,
    customerEmail,
    customerPhone,
    city,
    addressLine1,
    addressLine2,
    state,
    postalCode,
    country,
    notes,
    paymentMethod,
    paymentReference: checkoutSession.id,
    paymentClientSecret: checkoutSession.client_secret,
    paymentStatus: checkoutSession.payment_status || "unpaid",
    orderStatus: "PENDING",
    clearCart: false
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");

  redirect(`/checkout?embedded=1&payment_reference=${checkoutSession.id}`);
}

export async function updateOrderStatusAction(formData: FormData) {
  await assertAdminUser();

  await updateOrderStatus({
    id: getString(formData, "id"),
    orderStatus: getString(formData, "orderStatus") as "PENDING" | "PROCESSING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED",
    paymentStatus: getString(formData, "paymentStatus") || "pending",
    shippingStatus: getString(formData, "shippingStatus") || "order_received"
  });

  revalidatePath("/admin/orders");
  revalidatePath("/track-order");
}

export async function createProductAction(formData: FormData) {
  await assertAdminUser();
  const slug = getString(formData, "slug");

  await createProduct({
    slug,
    name: getString(formData, "name"),
    category: getString(formData, "category"),
    description: getString(formData, "description"),
    longDescription: getString(formData, "longDescription"),
    price: getNumber(formData, "price", 0),
    compareAtPrice: getNumber(formData, "compareAtPrice", 0),
    badge: getString(formData, "badge"),
    firmness: getString(formData, "firmness"),
    material: getString(formData, "material"),
    image: getString(formData, "image"),
    gallery: getString(formData, "gallery")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    features: getString(formData, "features")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    sizes: getString(formData, "sizes")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    firmnessOptions: [],
    variants: [],
    variantMatrix: getString(formData, "variantMatrix"),
    support: getString(formData, "support"),
    feel: getString(formData, "feel"),
    status: getString(formData, "status") === "active" ? "active" : "draft",
    inventory: getNumber(formData, "inventory", 0)
  });

  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  await assertAdminUser();

  await updateProduct(getString(formData, "id"), {
    slug: getString(formData, "slug"),
    name: getString(formData, "name"),
    category: getString(formData, "category"),
    description: getString(formData, "description"),
    longDescription: getString(formData, "longDescription"),
    price: getNumber(formData, "price", 0),
    compareAtPrice: getNumber(formData, "compareAtPrice", 0),
    badge: getString(formData, "badge"),
    firmness: getString(formData, "firmness"),
    material: getString(formData, "material"),
    image: getString(formData, "image"),
    gallery: getString(formData, "gallery")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    features: getString(formData, "features")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    sizes: getString(formData, "sizes")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    firmnessOptions: [],
    variants: [],
    variantMatrix: getString(formData, "variantMatrix"),
    support: getString(formData, "support"),
    feel: getString(formData, "feel"),
    status: getString(formData, "status") === "active" ? "active" : "draft",
    inventory: getNumber(formData, "inventory", 0)
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/pillows");
  revalidatePath("/accessories");
  revalidatePath("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await assertAdminUser();
  await deleteProduct(getString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/pillows");
  revalidatePath("/accessories");
  revalidatePath("/admin/products");
}

export async function createContentAction(formData: FormData) {
  await assertAdminUser();
  const rawType = getString(formData, "type");
  const type = rawType === "guide" || rawType === "policy" || rawType === "homepage" ? rawType : "guide";
  await createContentEntry({
    type,
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    summary: getString(formData, "summary"),
    status: getString(formData, "status") === "active" ? "active" : "draft"
  });

  revalidatePath("/guides");
  revalidatePath("/blog");
  revalidatePath("/faq");
  revalidatePath("/admin/content");
}

export async function updateContentAction(formData: FormData) {
  await assertAdminUser();
  const rawType = getString(formData, "type");
  const type = rawType === "guide" || rawType === "policy" || rawType === "homepage" ? rawType : "guide";
  await updateContentEntry(getString(formData, "id"), {
    type,
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    summary: getString(formData, "summary"),
    status: getString(formData, "status") === "active" ? "active" : "draft"
  });

  revalidatePath("/guides");
  revalidatePath("/blog");
  revalidatePath("/faq");
  revalidatePath("/admin/content");
}

export async function deleteContentAction(formData: FormData) {
  await assertAdminUser();
  await deleteContentEntry(getString(formData, "id"));
  revalidatePath("/guides");
  revalidatePath("/faq");
  revalidatePath("/admin/content");
}

export async function addWishlistAction(formData: FormData) {
  const sessionId = await ensureCartSessionId();
  const user = await getCurrentUser();
  await addWishlistItem(sessionId, getString(formData, "productSlug"), user?.email);
  const returnTo = getString(formData, "returnTo");
  revalidatePath("/wishlist");
  revalidatePath("/shop");
  revalidatePath("/pillows");
  revalidatePath("/accessories");
  if (returnTo) {
    redirect(returnTo);
  }
}

export async function removeWishlistAction(formData: FormData) {
  const sessionId = await ensureCartSessionId();
  const user = await getCurrentUser();
  await removeWishlistItem(sessionId, getString(formData, "productSlug"), user?.email);
  const returnTo = getString(formData, "returnTo");
  revalidatePath("/wishlist");
  revalidatePath("/shop");
  revalidatePath("/pillows");
  revalidatePath("/accessories");
  if (returnTo) {
    redirect(returnTo);
  }
}

export async function createBlogPostAction(formData: FormData) {
  await assertAdminUser();
  await createBlogPost({
    slug: getString(formData, "slug"),
    title: getString(formData, "title"),
    excerpt: getString(formData, "excerpt"),
    image: getString(formData, "image"),
    author: getString(formData, "author"),
    publishedAt: getString(formData, "publishedAt") || new Date().toISOString().slice(0, 10),
    categories: getString(formData, "categories")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    featured: getString(formData, "featured") === "true",
    readTime: getNumber(formData, "readTime", 5)
  });

  revalidatePath("/blog");
  revalidatePath("/guides");
  revalidatePath("/admin/blog");
}

export async function updateBlogPostAction(formData: FormData) {
  await assertAdminUser();
  await updateBlogPost(getString(formData, "id"), {
    slug: getString(formData, "slug"),
    title: getString(formData, "title"),
    excerpt: getString(formData, "excerpt"),
    image: getString(formData, "image"),
    author: getString(formData, "author"),
    publishedAt: getString(formData, "publishedAt") || new Date().toISOString().slice(0, 10),
    categories: getString(formData, "categories")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    featured: getString(formData, "featured") === "true",
    readTime: getNumber(formData, "readTime", 5)
  });

  revalidatePath("/blog");
  revalidatePath("/guides");
  revalidatePath("/admin/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await assertAdminUser();
  await deleteBlogPost(getString(formData, "id"));
  revalidatePath("/blog");
  revalidatePath("/guides");
  revalidatePath("/admin/blog");
}

export async function submitTestimonialAction(formData: FormData) {
  const user = await getCurrentUser();
  const productSlug = getString(formData, "productSlug");
  const returnTo = getString(formData, "returnTo");

  await createTestimonial({
    productSlug,
    customerName: getString(formData, "customerName"),
    customerCity: getString(formData, "customerCity"),
    rating: getNumber(formData, "rating", 5),
    title: getString(formData, "title"),
    body: getString(formData, "body"),
    userEmail: user?.email
  });

  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath(`/shop/${productSlug}`);
  revalidatePath(`/pillows/${productSlug}`);
  revalidatePath(`/accessories/${productSlug}`);

  if (returnTo) {
    redirect(`${returnTo}?review=submitted`);
  }
}

export async function moderateTestimonialAction(formData: FormData) {
  await assertAdminUser();

  await moderateTestimonial({
    id: getString(formData, "id"),
    status: (getString(formData, "status") as "approved" | "rejected" | "pending") || "pending",
    featuredOnHome: getString(formData, "featuredOnHome") === "true"
  });

  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin/testimonials");
}
