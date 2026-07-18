import { headers } from "next/headers";

const COUNTRY_CODE_MAP: Record<string, string> = {
  PK: "Pakistan",
  US: "United States",
  GB: "United Kingdom",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  CA: "Canada",
  AU: "Australia",
  IN: "India",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium"
};

function mapCountryCodeToName(countryCode?: string | null) {
  if (!countryCode) {
    return null;
  }

  return COUNTRY_CODE_MAP[countryCode.trim().toUpperCase()] ?? null;
}

function getCountryFromAcceptLanguage(acceptLanguage?: string | null) {
  if (!acceptLanguage) {
    return null;
  }

  const regionMatch = acceptLanguage.match(/-[A-Za-z]{2}\b/);
  const regionCode = regionMatch?.[0]?.slice(1).toUpperCase();

  return mapCountryCodeToName(regionCode);
}

export async function getVisitorCountry(fallbackCountry = "Pakistan") {
  const requestHeaders = await headers();
  const vercelCountry =
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    requestHeaders.get("cloudfront-viewer-country");

  const mappedVercelCountry = mapCountryCodeToName(vercelCountry);
  if (mappedVercelCountry) {
    return mappedVercelCountry;
  }

  const acceptLanguageCountry = getCountryFromAcceptLanguage(requestHeaders.get("accept-language"));
  if (acceptLanguageCountry) {
    return acceptLanguageCountry;
  }

  return fallbackCountry;
}
