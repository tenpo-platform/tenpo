import { Suspense } from "react";
import { AuthWidget } from "@/components/auth/auth-widget";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface SignupPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthWidget
              initialMode="signup"
              context="static"
              returnTo={redirectTo}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
