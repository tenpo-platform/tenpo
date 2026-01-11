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

export default async function AdminPage() {
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
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                Super Admin
              </span>
            </div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {displayName}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Manage Invites</CardTitle>
                <CardDescription>
                  Create and manage academy admin invites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Send invites to new academy owners and administrators.
                </p>
                <Button variant="secondary" disabled>
                  Manage Invites (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Academies</CardTitle>
                <CardDescription>
                  View and manage all academies on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Browse all registered academies.
                </p>
                <Button variant="secondary" disabled>
                  View Academies (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  View all users, modify roles, and manage accounts.
                </p>
                <Button variant="secondary" disabled>
                  Manage Users (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Feature flags, email templates, and system configuration.
                </p>
                <Button variant="secondary" disabled>
                  Settings (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {user.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Role:</span>{" "}
                    <span className="font-medium text-red-600">SUPER_ADMIN</span>
                  </p>
                </div>
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
