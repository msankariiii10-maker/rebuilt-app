-- ============================================================
-- REBUILT — accounts created by payment
-- Run this ONCE in the Supabase SQL editor (Dashboard > SQL Editor > New query).
-- Safe to run twice.
-- ============================================================

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,  -- filled in right after the account is created
  email text not null,                                              -- always stored lowercase
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'incomplete',                        -- active | trialing | past_due | canceled | ...
  current_period_end timestamptz,
  password_set boolean not null default false,                      -- true once the customer chose their password
  preexisting boolean not null default false,                       -- true if this email already had an account before paying
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_email_key on subscriptions (email);
create index if not exists subscriptions_customer_idx on subscriptions (stripe_customer_id);
create index if not exists subscriptions_subscription_idx on subscriptions (stripe_subscription_id);

alter table subscriptions enable row level security;

-- A logged-in customer may READ their own row (the site uses this to check they are subscribed).
-- Nobody can insert / update / delete from the browser. Only the server (service role key) writes here.
drop policy if exists "Users read their own subscription" on subscriptions;
create policy "Users read their own subscription"
  on subscriptions for select using (auth.uid() = user_id);
