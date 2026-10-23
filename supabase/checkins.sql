-- Rebuilt: daily check-ins (back feeling + note + habits). Run once in Supabase > SQL Editor.
create table if not exists public.checkins (
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null,
  pain_score smallint check (pain_score between 0 and 10),
  note       text check (char_length(note) <= 400),
  share_ok   boolean not null default false,
  habits     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.checkins enable row level security;

drop policy if exists "checkins select own" on public.checkins;
drop policy if exists "checkins insert own" on public.checkins;
drop policy if exists "checkins update own" on public.checkins;

create policy "checkins select own" on public.checkins for select using (auth.uid() = user_id);
create policy "checkins insert own" on public.checkins for insert with check (auth.uid() = user_id);
create policy "checkins update own" on public.checkins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Members can only ever see their own rows. The owner page reads everything on the server with the service role key.
