# Google OAuth Setup Instructions

**Purpose:** Enable "Sign in with Google" for Tenpo authentication.

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name: `Tenpo` (or `Tenpo Production`)
4. Click **Create**

---

## Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (allows any Google user to sign in)
3. Click **Create**

Fill in the form:

| Field | Value |
|-------|-------|
| App name | Tenpo |
| User support email | your-email@domain.com |
| App logo | Upload Tenpo logo (optional but recommended) |
| App domain | `tenpo.com` (or your domain) |
| Authorized domains | `tenpo.com`, `vercel.app` (add all domains) |
| Developer contact email | your-email@domain.com |

4. Click **Save and Continue**

### Scopes

1. Click **Add or Remove Scopes**
2. Select these scopes:
   - `email` - See your primary Google Account email address
   - `profile` - See your personal info (name, profile photo)
   - `openid` - Associate you with your personal info on Google
3. Click **Update** → **Save and Continue**

### Test Users (Development Only)

- For development, add test user emails
- For production, you'll need to publish the app

---

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Tenpo Web Client`

### Authorized JavaScript Origins

Add all domains where your app runs:

**Local Development:**
```
http://localhost:3000
http://127.0.0.1:3000
```

**Staging:**
```
https://your-staging-domain.vercel.app
```

**Production:**
```
https://tenpo.com
https://www.tenpo.com
```

### Authorized Redirect URIs

These are Supabase callback URLs. Format: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

**Local Development:**
```
http://127.0.0.1:54321/auth/v1/callback
```

**Production:**
```
https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
```

5. Click **Create**
6. **Copy the Client ID and Client Secret** - you'll need these!

---

## Step 4: Configure Supabase

### Local Development (`supabase/config.toml`)

Add to your `config.toml`:

```toml
[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"
redirect_uri = ""  # Leave empty, Supabase handles this
```

Add to your `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### Production (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google**
5. Enter your Client ID and Client Secret
6. Save

---

## Step 5: Update Authorized Redirect URIs

After setting up Supabase, you may need to update Google Cloud Console with the exact callback URL Supabase provides.

Check your Supabase dashboard under **Authentication** → **URL Configuration** for the exact callback URL.

---

## Step 6: Frontend Implementation

The auth implementation will include a Google sign-in button that calls:

```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

---

## Environment Variables Summary

| Variable | Where | Description |
|----------|-------|-------------|
| `GOOGLE_CLIENT_ID` | `.env.local`, Vercel | OAuth Client ID from Google |
| `GOOGLE_CLIENT_SECRET` | `.env.local`, Vercel | OAuth Client Secret from Google |

---

## Testing Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Redirect URIs added for local + production
- [ ] Supabase config updated (local)
- [ ] Supabase dashboard updated (production)
- [ ] Environment variables set
- [ ] Test sign-in flow works

---

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Check redirect URI matches exactly (no trailing slash)
- Verify authorized JavaScript origins include your domain

### "Error 400: redirect_uri_mismatch"
- The callback URL doesn't match what's in Google Console
- Add the exact URL shown in the error to Google Console

### User sees consent screen every time
- This is normal for unverified apps in development
- Will improve after Google app verification (production)

---

## Security Notes

- **Never commit** client secrets to git
- Use environment variables for all credentials
- Rotate secrets if they're ever exposed
- For production, complete Google's app verification process

---

## Timeline

| Task | Time |
|------|------|
| Create Google Cloud project | 5 min |
| Configure OAuth consent screen | 10 min |
| Create credentials | 5 min |
| Configure Supabase | 5 min |
| Test integration | 10 min |
| **Total** | ~35 min |
