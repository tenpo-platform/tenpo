# Tenpo Database Schema Scoping Questions

This document contains business questions to determine how Tenpo's schema should differ from the DivineTime reference. Please answer each section - your responses will drive the database design.

---

## 1. Core Business Model

### 1.1 Platform Identity
- [ ] **Q1**: Is Tenpo exclusively for youth sports training, or will it support adult training/coaching as well?
ANS: No, we will add adult sport training, we will add coaching. The concept will be that there will be camps and clinics, but there always will be private sessions as well. 
- [ ] **Q2**: Is the platform sports-agnostic (any sport) or focused on specific sports (soccer only, etc.)?
ANS: Initially it's only targeted at soccer, but eventually it will support all sports. 
- [ ] **Q3**: What's the geographic scope at launch? Single city, region, national, international?
ANS: The geographic scope at launch is the Bay Area in California but we will quickly expand to regional and national across different sports as well. 
- [ ] **Q4**: Is this B2C only (parents find trainers) or also B2B (clubs/academies use the platform)?
ANS: It's actually both. So we have a B2C component where parents find academies and trainers, but also a component where businesses use our tools to build their events and camps as well as coaches use our tool to list their services like coaching. 

### 1.2 Primary Value Proposition
- [ ] **Q5**: Is the core offering individual sessions, group events, or both equally weighted?
ANS: The core offering is individual session, group events, clinics, camps, networking all as equally weighted except for networking, which is less weighted. 
- [ ] **Q6**: Do you envision a marketplace model (trainers set their own prices) or a managed model (Tenpo sets/approves pricing)?
ANS: A complete marketplace model where trainers set their own prices. Academy owners will also set their own prices. 
- [ ] **Q7**: Will Tenpo employ trainers directly, or are all trainers independent contractors?
ANS: Tenpo will not employ trainers directly. They are independent contractors. We will have an agreement in the B to B component with academies

---

## 2. User Roles & Authentication

### 2.1 Role Structure

- [ ] **Q8**: Do you need all three roles? Any additional roles needed?
  ANS: Here are the following role types. 
  - Parent (they manage their kid)
  - Athlete (they manage themselves or a Parent manages them )
  - Academy Admin (they manage their camps/clinic/coaches but a coach can be tied to many academies or independant or both)
  - Coaches (they manage themselves can belong to academies or themselves only or both)
  - Guest (someone before they create an account? not sure about this one)
  - Super Admin (me and my cofounder)
  - Staff (someone who we employee that has access similar to super admin but less priviledges)
  - there maybe more

- [ ] **Q9**: Can a single user have multiple roles? (e.g., a parent who is also a trainer)
    ANS: Parent can also be an athlete. Academy admin can also be a parent
- [ ] **Q10**: Should trainers be able to self-register, or is it invite/approval only?
    ANS: Both, coaches can self register or be invited by an academy admin to fill out their profile. 

### 2.2 Authentication (Supabase)
- [ ] **Q11**: Since auth is Supabase-handled, do we still need:
  - `password` field on User table? (Supabase handles this)
  - `resetToken` / `resetTokenExpiresAt`? (Supabase handles this)
  - `Verification` table for OTP? (Supabase handles email verification)
  - `Otp` table?
  ANS: This is up to you. I guess not. 

- [ ] **Q12**: Will you use Supabase social auth (Google, Apple, etc.)?
ANS: Google yes to start. Maybe Microsoft? 
- [ ] **Q13**: Do trainers need a separate approval workflow even after email verification?
ANS: They will undergo an onboarding flow. So will academy admins. 

### 2.3 User Profile
- [ ] **Q14**: What user profile fields are required vs. optional?
ANS: I am not sure, you decide. 
- [ ] **Q15**: Do you need profile photos for parents/users, or just trainers?
ANS: Yes for all people/ All user can have profile photos. Some maybe have many profile photos. 
- [ ] **Q16**: Phone number - required for booking? SMS notifications planned?
ANS: Yes it can be required for booking, SMS notifications is planned

---

## 3. Players/Athletes (Child equivalent)

### 3.1 Terminology
- [ ] **Q17**: What do you call the people receiving training?
  - Child/Kid (assumes youth-only)
  - Player
  - Athlete
  - Student
  - Client
  ANS: Athlete only 

### 3.2 Player Requirements
- [ ] **Q18**: Is the platform youth-only, or can adults book for themselves?
  - If adults can book for themselves, the Parent→Child relationship changes significantly
  ANS: Adults can book for themselves.

- [ ] **Q19**: For youth players, is a parent/guardian account required, or can a teen (16+) have their own account?
ANS: 16+ can have their own account, whatever is required under california state law. Camps/clinic/coaches will need to have a parent/guardian contact info. 

