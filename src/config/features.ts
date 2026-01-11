/**
 * Feature flags controlled via environment variables.
 * Set these in Vercel dashboard or .env.local
 *
 * NEXT_PUBLIC_ENABLE_CAPTCHA=true|false
 * NEXT_PUBLIC_ENABLE_ANALYTICS=true|false
 */

export const features = {
  /**
   * Enable Cloudflare Turnstile CAPTCHA on auth forms.
   *
   * All environments use real Turnstile widget, but with different keys:
   * - Local dev: Uses Cloudflare's "always passes" test keys
   * - Staging/Prod: Uses real Turnstile keys for actual verification
   *
   * Set NEXT_PUBLIC_ENABLE_CAPTCHA=false to disable entirely.
   */
  captcha: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === "true",

  /**
   * Enable Sentry error tracking and analytics.
   * Disable for local development or preview deployments.
   */
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false",
} as const;
