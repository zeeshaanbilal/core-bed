import { NextResponse } from "next/server";

import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";

export async function GET() {
  return NextResponse.json([buildOrganizationSchema(), buildWebSiteSchema()], {
    headers: {
      "Content-Type": "application/ld+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
