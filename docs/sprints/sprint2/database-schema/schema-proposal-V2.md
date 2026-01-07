# Tenpo Database Schema Proposal

This document defines the database schema for Tenpo based on the scoping questions. It prioritizes a **simple, solid foundation** for the MVP (Events-only, Bay Area) while designing for future extensibility.

> **Version 2.0** — Incorporates all changes from Codex Review Round 1 and Round 2.

---

## 1. Feature-to-Table Mapping

| Feature | Tables Required | MVP? |
|---------|-----------------|------|
| User Authentication | `profiles` (extends Supabase auth.users) | Yes |
| Multi-Role Support | `user_roles` | Yes |
| Parent Accounts | `profiles` with PARENT role | Yes |
| Athlete Profiles | `athletes`, `athlete_guardians`, `athlete_medical` | Yes |
| Coach Profiles | `coaches`, `coach_specialties`, `coach_sports` | Yes |
| Academy Management | `academies`, `academy_coaches`, `academy_admins` | Yes |
| Invitations | `invites` | Yes |
| Locations | `locations` | Yes |
| Events (Camps/Clinics) | `events`, `event_days`, `event_tickets`, `event_registrations` | Yes |
| Event Staffing | `event_staff` | Yes |
| Promo Codes | `promo_codes`, `promo_code_uses` | Yes |
| Payments | `payments` | Yes |
| Refunds | `refunds` | Yes |
| Reviews | `reviews` | Yes |
| Notifications | `notifications`, `notification_preferences` | Yes |
| Calendar Sync | `calendar_integrations` | Yes |
| Analytics | `daily_analytics`, `monthly_analytics` | Yes |
| Waivers | `waivers`, `event_waivers`, `waiver_signatures` | Yes |
| Sports/Specialties | `sports`, `specialties` | Yes |
| Individual Sessions | `sessions`, `session_participants`, `availability` | No (Future) |
| Bulk Packages | `packages`, `package_purchases` | No (Future) |
| Messaging | `conversations`, `messages` | No (Future) |

---

## 2. ENUM Types

All status fields use Postgres ENUM types for type safety.

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('PARENT', 'ATHLETE', 'COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN', 'STAFF');

-- Event lifecycle
CREATE TYPE event_status AS ENUM ('draft', 'published', 'canceled', 'completed');

-- Registration lifecycle
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'canceled', 'refunded', 'completed');

-- Payment lifecycle (aligned with Stripe)
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- Refund workflow
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Approval workflow for coaches/academies
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Location visibility
CREATE TYPE location_visibility AS ENUM ('public', 'private');

