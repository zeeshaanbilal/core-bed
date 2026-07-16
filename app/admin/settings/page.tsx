import { sendTestEmailAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getCurrentUser } from "@/lib/auth";
import { areOrderEmailsConfigured, getEmailConfigurationSummary, getRecentEmailLogs } from "@/lib/notifications";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/supabase/config";

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "ADMIN_EMAILS",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_FROM_NAME"
];

export default async function AdminSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ emailTestSuccess?: string; emailTestError?: string }>;
}) {
  const params = await searchParams;
  const [user, emailConfig, emailLogs] = await Promise.all([
    getCurrentUser(),
    Promise.resolve(getEmailConfigurationSummary()),
    getRecentEmailLogs()
  ]);

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
            Auth, admin access control, and future database migration scaffolding are prepared for Supabase.
          </p>
        </article>
        <article className="section-frame rounded-[1.75rem] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Stripe</p>
          <h3 className="mt-3 font-serif text-3xl">{isStripeConfigured() ? "Configured" : "Pending"}</h3>
          <p className="mt-3 text-sm leading-7 text-slate">
            Checkout already exposes Stripe as the primary payment path. Add live keys and webhook handling next.
          </p>
        </article>
        <article className="section-frame rounded-[1.75rem] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Resend Email</p>
          <h3 className="mt-3 font-serif text-3xl">{areOrderEmailsConfigured() ? "Configured" : "Pending"}</h3>
          <p className="mt-3 text-sm leading-7 text-slate">
            From: {emailConfig.senderFromEmail || "Missing"} {emailConfig.senderFromName ? `(${emailConfig.senderFromName})` : ""}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate">
            Admin inbox: {emailConfig.adminEmails.length > 0 ? emailConfig.adminEmails.join(", ") : "Missing"}
          </p>
        </article>
      </div>

      <article className="section-frame rounded-[1.75rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-serif text-3xl">Send test email</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate">
              Use this button to verify the live Resend response. If delivery fails, the exact reason will appear in
              the logs below.
            </p>
          </div>
        </div>

        {params.emailTestSuccess ? (
          <div className="mt-6 rounded-[1.25rem] border border-[#cfe6b8] bg-[#f4fbeb] p-4 text-sm text-[#476329]">
            {params.emailTestSuccess}
          </div>
        ) : null}

        {params.emailTestError ? (
          <div className="mt-6 rounded-[1.25rem] border border-[#ffb9b9] bg-[#fff1f1] p-4 text-sm text-[#8a2b2b]">
            {params.emailTestError}
          </div>
        ) : null}

        <form action={sendTestEmailAction} className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-ink">Recipient email</label>
            <input
              name="recipient"
              type="email"
              defaultValue={user?.email ?? emailConfig.adminEmails[0] ?? ""}
              className="w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
              placeholder="admin@corebed.com"
              required
            />
          </div>
          <FormSubmitButton
            idleLabel="Send test email"
            pendingLabel="Sending..."
            className="rounded-full bg-ink px-6 py-3 text-sm text-ivory"
          />
        </form>
      </article>

      <article className="section-frame rounded-[1.75rem] p-6">
        <p className="font-serif text-3xl">Required environment variables</p>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate">
          {requiredEnv.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="section-frame rounded-[1.75rem] p-6">
        <p className="font-serif text-3xl">Recent email logs</p>
        <p className="mt-3 text-sm leading-7 text-slate">
          This section shows the exact email provider response, including issues such as an invalid API key, sender
          mismatch, or a rejected domain.
        </p>

        <div className="mt-6 space-y-4">
          {emailLogs.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-ink/10 p-4 text-sm text-slate">
              No email logs yet. Send a test email to verify the delivery flow.
            </div>
          ) : (
            emailLogs.map((log) => (
              <div key={log.id} className="rounded-[1.25rem] border border-ink/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {log.channel.toUpperCase()} | {log.status.toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm text-slate">{log.subject}</p>
                  </div>
                  <p className="text-xs text-slate">{new Date(log.createdAt).toLocaleString("en-PK")}</p>
                </div>
                <p className="mt-3 text-sm text-slate">Recipient: {log.recipient}</p>
                {log.error ? <p className="mt-2 text-sm text-[#8a2b2b]">Error: {log.error}</p> : null}
                {log.response ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-navy">Provider response</summary>
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-[#f8f4ec] p-3 text-xs leading-6 text-slate">
                      {log.response}
                    </pre>
                  </details>
                ) : null}
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
