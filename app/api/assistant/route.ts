import { NextRequest, NextResponse } from "next/server";

import { getAssistantKnowledge } from "@/lib/assistant-knowledge";
import { getBlogPosts, getCatalogProducts } from "@/lib/mock-store";
import { storeLocations } from "@/lib/site-data";

function getProductHref(category: string, slug: string) {
  const normalized = category.toLowerCase();

  if (normalized === "pillows") {
    return `/pillows/${slug}`;
  }

  if (normalized === "accessories") {
    return `/accessories/${slug}`;
  }

  return `/shop/${slug}`;
}

function scoreTextMatch(message: string, value: string) {
  const terms = Array.from(new Set(message.toLowerCase().split(/\s+/).filter((term) => term.length > 2)));
  const target = value.toLowerCase();
  return terms.reduce((score, term) => score + (target.includes(term) ? 1 : 0), 0);
}

function includesAny(message: string, terms: string[]) {
  return terms.some((term) => message.includes(term));
}

function getPathContext(pathname?: string) {
  if (!pathname) {
    return {
      label: "storefront",
      suggestions: [
        "Recommend a mattress for back support",
        "Show cooling pillow options",
        "What is your delivery and payment flow?",
        "Find accessories for office comfort"
      ]
    };
  }

  if (pathname.startsWith("/shop")) {
    return {
      label: "mattress collection",
      suggestions: [
        "Compare soft and hard mattress options",
        "Which mattress is better for back support?",
        "Show premium mattress options",
        "Explain mattress sizes and pricing"
      ]
    };
  }

  if (pathname.startsWith("/pillows")) {
    return {
      label: "pillow collection",
      suggestions: [
        "Show cooling pillow options",
        "Which pillow is best for neck pain?",
        "Compare memory and latex pillows",
        "Find the softest pillow option"
      ]
    };
  }

  if (pathname.startsWith("/accessories")) {
    return {
      label: "accessories collection",
      suggestions: [
        "Find accessories for office comfort",
        "Show posture support accessories",
        "Recommend travel support products",
        "Which accessory is best for seat support?"
      ]
    };
  }

  if (pathname.startsWith("/blog")) {
    return {
      label: "blog library",
      suggestions: [
        "Show buying guides for mattresses",
        "Find blog posts about back pain",
        "Recommend pillow care articles",
        "Show the latest featured articles"
      ]
    };
  }

  if (pathname.startsWith("/checkout")) {
    return {
      label: "checkout",
      suggestions: [
        "What payment methods are available?",
        "How does delivery work after payment?",
        "How do I track my order?",
        "How can I contact support?"
      ]
    };
  }

  return {
    label: "storefront",
    suggestions: [
      "Recommend a mattress for back support",
      "Show cooling pillow options",
      "What is your delivery and payment flow?",
      "Find accessories for office comfort"
    ]
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { message?: string; pathname?: string };
  const message = body.message?.trim() ?? "";
  const context = getPathContext(body.pathname);
  const normalizedMessage = message.toLowerCase();
  const primaryStore = storeLocations[0];

  if (!message || message === "__intro__") {
    const [products, posts] = await Promise.all([getCatalogProducts(), getBlogPosts()]);
    const categoryNames = Array.from(new Set(products.map((product) => product.category))).slice(0, 3);

    return NextResponse.json({
      answer: `You are in the ${context.label}. I can answer with live catalog and content data across ${categoryNames.join(", ").toLowerCase()}, delivery help, support guidance, and the latest published articles.`,
      suggestions: context.suggestions,
      links: []
    });
  }

  const knowledge = await getAssistantKnowledge();
  const products = await getCatalogProducts();

  const rankedProducts = products
    .map((product) => ({
      product,
      score: scoreTextMatch(
        message,
        [product.name, product.category, product.description, product.material, product.support, product.feel, product.slug].join(" ")
      )
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const rankedKnowledge = knowledge
    .map((entry) => ({
      entry,
      score: scoreTextMatch(message, [entry.title, entry.body, entry.kind].join(" "))
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  const answerParts: string[] = [];
  const links: Array<{ label: string; href: string }> = [];

  if (
    includesAny(normalizedMessage, [
      "address",
      "location",
      "store",
      "showroom",
      "where are you",
      "where located",
      "visit"
    ])
  ) {
    answerParts.push(
      `Our main store location is ${primaryStore.address}, ${primaryStore.city}, ${primaryStore.state} ${primaryStore.postalCode}, ${primaryStore.country}. Visits are ${primaryStore.timing.toLowerCase()} and support is available on ${primaryStore.phone}.`
    );
    links.push({ label: "Store locator", href: "/store-locator" });
    links.push({ label: "Store details", href: `/store-locator/${primaryStore.slug}` });
  }

  if (includesAny(normalizedMessage, ["phone", "call", "whatsapp", "contact number", "number"])) {
    answerParts.push(`You can reach Corebed support on WhatsApp or phone at ${primaryStore.phone}.`);
    links.push({ label: "Contact store", href: `/store-locator/${primaryStore.slug}` });
  }

  if (includesAny(normalizedMessage, ["email", "mail", "contact"])) {
    answerParts.push("You can contact Corebed by email at contact@corebed.com.");
    links.push({ label: "Account", href: "/account" });
  }

  if (includesAny(normalizedMessage, ["hours", "timing", "open", "closing", "appointment"])) {
    answerParts.push(`The current showroom visit schedule is ${primaryStore.timing}.`);
    links.push({ label: "Showroom timings", href: `/store-locator/${primaryStore.slug}` });
  }

  if (includesAny(normalizedMessage, ["track", "order status", "my order"])) {
    answerParts.push("You can follow your order progress from the track order page once your order reference is available.");
    links.push({ label: "Track order", href: "/track-order" });
  }

  if (rankedProducts.length > 0) {
    const primary = rankedProducts[0].product;
    answerParts.push(
      `${primary.name} is a ${primary.category.toLowerCase()} option with ${primary.material.toLowerCase()} materials and ${primary.firmness.toLowerCase()} comfort. It currently starts from ${primary.price.toFixed(2)} and is available in sizes such as ${primary.sizes.join(", ")}.`
    );
    links.push({
      label: primary.name,
      href: getProductHref(primary.category, primary.slug)
    });
  }

  const rankedKnowledgeLinks = rankedKnowledge
    .filter((item) => item.entry.href)
    .slice(0, 4)
    .map((item) => ({
      label: item.entry.title,
      href: item.entry.href as string
    }));

  const contextualEntries = rankedKnowledge
    .filter((item) => item.entry.kind !== "product")
    .slice(0, 3);

  if (contextualEntries.length > 0) {
    answerParts.push(
      `I also found relevant site context in ${contextualEntries.map((item) => item.entry.title).join(", ")}.`
    );
  }

  if (includesAny(normalizedMessage, ["delivery", "shipping", "dispatch", "ship"])) {
    answerParts.push("Delivery, store support, and follow-up order help are handled through the checkout, track order, and store locator pages.");
    links.push({ label: "Track order", href: "/track-order" });
    links.push({ label: "Store locator", href: "/store-locator" });
  }

  if (includesAny(normalizedMessage, ["payment", "pay", "card", "stripe", "checkout"])) {
    answerParts.push("The site supports embedded Stripe card checkout directly on-page for a faster purchase flow.");
    links.push({ label: "Checkout", href: "/checkout" });
  }

  if (answerParts.length === 0) {
    answerParts.push(
      "I can help with mattresses, pillows, accessories, pricing, sizes, firmness, store address, delivery, payment, and blog guides. Try asking for a product type, a support need, or store contact details."
    );
    links.push({ label: "Shop mattresses", href: "/shop" });
    links.push({ label: "Store locator", href: "/store-locator" });
  }

  return NextResponse.json({
    answer: answerParts.join(" "),
    suggestions: context.suggestions,
    links: [...links, ...rankedKnowledgeLinks]
      .filter((link, index, current) => current.findIndex((item) => item.href === link.href) === index)
      .slice(0, 4)
  });
}
