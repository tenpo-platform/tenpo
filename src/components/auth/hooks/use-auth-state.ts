"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getErrorText, getMessageText } from "@/components/auth/messages";

export type AuthMode =
  | "login"
  | "signup"
  | "verify-otp"
  | "reset-request"
  | "reset-password"
  | "invite";

export type AuthContext = "static" | "checkout" | "invite";

export interface UseAuthStateProps {
  initialMode?: AuthMode;
  context?: AuthContext;
  inviteEmail?: string;
  inviterName?: string;
  campName?: string;
  message?: string;
  error?: string;
  prefillEmail?: string;
}

export interface AuthState {
  // Mode
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;

  // Submission state
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;

  // OTP state
  otpEmail: string | null;
  setOtpEmail: (email: string | null) => void;
  otpPurpose: "signup" | "recovery";
  setOtpPurpose: (purpose: "signup" | "recovery") => void;
  otpCode: string;
  setOtpCode: (code: string) => void;
  otpError: string | null;
  setOtpError: (error: string | null) => void;
  isVerifying: boolean;
  setIsVerifying: (value: boolean) => void;
  isResending: boolean;
  setIsResending: (value: boolean) => void;
  resendCooldown: number;
  setResendCooldown: (value: number) => void;
  otpInputRef: React.RefObject<HTMLInputElement | null>;

  // Captcha state
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
  captchaError: boolean;
  setCaptchaError: (error: boolean) => void;

  // Computed values
  isInviteContext: boolean;
  lockedInviteEmail: string | undefined;
  emailDisplay: string | undefined;
  headerCopy: { title: string; description: string };
  messageText: string | null;
  errorText: string | null;

  // Captcha handlers
  handleCaptchaVerify: (token: string) => void;
  handleCaptchaError: () => void;
  handleCaptchaExpire: () => void;
}

export function useAuthState(props: UseAuthStateProps): AuthState {
  const {
    initialMode,
    context = "static",
    inviteEmail,
    inviterName,
    campName,
    message,
    error,
    prefillEmail,
  } = props;

  const searchParams = useSearchParams();
  const fallbackMessage = searchParams.get("message") ?? undefined;
  const fallbackError = searchParams.get("error") ?? undefined;

  const isInviteContext = context === "invite";
  const lockedInviteEmail = isInviteContext ? inviteEmail : undefined;
  const defaultMode = initialMode || (isInviteContext ? "invite" : "login");

  // Mode state
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP state
  const [otpEmail, setOtpEmail] = useState<string | null>(
    prefillEmail || lockedInviteEmail || null
  );
  const [otpPurpose, setOtpPurpose] = useState<"signup" | "recovery">("signup");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // Captcha state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((value) => value - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Captcha handlers
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

  // Header copy based on mode and context
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
          : "You've been invited to create an academy on Tenpo.",
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

  // Message and error text
  const messageText = useMemo(
    () => getMessageText(message || fallbackMessage),
    [message, fallbackMessage]
  );

  const errorText = useMemo(
    () => getErrorText(error || fallbackError),
    [error, fallbackError]
  );

  // Email display for OTP verification
  const emailDisplay = otpEmail || lockedInviteEmail || prefillEmail;

  return {
    mode,
    setMode,
    isSubmitting,
    setIsSubmitting,
    otpEmail,
    setOtpEmail,
    otpPurpose,
    setOtpPurpose,
    otpCode,
    setOtpCode,
    otpError,
    setOtpError,
    isVerifying,
    setIsVerifying,
    isResending,
    setIsResending,
    resendCooldown,
    setResendCooldown,
    otpInputRef,
    captchaToken,
    setCaptchaToken,
    captchaError,
    setCaptchaError,
    isInviteContext,
    lockedInviteEmail,
    emailDisplay,
    headerCopy,
    messageText,
    errorText,
    handleCaptchaVerify,
    handleCaptchaError,
    handleCaptchaExpire,
  };
}
