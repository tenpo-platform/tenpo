# Supabase Setup Guide

## Overview

This project uses Supabase as the backend (Postgres + Auth + Realtime + Storage + Edge Functions).

| Environment | Project | Region |
|-------------|---------|--------|
| Development | tenpo-dev | West US (North California) |
| Production | tenpo-prod | West US (North California) |

---

## Project Structure

```
supabase/
├── config.toml       # Local Supabase config
├── migrations/       # Database migrations
├── functions/        # Edge Functions
└── seed.sql          # Seed data (optional)

src/utils/supabase/
├── client.ts         # Browser client (client components)
├── server.ts         # Server client (server components, actions)
└── middleware.ts     # Session refresh helper
```

---

## Local Development

### Prerequisites
- Docker Desktop running
- Supabase CLI installed (`brew install supabase/tap/supabase`)

### Start Local Supabase

```bash
supabase start
```

This spins up a full local stack:
- Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321

### Stop Local Supabase

```bash
supabase stop
```

### Reset Local Database

```bash
supabase db reset
```

---

## Environment Variables

### Local Development (`.env.local`)

Uses tenpo-dev cloud project:

```
NEXT_PUBLIC_SUPABASE_URL=https://zqyjrsjjdmiapyablbzv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>
```

### Production (Vercel)

Set in Vercel dashboard using tenpo-prod credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://ifsjdiuheciwxuwrjsst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `supabase start` | Start local Supabase (requires Docker) |
| `supabase stop` | Stop local Supabase |
| `supabase db reset` | Reset local database and run migrations |
| `supabase db diff -f <name>` | Generate migration from schema changes |
| `supabase db push` | Push migrations to linked remote project |
| `supabase migration new <name>` | Create empty migration file |
| `supabase gen types typescript --local` | Generate TypeScript types from local DB |
| `supabase gen types typescript --linked` | Generate TypeScript types from linked remote |
| `supabase functions serve` | Run Edge Functions locally |
| `supabase functions deploy <name>` | Deploy Edge Function to remote |

---

## Usage in Code

### Client Components

```typescript
"use client";
import { createClient } from "@/utils/supabase/client";

export default function MyComponent() {
  const supabase = createClient();

  // Use supabase client...
}
```

### Server Components / Actions / Route Handlers

```typescript
import { createClient } from "@/utils/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();

  // Use supabase client...
}
```

### Get Current User (Server)

```typescript
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div>Hello {user.email}</div>;
}
```

---

## Database Migrations

### Create a Migration

1. Make schema changes in Supabase Studio (local or remote)
2. Generate migration:
   ```bash
   supabase db diff -f descriptive_name
   ```
3. Review the generated file in `supabase/migrations/`

### Apply Migrations

```bash
# To local
supabase db reset

# To remote (linked project)
supabase db push
```

---

## Linking Projects

The project is linked to `tenpo-dev` by default. To switch:

```bash
# Link to dev
supabase link --project-ref zqyjrsjjdmiapyablbzv

# Link to prod (be careful!)
supabase link --project-ref ifsjdiuheciwxuwrjsst
```

Check current link:
```bash
supabase projects list
```

---

## TypeScript Types

Generate types from your database schema:

```bash
# From linked remote project
supabase gen types typescript --linked > src/types/database.types.ts

# From local database
supabase gen types typescript --local > src/types/database.types.ts
```

Then use in code:

```typescript
import { Database } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient<Database>();
```

---

## Troubleshooting

### Docker not running
```
Error: Cannot connect to Docker daemon
```
Start Docker Desktop and try again.

### Port conflicts
```bash
supabase stop --no-backup
docker ps  # Check for conflicting containers
```

### Reset everything
```bash
supabase stop --no-backup
supabase start
```
