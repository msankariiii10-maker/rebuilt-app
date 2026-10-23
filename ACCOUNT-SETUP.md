# Accounts created by payment — one-time setup

1. Supabase > SQL Editor > New query > paste `supabase/accounts-and-subscriptions.sql` > Run.
2. Vercel > your project > Settings > Environment Variables, add:
   - `SUPABASE_SERVICE_ROLE_KEY`  (Supabase > Project Settings > API > `service_role` secret)
   - `STRIPE_WEBHOOK_SECRET`      (from step 3)
   - `NEXT_PUBLIC_SITE_URL`       (e.g. https://rebuilttest.vercel.app)
   Then redeploy.
3. Stripe > Developers > Webhooks > Add endpoint
   - URL: https://YOUR-SITE/api/stripe-webhook
   - Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
   - Copy the "Signing secret" (starts with whsec_) into `STRIPE_WEBHOOK_SECRET`.
4. Supabase > Authentication > URL Configuration:
   - Site URL: https://YOUR-SITE
   - Redirect URLs: add https://YOUR-SITE/auth/callback
5. To pause the paid-members-only lock while testing, set `MEMBER_GATE=off` in Vercel (remove it to lock again).

---
## v17: Daily habits, back check-in notes, owner page
1. Supabase > SQL Editor > paste supabase/checkins.sql > Run.
2. Supabase > Authentication > Users > Add user: your owner email + a password, tick "Auto Confirm User".
3. (Optional) Vercel env var OWNER_EMAIL (defaults to mskrebuilt@gmail.com).
4. Sign in at /login with the owner account, then open /admin.