-- Payment source (for free events)
CREATE TYPE payment_source AS ENUM ('stripe', 'free', 'comp');
```

---

## 3. Table Descriptions

### 3.1 Core Identity Tables

#### `profiles`
**Purpose**: Extends Supabase `auth.users` with application-specific profile data. All users have a profile.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK, references auth.users(id) |
| first_name | text | Yes | Display name |
| last_name | text | Yes | Display name |
| phone_number | text | Yes | Required for booking; used for SMS later |
| avatar_url | text | Yes | Primary profile photo |
| timezone | text | Yes | User's preferred timezone |
| onboarding_completed | boolean | No | Default false |
| deleted_at | timestamptz | Yes | NULL = active; soft delete |
| created_at | timestamptz | No | Default now() |
| updated_at | timestamptz | No | Auto-updated via trigger |

**Note**: Email removed — use `auth.users.email` via admin-only RPC for search.

---

#### `user_roles`
**Purpose**: Join table enabling multi-role support.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| user_id | uuid | No | FK → profiles(id) |
| role | user_role | No | ENUM type |
| is_primary | boolean | No | Default false; user's main role for UI |
| granted_at | timestamptz | No | When role was assigned |
| granted_by | uuid | Yes | FK → profiles(id) |

**Unique Constraint**: `(user_id, role)`

---

### 3.2 Athlete Tables

#### `athletes`
**Purpose**: Profile for anyone receiving training. PII/medical data stored separately in `athlete_medical`.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| user_id | uuid | Yes | FK → profiles(id); NULL in MVP (parent-managed) |
| first_name | text | No | Athlete's name |
| last_name | text | No | |
| birthdate | date | No | Used for age group filtering |
| skill_level | text | Yes | BEGINNER, INTERMEDIATE, ADVANCED |
| team | text | Yes | Current team/club name |
| deleted_at | timestamptz | Yes | NULL = active |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Note**: `allergies`, `medical_conditions`, `emergency_contact` moved to `athlete_medical` table.

---

#### `athlete_medical`
**Purpose**: Sensitive PII/medical data with strict RLS. Separate from general athlete profile.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| athlete_id | uuid | No | FK → athletes(id) |
| allergies | text[] | Yes | Array of known allergens |
| medical_conditions | jsonb | Yes | {asthma: bool, other: string} |
| emergency_contact | jsonb | No | {first_name, last_name, phone, relationship} |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Unique Constraint**: `(athlete_id)` — one medical record per athlete

**RLS**: Guardians via `athlete_guardians` + event coaches/staff only for registered events within date scope.

---

#### `athlete_guardians`
**Purpose**: Links athletes to their guardians (parents). Many-to-many.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| athlete_id | uuid | No | FK → athletes(id) |
| guardian_id | uuid | No | FK → profiles(id); must have PARENT role |
| relationship | text | Yes | 'mother', 'father', 'guardian', etc. |
| is_primary | boolean | No | Default false; primary contact |
| can_book | boolean | No | Default true |
| created_at | timestamptz | No | |

---

### 3.3 Coach & Academy Tables

#### `coaches`
**Purpose**: Extended profile for users providing training services.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| user_id | uuid | No | FK → profiles(id); must have COACH role |
| bio | text | Yes | Professional biography |
| experience_years | integer | Yes | Years of coaching experience |
| coaching_style | text | Yes | Description of approach |
| photos | text[] | Yes | Array of profile photo URLs |
| video_intro_url | text | Yes | Introduction video |
| price_per_hour | integer | Yes | Hourly rate in cents (future) |
| session_duration_minutes | integer | Yes | Default session length |
| cancellation_hours | integer | No | Default 24 |
| travel_willing | boolean | No | Default false |
| virtual_available | boolean | No | Default false |
| languages | text[] | Yes | Languages spoken |
| certifications | jsonb | Yes | Array of {name, issuer, year} |
| stripe_account_id | text | Yes | Stripe Connect account |
| stripe_onboarding_complete | boolean | No | Default false |
| is_verified | boolean | No | Default false; admin-verified badge |
| approval_status | approval_status | No | Default 'pending' |
| approved_by | uuid | Yes | FK → profiles(id) |
| approved_at | timestamptz | Yes | |
| rejected_by | uuid | Yes | FK → profiles(id) |
| rejected_at | timestamptz | Yes | |
| review_notes | text | Yes | Admin notes on approval/rejection |
| deleted_at | timestamptz | Yes | NULL = active |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Note**: `is_approved` boolean replaced by `approval_status` ENUM with full audit trail.

---

#### `coach_sports`
**Purpose**: Direct link between coaches and sports (without requiring specialties).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| coach_id | uuid | No | FK → coaches(id) |
| sport_id | uuid | No | FK → sports(id) |
| created_at | timestamptz | No | |

**Composite PK**: `(coach_id, sport_id)`

---

#### `coach_specialties`
**Purpose**: Many-to-many linking coaches to their specializations.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| coach_id | uuid | No | FK → coaches(id) |
| specialty_id | uuid | No | FK → specialties(id) |

**Composite PK**: `(coach_id, specialty_id)`

---

#### `academies`
**Purpose**: Represents a business/club that organizes events.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| name | text | No | Academy name |
| slug | text | No | URL-friendly identifier |
| description | text | Yes | About the academy |
| logo_url | text | Yes | Logo image |
| cover_image_url | text | Yes | Banner image |
| website | text | Yes | External website |
| email | text | Yes | Contact email |
| phone | text | Yes | Contact phone |
| stripe_account_id | text | Yes | Stripe Connect |
| stripe_onboarding_complete | boolean | No | Default false |
| is_verified | boolean | No | Default false; admin-verified badge |
| approval_status | approval_status | No | Default 'pending' |
| approved_by | uuid | Yes | FK → profiles(id) |
| approved_at | timestamptz | Yes | |
| rejected_by | uuid | Yes | FK → profiles(id) |
| rejected_at | timestamptz | Yes | |
| review_notes | text | Yes | Admin notes |
| deleted_at | timestamptz | Yes | NULL = active |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Unique Constraint**: `slug WHERE deleted_at IS NULL` (partial unique index)

---

#### `academy_admins`
**Purpose**: Links users with ACADEMY_ADMIN role to academies.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| academy_id | uuid | No | FK → academies(id) |
| user_id | uuid | No | FK → profiles(id) |
| role | text | No | 'owner', 'admin', 'manager' |
| created_at | timestamptz | No | |

**Unique Constraint**: `(academy_id, user_id)`

---

#### `academy_coaches`
**Purpose**: Many-to-many linking coaches to academies.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| academy_id | uuid | No | FK → academies(id) |
| coach_id | uuid | No | FK → coaches(id) |
| status | text | No | 'active', 'invited', 'inactive' |
| invited_at | timestamptz | Yes | |
| joined_at | timestamptz | Yes | |
| created_at | timestamptz | No | |

**Unique Constraint**: `(academy_id, coach_id)`

---

#### `invites`
**Purpose**: Tracks invitation tokens for coach/academy onboarding.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| type | text | No | 'coach', 'academy_admin' |
| token | text | No | Unique invite token |
| email | text | No | Invited email address |
| invited_by | uuid | No | FK → profiles(id) |
| academy_id | uuid | Yes | FK → academies(id); for coach invites |
| expires_at | timestamptz | No | Token expiration |
| accepted_at | timestamptz | Yes | When invite was accepted |
| created_at | timestamptz | No | |

**Unique Constraint**: `token`

---

### 3.4 Sports & Specialties

#### `sports`
**Purpose**: Lookup table for sports/disciplines.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| name | text | No | e.g., "Soccer" |
| slug | text | No | URL-friendly identifier |
| icon_url | text | Yes | Sport icon |
| is_active | boolean | No | Default true |
| deleted_at | timestamptz | Yes | |
| created_at | timestamptz | No | |

**Unique Constraint**: `slug WHERE deleted_at IS NULL`

---

#### `specialties`
**Purpose**: Coaching specializations within a sport.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| sport_id | uuid | No | FK → sports(id) |
| name | text | No | e.g., "Goalkeeping" |
| slug | text | No | |
| deleted_at | timestamptz | Yes | |
| created_at | timestamptz | No | |

**Unique Constraint**: `slug WHERE deleted_at IS NULL`

---

### 3.5 Location Tables

#### `locations`
**Purpose**: Physical venues for events.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| name | text | No | Location name |
| address_line1 | text | Yes | Street address |
| address_line2 | text | Yes | Unit, suite, etc. |
| city | text | Yes | |
| state | text | Yes | |
| postal_code | text | Yes | |
| country | text | Yes | Default 'US' |
| latitude | decimal(10,8) | Yes | GPS |
| longitude | decimal(11,8) | Yes | |
| facility_type | text | Yes | 'field', 'gym', 'court', 'pool', 'other' |
| is_indoor | boolean | Yes | NULL = both/unknown |
| capacity | integer | Yes | Max participants (venue fire code) |
| amenities | text[] | Yes | ['parking', 'restrooms', etc.] |
| photos | text[] | Yes | Array of photo URLs |
| timezone | text | Yes | IANA timezone |
| visibility | location_visibility | No | Default 'public' |
| created_by | uuid | Yes | FK → profiles(id) |
| deleted_at | timestamptz | Yes | NULL = active |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**RLS**: SELECT public locations OR locations you created; UPDATE/DELETE only creator.

---

### 3.6 Event Tables

#### `events`
**Purpose**: Camps and clinics organized by academies.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| academy_id | uuid | No | FK → academies(id) |
| sport_id | uuid | No | FK → sports(id) |
| location_id | uuid | Yes | FK → locations(id); NULL if virtual |
| title | text | No | Event name |
| slug | text | No | URL-friendly, unique per academy |
| description | text | Yes | Full description (markdown) |
| event_type | text | No | 'CAMP' or 'CLINIC' |
| image_url | text | Yes | Cover image |
| min_age | integer | Yes | Minimum participant age |
| max_age | integer | Yes | Maximum participant age |
| skill_levels | text[] | Yes | ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] |
| is_virtual | boolean | No | Default false |
| timezone | text | No | Copied from location at creation |
| registration_opens_at | timestamptz | Yes | |
| registration_closes_at | timestamptz | Yes | |
| cancellation_policy_hours | integer | No | Default 48 |
| status | event_status | No | ENUM |
| created_by | uuid | Yes | FK → profiles(id) |
| deleted_at | timestamptz | Yes | NULL = active |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Note**: `max_capacity` removed — ticket tier capacities are source of truth. Venue cap on `locations.capacity`.

**Unique Constraint**: `(academy_id, slug) WHERE deleted_at IS NULL`

---

#### `event_days`
**Purpose**: Individual days within an event.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| event_id | uuid | No | FK → events(id) |
| date | date | No | The specific date |
| start_time | time | No | Start time (interpreted with events.timezone) |
| end_time | time | No | End time |
| notes | text | Yes | Day-specific notes |
| created_at | timestamptz | No | |

---

#### `event_tickets`
**Purpose**: Ticket tiers for an event.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| event_id | uuid | No | FK → events(id) |
| name | text | No | Ticket type name |
| description | text | Yes | What's included |
| price | integer | No | Price in cents |
| capacity | integer | Yes | NULL = unlimited for this tier |
| quantity_sold | integer | No | Default 0; use atomic update RPC |
| min_age | integer | Yes | |
| max_age | integer | Yes | |
| sales_start_at | timestamptz | Yes | |
| sales_end_at | timestamptz | Yes | |
| deleted_at | timestamptz | Yes | |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

---

#### `event_registrations`
**Purpose**: Records an athlete's registration for an event.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| event_id | uuid | No | FK → events(id) |
| event_ticket_id | uuid | No | FK → event_tickets(id) |
| athlete_id | uuid | No | FK → athletes(id) |
| registered_by | uuid | No | FK → profiles(id); parent or self |
| payment_id | uuid | Yes | FK → payments(id) |
| status | registration_status | No | ENUM |
| price_paid_cents | integer | No | Total amount charged |
| ticket_price_cents | integer | No | Original ticket price snapshot |
| discount_cents | integer | No | Default 0 |
| fees_cents | integer | No | Default 0; platform fee |
| currency | text | No | Default 'usd' |
| promo_code_id | uuid | Yes | FK → promo_codes(id) |
| notes | text | Yes | Special requests |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Note**: `waiver_signed` boolean removed — compute from `waiver_signatures` table.

**Unique Constraint**: `(event_id, athlete_id)`
**Partial Unique**: `(payment_id) WHERE payment_id IS NOT NULL`

---

#### `event_staff`
**Purpose**: Coaches assigned to work an event.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| event_id | uuid | No | FK → events(id) |
| coach_id | uuid | Yes | FK → coaches(id); NULL if external |
| external_name | text | Yes | Name if not a platform coach |
| external_email | text | Yes | Contact if external |
| role | text | Yes | 'lead', 'assistant', 'volunteer' |
| status | text | No | 'invited', 'confirmed', 'declined' |
| created_at | timestamptz | No | |

---

### 3.7 Promo Codes

#### `promo_codes`
**Purpose**: Discount codes for events.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| code | text | No | The code users enter (uppercase) |
| academy_id | uuid | Yes | FK → academies(id); NULL = platform-wide |
| event_id | uuid | Yes | FK → events(id); NULL = all academy events |
| discount_type | text | No | 'percentage' or 'fixed' |
| discount_value | integer | No | Percentage (10 = 10%) or cents |
| max_uses | integer | Yes | NULL = unlimited |
| times_used | integer | No | Default 0 |
| valid_from | timestamptz | Yes | |
| valid_until | timestamptz | Yes | |
| is_active | boolean | No | Default true |
| created_by | uuid | Yes | FK → profiles(id) |
| created_at | timestamptz | No | |

**Unique Constraint**: `code` (case-insensitive)

---

#### `promo_code_uses`
**Purpose**: Tracks individual uses of promo codes.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| promo_code_id | uuid | No | FK → promo_codes(id) |
| user_id | uuid | No | FK → profiles(id) |
| registration_id | uuid | No | FK → event_registrations(id) |
| discount_applied | integer | No | Actual discount in cents |
| created_at | timestamptz | No | |

---

### 3.8 Payment Tables

#### `payments`
**Purpose**: Records all payments made on the platform.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| user_id | uuid | No | FK → profiles(id); who paid |
| academy_id | uuid | Yes | FK → academies(id); recipient |
| event_id | uuid | Yes | FK → events(id) |
| payment_source | payment_source | No | Default 'stripe' |
| stripe_payment_intent_id | text | Yes | Stripe reference; NULL for free/comp |
| stripe_customer_id | text | Yes | Stripe customer |
| amount | integer | No | Total in cents |
| platform_fee | integer | No | Tenpo's cut in cents |
| currency | text | No | Default 'usd' |
| status | payment_status | No | ENUM |
| payment_method | text | Yes | 'card', 'bank', etc. |
| receipt_email | text | Yes | |
| metadata | jsonb | Yes | Additional context |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Index**: `(user_id, status)`, `(event_id)`, `(created_at)`

---

#### `refunds`
**Purpose**: Tracks refund requests and processing.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| payment_id | uuid | No | FK → payments(id) |
| registration_id | uuid | Yes | FK → event_registrations(id) |
| stripe_refund_id | text | Yes | Stripe reference |
| amount | integer | No | Refund amount in cents |
| reason | text | Yes | Why refund was requested |
| status | refund_status | No | ENUM |
| requested_by | uuid | No | FK → profiles(id) |
| processed_by | uuid | Yes | FK → profiles(id) |
| processed_at | timestamptz | Yes | |
| created_at | timestamptz | No | |

---

#### `payouts`
**Purpose**: Tracks payouts to academies/coaches via Stripe Connect.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| academy_id | uuid | Yes | FK → academies(id) |
| coach_id | uuid | Yes | FK → coaches(id) |
| event_id | uuid | Yes | FK → events(id) |
| payment_id | uuid | Yes | FK → payments(id) |
| stripe_transfer_id | text | No | Stripe reference |
| stripe_balance_transaction_id | text | Yes | |
| amount | integer | No | Payout in cents |
| platform_fee | integer | Yes | Tenpo's cut |
| currency | text | No | Default 'usd' |
| status | text | No | 'pending', 'in_transit', 'paid', 'failed' |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

---

### 3.9 Review Tables

#### `reviews`
**Purpose**: Bidirectional reviews with proper FK enforcement.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| reviewer_id | uuid | No | FK → profiles(id) |
| event_id | uuid | Yes | FK → events(id) |
| registration_id | uuid | Yes | FK → event_registrations(id) |
| reviewee_profile_id | uuid | Yes | FK → profiles(id); for coach/athlete reviews |
| reviewee_academy_id | uuid | Yes | FK → academies(id); for academy reviews |
| rating | integer | No | 1-5 stars |
| comment | text | Yes | Written review |
| is_public | boolean | No | True for coach/academy, false for athlete/parent |
| status | text | No | 'published', 'disputed', 'removed' |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**CHECK**: `((reviewee_profile_id IS NOT NULL)::int + (reviewee_academy_id IS NOT NULL)::int = 1)`

**Unique Constraint**: `(reviewer_id, registration_id, reviewee_profile_id, reviewee_academy_id)`

**Note**: Polymorphic `reviewee_type/reviewee_id` replaced with nullable FK columns.

---

### 3.10 Notification Tables

#### `notifications`
**Purpose**: Stores notifications sent to users.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| user_id | uuid | No | FK → profiles(id) |
| type | text | No | 'booking_confirmed', 'event_reminder', etc. |
| title | text | No | Notification title |
| body | text | Yes | Notification content |
| data | jsonb | Yes | Structured data (event_id, etc.) |
| channel | text | No | 'email', 'push', 'sms' |
| status | text | No | 'pending', 'sent', 'failed' |
| sent_at | timestamptz | Yes | |
| read_at | timestamptz | Yes | |
| created_at | timestamptz | No | |

**Index**: `(created_at)`

---

#### `notification_preferences`
**Purpose**: User preferences for notification types.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| user_id | uuid | No | FK → profiles(id) |
| notification_type | text | No | |
| email_enabled | boolean | No | Default true |
| push_enabled | boolean | No | Default true |
| sms_enabled | boolean | No | Default false |
| updated_at | timestamptz | No | |

**Unique Constraint**: `(user_id, notification_type)`

---

### 3.11 Waiver Tables

#### `waivers`
**Purpose**: Waiver/liability agreement templates. Append-only for versioning.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| academy_id | uuid | Yes | FK → academies(id) |
| coach_id | uuid | Yes | FK → coaches(id) |
| name | text | No | Waiver name |
| content | text | No | Full text (markdown) |
| version | integer | No | Default 1; increment on changes |
| is_active | boolean | No | Default true |
| created_by | uuid | Yes | FK → profiles(id) |
| deleted_at | timestamptz | Yes | Soft-delete old versions |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Note**: Waivers are append-only. To "edit," soft-delete old version and create new row.

---

#### `event_waivers`
**Purpose**: Junction table linking events to required waivers.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| event_id | uuid | No | FK → events(id) |
| waiver_id | uuid | No | FK → waivers(id) |
| is_required | boolean | No | Default true |
| created_at | timestamptz | No | |

**Unique Constraint**: `(event_id, waiver_id)`

---

#### `waiver_signatures`
**Purpose**: Records of signed waivers with version tracking.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| waiver_id | uuid | No | FK → waivers(id) |
| waiver_version | integer | No | Version that was signed |
| athlete_id | uuid | No | FK → athletes(id); the athlete the waiver is for |
| signed_by_user_id | uuid | No | FK → profiles(id); who actually signed (guardian or self) |
| event_id | uuid | Yes | FK → events(id); if event-specific |
| ip_address | text | Yes | Signer's IP |
| user_agent | text | Yes | Browser info |
| signature_method | text | No | 'checkbox' or 'document' |
| document_url | text | Yes | If uploaded document |
| signed_at | timestamptz | No | |

**Unique Constraint**: `(waiver_id, athlete_id, event_id, waiver_version)`

---

### 3.12 Calendar Integration

#### `calendar_integrations`
**Purpose**: OAuth tokens for Google/Apple/Outlook calendar sync.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| user_id | uuid | No | FK → profiles(id) |
| provider | text | No | 'google', 'apple', 'outlook' |
| email | text | Yes | Calendar account email |
| vault_secret_id | uuid | Yes | Reference to Supabase Vault |
| expires_at | timestamptz | Yes | Token expiration |
| is_active | boolean | No | Default true |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Note**: `access_token` and `refresh_token` moved to Supabase Vault.

**Unique Constraint**: `(user_id, provider)`

---

### 3.13 Analytics Tables

#### `daily_analytics`
**Purpose**: Daily aggregated metrics.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| date | date | No | The date |
| scope_type | text | No | 'platform', 'academy', 'coach' |
| scope_id | uuid | Yes | NULL for platform |
| new_users | integer | No | Default 0 |
| active_users | integer | No | Default 0 |
| new_registrations | integer | No | Default 0 |
| revenue | integer | No | In cents |
| refunds | integer | No | In cents |
| events_created | integer | No | Default 0 |
| reviews_received | integer | No | Default 0 |
| average_rating | decimal(3,2) | Yes | |
| created_at | timestamptz | No | |

**Unique Constraint**: `(date, scope_type, scope_id)`

---

#### `monthly_analytics`
**Purpose**: Monthly rollups.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | PK |
| year | integer | No | |
| month | integer | No | 1-12 |
| scope_type | text | No | |
| scope_id | uuid | Yes | |
| total_users | integer | No | |
| new_users | integer | No | |
| active_users | integer | No | |
| total_registrations | integer | No | |
| total_revenue | integer | No | In cents |
| total_refunds | integer | No | In cents |
| total_events | integer | No | |
| completed_events | integer | No | |
| canceled_events | integer | No | |
| average_rating | decimal(3,2) | Yes | |
| created_at | timestamptz | No | |

**Unique Constraint**: `(year, month, scope_type, scope_id)`

---

## 4. Indexes

```sql
-- Event discovery
CREATE INDEX idx_events_discovery ON events(academy_id, status, sport_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_location ON events(location_id) WHERE deleted_at IS NULL;

-- Registration lookups
CREATE INDEX idx_registrations_event ON event_registrations(event_id, status);
CREATE INDEX idx_registrations_athlete ON event_registrations(athlete_id);
CREATE INDEX idx_registrations_created ON event_registrations(created_at);

-- Payment reconciliation
CREATE INDEX idx_payments_user ON payments(user_id, status);
CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_created ON payments(created_at);

-- Reviews
CREATE INDEX idx_reviews_profile ON reviews(reviewee_profile_id) WHERE reviewee_profile_id IS NOT NULL;
CREATE INDEX idx_reviews_academy ON reviews(reviewee_academy_id) WHERE reviewee_academy_id IS NOT NULL;

-- Notifications
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

---

## 5. Constraints

```sql
-- Partial unique indexes for soft-deleted slugs
CREATE UNIQUE INDEX idx_academies_slug ON academies(slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_sports_slug ON sports(slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_specialties_slug ON specialties(slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_events_slug ON events(academy_id, slug) WHERE deleted_at IS NULL;

-- One payment per registration (MVP)
CREATE UNIQUE INDEX idx_registrations_payment ON event_registrations(payment_id) WHERE payment_id IS NOT NULL;

-- Reviews: exactly one reviewee
ALTER TABLE reviews ADD CONSTRAINT chk_reviews_one_reviewee
  CHECK ((reviewee_profile_id IS NOT NULL)::int + (reviewee_academy_id IS NOT NULL)::int = 1);
```

---

## 6. Triggers & Functions

```sql
-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_athletes_updated_at BEFORE UPDATE ON athletes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_coaches_updated_at BEFORE UPDATE ON coaches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_academies_updated_at BEFORE UPDATE ON academies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- ... etc for all tables

-- Coach role validation
CREATE OR REPLACE FUNCTION validate_coach_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.user_id AND role = 'COACH') THEN
    RAISE EXCEPTION 'User must have COACH role to create coach profile';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_coaches_validate_role BEFORE INSERT ON coaches FOR EACH ROW EXECUTE FUNCTION validate_coach_role();

-- Academy admin role validation
CREATE OR REPLACE FUNCTION validate_academy_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.user_id AND role = 'ACADEMY_ADMIN') THEN
    RAISE EXCEPTION 'User must have ACADEMY_ADMIN role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_academy_admins_validate_role BEFORE INSERT ON academy_admins FOR EACH ROW EXECUTE FUNCTION validate_academy_admin_role();
```

---

## 7. Security-Definer Functions (RPCs)

```sql
-- Admin-only email search (profiles.email was removed)
CREATE OR REPLACE FUNCTION search_users_by_email(query text)
RETURNS TABLE (id uuid, email text, first_name text, last_name text)
SECURITY DEFINER
AS $$
BEGIN
  -- Check caller is SUPER_ADMIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT p.id, au.email, p.first_name, p.last_name
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE au.email ILIKE '%' || query || '%';
END;
$$ LANGUAGE plpgsql;

-- Atomic ticket reservation (prevents overselling)
CREATE OR REPLACE FUNCTION reserve_ticket(p_ticket_id uuid)
RETURNS uuid
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  UPDATE event_tickets
  SET quantity_sold = quantity_sold + 1
  WHERE id = p_ticket_id
    AND (capacity IS NULL OR quantity_sold < capacity)
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Ticket sold out';
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Get calendar tokens from Vault (server-side only)
CREATE OR REPLACE FUNCTION get_calendar_tokens(p_integration_id uuid)
RETURNS jsonb
SECURITY DEFINER
AS $$
DECLARE
  v_secret_id uuid;
  v_tokens jsonb;
BEGIN
  -- Verify ownership
  SELECT vault_secret_id INTO v_secret_id
  FROM calendar_integrations
  WHERE id = p_integration_id AND user_id = auth.uid();

  IF v_secret_id IS NULL THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Retrieve from Vault
  SELECT decrypted_secret INTO v_tokens
  FROM vault.decrypted_secrets
  WHERE id = v_secret_id;

  RETURN v_tokens;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. RLS Policies

```sql
-- Athletes: MVP constraint (no self-managed)
CREATE POLICY athletes_no_self_managed ON athletes
  FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Athletes: guardian requirement
CREATE POLICY athletes_guardian_required ON athletes
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM athlete_guardians WHERE athlete_id = id)
  );

