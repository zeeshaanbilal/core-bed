import { BlogIndex } from "@/components/blog-index";
import { getBlogPosts } from "@/lib/mock-store";

export default async function GuidesPage() {
  const posts = await getBlogPosts();

  return <BlogIndex posts={posts} />;
}
