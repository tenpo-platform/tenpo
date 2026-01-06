# PRD 3: Registration Roster (Admin)

## Overview
Org admins can view all registrations for their camps, including parent and player details.

## User Stories

**As an org admin**, I want to see who registered for each camp, so I can prepare for the event.

**As an org admin**, I want to see parent contact info, so I can reach them if needed.

**As an org admin**, I want to filter registrations by camp, so I can focus on one event at a time.

## Flows

### View Roster
```
1. Admin visits /organizer/registrations
2. System shows table:
   - Player name
   - Player DOB/age
   - Parent name
   - Parent email
   - Parent phone
   - Camp name
   - Registration date
   - Payment status
3. Admin can filter by camp (dropdown)
4. Admin can search by player or parent name
```

## Behavior Rules

- Only shows registrations for admin's organization
- Defaults to showing all camps (combined roster)
- Filter persists during session
- Payment status reflects transaction status (pending/confirmed/refunded)
- Sorted by registration date (newest first) by default

## Success Criteria

- [ ] Admin can view all registrations for their org
- [ ] Table shows player, parent, camp, and status info
- [ ] Admin can filter by specific camp
- [ ] RLS prevents access to other orgs' registrations
