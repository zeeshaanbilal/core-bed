import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticleView } from "@/components/blog-article-view";
import { StructuredData } from "@/components/structured-data";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/mock-store";
import { buildArticleSchema, buildBreadcrumbSchema, buildFaqSchema, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Article not found | Corebed Blog",
      description: "The requested Corebed article could not be found.",
      path: `/blog/${slug}`
    });
  }

  return buildMetadata({
    title: `${post.title} | Corebed Blog`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
    keywords: [...post.categories, ...post.tags]
  });
}

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

  return (
    <>
      <StructuredData
        data={[
          buildArticleSchema(post, `/blog/${post.slug}`),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` }
          ]),
          buildFaqSchema(post.faq)
        ]}
      />
      <BlogArticleView post={post} relatedPosts={relatedPosts} recentPosts={recentPosts} />
    </>
  );
}
