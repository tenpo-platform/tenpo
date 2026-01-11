"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OtpVerificationProps {
  emailDisplay?: string;
  otpEmail: string | null;
  otpCode: string;
  otpError: string | null;
  isVerifying: boolean;
  isResending: boolean;
  resendCooldown: number;
  otpInputRef: React.RefObject<HTMLInputElement | null>;
  onOtpEmailChange: (email: string) => void;
  onOtpCodeChange: (code: string) => void;
  onVerify: () => Promise<void>;
  onResend: () => Promise<void>;
  onBackToLogin: () => void;
}

export function OtpVerification({
  emailDisplay,
  otpEmail,
  otpCode,
  otpError,
  isVerifying,
  isResending,
  resendCooldown,
  otpInputRef,
  onOtpEmailChange,
  onOtpCodeChange,
  onVerify,
  onResend,
  onBackToLogin,
}: OtpVerificationProps) {
  return (
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
          onChange={(event) => onOtpEmailChange(event.target.value)}
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
          onOtpCodeChange(value);
        }}
        className="text-center text-2xl font-mono tracking-widest"
        disabled={isVerifying}
        autoFocus={Boolean(emailDisplay)}
      />

      {otpError && <p className="text-destructive text-sm">{otpError}</p>}

      <Button
        onClick={onVerify}
        disabled={isVerifying || otpCode.length !== 6}
        className="w-full"
      >
        {isVerifying ? "Verifying..." : "Verify email"}
      </Button>

      <div className="text-muted-foreground space-y-3 text-sm">
        <p>Didn&apos;t receive the email? Check your spam folder.</p>
        <Button
          variant="secondary"
          onClick={onResend}
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
          onClick={onBackToLogin}
          className="text-primary hover:underline"
        >
          Return to sign in
        </button>
      </div>
    </div>
  );
}
