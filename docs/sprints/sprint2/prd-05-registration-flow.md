# PRD 5: Registration Flow (Parent)

## Overview
Parents register their child for a camp. Account is created during this flow if not logged in. Flow collects parent info, player info, emergency contact, medical notes, and waiver acceptance.

## User Stories

**As a parent**, I want to register my child for a camp, so they can attend.

**As a parent**, I want to save my child's info, so I don't re-enter it for future camps.

**As a parent**, I want to provide emergency contact info, so the camp can reach someone if needed.

**As a returning parent**, I want to select a saved child profile, so registration is faster.

## Flows

### New Parent Registration
```
1. Parent clicks "Register" on camp detail (not logged in)
2. Step 1 - Parent Info:
   - Name, email, phone, password
   - "Already have an account? Log in"
3. Step 2 - Player Info:
   - Child's name, DOB
   - Medical notes / allergies (optional)
4. Step 3 - Emergency Contact:
   - Name, phone
5. Step 4 - Waiver:
   - Waiver text displayed
   - Checkbox: "I accept the waiver"
6. Step 5 - Payment:
   - Shows total (camp price + 7%)
   - "Pay Now" → Stripe Checkout (or placeholder button if Stripe not ready)
7. On success:
   - Account created
   - Player saved to parent's profile
   - Registration created (status: confirmed)
   - Redirect to /dashboard with success message
```

### Returning Parent Registration
```
1. Parent clicks "Register" on camp detail (logged in)
2. Step 1 - Select Player:
   - Dropdown of saved children
   - Or "Add new child"
3. Step 2 - Emergency Contact:
   - Pre-filled if saved, editable
4. Step 3 - Waiver:
   - Checkbox: "I accept the waiver"
5. Step 4 - Payment:
   - "Pay Now" → Stripe Checkout
6. On success:
   - Registration created
   - Redirect to /dashboard
```

## Behavior Rules

- Cannot register same player for same camp twice
- Cannot register if camp is sold out (blocked at start of flow)
- Capacity decremented only on confirmed payment
- Player is saved to parent's profile for future use
- Waiver must be accepted to proceed
- If Stripe fails, registration not created (atomic)
- If user abandons mid-flow, no partial data saved (except account if created)

## Edge Cases

- **Sold out during flow:** If camp sells out while parent is in flow, show error at payment step, do not charge
- **Duplicate registration:** If parent tries to register same child again, show error: "Already registered"
- **Session timeout:** If session expires mid-flow, redirect to login, preserve camp context in URL

## Success Criteria

- [ ] New parent can complete full registration flow
- [ ] Account is created during flow
- [ ] Player is saved to parent profile
- [ ] Returning parent can select saved child
- [ ] Emergency contact is captured
- [ ] Waiver acceptance is recorded with timestamp
- [ ] Capacity is enforced (no oversell)
- [ ] Duplicate registration is blocked
- [ ] On success, parent sees registration in dashboard
