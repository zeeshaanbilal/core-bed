const COUNTRY_CURRENCY_MAP: Array<{
  match: string[];
  locale: string;
  currency: string;
}> = [
  { match: ["pakistan"], locale: "en-PK", currency: "PKR" },
  { match: ["united states", "usa", "us"], locale: "en-US", currency: "USD" },
  { match: ["united kingdom", "uk", "great britain", "england"], locale: "en-GB", currency: "GBP" },
  { match: ["united arab emirates", "uae"], locale: "en-AE", currency: "AED" },
  { match: ["saudi arabia", "ksa"], locale: "en-SA", currency: "SAR" },
  { match: ["canada"], locale: "en-CA", currency: "CAD" },
  { match: ["australia"], locale: "en-AU", currency: "AUD" },
  { match: ["india"], locale: "en-IN", currency: "INR" },
  { match: ["europe", "germany", "france", "italy", "spain", "netherlands", "belgium"], locale: "en-IE", currency: "EUR" }
];

export function getCurrencyConfig(country?: string) {
  const normalizedCountry = country?.trim().toLowerCase();

  if (normalizedCountry) {
    const matchedConfig = COUNTRY_CURRENCY_MAP.find((entry) =>
      entry.match.some((value) => normalizedCountry.includes(value))
    );

    if (matchedConfig) {
      return matchedConfig;
    }
  }

  return COUNTRY_CURRENCY_MAP[0];
}

export function formatCurrency(value: number, country?: string) {
  const { locale, currency } = getCurrencyConfig(country);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
}
