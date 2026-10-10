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

type PainLogEntry = { logged_at: string; pain_score: number };

type Tab = 'today' | 'progress' | 'painlog' | 'profile';

export default function DayExercisePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const slug = (params.slug as string)?.toLowerCase();
  const dayOfWeek = DAY_TO_NUMBER[slug] ?? 1;

  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<TodayExercise[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [dayLabel, setDayLabel] = useState(DAY_LABEL_FALLBACK[dayOfWeek]);

  // Progress tab state
  const [statTotal, setStatTotal] = useState(0);
  const [statStreak, setStatStreak] = useState(0);
  const [statWeek, setStatWeek] = useState(0);
  const [statPainAvg, setStatPainAvg] = useState<string>('—');

  // Pain log tab state
  const [painInput, setPainInput] = useState('');
  const [painLogs, setPainLogs] = useState<PainLogEntry[]>([]);

  // Profile tab state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

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

  // ---------- Tab switching ----------
  function switchTab(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'progress') loadProgress();
    if (tab === 'painlog') loadPainLogs();
    if (tab === 'profile') loadProfile();
  }

  // ---------- Progress ----------
  async function loadProgress() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sessions } = await supabase
      .from('session_logs')
      .select('completed_at')
      .eq('user_id', user.id);

    const total = sessions?.length ?? 0;
    setStatTotal(total);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const thisWeekCount = (sessions ?? []).filter((s) => new Date(s.completed_at) >= weekAgo).length;
    setStatWeek(thisWeekCount);

    // streak: consecutive days with at least 1 session, counting back from today
    const uniqueDates = [
      ...new Set((sessions ?? []).map((s) => new Date(s.completed_at).toISOString().slice(0, 10))),
    ]
      .sort()
      .reverse();
    let streak = 0;
    const cursor = new Date();
    for (const d of uniqueDates) {
      const cursorStr = cursor.toISOString().slice(0, 10);
      if (d === cursorStr) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    setStatStreak(streak);

    const { data: recentPain } = await supabase
      .from('pain_logs')
      .select('pain_score, logged_at')
      .eq('user_id', user.id)
      .gte('logged_at', weekAgo.toISOString().slice(0, 10));

    if (recentPain && recentPain.length > 0) {
      const avg = recentPain.reduce((sum, l) => sum + l.pain_score, 0) / recentPain.length;
      setStatPainAvg(avg.toFixed(1));
    } else {
      setStatPainAvg('—');
    }
  }

  // ---------- Pain log ----------
  async function loadPainLogs() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('pain_logs')
      .select('logged_at, pain_score')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(30);

    setPainLogs(data ?? []);
  }

  async function logPain() {
    const val = parseInt(painInput, 10);
    if (isNaN(val) || val < 0 || val > 10) {
      alert('Enter a pain score between 0 and 10');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);

    await supabase
      .from('pain_logs')
      .upsert({ user_id: user.id, logged_at: today, pain_score: val }, { onConflict: 'user_id,logged_at' });

    setPainInput('');
    loadPainLogs();
  }

  // ---------- Profile ----------
  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setProfileEmail(user.email ?? '');

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    setProfileName(profile?.full_name ?? '');
  }

  async function saveProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({ full_name: profileName }).eq('id', user.id);
    alert('Saved!');
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 70px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: 14,
          gap: 10,
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            border: '2px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        Loading today&apos;s session…
        <style>{`@keyframes spin{ to{ transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  const dayName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '';

  return (
    <div id="screen-dashboard" style={{ minHeight: 'calc(100vh - 70px)' }}>
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
        <div className={`tab${activeTab === 'today' ? ' active' : ''}`} onClick={() => switchTab('today')}>
          Today
        </div>
        <div className={`tab${activeTab === 'progress' ? ' active' : ''}`} onClick={() => switchTab('progress')}>
          Progress
        </div>
        <div className={`tab${activeTab === 'painlog' ? ' active' : ''}`} onClick={() => switchTab('painlog')}>
          Pain log
        </div>
        <div className={`tab${activeTab === 'profile' ? ' active' : ''}`} onClick={() => switchTab('profile')}>
          Profile
        </div>
      </div>

      <div className="dash-body">
        {activeTab === 'today' && (
          <div className="tab-panel">
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
                  {exercises.map((ex, i) => (
                    <div className="ex-card ex-card-enter" style={{ animationDelay: `${i * 0.08}s` }} key={ex.family_id}>
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
                            className="btn-xs primary"
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
        )}

        {activeTab === 'progress' && (
          <div className="tab-panel">
            <div className="dash-title-row">
              <h2>Your progress</h2>
              <p>Based on sessions you&apos;ve marked complete</p>
            </div>
            <div className="stat-grid">
              <div className="stat-box">
                <div className="num">{statTotal}</div>
                <div className="lbl">Sessions completed</div>
              </div>
              <div className="stat-box">
                <div className="num">{statStreak}</div>
                <div className="lbl">Day streak</div>
              </div>
            </div>
            <div className="stat-grid">
              <div className="stat-box">
                <div className="num">{statWeek}</div>
                <div className="lbl">This week</div>
              </div>
              <div className="stat-box">
                <div className="num">{statPainAvg}</div>
                <div className="lbl">Avg pain (7 days)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'painlog' && (
          <div className="tab-panel">
            <div className="dash-title-row">
              <h2>Pain log</h2>
              <p>Track how you&apos;re feeling day to day</p>
            </div>
            <div className="pain-form">
              <input
                type="number"
                min={0}
                max={10}
                placeholder="Pain 0–10 today"
                value={painInput}
                onChange={(e) => setPainInput(e.target.value)}
              />
              <button className="profile-save" style={{ margin: 0 }} onClick={logPain}>
                Log
              </button>
            </div>
            <div className="pain-log-list">
              {painLogs.length === 0 && <p className="pain-empty">No pain logged yet — enter today&apos;s score above.</p>}
              {painLogs.map((l) => {
                const cls = l.pain_score <= 3 ? 'low' : l.pain_score <= 6 ? 'mid' : 'high';
                const d = new Date(l.logged_at + 'T00:00:00');
                const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div className="pain-log-item" key={l.logged_at}>
                    <span className={`score ${cls}`}>{l.pain_score}/10</span>
                    <span className="date">{dateStr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="tab-panel">
            <div className="dash-title-row">
              <h2>Profile</h2>
              <p>Your account details</p>
            </div>
            <div className="profile-field">
              <label>Name</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="profile-field">
              <label>Email</label>
              <input type="email" value={profileEmail} disabled placeholder="you@example.com" />
            </div>
            <button className="profile-save" onClick={saveProfile}>
              Save
            </button>
            <button className="profile-signout" onClick={signOut}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
