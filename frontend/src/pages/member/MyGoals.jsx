import { useEffect, useMemo, useState } from "react";
import {
  Target,
  X,
  Calendar,
  Flame,
  CheckCircle2,
  Ban,
  Pencil,
  StickyNote,
  RefreshCw,
} from "lucide-react";
import { memberDashboardApi } from "../../lib/api"; // adjust path to your actual client

const THEME = {
  bg: "#F5F5FA",
  card: "#FFFFFF",
  border: "#ECEBF6",
  text: "#1F2033",
  muted: "#8B8AA0",
  accent: "#6D5CF6",
  accentSoft: "#EFECFE",
  track: "#EEEDF8",
  success: "#1FAE7A",
  successSoft: "#E7F8F1",
  warning: "#E08A1E",
  warningSoft: "#FCF0DE",
  cancelled: "#B4B3C6",
  cancelledSoft: "#F1F0F6",
};

const TYPE_PALETTE = ["#6D5CF6", "#1FAE7A", "#E08A1E", "#3B9AE1", "#D6558C", "#2FB1B1"];
function colorForType(label) {
  const str = label || "GOAL";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return TYPE_PALETTE[Math.abs(hash) % TYPE_PALETTE.length];
}
function formatTypeLabel(label) {
  if (!label) return "Goal";
  return label
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function progressPct(goal) {
  const { start_value: s, target_value: t } = goal;
  if (t === s) return 100;
  if (t > s) {
    return Math.max(0, Math.min(100, Math.round((s / t) * 100)));
  }
  return Math.max(0, Math.min(100, Math.round((t / s) * 100)));
}

function remainingLabel(goal) {
  const { start_value: s, target_value: t, target_unit: u } = goal;
  const diff = Math.abs(t - s);
  if (diff === 0) return "Target reached";
  const dir = t > s ? "to gain" : "to go";
  return `${diff} ${u || ""} ${dir}`.replace(/\s+/g, " ").trim();
}

function GoalRing({ pct, color }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} stroke={THEME.track} strokeWidth="6" fill="none" />
      <circle
        cx="28"
        cy="28"
        r={r}
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dashoffset 500ms ease" }}
      />
      <text x="28" y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.text}>
        {pct}%
      </text>
    </svg>
  );
}

function StatusBadge({ status }) {
  if (status === "COMPLETED") {
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
        style={{ background: THEME.successSoft, color: THEME.success }}
      >
        <CheckCircle2 size={12} /> Completed
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
        style={{ background: THEME.cancelledSoft, color: THEME.cancelled }}
      >
        <Ban size={12} /> Cancelled
      </span>
    );
  }
  return null;
}

