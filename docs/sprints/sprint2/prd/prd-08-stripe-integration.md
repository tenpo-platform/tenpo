# PRD 8: Stripe Integration (Stretch)

## Overview
Parents pay for camp registration via Stripe Checkout. Payments are split between the academy (via Connect) and Tenpo (7% platform fee).

## User Stories

**As a parent**, I want to pay securely online, so my child's spot is confirmed.

**As an org admin**, I want to receive payouts for registrations, so I get paid.

**As Tenpo**, we want to collect a 7% fee on each transaction.

## Flows

### Payment Flow
```
1. Parent completes registration form, clicks "Pay Now"
2. System creates Stripe Checkout session:
   - Line item: Camp name, total price (camp × 1.07)
   - Connected account: org's stripe_account_id
   - Application fee: 7% of camp price
3. Parent redirected to Stripe Checkout
4. Parent completes payment
5. Stripe sends webhook: checkout.session.completed
6. System:
   - Creates registration (status: confirmed)
   - Creates transaction record
   - Decrements available capacity
   - Sends confirmation email via Resend
7. Parent redirected to /dashboard with success
```

### Webhook Handling
```
Events to handle:
- checkout.session.completed → Create registration + transaction
- charge.refunded → Update registration + transaction status (future)
```

## Pricing Logic

| Component | Calculation |
|-----------|-------------|
| Camp price (set by org) | $100 |
| Parent pays | $107 (camp × 1.07) |
| Stripe processing | ~$3.40 (2.9% + $0.30 of $107) |
| Tenpo fee | $7 (7% of camp price) |
| Org receives | ~$96.60 ($107 - $3.40 - $7) |

*Note: Stripe fees come off the top. Tenpo fee is fixed 7% of camp price.*

## Behavior Rules

- No payment = no registration (atomic)
- Capacity only decremented on successful payment
- Checkout session expires after 30 minutes
- Failed payments do not create registrations
- Refunds handled manually in Sprint 2 (Stripe Dashboard)

## Success Criteria

- [ ] Parent can complete payment via Stripe Checkout
- [ ] Org's connected account receives payout
- [ ] Tenpo receives 7% application fee
- [ ] Registration created only on successful payment
- [ ] Confirmation email sent on success
- [ ] Webhook handles checkout.session.completed reliably
