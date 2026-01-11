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

export default async function OrganizerPage() {
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

  let academies: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    role: string;
  }[] = [];
  let adminError = false;
  let adminCount = 0;

  const { data: joinedRecords, error: joinedError } = await supabase
    .from("academy_admins")
    .select("role, academies(id, name, slug, description)")
    .eq("user_id", user.id);

  if (joinedError) {
    const { data: adminRecords, error: adminRecordsError } = await supabase
      .from("academy_admins")
      .select("role, academy_id")
      .eq("user_id", user.id);

    if (adminRecordsError) {
      adminError = true;
    } else {
      adminCount = adminRecords?.length ?? 0;
      const academyIds = adminRecords?.map((record) => record.academy_id) ?? [];
      const { data: academyData, error: academyError } = await supabase
        .from("academies")
        .select("id, name, slug, description")
        .in(
          "id",
          academyIds.length > 0
            ? academyIds
            : ["00000000-0000-0000-0000-000000000000"]
        );

      if (academyError) {
        adminError = true;
      } else {
        academies =
          adminRecords
            ?.map((record) => {
              const academy = academyData?.find(
                (item) => item.id === record.academy_id
              );
              return {
                id: academy?.id,
                name: academy?.name,
                slug: academy?.slug,
                description: academy?.description,
                role: record.role,
              };
            })
            .filter((academy) => academy.id) ?? [];
      }
    }
  } else {
    adminCount = joinedRecords?.length ?? 0;
    academies =
      joinedRecords
        ?.map((record) => {
          const academy = record.academies as {
            id?: string;
            name?: string;
            slug?: string;
            description?: string | null;
          } | null;
          return {
            id: academy?.id,
            name: academy?.name,
            slug: academy?.slug,
            description: academy?.description,
            role: record.role,
          };
        })
        .filter((academy) => academy.id) ?? [];
  }

  if (adminCount === 0 && user.email) {
    const { data: pendingInvite } = await supabase
      .from("invites")
      .select("token")
      .eq("email", user.email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingInvite?.token) {
      redirect(`/onboarding/academy?token=${pendingInvite.token}`);
    }
  }

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
            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {displayName}
          </p>
        </div>

        {adminError ? (
          <Card>
            <CardHeader>
              <CardTitle>Unable to Load Academies</CardTitle>
              <CardDescription>
                We couldn&apos;t load your academy data. Please try again or
                contact support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="secondary">Return to Home</Button>
              </Link>
            </CardContent>
          </Card>
        ) : academies.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Academies</CardTitle>
              <CardDescription>
                You don&apos;t have any academies yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                If you received an invite to join an academy, please use the
                link from your email.
              </p>
              <Link href="/">
                <Button variant="secondary">Return to Home</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Your Academies</h2>

            <div className="grid gap-6">
              {academies.map((academy) => (
                <Card key={academy?.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{academy?.name}</CardTitle>
                        <CardDescription>
                          {academy?.description || "No description"}
                        </CardDescription>
                      </div>
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium capitalize">
                        {academy?.role}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="secondary" disabled>
                        Manage Events (Coming Soon)
                      </Button>
                      <Button variant="ghost" disabled>
                        Settings
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-4 text-xs">
                      Academy URL: tenpo.com/academy/{academy?.slug}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
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
                  <span className="text-muted-foreground">Email verified:</span>{" "}
                  {user.email_confirmed_at ? "Yes" : "No"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Questions about managing your academy?
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
