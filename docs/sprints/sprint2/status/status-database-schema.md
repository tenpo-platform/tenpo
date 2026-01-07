# Database Schema — Status Quo

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Create core schema migration | Not started |
| 2 | Implement RLS policies | Not started |
| 3 | Generate TypeScript types from schema | Not started |
| 4 | Seed DivineTime org + Luca admin | Not started |

## Related Docs

- [FRD: Database Schema](../frd/frd-01-database-schema.md) — Full spec with tables, RLS, functions, seed data

## Current State

**Supabase initialized:** Yes (`supabase/config.toml` exists)

**Migrations:** None — `supabase/migrations/` folder does not exist

**Seed file:** None — `supabase/seed.sql` referenced in config but not created

**TypeScript types:** None — `src/types/database.types.ts` does not exist

## Config Already Set

```
project_id = "Tenpo"
major_version = 17  (PostgreSQL)
password_requirements = "lower_upper_letters_digits_symbols"
minimum_password_length = 12
enable_confirmations = true
captcha = turnstile
seed sql_paths = ["./seed.sql"]
```

## Schema Overview (from FRD)

| Table | Purpose |
|-------|---------|
| `organizations` | Multi-tenant root (academies) |
| `profiles` | Users with roles (parent, org_admin, org_owner) |
| `camps` | Camp listings |
| `players` | Children profiles |
| `registrations` | Camp signups |
| `transactions` | Payment records |

## Implementation Plan

1. **Create migration file**
   - `supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql`
   - Tables, indexes, functions from FRD

2. **Add RLS policies**
   - Same migration file or separate `_rls_policies.sql`
   - Enable RLS on all tables

3. **Create seed file**
   - `supabase/seed.sql`
   - DivineTime org + Luca as org_owner

4. **Generate types**
   - Run `supabase gen types typescript --local > src/types/database.types.ts`

5. **Test locally**
   - `supabase db reset` to apply migrations + seed
   - Verify in Supabase Studio (localhost:54323)

## Dependencies

- None (this is foundational)

## Blocks

- Auth tasks (needs `profiles` table)
- Admin Dashboard (needs `camps`, `registrations` tables)
- Public Marketplace (needs `camps` table)
- Stripe Integration (needs `transactions` table)
