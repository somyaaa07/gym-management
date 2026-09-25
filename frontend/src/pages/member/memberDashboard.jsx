import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Flame,
  MapPin,
  Target,
  Utensils,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import usePageMeta from '../../lib/usePageMeta.js';
import { memberDashboardApi } from '../../lib/api.js';
import { PageSpinner, EmptyState } from '../../components/ui/Misc.jsx';

const GOAL_LABELS = {
  WEIGHT_LOSS: 'Weight loss',
  WEIGHT_GAIN: 'Weight gain',
  FAT_LOSS: 'Fat loss',
  MUSCLE_GAIN: 'Muscle gain',
  STRENGTH: 'Strength',
  FITNESS: 'General fitness',
};
const UNIT_LABELS = { KG: 'kg', PERCENT: '%', REPS: 'reps', MINUTES: 'min' };

const GOAL_PALETTE = ['text-volt-500', 'text-sky-400', 'text-amber-400', 'text-fuchsia-400', 'text-cyan-400'];
function goalColor(type) {
  const str = type || 'GOAL';
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return GOAL_PALETTE[Math.abs(hash) % GOAL_PALETTE.length];
}

const STATUS_STYLE = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  ON_TIME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  FROZEN: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  LATE: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
};
function statusStyle(status) {
  return STATUS_STYLE[String(status || '').toUpperCase()] || 'bg-ink-700 text-ink-400 border-ink-600';
}

function StatusPill({ status, children }) {
  return (
    <span className={`text-[11px] font-medium capitalize rounded-full border px-2.5 py-1 ${statusStyle(status)}`}>
      {children ?? String(status || '').toLowerCase().replace('_', ' ')}
    </span>
  );
}

const day = (d) => (d ? String(d).slice(0, 10) : '—');
const hhmm = (t) => (t ? String(t).slice(0, 5) : '—');
const clock = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

// days_remaining ab backend se aata hai (membership_meta) — dashboard aur
// My Membership page dono isi field ko use karte hain, taaki kabhi mismatch na ho.

function Card({ title, icon: Icon, action, children }) {
  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 font-display text-xl text-bone-100 leading-none">
          {Icon && <Icon size={16} className="text-ink-400" />} {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, hint, icon: Icon, as: As = 'div', ...rest }) {
  return (
    <As
      className="group rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5 h-full transition-colors hover:border-ink-600"
      {...rest}
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-ink-400">
          {Icon && <Icon size={13} className="text-ink-500" />} {label}
        </p>
        {As !== 'div' && (
          <ChevronRight size={14} className="text-ink-600 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-400" />
        )}
      </div>
      <p className="font-display text-4xl text-bone-100 leading-none mt-2 tabular">{value}</p>
      {hint && <p className="text-xs text-ink-400 mt-2">{hint}</p>}
    </As>
  );
}

