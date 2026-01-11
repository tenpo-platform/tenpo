"use client";

import Link from "next/link";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { useAuthState } from "@/components/auth/hooks/use-auth-state";
import { useAuthHandlers } from "@/components/auth/hooks/use-auth-handlers";
import { LoginForm } from "@/components/auth/forms/login-form";
import { SignupForm } from "@/components/auth/forms/signup-form";
import { InviteForm } from "@/components/auth/forms/invite-form";
import { OtpVerification } from "@/components/auth/forms/otp-verification";
import { ResetRequestForm } from "@/components/auth/forms/reset-request-form";
import { ResetPasswordForm } from "@/components/auth/forms/reset-password-form";
import type { AuthMode, AuthContext } from "@/components/auth/hooks/use-auth-state";

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
  const state = useAuthState({
    initialMode,
    context,
    inviteEmail,
    inviterName,
    campName,
    message,
    error,
    prefillEmail,
  });

  const handlers = useAuthHandlers(state, {
    returnTo,
    onSuccess,
    inviteEmail,
  });

  return (
    <div className="space-y-6">
      {state.messageText && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          {state.messageText}
        </div>
      )}

      {state.errorText && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {state.errorText}
        </div>
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{state.headerCopy.title}</h1>
        <p className="text-muted-foreground text-sm">
          {state.headerCopy.description}
        </p>
      </div>

      {state.mode === "login" && (
        <LoginForm
          onSubmit={handlers.handleLogin}
          isSubmitting={state.isSubmitting}
          lockedInviteEmail={state.lockedInviteEmail}
          prefillEmail={prefillEmail}
          onForgotPassword={() => state.setMode("reset-request")}
        />
      )}

      {state.mode === "signup" && (
        <SignupForm
          onSubmit={handlers.handleSignup}
          isSubmitting={state.isSubmitting}
          prefillEmail={prefillEmail}
          captchaToken={state.captchaToken}
          captchaError={state.captchaError}
          onCaptchaVerify={state.handleCaptchaVerify}
          onCaptchaError={state.handleCaptchaError}
          onCaptchaExpire={state.handleCaptchaExpire}
        />
      )}

      {state.mode === "invite" && (
        <InviteForm
          onSubmit={handlers.handleInviteSignup}
          isSubmitting={state.isSubmitting}
          inviteEmail={inviteEmail}
        />
      )}

      {state.mode === "verify-otp" && (
        <OtpVerification
          emailDisplay={state.emailDisplay}
          otpEmail={state.otpEmail}
          otpCode={state.otpCode}
          otpError={state.otpError}
          isVerifying={state.isVerifying}
          isResending={state.isResending}
          resendCooldown={state.resendCooldown}
          otpInputRef={state.otpInputRef}
          onOtpEmailChange={state.setOtpEmail}
          onOtpCodeChange={(code) => {
            state.setOtpCode(code);
            state.setOtpError(null);
          }}
          onVerify={handlers.handleVerifyOtp}
          onResend={handlers.handleResendCode}
          onBackToLogin={() => state.setMode("login")}
        />
      )}

      {state.mode === "reset-request" && (
        <ResetRequestForm
          onSubmit={handlers.handleResetRequest}
          isSubmitting={state.isSubmitting}
          prefillEmail={prefillEmail}
        />
      )}

      {state.mode === "reset-password" && (
        <ResetPasswordForm
          onSubmit={handlers.handleResetPassword}
          isSubmitting={state.isSubmitting}
        />
      )}

      {state.mode !== "verify-otp" && state.mode !== "reset-password" && (
        <AuthFooter
          mode={state.mode}
          isInviteContext={state.isInviteContext}
          returnTo={returnTo}
          onModeChange={state.setMode}
        />
      )}
    </div>
  );
}

interface AuthFooterProps {
  mode: AuthMode;
  isInviteContext: boolean;
  returnTo?: string;
  onModeChange: (mode: AuthMode) => void;
}

function AuthFooter({
  mode,
  isInviteContext,
  returnTo,
  onModeChange,
}: AuthFooterProps) {
  return (
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
            onClick={() => onModeChange("signup")}
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
            onClick={() => onModeChange("invite")}
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
              onClick={() => onModeChange("login")}
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
            onClick={() => onModeChange("login")}
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
            onClick={() => onModeChange("login")}
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  );
}
