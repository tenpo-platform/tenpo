import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Routes only available when NEXT_PUBLIC_SHOWCASE_MODE=true (staging)
const SHOWCASE_ROUTES = ["/palette-options", "/sample-landing", "/ds"];

// Public routes - no auth required
const PUBLIC_ROUTES = [
  "/",
  "/camps",
  "/checkout",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
  "/auth",
  "/invite",
];

// Routes that require email confirmation
const CONFIRMATION_REQUIRED_ROUTES = ["/dashboard", "/organizer", "/admin"];

// Admin-only routes (requires ACADEMY_ADMIN or SUPER_ADMIN)
const ADMIN_ROUTES = ["/organizer"];

// Super admin-only routes (requires SUPER_ADMIN)
const SUPER_ADMIN_ROUTES = ["/admin"];

// Parent-only routes (requires PARENT role)
const PARENT_ROUTES = ["/dashboard"];

// Auth routes that should redirect if already logged in
const AUTH_ROUTES = ["/login", "/signup"];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Gate showcase routes behind env var
  if (
    matchesRoute(pathname, SHOWCASE_ROUTES) &&
    process.env.NEXT_PUBLIC_SHOWCASE_MODE !== "true"
  ) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  // Update session and get supabase client
  const { response, supabase } = await updateSession(request);

  // Public routes - allow all (including static assets handled by matcher)
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    // If user is logged in and trying to access auth routes, redirect to dashboard
    if (matchesRoute(pathname, AUTH_ROUTES)) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Check role to determine redirect destination
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const roles = userRoles?.map((r) => r.role) ?? [];

        // If user has no roles, let them stay on login page (don't redirect)
        // This prevents redirect loops for users with incomplete account setup
        if (roles.length === 0) {
          return response;
        }

        const isSuperAdmin = roles.includes("SUPER_ADMIN");
        const isAcademyAdmin = roles.includes("ACADEMY_ADMIN");

        if (isSuperAdmin) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        if (isAcademyAdmin) {
          return NextResponse.redirect(new URL("/organizer", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return response;
  }

  // Get user (already refreshed by updateSession)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No user - redirect to login with return URL
  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check email confirmation for protected routes
  if (matchesRoute(pathname, CONFIRMATION_REQUIRED_ROUTES)) {
    if (!user.email_confirmed_at) {
      return NextResponse.redirect(new URL("/confirm-email", request.url));
    }
  }

  // Get user roles for admin route check
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roles = userRoles?.map((r) => r.role) ?? [];
  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const isAcademyAdmin = roles.includes("ACADEMY_ADMIN");
  const isParent = roles.includes("PARENT");

  // Users with no roles (e.g., pending invite) - redirect to login
  // This prevents redirect loops between /dashboard and /organizer
  if (roles.length === 0) {
    return NextResponse.redirect(
      new URL("/login?error=no_role", request.url)
    );
  }

  // Super admin routes - require SUPER_ADMIN role
  if (matchesRoute(pathname, SUPER_ADMIN_ROUTES)) {
    if (!isSuperAdmin) {
      // Redirect based on role
      if (isAcademyAdmin) {
        return NextResponse.redirect(new URL("/organizer", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Admin routes - require ACADEMY_ADMIN or SUPER_ADMIN role
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!isAcademyAdmin && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Parent routes - require PARENT role (SUPER_ADMIN can access all)
  if (matchesRoute(pathname, PARENT_ROUTES)) {
    if (!isParent && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/organizer", request.url));
    }
  }

  return response;
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
