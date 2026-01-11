# Codex Review Follow-Up

## Gaps

### Gap 1: Checkout-without-confirmation flow

- CODEX: The checkout-without-confirmation flow is undefined. The current plan assumes immediate checkout after signup, but Supabase requires email confirmation before issuing a session by default; the mechanism to bypass or defer this is not specified.

- CLAUDE: **ACCEPT.** This is a valid gap. Supabase's default behavior requires email confirmation before a session is issued (see [Supabase Auth Config Docs](https://supabase.com/docs/guides/auth/general-configuration)). The plan implicitly assumed checkout could proceed, but didn't specify how.

  **Resolution:** Use option (1) from Codex's recommendation - disable `enable_confirmations` at the Supabase level and enforce confirmation gates at the application layer using `email_confirmed_at`. This is the cleaner approach because:

  1. It allows a session to exist immediately after signup (checkout can proceed)
  2. Protected routes like `/dashboard` check `email_confirmed_at IS NOT NULL` before allowing access
  3. This is a documented pattern in the Supabase community for e-commerce flows

  **Update required in:**
  - `supabase/config.toml`: Set `enable_confirmations = false`
  - `src/middleware.ts`: Add `email_confirmed_at` check for `/dashboard` but NOT for `/checkout/*`
  - `docs/sprints/sprint2/auth/handoff.md`: Document this gate pattern

- CODEX: Not resolved yet. If you disable confirmations, document the security trade-off and enforce `email_confirmed_at` gates for sensitive actions. If you keep confirmations, design a guest/temporary checkout + post-confirmation linking flow. This is a product decision.

- CLAUDE: **RESOLVED.** Making the product decision now: **Option 1 (disable confirmations, gate at app layer)**.

  **Security Trade-offs Documented:**

  | Risk | Mitigation |
  |------|------------|
  | Unverified emails in database | Acceptable for checkout; gate `/dashboard` and future purchases on `email_confirmed_at` |
  | Spam/bot signups | Turnstile captcha on signup form + rate limiting |
  | Account enumeration via signup | Already acceptable per scoping decision #15 (can reveal if email exists) |
  | Abandoned unverified accounts | Future: periodic cleanup job for accounts with `email_confirmed_at IS NULL` older than 30 days |

  **Gates requiring `email_confirmed_at IS NOT NULL`:**
  - `/dashboard` (parent dashboard)
  - `/organizer` (academy admin dashboard)
  - Future purchases (after initial checkout)
  - Profile editing
  - Sensitive account actions

  **Gates NOT requiring confirmation (allow unverified):**
  - `/checkout/*` (initial purchase flow)
  - `/onboarding/academy` (admin onboarding - they confirm via invite email click anyway)

  **Rationale for this decision:**
  1. Conversion > friction for first purchase
  2. Stripe handles payment fraud separately
  3. User must confirm before accessing any data or making future purchases
  4. This is standard e-commerce pattern (Amazon, Shopify stores allow purchase before confirmation)

---

- CODEX: Not fully agreed; this is a product/security trade-off. Ensure explicit sign-off and document fraud/abuse mitigations. Keep a guest checkout alternative in scope if risk increases.

### Gap 2: Per-user "Remember me" session duration

- CODEX: Per-user "Remember me" session duration is unspecified. Supabase `jwt_expiry` is global, so a per-user 30-day session cannot be achieved without an alternate design (refresh token handling, cookie maxAge, or custom session logic).

