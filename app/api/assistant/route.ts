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

  if (!message || message === "__intro__") {
    const [products, posts] = await Promise.all([getCatalogProducts(), getBlogPosts()]);
    const categoryNames = Array.from(new Set(products.map((product) => product.category))).slice(0, 3);

    return NextResponse.json({
      answer: `You are in the ${context.label}. I can answer with live catalog and content data across ${categoryNames.join(", ").toLowerCase()}, delivery help, support guidance, and the latest published articles.`,
      suggestions: context.suggestions,
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
      `${primary.name} is a ${primary.category.toLowerCase()} option with ${primary.material.toLowerCase()} materials and ${primary.firmness.toLowerCase()} comfort. It currently starts from ${primary.price.toFixed(2)} and is available in sizes such as ${primary.sizes.join(", ")}.`
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
    answerParts.push("The site supports embedded Stripe card checkout directly on-page for a faster purchase flow.");
    links.push({ label: "Checkout", href: "/checkout" });
  }

  if (answerParts.length === 0) {
    answerParts.push(
      "I can help with mattresses, pillows, accessories, product variants, blog guides, support pages, store locations, and checkout information. Try asking by product type, firmness, material, or a specific need like back support or cooling."
    );
  }

  return NextResponse.json({
    answer: answerParts.join(" "),
    suggestions: context.suggestions,
    links: links.slice(0, 4)
  });
}
