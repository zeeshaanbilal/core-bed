function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }

  return `https://${trimmed}`.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const explicitUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (explicitUrl) {
    return explicitUrl;
  }

  const productionUrl = normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "");
  if (productionUrl) {
    return productionUrl;
  }

  const previewUrl = normalizeUrl(process.env.VERCEL_URL ?? "");
  if (previewUrl) {
    return previewUrl;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://corebed.com";
  }

  return "http://localhost:3000";
}
