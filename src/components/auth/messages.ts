/**
 * Get user-facing message text from a message key.
 */
export function getMessageText(key: string | null | undefined): string | null {
  if (!key) return null;

  const messages: Record<string, string> = {
    signin_for_invite:
      "Please sign in to accept your invite. If you don't have an account yet, you can sign up first.",
    password_reset:
      "Password updated successfully. Please sign in with your new password.",
    session_expired: "Your session has expired. Please sign in again.",
  };

  return messages[key] ?? null;
}

/**
 * Get user-facing error text from an error key.
 */
export function getErrorText(key: string | null | undefined): string | null {
  if (!key) return null;

  const errors: Record<string, string> = {
    no_role:
      "Your account setup is incomplete. If you received an invite, please use the link from your email. Otherwise, contact support@tenpo.com.",
    auth: "Authentication failed. Please try again.",
    no_user: "Unable to verify your account. Please sign in again.",
    no_code: "Invalid authentication link. Please sign in again.",
  };

  return errors[key] ?? null;
}
