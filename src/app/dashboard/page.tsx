export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TimezoneSync } from "@/components/auth/timezone-sync";
import { SessionGuard } from "@/components/auth/session-guard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user.email;

  return (
    <>
      <SessionGuard />
      <TimezoneSync userId={user.id} />
      <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {displayName}!</h1>
          <p className="text-muted-foreground mt-1">
            Your parent dashboard for managing camp registrations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Registrations</CardTitle>
              <CardDescription>
                View and manage your camp registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                You don&apos;t have any registrations yet.
              </p>
              <Link href="/camps">
                <Button variant="secondary">Browse Camps</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Athletes</CardTitle>
              <CardDescription>
                Manage your children&apos;s profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                No athletes added yet.
              </p>
              <Button variant="secondary" disabled>
                Add Athlete (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {user.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Email verified:</span>{" "}
                  {user.email_confirmed_at ? "Yes" : "No"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Contact our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Have questions about camp registrations or your account?
              </p>
              <a href="mailto:support@tenpo.com">
                <Button variant="secondary">Contact Support</Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/auth/signout">
            <Button variant="ghost">Sign Out</Button>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
