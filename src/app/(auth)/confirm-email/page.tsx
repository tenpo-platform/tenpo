import { AuthWidget } from "@/components/auth/auth-widget";
import { Card, CardContent } from "@/components/ui/card";

interface ConfirmEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ConfirmEmailPage({
  searchParams,
}: ConfirmEmailPageProps) {
  const params = await searchParams;
  const email = params.email;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <AuthWidget
            initialMode="verify-otp"
            context="static"
            prefillEmail={email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
