import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Routes only available when NEXT_PUBLIC_SHOWCASE_MODE=true (staging)
const SHOWCASE_ROUTES = ["/palette-options", "/sample-landing", "/ds"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gate showcase routes behind env var
  const isShowcaseRoute = SHOWCASE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isShowcaseRoute && process.env.NEXT_PUBLIC_SHOWCASE_MODE !== "true") {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
