import { NextRequest, NextResponse } from "next/server";

import { getBlogPosts, getCatalogProducts, getContentEntries } from "@/lib/mock-store";

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

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { message?: string; pathname?: string };
  const message = body.message?.trim() ?? "";

  if (!message) {
    return NextResponse.json({
      answer: "Ask about mattresses, pillows, accessories, support, payment, delivery, or blog guides.",
      suggestions: [],
      links: []
    });
  }

  const [products, posts, content] = await Promise.all([
    getCatalogProducts(),
    getBlogPosts(),
    getContentEntries()
  ]);

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

  const rankedPosts = posts
    .map((post) => ({
      post,
      score: scoreTextMatch(message, [post.title, post.excerpt, post.categories.join(" "), post.tags.join(" ")].join(" "))
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);

  const rankedContent = content
    .map((entry) => ({
      entry,
      score: scoreTextMatch(message, [entry.title, entry.summary, entry.slug, entry.type].join(" "))
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);

  const answerParts: string[] = [];
  const links: Array<{ label: string; href: string }> = [];

  if (rankedProducts.length > 0) {
    const primary = rankedProducts[0].product;
    answerParts.push(
      `${primary.name} is a ${primary.category.toLowerCase()} option with ${primary.material.toLowerCase()} and ${primary.firmness.toLowerCase()} comfort. It starts from ${primary.price.toFixed(2)} and supports sizes like ${primary.sizes.join(", ")}.`
    );
    links.push({
      label: primary.name,
      href: getProductHref(primary.category, primary.slug)
    });
  }

  if (rankedPosts.length > 0) {
    const primaryPost = rankedPosts[0].post;
    answerParts.push(`For buying guidance, read "${primaryPost.title}" from the blog.`);
    links.push({
      label: "Read guide",
      href: `/blog/${primaryPost.slug}`
    });
  }

  if (rankedContent.length > 0) {
    answerParts.push(`Related site information is also available in ${rankedContent.map((item) => item.entry.title).join(", ")}.`);
  }

  if (message.toLowerCase().includes("delivery") || message.toLowerCase().includes("shipping")) {
    answerParts.push("Delivery, store support, and follow-up order help are handled through the checkout, track order, and store locator pages.");
    links.push({ label: "Track order", href: "/track-order" });
    links.push({ label: "Store locator", href: "/store-locator" });
  }

  if (message.toLowerCase().includes("payment")) {
    answerParts.push("The site supports embedded Stripe card checkout directly on-page, with bank transfer and cash on delivery flow options also present in checkout.");
    links.push({ label: "Checkout", href: "/checkout" });
  }

  if (answerParts.length === 0) {
    answerParts.push(
      "I can help with mattresses, pillows, accessories, product variants, blog guides, support pages, store locations, and checkout information. Try asking by product type, firmness, material, or a specific need like back support or cooling."
    );
  }

  return NextResponse.json({
    answer: answerParts.join(" "),
    suggestions: [],
    links: links.slice(0, 4)
  });
}
