# Sprint 2 Documentation

## PRD-to-FRD Mapping

| PRD | FRD | Notes |
|-----|-----|-------|
| PRD 1: Authentication System | FRD 2: Authentication | Direct match |
| PRD 2: Camp Management (Admin) | FRD 3: Camp Management | Direct match |
| PRD 3: Registration Roster (Admin) | FRD 4: Registration Roster | Direct match |
| PRD 4: Camp Discovery (Public) | FRD 5: Camp Discovery | Direct match |
| PRD 5: Registration Flow (Parent) | FRD 6: Registration Flow | Direct match |
| PRD 6: Parent Dashboard | FRD 7: Parent Dashboard | Direct match |
| PRD 7: Domain Consolidation | FRD 9: Domain Consolidation | Direct match |
| PRD 8: Stripe Integration (Stretch) | FRD 6: Registration Flow | Stripe implementation is embedded in Registration Flow FRD, specifically in Step5_Payment component and /api/checkout, /api/webhooks/stripe routes |
| PRD 9: Design System | FRD 8: Design System | Cross-platform token architecture for web + React Native |
| — | FRD 1: Database Schema | No PRD — technical infrastructure spec, not user-facing behavior |

## Implementation Note

When implementing Stripe (PRD 8), refer to FRD 6 sections: Step5_Payment component, POST /api/checkout, and POST /api/webhooks/stripe. Stripe is a stretch goal — the registration flow should work with a placeholder payment button if Stripe is not yet integrated.

## Files

### PRDs (Product Requirements)
- `prd-01-authentication.md` - User auth flows and requirements
- `prd-02-camp-management.md` - Admin camp CRUD
- `prd-03-registration-roster.md` - Admin view of registrations
- `prd-04-camp-discovery.md` - Public camp browsing
- `prd-05-registration-flow.md` - Parent registration process
- `prd-06-parent-dashboard.md` - Parent's view of registrations
- `prd-07-domain-consolidation.md` - DNS/domain migration
- `prd-08-stripe-integration.md` - Payment processing (stretch)
- `prd-09-design-system.md` - Cross-platform design system

### FRDs (Functional Requirements)
- `frd-01-database-schema.md` - Tables, RLS, indexes, functions
- `frd-02-authentication.md` - Routes, components, middleware
- `frd-03-camp-management.md` - Admin routes and server actions
- `frd-04-registration-roster.md` - Admin roster components
- `frd-05-camp-discovery.md` - Public camp pages
- `frd-06-registration-flow.md` - Multi-step registration + Stripe
- `frd-07-parent-dashboard.md` - Dashboard components
- `frd-08-design-system.md` - Cross-platform tokens, Style Dictionary, components, layouts
- `frd-09-domain-consolidation.md` - DNS configuration
