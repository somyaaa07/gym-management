import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import usePageMeta from '../../lib/usePageMeta.js';
import { memberDashboardApi } from '../../lib/api.js';
import { EmptyState, Badge } from '../../components/ui/Misc.jsx';

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const shift = (key, n) => {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + n, 1));
};
const clock = (d) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '');
const dayLabel = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
const spent = (a, b) => {
  const mins = Math.round((new Date(b) - new Date(a)) / 60000);
  return mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '';
};

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="font-display text-4xl text-bone-100 leading-none mt-2 tabular">{value}</p>
    </div>
  );
}

export default function MyAttendance() {
  usePageMeta('My attendance', '');
  const thisMonth = monthKey(new Date());
  const [month, setMonth] = useState(thisMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    memberDashboardApi
      .attendance(month)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load attendance'))
      .finally(() => setLoading(false));
  }, [month]);

  const [y, m] = month.split('-').map(Number);
  const records = data?.records || [];
  const attended = new Set(records.map((r) => new Date(r.check_in_time).getDate()));
  const daysInMonth = new Date(y, m, 0).getDate();
  const blanks = new Date(y, m - 1, 1).getDay();
  const label = new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Month switcher */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl text-bone-100 leading-none">{label}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth(shift(month, -1))}
            className="p-2 rounded-xl border border-ink-700 text-ink-400 hover:text-bone-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setMonth(shift(month, 1))}
            disabled={month >= thisMonth}
            className="p-2 rounded-xl border border-ink-700 text-ink-400 hover:text-bone-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">{error}</p>}

      <div className={`space-y-6 transition-opacity ${loading ? 'opacity-50' : ''}`}>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Visits this month" value={data?.summary?.visits_this_month ?? 0} />
          <Stat label="Days attended" value={data?.summary?.days_attended ?? 0} />
          <Stat label="All-time visits" value={data?.summary?.total_visits ?? 0} />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Calendar */}
          <section className="lg:col-span-2 rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5 h-fit">
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-ink-400 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: blanks }).map((_, i) => <span key={`b${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <span
                  key={d}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs tabular ${
                    attended.has(d) ? 'bg-volt-500 text-white font-medium' : 'text-ink-400 bg-ink-700/40'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </section>

          {/* List */}
          <section className="lg:col-span-3">
            {records.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title={loading ? 'Loading...' : 'No visits this month'}
                description="Your check-ins will show up here."
              />
            ) : (
              <ul className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft divide-y divide-ink-700">
                {records.map((r) => (
                  <li key={r.id} className="flex items-center justify-between flex-wrap gap-2 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-bone-100">{dayLabel(r.check_in_time)}</span>
                      {r.check_in_status && <Badge>{String(r.check_in_status).replace('_', ' ')}</Badge>}
                      {r.check_out_status === 'EARLY_LEAVE' && <Badge>EARLY LEAVE</Badge>}
                    </div>
                    <span className="text-xs text-ink-400 tabular">
                      {clock(r.check_in_time)}
                      {r.check_out_time ? ` to ${clock(r.check_out_time)}` : ''}
                      {r.check_out_time && spent(r.check_in_time, r.check_out_time)
                        ? ` · ${spent(r.check_in_time, r.check_out_time)}`
                        : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}