### 3.3 Player Profile Fields
DivineTime tracks: name, birthdate, skill_level, team, allergies, emergency_contact, medical_conditions

- [ ] **Q20**: Which of these fields do you actually need?
  - Allergies - relevant for sports training?
  - Medical conditions (asthma, etc.) - required for liability?
  - Emergency contact - legally required?
  - Team name - useful for trainers?
  - Skill level - how is this determined/verified?
  ANS: All of them and more. Keep these for now. 

- [ ] **Q21**: Any additional player fields needed?
  - Position played
  - Dominant foot/hand
  - Height/weight
  - Years of experience
  - Goals/objectives
  - Photo/video for skill assessment
  ANS: Not right now. 

- [ ] **Q22**: Do players need to upload documents (medical clearance, waivers signed by guardians)?
ANS: Waivers yes. Either a checkbox activity or a doc upload. Likely signed by parent/guardian

### 3.4 Multi-Child Support
- [ ] **Q23**: Can one parent have multiple children on the platform? (DivineTime: yes)
ANS: Yes absolutley
- [ ] **Q24**: Can a child be linked to multiple guardians (divorced parents, both booking)?
ANS: Yes

---

## 4. Trainers/Coaches

### 4.1 Terminology
- [ ] **Q25**: What do you call service providers?
  - Trainer
  - Coach
  - Instructor
  - Pro
  ANS: Coaches or Academies (depedning on the context)

### 4.2 Trainer Onboarding
- [ ] **Q26**: What verification is required before a trainer can accept bookings?
  ANS: Background checks (this will be added later but we should just have a pass through right now)
  - Background check integration?
  ANS: Checkr (skip for now)
  - Certification uploads (coaching licenses)?
  ANS: Yes but later
  - ID verification?
  ANS: Yes but later
  - Interview/approval process?
  ANS: Yes approved by superadmin in the beginning. All coach / academies have to undergo superadmin review. 

- [ ] **Q27**: Do coaches set their own:
  - Hourly rate?
  - Session duration?
  - Availability?
  - Cancellation policy?
  YES to all 

### 4.3 Trainer Profile
DivineTime tracks: bio, experience, photos, price_per_hour, session_duration, Stripe Connect details

- [ ] **Q28**: What trainer profile fields are needed?
  - Specializations (goalkeeping, defense, etc.)
  - Sports/disciplines offered
  - Certifications/credentials
  - Languages spoken
  - Video introduction
  - Years coaching
  - Teams/clubs coached
  - Coaching Style 
  ANS: Yes and add more fields. 

- [ ] **Q29**: Should trainer ratings/reviews be supported?
ANS: Yes
- [ ] **Q30**: Do trainers have a "verified" badge system?
ANS: Yes

### 4.4 Trainer Availability
- [ ] **Q31**: How do trainers set availability?
  - Weekly recurring schedule
  - One-time availability slots
  - Calendar sync (Google Calendar integration exists in DivineTime)
  - Block-off unavailable times
  ANS: They can pick any of these methods. 

- [ ] **Q32**: Can trainers set different rates for:
  - Different times (peak vs off-peak)?
  - Different locations?
  - Different session lengths?
  ANS: Different session lengths yes. They can customize their offering. They make packages. We need flexibility 

---

## 5. Locations & Facilities

### 5.1 Location Model
DivineTime has a simple Location table with just `name`

- [ ] **Q33**: What location data do you need?
  - Address (street, city, state, zip)
  - GPS coordinates (for maps/distance)
  - Facility type (field, gym, court, pool)
  - Indoor/outdoor
  - Photos
  - Amenities (parking, restrooms, etc.)
  - Capacity
  ANS: All of those extra data points. 

- [ ] **Q34**: Who creates locations?
  - Admins only
  - Trainers can add their own
  - Facility owners register
  ANS: Academy admins, superadmins and coaches. Superadmin can overwrite all of them. Academy admin and coaches can update the ones they create and select from all available

- [ ] **Q35**: Do locations need availability/booking? (e.g., rent a field)
ANS: No
- [ ] **Q36**: Can sessions happen at "client's location" (travel coaching)?
ANS: Yes, this is somehting we ask the coach is they are willing to do
- [ ] **Q37**: Virtual/online sessions supported?
ANS: Yes

---

## 6. Sessions (1-on-1 Training)

### 6.1 Session Types
- [ ] **Q38**: What session formats are supported?
  - 1-on-1 (one trainer, one player)
  - Small group (one trainer, 2-4 players)
  - Semi-private (one trainer, shared among non-related players)
  - Partner sessions (two players who know each other)
  ANS: All of those to start

