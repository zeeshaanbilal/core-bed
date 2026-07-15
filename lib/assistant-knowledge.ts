import { getBlogPosts, getCatalogProducts, getContentEntries } from "@/lib/mock-store";
import {
  accountLinks,
  announcementItems,
  comfortFeatures,
  faqPreview,
  featureCards,
  guideHighlights,
  materialHighlights,
  navigation,
  storeLocations
} from "@/lib/site-data";

export type AssistantKnowledgeEntry = {
  id: string;
  kind: "product" | "post" | "content" | "feature" | "store" | "material" | "faq" | "navigation" | "account" | "announcement" | "guide";
  title: string;
  body: string;
  href?: string;
};

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

export async function getAssistantKnowledge() {
  const [products, posts, contentEntries] = await Promise.all([
    getCatalogProducts(),
    getBlogPosts(),
    getContentEntries()
  ]);

  const productEntries: AssistantKnowledgeEntry[] = products.map((product) => ({
    id: `product:${product.slug}`,
    kind: "product",
    title: product.name,
    href: getProductHref(product.category, product.slug),
    body: [
      product.category,
      product.description,
      product.longDescription,
      product.material,
      product.firmness,
      product.support,
      product.feel,
      product.features.join(" "),
      product.sizes.join(" "),
      product.firmnessOptions.join(" "),
      product.variants.map((variant) => `${variant.size} ${variant.firmness} ${variant.price}`).join(" ")
    ].join(" ")
  }));

  const postEntries: AssistantKnowledgeEntry[] = posts.map((post) => ({
    id: `post:${post.slug}`,
    kind: "post",
    title: post.title,
    href: `/blog/${post.slug}`,
    body: [
      post.excerpt,
      post.author,
      post.categories.join(" "),
      post.tags.join(" "),
      post.bodyIntro.join(" "),
      post.sections.map((section) => [section.heading, section.paragraphs.join(" "), section.bullets?.join(" ") ?? ""].join(" ")).join(" "),
      post.faq.map((faq) => `${faq.question} ${faq.answer}`).join(" ")
    ].join(" ")
  }));

  const contentItems: AssistantKnowledgeEntry[] = contentEntries.map((entry) => ({
    id: `content:${entry.slug}`,
    kind: "content",
    title: entry.title,
    href: `/${entry.slug}`,
    body: [entry.type, entry.summary, entry.status].join(" ")
  }));

  const featureEntries: AssistantKnowledgeEntry[] = featureCards.map((feature) => ({
    id: `feature:${feature.slug}`,
    kind: "feature",
    title: feature.title,
    href: `/features/${feature.slug}`,
    body: [feature.body, feature.detailTitle, feature.detailBody, feature.bullets.join(" ")].join(" ")
  }));

  const storeEntries: AssistantKnowledgeEntry[] = storeLocations.map((store) => ({
    id: `store:${store.slug}`,
    kind: "store",
    title: `${store.city} showroom`,
    href: `/store-locator/${store.slug}`,
    body: [store.address, store.city, store.state, store.postalCode, store.country, store.timing, store.phone, store.summary, store.mapQuery].join(" ")
  }));

  const materialEntries: AssistantKnowledgeEntry[] = materialHighlights.map((item, index) => ({
    id: `material:${index}`,
    kind: "material",
    title: `Material highlight ${index + 1}`,
    href: "/materials",
    body: item
  }));

  const faqEntries: AssistantKnowledgeEntry[] = faqPreview.map((item, index) => ({
    id: `faq:${index}`,
    kind: "faq",
    title: item,
    href: "/faq",
    body: item
  }));

  const guideEntries: AssistantKnowledgeEntry[] = guideHighlights.map((item, index) => ({
    id: `guide:${index}`,
    kind: "guide",
    title: item,
    href: "/blog",
    body: item
  }));

  const navigationEntries: AssistantKnowledgeEntry[] = navigation.flatMap((item) => [
    {
      id: `nav:${item.label}`,
      kind: "navigation" as const,
      title: item.label,
      href: item.href,
      body: item.groups.map((group) => `${group.title} ${group.links.map((link) => link.label).join(" ")}`).join(" ")
    },
    ...item.groups.flatMap((group) =>
      group.links.map((link) => ({
        id: `nav-link:${link.href}`,
        kind: "navigation" as const,
        title: link.label,
        href: link.href,
        body: `${item.label} ${group.title} ${link.label}`
      }))
    )
  ]);

  const accountEntries: AssistantKnowledgeEntry[] = accountLinks.map((item) => ({
    id: `account:${item.href}`,
    kind: "account",
    title: item.label,
    href: item.href,
    body: `Account access ${item.label}`
  }));

  const announcementEntries: AssistantKnowledgeEntry[] = announcementItems.map((item, index) => ({
    id: `announcement:${index}`,
    kind: "announcement",
    title: item,
    body: item
  }));

  const comfortEntries: AssistantKnowledgeEntry[] = comfortFeatures.map((item, index) => ({
    id: `comfort:${index}`,
    kind: "feature",
    title: item.title,
    body: item.body
  }));

  return [
    ...productEntries,
    ...postEntries,
    ...contentItems,
    ...featureEntries,
    ...storeEntries,
    ...materialEntries,
    ...faqEntries,
    ...guideEntries,
    ...navigationEntries,
    ...accountEntries,
    ...announcementEntries,
    ...comfortEntries
  ];
}