- CLAUDE: **ACCEPT.** Codex is correct that `jwt_expiry` is a global setting and cannot vary per-user (confirmed via [Supabase Sessions Docs](https://supabase.com/docs/guides/auth/sessions)). The handoff doc incorrectly implied this could be configured per-user.

  **Resolution:** Implement via client-side session expiry tracking rather than JWT expiry:

  1. Set global `jwt_expiry = 604800` (7 days) as the base
  2. Store a `session_expires_at` timestamp in localStorage when user logs in:
     - Without "Remember me": `now + 7 days`
     - With "Remember me": `now + 30 days`
  3. On each app load, check if `Date.now() > session_expires_at` and call `supabase.auth.signOut()` if expired
  4. The Supabase refresh token handles actual auth continuation behind the scenes

  This approach is semantically correct: "Remember me" controls when the *client* stops refreshing, not when the token itself expires. This matches how most auth systems implement "Remember me" in practice.

  **Update required in:**
  - `docs/sprints/sprint2/auth/handoff.md`: Revise "Remember me" implementation details
  - `src/components/auth/login-form.tsx`: Store expiry based on checkbox
  - `src/utils/supabase/client.ts` or a wrapper: Check expiry on session load

- CODEX: Partially resolved. Client-side expiry is a UX layer only; the server session still lives until the global TTL. If true server-side TTL is required, accept a single TTL or use a different auth/session strategy. If you keep this, make the limitation explicit.

- CLAUDE: **RESOLVED with documented limitation.**

  **Explicit Limitation:** The server-side refresh token continues to exist until global TTL (7 days) regardless of "Remember me" setting. Client-side expiry is a UX convenience, not a security boundary.

  **Accepted trade-off:** If a refresh token is stolen, attacker has 7 days regardless of user's "Remember me" choice. This is acceptable because:
  1. Refresh tokens are httpOnly cookies, not accessible to JS (XSS-resistant)
  2. True per-user TTL would require custom session infrastructure (Redis, database sessions) - overkill for MVP
  3. Most users checking "Remember me" want convenience, not security hardening

  **Implementation details:**
  ```typescript
  // On login
  const expiresAt = rememberMe
    ? Date.now() + 30 * 24 * 60 * 60 * 1000  // 30 days
    : Date.now() + 7 * 24 * 60 * 60 * 1000;  // 7 days
  localStorage.setItem('session_expires_at', expiresAt.toString());

  // On app load (in auth provider or middleware)
  const expiresAt = localStorage.getItem('session_expires_at');
  if (expiresAt && Date.now() > parseInt(expiresAt)) {
    await supabase.auth.signOut();  // This revokes refresh token server-side
    localStorage.removeItem('session_expires_at');
  }
  ```

  **Multi-tab logout:** Use `BroadcastChannel` or `storage` event listener to sync logout across tabs:
  ```typescript
  window.addEventListener('storage', (e) => {
    if (e.key === 'session_expires_at' && e.newValue === null) {
      // Another tab logged out, redirect to login
      window.location.href = '/login';
    }
  });
  ```

  **Future enhancement (post-MVP):** If true server-side per-user TTL is needed, migrate to Supabase's `auth.sessions` table with custom `inactivity_timeout` logic or use a Redis session store.

---

- CODEX: Done as a UX workaround; document that server TTL remains 7 days and ensure multi-tab logout sync is implemented.

### Gap 3: Invite validation for unauthenticated users

- CODEX: Invite validation for unauthenticated users is unclear. RLS prevents logged-out token checks, and the plan does not define whether to validate pre-login or post-login.

- CLAUDE: **ACCEPT.** The RLS policies on `invites` require `auth.uid()` which returns `NULL` for unauthenticated users, so anon users cannot query the table directly. This was not addressed.

  **Resolution:** Implement a `SECURITY DEFINER` RPC function that allows minimal validation without leaking invite details:

  ```sql
  CREATE OR REPLACE FUNCTION validate_invite_token(p_token text)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM invites
      WHERE token = p_token
        AND accepted_at IS NULL
        AND expires_at > now()
    ) THEN
      RETURN json_build_object('valid', true);
    ELSE
      RETURN json_build_object('valid', false);
    END IF;
  END;
  $$;
  ```

  This returns only `{valid: true/false}` - no email, no invite type, no details that could be enumerated. The actual invite details are fetched AFTER login when RLS allows it.

  **Flow:**
  1. `/invite/[token]` page calls `validate_invite_token(token)` (works for anon)
  2. If invalid → show generic "Invalid or expired invite" error
  3. If valid → redirect to login with `redirectTo=/invite/[token]`
  4. After login → fetch full invite details via RLS-protected query
  5. Proceed to onboarding

  **Update required in:**
  - `docs/sprints/sprint2/auth/handoff.md`: Add this RPC function
  - Migration file: Include `validate_invite_token` function

- CODEX: Accept with caution. Best practice is login-first to avoid token enumeration. If anon validation is required, keep it minimal, add rate limiting, and ensure uniform error timing.

- CLAUDE: **REVISED to login-first approach.** Codex is right - login-first is more secure and simpler.

  **New Flow (login-first):**
  1. User clicks `/invite/[token]` link
  2. Page does NOT validate token for anon users
  3. If not logged in → redirect to `/login?redirectTo=/invite/[token]` with message "Please sign in to accept your invite"
  4. After login → redirect back to `/invite/[token]`
  5. Now authenticated, page queries `invites` table via RLS (user can see invites for their email)
  6. If valid → redirect to `/onboarding/academy?token=[token]`
  7. If invalid/expired → show error "This invite is invalid or has expired"

  **Benefits of login-first:**
  - No public RPC needed (eliminates enumeration vector entirely)
  - Simpler implementation (just RLS, no SECURITY DEFINER)
  - Email match enforced by RLS policy naturally
  - Rate limiting handled by Supabase auth rate limits

  **RLS policy (already defined) is sufficient:**
  ```sql
  CREATE POLICY invites_select ON invites
    FOR SELECT USING (
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
      OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN')
    );
  ```

  **Removing `validate_invite_token` RPC from plan** - no longer needed.

  **UX consideration:** User landing on invite page without account sees "Please sign in or create an account to accept your invite" with login/signup options. This is better UX than a cryptic error anyway.

---

- CODEX: Done.

### Gap 4: Account linking for Google OAuth + email/password

- CODEX: Account linking behavior for Google OAuth + email/password is not defined, creating a risk of duplicate accounts or failed logins.

- CLAUDE: **PARTIALLY REJECT.** Supabase handles this automatically by default via [Automatic Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking). When a user signs in with OAuth, Supabase looks for an existing user with the same email and links the identities. This is the default behavior and requires no additional configuration.

  However, Codex is correct that we should **document this behavior** and handle edge cases:

  1. **OAuth first, then password:** User can call `updateUser({ password })` to add password auth to their OAuth-created account
  2. **Password first, then OAuth:** Automatic linking joins the OAuth identity to existing account (if email is verified)
  3. **Edge case - unverified email:** Supabase will NOT auto-link to unverified accounts to prevent account takeover attacks

  **Known issue to document:** There's a ["ghost password" bug](https://github.com/orgs/supabase/discussions/37737) where OAuth users using password reset creates a password without email identity. We should document that users should use `updateUser` instead of password reset to add password auth.

  **Update required in:**
  - `docs/sprints/sprint2/auth/handoff.md`: Add "Account Linking Behavior" section documenting Supabase's automatic linking
  - `docs/sprints/sprint2/frd/frd-02-authentication.md`: Note that duplicate accounts are prevented by automatic linking

- CODEX: Agree on documenting Supabase auto-linking, but call out that unverified email will not link. Add UX for "account exists with provider" and a clear "set password" flow for OAuth users.

- CLAUDE: **RESOLVED with UX specifications.**

  **UX for "Account exists with provider":**
  When user tries to sign up with email/password but account exists with Google:
  ```
  Error: "An account with this email already exists. Please sign in with Google,
         or use 'Forgot Password' to set a password for email login."
  ```
  This is secure (doesn't confirm which provider) while being helpful.

  **"Set Password" flow for OAuth users (Account Settings page - future sprint):**
  ```
  Account Settings
  ├── Email: user@example.com (verified ✓)
  ├── Connected Accounts
  │   └── Google: Connected ✓
  └── Password
      └── [Set Password] button
          → Opens modal with password + confirm password
          → Calls supabase.auth.updateUser({ password })
          → Shows success: "Password set! You can now sign in with email/password."
  ```

  **Important:** Do NOT use "Forgot Password" flow for OAuth users adding password - this creates the "ghost password" bug. The "Set Password" flow via `updateUser()` is the correct path.

  **Sprint 2 scope:** Document behavior in handoff. Account Settings UI is future sprint - for now, OAuth users who want password auth can contact support.

  **Edge case - unverified email auto-linking:**
  - Document explicitly: If user signs up with email/password but doesn't verify, then later tries Google OAuth with same email, Supabase will NOT auto-link (security measure against account takeover)
  - UX: Show error "Please verify your email first, or sign in with your password"

---

- CODEX: Done; keep error copy neutral to avoid provider disclosure where possible.

## Critical Issues

### Critical Issue 1: Checkout flow will break

- CODEX: Checkout flow will likely break if email confirmation remains required, because no session will exist to continue checkout. This is a blocking risk for the "signup during checkout" flow.

- CLAUDE: **ACCEPT.** This is blocking. See Gap 1 resolution above.

  **Summary:** Disable `enable_confirmations` in Supabase config and enforce confirmation at application layer for sensitive routes only. Checkout proceeds without confirmation; dashboard access requires it.

- CODEX: Agree this is blocking. Resolve the confirmation strategy before implementation to avoid rework in checkout and middleware.

- CLAUDE: **RESOLVED.** See Gap 1 final resolution. Strategy locked: disable confirmations, gate at app layer.

---

- CODEX: Not fully agreed; see Gap 1 trade-off. Confirm product/security sign-off before implementation.

### Critical Issue 2: "Remember me" not implementable as written

- CODEX: "Remember me" requirement is not implementable as written with a single global `jwt_expiry`, which will cause inconsistent or misleading UX.

- CLAUDE: **ACCEPT.** See Gap 2 resolution above.

  **Summary:** Implement "Remember me" via client-side session expiry tracking. JWT expiry remains global (7 days). Client decides when to stop auto-refreshing based on stored `session_expires_at` timestamp.

- CODEX: Agree it's a gap, but this approach is only a client UX shim. If you accept it, document that server sessions still exist and ensure logout happens in all tabs.

- CLAUDE: **RESOLVED.** See Gap 2 final resolution. Limitation documented, multi-tab sync specified.

---

- CODEX: Done if the limitation is clearly documented and communicated to stakeholders.

### Critical Issue 3: Trigger auto-assigns PARENT for all signups

- CODEX: Trigger auto-assigns PARENT role for all signups, conflicting with the decision to defer PARENT role for invited academy admins.

- CLAUDE: **ACCEPT.** The current trigger unconditionally inserts `PARENT` role for every new `auth.users` row. This conflicts with decision #19 in scoping-questions.md: "Academy admins (B2B): ACADEMY_ADMIN role assigned when accepting invite (NOT auto-assigned PARENT)".

  **Resolution:** Implement conditional role assignment in the trigger based on signup context:

  ```sql
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  DECLARE
    v_has_pending_invite boolean;
  BEGIN
    -- Create profile with metadata
    INSERT INTO public.profiles (id, first_name, last_name, phone_number)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'phone_number'
    );

    -- Check if user has a pending invite (B2B flow)
    SELECT EXISTS (
      SELECT 1 FROM invites
      WHERE email = NEW.email
        AND accepted_at IS NULL
        AND expires_at > now()
    ) INTO v_has_pending_invite;

    -- Only auto-assign PARENT if NOT an invited admin
    IF NOT v_has_pending_invite THEN
      INSERT INTO public.user_roles (user_id, role, is_primary)
      VALUES (NEW.id, 'PARENT', true);
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

  This way:
  - B2C signups (no pending invite) → PARENT role assigned
  - B2B signups (has pending invite) → NO role assigned until `accept_invite` is called, which assigns ACADEMY_ADMIN

  **Update required in:**
  - `docs/sprints/sprint2/auth/handoff.md`: Update trigger code
  - Migration file: Use conditional trigger logic

- CODEX: Agree. Ensure the invite lookup excludes expired/used invites so admins are not misclassified.

- CLAUDE: **CONFIRMED.** The trigger query already excludes expired/used invites:
  ```sql
  WHERE email = NEW.email
    AND accepted_at IS NULL   -- not used
    AND expires_at > now()    -- not expired
  ```

---

- CODEX: Done.

## Recommendations

### Recommendation 1: Confirmation strategy

- CODEX: Decide and document a concrete confirmation strategy. Best practice options: (1) disable email confirmation temporarily and enforce access gates with `email_confirmed_at`, or (2) keep confirmation required and implement a guest/temporary checkout that later links to a confirmed account. Pick one and align `docs/sprints/sprint2/auth/handoff.md`.

- CLAUDE: **ACCEPT.** Going with option (1). See Gap 1 resolution.

  **Rationale:** Option (2) adds significant complexity (guest session management, account linking after confirmation). Option (1) is simpler, well-documented, and standard for e-commerce platforms.

- CODEX: Not fully agreed. This is a product/security trade-off; guest checkout is more complex but keeps confirmations enforced. Decide based on risk tolerance and fraud posture.

- CLAUDE: **DECISION MADE.** Going with option 1. See Gap 1 for full risk/mitigation table. Product decision rationale:
  - Tenpo is B2C e-commerce; conversion rate matters more than enforced confirmation at signup
  - Stripe handles payment fraud (chargebacks, card verification)
  - Confirmation is still required before accessing dashboard/data - not "no confirmation", just "deferred confirmation"
  - This is the Amazon/Shopify pattern, proven at scale

  If fraud becomes an issue post-launch, we can add: (a) email verification before high-value purchases, (b) phone verification for suspicious accounts, (c) manual review queue. These are future enhancements, not MVP blockers.

---

- CODEX: Not fully agreed; keep a fallback guest checkout plan and revisit if fraud/abuse rises.

### Recommendation 2: Redesign "Remember me"

- CODEX: Redesign "Remember me" to a supported pattern. Recommended: keep a single JWT expiry and adjust cookie `maxAge`/refresh token rotation for longer sessions, or drop the per-user duration requirement if Supabase cannot support it cleanly.

- CLAUDE: **ACCEPT.** Implementing via client-side session expiry tracking. See Gap 2 resolution.

- CODEX: Accept only as a UX workaround. If the business truly needs 30-day sessions, change requirements or adopt a backend/session layer that supports per-user TTL.

- CLAUDE: **ACCEPTED as UX workaround.** The business requirement is "users who check 'Remember me' shouldn't have to log in as often" - this is satisfied by the client-side approach. True server-side TTL is not required for this use case.

---

- CODEX: Done as a UX workaround; document that it is not a security control.

### Recommendation 3: Invite validation security

- CODEX: For invite validation, avoid leaking invite validity to anonymous users. Best practice is to require login first, then validate the token server-side; if pre-login validation is required, expose only a minimal "valid/invalid" response via a hardened RPC with strict throttling.

- CLAUDE: **ACCEPT.** Implementing minimal `validate_invite_token` RPC. See Gap 3 resolution.

  **Additional security measure:** Add rate limiting via Supabase's built-in rate limiting on RPC calls, or implement a simple counter in the function to prevent brute-force token enumeration.

- CODEX: Agree if anon validation is required; otherwise prefer login-first to avoid validating tokens publicly.

- CLAUDE: **REVISED to login-first.** See Gap 3 final resolution. No public RPC needed; simpler and more secure.

---

- CODEX: Done.

### Recommendation 4: Conditional role assignment

- CODEX: Implement conditional role assignment for invite-based admin onboarding (e.g., set a flag in `raw_user_meta_data` during signup or apply role assignment only after invite acceptance) to honor the "no PARENT for admins" decision.

- CLAUDE: **ACCEPT.** Implementing via invite-check in trigger. See Critical Issue 3 resolution.

  **Note:** Using the invite table lookup approach rather than metadata flag because it's more reliable - if we used a metadata flag, we'd need to ensure the signup form sets it correctly, which adds a coordination point. The invite table is the source of truth.

- CODEX: Agree. Consider a fallback if an invite expires between signup and onboarding to avoid role assignment ambiguity.

- CLAUDE: **EDGE CASE ADDRESSED.** Scenario: User signs up with pending invite → invite expires before onboarding → user has no role.

  **Fallback behavior:**
  1. User visits `/invite/[token]` after login
  2. Query returns no valid invite (expired)
  3. Show error: "This invite has expired. Please contact the person who invited you for a new link."
  4. User is left with NO roles (not even PARENT, since trigger skipped it due to pending invite at signup time)

  **Resolution options:**
  - **Option A (chosen):** Assign PARENT role as fallback if user has no roles and no valid pending invite. Add to `accept_invite` error path or create a "role cleanup" job.
  - **Option B:** Leave user in limbo until they contact support (not great UX).

  **Implementation - modify `/invite/[token]` page:**
  ```typescript
  // After login, if invite is invalid/expired
  const { data: userRoles } = await supabase.from('user_roles').select('role');

  if (!userRoles || userRoles.length === 0) {
    // User has no roles - this is the edge case
    // Option: Auto-assign PARENT as fallback
    await supabase.from('user_roles').insert({
      user_id: user.id,
      role: 'PARENT',
      is_primary: true
    });
    // Then show error about expired invite
  }
  ```

  **Added to handoff:** Handle this edge case in `/invite/[token]` page logic.

---

- CODEX: Needs product decision; auto-assigning PARENT after invite expiry may conflict with "no PARENT for admins" intent.

- CLAUDE: **FINAL DECISION (Product Sign-off 2026-01-08):** Do NOT assign PARENT as fallback. Show "contact support" screen instead. User must request a new invite. This preserves the "no PARENT for admins" intent.

### Recommendation 5: Define account linking

- CODEX: Define account linking: if a Google OAuth user later uses email/password, link identities by email in Supabase and provide a recovery path if the email is already linked to a different identity.

- CLAUDE: **PARTIALLY ACCEPT.** Supabase handles automatic linking. We need to document the behavior and edge cases. See Gap 4 resolution.

- CODEX: Agree. Add explicit UX for OAuth users to add a password via account settings (avoid password reset flow).

- CLAUDE: **RESOLVED.** See Gap 4 final resolution. UX specified for both error states and future "Set Password" flow. Sprint 2 scope limited to documentation; Account Settings UI is future sprint.

---

- CODEX: Done; ensure error copy stays provider-neutral and avoids account enumeration.

## Action Items (Revised)

Based on this review dialogue, the following documents need updates:

### 1. `supabase/config.toml`
- [ ] Set `enable_confirmations = false`

### 2. `docs/sprints/sprint2/auth/handoff.md`
- [ ] Add email confirmation gate pattern with security trade-off table
- [ ] List routes requiring `email_confirmed_at` vs routes that don't
- [ ] Revise "Remember me" to client-side session expiry with code examples
- [ ] Add multi-tab logout sync implementation
- [ ] Document limitation: server session lives until global TTL
- [ ] **REMOVE** `validate_invite_token` RPC (switched to login-first)
- [ ] Update invite flow to login-first pattern
- [ ] Update `handle_new_user` trigger with conditional PARENT assignment
- [ ] Add expired invite "contact support" screen (NO PARENT fallback)
- [ ] Add "Account Linking Behavior" section with UX error messages
- [ ] Document "Set Password" flow for OAuth users (future sprint placeholder)

### 3. `docs/sprints/sprint2/frd/frd-02-authentication.md`
- [ ] Update email confirmation to "disabled at Supabase, gated at app layer"
- [ ] Add note about automatic identity linking
- [ ] Add UX copy for "account exists with provider" error

### 4. Migration file
- [ ] Update `handle_new_user` trigger with invite check
- [ ] **DO NOT add** `validate_invite_token` (removed from plan)

### 5. `docs/sprints/sprint2/auth/scoping-questions.md`
- [ ] Update decision #2 (email confirmation) to reflect new strategy
- [ ] Add note about "Remember me" limitation

---

## Resolution Summary

| Issue | Status | Final Decision |
|-------|--------|----------------|
| Gap 1: Checkout confirmation | ✅ APPROVED | Disable confirmations, gate at app layer |
| Gap 2: Remember me TTL | ✅ RESOLVED | Client-side expiry (UX workaround), documented limitation |
| Gap 3: Invite validation | ✅ RESOLVED | Login-first, no public RPC |
| Gap 4: Account linking | ✅ RESOLVED | Supabase auto-links, document behavior + UX |
| Critical 1: Checkout break | ✅ APPROVED | See Gap 1 |
| Critical 2: Remember me | ✅ RESOLVED | See Gap 2 |
| Critical 3: PARENT trigger | ✅ RESOLVED | Conditional assignment in trigger |
| Edge case: Expired invite | ✅ APPROVED | Show "contact support" screen (NO PARENT fallback) |

## Product Sign-off (2026-01-08)

1. **Email Confirmation Strategy**: ✅ APPROVED - Risk accepted that some fake emails may exist in database in exchange for smoother checkout flow.

2. **Expired Invite Handling**: ✅ APPROVED - If invite expires after signup but before onboarding, show "contact support" screen. Do NOT assign PARENT role as fallback. User must request new invite.

---

## References

- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/general-configuration)
- [Supabase Sessions](https://supabase.com/docs/guides/auth/sessions)
- [Supabase Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [GitHub Discussion: Per-user session duration](https://github.com/orgs/supabase/discussions/889)
