import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const redirectTo = searchParams.get("redirectTo");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth/email errors
  if (error) {
    console.error("Auth callback error:", error, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    // Handle password recovery - redirect to reset password page
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/reset-password`);
    }

    // Handle explicit redirectTo (e.g., checkout, invite)
    if (redirectTo && redirectTo.startsWith("/")) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    // Default: redirect based on role and email confirmation status
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=no_user`);
    }

    // Get user roles
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const roles = userRoles?.map((r) => r.role) ?? [];

    // Users with no roles (e.g., pending invite acceptance) - redirect to login
    if (roles.length === 0) {
      return NextResponse.redirect(`${origin}/login?error=no_role`);
    }

    const isSuperAdmin = roles.includes("SUPER_ADMIN");
    const isAcademyAdmin = roles.includes("ACADEMY_ADMIN");

    // Check email confirmation for dashboard access
    if (!user.email_confirmed_at) {
      // If going to dashboard/organizer, redirect to confirm-email page
      return NextResponse.redirect(`${origin}/confirm-email`);
    }

    // Redirect based on role (priority: SUPER_ADMIN > ACADEMY_ADMIN > PARENT)
    if (isSuperAdmin) {
      return NextResponse.redirect(`${origin}/admin`);
    }
    if (isAcademyAdmin) {
      return NextResponse.redirect(`${origin}/organizer`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code - redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
