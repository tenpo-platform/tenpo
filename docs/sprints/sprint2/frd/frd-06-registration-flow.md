# FRD 6: Registration Flow (Parent)

## Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /camps/[id]/register | GET | Public* | Registration flow |

*Creates account during flow if not logged in

## Flow State Machine

```typescript
type RegistrationStep =
  | 'parent-info'    // Step 1: Create account (skip if logged in)
  | 'player-info'    // Step 2: Child info (or select existing)
  | 'emergency'      // Step 3: Emergency contact
  | 'waiver'         // Step 4: Accept waiver
  | 'payment';       // Step 5: Stripe checkout

interface RegistrationState {
  step: RegistrationStep;
  campId: string;
  parentId?: string;      // Set after login/signup
  playerId?: string;      // Set after player step
  emergencyContact?: {
    name: string;
    phone: string;
  };
  waiverAcceptedAt?: string;
}
```

## Components

### RegistrationFlow
```typescript
// Container component managing step state
// Persists state to sessionStorage for refresh recovery
// Shows progress indicator

interface RegistrationFlowProps {
  camp: Camp;
  user: User | null;
  existingPlayers: Player[]; // If logged in
}
```

### Step1_ParentInfo
```typescript
// Skip if user is logged in

// Fields
- full_name: string (required)
- email: string (required, email format)
- phone: string (required)
- password: string (required, 12+ chars with complexity)

// Actions
- "Already have an account?" → Modal/redirect to login with return URL
- Submit → Create auth user → Auto-login → Next step

// On submit
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name, phone, roles: ['parent'] },
    emailRedirectTo: `${origin}/camps/${campId}/register?step=player-info`
  }
});
```

### Step2_PlayerInfo
```typescript
// If user has existing players, show selector + "Add new"

// Fields (for new player)
- full_name: string (required)
- date_of_birth: date (required)
- medical_notes: string (optional, textarea)

// Validation
- DOB must be in the past
- Check for duplicate registration (same player + camp)

// On submit
- If new player: Insert into players table
- Set playerId in state
- Next step
```

### Step3_EmergencyContact
```typescript
// Pre-fill if user has registered before (query past registrations)

// Fields
- emergency_contact_name: string (required)
- emergency_contact_phone: string (required)

// On submit
- Save to state
- Next step
```

### Step4_Waiver
```typescript
// Display waiver text (can be hardcoded for Sprint 2)
// Checkbox required

// Fields
- waiver_accepted: boolean (required, must be true)

// Waiver text
const WAIVER_TEXT = `
I acknowledge that participation in sports activities involves inherent risks...
[Standard liability waiver content]
`;

// On submit
- Record timestamp
- Next step
```

### Step5_Payment
```typescript
// Display summary
// Create Stripe checkout session
// Redirect to Stripe

// Display
- Camp: [title]
- Player: [name]
- Price breakdown:
  - Camp fee: $100.00
  - Service fee: $7.00
  - Total: $107.00

// On "Pay Now"
1. Create registration (status: 'pending')
2. Create Stripe Checkout session via /api/checkout
3. Redirect to Stripe

// If Stripe not ready (stretch goal)
- Show placeholder: "Payment integration coming soon"
- Create registration as 'pending'
- Redirect to dashboard with message
```

## API Routes

### POST /api/checkout
```typescript
// Create Stripe Checkout session

interface CheckoutRequest {
  registrationId: string;
  campId: string;
}

export async function POST(request: Request) {
  const { registrationId, campId } = await request.json();

  // Get camp and org
  const { data: camp } = await supabase
    .from('camps')
    .select('*, organization:organizations(*)')
    .eq('id', campId)
    .single();

  // Calculate amounts
  const campPrice = camp.price_cents;
  const totalPrice = Math.round(campPrice * 1.07); // 7% markup
  const platformFee = totalPrice - campPrice; // Tenpo keeps the markup

  // Create Stripe session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: camp.title,
          description: `${camp.start_date} - ${camp.end_date}`,
        },
        unit_amount: totalPrice,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: camp.organization.stripe_account_id,
      },
    },
    metadata: {
      registration_id: registrationId,
      camp_id: campId,
    },
    success_url: `${origin}/dashboard?registration=success`,
    cancel_url: `${origin}/camps/${campId}/register?step=payment&cancelled=true`,
  });

  return Response.json({ url: session.url });
}
```

### POST /api/webhooks/stripe
```typescript
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const registrationId = session.metadata.registration_id;

      // Update registration status
      await supabase
        .from('registrations')
        .update({ status: 'confirmed' })
        .eq('id', registrationId);

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          registration_id: registrationId,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent,
          amount_cents: session.amount_total,
          platform_fee_cents: session.application_fee_amount,
          status: 'succeeded',
        });

      // Send confirmation email
      await sendConfirmationEmail(registrationId);

      break;
    }
  }

  return Response.json({ received: true });
}
```
