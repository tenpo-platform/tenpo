// Routes only available when NEXT_PUBLIC_SHOWCASE_MODE=true (staging)
export const SHOWCASE_ROUTES = ["/palette-options", "/sample-landing", "/ds"];

// Public routes - no auth required
export const PUBLIC_ROUTES = [
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
export const CONFIRMATION_REQUIRED_ROUTES = ["/dashboard", "/organizer", "/admin"];

// Admin-only routes (requires ACADEMY_ADMIN or SUPER_ADMIN)
export const ADMIN_ROUTES = ["/organizer"];

// Super admin-only routes (requires SUPER_ADMIN)
export const SUPER_ADMIN_ROUTES = ["/admin"];

// Parent-only routes (requires PARENT role)
export const PARENT_ROUTES = ["/dashboard"];

// Auth routes that should redirect if already logged in
export const AUTH_ROUTES = ["/login", "/signup"];

/**
 * Check if a pathname matches any of the given routes.
 * Matches exact path or any sub-path (e.g., "/admin" matches "/admin/users").
 */
export function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
