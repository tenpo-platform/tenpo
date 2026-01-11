"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = useMemo(() => {
    return [
      {
        label: "At least 12 characters",
        met: password.length >= 12,
      },
      {
        label: "At least one lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "At least one uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "At least one number",
        met: /[0-9]/.test(password),
      },
      {
        label: "At least one special character (!@#$%^&*)",
        met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      },
    ];
  }, [password]);

  const metCount = requirements.filter((r) => r.met).length;
  const strength = metCount / requirements.length;

  const strengthLabel = useMemo(() => {
    if (strength === 0) return "Enter a password";
    if (strength < 0.4) return "Weak";
    if (strength < 0.8) return "Fair";
    if (strength < 1) return "Good";
    return "Strong";
  }, [strength]);

  const strengthColor = useMemo(() => {
    if (strength === 0) return "bg-muted";
    if (strength < 0.4) return "bg-destructive";
    if (strength < 0.8) return "bg-yellow-500";
    if (strength < 1) return "bg-blue-500";
    return "bg-green-500";
  }, [strength]);

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={cn(
              "font-medium",
              strength === 1 && "text-green-600",
              strength >= 0.8 && strength < 1 && "text-blue-600",
              strength >= 0.4 && strength < 0.8 && "text-yellow-600",
              strength > 0 && strength < 0.4 && "text-destructive"
            )}
          >
            {strengthLabel}
          </span>
        </div>
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn("h-full transition-all duration-300", strengthColor)}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {requirements.map((req) => (
          <li
            key={req.label}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              req.met ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {req.met ? (
              <svg
                className="size-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="size-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="9" />
              </svg>
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Check if password meets all requirements.
 * Use this for form validation.
 */
export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  );
}
