import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="section-frame rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Account</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">Reset your password</h1>
        <p className="mt-4 text-sm leading-7 text-slate">
          Enter your email address below to receive a reset link once real auth services are connected.
        </p>
        <form className="mt-8 grid gap-4">
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" placeholder="Email" type="email" />
          <button className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" type="button">Send reset link</button>
        </form>
        <p className="mt-6 text-sm text-slate">
          Back to <Link href="/account/login">sign in</Link>
        </p>
      </div>
    </main>
  );
}
