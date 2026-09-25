import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Timer, ChevronDown, Flame, CalendarRange, ListChecks } from 'lucide-react';
import usePageMeta from '../../lib/usePageMeta.js';
import { workoutPlanApi } from '../../lib/api.js';
import { PageSpinner, EmptyState } from '../../components/ui/Misc.jsx';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_SHORT = { monday: 'Mo', tuesday: 'Tu', wednesday: 'We', thursday: 'Th', friday: 'Fr', saturday: 'Sa', sunday: 'Su' };

const STATUS_STYLE = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  upcoming: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  completed: 'bg-ink-700 text-ink-400 border-ink-600',
};

function statusStyle(status) {
  return STATUS_STYLE[String(status || '').toLowerCase()] || STATUS_STYLE.completed;
}

function dayRank(day) {
  const idx = DAY_ORDER.indexOf(String(day || '').toLowerCase());
  return idx === -1 ? DAY_ORDER.length : idx;
}

function groupByDay(exercises) {
  const groups = new Map();
  for (const ex of exercises) {
    const key = ex.day || 'Unscheduled';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ex);
  }
  return [...groups.entries()].sort((a, b) => dayRank(a[0]) - dayRank(b[0]));
}

function planProgress(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (!s || !e || Number.isNaN(s) || Number.isNaN(e) || e <= s) return null;
  const pct = Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
  const daysLeft = Math.ceil((e - now) / 86400000);
  return { pct, daysLeft };
}

function formatDate(d) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d).slice(0, 10);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function weekSpan(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!s || !e || Number.isNaN(s) || Number.isNaN(e) || e <= s) return null;
  return Math.max(1, Math.round((e - s) / (7 * 86400000)));
}

function ExerciseRow({ ex, index }) {
  const isTimed = !ex.reps && ex.duration;
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ink-800 text-[11px] text-ink-400 tabular shrink-0">
        {index + 1}
      </span>
      <p className="text-sm text-bone-100 truncate min-w-0 flex-1">{ex.Exercise?.name || 'Exercise'}</p>
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1 text-xs text-bone-200 tabular bg-ink-800 rounded-full px-2.5 py-1">
          {isTimed ? <Timer size={12} className="text-ink-400" /> : <Dumbbell size={12} className="text-ink-400" />}
          {ex.sets}×{isTimed ? `${ex.duration}min` : ex.reps}
        </span>
        {ex.rest_seconds ? <span className="text-[11px] text-ink-500 tabular">{ex.rest_seconds}s rest</span> : null}
      </div>
    </div>
  );
}

function DaySection({ day, exercises, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const short = DAY_SHORT[String(day).toLowerCase()] || day.slice(0, 2).toUpperCase();
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ink-800 text-[11px] font-medium text-bone-200 shrink-0">
          {short}
        </span>
        <span className="text-sm text-bone-100 flex-1">{day}</span>
        <span className="flex items-center gap-2 text-[11px] text-ink-400">
          {exercises.length} exercise{exercises.length === 1 ? '' : 's'}
          <ChevronDown size={14} className={`text-ink-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        <div className="divide-y divide-ink-700 border-t border-ink-700">
          {exercises.map((ex, i) => (
            <ExerciseRow key={ex.id} ex={ex} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, defaultOpen }) {
  const groups = useMemo(() => groupByDay(plan.WorkoutPlanExercises || []), [plan]);
  const progress = useMemo(() => planProgress(plan.start_date, plan.end_date), [plan]);
  const weeks = useMemo(() => weekSpan(plan.start_date, plan.end_date), [plan]);
  const totalExercises = (plan.WorkoutPlanExercises || []).length;
  const isActive = String(plan.status).toLowerCase() === 'active';

  return (
    <div
      className={`rounded-2xl border bg-ink-800 shadow-soft p-5 ${
        isActive ? 'border-emerald-500/20' : 'border-ink-700'
      }`}
    >
      <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
        <p className="font-display text-2xl text-bone-100 leading-none">{plan.name}</p>
        <span className={`text-[11px] font-medium capitalize rounded-full border px-2.5 py-1 ${statusStyle(plan.status)}`}>
          {plan.status}
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-400 mb-4">
        <span className="flex items-center gap-1.5 tabular">
          <CalendarRange size={13} className="text-ink-500" />
          {formatDate(plan.start_date)} → {formatDate(plan.end_date)}
          {weeks ? ` · ${weeks} wk${weeks === 1 ? '' : 's'}` : ''}
        </span>
        <span className="flex items-center gap-1.5 tabular">
          <ListChecks size={13} className="text-ink-500" />
          {totalExercises} exercise{totalExercises === 1 ? '' : 's'} · {groups.length} day{groups.length === 1 ? '' : 's'}/week
        </span>
      </div>

      {isActive && progress && (
        <div className="mb-4">
          <div className="h-1.5 rounded-full bg-ink-900 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.pct}%` }} />
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 mt-1.5">
            <Flame size={12} />
            {progress.daysLeft > 0 ? `${progress.daysLeft} day${progress.daysLeft === 1 ? '' : 's'} left on this plan` : 'Final day of this plan'}
          </p>
        </div>
      )}

      {plan.description && <p className="text-sm text-ink-300 mb-4 leading-relaxed">{plan.description}</p>}

      {groups.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-ink-500 px-0.5">This week</p>
          {groups.map(([day, exercises], i) => (
            <DaySection key={day} day={day} exercises={exercises} defaultOpen={defaultOpen && i === 0} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-500 italic">No exercises added to this plan yet.</p>
      )}
    </div>
  );
}

export default function MyWorkoutPlan() {
  usePageMeta('My workout plan', '');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workoutPlanApi
      .getMine()
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      {plans.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workout plan yet"
          description="Your trainer hasn't assigned a workout plan yet. Check back after your next goal review."
        />
      ) : (
        <div className="space-y-4">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}