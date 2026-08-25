-- ============================================================
-- REBUILT — Seed Data (v2: single program, body-part day labels)
-- Run AFTER schema.sql.
--
-- IMPORTANT CONTENT NOTE:
-- All of Moe's real documented exercises (from the original
-- Monday/Tuesday/Thursday/Friday split) are lower-body / posterior-chain
-- focused — there is no real "Upper Body" or "Mobility" content yet.
-- Those two day labels are seeded with clearly-marked PLACEHOLDER
-- exercises so the app doesn't show empty days. Replace them with real
-- content before launch, or remap which real exercises go where.
-- ============================================================

-- ---------- PROGRAM ----------
insert into programs (slug, name, description) values
  ('rebuilt-program', 'Rebuilt Program', 'A progressive strength recovery program built from real recovery experience.');

-- ---------- WEEK DAYS (display labels for the week view) ----------
insert into week_days (day_of_week, label, is_rest) values
  (1, 'Lower Body', false),   -- Monday
  (2, 'Upper Body', false),   -- Tuesday
  (3, 'Mobility', false),     -- Wednesday
  (4, 'Lower Body', false),   -- Thursday
  (5, 'Upper Body', false),   -- Friday
  (6, 'Mobility', false),     -- Saturday
  (7, 'Rest', true);          -- Sunday

-- ---------- EXERCISE FAMILIES ----------
-- REAL content: Moe's actual documented lower-body / posterior-chain work
insert into exercise_families (slug, name, target_area) values
  ('tibialis-raise', 'Tibialis Anterior Raise', 'knee'),
  ('calf-raise', 'Calf Raise', 'knee'),
  ('seated-squat', 'Seated Squat (Supported)', 'knee'),
  ('leg-extension', 'Leg Extension', 'knee'),
  ('elephant-walk', 'Elephant Walk', 'knee'),
  ('glute-internal-rotation', 'Glute Internal Rotation Lift', 'glute'),
  ('glute-internal-rotation-abduction', 'Internal Rotation + Abduction', 'glute'),
  ('straight-leg-abduction', 'Straight Leg Abduction Lift', 'glute'),
  ('pigeon-bench', 'Pigeon Strength (Bench)', 'glute'),
  ('reverse-hyper', 'Reverse Hyper', 'low_back'),
  ('butterfly-adductor', 'Butterfly (Adductors, Weighted)', 'knee'),
  ('backward-walk', 'Backward Walking', 'low_back'),
  ('side-back-extension', 'Side Back Extension', 'low_back'),
  ('good-morning', 'Good Morning', 'low_back'),
  ('hip-flexor-raise', 'Hip Flexor Raise (Weighted)', 'hip'),
  ('front-kick', 'Front Kick (Hip Flexed)', 'hip'),
  ('split-squat-hip-flexor', 'Split Squat (Hip Flexor Focus)', 'hip');

-- PLACEHOLDER content: no real Upper Body or Mobility exercises documented
-- yet. TODO — replace with real content and instructions.
insert into exercise_families (slug, name, target_area) values
  ('placeholder-upper-1', 'TODO: Upper Body Exercise 1', 'upper_body'),
  ('placeholder-upper-2', 'TODO: Upper Body Exercise 2', 'upper_body'),
  ('placeholder-upper-3', 'TODO: Upper Body Exercise 3', 'upper_body'),
  ('placeholder-mobility-1', 'TODO: Mobility Exercise 1', 'mobility'),
  ('placeholder-mobility-2', 'TODO: Mobility Exercise 2', 'mobility'),
  ('placeholder-mobility-3', 'TODO: Mobility Exercise 3', 'mobility');

