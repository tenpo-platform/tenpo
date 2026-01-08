# Backend Architecture: RPC Functions vs Edge Functions

**Status:** Decided
**Date:** 2026-01-08
**Context:** Sprint 2 - Authentication System
**Stakeholders:** Engineering

---

## Summary

When building privileged backend operations for Tenpo, we chose a **hybrid architecture of Supabase RPC functions + Next.js API routes** over Supabase Edge Functions. This decision optimizes for mobile compatibility, portability to GCP/AWS, and AI-assisted development velocity.

---

## Problem Statement

Tenpo uses Supabase with Row Level Security (RLS) to protect data. However, certain operations require elevated privileges that RLS blocks:

- **Academy signup**: Creating an academy, linking the user as owner, assigning the ACADEMY_ADMIN role
- **Role assignment**: Inserting into `user_roles` table
- **Team invitations**: Creating `academy_admins` records for invited users

These operations cannot run from the browser because:
- `academies` INSERT requires SUPER_ADMIN role
- `academy_admins` INSERT requires existing owner or SUPER_ADMIN
- `user_roles` has no INSERT policy for regular users

We needed an architecture for "privileged operations" that would scale with our roadmap.

---

## Constraints

| Constraint | Timeline | Impact |
|------------|----------|--------|
| Mobile app | 6 months | Backend must work from non-Next.js clients |
| More integrations | Ongoing | Stripe, Resend, SMS, analytics, CRM |
| GCP/AWS migration | 12 months | Avoid vendor lock-in, ensure portability |
| Small team | Now | Minimize infrastructure complexity |
| AI-assisted development | Now | Use patterns AI tools handle well |

---

## Options Considered

### Option 1: Supabase Edge Functions for Everything

Route all privileged operations through Edge Functions (Deno runtime).

**Flow:**
```
Browser/Mobile → Edge Function → Supabase DB
Browser/Mobile → Edge Function → External APIs (Stripe, Resend)
External Webhooks → Edge Function → Supabase DB
```

**Pros:**
- Consistent single pattern
- Decoupled from Next.js
- Supabase-native

**Cons:**
- Cold starts (200-500ms on first call)
- Deno runtime differs from Node.js
- Separate deployment process
- Requires rewrite for GCP/AWS migration (Deno → Node.js)
- Less AI training data for Deno patterns
- Additional infrastructure to manage

### Option 2: Next.js Server Actions for Everything

Use Next.js Server Actions with the Supabase service role key.

**Flow:**
```
Browser → Server Action → Supabase DB (service role)
Browser → Server Action → External APIs
```

**Pros:**
- Single codebase
- TypeScript/Node.js
- No additional infrastructure

**Cons:**
- Server Actions don't work from mobile apps
- Would require rewriting as API routes for mobile
- Couples business logic to Next.js
- Not portable without extraction

### Option 3: RPC Functions for DB, Next.js API Routes for Integrations (Chosen)

Split by what the operation needs:
- Database-only operations → Supabase RPC (SECURITY DEFINER)
- External API operations → Next.js API routes

**Flow:**
```
Browser/Mobile → Supabase RPC → Database (privileged, atomic)
Browser/Mobile → API Routes → External APIs (Stripe, Resend)
External Webhooks → API Routes → Database
```

**Pros:**
- RPC is fastest (runs in database, no cold start)
- RPC is atomic (automatic transactions)
- RPC works from any client (web, mobile, future services)
- RPC is portable (standard Postgres)
- API routes are Node.js (portable to Cloud Functions/Lambda)
- API routes work from any client (HTTP)
- Minimal infrastructure (just Next.js + Supabase)
- AI tools excel at TypeScript and SQL

**Cons:**
- Two patterns to learn
- Business logic split between SQL and TypeScript

### Option 4: Separate Backend Service

Build a standalone API service (Express/Fastify) from day one.

**Pros:**
- Maximum portability
- Clear separation
- Scales independently

**Cons:**
- Significant additional infrastructure
- Slower to build
- Overkill for current stage

---

## Decision

