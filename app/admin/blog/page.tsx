import { createBlogPostAction, deleteBlogPostAction, updateBlogPostAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getBlogPosts } from "@/lib/mock-store";

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Blog</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Editorial management surface</h2>
      </div>

      <form action={createBlogPostAction} className="section-frame rounded-[1.75rem] p-6">
        <p className="font-serif text-3xl">Create article draft</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="title" placeholder="Article title" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="slug" placeholder="Slug" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="author" placeholder="Author" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="publishedAt" placeholder="2026-07-07" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="image" placeholder="Hero image URL" required />
          <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="excerpt" placeholder="Short article summary" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="categories" placeholder="All, Mattresses, Orthopedics" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="readTime" placeholder="Read time" type="number" />
          <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue="false" name="featured">
            <option value="false">Standard article</option>
            <option value="true">Featured article</option>
          </select>
        </div>
        <div className="mt-5">
          <FormSubmitButton idleLabel="Create article" pendingLabel="Saving..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
        </div>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="section-frame rounded-[1.75rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-bronze">{post.categories.join(", ")}</p>
                <h3 className="mt-3 font-serif text-3xl">{post.title}</h3>
                <p className="mt-2 text-sm text-slate">
                  {post.author} · {post.publishedAt}
                </p>
              </div>
              <form action={deleteBlogPostAction}>
                <input name="id" type="hidden" value={post.id} />
                <FormSubmitButton idleLabel="Delete" pendingLabel="Deleting..." className="rounded-full border border-[#e8b5b5] px-4 py-2 text-sm text-[#8a2b2b]" />
              </form>
            </div>

            <form action={updateBlogPostAction} className="mt-6 grid gap-4 md:grid-cols-2">
              <input name="id" type="hidden" value={post.id} />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={post.title} name="title" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={post.slug} name="slug" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={post.author} name="author" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={post.publishedAt} name="publishedAt" />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={post.image} name="image" required />
              <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={post.excerpt} name="excerpt" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={post.categories.join(", ")} name="categories" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={post.readTime} name="readTime" type="number" />
              <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={String(post.featured)} name="featured">
                <option value="false">Standard article</option>
                <option value="true">Featured article</option>
              </select>
              <div className="md:col-span-2">
                <FormSubmitButton idleLabel="Update article" pendingLabel="Updating..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
              </div>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
