import { createClient } from "@/utils/supabase/server";
import { AuthWidget } from "@/components/auth/auth-widget";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

interface InviteContext {
  email: string;
  inviter_name: string | null;
  type: string | null;
  has_account?: boolean;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_invite_context", {
    p_token: token,
  });

  if (error || !data) {
    return <InviteExpiredError />;
  }

  const invite = data as InviteContext;
  const returnTo = `/onboarding/academy?token=${encodeURIComponent(token)}`;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const userEmail = user.email?.toLowerCase();
    if (userEmail && userEmail === invite.email.toLowerCase()) {
      redirect(returnTo);
    }

    return (
      <InviteEmailMismatch
        inviteEmail={invite.email}
        signedInEmail={user.email ?? "your current account"}
      />
    );
  }

  const initialMode = invite.has_account ? "login" : "invite";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <AuthWidget
            initialMode={initialMode}
            context="invite"
            inviteEmail={invite.email}
            inviterName={invite.inviter_name || undefined}
            returnTo={returnTo}
            prefillEmail={invite.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function InviteEmailMismatch({
  inviteEmail,
  signedInEmail,
}: {
  inviteEmail: string;
  signedInEmail: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="size-8 text-amber-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86l-7.14 12.36A1.5 1.5 0 0 0 4.44 18h15.12a1.5 1.5 0 0 0 1.29-2.78L13.7 3.86a1.5 1.5 0 0 0-2.7 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Wrong account</h1>
          <p className="text-muted-foreground text-sm">
            This invite was sent to <strong>{inviteEmail}</strong>, but you are
            signed in as <strong>{signedInEmail}</strong>.
          </p>
          <p className="text-muted-foreground text-sm">
            Please sign out and open your invite link again.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/auth/signout">
              <Button className="w-full">Sign out</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InviteExpiredError() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="size-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Invite Expired</h1>
          <p className="text-muted-foreground text-sm">
            This invite has expired or is no longer valid.
          </p>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Need a new invite?</strong>
              <br />
              Please contact{" "}
              <a
                href="mailto:support@tenpo.com"
                className="underline hover:no-underline"
              >
                support@tenpo.com
              </a>{" "}
              to request a new invite link.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/">
              <Button variant="secondary" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
