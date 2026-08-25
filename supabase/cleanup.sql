-- Run this FIRST to clear out the partial data from the failed attempt,
-- then run the corrected seed.sql fresh after this.
truncate table programs, week_days, exercise_families, exercise_levels, program_days cascade;
