import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import {
  ADMIN_ROUTES,
  AUTH_ROUTES,
  CONFIRMATION_REQUIRED_ROUTES,
  PARENT_ROUTES,
  PUBLIC_ROUTES,
  SHOWCASE_ROUTES,
  SUPER_ADMIN_ROUTES,
  matchesRoute,
} from "@/lib/middleware/routes";
import {
  getDefaultRedirectForRoles,
  getRoleFlags,
  getUnauthorizedRedirect,
} from "@/lib/middleware/roles";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes
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
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const roles = userRoles?.map((r) => r.role) ?? [];
        const roleFlags = getRoleFlags(roles);

        // If user has no roles, let them stay on login page (don't redirect)
        // This prevents redirect loops for users with incomplete account setup
        if (!roleFlags.hasRoles) {
          return response;
        }

        return NextResponse.redirect(
          new URL(getDefaultRedirectForRoles(roleFlags), request.url)
        );
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
  const roleFlags = getRoleFlags(roles);

  // Users with no roles (e.g., pending invite) - redirect to login
  // This prevents redirect loops between /dashboard and /organizer
  if (!roleFlags.hasRoles) {
    return NextResponse.redirect(
      new URL("/login?error=no_role", request.url)
    );
  }

  // Super admin routes - require SUPER_ADMIN role
  if (matchesRoute(pathname, SUPER_ADMIN_ROUTES)) {
    if (!roleFlags.isSuperAdmin) {
      return NextResponse.redirect(
        new URL(getUnauthorizedRedirect(roleFlags), request.url)
      );
    }
  }

  // Admin routes - require ACADEMY_ADMIN or SUPER_ADMIN role
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!roleFlags.isAcademyAdmin && !roleFlags.isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Parent routes - require PARENT role (SUPER_ADMIN can access all)
  if (matchesRoute(pathname, PARENT_ROUTES)) {
    if (!roleFlags.isParent && !roleFlags.isSuperAdmin) {
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