-- Athlete medical: strict access
CREATE POLICY athlete_medical_guardian_access ON athlete_medical
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM athlete_guardians ag
      WHERE ag.athlete_id = athlete_medical.athlete_id
        AND ag.guardian_id = auth.uid()
    )
  );

-- Locations: visibility
CREATE POLICY locations_select ON locations
  FOR SELECT
  USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY locations_modify ON locations
  FOR UPDATE
  USING (created_by = auth.uid());

-- Calendar integrations: ownership
CREATE POLICY calendar_owner ON calendar_integrations
  FOR ALL
  USING (user_id = auth.uid());
```

---

## 9. App-Level Validations

These are enforced in application code, not database constraints:

1. **Publish-time capacity check**: `SUM(event_tickets.capacity) <= locations.capacity`
2. **Waiver completion check**: All required waivers in `event_waivers` have signatures in `waiver_signatures`
3. **PII access audit**: App-level logging when `athlete_medical` data is accessed

---

## 10. MVP Table Checklist

| Table | MVP? | Notes |
|-------|------|-------|
| profiles | Yes | Core |
| user_roles | Yes | Multi-role support |
| athletes | Yes | Core |
| athlete_medical | Yes | PII separation |
| athlete_guardians | Yes | |
| coaches | Yes | |
| coach_sports | Yes | Direct sport link |
| coach_specialties | Yes | |
| academies | Yes | Core |
| academy_admins | Yes | |
| academy_coaches | Yes | |
| invites | Yes | Onboarding flow |
| sports | Yes | |
| specialties | Yes | |
| locations | Yes | |
| events | Yes | Core |
| event_days | Yes | |
| event_tickets | Yes | |
| event_registrations | Yes | |
| event_staff | Yes | |
| event_waivers | Yes | |
| promo_codes | Yes | |
| promo_code_uses | Yes | |
| payments | Yes | |
| refunds | Yes | |
| payouts | Yes | |
| reviews | Yes | |
| waivers | Yes | |
| waiver_signatures | Yes | |
| notifications | Yes | |
| notification_preferences | Yes | |
| calendar_integrations | Yes | |
| daily_analytics | Yes | |
| monthly_analytics | Yes | |

**NOT in MVP:**
- availability
- sessions
- session_participants
- packages
- package_purchases
- conversations
- messages

---

*Document Version: 2.0*
*Based on: schema-proposal-V1.md + Codex Review Round 1 + Codex Review Round 2*

**Changelog:**
- v2.0: Incorporated all changes from Codex Review Round 1 and Round 2:
  - Added 3 new tables: `invites`, `coach_sports`, `athlete_medical`
  - Added 8 Postgres ENUM types for all status fields
  - Replaced `is_approved` with `approval_status` ENUM + audit fields
  - Replaced `is_deleted` with `deleted_at TIMESTAMPTZ` pattern
  - Removed `profiles.email` (use auth.users via RPC)
  - Removed `events.max_capacity` (use ticket tier capacities)
  - Removed `event_registrations.waiver_signed` (compute from signatures)
  - Moved PII from `athletes` to `athlete_medical`
  - Refactored `reviews` from polymorphic to nullable FK pattern
  - Added pricing snapshot fields to `event_registrations`
  - Added Supabase Vault integration for OAuth tokens
  - Added `timezone` to events (copied from location)
  - Added `created_by` audit fields
  - Added waiver versioning (`waiver_version`, `signed_by_user_id`)
  - Added partial unique indexes for soft-deleted slugs
  - Added RLS policies, triggers, and security-definer RPCs
  - Added performance indexes
