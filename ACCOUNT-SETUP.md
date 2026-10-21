# Accounts created by payment — one-time setup

1. Supabase > SQL Editor > New query > paste `supabase/accounts-and-subscriptions.sql` > Run.
2. Vercel > your project > Settings > Environment Variables, add:
   - `SUPABASE_SERVICE_ROLE_KEY`  (Supabase > Project Settings > API > `service_role` secret)
   - `STRIPE_WEBHOOK_SECRET`      (from step 3; the name must be exactly this, in capitals)
   - `NEXT_PUBLIC_SITE_URL`       (https://mskrebuilt.com)
   Then redeploy.
3. Stripe > Developers > Webhooks > Add endpoint
   - URL: https://mskrebuilt.com/api/stripe-webhook
   - Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
   - Copy the "Signing secret" (starts with whsec_) into `STRIPE_WEBHOOK_SECRET`.
4. Supabase > Authentication > URL Configuration:
   - Site URL: https://mskrebuilt.com
   - Redirect URLs: add https://mskrebuilt.com/auth/callback (keep https://rebuilttest.vercel.app/auth/callback too)
5. To pause the paid-members-only lock while testing, set `MEMBER_GATE=off` in Vercel (remove it to lock again).
