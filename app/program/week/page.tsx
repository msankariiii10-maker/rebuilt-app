import { createClient } from '@/lib/supabaseServerClient';
import WeekDays from '@/components/WeekDays';

export const metadata = {
  title: 'This Week — Rebuilt',
};

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

  // The program only uses two labels: "Lower Back" and "Mobility".
  // The database still says "Lower Body" / "Upper Body" for some days, so
  // both are shown as "Lower Back". Every day stays in the list.
  const days = rawDays.map((d) =>
    d.label === 'Lower Body' || d.label === 'Upper Body' ? { ...d, label: 'Lower Back' } : d
  );

  return (
    <div className="rb-layer">
      <div className="rb-col">
        <div className="rb-eyebrow">This week</div>
        <h1 className="rb-h1">Pick a day</h1>
        <p className="rb-lede">Each session is built around one thing: a stronger, calmer lower back.</p>
        <WeekDays days={days} />
      </div>
    </div>
  );
}
