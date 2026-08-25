'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

const DAY_TO_NUMBER: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const DAY_LABEL_FALLBACK: Record<number, string> = {
  1: 'Lower Body',
  2: 'Upper Body',
  3: 'Mobility',
  4: 'Lower Body',
  5: 'Upper Body',
  6: 'Mobility',
  7: 'Rest',
};

type TodayExercise = {
  family_id: string;
  family_name: string;
  current_level: number;
  level_id: string;
  level_name: string;
  sets: number | null;
  reps: number | null;
  hold_seconds: number | null;
  instructions: string | null;
  media_url: string | null;
  max_level: number;
};

export default function DayExercisePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const slug = (params.slug as string)?.toLowerCase();
  const dayOfWeek = DAY_TO_NUMBER[slug] ?? 1;

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<TodayExercise[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [dayLabel, setDayLabel] = useState(DAY_LABEL_FALLBACK[dayOfWeek]);

  useEffect(() => {
    loadDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadDay() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: weekDayRow } = await supabase
      .from('week_days')
      .select('label')
      .eq('day_of_week', dayOfWeek)
      .single();
    if (weekDayRow?.label) setDayLabel(weekDayRow.label);

    const { data: program } = await supabase
      .from('programs')
      .select('id')
      .eq('slug', 'rebuilt-program')
      .single();

    if (!program) {
      setExercises([]);
      setLoading(false);
      return;
    }

    const { data: programDays } = await supabase
      .from('program_days')
      .select('family_id, sort_order, exercise_families(id, name)')
      .eq('program_id', program.id)
      .eq('day_of_week', dayOfWeek)
      .order('sort_order');

    if (!programDays || programDays.length === 0) {
      setExercises([]);
      setLoading(false);
      return;
    }

    const familyIds = programDays.map((d: any) => d.family_id);

    const { data: progressRows } = await supabase
      .from('user_progress')
      .select('family_id, current_level')
      .eq('user_id', user.id)
      .in('family_id', familyIds);

    const progressMap = new Map((progressRows ?? []).map((r) => [r.family_id, r.current_level]));

    const { data: allLevels } = await supabase
      .from('exercise_levels')
      .select('*')
      .in('family_id', familyIds);

    const todays: TodayExercise[] = programDays.map((d: any) => {
      const currentLevel = progressMap.get(d.family_id) ?? 1;
      const levelsForFamily = (allLevels ?? []).filter((l) => l.family_id === d.family_id);
      const maxLevel = Math.max(...levelsForFamily.map((l) => l.level), 1);
      const levelRow = levelsForFamily.find((l) => l.level === currentLevel) ?? levelsForFamily[0];

      return {
        family_id: d.family_id,
        family_name: d.exercise_families.name,
        current_level: currentLevel,
        level_id: levelRow?.id,
        level_name: levelRow?.name ?? '',
        sets: levelRow?.sets ?? null,
        reps: levelRow?.reps ?? null,
        hold_seconds: levelRow?.hold_seconds ?? null,
        instructions: levelRow?.instructions ?? null,
        media_url: levelRow?.media_url ?? null,
        max_level: maxLevel,
      };
    });

    setExercises(todays);
    setLoading(false);
  }

  async function markComplete(ex: TodayExercise) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('session_logs').insert({
      user_id: user.id,
      family_id: ex.family_id,
      level_completed: ex.current_level,
    });

    setCompletedToday((prev) => new Set(prev).add(ex.family_id));
  }

  async function levelUp(ex: TodayExercise) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (ex.current_level >= ex.max_level) return;

    await supabase.from('user_progress').upsert({
      user_id: user.id,
      family_id: ex.family_id,
      current_level: ex.current_level + 1,
      levelled_up_at: new Date().toISOString(),
    });

    loadDay();
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading today&apos;s session…
      </div>
    );
  }

  const dayName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '';

  return (
    <div id="screen-dashboard" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      <div className="dash-top">
        <Link href="/program/week" className="back-btn" aria-label="Back to week view">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="dash-logo">Rebuilt</span>
        <span className="dash-day">{dayName.toUpperCase()}</span>
      </div>

      <div className="top-nav-tabs">
        <div className="tab active">Today</div>
        <div className="tab">Progress</div>
        <div className="tab">Pain log</div>
        <div className="tab">Profile</div>
      </div>

      <div className="dash-body">
        <div className="dash-title-row">
          <h2>{dayLabel}</h2>
          {exercises.length > 0 && <p>{exercises.length} exercises today</p>}
        </div>

        {exercises.length === 0 && (
          <p style={{ padding: '0 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
            No exercises scheduled for this day yet.
          </p>
        )}

        {exercises.length > 0 && (
          <>
            <div className="ex-carousel" id="carousel">
              {exercises.map((ex) => (
                <div className="ex-card" key={ex.family_id}>
                  <div className="ex-card-media">
                    <div className="ex-play">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#F8F0EE">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ex-card-body">
                    <h4>{ex.family_name}</h4>
                    <p>
                      Level {ex.current_level} of {ex.max_level}
                      {ex.sets && ` · ${ex.sets} sets`}
                      {ex.reps && ` × ${ex.reps} reps`}
                      {ex.hold_seconds && ` (hold ${ex.hold_seconds}s)`}
                    </p>
                    <div className="ex-card-actions">
                      <div
                        className={`btn-xs primary`}
                        style={completedToday.has(ex.family_id) ? { opacity: 0.5 } : undefined}
                        onClick={() => !completedToday.has(ex.family_id) && markComplete(ex)}
                      >
                        {completedToday.has(ex.family_id) ? '✓ Done' : 'Mark complete'}
                      </div>
                      {ex.current_level < ex.max_level && (
                        <div className="btn-xs" onClick={() => levelUp(ex)}>
                          Next level →
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="dots">
              {exercises.map((_, i) => (
                <div className={`dot${i === 0 ? ' active' : ''}`} key={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
