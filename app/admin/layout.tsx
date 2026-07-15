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
    <main className="mx-auto max-w-[1400px] px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="section-frame h-fit rounded-[2rem] border border-[#e8e1d7] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f2ea_100%)] p-6 shadow-[0_20px_50px_rgba(47,42,40,0.06)]">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Admin</p>
          <h1 className="mt-4 font-serif text-4xl">Corebed control</h1>
          <p className="mt-3 text-sm leading-7 text-slate">Everything important in one place for products, orders, content and feedback.</p>
          <div className="mt-4 rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-bronze">Signed in</p>
            <p className="mt-2 break-all text-sm text-ink">{user.email}</p>
          </div>

          <div className="mt-6 space-y-3 rounded-[1.25rem] bg-[#f8f4ec] p-4 text-sm text-slate">
            <p>Supabase: {isSupabaseConfigured() ? "Live auth connected" : "Waiting for env keys"}</p>
            <p>Stripe: {isStripeConfigured() ? "Secret key detected" : "Waiting for key"}</p>
          </div>

          <nav className="mt-8 grid gap-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-slate transition hover:-translate-y-0.5 hover:bg-ivory"
              >
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