- [ ] **Q39**: For group sessions, how is pricing handled?
  - Per-player rate
  - Flat group rate split among players
  - Discounted per-player rate
  ANS: I am not sure 

### 6.2 Session Booking Flow
- [ ] **Q40**: Who initiates bookings?
  - Parent requests → Trainer confirms
  - Parent books directly from available slots
  - Trainer invites clients to book
  ANS: This is configured at the coach level generally. They set their preference. Parents discover or get sent the coach page and then they book.  

- [ ] **Q41**: How far in advance can sessions be booked?
ANS: a calendar year
- [ ] **Q42**: Is there a minimum notice period for bookings?
ANS: coaches can either select 12, 24 or 48 hours. 
- [ ] **Q43**: Can a parent book recurring sessions (every Tuesday at 4pm)?
ANS: yes

### 6.3 Session States
DivineTime uses: PENDING, PAID, CANCELED

- [ ] **Q44**: What session states do you need?
  - Requested (awaiting trainer confirmation)
  - Confirmed (trainer accepted)
  - Pending Payment
  - Paid
  - In Progress
  - Completed
  - Canceled (by parent)
  - Canceled (by trainer)
  - No-show (player)
  - No-show (trainer)
  - Rescheduled
  ANS: Correct

### 6.4 Session Modifications
- [ ] **Q45**: Cancellation policy - how is this determined?
  - Platform-wide policy
  - Per-trainer policy
  - Configurable cancellation windows (24h, 48h, etc.)
  ANS: 12, 24, 48 per the coaches / academy's preference.

- [ ] **Q46**: Who can reschedule?
ANS: Either side but it must be approved by the other party
- [ ] **Q47**: Is there a limit on reschedules?
ANS: No
- [ ] **Q48**: Late arrival policy?
ANS: Unsure.

### 6.5 Session Content
- [ ] **Q49**: Do trainers log what happened in a session?
  - Session notes
  - Skills worked on
  - Progress tracking
  - Homework/drills assigned
  - Photos/videos from session
ANS: not yet. Added later

- [ ] **Q50**: Do parents/players rate sessions?
ANS: Yes

---

## 7. Events (Camps, Clinics)

### 7.1 Event Types
DivineTime has: CAMP, CLINIC, NETWORKING

- [ ] **Q51**: What event types do you need?
  - Camp (multi-day)
  - Clinic (single skill focus)
  - Tournament
  - Tryout
  - Workshop
  - Drop-in session
  - Team training
ANS: Camp (multi-day), Clinic (single skill focus) for now

- [ ] **Q52**: Are events Tenpo-organized or trainer-organized or both?
ANS: They are academy admin organized 

### 7.2 Event Structure
- [ ] **Q53**: Can events span multiple days with different schedules per day?
ANS: Yes
- [ ] **Q54**: Can events have multiple sessions/tracks (beginner group, advanced group)?
ANS: Yes
- [ ] **Q55**: Do events have capacity limits per age group or skill level?
ANS: Yes per age group and general capacity for headcount. Not skill level 

### 7.3 Event Ticketing
DivineTime has EventTicket types (Early Bird, VIP, etc.)

- [ ] **Q56**: Do you need multiple ticket tiers?
ANS: Yes
- [ ] **Q57**: Discount codes/promo codes for events?
ANS: Yes
- [ ] **Q58**: Waitlist when events sell out?
ANS: Not yet
- [ ] **Q59**: Family discounts (sibling registers = X% off)?
ANS: Not yet

### 7.4 Event Staffing
- [ ] **Q60**: How are trainers assigned to events?
ANS: Coach either finds them from global list and requests to add them (this is one time thing) or they send links to folks to create their profile if they haven't already 
- [ ] **Q61**: Are trainers paid per event? How is that tracked?
ANS: payment to trainer from something an academy admin sets up is not our business. they deal with it. 
- [ ] **Q62**: Can external (non-platform) trainers staff events?
ANS: Yes

---

## 8. Pricing & Packages

### 8.1 Session Pricing
- [ ] **Q63**: Who sets session prices?
  - Trainers set their own
  - Platform sets ranges
  - Negotiable
ANS: Coaches set their own, academy admin set their own

- [ ] **Q64**: Are prices per-session or per-hour?
ANS: Can be either but not both
- [ ] **Q65**: Different prices for different session lengths (30min, 60min, 90min)?
ANS: Yes

### 8.2 Bulk Packages
DivineTime has Bulk packages (e.g., 10 sessions for $800)

