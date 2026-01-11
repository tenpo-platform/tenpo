"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        router.refresh();
      }
    };

    checkSession();

    const handlePageShow = () => {
      checkSession();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router]);

  return null;
}
