export type CurrencyConfig = {
  match: string[];
  locale: string;
  currency: string;
};

export type ExchangeRates = Record<string, number>;

const BASE_CURRENCY = "PKR";

const COUNTRY_CURRENCY_MAP: CurrencyConfig[] = [
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

export function convertCurrencyValue(value: number, country?: string, rates?: ExchangeRates) {
  const { currency } = getCurrencyConfig(country);

  if (!rates || currency === BASE_CURRENCY) {
    return value;
  }

  const exchangeRate = rates[currency];

  if (typeof exchangeRate !== "number" || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return value;
  }

  return value * exchangeRate;
}

export function convertFromCurrencyValue(value: number, country?: string, rates?: ExchangeRates) {
  const { currency } = getCurrencyConfig(country);

  if (!rates || currency === BASE_CURRENCY) {
    return value;
  }

  const exchangeRate = rates[currency];

  if (typeof exchangeRate !== "number" || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return value;
  }

  return value / exchangeRate;
}

export function formatCurrency(value: number, country?: string, rates?: ExchangeRates) {
  const { locale, currency } = getCurrencyConfig(country);
  const normalizedValue = convertCurrencyValue(value, country, rates);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(normalizedValue);
}
