import { isStripeConfigured, isSupabaseConfigured } from "@/lib/supabase/config";

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "ADMIN_EMAILS",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET"
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Settings</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Integration setup checklist</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="section-frame rounded-[1.75rem] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Supabase</p>
          <h3 className="mt-3 font-serif text-3xl">{isSupabaseConfigured() ? "Configured" : "Pending"}</h3>
          <p className="mt-3 text-sm leading-7 text-slate">
            Auth, admin access control and future database migration scaffolding are now prepared for Supabase.
          </p>
        </article>
        <article className="section-frame rounded-[1.75rem] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Stripe</p>
          <h3 className="mt-3 font-serif text-3xl">{isStripeConfigured() ? "Configured" : "Pending"}</h3>
          <p className="mt-3 text-sm leading-7 text-slate">
            Checkout already exposes Stripe as the primary payment path. Add live keys and webhook handling next.
          </p>
        </article>
      </div>

      <article className="section-frame rounded-[1.75rem] p-6">
        <p className="font-serif text-3xl">Required environment variables</p>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate">
          {requiredEnv.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}
