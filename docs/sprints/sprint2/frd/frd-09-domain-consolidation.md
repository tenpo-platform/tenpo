# FRD 9: Domain Consolidation

## Current DNS (GoDaddy)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | GoDaddy builder IP | 600 |
| CNAME | app | cname.vercel-dns.com | 600 |
| CNAME | notifications | ... | 600 |
| TXT | ... | Resend verification | 600 |

## Target DNS

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 (Vercel) | 600 |
| CNAME | www | cname.vercel-dns.com | 600 |
| CNAME | notifications | ... | 600 |
| TXT | ... | Resend verification | 600 |

*Remove app.jointenpo.com CNAME*

## Vercel Configuration

```json
// vercel.json or Dashboard settings

{
  "domains": [
    {
      "domain": "jointenpo.com",
      "primary": true
    },
    {
      "domain": "www.jointenpo.com",
      "redirect": "jointenpo.com"
    }
  ]
}
```

## Supabase Configuration

```
Site URL: https://jointenpo.com
Redirect URLs:
  - https://jointenpo.com/**
  - http://localhost:3000/** (dev)
```

## Environment Variables Update

| Variable | Old Value | New Value |
|----------|-----------|-----------|
| NEXT_PUBLIC_APP_URL | https://app.jointenpo.com | https://jointenpo.com |
| (Supabase) Site URL | https://app.jointenpo.com | https://jointenpo.com |

## Verification Checklist

- [ ] DNS propagation complete (check with dig or DNS checker)
- [ ] Vercel deployment accessible at jointenpo.com
- [ ] SSL certificate issued for jointenpo.com
- [ ] www.jointenpo.com redirects to jointenpo.com
- [ ] app.jointenpo.com removed or redirects
- [ ] Supabase auth callbacks work
- [ ] Email links point to correct domain
- [ ] No hardcoded app.jointenpo.com references in code
