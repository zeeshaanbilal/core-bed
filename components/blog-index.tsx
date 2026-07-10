"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { BlogPostRecord } from "@/lib/store-types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

const POSTS_PER_PAGE = 9;

export function BlogIndex({ posts }: { posts: BlogPostRecord[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const names = new Set<string>(["All"]);
    posts.forEach((post) => {
      post.categories.forEach((category) => names.add(category));
    });
    return Array.from(names);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") {
      return posts;
    }

    return posts.filter((post) => post.categories.includes(activeCategory));
  }, [activeCategory, posts]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const pagedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <main className="mx-auto max-w-7xl px-6 py-14">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Editorial</p>
          <h1 className="mt-4 font-serif text-6xl font-semibold tracking-[-0.06em] text-navy">Blog</h1>
        </div>
        <div className="flex max-w-5xl flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className={`rounded-xl px-5 py-3 text-sm transition ${
                activeCategory === category ? "bg-navy text-white" : "bg-[#f6f2ea] text-navy hover:bg-[#efe8dc]"
              }`}
              onClick={() => {
                setActiveCategory(category);
                setPage(1);
              }}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-6xl font-light tracking-[-0.07em] text-navy">{activeCategory}</h2>
      </div>

      <div className="mt-12 grid gap-x-7 gap-y-12 lg:grid-cols-3">
        {pagedPosts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-sm bg-[#f4f0e7]">
              <div
                className="h-[370px] w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url(${post.image})` }}
              />
            </Link>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-5 block text-[2rem] font-medium leading-tight tracking-[-0.05em] text-navy"
            >
              {post.title}
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-[0.18em] text-slate">
              <span>{post.author}</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.categories.join(", ")}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-center gap-3">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            className={`flex h-10 w-10 items-center justify-center rounded-sm border text-sm ${
              pageNumber === page ? "border-navy bg-navy text-white" : "border-ink/10 text-navy"
            }`}
            onClick={() => setPage(pageNumber)}
            type="button"
          >
            {pageNumber}
          </button>
        ))}
      </div>
    </main>
  );
}
