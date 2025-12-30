# Supabase Configuration Guide

This document describes the security-hardened Supabase configuration for the Tenpo project.

---

## Environment Variables Required

The following environment variables must be set for the application to run:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side access | Yes |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key for CAPTCHA | Yes (production) |

---

## Authentication Configuration

### Password Policy

Strong password requirements are enforced:

```toml
minimum_password_length = 12
password_requirements = "lower_upper_letters_digits_symbols"
```

**Requirements:**
- Minimum 12 characters
- Must contain lowercase letters
- Must contain uppercase letters
- Must contain digits
- Must contain symbols

### Email Confirmation

Email verification is required before users can sign in:

```toml
[auth.email]
enable_confirmations = true
double_confirm_changes = true
secure_password_change = true
```

- Users must confirm their email address before accessing the app
- Email changes require confirmation on both old and new addresses
- Password changes require recent authentication

### CAPTCHA Protection

Cloudflare Turnstile is enabled to prevent bot signups:

```toml
[auth.captcha]
enabled = true
provider = "turnstile"
secret = "env(TURNSTILE_SECRET_KEY)"
```

**Setup Instructions:**
1. Create a Turnstile widget at [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Add your site key to your frontend auth forms
3. Add the secret key to your environment variables as `TURNSTILE_SECRET_KEY`

---

## Rate Limiting

Strict rate limits are configured to prevent abuse:

| Action | Limit | Time Window |
|--------|-------|-------------|
| Sign up / Sign in | 10 requests | 5 minutes per IP |
| Token refresh | 30 requests | 5 minutes per IP |
| OTP verification | 10 requests | 5 minutes per IP |
| Email sent | 2 emails | 1 hour |
| SMS sent | 10 messages | 1 hour |

---

## API Security

### TLS/HTTPS

Local development uses HTTPS with self-signed certificates:

```toml
[api.tls]
enabled = true
```

**Note:** For local development, you may need to:
1. Generate self-signed certificates
2. Configure your browser to trust the local CA
3. Or set `enabled = false` for development only

### Row Limits

API responses are limited to prevent data exfiltration:

```toml
max_rows = 1000
```

---

## Local Development Ports

| Service | Port |
|---------|------|
| API | 54321 |
| Database | 54322 |
| Studio | 54323 |
| Inbucket (Email) | 54324 |
| Analytics | 54327 |
| Connection Pooler | 54329 |

---

## Session Configuration

```toml
jwt_expiry = 3600                    # 1 hour token lifetime
enable_refresh_token_rotation = true  # Rotate refresh tokens
refresh_token_reuse_interval = 10     # 10 second grace period
```

---

## Disabled Features

The following features are disabled by default for security:

- Anonymous sign-ins (`enable_anonymous_sign_ins = false`)
- Manual account linking (`enable_manual_linking = false`)
- SMS signups (`[auth.sms] enable_signup = false`)
- MFA enrollment (disabled until needed)
- OAuth providers (disabled until configured)

---

## Production Checklist

Before deploying to production:

- [ ] Set `TURNSTILE_SECRET_KEY` environment variable
- [ ] Configure production SMTP server in `[auth.email.smtp]`
- [ ] Review and adjust rate limits for expected traffic
- [ ] Set up proper TLS certificates (not self-signed)
- [ ] Configure allowed redirect URLs in `additional_redirect_urls`
- [ ] Update `site_url` to production domain
- [ ] Enable MFA if required for your use case
- [ ] Configure OAuth providers if using social login

---

## Files Modified

- `supabase/config.toml` - Main Supabase configuration
- `src/utils/supabase/client.ts` - Browser client with env validation
- `src/utils/supabase/server.ts` - Server client with env validation
- `src/utils/supabase/middleware.ts` - Middleware client with env validation
