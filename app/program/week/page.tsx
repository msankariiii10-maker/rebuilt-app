import { createClient } from '@/lib/supabaseServerClient';
import Link from 'next/link';

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

export default async function WeekPage() {
  const supabase = createClient();

  const { data: weekDays } = await supabase
    .from('week_days')
    .select('day_of_week, label, is_rest')
    .order('day_of_week');

  const days =
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

  return (
    <div id="screen-week" style={{ display: 'block', padding: '32px 24px', maxWidth: 480, margin: '0 auto' }}>
      <div className="week-header">
        <span className="eyebrow">This week</span>
        <h1>Pick a day</h1>
      </div>
      <div className="day-list">
        {days.map((d) =>
          d.is_rest ? (
            <div className="day-tile rest" key={d.day_of_week}>
              <div>
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
              <div>
                <div className="day-name">{DAY_NAMES[d.day_of_week]}</div>
                <div className="day-label">{d.label}</div>
              </div>
              <span className="arrow">→</span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
