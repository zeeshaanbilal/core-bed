import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog-index";
import { getBlogPosts } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Blog | Sleep Guides, Mattress Advice and Product Education",
  description:
    "Read Corebed blog articles about sleep comfort, mattress selection, cooling materials, orthopedic support, and practical buying guidance.",
  path: "/blog",
  keywords: ["sleep guides", "mattress blog", "pillow guide", "sleep advice"]
});

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return <BlogIndex posts={posts} />;
}
