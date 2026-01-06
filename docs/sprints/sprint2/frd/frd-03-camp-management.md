# FRD 3: Camp Management (Admin)

## Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /organizer | GET | org_admin, org_owner | Dashboard home |
| /organizer/camps | GET | org_admin, org_owner | Camp list |
| /organizer/camps/new | GET | org_admin, org_owner | Create camp form |
| /organizer/camps/[id] | GET | org_admin, org_owner | Edit camp form |

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /api/camps | POST | org_admin, org_owner | Create camp |
| /api/camps/[id] | PUT | org_admin, org_owner | Update camp |
| /api/camps/[id] | DELETE | org_admin, org_owner | Delete camp (if no registrations) |

## Components

### CampList
```typescript
interface Camp {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'published' | 'cancelled';
  capacity: number;
  confirmed_count: number; // computed
}

// Display
- Table or card grid
- Columns: Title, Dates, Status (badge), Spots (sold/capacity), Actions
- "New Camp" button in header
- Click row → navigate to /organizer/camps/[id]

// Data fetching
SELECT
  c.*,
  COUNT(r.id) FILTER (WHERE r.status = 'confirmed') as confirmed_count
FROM camps c
LEFT JOIN registrations r ON r.camp_id = c.id
WHERE c.organization_id = :org_id
GROUP BY c.id
ORDER BY c.start_date DESC;
```

### CampForm
```typescript
interface CampFormProps {
  camp?: Camp; // undefined for create, populated for edit
}

// Fields
- title: string (required, max 200 chars)
- description: string (required, max 5000 chars)
- start_date: date (required)
- end_date: date (required, >= start_date)
- location: string (required, max 500 chars)
- capacity: number (required, > 0)
- price: number (required, >= 0, in dollars, converted to cents on save)
- status: 'draft' | 'published' (radio or toggle)

// Validation
- end_date >= start_date
- capacity > 0
- price >= 0

// Actions
- Save: POST/PUT to /api/camps
- Cancel: Navigate back to /organizer/camps
- Delete (edit only, if no registrations): DELETE to /api/camps/[id]
```

## Server Actions

```typescript
// src/app/organizer/camps/actions.ts

export async function createCamp(formData: FormData) {
  const supabase = createServerClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('No organization found');
  }

  const camp = {
    organization_id: profile.organization_id,
    title: formData.get('title'),
    description: formData.get('description'),
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    location: formData.get('location'),
    capacity: parseInt(formData.get('capacity')),
    price_cents: Math.round(parseFloat(formData.get('price')) * 100),
    status: formData.get('status') || 'draft',
  };

  const { data, error } = await supabase
    .from('camps')
    .insert(camp)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/organizer/camps');
  redirect('/organizer/camps');
}

export async function updateCamp(id: string, formData: FormData) {
  // Similar to create, but UPDATE with id
  // Verify camp belongs to user's org (RLS handles this)
}

export async function deleteCamp(id: string) {
  const supabase = createServerClient();

  // Check for registrations
  const { count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('camp_id', id);

  if (count > 0) {
    throw new Error('Cannot delete camp with registrations');
  }

  await supabase.from('camps').delete().eq('id', id);

  revalidatePath('/organizer/camps');
  redirect('/organizer/camps');
}
```
