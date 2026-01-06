# FRD 5: Camp Discovery (Public)

## Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /camps | GET | Public | Browse camps |
| /camps/[id] | GET | Public | Camp detail |

## Components

### CampGrid
```typescript
interface CampCard {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  price_cents: number;
  capacity: number;
  spots_remaining: number;
  organization: {
    name: string;
    slug: string;
  };
}

// Display
- Grid of cards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Each card shows:
  - Title
  - Org name
  - Dates (formatted: "Jan 10-14, 2026")
  - Location
  - Price (formatted with markup: "$107")
  - Spots remaining badge
- Click card → /camps/[id]

// Data fetching (public, no auth)
SELECT
  c.*,
  o.name as org_name,
  o.slug as org_slug,
  c.capacity - COUNT(r.id) FILTER (WHERE r.status = 'confirmed') as spots_remaining
FROM camps c
JOIN organizations o ON c.organization_id = o.id
LEFT JOIN registrations r ON r.camp_id = c.id
WHERE c.status = 'published'
  AND c.start_date >= CURRENT_DATE
GROUP BY c.id, o.id
ORDER BY c.start_date ASC;
```

### CampDetail
```typescript
interface CampDetailProps {
  camp: Camp & {
    organization: Organization;
    spots_remaining: number;
  };
  isLoggedIn: boolean;
  isParent: boolean;
  isOrgAdmin: boolean; // admin of THIS org
}

// Display
- Hero: Title, Org name
- Details section:
  - Description (full)
  - Dates
  - Location
  - Price (with markup): "Total: $107" (show breakdown on hover/tooltip?)
  - Spots remaining: "12 spots left" or "Sold Out"
- CTA section:
  - If sold out: Disabled "Sold Out" button
  - If available: "Register Now" button → /camps/[id]/register

// Conditional UI
- If isOrgAdmin: Show "Edit Camp" link
- If isLoggedIn && isParent: Streamlined CTA text

// Price display logic
const displayPrice = (priceCents: number) => {
  const withMarkup = Math.round(priceCents * 1.07);
  return `${(withMarkup / 100).toFixed(2)}`;
};
```
