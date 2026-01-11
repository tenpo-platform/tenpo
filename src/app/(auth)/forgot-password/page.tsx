import { Suspense } from "react";
import { AuthWidget } from "@/components/auth/auth-widget";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthWidget initialMode="reset-request" context="static" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
