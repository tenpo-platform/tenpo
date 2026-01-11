"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const academySchema = z.object({
  academyName: z
    .string()
    .min(2, "Academy name must be at least 2 characters")
    .max(100, "Academy name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

type AcademyFormData = z.infer<typeof academySchema>;

function AcademyOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AcademyFormData>({
    resolver: zodResolver(academySchema),
    defaultValues: {
      academyName: "",
      description: "",
    },
    mode: "onChange",
  });

  const academyName = form.watch("academyName");

  // Generate slug preview from name
  const slugPreview = useMemo(() => {
    if (!academyName) return "";
    const slug = academyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug;
  }, [academyName]);

  const onSubmit = async (data: AcademyFormData) => {
    if (!token) {
      setError("Missing invite token. Please use the link from your email.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          academyName: data.academyName,
          academyDescription: data.description || null,
        }),
      });

      const payload = (await response.json()) as {
        result?: { error?: string; success?: boolean };
        error?: string;
      };

      if (!response.ok || !payload.result) {
        setError("An error occurred. Please try again or contact support.");
        return;
      }

      // Handle RPC response
      if (payload.result && typeof payload.result === "object") {
        const response = payload.result;
        if (response.error) {
          if (response.error.includes("already taken")) {
            form.setError("academyName", {
              type: "manual",
              message:
                "This academy URL is already taken. Please choose a different name.",
            });
          } else {
            setError(response.error);
          }
          return;
        }

        if (response.success) {
          toast.success("Academy created! Welcome to Tenpo.");
          router.push("/organizer");
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invalid Link</CardTitle>
            <CardDescription>
              This onboarding link appears to be invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4 text-sm">
              Please use the invite link from your email to access this page.
            </p>
            <Button onClick={() => router.push("/")} variant="secondary">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set up your academy</CardTitle>
          <CardDescription>
            Tell us about your academy to get started on Tenpo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
              <br />
              <span className="text-xs">
                Need help? Contact{" "}
                <a href="mailto:support@tenpo.com" className="underline">
                  support@tenpo.com
                </a>
              </span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="academyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academy name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DivineTime Sports Academy"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {slugPreview && (
                      <FormDescription>
                        Your academy URL will be:{" "}
                        <span className="font-mono text-xs">
                          tenpo.com/academy/{slugPreview}
                        </span>
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell parents about your academy, your coaches, and what makes your programs special..."
                        className="min-h-24 resize-none"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {(field.value?.length || 0)}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating academy..." : "Create academy"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="py-12 text-center">
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcademyOnboardingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcademyOnboardingContent />
    </Suspense>
  );
}