**We chose Option 3: RPC Functions + Next.js API Routes.**

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│           Clients (Web, Mobile, Future Services)                │
└─────────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌─────────────┐      ┌───────────────┐      ┌───────────────┐
│  Supabase   │      │ Supabase RPC  │      │  Next.js API  │
│    Auth     │      │   Functions   │      │    Routes     │
│             │      │               │      │               │
│ Login       │      │ DB-only ops   │      │ External APIs │
│ Signup      │      │ Atomic txns   │      │ File exports  │
│ Password    │      │ Fast (no hop) │      │ Webhooks      │
└─────────────┘      └───────────────┘      └───────────────┘
```

### Mental Model: When to Use What

| Operation Type | Use | Example |
|---------------|-----|---------|
| Authentication | Supabase Auth | Login, signup, password reset |
| DB-only, needs atomicity | RPC Function | Academy signup, role assignment, team invites |
| Calls external API | API Route | Stripe checkout, send email via Resend |
| Receives external webhook | API Route | Stripe payment confirmation |
| File generation | API Route | Excel export, PDF generation |
| File storage/download | Supabase Storage | Waiver documents, profile photos |
| Simple reads/writes | Direct Supabase client | Fetching events, updating profile |

---

## Rationale

### Why Not Edge Functions?

Edge Functions would work, but they add complexity without proportional benefit for our constraints:

1. **Mobile compatibility**: Both RPC and API routes work from mobile. Edge Functions don't provide additional benefit here.

2. **Portability**: RPC functions are standard Postgres—they work anywhere. API routes are Node.js—easily extracted to Cloud Functions or Lambda. Edge Functions are Deno—would require rewriting.

3. **Performance**: RPC functions run inside the database with zero cold start. Edge Functions have 200-500ms cold starts.

4. **AI assistance**: TypeScript/Node.js and SQL have far more training data than Deno. AI tools are more reliable with mainstream patterns.

5. **Infrastructure**: Edge Functions add a third component to manage. RPC + API routes use only what we already have.

### Why Not Server Actions?

Server Actions are convenient but create a dead end:

1. **Mobile incompatibility**: Server Actions are Next.js-specific. They cannot be called from mobile apps. We would need to rewrite them as API routes in 6 months.

2. **Lock-in**: Server Actions couple business logic to Next.js and Vercel. API routes are standard HTTP—portable to any platform.

Starting with API routes avoids throwaway work.

### Why RPC for Database Operations?

RPC functions with SECURITY DEFINER are ideal for multi-table database operations:

1. **Atomicity**: All operations in a single function run in one transaction. If any step fails, everything rolls back. No partial state.

2. **Performance**: RPC runs inside Postgres. No network hop, no cold start. Fastest possible execution.

3. **Security**: SECURITY DEFINER runs with the function owner's privileges, bypassing RLS. The function controls exactly what's allowed—no service key in application code.

4. **Portability**: RPC functions are standard Postgres. They work on any Postgres instance—Supabase, AWS RDS, Cloud SQL, self-hosted.

5. **Client agnostic**: Supabase SDKs (web, iOS, Android, Flutter) all support RPC. Same function works everywhere.

---

## Examples

### Example 1: Academy Signup

**What happens:** User fills out academy signup form. System creates auth user, updates profile, creates academy, links user as owner, assigns ACADEMY_ADMIN role.

**Why RPC:** This is 4 database operations that must succeed or fail together. If the academy is created but the owner link fails, we have orphaned data. RPC makes this atomic.

**Pattern:**
1. Browser calls `supabase.auth.signUp()` (creates auth user, triggers profile creation)
2. Browser calls RPC function `create_academy_for_user(name, email, phone)`
3. RPC function runs all DB operations in one transaction
4. Success or complete rollback

### Example 2: Stripe Checkout

**What happens:** User clicks "Register" on a camp. System creates Stripe checkout session, records pending payment.

**Why API Route:** We need to call the Stripe API, which RPC cannot do. We also want TypeScript for complex business logic (pricing calculations, promo codes).

**Pattern:**
1. Browser calls `/api/stripe/checkout` with registration details
2. API route validates input, calculates price
3. API route calls Stripe API to create checkout session
4. API route records pending registration in database
5. Returns checkout URL to browser

### Example 3: Excel Export

**What happens:** Academy admin clicks "Export Registrations" to download spreadsheet.

**Why API Route:** RPC cannot generate Excel files—that requires Node.js libraries. The API route queries data and uses a library to create the file.

**Pattern:**
1. Browser/mobile calls `/api/export/registrations?eventId=123`
2. API route queries registration data from Supabase
3. API route generates Excel file using exceljs library
4. Returns file as download

### Example 4: Stripe Webhook

**What happens:** Stripe sends payment confirmation to our system. We need to update registration status.

**Why API Route:** Webhooks are incoming HTTP requests from external services. They must hit an HTTP endpoint. The route verifies the webhook signature and updates the database.

**Pattern:**
1. Stripe sends POST to `/api/webhooks/stripe`
2. API route verifies signature using Stripe SDK
3. API route updates payment and registration status in database
4. Returns 200 OK

---

## Migration Path

### Month 6: Mobile App Launch

No backend changes required:
- Mobile uses Supabase SDK → Auth works
- Mobile uses Supabase SDK → RPC works
- Mobile uses HTTP → API routes work

### Month 12: GCP/AWS Migration

**Option A: Self-host Supabase**
- Deploy Supabase on GCP/AWS
- Everything works unchanged

**Option B: Managed Postgres + Cloud Functions**
- Copy RPC functions to new Postgres instance
- Extract API routes to Cloud Functions or Lambda
- Migrate auth to Firebase Auth or similar

Both options are straightforward because:
- RPC functions are portable Postgres
- API routes are portable Node.js

---

## Trade-offs Accepted

1. **Two patterns**: Developers need to know when to use RPC vs API routes. We accept this in exchange for using the right tool for each job.

2. **SQL for some logic**: Complex database operations live in SQL. This is acceptable because these operations are well-defined and unlikely to change frequently.

3. **Not "serverless edge"**: We're not running at the edge globally. For our use case (US-focused, database in one region), this doesn't matter.

---

## Revisit Triggers

Reconsider this decision if:

1. **Edge latency matters**: If we expand globally and need sub-100ms responses worldwide, Edge Functions or edge databases may be needed.

2. **Complex background jobs**: If we need long-running async tasks, we may need a job queue (which could run on Edge Functions or separate workers).

3. **Team grows significantly**: A larger team might benefit from a more structured backend service.

---

## Related Decisions

- [CMS Strategy](./cms-strategy-best-option.md)

---

## References

- [Supabase RPC Documentation](https://supabase.com/docs/guides/database/functions)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [SECURITY DEFINER in Postgres](https://www.postgresql.org/docs/current/sql-createfunction.html)
