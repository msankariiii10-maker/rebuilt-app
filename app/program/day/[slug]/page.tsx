'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';
import { useScene } from '@/components/SceneShell';

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
  1: 'Lower Back',
  2: 'Lower Back',
  3: 'Mobility',
  4: 'Lower Back',
  5: 'Lower Back',
  6: 'Mobility',
  7: 'Rest',
};


const SIL: Record<string, string> = {
  ext: '<g class="tor"><circle class="h" cx="34" cy="14" r="6"/><path class="b" d="M34 22 L34 52"/><path class="b acc" d="M34 28 L24 40 M34 28 L44 40"/></g><path class="b" d="M34 52 L28 78 M34 52 L42 78"/>',
  lift: '<circle class="h" cx="34" cy="14" r="6"/><path class="b" d="M34 22 L34 52"/><path class="b" d="M34 28 L24 42 M34 28 L44 42"/><g class="lg"><path class="b acc" d="M34 52 L40 78"/></g><path class="b" d="M34 52 L28 78"/>',
  walk: '<circle class="h" cx="34" cy="14" r="6"/><path class="b" d="M34 22 L34 52"/><path class="b" d="M34 28 L26 44 M34 28 L42 44"/><g class="lgA"><path class="b acc" d="M34 52 L34 78"/></g><g class="lgB"><path class="b" d="M34 52 L34 78"/></g>',
  twist: '<g class="tor"><circle class="h" cx="34" cy="14" r="6"/><path class="b" d="M34 22 L34 52"/><path class="b acc" d="M22 32 L46 32"/></g><path class="b" d="M34 52 L28 78 M34 52 L42 78"/>',
};

// picks which little animated figure to show for an exercise, from its name
function silhouetteFor(name: string): 'ext' | 'lift' | 'walk' | 'twist' {
  const n = name.toLowerCase();
  if (n.includes('walk')) return 'walk';
  if (n.includes('extension') || n.includes('good morning') || n.includes('hyper')) return 'ext';
  if (n.includes('rotation') || n.includes('cat') || n.includes('twist') || n.includes('mobility')) return 'twist';
  return 'lift';
}

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

type Tab = 'today' | 'progress' | 'painlog';

export default function DayExercisePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const scene = useScene();
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
    // the camera pulls back from the lumbar close-up and settles beside the exercises
    scene.shot('session', 1500);
    scene.align(1, 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadDay() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // No login wall: anyone who paid can open the days. If someone happens to
    // be signed in we also load their saved levels; otherwise everyone starts
    // at level 1.

    const { data: weekDayRow } = await supabase
      .from('week_days')
      .select('label')
      .eq('day_of_week', dayOfWeek)
      .single();
    if (weekDayRow?.label) setDayLabel(weekDayRow.label === 'Lower Body' || weekDayRow.label === 'Upper Body' ? 'Lower Back' : weekDayRow.label);

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

    const { data: progressRows } = user
      ? await supabase
          .from('user_progress')
          .select('family_id, current_level')
          .eq('user_id', user.id)
          .in('family_id', familyIds)
      : { data: [] as { family_id: string; current_level: number }[] };

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
    // Show it as done straight away; save it to the account only if signed in.
    setCompletedToday((prev) => new Set(prev).add(ex.family_id));
    scene.burst(0.8);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('session_logs').insert({
      user_id: user.id,
      family_id: ex.family_id,
      level_completed: ex.current_level,
    });
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

  const dayName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '';
  const total = exercises.length;
  const done = exercises.filter((e) => completedToday.has(e.family_id)).length;

  // progress line: grows down to the last completed exercise
  const exRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fillH, setFillH] = useState(0);
  useLayoutEffect(() => {
    let last = -1;
    exercises.forEach((e, i) => {
      if (completedToday.has(e.family_id)) last = i;
    });
    const el = last >= 0 ? exRefs.current[last] : null;
    setFillH(el ? el.offsetTop : 0);
  }, [completedToday, exercises, activeTab, loading]);

  useEffect(() => {
    if (total > 0 && done === total) scene.burst(1.6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, total]);

  return (
    <div className="rb-layer">
      <div className="rb-col wide">
        <Link href="/program/week" className="rb-back">
          ← Days
        </Link>

        <div className="rb-tabs">
          <div className={`rb-tab${activeTab === 'today' ? ' active' : ''}`} onClick={() => switchTab('today')}>
            Today
          </div>
          <div className={`rb-tab${activeTab === 'progress' ? ' active' : ''}`} onClick={() => switchTab('progress')}>
            Progress
          </div>
          <div className={`rb-tab${activeTab === 'painlog' ? ' active' : ''}`} onClick={() => switchTab('painlog')}>
            Pain log
          </div>
        </div>

        {activeTab === 'today' && (
          <div>
            <h2 className="rb-title">{dayLabel}</h2>

            {loading && (
              <div className="rb-loading">
                <i /> Loading today&apos;s session…
              </div>
            )}

            {!loading && exercises.length === 0 && <p className="rb-empty">No exercises scheduled for this day yet.</p>}

            {!loading && exercises.length > 0 && (
              <>
                <div className="rb-meter">
                  {dayName} · {done === total ? <b>SESSION COMPLETE</b> : (
                    <>
                      <b>{done}</b> OF <b>{total}</b> EXERCISES
                    </>
                  )}
                </div>
                <div className="rb-bar">
                  <i style={{ width: `${(done / total) * 100}%` }} />
                </div>

                <div className="rb-timeline">
                  <div className="rb-track" />
                  <div className="rb-fill" style={{ height: fillH }} />
                  {exercises.map((ex, i) => {
                    const isDone = completedToday.has(ex.family_id);
                    const kind = silhouetteFor(ex.family_name);
                    return (
                      <div
                        className={`rb-ex${isDone ? ' done' : ''}`}
                        style={{ animationDelay: `${0.3 + i * 0.12}s` }}
                        key={ex.family_id}
                        ref={(el) => {
                          exRefs.current[i] = el;
                        }}
                      >
                        <button
                          className="rb-node"
                          aria-label={isDone ? 'Completed' : 'Mark complete'}
                          onClick={() => !isDone && markComplete(ex)}
                        >
                          <svg className="ring" viewBox="0 0 42 42">
                            <circle cx="21" cy="21" r="20" />
                          </svg>
                          <span className="no">{String(i + 1).padStart(2, '0')}</span>
                          <svg className="chk" width="16" height="16" viewBox="0 0 16 16">
                            <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div className="rb-card">
                          <div className="k">Exercise {String(i + 1).padStart(2, '0')}</div>
                          <div className="n">{ex.family_name}</div>
                          <div className="m">
                            Level {ex.current_level} of {ex.max_level}
                            {ex.sets && ` · ${ex.sets} sets`}
                            {ex.reps && ` × ${ex.reps} reps`}
                            {ex.hold_seconds && ` (hold ${ex.hold_seconds}s)`}
                          </div>
                          {ex.current_level < ex.max_level && (
                            <button className="lvl" onClick={() => levelUp(ex)}>
                              Next level →
                            </button>
                          )}
                          <div className={`rb-sil ${kind}`} aria-hidden="true">
                            <svg viewBox="0 0 68 84" dangerouslySetInnerHTML={{ __html: SIL[kind] }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
      </div>
    </div>
  );
}
