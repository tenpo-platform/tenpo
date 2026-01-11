"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import {
  PasswordStrengthIndicator,
  isPasswordValid,
} from "@/components/auth/password-strength-indicator";
import { TurnstileCaptcha } from "@/components/auth/turnstile-captcha";
import { verifyCaptcha } from "@/lib/auth/verify-captcha";
import { features } from "@/config/features";
import {
  resendOtp,
  resetPasswordForEmail,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  updatePassword,
  verifyOtp,
} from "@/services/auth-service";
import { useAuthFlow } from "@/components/auth/use-auth-flow";
import Link from "next/link";
import { toast } from "sonner";

type AuthMode =
  | "login"
  | "signup"
  | "verify-otp"
  | "reset-request"
  | "reset-password"
  | "invite";

type AuthContext = "static" | "checkout" | "invite";

interface AuthWidgetProps {
  initialMode?: AuthMode;
  context?: AuthContext;
  returnTo?: string;
  onSuccess?: () => void;
  campName?: string;
  inviteEmail?: string;
  inviterName?: string;
  message?: string;
  error?: string;
  prefillEmail?: string;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().refine(isPasswordValid, {
      message: "Password does not meet all requirements",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const inviteSchema = z
  .object({
    password: z.string().refine(isPasswordValid, {
      message: "Password does not meet all requirements",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const resetRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z
  .object({
    password: z.string().refine(isPasswordValid, {
      message: "Password does not meet all requirements",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function AuthWidget({
  initialMode,
  context = "static",
  returnTo,
  onSuccess,
  campName,
  inviteEmail,
  inviterName,
  message,
  error,
  prefillEmail,
}: AuthWidgetProps) {
  const searchParams = useSearchParams();
  const fallbackMessage = searchParams.get("message") ?? undefined;
  const fallbackError = searchParams.get("error") ?? undefined;
  const isInviteContext = context === "invite";
  const lockedInviteEmail = isInviteContext ? inviteEmail : undefined;
  const defaultMode =
    initialMode || (isInviteContext ? "invite" : "login");
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(
    prefillEmail || lockedInviteEmail || null
  );
  const [otpPurpose, setOtpPurpose] = useState<"signup" | "recovery">("signup");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const { redirectAfterAuth } = useAuthFlow({ returnTo, onSuccess });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefillEmail || lockedInviteEmail || "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: prefillEmail || "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const inviteForm = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const resetRequestForm = useForm<z.infer<typeof resetRequestSchema>>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: {
      email: prefillEmail || "",
    },
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const signupPassword = signupForm.watch("password");
  const invitePassword = inviteForm.watch("password");
  const resetPasswordValue = resetPasswordForm.watch("password");

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((value) => value - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const headerCopy = useMemo(() => {
    if (mode === "verify-otp") {
      return {
        title: "Confirm your email",
        description: "Enter the 6-digit code we sent to your email.",
      };
    }
    if (mode === "reset-request") {
      return {
        title: "Reset your password",
        description: "We will email you a 6-digit code to reset your password.",
      };
    }
    if (mode === "reset-password") {
      return {
        title: "Set a new password",
        description: "Enter a new password to secure your account.",
      };
    }
    if (isInviteContext) {
      return {
        title: "You've been invited!",
        description: inviterName
          ? `${inviterName} has invited you to create an academy on Tenpo.`
          : "You’ve been invited to create an academy on Tenpo.",
      };
    }
    if (context === "checkout") {
      return {
        title: "Sign in to continue",
        description: campName
          ? `Create an account or sign in to complete your booking for ${campName}.`
          : "Create an account or sign in to complete your booking.",
      };
    }
    if (mode === "signup") {
      return {
        title: "Create your account",
        description: "Join Tenpo to book camps for your family.",
      };
    }
      return {
        title: "Welcome back",
        description: "Sign in to your account.",
      };
  }, [campName, context, inviterName, isInviteContext, mode]);

  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaError(false);
  }, []);

  const handleCaptchaError = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaError(true);
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  const handleVerifyOtp = async () => {
    const email = otpEmail;
    const code = otpCode.trim();

    if (!email) {
      setOtpError("Please enter the email address you used to sign up.");
      return;
    }

    if (code.length !== 6) {
      setOtpError("Please enter the 6-digit code from your email");
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    try {
      const { error: verifyError } = await verifyOtp(
        email,
        code,
        otpPurpose
      );

      if (verifyError) {
        if (verifyError.message.includes("expired")) {
          setOtpError("This code has expired. Please request a new one.");
        } else if (verifyError.message.includes("invalid")) {
          setOtpError("Invalid code. Please check and try again.");
        } else {
          setOtpError("Verification failed. Please try again.");
        }
        return;
      }

      if (otpPurpose === "recovery") {
        setMode("reset-password");
        return;
      }

      toast.success("Email verified successfully!");
      await redirectAfterAuth();
    } catch {
      setOtpError("An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!otpEmail || resendCooldown > 0) return;

    setIsResending(true);
    try {
      if (otpPurpose === "recovery") {
        await resetPasswordForEmail(otpEmail);
      } else {
        const { error: resendError } = await resendOtp(otpEmail, "signup");
        if (resendError) {
          toast.error("Unable to resend code. Please try again later.");
          return;
        }
      }

      toast.success("Verification code sent!");
      setResendCooldown(60);
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      const email = lockedInviteEmail || data.email;
      const { error: signInError } = await signInWithPassword(
        email,
        data.password
      );

      if (signInError) {
        if (
          signInError.message.includes("Invalid login") ||
          signInError.message.includes("Invalid email or password")
        ) {
          toast.error("Invalid email or password");
        } else if (signInError.message.includes("Email not confirmed")) {
          setOtpEmail(email);
          setOtpPurpose("signup");
          setMode("verify-otp");
          return;
        } else if (signInError.message.includes("Too many requests")) {
          toast.error(
            "Too many login attempts. Please try again later or contact support@tenpo.com"
          );
        } else {
          toast.error("An error occurred. Please try again.");
        }
        return;
      }

      await redirectAfterAuth(isInviteContext ? returnTo : undefined);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    if (features.captcha && !captchaToken) {
      toast.error("Please complete the CAPTCHA verification.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (captchaToken) {
        const captchaResult = await verifyCaptcha(captchaToken);
        if (!captchaResult.success) {
          toast.error(captchaResult.error || "CAPTCHA verification failed.");
          setIsSubmitting(false);
          return;
        }
      }

      const { error: signUpError } = await signUpWithPassword(
        data.email,
        data.password,
        {
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phone,
        }
      );

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast.error(
            "An account with this email already exists. Please sign in or use 'Forgot Password'."
          );
        } else if (signUpError.message.includes("rate limit")) {
          toast.error("Too many signup attempts. Please try again later.");
        } else {
          toast.error(signUpError.message || "An error occurred during signup.");
        }
        return;
      }

      setOtpEmail(data.email);
      setOtpPurpose("signup");
      setMode("verify-otp");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSignup = async (data: z.infer<typeof inviteSchema>) => {
    if (!inviteEmail) {
      toast.error("Invite email missing. Please use your invite link again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: signUpError } = await signUpWithPassword(
        inviteEmail,
        data.password
      );

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast.error("This email already has an account. Please sign in.");
          setMode("login");
        } else {
          toast.error(signUpError.message || "Unable to create account.");
        }
        return;
      }

      const { error: signInError } = await signInWithPassword(
        inviteEmail,
        data.password
      );

      if (signInError) {
        toast.error("Unable to sign in. Please try again.");
        return;
      }

      await redirectAfterAuth(returnTo);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetRequest = async (
    data: z.infer<typeof resetRequestSchema>
  ) => {
    setIsSubmitting(true);
    try {
      await resetPasswordForEmail(data.email);
      setOtpEmail(data.email);
      setOtpPurpose("recovery");
      setMode("verify-otp");
    } catch {
      setOtpEmail(data.email);
      setOtpPurpose("recovery");
      setMode("verify-otp");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (
    data: z.infer<typeof resetPasswordSchema>
  ) => {
    setIsSubmitting(true);
    try {
      const { error: updateError } = await updatePassword(data.password);
      if (updateError) {
        if (updateError.message.includes("same password")) {
          toast.error(
            "New password must be different from your current password."
          );
        } else if (updateError.message.includes("session")) {
          toast.error("Your reset code has expired. Please request a new one.");
        } else {
          toast.error(updateError.message || "Please try again.");
        }
        return;
      }

      await signOut();
      toast.success("Password updated successfully.");
      const redirectUrl = returnTo
        ? `/login?message=password_reset&redirectTo=${encodeURIComponent(returnTo)}`
        : "/login?message=password_reset";
      window.location.href = redirectUrl;
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailDisplay = otpEmail || lockedInviteEmail || prefillEmail;

  const messageText = useMemo(() => {
    const key = message || fallbackMessage;
    if (!key) return null;
    if (key === "signin_for_invite") {
      return "Please sign in to accept your invite. If you don't have an account yet, you can sign up first.";
    }
    if (key === "password_reset") {
      return "Password updated successfully. Please sign in with your new password.";
    }
    if (key === "session_expired") {
      return "Your session has expired. Please sign in again.";
    }
    return null;
  }, [fallbackMessage, message]);

  const errorText = useMemo(() => {
    const key = error || fallbackError;
    if (!key) return null;
    if (key === "no_role") {
      return "Your account setup is incomplete. If you received an invite, please use the link from your email. Otherwise, contact support@tenpo.com.";
    }
    if (key === "auth") {
      return "Authentication failed. Please try again.";
    }
    if (key === "no_user") {
      return "Unable to verify your account. Please sign in again.";
    }
    if (key === "no_code") {
      return "Invalid authentication link. Please sign in again.";
    }
    return null;
  }, [error, fallbackError]);

  return (
    <div className="space-y-6">
      {messageText && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          {messageText}
        </div>
      )}

      {errorText && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorText}
        </div>
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{headerCopy.title}</h1>
        <p className="text-muted-foreground text-sm">
          {headerCopy.description}
        </p>
      </div>

      {mode === "login" && (
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-4"
          >
            {!lockedInviteEmail && (
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {lockedInviteEmail && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                {lockedInviteEmail}
              </div>
            )}

            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <button
                      type="button"
                      className="text-primary text-sm hover:underline"
                      onClick={() => setMode("reset-request")}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      )}

      {mode === "signup" && (
        <Form {...signupForm}>
          <form
            onSubmit={signupForm.handleSubmit(handleSignup)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={signupForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        autoComplete="given-name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        autoComplete="family-name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={signupForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      autoComplete="tel"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {signupPassword && (
              <PasswordStrengthIndicator password={signupPassword} />
            )}

            <FormField
              control={signupForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TurnstileCaptcha
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
              onExpire={handleCaptchaExpire}
            />

            {captchaError && (
              <p className="text-destructive text-sm">
                CAPTCHA failed to load. Please refresh the page.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || (features.captcha && !captchaToken)}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Form>
      )}

      {mode === "invite" && (
        <Form {...inviteForm}>
          <form
            onSubmit={inviteForm.handleSubmit(handleInviteSignup)}
            className="space-y-4"
          >
            {inviteEmail && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                {inviteEmail}
              </div>
            )}

            <FormField
              control={inviteForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Create a password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {invitePassword && (
              <PasswordStrengthIndicator password={invitePassword} />
            )}

            <FormField
              control={inviteForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Continue"}
            </Button>
          </form>
        </Form>
      )}

      {mode === "verify-otp" && (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground text-sm">
            {emailDisplay ? (
              <>
                We sent a verification code to{" "}
                <span className="font-medium">{emailDisplay}</span>.
              </>
            ) : (
              "Please check your inbox for a verification code."
            )}
          </p>

          {!emailDisplay && (
            <Input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={otpEmail ?? ""}
              onChange={(event) => setOtpEmail(event.target.value)}
              autoFocus
            />
          )}

          <Input
            ref={otpInputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={otpCode}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "");
              setOtpCode(value);
              setOtpError(null);
            }}
            className="text-center text-2xl font-mono tracking-widest"
            disabled={isVerifying}
            autoFocus={Boolean(emailDisplay)}
          />

          {otpError && (
            <p className="text-destructive text-sm">{otpError}</p>
          )}

          <Button
            onClick={handleVerifyOtp}
            disabled={isVerifying || otpCode.length !== 6}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : "Verify email"}
          </Button>

          <div className="text-muted-foreground space-y-3 text-sm">
            <p>Didn&apos;t receive the email? Check your spam folder.</p>
            <Button
              variant="secondary"
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              className="w-full"
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend code (${resendCooldown}s)`
                  : "Resend code"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-primary hover:underline"
            >
              Return to sign in
            </button>
          </div>
        </div>
      )}

      {mode === "reset-request" && (
        <Form {...resetRequestForm}>
          <form
            onSubmit={resetRequestForm.handleSubmit(handleResetRequest)}
            className="space-y-4"
          >
            <FormField
              control={resetRequestForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset code"}
            </Button>
          </form>
        </Form>
      )}

      {mode === "reset-password" && (
        <Form {...resetPasswordForm}>
          <form
            onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
            className="space-y-4"
          >
            <FormField
              control={resetPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {resetPasswordValue && (
              <PasswordStrengthIndicator password={resetPasswordValue} />
            )}

            <FormField
              control={resetPasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
        </Form>
      )}

      {mode !== "verify-otp" && mode !== "reset-password" && (
        <div className="space-y-4">
          {(mode === "login" || mode === "signup" || mode === "invite") && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleOAuthButton redirectTo={returnTo} />
            </>
          )}

          {mode === "login" && !isInviteContext && (
            <p className="text-muted-foreground text-center text-sm">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          )}

          {mode === "login" && isInviteContext && (
            <p className="text-muted-foreground text-center text-sm">
              Need to create an account?{" "}
              <button
                type="button"
                onClick={() => setMode("invite")}
                className="text-primary hover:underline"
              >
                Continue
              </button>
            </p>
          )}

          {mode === "signup" && (
            <>
              <p className="text-muted-foreground text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
              <p className="text-muted-foreground text-center text-xs">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          )}

          {mode === "invite" && (
            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === "reset-request" && (
            <p className="text-muted-foreground text-center text-sm">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
