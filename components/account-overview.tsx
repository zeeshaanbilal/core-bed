import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { SupabaseAuthUser } from "@/lib/supabase/server";
import { accountLinks } from "@/lib/site-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { CustomerProfileRecord } from "@/lib/store-types";

export function AccountOverview({
  error,
  user,
  isAdmin,
  profile
}: {
  error?: string;
  user: SupabaseAuthUser | null;
  isAdmin: boolean;
  profile: CustomerProfileRecord | null;
}) {
  const configured = isSupabaseConfigured();

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-bronze">Account</p>
      <h1 className="mt-4 font-serif text-6xl leading-tight">Customer account and service center</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate">
        Supabase auth, account access, and the admin entry point are managed here. User accounts, wishlists, orders, and admin roles all connect through this flow.
      </p>

      {!configured ? (
        <div className="mt-8 rounded-[1.5rem] border border-[#ffcf99] bg-[#fff5e8] p-5 text-sm leading-7 text-[#80511f]">
          Supabase is not configured yet. As soon as the project keys are added to `.env`, login, signup, and admin protection will go live.
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-[1.5rem] border border-[#ffb9b9] bg-[#fff1f1] p-5 text-sm text-[#8a2b2b]">
          {error}
        </div>
      ) : null}

      {user ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="section-frame rounded-[1.75rem] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Signed in</p>
            <h2 className="mt-4 font-serif text-4xl">{profile?.name || user.user_metadata?.["full_name"]?.toString() || user.email}</h2>
            <p className="mt-3 text-base text-slate">{user.email}</p>
            <p className="mt-4 text-sm leading-7 text-slate">
              {isAdmin ? "Admin access enabled for this account." : "Customer access active. Use the links on the right to continue."}
            </p>
            {profile ? (
              <div className="mt-6 space-y-2 rounded-[1.25rem] bg-[#f7fbff] p-4 text-sm leading-7 text-slate">
                <p>Phone: {profile.phone || "Not added yet"}</p>
                <p>City: {profile.city || "Not added yet"}</p>
                <p>
                  Address: {[profile.addressLine1, profile.addressLine2, profile.state, profile.postalCode, profile.country]
                    .filter(Boolean)
                    .join(", ") || "Not added yet"}
                </p>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {isAdmin ? (
                <Link href="/admin" className="rounded-full bg-navy px-5 py-3 text-sm text-white">
                  Open admin panel
                </Link>
              ) : null}
              <form action={logoutAction}>
                <FormSubmitButton
                  idleLabel="Sign out"
                  pendingLabel="Signing out..."
                  className="rounded-full border border-ink/10 px-5 py-3 text-sm text-navy"
                />
              </form>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            {accountLinks.map((item) => (
              <Link key={item.href} href={item.href} className="section-frame rounded-[1.75rem] p-6">
                <p className="font-serif text-3xl">{item.label}</p>
                <p className="mt-3 text-sm leading-7 text-slate">Open the flow and continue through the customer account journey.</p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accountLinks.map((item) => (
            <Link key={item.href} href={item.href} className="section-frame rounded-[1.75rem] p-6">
              <p className="font-serif text-3xl">{item.label}</p>
              <p className="mt-3 text-sm leading-7 text-slate">Open the flow and continue through the customer account journey.</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
