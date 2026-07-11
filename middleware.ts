import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PRIMARY_HOST = "corebed.com";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.toLowerCase() ?? "";

  if (process.env.NODE_ENV === "production") {
    const isVercelHost = hostname.endsWith(".vercel.app");
    const isWwwHost = hostname === `www.${PRIMARY_HOST}`;

    if (isVercelHost || isWwwHost) {
      const redirectUrl = new URL(request.url);
      redirectUrl.protocol = "https:";
      redirectUrl.host = PRIMARY_HOST;
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
