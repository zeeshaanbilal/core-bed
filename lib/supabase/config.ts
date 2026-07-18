export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function getStripeConfigurationSummary() {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const secretMode = secretKey.startsWith("sk_live_")
    ? "live"
    : secretKey.startsWith("sk_test_")
      ? "test"
      : "unknown";
  const publishableMode = publishableKey.startsWith("pk_live_")
    ? "live"
    : publishableKey.startsWith("pk_test_")
      ? "test"
      : "unknown";
  const mode =
    secretMode === "live" && publishableMode === "live"
      ? "live"
      : secretMode === "test" && publishableMode === "test"
        ? "test"
        : "mixed";

  return {
    secretKeyPresent: Boolean(secretKey),
    publishableKeyPresent: Boolean(publishableKey),
    webhookSecretPresent: Boolean(webhookSecret),
    siteUrl,
    webhookUrl: `${siteUrl.replace(/\/$/, "")}/api/stripe/webhook`,
    readyForLiveCheckout: Boolean(secretKey && publishableKey),
    readyForWebhookSync: Boolean(secretKey && publishableKey && webhookSecret),
    mode
  };
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}