- [ ] **Q66**: Do you want bulk session packages?
ANS: Yes
- [ ] **Q67**: Do packages expire? (Use within 90 days, etc.)
ANS: Not right away 
- [ ] **Q68**: Are packages trainer-specific or platform-wide?
ANS: trainer-specific
- [ ] **Q69**: Can unused sessions be refunded?
ANS: No

### 8.3 Subscriptions
DivineTime has subscription plans (BASIC, FREE)

- [ ] **Q70**: What is the subscription for?
  - Platform access fee for parents?
  - Unlimited booking tier?
  - Premium features?
  - Trainer subscription to list on platform?
  ANS: We don't need these yet. 

- [ ] **Q71**: What subscription tiers do you envision?
ANS: Don't add this. 
- [ ] **Q72**: Monthly vs annual billing?
ANS: Don't add this yet 

### 8.4 Group Discounts
DivineTime has TrainerGroupDiscount

- [ ] **Q73**: Do you need configurable group pricing?
ANS: Yes
- [ ] **Q74**: Referral program / credits for referring friends?
ANS: No yet

---

## 9. Payments & Payouts

### 9.1 Payment Processing
DivineTime uses Stripe heavily

- [ ] **Q75**: Confirm Stripe is the payment processor?
ANS: Yes
- [ ] **Q76**: Do you need:
  - Stripe Connect for trainer payouts?
  ANS: Yes
  - Platform fee structure (Tenpo takes X%)?
  ANS: Yes, amount undetemrined
  - Hold funds until session complete?
  ANS: Yes

### 9.2 Payment Timing
- [ ] **Q77**: When is payment collected?
  - At booking time (prepay)
  - After session (post-pay)
  - Deposit at booking, balance after
  ANS: Deposit at booking, balance after for coaching. Upfront for academy camps. 

- [ ] **Q78**: When are trainers paid out?
  - Immediately after session
  - Weekly payouts
  - Monthly payouts
  - After client confirms completion
  ANS: This is connected to their stripe, it auto appears in their stripe. Need to figure this out a bit more. 

### 9.3 Refunds & Disputes
- [ ] **Q79**: Who approves refunds?
  - Automatic based on cancellation policy
  - Admin approval required
  - Trainer can issue refunds
  ANS: Automatic based on cancellation policy. Give Superadmins the ability to do this regardless of policy 

- [ ] **Q80**: Dispute resolution process?
ANS: Email sent to Superadmins and trainer / academy from a form submitted by buyer
- [ ] **Q81**: Partial refund scenarios?
ANS: No

### 9.4 Revenue Tracking
- [ ] **Q82**: What financial reporting do you need?
  - Trainer earnings reports
  - Platform revenue reports
  - Tax documents (1099 generation?)
  ANS: None, Stripe handles it. We will have analytics for coach, academy admin and superadmin in their dashboards. 

---

## 10. Notifications & Communication

### 10.1 Notification Types
- [ ] **Q83**: What notifications are needed?
  - Booking confirmation -> YES
  - Booking reminder (24h before) -> YES
  - Session canceled -> YES
  - Payment received -> This is likely when booking occurs
  - Payout sent -> Yes
  - New message -> Yes
  - Review received -> Yes
  

### 10.2 Notification Channels
- [ ] **Q84**: Which channels?
  - Email (required)
  - SMS
  - Push notifications (mobile app planned?)
  - In-app notifications
  Email for now, mobile app push notifications later. 

### 10.3 In-Platform Messaging
- [ ] **Q85**: Do users need to message each other?
  - Parent ↔ Trainer chat
  - Message history stored?
  - File/image sharing in chat?
ANS: Parent to trainer yes (skip for now)

---

## 11. Reviews & Ratings

- [ ] **Q86**: Can parents rate trainers?
ANS: Yes
- [ ] **Q87**: Can trainers rate players/parents? (Important for no-shows, etc.)
ANS: Yes
- [ ] **Q88**: Public vs private reviews?
ANS: Public for coach/academies but private for parents/athletes (buyers)
- [ ] **Q89**: Can reviews be disputed/removed?
ANS: Yes
- [ ] **Q90**: Minimum sessions before review allowed?
ANS: 1 

---

## 12. Analytics & Reporting

### 12.1 Admin Analytics
DivineTime has DailyStatistics, MonthlyStatistics, YearlyStatistics

- [ ] **Q91**: What admin metrics matter most?
ANS: Superadmin, coaches and academy admins cares about daily, monthly and yearly.
- [ ] **Q92**: Real-time dashboards or batch reporting?
ANS: Batch-reporting computer nightly
- [ ] **Q93**: Do you need these aggregated tables, or will you query on-demand?
ANS: Aggregated tables

