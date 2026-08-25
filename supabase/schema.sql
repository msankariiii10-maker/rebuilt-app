-- ============================================================
-- REBUILT — Database Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- ---------- PROGRAMS ----------
-- Single program now (previously had two tracks — simplified per product decision)
create table programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,          -- 'rebuilt-program'
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- ---------- EXERCISE FAMILIES ----------
-- A movement pattern, e.g. "Good Morning", "Glute Internal Rotation"
create table exercise_families (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  target_area text,                   -- 'low_back' | 'knee' | 'hip' | 'glute' etc
  created_at timestamptz default now()
);

-- ---------- EXERCISE LEVELS ----------
-- Each family has 2-4 levels, easiest to hardest.
create table exercise_levels (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references exercise_families(id) on delete cascade,
  level int not null,                 -- 1, 2, 3, 4...
  name text not null,                 -- display name at this level, can differ slightly from family name
  sets int,
  reps int,
  hold_seconds int,                   -- for isometric holds, nullable
  instructions text,
  media_url text,                     -- filled in later once you have videos
  unique(family_id, level)
);

-- ---------- PROGRAM DAYS ----------
-- Which exercise families appear on which day, for which program.
-- day_of_week: 1=Mon .. 7=Sun (matches your Monday/Tuesday split)
create table program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references programs(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  family_id uuid references exercise_families(id) on delete cascade,
  sort_order int default 0
);

-- ---------- WEEK DAYS (display labels) ----------
-- Fixed mapping of day_of_week -> body-part label shown in the week view.
-- Not tied to a specific program since there's only one program now.
-- is_rest = true means no exercises that day (Sunday).
create table week_days (
  day_of_week int primary key check (day_of_week between 1 and 7),
  label text not null,               -- 'Lower Body' | 'Upper Body' | 'Mobility' | 'Rest'
  is_rest boolean not null default false
);

-- ---------- PROFILES ----------
-- One row per authenticated user (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  program_id uuid references programs(id),
  intake_cleared boolean default false,   -- passed red-flag screening
  intake_completed_at timestamptz,
  created_at timestamptz default now()
);

-- ---------- INTAKE SCREENINGS ----------
-- Stores the red-flag questionnaire answers for audit/liability purposes.
create table intake_screenings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  answers jsonb not null,             -- raw answers, e.g. {"unexplained_weight_loss": false, ...}
  passed boolean not null,            -- true = cleared to start a program
  created_at timestamptz default now()
);

-- ---------- USER PROGRESS ----------
-- Tracks which LEVEL a user is on, per exercise family.
-- Different families can be at different levels for the same person.
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  family_id uuid references exercise_families(id) on delete cascade,
  current_level int not null default 1,
  levelled_up_at timestamptz default now(),
  unique(user_id, family_id)
);

-- ---------- SESSION LOGS ----------
-- One row per exercise a user completes on a given day.
create table session_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  family_id uuid references exercise_families(id) on delete cascade,
  level_completed int not null,
  completed_at timestamptz default now()
);

-- ---------- PAIN LOGS ----------
-- Daily pain score, for the user's own reference (does not change the program).
create table pain_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  pain_score int not null check (pain_score between 0 and 10),
  note text,
  logged_at date not null default current_date,
  unique(user_id, logged_at)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Every table with user data is locked to that user only.
-- ============================================================
alter table profiles enable row level security;
alter table intake_screenings enable row level security;
alter table user_progress enable row level security;
alter table session_logs enable row level security;
alter table pain_logs enable row level security;

create policy "Users manage their own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users manage their own intake"
  on intake_screenings for all using (auth.uid() = user_id);

create policy "Users manage their own progress"
  on user_progress for all using (auth.uid() = user_id);

create policy "Users manage their own session logs"
  on session_logs for all using (auth.uid() = user_id);

create policy "Users manage their own pain logs"
  on pain_logs for all using (auth.uid() = user_id);

-- programs / exercise_families / exercise_levels / program_days / week_days are public read-only content
alter table programs enable row level security;
alter table exercise_families enable row level security;
alter table exercise_levels enable row level security;
alter table program_days enable row level security;
alter table week_days enable row level security;

create policy "Anyone can read programs" on programs for select using (true);
create policy "Anyone can read exercise families" on exercise_families for select using (true);
create policy "Anyone can read exercise levels" on exercise_levels for select using (true);
create policy "Anyone can read program days" on program_days for select using (true);
create policy "Anyone can read week days" on week_days for select using (true);
