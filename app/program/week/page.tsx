import { createClient } from '@/lib/supabaseServerClient';
import Link from 'next/link';
import RevealAnimations from '@/components/RevealAnimations';

export const metadata = {
  title: 'This Week — Rebuilt',
};

const DAY_SLUGS: Record<number, string> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday',
};

const DAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

function DayIcon({ label }: { label: string }) {
  if (label === 'Lower Back') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 3v6l-2 5v7M16 3v6l2 5v7" />
        <path d="M6 21h4M14 21h4" />
      </svg>
    );
  }
  if (label === 'Upper Body') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="6.5" cy="12" r="2.5" />
        <circle cx="17.5" cy="12" r="2.5" />
        <path d="M9 12h6M4 9v6M20 9v6" />
      </svg>
    );
  }
  if (label === 'Mobility') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12a9 9 0 11-3.5-7.1" />
        <path d="M21 3v5h-5" />
      </svg>
    );
  }
  // Rest
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
    </svg>
  );
}

export default async function WeekPage() {
  const supabase = createClient();

  const { data: weekDays } = await supabase
    .from('week_days')
    .select('day_of_week, label, is_rest')
    .order('day_of_week');

  const rawDays =
    weekDays && weekDays.length > 0
      ? weekDays
      : [
          { day_of_week: 1, label: 'Lower Body', is_rest: false },
          { day_of_week: 2, label: 'Upper Body', is_rest: false },
          { day_of_week: 3, label: 'Mobility', is_rest: false },
          { day_of_week: 4, label: 'Lower Body', is_rest: false },
          { day_of_week: 5, label: 'Upper Body', is_rest: false },
          { day_of_week: 6, label: 'Mobility', is_rest: false },
          { day_of_week: 7, label: 'Rest', is_rest: true },
        ];

  // The program is Lower Back + Mobility only: show "Lower Body" as
  // "Lower Back" and hide the Upper Body days.
  const days = rawDays
    .filter((d) => d.label !== 'Upper Body')
    .map((d) => (d.label === 'Lower Body' ? { ...d, label: 'Lower Back' } : d));

  return (
    <>
      <RevealAnimations />
      <div id="screen-week" style={{ display: 'block', maxWidth: 480, margin: '0 auto' }}>
        <div className="week-header reveal">
          <span className="eyebrow">This week</span>
          <h1>Pick a day</h1>
        </div>
        <div className="day-list reveal-stagger">
          {days.map((d) =>
            d.is_rest ? (
              <div className="day-tile rest" key={d.day_of_week}>
                <div className="day-icon">
                  <DayIcon label={d.label} />
                </div>
                <div className="day-tile-text">
                  <div className="day-name">{DAY_NAMES[d.day_of_week]}</div>
                  <div className="day-label">{d.label}</div>
                </div>
              </div>
            ) : (
              <Link
                href={`/program/day/${DAY_SLUGS[d.day_of_week]}`}
                className="day-tile"
                key={d.day_of_week}
                style={{ textDecoration: 'none' }}
              >
                <div className="day-icon">
                  <DayIcon label={d.label} />
                </div>
                <div className="day-tile-text">
                  <div className="day-name">{DAY_NAMES[d.day_of_week]}</div>
                  <div className="day-label">{d.label}</div>
                </div>
                <span className="arrow">→</span>
              </Link>
            )
          )}
        </div>
      </div>
    </>
  );
}
