# FRD 7: Parent Dashboard

## Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /dashboard | GET | parent | Dashboard home |
| /dashboard/children | GET | parent | Manage children |
| /dashboard/children/[id] | GET | parent | Edit child |

## Components

### ParentDashboard
```typescript
// Main dashboard view

// Sections
1. Upcoming Registrations
2. Past Registrations
3. Quick links: "Browse Camps", "Manage Children"

// Data fetching
SELECT
  r.*,
  p.full_name as player_name,
  c.title as camp_title,
  c.start_date,
  c.end_date,
  c.location,
  t.status as payment_status
FROM registrations r
JOIN players p ON r.player_id = p.id
JOIN camps c ON r.camp_id = c.id
LEFT JOIN transactions t ON t.registration_id = r.id
WHERE r.parent_id = auth.uid()
ORDER BY c.start_date;
```

### RegistrationCard
```typescript
interface RegistrationCardProps {
  registration: {
    id: string;
    player_name: string;
    camp_title: string;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
    payment_status: string;
  };
}

// Display
- Camp title
- Player name
- Dates
- Location
- Status badge (confirmed, pending, cancelled)
```

### ChildrenList
```typescript
// List of parent's children

// Display
- Cards/list with name, age, medical notes preview
- "Add Child" button
- Click → edit form

// Data
SELECT * FROM players WHERE parent_id = auth.uid();
```

### ChildForm
```typescript
// Create/edit child

// Fields
- full_name: string (required)
- date_of_birth: date (required)
- medical_notes: string (optional)

// Actions
- Save: Insert/update players table
- Delete: Only if no registrations (or soft delete)
```
