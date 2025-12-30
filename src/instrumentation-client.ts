import * as Sentry from "@sentry/nextjs";

const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false";

if (isAnalyticsEnabled) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Reduce sampling in production for performance/cost
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Capture Replay for errors
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [Sentry.replayIntegration()],

    debug: false,
  });
}

// Required for navigation instrumentation in Next.js 16+
export const onRouterTransitionStart = isAnalyticsEnabled
  ? Sentry.captureRouterTransitionStart
  : undefined;
