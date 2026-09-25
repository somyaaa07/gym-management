import { useEffect, useMemo, useState } from "react";
import {
  Target,
  Plus,
  X,
  Calendar,
  Flame,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { memberDashboardApi } from "../../lib/api"; // adjust path to your actual client

/**
 * MyGoals
 * ------------------------------------------------------------------
 * Member-facing goals page. Matches the theme used across the rest of
 * the Gym Management app (dark indigo sidebar, lavender-grey canvas,
 * white cards, violet accent).
 *
 * Wiring notes for your codebase:
 *  - Expects `memberDashboardApi.goals()` -> GET /member-dashboard/my-goals
 *    to return { success, data: Goal[] } (this is your getMyGoals response).
 *  - `onCreateGoal` / `onUpdateProgress` / `onDeleteGoal` are stubbed to
 *    call endpoints you likely don't have yet — swap them for real calls
 *    (e.g. memberDashboardApi.createGoal(payload)) when ready. Until then
 *    they update local state optimistically so the UI is fully usable.
 *
 * Goal shape assumed:
 *  { id, title, category, target_value, current_value, unit,
 *    target_date, status } // status: "active" | "completed"
 */

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
};

const CATEGORY_META = {
  strength: { label: "Strength", color: "#6D5CF6" },
  weight: { label: "Weight", color: "#1FAE7A" },
  endurance: { label: "Endurance", color: "#E08A1E" },
  habit: { label: "Habit", color: "#3B9AE1" },
};

const seedGoals = [
  {
    id: "g1",
    title: "Bench press bodyweight",
    category: "strength",
    unit: "kg",
    current_value: 62,
    target_value: 75,
    target_date: "2026-12-15",
    status: "active",
  },
  {
    id: "g2",
    title: "Lose 6 kg",
    category: "weight",
    unit: "kg",
    current_value: 3.5,
    target_value: 6,
    target_date: "2026-11-01",
    status: "active",
  },
  {
    id: "g3",
    title: "Run 5K under 25 minutes",
    category: "endurance",
    unit: "min",
    current_value: 27,
    target_value: 25,
    target_date: "2026-10-20",
    status: "active",
    inverse: true,
  },
  {
    id: "g4",
    title: "Gym 4x a week for a month",
    category: "habit",
    unit: "sessions",
    current_value: 16,
    target_value: 16,
    target_date: "2026-09-01",
    status: "completed",
  },
];

function daysLeft(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function progressPct(goal) {
  if (goal.inverse) {
    // lower is better (e.g. a time). Treat "started from" as unknown,
    // so just show how close current is to target as a ratio capped at 100.
    const pct = (goal.target_value / goal.current_value) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }
  const pct = (goal.current_value / goal.target_value) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
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
      <text
        x="28"
        y="32"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill={THEME.text}
      >
        {pct}%
      </text>
    </svg>
  );
}

function AddGoalModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    category: "strength",
    current_value: "",
    target_value: "",
    unit: "",
    target_date: "",
  });

  if (!open) return null;

  const canSave = form.title.trim() && form.target_value && form.target_date;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(20,18,40,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: THEME.card }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: THEME.text }}>
            New goal
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5"
            aria-label="Close"
          >
            <X size={18} color={THEME.muted} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: THEME.text }}>
              What do you want to achieve?
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Squat 100 kg"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                border: `1px solid ${THEME.border}`,
                background: THEME.bg,
                color: THEME.text,
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: THEME.text }}>
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, category: key })}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  style={{
                    background: form.category === key ? meta.color : THEME.track,
                    color: form.category === key ? "#fff" : THEME.muted,
                  }}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: THEME.text }}>
                Starting point
              </label>
              <input
                value={form.current_value}
                onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                placeholder="0"
                type="number"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text }}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: THEME.text }}>
                Target
              </label>
              <input
                value={form.target_value}
                onChange={(e) => setForm({ ...form, target_value: e.target.value })}
                placeholder="e.g. 75"
                type="number"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: THEME.text }}>
                Unit
              </label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="kg, min, sessions..."
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text }}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: THEME.text }}>
                Target date
              </label>
              <input
                value={form.target_date}
                onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                type="date"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={{ border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: THEME.track, color: THEME.text }}
          >
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={() => {
              onSave({
                id: `g${Date.now()}`,
                title: form.title.trim(),
                category: form.category,
                current_value: Number(form.current_value) || 0,
                target_value: Number(form.target_value),
                unit: form.unit || "",
                target_date: form.target_date,
                status: "active",
              });
            }}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: THEME.accent }}
          >
            Save goal
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal, onDelete, onLogProgress }) {
  const meta = CATEGORY_META[goal.category] || CATEGORY_META.strength;
  const pct = progressPct(goal);
  const isCompleted = goal.status === "completed";
  const dLeft = daysLeft(goal.target_date);

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-5"
      style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}
    >
      <GoalRing pct={pct} color={isCompleted ? THEME.success : meta.color} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${meta.color}1A`, color: meta.color }}
          >
            {meta.label}
          </span>
          {isCompleted && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: THEME.successSoft, color: THEME.success }}
            >
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
          {!isCompleted && dLeft <= 7 && dLeft >= 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: THEME.warningSoft, color: THEME.warning }}
            >
              <Flame size={12} /> {dLeft === 0 ? "Due today" : `${dLeft}d left`}
            </span>
          )}
        </div>

        <h3 className="font-bold text-base truncate" style={{ color: THEME.text }}>
          {goal.title}
        </h3>

        <div className="flex items-center gap-4 mt-1.5 text-sm" style={{ color: THEME.muted }}>
          <span>
            {goal.current_value}
            {goal.unit} of {goal.target_value}
            {goal.unit}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {new Date(goal.target_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="w-full h-2 rounded-full mt-3" style={{ background: THEME.track }}>
          <div
            className="h-2 rounded-full"
            style={{
              width: `${pct}%`,
              background: isCompleted ? THEME.success : meta.color,
              transition: "width 500ms ease",
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        {!isCompleted && (
          <button
            onClick={() => onLogProgress(goal.id)}
            className="p-2 rounded-lg hover:bg-black/5"
            title="Log progress"
          >
            <Pencil size={16} color={THEME.muted} />
          </button>
        )}
        <button
          onClick={() => onDelete(goal.id)}
          className="p-2 rounded-lg hover:bg-black/5"
          title="Delete goal"
        >
          <Trash2 size={16} color={THEME.muted} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
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
        No goals yet
      </h3>
      <p className="text-sm max-w-xs mb-6" style={{ color: THEME.muted }}>
        Set a goal to track — a lift, a weight, a habit — and your progress will show up here.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: THEME.accent }}
      >
        <Plus size={16} /> Add your first goal
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 flex-1"
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
  const [filter, setFilter] = useState("active"); // active | completed | all
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    memberDashboardApi
      .goals()
      .then((res) => {
        if (cancelled) return;
        // matches your getMyGoals response shape: { success, message, data }
        setGoals(res?.data ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load goals", err);
        setError("Couldn't load your goals. Pull to refresh or try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return goals;
    return goals.filter((g) => g.status === filter);
  }, [goals, filter]);

  const stats = useMemo(() => {
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const avgPct =
      goals.length === 0
        ? 0
        : Math.round(goals.reduce((sum, g) => sum + progressPct(g), 0) / goals.length);
    return { active, completed, avgPct };
  }, [goals]);

  const handleSave = async (goal) => {
    setModalOpen(false);
    // Optimistic: show it immediately with a temp id, replace once the server responds.
    setGoals((prev) => [goal, ...prev]);
    try {
      const res = await memberDashboardApi.createGoal(goal);
      const saved = res?.data;
      if (saved) {
        setGoals((prev) => prev.map((g) => (g.id === goal.id ? saved : g)));
      }
    } catch (err) {
      console.error("Failed to create goal", err);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
      setError("Couldn't save that goal. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const prevGoals = goals;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      await memberDashboardApi.deleteGoal(id);
    } catch (err) {
      console.error("Failed to delete goal", err);
      setGoals(prevGoals);
      setError("Couldn't delete that goal. Please try again.");
    }
  };

  const handleLogProgress = async (id) => {
    const prevGoals = goals;
    let updatedValue = null;

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const step = g.inverse ? -1 : 1;
        const next = g.current_value + step;
        const done = g.inverse ? next <= g.target_value : next >= g.target_value;
        updatedValue = next;
        return { ...g, current_value: next, status: done ? "completed" : "active" };
      })
    );

    try {
      await memberDashboardApi.updateGoalProgress(id, updatedValue);
    } catch (err) {
      console.error("Failed to update progress", err);
      setGoals(prevGoals);
      setError("Couldn't log that progress. Please try again.");
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
            Track what you're working toward and log progress as you go.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{ background: THEME.accent }}
        >
          <Plus size={16} /> Add goal
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <StatCard
          icon={<Target size={18} color={THEME.accent} />}
          label="Active goals"
          value={stats.active}
          accent={THEME.accent}
        />
        <StatCard
          icon={<CheckCircle2 size={18} color={THEME.success} />}
          label="Completed"
          value={stats.completed}
          accent={THEME.success}
        />
        <StatCard
          icon={<TrendingUp size={18} color={THEME.warning} />}
          label="Average progress"
          value={`${stats.avgPct}%`}
          accent={THEME.warning}
        />
      </div>

      <div className="flex items-center gap-1 mb-4">
        {[
          { key: "active", label: "Active" },
          { key: "completed", label: "Completed" },
          { key: "all", label: "All" },
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
        <div className="text-sm" style={{ color: THEME.muted }}>
          Loading your goals...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={handleDelete}
              onLogProgress={handleLogProgress}
            />
          ))}
        </div>
      )}

      <AddGoalModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}