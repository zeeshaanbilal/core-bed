import Link from "next/link";

import type { BlogPostRecord } from "@/lib/store-types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export function BlogArticleView({
  post,
  relatedPosts,
  recentPosts
}: {
  post: BlogPostRecord;
  relatedPosts: BlogPostRecord[];
  recentPosts: BlogPostRecord[];
}) {
  const sidebarCategories = ["Accessories", "All", "Featured Blogs", "Mattresses", "Orthopedics", "Pillows", "Sleep Science Pakistan", "The Diamond Way"];

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.35fr_0.65fr]">
        <article>
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">{post.categories.join(" • ")}</p>
            <h1 className="mt-4 font-serif text-6xl font-semibold leading-[0.95] tracking-[-0.07em] text-navy">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.18em] text-slate">
              <span>{post.author}</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-[#f4f0e7]">
            <div className="h-[620px] w-full bg-cover bg-center" style={{ backgroundImage: `url(${post.image})` }} />
          </div>

          <div className="mt-10 space-y-6 text-[15px] leading-8 text-slate">
            {post.bodyIntro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-14 space-y-12">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-4xl font-semibold tracking-[-0.05em] text-navy">{section.heading}</h2>
                <div className="mt-5 space-y-5 text-[15px] leading-8 text-slate">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-6 list-disc space-y-2 pl-6 text-[15px] leading-8 text-slate">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <section className="mt-14">
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-navy">FAQs</h2>
            <div className="mt-6 space-y-5">
              {post.faq.map((item) => (
                <div key={item.question} className="rounded-[1.25rem] border border-ink/10 bg-white p-6">
                  <h3 className="text-xl font-semibold text-navy">{item.question}</h3>
                  <p className="mt-3 text-[15px] leading-8 text-slate">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-12 flex flex-wrap gap-3">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-ink/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-16 grid gap-8 rounded-[1.5rem] bg-[#f8f4ec] p-8 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Previous post</p>
              <Link href={`/blog/${recentPosts[1]?.slug ?? recentPosts[0]?.slug ?? post.slug}`} className="mt-3 block text-xl font-semibold text-navy">
                {recentPosts[1]?.title ?? recentPosts[0]?.title ?? post.title}
              </Link>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Next post</p>
              <Link href={`/blog/${relatedPosts[0]?.slug ?? post.slug}`} className="mt-3 block text-xl font-semibold text-navy">
                {relatedPosts[0]?.title ?? post.title}
              </Link>
            </div>
          </div>
        </article>

        <aside className="space-y-10">
          <div className="rounded-[1.5rem] border border-ink/10 bg-white p-6">
            <p className="text-2xl font-semibold tracking-[-0.04em] text-navy">Search</p>
            <div className="mt-5 flex gap-3">
              <input className="min-h-[48px] flex-1 rounded-lg border border-ink/10 px-4 text-sm" placeholder="Search article" />
              <button className="rounded-lg bg-navy px-5 text-sm font-semibold text-white">Search</button>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-ink/10 bg-white p-6">
            <p className="text-2xl font-semibold tracking-[-0.04em] text-navy">Categories</p>
            <div className="mt-5 space-y-3 text-sm">
              {sidebarCategories.map((category) => (
                <Link key={category} href="/blog" className="block text-slate transition hover:text-bronze">
                  {category}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-ink/10 bg-white p-6">
            <p className="text-2xl font-semibold tracking-[-0.04em] text-navy">Recent Posts</p>
            <div className="mt-5 space-y-4">
              {recentPosts.slice(0, 6).map((recent) => (
                <Link key={recent.slug} href={`/blog/${recent.slug}`} className="block text-sm leading-6 text-slate transition hover:text-bronze">
                  {recent.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-ink/10 bg-white p-6">
            <p className="text-2xl font-semibold tracking-[-0.04em] text-navy">Recent Comments</p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate">
              <p>Diamond Supreme Foam on Diamond Supreme Foam Ramadan Replacement Offer 2026</p>
              <p>Syed waseem on Diamond Supreme Foam Ramadan Replacement Offer 2026</p>
              <p>Kashif on Diamond Supreme Foam Ramadan Replacement Offer 2026</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <h2 className="text-4xl font-semibold tracking-[-0.05em] text-navy">Related Posts</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {relatedPosts.map((related) => (
            <article key={related.slug}>
              <Link href={`/blog/${related.slug}`} className="block overflow-hidden rounded-xl bg-[#f4f0e7]">
                <div className="h-[220px] w-full bg-cover bg-center" style={{ backgroundImage: `url(${related.image})` }} />
              </Link>
              <Link href={`/blog/${related.slug}`} className="mt-4 block text-2xl font-medium leading-tight tracking-[-0.04em] text-navy">
                {related.title}
              </Link>
              <p className="mt-2 text-sm text-slate">{formatDate(related.publishedAt)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/8 bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-navy">Leave a Reply</h2>
          <p className="mt-3 text-sm text-slate">Your email address will not be published. Required fields are marked.</p>
          <form className="mt-10 space-y-7">
            <div className="grid gap-5 md:grid-cols-3">
              <input className="min-h-[54px] rounded-lg border border-ink/12 px-4 text-sm" placeholder="Name" />
              <input className="min-h-[54px] rounded-lg border border-ink/12 px-4 text-sm" placeholder="Email" />
              <input className="min-h-[54px] rounded-lg border border-ink/12 px-4 text-sm" placeholder="Website" />
            </div>
            <input className="min-h-[54px] w-full rounded-lg border border-ink/12 px-4 text-sm" placeholder="Are you human? Please solve: 6 + 4" />
            <textarea className="min-h-[220px] w-full rounded-lg border border-ink/12 px-4 py-4 text-sm" placeholder="Add Comment" />
            <label className="flex items-center gap-3 text-sm text-slate">
              <input type="checkbox" />
              Save my name, email and website in this browser for the next time I comment.
            </label>
            <button className="rounded-lg bg-navy px-8 py-4 text-sm font-semibold text-white" type="button">
              Post Comment
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
