# PRD 2: Camp Management (Admin)

## Overview
Org admins can create, edit, and manage camp listings. Camps can be saved as drafts or published for parents to see.

## User Stories

**As an org admin**, I want to create a camp listing, so parents can discover and register for it.

**As an org admin**, I want to save a camp as draft, so I can finish it later before publishing.

**As an org admin**, I want to edit a published camp, so I can fix mistakes or update details.

**As an org admin**, I want to see all my camps in one place, so I can manage my offerings.

## Flows

### Create Camp
```
1. Admin clicks "New Camp" on /organizer/camps
2. Form loads with fields:
   - Title (required)
   - Description (required)
   - Start date (required)
   - End date (required)
   - Location (required, text)
   - Capacity (required, number)
   - Price (required, number in dollars)
3. Admin clicks "Save as Draft" or "Publish"
4. System creates camp record with status
5. Redirect to /organizer/camps with success message
```

### Edit Camp
```
1. Admin clicks camp row on /organizer/camps
2. Form loads with existing values
3. Admin modifies fields
4. Admin clicks "Save" or "Publish" or "Unpublish"
5. System updates camp record
6. Redirect to /organizer/camps with success message
```

### View Camp List
```
1. Admin visits /organizer/camps
2. System shows table/grid:
   - Camp title
   - Dates
   - Status badge (draft/published)
   - Spots: sold / capacity
3. Admin can click row to edit
4. Admin can click "New Camp" to create
```

## Behavior Rules

- Only org_admin or org_owner can access /organizer/*
- Admin can only see/edit camps belonging to their organization
- Published camps appear on /camps for parents
- Draft camps are hidden from public
- End date must be >= start date
- Capacity must be > 0
- Price can be 0 (free camps allowed)
- Deleting a camp with registrations is blocked (must cancel first)

## Success Criteria

- [ ] Admin can create a new camp with all required fields
- [ ] Admin can save camp as draft (not visible to public)
- [ ] Admin can publish camp (visible on /camps)
- [ ] Admin can edit existing camp
- [ ] Admin can unpublish a camp
- [ ] Camp list shows accurate sold/remaining counts
- [ ] RLS prevents access to other orgs' camps
