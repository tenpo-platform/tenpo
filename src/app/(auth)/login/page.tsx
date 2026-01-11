import { Suspense } from "react";
import { AuthWidget } from "@/components/auth/auth-widget";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo;
  const error = params.error;
  const message = params.message;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthWidget
              initialMode="login"
              context="static"
              returnTo={redirectTo}
              error={error}
              message={message}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
