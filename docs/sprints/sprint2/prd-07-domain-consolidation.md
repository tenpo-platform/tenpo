# PRD 7: Domain Consolidation

## Overview
Retire app.jointenpo.com and consolidate everything under jointenpo.com.

## Current State
- jointenpo.com → Marketing placeholder (GoDaddy)
- app.jointenpo.com → Next.js app (Vercel)

## Target State
- jointenpo.com → Next.js app (Vercel) — everything lives here
- app.jointenpo.com → Redirect to jointenpo.com (or remove)

## Tasks

1. Update GoDaddy DNS:
   - Point jointenpo.com A/CNAME to Vercel
   - Remove or redirect app.jointenpo.com

2. Update Vercel:
   - Add jointenpo.com as primary domain
   - Remove app.jointenpo.com or set as redirect

3. Update Supabase:
   - Auth redirect URLs → jointenpo.com
   - Site URL config → jointenpo.com

4. Update Resend:
   - Verify DNS still valid for notifications.jointenpo.com

5. Update environment variables:
   - Any hardcoded URLs in code or env vars

## Success Criteria

- [ ] jointenpo.com serves the Next.js app
- [ ] app.jointenpo.com redirects to jointenpo.com (or is removed)
- [ ] Auth flows work on new domain
- [ ] Emails send successfully
- [ ] No broken links or redirects
