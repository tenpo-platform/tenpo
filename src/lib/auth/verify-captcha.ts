"use server";

import { features } from "@/config/features";

/**
 * Cloudflare Turnstile verification response
 */
interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Result of CAPTCHA verification
 */
export interface CaptchaVerifyResult {
  success: boolean;
  error?: string;
}

/**
 * Verify a Cloudflare Turnstile CAPTCHA token server-side.
 *
 * All environments call Cloudflare API, but with different keys:
 * - Local dev: Uses "always passes" test secret key
 * - Staging/Prod: Uses real secret key for actual verification
 *
 * @param token - The token from the Turnstile widget
 * @returns Result object with success boolean and optional error message
 */
export async function verifyCaptcha(
  token: string
): Promise<CaptchaVerifyResult> {
  // Skip verification if CAPTCHA feature is disabled
  if (!features.captcha) {
    return { success: true };
  }

  // Validate token is present
  if (!token) {
    return { success: false, error: "CAPTCHA token is required" };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("verifyCaptcha: TURNSTILE_SECRET_KEY is not set");
    // In production without a key, we should fail closed (deny)
    // But log the error so it can be fixed
    return { success: false, error: "Server configuration error" };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        "verifyCaptcha: Cloudflare API error:",
        response.status,
        response.statusText
      );
      return {
        success: false,
        error: "Unable to verify CAPTCHA. Please try again.",
      };
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.error("verifyCaptcha: Verification failed:", data["error-codes"]);

      // Map common error codes to user-friendly messages
      const errorCodes = data["error-codes"] || [];
      if (errorCodes.includes("timeout-or-duplicate")) {
        return {
          success: false,
          error: "CAPTCHA expired. Please try again.",
        };
      }
      if (errorCodes.includes("invalid-input-response")) {
        return {
          success: false,
          error: "Invalid CAPTCHA. Please try again.",
        };
      }

      return {
        success: false,
        error: "CAPTCHA verification failed. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("verifyCaptcha: Network error:", error);
    return {
      success: false,
      error: "Unable to verify CAPTCHA. Please check your connection.",
    };
  }
}