export default function MemberDashboard() {
  usePageMeta('My dashboard', '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    memberDashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load your dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (error || !data) return <EmptyState title="Dashboard unavailable" description={error} />;

  const { member, branch, membership, membership_meta, slot, attendance, progress, goals, diet_plan, diet_meals } = data;
  const left = membership_meta?.days_remaining ?? null;
  const active = membership && left !== null && membership_meta?.is_expired === false;
  const checkedIn = !!attendance?.today;
  const change = progress?.weight_change;

  const membershipPct =
    membership && active
      ? Math.max(
          0,
          Math.min(
            100,
            ((Date.now() - new Date(membership.start_date).getTime()) /
              (new Date(membership.end_date).getTime() - new Date(membership.start_date).getTime())) *
              100
          )
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Hero: membership days left is the one thing a member checks first */}
      <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-6">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <p className="text-sm text-ink-400">Welcome back</p>
            <h2 className="font-display text-4xl text-bone-100 leading-none mt-1">{member.name}</h2>
            <p className="flex items-center gap-1.5 text-xs text-ink-400 mt-3">
              <MapPin size={13} /> {branch?.name || '—'}{branch?.city ? `, ${branch.city}` : ''}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <StatusPill status={member.status} />
              {membership && <StatusPill status={membership.status} />}
            </div>
          </div>
          <div className="text-right">
            {membership ? (
              <>
                <p className={`font-display text-6xl leading-none tabular ${active ? 'text-volt-500' : 'text-ember-500'}`}>
                  {active ? left : 0}
                </p>
                <p className="text-sm text-bone-100 mt-2">{active ? 'days left on your membership' : 'Membership expired'}</p>
                <p className="text-xs text-ink-400 mt-1 tabular">
                  {day(membership.start_date)} to {day(membership.end_date)}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-400 max-w-[220px]">No membership yet. Ask the front desk to enroll you in a plan.</p>
            )}
          </div>
        </div>

        {membership && active && membershipPct !== null && (
          <div className="mt-5 h-1.5 rounded-full bg-ink-900 overflow-hidden">
            <div className="h-full rounded-full bg-volt-500" style={{ width: `${membershipPct}%` }} />
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={CalendarDays}
          label="Today"
          value={checkedIn ? 'In' : 'Not yet'}
          hint={
            checkedIn
              ? `Checked in at ${clock(attendance.today.check_in_time)}${attendance.today.check_in_status === 'LATE' ? ' · Late' : ''}`
              : 'No check-in today'
          }
        />
        <Stat
          icon={Flame}
          label="Visits this month"
          value={attendance?.this_month ?? 0}
          hint={`${attendance?.total ?? 0} in total`}
        />
        <Stat
          as={Link}
          to="/app/myslot-history"
          icon={Clock}
          label="Your slot"
          value={slot ? hhmm(slot.slot_start_time) : '—'}
          hint={slot ? `until ${hhmm(slot.slot_end_time)}` : 'No slot assigned'}
        />
        <Stat
          icon={change > 0 ? TrendingUp : change < 0 ? TrendingDown : Target}
          label="Weight"
          value={progress?.latest_measurement ? `${Number(progress.latest_measurement.weight)} kg` : '—'}
          hint={
            change === null || change === undefined
              ? 'Add two measurements to see change'
              : `${change > 0 ? '+' : ''}${change.toFixed(1)} kg since last time`
          }
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Goals" icon={Target}>
          {goals?.length ? (
            <div className="space-y-4">
              {goals.map((g) => (
                <div key={g.id} className="flex items-start gap-3">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${goalColor(g.goal_type).replace('text-', 'bg-')}`} />
                  <div>
                    <p className="text-bone-100">{GOAL_LABELS[g.goal_type] || g.goal_type}</p>
                    <p className="text-xs text-ink-400 tabular mt-1">
                      {g.start_value ? `${Number(g.start_value)} → ` : 'Target '}
                      {Number(g.target_value)} {UNIT_LABELS[g.target_unit] || g.target_unit} · by {day(g.target_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400">No active goals. Your trainer can set one for you.</p>
          )}
        </Card>

        <Card
          title="Recent visits"
          icon={CalendarDays}
          action={
            <Link to="/app/my-attendance" className="flex items-center gap-1 text-xs text-ink-400 hover:text-bone-100">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          {attendance?.recent?.length ? (
            <ul className="divide-y divide-ink-700 text-sm">
              {attendance.recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-bone-100 tabular">{day(a.check_in_time)}</span>
                    {a.check_in_status && <StatusPill status={a.check_in_status} />}
                  </div>
                  <span className="text-xs text-ink-400 tabular flex items-center gap-1">
                    <Clock size={12} /> {clock(a.check_in_time)}
                    {a.check_out_time ? ` to ${clock(a.check_out_time)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-400">No visits yet. Your check-ins will show up here.</p>
          )}
        </Card>
      </div>

      <Card title={diet_plan?.name || 'Diet plan'} icon={Utensils}>
        {diet_meals?.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {diet_meals.map((m) => (
              <div key={m.id} className="rounded-xl border border-ink-700 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-ink-400 tabular">{hhmm(m.meal_time)}</p>
                  {m.calories ? (
                    <span className="flex items-center gap-1 text-[11px] text-bone-200 tabular bg-ink-900/50 rounded-full px-2 py-0.5">
                      <Flame size={11} /> {m.calories} kcal
                    </span>
                  ) : null}
                </div>
                <p className="text-bone-100 mt-1.5">{m.meal_name || m.name || 'Meal'}</p>
                {(m.description || m.food_items) && (
                  <p className="text-xs text-ink-400 mt-1">{m.description || m.food_items}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">No active diet plan yet.</p>
        )}
      </Card>
    </div>
  );
}