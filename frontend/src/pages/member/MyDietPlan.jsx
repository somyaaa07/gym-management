import { useEffect, useMemo, useState } from 'react';
import { Utensils, Coffee, Moon, Apple, CalendarRange, Flame, ListChecks } from 'lucide-react';
import usePageMeta from '../../lib/usePageMeta.js';
import { dietPlanApi } from '../../lib/api.js';
import { PageSpinner, EmptyState } from '../../components/ui/Misc.jsx';

const STATUS_STYLE = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  upcoming: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  completed: 'bg-ink-700 text-ink-400 border-ink-600',
};

const MEAL_ICON = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Apple,
};

function statusStyle(status) {
  return STATUS_STYLE[String(status || '').toLowerCase()] || STATUS_STYLE.completed;
}

function mealIcon(type) {
  return MEAL_ICON[String(type || '').toLowerCase()] || Utensils;
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = String(t).split(':');
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return String(t).slice(0, 5);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${period}`;
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

function planProgress(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (!s || !e || Number.isNaN(s) || Number.isNaN(e) || e <= s) return null;
  const pct = Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
  const daysLeft = Math.ceil((e - now) / 86400000);
  return { pct, daysLeft };
}

function MealRow({ meal, isLast }) {
  const Icon = mealIcon(meal.meal_type);
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="flex flex-col items-center shrink-0">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ink-800 text-ink-300">
          <Icon size={14} />
        </span>
        {!isLast && <span className="w-px flex-1 bg-ink-700 mt-1.5" />}
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm text-bone-100 capitalize">{meal.meal_type}</p>
          <span className="text-[11px] text-ink-400 tabular">{formatTime(meal.meal_time)}</span>
        </div>
        <div className="flex items-end justify-between gap-3 mt-0.5">
          <div className="min-w-0">
            <p className="text-sm text-ink-200 truncate">{meal.food_name}</p>
            <p className="text-[11px] text-ink-500 tabular">{meal.quantity} {meal.unit}</p>
          </div>
          {meal.calories != null && (
            <span className="text-xs text-bone-200 tabular bg-ink-800 rounded-full px-2.5 py-1 shrink-0">
              {meal.calories} kcal
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, defaultOpen }) {
  const meals = useMemo(
    () => [...(plan.DietPlanMeals || [])].sort((a, b) => String(a.meal_time).localeCompare(String(b.meal_time))),
    [plan]
  );
  const totalCalories = useMemo(
    () => meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0),
    [meals]
  );
  const progress = useMemo(() => planProgress(plan.start_date, plan.end_date), [plan]);
  const weeks = useMemo(() => weekSpan(plan.start_date, plan.end_date), [plan]);
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
          {meals.length} meal{meals.length === 1 ? '' : 's'}
          {totalCalories > 0 ? ` · ${totalCalories} kcal/day` : ''}
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

      {meals.length > 0 ? (
        <div className="rounded-xl border border-ink-700 bg-ink-900/40">
          {meals.map((m, i) => (
            <MealRow key={m.id} meal={m} isLast={i === meals.length - 1} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-500 italic">No meals added to this plan yet.</p>
      )}
    </div>
  );
}

export default function MyDietPlan() {
  usePageMeta('My diet plan', '');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dietPlanApi
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
          icon={Utensils}
          title="No diet plan yet"
          description="Your trainer hasn't assigned a diet plan yet. Check back after your next goal review."
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