### 12.2 Trainer Analytics
- [ ] **Q94**: What do trainers see about their business?
  - Earnings over time
  - Session count
  - Client retention
  - Rating trends
  - Booking conversion rate
  ANS: All of that for coaches and academy admins

### 12.3 Parent/Player Analytics
- [ ] **Q95**: What do parents see?
  - Training history
  - Skills progress
  - Money spent
  - Upcoming sessions
  ANS: Training history, upcoming sessions

---

## 13. Mobile & Integrations

### 13.1 Mobile App
- [ ] **Q96**: Is a mobile app planned?
ANS: Yes. Ignore for now
- [ ] **Q97**: Same features as web, or limited?
ANS: limited

### 13.2 Calendar Integration
DivineTime has Google Calendar integration for trainers

- [ ] **Q98**: Support trainer calendar sync (Google, Apple, Outlook)?
ANS: Yes
- [ ] **Q99**: Add sessions to parent's calendar?
ANS: Yes

### 13.3 Other Integrations
- [ ] **Q100**: Any other integrations needed?
  - Video conferencing (for virtual sessions)
  - Background check services
  - Accounting software
  - CRM
  - Marketing tools (Mailchimp exists in DivineTime)
  ANS: Resend for emails, checkr for background checks (not now). 

---

## 14. Compliance & Safety

### 14.1 Legal Requirements
- [ ] **Q101**: What waivers/agreements are needed?
  - Liability waiver per session?
  - Annual waiver?
  - Photo/video release?
  - Terms of service acceptance tracking?
  ANS: Likely checkbox session or liability waiver.

- [ ] **Q102**: COPPA compliance (if children under 13 have accounts)?
ANS: They can't have their own account. They are too young
- [ ] **Q103**: Background check requirements for trainers?
ANS: Yes, Checkr (added later)

### 14.2 Data Privacy
- [ ] **Q104**: GDPR compliance needed?
ANS: No
- [ ] **Q105**: Data retention policies?
ANS: Unsure
- [ ] **Q106**: Right to delete / data export?
ANS: Right to delete, no export. 

---

## 15. MVP vs Future

### 15.1 MVP Scope
- [ ] **Q107**: For MVP, what's the minimum feature set?
  - Sessions only, no events?
  - Single location metro area?
  - No bulk packages?
  - No subscriptions?
  ANS: Events only. Single location 

- [ ] **Q108**: What's explicitly OUT of scope for MVP?
ANS: Subscriptions, Crazy complex booking flows. WE START SIMPLE AND WITH A GOOD FOUNDATION AND BUILD FROM THERE. THIS IS SUPER IMPORTANT.  

### 15.2 Future Features
- [ ] **Q109**: What features are planned for post-MVP?
ANS: unsure
- [ ] **Q110**: Any features in DivineTime you definitely DON'T want?
ANS: unsure

---

## 16. Technical Preferences

### 16.1 Database
- [ ] **Q111**: Confirm PostgreSQL via Supabase?
ANS: yes
- [ ] **Q112**: Use Supabase Row Level Security (RLS)?
ANS: yes
- [ ] **Q113**: Soft deletes (is_deleted flags) or hard deletes?
ANS: soft deletes for now

### 16.2 IDs
- [ ] **Q114**: UUID for all IDs, or any auto-increment integers?
ANS: UUIDs
- [ ] **Q115**: Human-readable IDs for anything (booking codes like "BK-2024-0001")?
ANS: Not necessary

### 16.3 Timestamps
- [ ] **Q116**: Store all times in UTC?
ANS: Whatever is simplest. Beachhead is PST
- [ ] **Q117**: Track timezone per user or per location?
ANS: Yes

---

## Summary Checklist

After answering above, confirm:

| Domain | Include in MVP? | Notes |
|--------|-----------------|-------|
| User Auth (Supabase) | YES | |
| Parent accounts | Yes | |
| Player/Athlete profiles | YES| |
| coach profiles | YES| |
| Locations | YES| |
| Sessions (1-on-1) | No| |
| Group sessions | No| |
| Events/Camps | Yes| |
| Bulk packages | No| |
| Subscriptions | No| |
| Payments (Stripe) | Yes| |
| Trainer payouts | Yes| academy admin payouts|
| Refunds | Yes| |
| Reviews/ratings | Yes| |
| Messaging | No| |
| Notifications (email) | Yes| |
| Notifications (SMS) | No| |
| Calendar sync | Yes| |
| Analytics tables | Yes| |
| Mobile app | No| |

---

*Please answer these questions as thoroughly as possible. Answers like "same as DivineTime" are acceptable where applicable.*
