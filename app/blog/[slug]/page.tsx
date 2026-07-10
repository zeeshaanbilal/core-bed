import { notFound } from "next/navigation";

import { BlogArticleView } from "@/components/blog-article-view";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function BlogArticlePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts()]);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.relatedSlugs
    .map((relatedSlug) => allPosts.find((entry) => entry.slug === relatedSlug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 3);

  const recentPosts = allPosts.filter((entry) => entry.slug !== post.slug).slice(0, 6);

  return <BlogArticleView post={post} relatedPosts={relatedPosts} recentPosts={recentPosts} />;
}