function LogProgressModal({ open, goal, onClose, onSubmit, submitting }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (goal) setValue(String(goal.start_value ?? ""));
  }, [goal]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !goal) return null;

  const canSubmit = value !== "" && !submitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(20,18,40,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: THEME.card, boxShadow: "0 20px 60px rgba(20,18,40,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold" style={{ color: THEME.text }}>
            Log progress
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
            aria-label="Close"
          >
            <X size={18} color={THEME.muted} />
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: THEME.muted }}>
          {formatTypeLabel(goal.goal_type)} · target {goal.target_value} {goal.target_unit}
        </p>

        <label className="text-sm font-medium block mb-1.5" style={{ color: THEME.text }}>
          Current {goal.target_unit || "value"}
        </label>
        <input
          autoFocus
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSubmit && onSubmit(Number(value))}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none mb-5 transition-shadow focus:ring-2"
          style={{ border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text, "--tw-ring-color": THEME.accentSoft }}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: THEME.track, color: THEME.text }}
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit(Number(value))}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: THEME.accent }}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal, onLogProgress }) {
  const color = colorForType(goal.goal_type);
  const pct = progressPct(goal);
  const isActive = goal.status === "ACTIVE";
  const dLeft = daysLeft(goal.target_date);
  const ringColor = goal.status === "COMPLETED" ? THEME.success : goal.status === "CANCELLED" ? THEME.cancelled : color;

  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-5 transition-shadow hover:shadow-[0_4px_20px_rgba(31,32,51,0.06)]"
      style={{
        background: THEME.card,
        border: `1px solid ${THEME.border}`,
        opacity: goal.status === "CANCELLED" ? 0.65 : 1,
      }}
    >
      <GoalRing pct={pct} color={ringColor} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${color}1A`, color }}
          >
            {formatTypeLabel(goal.goal_type)}
          </span>
          <StatusBadge status={goal.status} />
          {isActive && dLeft !== null && dLeft <= 7 && dLeft >= 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: THEME.warningSoft, color: THEME.warning }}
            >
              <Flame size={12} /> {dLeft === 0 ? "Due today" : `${dLeft}d left`}
            </span>
          )}
          {isActive && dLeft !== null && dLeft < 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: THEME.warningSoft, color: THEME.warning }}
            >
              Overdue
            </span>
          )}
        </div>

        <h3 className="font-bold text-base" style={{ color: THEME.text }}>
          {goal.start_value} {goal.target_unit} → {goal.target_value} {goal.target_unit}
        </h3>

        <div className="flex items-center gap-4 mt-1.5 text-sm flex-wrap" style={{ color: THEME.muted }}>
          {goal.target_date && (
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(goal.target_date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {goal.status !== "CANCELLED" && <span>{remainingLabel(goal)}</span>}
        </div>

        {goal.notes && (
          <div
            className="flex items-start gap-1.5 mt-2.5 text-sm rounded-lg px-3 py-2"
            style={{ background: THEME.bg, color: THEME.muted }}
          >
            <StickyNote size={14} className="mt-0.5 shrink-0" />
            <span>{goal.notes}</span>
          </div>
        )}

        <div className="w-full h-2 rounded-full mt-3" style={{ background: THEME.track }}>
          <div
            className="h-2 rounded-full"
            style={{ width: `${pct}%`, background: ringColor, transition: "width 500ms ease" }}
          />
        </div>
      </div>

      {isActive && (
        <button
          onClick={() => onLogProgress(goal)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold shrink-0 transition-opacity hover:opacity-80"
          style={{ background: THEME.accentSoft, color: THEME.accent }}
        >
          <Pencil size={14} /> Log
        </button>
      )}
    </div>
  );
}

function GoalCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-5 animate-pulse"
      style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}
    >
      <div className="w-14 h-14 rounded-full shrink-0" style={{ background: THEME.track }} />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-24 rounded-full" style={{ background: THEME.track }} />
        <div className="h-4 w-48 rounded" style={{ background: THEME.track }} />
        <div className="h-2 w-full rounded-full mt-3" style={{ background: THEME.track }} />
      </div>
    </div>
  );
}

const FILTER_EMPTY_COPY = {
  ACTIVE: {
    title: "No active goals",
    description: "Your trainer hasn't set any active goals right now. Check back after your next review.",
  },
  COMPLETED: {
    title: "Nothing completed yet",
    description: "Goals you finish will show up here so you can look back on your progress.",
  },
  ALL: {
    title: "No goals yet",
    description: "Your trainer hasn't assigned any goals yet. Once they do, you'll be able to track and log your progress here.",
  },
};

function EmptyState({ filter }) {
  const copy = FILTER_EMPTY_COPY[filter] || FILTER_EMPTY_COPY.ALL;
  return (
    <div
      className="rounded-2xl flex flex-col items-center justify-center text-center py-20 px-6"
      style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: THEME.accentSoft }}
      >
        <Target size={28} color={THEME.accent} />
      </div>
      <h3 className="font-bold text-lg mb-1.5" style={{ color: THEME.text }}>
        {copy.title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: THEME.muted }}>
        {copy.description}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 flex-1 transition-shadow hover:shadow-[0_4px_20px_rgba(31,32,51,0.06)]"
      style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}1A` }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold leading-none" style={{ color: THEME.text }}>
          {value}
        </div>
        <div className="text-xs mt-1" style={{ color: THEME.muted }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function MyGoals() {
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logTarget, setLogTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    memberDashboardApi
      .goals()
      .then((res) => setGoals(res?.data ?? []))
      .catch((err) => {
        console.error("Failed to load goals", err);
        if (err?.response?.status === 404) {
          setGoals([]);
        } else {
          setError("Couldn't load your goals. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const counts = useMemo(
    () => ({
      ACTIVE: goals.filter((g) => g.status === "ACTIVE").length,
      COMPLETED: goals.filter((g) => g.status === "COMPLETED").length,
      ALL: goals.length,
    }),
    [goals]
  );

  const filtered = useMemo(() => {
    if (filter === "ALL") return goals;
    return goals.filter((g) => g.status === filter);
  }, [goals, filter]);

  const stats = useMemo(() => {
    const activeOnly = goals.filter((g) => g.status !== "CANCELLED");
    const avgPct =
      activeOnly.length === 0
        ? 0
        : Math.round(activeOnly.reduce((sum, g) => sum + progressPct(g), 0) / activeOnly.length);
    return { active: counts.ACTIVE, completed: counts.COMPLETED, avgPct };
  }, [goals, counts]);

  const handleLogSubmit = async (start_value) => {
    setSubmitting(true);
    const goalId = logTarget.id;
    const prevGoals = goals;

    try {
      const res = await memberDashboardApi.logProgress(goalId, start_value);
      const updated = res?.data;
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated ?? { ...g, start_value } : g)));
      setLogTarget(null);
    } catch (err) {
      console.error("Failed to log progress", err);
      setGoals(prevGoals);
      setError("Couldn't save your progress. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full p-8" style={{ background: THEME.bg }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: THEME.text }}>
            My goals
          </h1>
          <p className="text-sm mt-1" style={{ color: THEME.muted }}>
            Goals your trainer has set for you — log progress as you hit milestones.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold shrink-0 transition-opacity hover:opacity-80"
          style={{ background: THEME.track, color: THEME.text }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <StatCard icon={<Target size={18} color={THEME.accent} />} label="Active goals" value={stats.active} accent={THEME.accent} />
        <StatCard icon={<CheckCircle2 size={18} color={THEME.success} />} label="Completed" value={stats.completed} accent={THEME.success} />
        <StatCard icon={<Flame size={18} color={THEME.warning} />} label="Average progress" value={`${stats.avgPct}%`} accent={THEME.warning} />
      </div>

      <div className="flex items-center gap-1 mb-4">
        {[
          { key: "ACTIVE", label: "Active" },
          { key: "COMPLETED", label: "Completed" },
          { key: "ALL", label: "All" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: filter === tab.key ? THEME.accentSoft : "transparent",
              color: filter === tab.key ? THEME.accent : THEME.muted,
            }}
          >
            {tab.label}
            <span className="ml-1.5 tabular-nums" style={{ opacity: 0.6 }}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4 flex items-center justify-between"
          style={{ background: THEME.warningSoft, color: THEME.warning }}
        >
          {error}
          <button onClick={() => setError(null)} className="font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onLogProgress={setLogTarget} />
          ))}
        </div>
      )}

      <LogProgressModal
        open={!!logTarget}
        goal={logTarget}
        submitting={submitting}
        onClose={() => setLogTarget(null)}
        onSubmit={handleLogSubmit}
      />
    </div>
  );
}

