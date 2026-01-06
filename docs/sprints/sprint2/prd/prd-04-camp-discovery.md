# PRD 4: Camp Discovery (Public)

## Overview
Parents can browse published camps without logging in. They can view details and begin registration.

## User Stories

**As a parent**, I want to browse available camps, so I can find one for my child.

**As a parent**, I want to see camp details before registering, so I can make an informed decision.

**As a parent**, I want to see how many spots are left, so I know if I need to act fast.

## Flows

### Browse Camps
```
1. User visits /camps
2. System shows grid/list of published camps:
   - Title
   - Dates
   - Location
   - Price
   - Spots remaining (capacity - confirmed registrations)
3. User clicks camp card → /camps/[id]
```

### View Camp Detail
```
1. User visits /camps/[id]
2. System shows:
   - Title
   - Full description
   - Dates
   - Location
   - Price (with 7% Tenpo markup shown as total)
   - Spots remaining
   - Organization name
   - "Register" CTA button
3. If sold out → CTA disabled, shows "Sold Out"
4. User clicks "Register" → /camps/[id]/register
```

## Behavior Rules

- Only published camps appear
- No auth required to browse or view details
- Price displayed to parent includes 7% markup (camp price × 1.07)
- Spots remaining = capacity - confirmed registrations
- Sold out camps still visible but not registerable
- Camp detail page is shareable (public URL)

## UI States

**Camp Card:**
- Default: Shows all info, clickable
- Sold out: Grayed badge, still clickable to view details

**Camp Detail:**
- Default: Full info + Register button
- Sold out: Full info + disabled "Sold Out" button
- Logged in as parent: Register button, streamlined flow
- Logged in as admin of this org: "Edit Camp" link visible

## Success Criteria

- [ ] Parent can browse all published camps without login
- [ ] Parent can view full camp details
- [ ] Price shown includes 7% markup
- [ ] Spots remaining is accurate
- [ ] Sold out camps show correct state
- [ ] Register CTA navigates to registration flow
