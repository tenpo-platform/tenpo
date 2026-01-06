# PRD 1: Authentication System

## Overview
Users can create accounts and log in to access role-specific features. Parents create accounts during checkout. Org admins create accounts during academy signup.

## User Stories

**As a parent**, I want to create an account when I register my child for a camp, so I can track my bookings and save my info for next time.

**As an org admin**, I want to create an account for my academy, so I can list camps and manage registrations.

**As a returning user**, I want to log in quickly, so I can access my dashboard without re-entering information.

**As a user who forgot my password**, I want to reset it via email, so I can regain access to my account.

## Flows

### Parent Account Creation (at checkout)
```
1. Parent clicks "Register" on camp detail page
2. If not logged in → Registration form starts with parent info
3. Parent enters: name, email, phone, password
4. System creates auth.user + profile (role: parent)
5. Parent continues to player info, emergency contact, waiver, payment
6. On success → Redirected to /dashboard
```

### Org Admin Signup
```
1. User clicks "I run an academy" on /signup
2. Form: org name, admin name, email, phone, password
3. System creates: organization + auth.user + profile (role: org_owner)
4. Email confirmation sent
5. After confirm → Redirected to /organizer
```

### Login
```
1. User visits /login
2. Enters email + password
3. On success:
   - If role includes org_admin/org_owner → /organizer
   - If role is parent only → /dashboard
4. On failure → Error message, stay on page
```

### Password Reset
```
1. User clicks "Forgot password" on /login
2. Enters email → System sends reset link via Resend
3. User clicks link → /reset-password?token=xxx
4. User enters new password (12+ chars, complexity enforced)
5. On success → Redirected to /login with success message
```

## Behavior Rules

- Email must be unique across all users
- Password: min 12 chars, must include upper, lower, digit, symbol
- Email confirmation required before first login
- Session persists for 1 hour (refresh token rotates)
- Protected routes redirect to /login if unauthenticated
- Role mismatch (parent trying /organizer) redirects to appropriate dashboard

## Success Criteria

- [ ] Parent can create account during registration flow
- [ ] Org admin can create account + org in single flow
- [ ] User can log in and is routed to correct dashboard
- [ ] User can reset password via email
- [ ] Protected routes reject unauthenticated users
- [ ] Password complexity is enforced
- [ ] Email confirmation works end-to-end