-- ---------- EXERCISE LEVELS ----------
insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='tibialis-raise'), 1, 'Tibialis Raise — Assisted', 2, 10, 'TODO: describe easiest version'),
  ((select id from exercise_families where slug='tibialis-raise'), 2, 'Tibialis Raise — Bodyweight', 3, 15, 'TODO: describe bodyweight version'),
  ((select id from exercise_families where slug='tibialis-raise'), 3, 'Tibialis Raise — Current', 3, 20, 'Standard tibialis anterior raise, full range.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='calf-raise'), 1, 'Calf Raise — Supported', 2, 10, 'TODO'),
  ((select id from exercise_families where slug='calf-raise'), 2, 'Calf Raise — Bodyweight', 3, 15, 'TODO'),
  ((select id from exercise_families where slug='calf-raise'), 3, 'Calf Raise — Current', 3, 20, 'Standard calf raise.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='seated-squat'), 1, 'Seated Squat — Assisted', 2, 8, 'TODO'),
  ((select id from exercise_families where slug='seated-squat'), 2, 'Seated Squat — Current', 3, 12, 'Supported seated squat, control the descent.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='leg-extension'), 1, 'Leg Extension — Light', 2, 10, 'TODO'),
  ((select id from exercise_families where slug='leg-extension'), 2, 'Leg Extension — Current', 3, 15, 'Standard leg extension.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='elephant-walk'), 1, 'Elephant Walk — Small Range', 2, 8, 'TODO'),
  ((select id from exercise_families where slug='elephant-walk'), 2, 'Elephant Walk — Current', 3, 10, 'Full range elephant walk.');

insert into exercise_levels (family_id, level, name, sets, reps, hold_seconds, instructions) values
  ((select id from exercise_families where slug='glute-internal-rotation'), 1, 'Internal Rotation — Small Range', 1, 8, 20, 'TODO'),
  ((select id from exercise_families where slug='glute-internal-rotation'), 2, 'Internal Rotation — Current', 1, 10, 30, 'Part of glute drop set, hold 30 sec.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='glute-internal-rotation-abduction'), 1, 'IR + Abduction — Small Range', 1, 8, 'TODO'),
  ((select id from exercise_families where slug='glute-internal-rotation-abduction'), 2, 'IR + Abduction — Current', 1, 12, 'Second exercise in the glute drop set.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='straight-leg-abduction'), 1, 'Straight Leg Abduction — Small Range', 1, 8, 'TODO'),
  ((select id from exercise_families where slug='straight-leg-abduction'), 2, 'Straight Leg Abduction — Current', 1, 12, 'Third exercise in the glute drop set.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='pigeon-bench'), 1, 'Pigeon Strength — Gentle', 2, 8, 'TODO'),
  ((select id from exercise_families where slug='pigeon-bench'), 2, 'Pigeon Strength — Current', 3, 10, 'Pigeon position on bench, strength focus.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='reverse-hyper'), 1, 'Reverse Hyper — Bodyweight, Small Range', 2, 10, 'TODO — this is a later-stage exercise, introduce carefully'),
  ((select id from exercise_families where slug='reverse-hyper'), 2, 'Reverse Hyper — Current', 3, 12, 'Full range reverse hyper.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='butterfly-adductor'), 1, 'Butterfly — Bodyweight', 2, 10, 'TODO'),
  ((select id from exercise_families where slug='butterfly-adductor'), 2, 'Butterfly — Weighted (Current)', 3, 15, 'Weighted butterfly for adductors.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='backward-walk'), 1, 'Backward Walking — 2 min', 1, null, '2 minutes, slow and controlled.'),
  ((select id from exercise_families where slug='backward-walk'), 2, 'Backward Walking — Current', 1, null, '5 minutes backward walking.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='side-back-extension'), 1, 'Side Back Extension — Small Range', 2, 8, 'TODO'),
  ((select id from exercise_families where slug='side-back-extension'), 2, 'Side Back Extension — Current', 3, 10, '3 sets, current version.');

insert into exercise_levels (family_id, level, name, sets, reps, hold_seconds, instructions) values
  ((select id from exercise_families where slug='good-morning'), 1, 'Good Morning — Bodyweight, Small Range', 2, 8, null, 'TODO — later-stage exercise, introduce carefully'),
  ((select id from exercise_families where slug='good-morning'), 2, 'Good Morning — Current', 3, null, 30, '3 sets, 30 sec holds, current version.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='hip-flexor-raise'), 1, 'Hip Flexor Raise — No Weight', 2, 10, 'TODO'),
  ((select id from exercise_families where slug='hip-flexor-raise'), 2, 'Hip Flexor Raise — Weighted (Current)', 3, 12, 'Weighted hip flexor raise.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='front-kick'), 1, 'Front Kick — Small Range', 2, 8, 'TODO'),
  ((select id from exercise_families where slug='front-kick'), 2, 'Front Kick — Current', 3, 10, 'Leg extended, hip flexed, current version.');

insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='split-squat-hip-flexor'), 1, 'Split Squat — Assisted', 2, 6, 'TODO'),
  ((select id from exercise_families where slug='split-squat-hip-flexor'), 2, 'Split Squat — Current', 3, 8, 'Hip flexor focused split squat.');

-- PLACEHOLDER levels for Upper Body / Mobility
insert into exercise_levels (family_id, level, name, sets, reps, instructions) values
  ((select id from exercise_families where slug='placeholder-upper-1'), 1, 'TODO: Level 1', 2, 10, 'TODO: add real Upper Body exercise content'),
  ((select id from exercise_families where slug='placeholder-upper-2'), 1, 'TODO: Level 1', 2, 10, 'TODO: add real Upper Body exercise content'),
  ((select id from exercise_families where slug='placeholder-upper-3'), 1, 'TODO: Level 1', 2, 10, 'TODO: add real Upper Body exercise content'),
  ((select id from exercise_families where slug='placeholder-mobility-1'), 1, 'TODO: Level 1', 2, 10, 'TODO: add real Mobility exercise content'),
  ((select id from exercise_families where slug='placeholder-mobility-2'), 1, 'TODO: Level 1', 2, 10, 'TODO: add real Mobility exercise content'),
  ((select id from exercise_families where slug='placeholder-mobility-3'), 1, 'TODO: Level 1', 2, 10, 'TODO: add real Mobility exercise content');

-- ============================================================
-- PROGRAM DAYS — which families show up on which day
-- day_of_week: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun (no entries — rest)
-- ============================================================

-- Monday & Thursday = Lower Body (real content, full set)
insert into program_days (program_id, day_of_week, family_id, sort_order)
select (select id from programs where slug='rebuilt-program'), d.day, ef.id, f.sort_order
from (values (1), (4)) as d(day)
cross join (values
  ('tibialis-raise', 1), ('calf-raise', 2), ('seated-squat', 3), ('leg-extension', 4),
  ('elephant-walk', 5), ('glute-internal-rotation', 6), ('glute-internal-rotation-abduction', 7),
  ('straight-leg-abduction', 8), ('pigeon-bench', 9), ('reverse-hyper', 10), ('butterfly-adductor', 11),
  ('backward-walk', 12), ('side-back-extension', 13), ('good-morning', 14),
  ('hip-flexor-raise', 15), ('front-kick', 16), ('split-squat-hip-flexor', 17)
) as f(slug, sort_order)
join exercise_families ef on ef.slug = f.slug;

-- Tuesday & Friday = Upper Body (placeholder content)
insert into program_days (program_id, day_of_week, family_id, sort_order)
select (select id from programs where slug='rebuilt-program'), d.day, ef.id, f.sort_order
from (values (2), (5)) as d(day)
cross join (values
  ('placeholder-upper-1', 1), ('placeholder-upper-2', 2), ('placeholder-upper-3', 3)
) as f(slug, sort_order)
join exercise_families ef on ef.slug = f.slug;

-- Wednesday & Saturday = Mobility (placeholder content)
insert into program_days (program_id, day_of_week, family_id, sort_order)
select (select id from programs where slug='rebuilt-program'), d.day, ef.id, f.sort_order
from (values (3), (6)) as d(day)
cross join (values
  ('placeholder-mobility-1', 1), ('placeholder-mobility-2', 2), ('placeholder-mobility-3', 3)
) as f(slug, sort_order)
join exercise_families ef on ef.slug = f.slug;

-- Sunday (day 7) — intentionally no program_days rows. Rest day.
