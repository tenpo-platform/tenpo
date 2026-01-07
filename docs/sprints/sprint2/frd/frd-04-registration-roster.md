# FRD 4: Registration Roster (Admin)

## Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /organizer/registrations | GET | org_admin, org_owner | Roster view |

## Components

### RegistrationRoster
```typescript
interface Registration {
  id: string;
  player: {
    full_name: string;
    date_of_birth: string;
  };
  parent: {
    full_name: string;
    email: string;
    phone: string;
  };
  camp: {
    id: string;
    title: string;
  };
  emergency_contact_name: string;
  emergency_contact_phone: string;
  status: string;
  created_at: string;
}

// Display
- Filter dropdown: All Camps / [Camp Title]
- Search input: Filter by player or parent name
- Table columns:
  - Player Name
  - Age (calculated from DOB)
  - Parent Name
  - Parent Email
  - Parent Phone
  - Camp (if showing all)
  - Status (badge)
  - Registered (date)

// Data fetching
SELECT
  r.*,
  p.full_name as player_name,
  p.date_of_birth as player_dob,
  pr.full_name as parent_name,
  pr.email as parent_email,
  pr.phone as parent_phone,
  c.title as camp_title
FROM registrations r
JOIN players p ON r.player_id = p.id
JOIN profiles pr ON r.parent_id = pr.id
JOIN camps c ON r.camp_id = c.id
WHERE c.organization_id = :org_id
ORDER BY r.created_at DESC;
```

### CampFilter
```typescript
// Dropdown populated with org's camps
// "All Camps" option
// On change, filter roster table
// Use URL params for persistence: /organizer/registrations?camp=uuid
```
