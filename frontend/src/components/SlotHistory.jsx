import { Clock, History } from 'lucide-react';
import { EmptyState, Badge } from './ui/Misc';

const hhmm = (t) => (t ? String(t).slice(0, 5) : '—');
const when = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const duration = (start, end) => {
  const toMin = (t) => {
    const [h, m] = String(t).split(':');
    return Number(h) * 60 + Number(m);
  };
  let diff = toMin(end) - toMin(start);
  if (diff < 0) diff += 24 * 60; // overnight slot
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
};

// current: the active slot row (or null), history: array of replaced slot rows.
// Both come from the /member-dashboard response, so no id or extra API call is needed.
export default function SlotHistory({ current, history = [] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-6">
        <p className="text-sm text-ink-400">Current slot</p>
        {current ? (
          <>
            <p className="font-display text-6xl text-volt-500 leading-none mt-2 tabular">
              {hhmm(current.slot_start_time)} <span className="text-ink-400 text-3xl">to</span> {hhmm(current.slot_end_time)}
            </p>
            <p className="text-xs text-ink-400 mt-3 tabular">
              {duration(current.slot_start_time, current.slot_end_time)} · assigned {when(current.created_at)}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-400 mt-2">No slot assigned yet. Ask the front desk to set one.</p>
        )}
      </div>

      <div>
        <h3 className="flex items-center gap-2 font-display text-2xl text-bone-100 leading-none mb-4">
          <History size={18} className="text-ink-400" /> Slot history
        </h3>
        {history.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No previous slots"
            description="When your slot is changed, the old one will be listed here."
          />
        ) : (
          <div className="space-y-3">
            {history.map((s) => (
              <div key={s.id} className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-display text-xl text-bone-100 leading-none tabular">
                      {hhmm(s.slot_start_time)} to {hhmm(s.slot_end_time)}
                    </p>
                    <Badge>REPLACED</Badge>
                  </div>
                  <p className="text-xs text-ink-400 tabular">{duration(s.slot_start_time, s.slot_end_time)}</p>
                </div>
                <div className="text-xs text-ink-400 tabular sm:text-right">
                  <p>Assigned {when(s.created_at)}</p>
                  <p>Replaced {when(s.updated_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}