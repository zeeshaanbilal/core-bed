import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/supabase/config";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/testimonials", label: "Feedback" },
  { href: "/admin/settings", label: "Settings" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();

  if (!user) {
    redirect("/account/login?redirect=/admin");
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
        <aside className="section-frame h-fit rounded-[1.75rem] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Admin</p>
          <h1 className="mt-4 font-serif text-4xl">Store operations</h1>
          <p className="mt-3 text-sm leading-7 text-slate">{user.email}</p>

          <div className="mt-6 space-y-3 rounded-[1.25rem] bg-[#f8f4ec] p-4 text-sm text-slate">
            <p>Supabase: {isSupabaseConfigured() ? "Live auth connected" : "Waiting for env keys"}</p>
            <p>Stripe: {isStripeConfigured() ? "Secret key detected" : "Waiting for key"}</p>
          </div>

          <nav className="mt-8 space-y-3">
            {adminNav.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-2xl border border-ink/10 px-4 py-3 text-sm text-slate transition hover:bg-ivory">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
