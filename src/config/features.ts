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
   * Disable for preview deployments where Turnstile isn't configured.
   */
  captcha: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== "false",

  /**
   * Enable Sentry error tracking and analytics.
   * Disable for local development or preview deployments.
   */
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false",
} as const;
