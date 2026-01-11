"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Client component that detects user's timezone from browser
 * and syncs it to their profile if not already set.
 * Renders nothing - just runs the sync effect.
 */
export function TimezoneSync({ userId }: { userId: string }) {
  useEffect(() => {
    async function syncTimezone() {
      const supabase = createClient();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (!timezone) return;

      // Update profile with detected timezone (only if null)
      await supabase
        .from("profiles")
        .update({ timezone })
        .eq("id", userId)
        .is("timezone", null);
    }

    syncTimezone();
  }, [userId]);

  return null;
}
