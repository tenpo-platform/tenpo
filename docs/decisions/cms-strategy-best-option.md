# Tenpo Architecture Strategy

> Decision document for domain strategy, auth system, and CMS approach for the Tenpo sports camp marketplace.

---

## Context

Tenpo is a two-sided marketplace:
- **Camp organizers** create and manage camp listings
- **Parents/athletes** browse, select, and pay for camps

**Tech stack:**
- Next.js (app router)
- Supabase (auth + database)
- Stripe (payments, Connect for payouts)
- Resend (notifications)
- Domain: jointenpo.com

---

## Key Decisions

### 1. Do parents/athletes need accounts?

**Decision: Yes, but create the account at checkout, not before.**

**Reasoning:**
- Camp registration inherently requires substantial info (child name, age, medical info, emergency contacts, waivers)
- An "account" is really just saving this info for next time
- Sports camps are seasonal/recurring — parents return each year
- Booking management requires identity (view upcoming camps, receive updates, handle refunds)
- Stripe disputes require customer identity tied to transactions

**Recommended flow:**
```
Browse camps (no account)
    → View camp details (no account)
        → Click "Register"
            → Checkout (account created here)
```

Frame account creation as "save your info for faster registration next time" rather than a barrier.

---

### 2. Domain strategy

**Decision: Single domain, single codebase**

```
jointenpo.com/*  → Everything lives here
```

**Not using subdomain split** (e.g., app.jointenpo.com) because:
- Cross-subdomain auth adds complexity
- Single deployment is simpler
- No real benefit at this stage

---

### 3. CMS strategy

**Decision: Defer Payload CMS until content velocity justifies it**

**Phase 1 (MVP):** Hardcode marketing pages in Next.js
**Phase 2 (if needed):** Add Payload CMS for marketing content

**When to add Payload:**
- Blog posts weekly, landing page tweaks monthly → Add Payload
- Homepage changes twice a year → Keep hardcoded

**What Payload would provide:**
- Headless CMS that installs directly into Next.js `/app` folder
- Admin panel at `/admin` for non-technical cofounder
- Block-based content editing (Hero, Features, CTA, etc.)
- Content stored in same Supabase Postgres database
- Frontend rendered with your own components/design system

**Key insight:** Payload is headless — it doesn't touch frontend styling. You build React components using your design system; Payload just provides the content data.

---

### 4. Auth architecture

**Decision: Two separate auth systems**

| Auth System | Who uses it | Purpose |
|-------------|-------------|---------|
| **Supabase Auth** | Parents + Camp Admins | App functionality |
| **Payload Auth** (future) | Cofounder + internal team | Edit marketing content |

These systems don't interact. Payload auth is purely internal/editorial.

**Supabase roles:**
```sql
create table profiles (
  id uuid references auth.users primary key,
  email text,
  roles text[] check (roles <@ ARRAY['parent', 'camp_admin']),
  -- Support multiple roles from day one
  organization_id uuid references organizations(id),
  created_at timestamp
);
```

**Why array of roles:** A coach might register their own kid for camps. Supporting `['parent', 'camp_admin']` from day one avoids painful retrofitting.

---

## Complete Route Structure

```
jointenpo.com/
├── MARKETING (hardcoded initially, Payload later)
│   ├── /                         [Public - home]
│   ├── /about                    [Public]
│   ├── /for-camps                [Public]
│   ├── /for-parents              [Public]
│   ├── /pricing                  [Public]
│   └── /blog/*                   [Public]
│
├── MARKETPLACE (Supabase data, public)
│   ├── /camps                    [Public - browse all camps]
│   ├── /camps/[id]               [Public - camp detail]
│   └── /camps/[id]/register      [Auth required - checkout]
│
├── PARENT DASHBOARD (role: parent)
│   ├── /dashboard                [Protected - parent home]
│   ├── /dashboard/bookings       [Protected - upcoming/past]
│   ├── /dashboard/children       [Protected - child profiles]
│   ├── /dashboard/payments       [Protected - payment history]
│   └── /dashboard/settings       [Protected - account]
│
├── CAMP ADMIN DASHBOARD (role: camp_admin)
│   ├── /organizer                [Protected - admin home]
│   ├── /organizer/camps          [Protected - manage listings]
│   ├── /organizer/camps/new      [Protected - create camp]
│   ├── /organizer/camps/[id]     [Protected - edit camp]
│   ├── /organizer/registrations  [Protected - all registrations]
│   ├── /organizer/sales          [Protected - revenue/analytics]
│   ├── /organizer/export         [Protected - export data]
│   ├── /organizer/notifications  [Protected - message parents]
│   └── /organizer/settings       [Protected - org settings]
│
├── AUTH
│   ├── /login                    [Public]
│   ├── /signup                   [Public]
│   ├── /signup/parent            [Public]
│   ├── /signup/camp              [Public]
│   └── /forgot-password          [Public]
│
└── CMS ADMIN (when Payload added)
    └── /admin                    [Payload auth - cofounder only]
```

