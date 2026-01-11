"use client";

import { useEffect, useRef } from "react";
import { features } from "@/config/features";

/**
 * Cloudflare Turnstile global types
 */
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

interface TurnstileCaptchaProps {
  /**
   * Called when CAPTCHA is successfully completed.
   * In bypass mode (local dev), this is called immediately with "BYPASS_LOCAL_DEV".
   */
  onVerify: (token: string) => void;
  /**
   * Called when CAPTCHA encounters an error.
   */
  onError?: () => void;
  /**
   * Called when CAPTCHA token expires.
   */
  onExpire?: () => void;
}

/**
 * Cloudflare Turnstile CAPTCHA component.
 *
 * Behavior based on features.captcha flag:
 * - Enabled (staging/prod): Renders Turnstile widget and returns real token
 * - Disabled (local dev): Returns bypass token immediately, no widget rendered
 *
 * Required environment variables for real verification:
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY: Public site key from Cloudflare
 * - TURNSTILE_SECRET_KEY: Secret key for server-side verification (not exposed to client)
 */
export function TurnstileCaptcha({
  onVerify,
  onError,
  onExpire,
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Store callbacks in refs to avoid dependency issues
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  // Keep refs up to date
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    // Don't render widget if CAPTCHA is disabled
    if (!features.captcha) return;

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.error(
        "TurnstileCaptcha: NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set"
      );
      // Call error callback if key is missing
      onErrorRef.current?.();
      return;
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return;

      // Remove existing widget if any
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may have already been removed
        }
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerifyRef.current(token),
        "error-callback": () => onErrorRef.current?.(),
        "expired-callback": () => onExpireRef.current?.(),
        theme: "auto",
      });
    };

    // Check if Turnstile script is already loaded
    if (window.turnstile) {
      renderWidget();
    } else {
      // Check if script is already in the document
      const existingScript = document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      );

      if (!existingScript) {
        // Load Turnstile script
        const script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
        script.async = true;
        script.defer = true;

        window.onTurnstileLoad = renderWidget;
        document.head.appendChild(script);
      } else {
        // Script exists but turnstile not ready yet, set callback
        window.onTurnstileLoad = renderWidget;
      }
    }

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may have already been removed
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  // Don't render anything if CAPTCHA is disabled
  if (!features.captcha) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-center"
      data-testid="turnstile-container"
    />
  );
}
