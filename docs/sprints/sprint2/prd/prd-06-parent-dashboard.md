# PRD 6: Parent Dashboard

## Overview
Parents can view their upcoming and past registrations, and manage their saved children profiles.

## User Stories

**As a parent**, I want to see my upcoming camp registrations, so I know what's coming.

**As a parent**, I want to see my past registrations, so I have a record.

**As a parent**, I want to manage my children's profiles, so I can update info or add new children.

## Flows

### View Dashboard
```
1. Parent visits /dashboard (must be logged in)
2. System shows:
   - Upcoming registrations (camps with start_date >= today)
   - Past registrations (camps with end_date < today)
   - Saved children list
```

### View Registration Detail
```
1. Parent clicks registration row
2. Shows:
   - Camp name, dates, location
   - Player name
   - Emergency contact on file
   - Payment status
   - (No edit/cancel in Sprint 2 — manual process)
```

### Manage Children
```
1. Parent clicks "Children" or sees list on dashboard
2. Can click child to edit: name, DOB, medical notes
3. Can click "Add Child" to create new player profile
```

## Behavior Rules

- Only shows registrations for logged-in parent
- Registrations sorted by camp start date
- Children belong to parent only (RLS enforced)
- Editing child info does not affect past registrations

## Success Criteria

- [ ] Parent can view upcoming registrations
- [ ] Parent can view past registrations
- [ ] Parent can see and edit saved children
- [ ] Parent can add new child profile
- [ ] RLS prevents seeing other parents' data
