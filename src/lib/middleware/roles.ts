export interface RoleFlags {
  isSuperAdmin: boolean;
  isAcademyAdmin: boolean;
  isParent: boolean;
  hasRoles: boolean;
}

/**
 * Extract role flags from an array of role strings.
 */
export function getRoleFlags(roles: string[]): RoleFlags {
  return {
    isSuperAdmin: roles.includes("SUPER_ADMIN"),
    isAcademyAdmin: roles.includes("ACADEMY_ADMIN"),
    isParent: roles.includes("PARENT"),
    hasRoles: roles.length > 0,
  };
}

/**
 * Get the default redirect URL for a user based on their roles.
 * Priority: SUPER_ADMIN -> ACADEMY_ADMIN -> PARENT (dashboard)
 */
export function getDefaultRedirectForRoles(roleFlags: RoleFlags): string {
  if (roleFlags.isSuperAdmin) {
    return "/admin";
  }
  if (roleFlags.isAcademyAdmin) {
    return "/organizer";
  }
  return "/dashboard";
}

/**
 * Get the redirect URL when a user is unauthorized for a route.
 * Falls back based on their actual role.
 */
export function getUnauthorizedRedirect(roleFlags: RoleFlags): string {
  if (roleFlags.isAcademyAdmin) {
    return "/organizer";
  }
  return "/dashboard";
}
