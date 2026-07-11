import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog-index";
import { getBlogPosts } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Guides | Sleep Advice, Mattress Buying and Care",
  description:
    "Browse Corebed sleep guides for mattress buying, pillow selection, cooling comfort, and care advice.",
  path: "/guides",
  keywords: ["sleep guides", "mattress buying guide", "pillow advice", "sleep care"]
});

export default async function GuidesPage() {
  const posts = await getBlogPosts();

  return <BlogIndex posts={posts} />;
}