---

## Who Controls What

| Person | Controls | Via |
|--------|----------|-----|
| **Developer** | All code, components, app logic, database schema | IDE + Supabase |
| **Cofounder** | Marketing content (when Payload added) | Payload Admin |
| **Parents** | Their profile, children, bookings | Parent Dashboard |
| **Camp Admins** | Their camps, registrations, notifications | Organizer Dashboard |

---

## Middleware for Route Protection

```ts
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Parent routes
  if (path.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', session.user.id)
      .single()
    if (!profile?.roles?.includes('parent')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Camp admin routes
  if (path.startsWith('/organizer')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', session.user.id)
      .single()
    if (!profile?.roles?.includes('camp_admin')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/organizer/:path*']
}
```

---

## Tradeoffs and Considerations

### Pros of this architecture

| Aspect | Benefit |
|--------|---------|
| Single codebase | One deployment, shared components, no cross-domain issues |
| Supabase with roles | Industry standard, single auth flow, clean separation |
| Deferred CMS | Less complexity now, add when actually needed |
| Unified app | Parents and organizers in same app, can evolve together |

### Cons and risks

| Concern | Mitigation |
|---------|------------|
| RLS complexity with roles | Map out every table + permissions before building |
| Stripe Connect complexity | Budget significant time; it's often underestimated |
| Dual-role users | Support array of roles from day one |
| CMS deferred | Cofounder can't self-edit marketing initially |

### Things that need careful attention

1. **RLS policies** — With roles, Row Level Security needs to handle:
   - Parents see only their bookings
   - Camp admins see only their organization's camps
   - Camp admins see registrations for their camps only
   - Cross-role data isolation

2. **Stripe Connect** — Full subsystem including:
   - Onboarding flow (identity verification)
   - Connected accounts management
   - Split payments (platform fee vs camp revenue)
   - Refunds across connected accounts
   - Payout schedules
   - Tax reporting (1099s)

3. **Multi-role users** — UI needs to handle switching contexts or showing combined view

---

## Future Considerations

### When to add Payload CMS

Add Payload when:
- Cofounder is actively doing content marketing
- Blog posts are happening weekly
- Landing page experiments are frequent
- SEO pages need regular updates

Payload integration:
- Installs into existing `/app` folder
- Uses same Supabase Postgres database
- Admin panel at `/admin`
- Cofounder edits content via form-based UI
- Content renders with your React components

### When to split organizer to subdomain

Consider `organizer.jointenpo.com` if:
- Organizer dashboard becomes significantly complex
- Different performance profiles needed
- Team wants independent deploy cycles

For now: stay unified, split later if needed.

---

## Implementation Phases

### Phase 1: MVP
- [ ] Hardcode marketing pages
- [ ] Supabase auth with roles (support multi-role)
- [ ] Parent flow: browse → register → dashboard
- [ ] Camp admin flow: signup → create camp → view registrations
- [ ] Stripe Connect (basic: onboarding + payouts)
- [ ] Ship it

### Phase 2: Post-launch (if needed)
- [ ] Add Payload for marketing/blog if content velocity justifies
- [ ] Build internal admin tools (user management, disputes)
- [ ] Expand organizer features (analytics, notifications, exports)
- [ ] Advanced Stripe features (coupons, subscriptions if applicable)

---

## Summary

| Decision | Choice |
|----------|--------|
| Domain strategy | Single domain (jointenpo.com) |
| Codebase | Monorepo, single Next.js app |
| Auth | Supabase with role array |
| CMS | Defer Payload, hardcode marketing initially |
| Parent accounts | Required, created at checkout |
| Organizer dashboard | Same app, `/organizer/*` routes |

This architecture is a standard, proven pattern for two-sided marketplaces. It prioritizes simplicity for MVP while allowing incremental complexity as the product grows.
