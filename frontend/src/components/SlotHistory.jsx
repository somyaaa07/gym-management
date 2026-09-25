import { Clock, History as HistoryIcon } from 'lucide-react';
import { EmptyState } from './ui/Misc';

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

const heldFor = (start, end) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!s || !e || Number.isNaN(s) || Number.isNaN(e) || e <= s) return null;
  const days = Math.max(1, Math.round((e - s) / 86400000));
  if (days < 14) return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
};

function TimelineRow({ isLast, dot, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        {dot}
        {!isLast && <span className="w-px flex-1 bg-ink-700 mt-1.5" />}
      </div>
      <div className="flex-1 min-w-0 pb-6">{children}</div>
    </div>
  );
}

// current: the active slot row (or null), history: array of replaced slot rows.
// Both come from the /member-dashboard response, so no id or extra API call is needed.
export default function SlotHistory({ current, history = [] }) {
  const hasAny = current || history.length > 0;

  if (!hasAny) {
    return (
      <EmptyState
        icon={Clock}
        title="No slot assigned yet"
        description="Ask the front desk to set one, and it'll show up here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {current && (
        <div className="rounded-2xl border border-volt-500/25 bg-ink-800 shadow-soft p-6">
          <p className="flex items-center gap-1.5 text-sm text-volt-500">
            <span className="w-1.5 h-1.5 rounded-full bg-volt-500" /> Current slot
          </p>
          <p className="font-display text-6xl text-volt-500 leading-none mt-2 tabular">
            {hhmm(current.slot_start_time)} <span className="text-ink-400 text-3xl">to</span> {hhmm(current.slot_end_time)}
          </p>
          <p className="text-xs text-ink-400 mt-3 tabular">
            {duration(current.slot_start_time, current.slot_end_time)} · assigned {when(current.created_at)}
          </p>
        </div>
      )}

      <div>
        <h3 className="flex items-center gap-2 font-display text-2xl text-bone-100 leading-none mb-4">
          <HistoryIcon size={18} className="text-ink-400" /> Slot history
        </h3>
        {history.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No previous slots"
            description="When your slot is changed, the old one will be listed here."
          />
        ) : (
          <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft px-5 pt-5">
            {history.map((s, i) => (
              <TimelineRow
                key={s.id}
                isLast={i === history.length - 1}
                dot={
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ink-900 border border-ink-700 text-ink-400 shrink-0">
                    <Clock size={13} />
                  </span>
                }
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display text-xl text-bone-100 leading-none tabular">
                        {hhmm(s.slot_start_time)} to {hhmm(s.slot_end_time)}
                      </p>
                      <span className="text-[11px] font-medium rounded-full border border-ink-600 bg-ink-700 text-ink-400 px-2.5 py-1">
                        Replaced
                      </span>
                    </div>
                    <p className="text-xs text-ink-400 tabular">
                      {duration(s.slot_start_time, s.slot_end_time)}
                      {heldFor(s.created_at, s.updated_at) && ` · held for ${heldFor(s.created_at, s.updated_at)}`}
                    </p>
                  </div>
                  <div className="text-xs text-ink-400 tabular sm:text-right">
                    <p>Assigned {when(s.created_at)}</p>
                    <p>Replaced {when(s.updated_at)}</p>
                  </div>
                </div>
              </TimelineRow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}