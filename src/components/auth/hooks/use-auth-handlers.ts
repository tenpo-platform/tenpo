"use client";

import { toast } from "sonner";
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
import type { AuthState } from "@/components/auth/hooks/use-auth-state";
import type {
  LoginFormData,
  SignupFormData,
  InviteFormData,
  ResetRequestFormData,
  ResetPasswordFormData,
} from "@/components/auth/schemas";

export interface UseAuthHandlersProps {
  returnTo?: string;
  onSuccess?: () => void;
  inviteEmail?: string;
}

export interface AuthHandlers {
  handleLogin: (data: LoginFormData) => Promise<void>;
  handleSignup: (data: SignupFormData) => Promise<void>;
  handleInviteSignup: (data: InviteFormData) => Promise<void>;
  handleResetRequest: (data: ResetRequestFormData) => Promise<void>;
  handleResetPassword: (data: ResetPasswordFormData) => Promise<void>;
  handleVerifyOtp: () => Promise<void>;
  handleResendCode: () => Promise<void>;
}

export function useAuthHandlers(
  state: AuthState,
  props: UseAuthHandlersProps
): AuthHandlers {
  const { returnTo, onSuccess, inviteEmail } = props;
  const { redirectAfterAuth } = useAuthFlow({ returnTo, onSuccess });

  const handleLogin = async (data: LoginFormData) => {
    state.setIsSubmitting(true);
    try {
      const email = state.lockedInviteEmail || data.email;
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
          state.setOtpEmail(email);
          state.setOtpPurpose("signup");
          state.setMode("verify-otp");
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

      await redirectAfterAuth(state.isInviteContext ? returnTo : undefined);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      state.setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    if (features.captcha && !state.captchaToken) {
      toast.error("Please complete the CAPTCHA verification.");
      return;
    }

    state.setIsSubmitting(true);

    try {
      if (state.captchaToken) {
        const captchaResult = await verifyCaptcha(state.captchaToken);
        if (!captchaResult.success) {
          toast.error(captchaResult.error || "CAPTCHA verification failed.");
          state.setIsSubmitting(false);
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

      state.setOtpEmail(data.email);
      state.setOtpPurpose("signup");
      state.setMode("verify-otp");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      state.setIsSubmitting(false);
    }
  };

  const handleInviteSignup = async (data: InviteFormData) => {
    if (!inviteEmail) {
      toast.error("Invite email missing. Please use your invite link again.");
      return;
    }

    state.setIsSubmitting(true);

    try {
      const { error: signUpError } = await signUpWithPassword(
        inviteEmail,
        data.password
      );

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast.error("This email already has an account. Please sign in.");
          state.setMode("login");
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
      state.setIsSubmitting(false);
    }
  };

  const handleResetRequest = async (data: ResetRequestFormData) => {
    state.setIsSubmitting(true);
    try {
      await resetPasswordForEmail(data.email);
      state.setOtpEmail(data.email);
      state.setOtpPurpose("recovery");
      state.setMode("verify-otp");
    } catch {
      // Always transition to OTP screen to avoid email enumeration
      state.setOtpEmail(data.email);
      state.setOtpPurpose("recovery");
      state.setMode("verify-otp");
    } finally {
      state.setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    state.setIsSubmitting(true);
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
      state.setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = state.otpEmail;
    const code = state.otpCode.trim();

    if (!email) {
      state.setOtpError("Please enter the email address you used to sign up.");
      return;
    }

    if (code.length !== 6) {
      state.setOtpError("Please enter the 6-digit code from your email");
      return;
    }

    state.setIsVerifying(true);
    state.setOtpError(null);

    try {
      const { error: verifyError } = await verifyOtp(
        email,
        code,
        state.otpPurpose
      );

      if (verifyError) {
        if (verifyError.message.includes("expired")) {
          state.setOtpError("This code has expired. Please request a new one.");
        } else if (verifyError.message.includes("invalid")) {
          state.setOtpError("Invalid code. Please check and try again.");
        } else {
          state.setOtpError("Verification failed. Please try again.");
        }
        return;
      }

      if (state.otpPurpose === "recovery") {
        state.setMode("reset-password");
        return;
      }

      toast.success("Email verified successfully!");
      await redirectAfterAuth();
    } catch {
      state.setOtpError("An error occurred. Please try again.");
    } finally {
      state.setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!state.otpEmail || state.resendCooldown > 0) return;

    state.setIsResending(true);
    try {
      if (state.otpPurpose === "recovery") {
        await resetPasswordForEmail(state.otpEmail);
      } else {
        const { error: resendError } = await resendOtp(state.otpEmail, "signup");
        if (resendError) {
          toast.error("Unable to resend code. Please try again later.");
          return;
        }
      }

      toast.success("Verification code sent!");
      state.setResendCooldown(60);
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      state.setIsResending(false);
    }
  };

  return {
    handleLogin,
    handleSignup,
    handleInviteSignup,
    handleResetRequest,
    handleResetPassword,
    handleVerifyOtp,
    handleResendCode,
  };
}
