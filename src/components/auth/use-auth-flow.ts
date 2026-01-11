"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getUserRoles } from "@/services/auth-service";

const resolveRoleRedirect = (roles: string[]) => {
  if (roles.includes("SUPER_ADMIN")) {
    return "/admin";
  }
  if (roles.includes("ACADEMY_ADMIN")) {
    return "/organizer";
  }
  return "/dashboard";
};

interface AuthFlowOptions {
  returnTo?: string;
  onSuccess?: () => void;
}

export function useAuthFlow({ returnTo, onSuccess }: AuthFlowOptions) {
  const router = useRouter();

  const redirectAfterAuth = useCallback(
    async (overrideReturnTo?: string) => {
      if (onSuccess) {
        onSuccess();
        return;
      }

      const destination = overrideReturnTo || returnTo;
      if (destination) {
        router.push(destination);
        router.refresh();
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?error=no_user");
        return;
      }

      const { data: rolesData } = await getUserRoles(user.id);
      const roles = rolesData?.map((role) => role.role) ?? [];

      if (roles.length === 0) {
        router.push("/login?error=no_role");
        return;
      }

      router.push(resolveRoleRedirect(roles));
      router.refresh();
    },
    [onSuccess, returnTo, router]
  );

  return { redirectAfterAuth };
}
