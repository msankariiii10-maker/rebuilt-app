# Rebuilt — Full App (Homepage + Program + Checkout)

This is the complete, real Next.js app — not a static mockup. Every page
here is connected to your actual Supabase database, and checkout creates
a real Stripe Checkout Session.

## What's in this version

- **Real homepage** (`/`) — hero, video, testimonials, footer, all
  restyled from the original design using one shared global stylesheet
  (`app/globals.css`) instead of scattered inline styles.
- **Legal pages** (`/legal/privacy`, `/legal/terms`, `/legal/medical`) —
  same content as before, now real routes with a shared nav.
- **Real checkout** (`/checkout`) — $19.99/month, creates an actual
  Stripe Checkout Session via `/api/create-checkout-session`.
- **The program itself, wired to Supabase — not mock data:**
  - `/program` — cover page, tap to enter
  - `/program/week` — pulls real day labels (Lower Body / Upper Body /
    Mobility / Rest) from the `week_days` table
  - `/program/day/[monday|tuesday|...]` — the real exercise page. Pulls
    actual exercises for that day, the logged-in user's real progress
    per exercise, and lets them mark a session complete or level up —
    both write directly to Supabase.
- **Single program now** (the earlier Low Back / Low Back + Knee split
  was dropped per a later product decision — see schema notes below).

## Setup

1. **Supabase**: run `supabase/schema.sql`, then `supabase/seed.sql`, in
   the Supabase SQL editor, in that order.
2. **Copy env vars**: `cp .env.local.example .env.local`, fill in your
   Supabase URL/key and Stripe secret key (see the Stripe section below
   for the price setup).
3. **Install & run**:
   ```
   npm install
   npm run dev
   ```
   Visit `http://localhost:3000` — this is now the real homepage, not a
   preview.

## IMPORTANT — real content gap in the seed data

Every one of Moe's real, documented exercises is lower-body /
posterior-chain focused (the original Monday/Tuesday/Thursday/Friday
split). There is **no real Upper Body or Mobility content yet** — those
two day labels are seeded with clearly-marked `TODO` placeholder
exercises so the app doesn't show empty days. Before launch, either:

- Add real Upper Body / Mobility exercises (replace the
  `placeholder-upper-*` and `placeholder-mobility-*` rows in
  `seed.sql`), or
- Remap which real exercises appear on which days if the label scheme
  should change.

Also still needed everywhere: real Level 1/2 instructions (replace the
`TODO` text in each exercise's early levels), and real video URLs (the
`media_url` column exists on `exercise_levels`, ready to fill in once
videos are hosted somewhere like Mux/Cloudinary).

## Stripe checkout setup

1. Stripe Dashboard → Product catalog → Add product → "Rebuilt Program —
   Monthly", $19.99, Recurring, Monthly. Set its **lookup key** to
   `rebuilt_monthly` (or change both to match).
2. Add `STRIPE_SECRET_KEY` to `.env.local` (test key while developing).
3. Test with card `4242 4242 4242 4242`, any future expiry/CVC.
4. Go live: swap in your live secret key once your Stripe account is
   verified, and make sure the live Price has the same lookup key.

### What checkout does NOT do yet

A successful payment redirects to `/checkout/success`, which links to
`/signup` — but nothing automatically connects "this person paid" to
"this person has a Rebuilt account." That needs a **Stripe webhook**
listening for `checkout.session.completed` that creates/updates the
matching Supabase `profiles` row. Not built yet — the next real piece
of engineering once this flow is confirmed working end to end.

## Known simplifications, worth knowing about

- **The safety/red-flag intake screening was removed** from the main
  flow per a product decision — `app/intake/page.tsx` and
  `lib/redFlagQuestions.ts` still exist but aren't linked to anymore.
  Worth reconsidering before real launch — some lightweight safety
  check (even a single "cleared by a doctor?" checkbox) is meaningfully
  better than nothing for a program giving exercise guidance.
- **No "returning user" redirect on the homepage** — `/` always shows
  the marketing homepage, even to logged-in users. They navigate to
  `/program` directly (e.g., via a bookmark) rather than being
  auto-redirected. A "My Program" link in the nav for logged-in users
  would be a nice follow-up.
- **Progress/Pain log/Profile tabs are visual only** — the top nav on
  the exercise page shows all four tabs, but only "Today" is wired up.
  The underlying data (`pain_logs`, `session_logs`) already exists in
  the database from earlier — building the Progress tab is mostly UI
  work at this point.

## Next steps, in order

1. Fill in real exercise content (see "IMPORTANT" section above) — the
   single most valuable thing only Moe can do.
2. Test the full flow yourself: sign up → land on `/program` → pick a
   day → mark something complete → level up.
3. Build the Stripe webhook to connect payment to account creation.
4. Deploy to Vercel, connect the real domain.
5. Decide on bringing back some form of safety screening before real
   clients use this.
