import Link from "next/link";

import { loginAction } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/form-submit-button";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AccountLoginForm({
  error,
  success,
  redirectTo
}: {
  error?: string;
  success?: string;
  redirectTo?: string;
}) {
  const configured = isSupabaseConfigured();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="section-frame rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Account</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">Sign in to manage orders and saved products</h1>

        {!configured ? (
          <div className="mt-6 rounded-[1.25rem] border border-[#ffcf99] bg-[#fff5e8] p-4 text-sm leading-7 text-[#80511f]">
            Supabase auth is not configured yet. Once `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are added to `.env`, this form will go live.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-[1.25rem] border border-[#ffb9b9] bg-[#fff1f1] p-4 text-sm text-[#8a2b2b]">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-[1.25rem] border border-[#b9e2c7] bg-[#eefaf2] p-4 text-sm text-[#1f6b3c]">
            {success}
          </div>
        ) : null}

        <form action={loginAction} className="mt-8 grid gap-4">
          <input name="redirect" type="hidden" value={redirectTo ?? "/account"} />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="email" placeholder="Email" required type="email" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="password" placeholder="Password" required type="password" />
          <FormSubmitButton
            idleLabel="Sign in"
            pendingLabel="Signing in..."
            className="rounded-full bg-ink px-5 py-3 text-sm text-ivory"
          />
        </form>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate">
          <Link href="/account/forgot-password">Forgot your password?</Link>
          <Link href="/account/register">Create new account</Link>
        </div>
      </div>
    </main>
  );
}
