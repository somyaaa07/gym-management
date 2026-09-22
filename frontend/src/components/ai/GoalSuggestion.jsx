import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, RefreshCw, Dumbbell, Utensils, AlertTriangle, Cpu } from 'lucide-react';
import { aiApi, extractErrorMessage } from '../../lib/api.js';
import Button from '../ui/Button.jsx';
import { Badge, Spinner } from '../ui/Misc.jsx';

const MODEL_OPTIONS = [
  { key: 'llama', label: 'Llama' },
  { key: 'gemma', label: 'Gemma' },
];

const DEBOUNCE_MS = 1500;

const isFutureDate = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
};

/**
 * Shows AI workout + diet suggestions for the goal being entered.
 *
 * Props
 *  - memberId:    member the goal belongs to
 *  - goal:        { goal_type, target_value, target_unit, start_value, target_date, notes }  (form strings)
 *  - preferences: { days_per_week, session_duration_minutes, fitness_level, diet_preference }
 */
export default function GoalAiSuggestions({ memberId, goal, preferences }) {
  const [modelKey, setModelKey] = useState('llama');
  const [auto, setAuto] = useState(true);
const [status, setStatus] = useState({ ok: null, llama: null, gemma: null });
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState('');
  const [tab, setTab] = useState('workout');

  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());

  // Which models are installed in Ollama?
  // Which models are installed in Ollama?
  useEffect(() => {
    aiApi
      .models()
      .then((res) => {
        const data = res.data; // { llama: { model, installed }, gemma: { model, installed } }
        setStatus({ ok: true, ...data });
        if (data.llama && !data.llama.installed && data.gemma?.installed) {
          setModelKey('gemma');
        }
      })
      .catch(() => setStatus({ ok: false, llama: null, gemma: null }));
  }, []);

  const payload = useMemo(() => {
    const ready =
      goal.goal_type && Number(goal.target_value) > 0 && isFutureDate(goal.target_date);
    if (!ready) return null;
    return {
      member_id: memberId,
      goal: {
        goal_type: goal.goal_type,
        target_value: Number(goal.target_value),
        target_unit: goal.target_unit,
        start_value: Number(goal.start_value) > 0 ? Number(goal.start_value) : undefined,
        target_date: goal.target_date,
        notes: goal.notes?.trim() || undefined,
      },
      preferences: {
        days_per_week: Number(preferences.days_per_week) || undefined,
        session_duration_minutes: Number(preferences.session_duration_minutes) || undefined,
        fitness_level: preferences.fitness_level || undefined,
        diet_preference: preferences.diet_preference || undefined,
      },
    };
  }, [memberId, goal, preferences]);

  const key = payload ? `${modelKey}|${JSON.stringify(payload)}` : '';

  const run = async () => {
    if (!payload) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');
    try {
      const res = await aiApi.suggest({ ...payload, model: modelKey }, { signal: controller.signal });
      cacheRef.current.set(key, res.data);
      setResult(res.data);
      setResultKey(key);
    } catch (err) {
      if (err?.code === 'ERR_CANCELED') return; // superseded by a newer request
      setError(extractErrorMessage(err, 'Could not generate a suggestion'));
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  };

  // Goal / model changed: drop the in-flight request so the local model isn't busy with stale input.
  useEffect(() => {
    abortRef.current?.abort();
  }, [key]);

  // Auto-suggest: wait until the user stops typing, reuse cached answers.
  useEffect(() => {
    if (!auto || !key) return undefined;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setResult(cached);
      setResultKey(key);
      setError('');
      return undefined;
    }
    const t = setTimeout(run, DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, auto]);

  // Cancel the in-flight request when the panel closes.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Elapsed seconds while waiting on the model.
  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return undefined;
    }
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  const ollamaDown = status.ok === false;
    const stale = result && resultKey !== key;

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-ink-700">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-brand-soft p-2">
            <Sparkles size={16} className="text-volt-500" />
          </div>
          <div>
            <h3 className="font-display text-lg text-bone-100 leading-none">AI suggestions</h3>
            <p className="text-[11px] text-ink-400 mt-1">Runs locally on your machine via Ollama</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-ink-600 p-0.5 bg-ink-800">
                      {MODEL_OPTIONS.map((m) => {
              const info = status[m.key];
              const missing = status.ok && info && !info.installed;
              return (
                <button
                  key={m.key}
                  type="button"
                  disabled={missing}
                  title={missing ? `Not installed. Run: ollama pull ${info.model}` : info?.model}
                  onClick={() => setModelKey(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    modelKey === m.key
                      ? 'bg-volt-500 text-ink-900'
                      : 'text-bone-200 hover:bg-ink-700 disabled:opacity-40 disabled:hover:bg-transparent'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            disabled={!payload || loading || ollamaDown}
            onClick={run}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {result ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <label className="flex items-center gap-2 text-xs text-bone-200 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            className="accent-volt-500"
          />
          Auto-suggest when I finish entering the goal
        </label>

        {ollamaDown && (
          <Notice tone="error" icon={Cpu}>
            Ollama is not reachable. Start it with <code className="font-mono">ollama serve</code> and reload this page.
          </Notice>
        )}

        {!payload && !ollamaDown && (
          <p className="text-sm text-ink-400 leading-relaxed">
            Choose a goal type, a target value and a future target date. The workout and diet suggestions will appear here.
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900/40 px-4 py-3">
            <Spinner size={18} />
            <div>
              <p className="text-sm text-bone-100">Generating with {MODEL_OPTIONS.find((m) => m.key === modelKey)?.label}…</p>
              <p className="text-[11px] text-ink-400 tabular">
                {elapsed}s · local models can take up to a minute on CPU
              </p>
            </div>
          </div>
        )}

        {error && !loading && <Notice tone="error">{error}</Notice>}

        {result && (
          <div className={`space-y-4 transition-opacity ${loading || stale ? 'opacity-60' : ''}`}>
            {stale && !loading && (
              <Notice tone="warn">Goal changed since this suggestion. Press Regenerate to refresh it.</Notice>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge>{result.model.name}</Badge>
              <span className="text-[11px] text-ink-400 tabular">
                {(result.generated_in_ms / 1000).toFixed(1)}s · {result.plan.duration_weeks} week plan
              </span>
            </div>

            {result.plan.summary && (
              <p className="text-sm text-bone-200 leading-relaxed">{result.plan.summary}</p>
            )}

            {result.targets && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Macro label="Calories" value={`${result.targets.calories}`} unit="kcal" />
                <Macro label="Protein" value={result.targets.protein} unit="g" />
                <Macro label="Carbs" value={result.targets.carbs} unit="g" />
                <Macro label="Fat" value={result.targets.fats} unit="g" />
              </div>
            )}

            {result.warnings?.length > 0 && (
              <Notice tone="warn" icon={AlertTriangle}>
                <ul className="space-y-1 list-disc pl-4">
                  {result.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </Notice>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-ink-700">
              <TabButton active={tab === 'workout'} onClick={() => setTab('workout')} icon={Dumbbell}>
                Workout
              </TabButton>
              <TabButton active={tab === 'diet'} onClick={() => setTab('diet')} icon={Utensils}>
                Diet
              </TabButton>
            </div>

            {tab === 'workout' ? <WorkoutView plan={result.plan} /> : <DietView plan={result.plan} />}

            <p className="text-[11px] text-ink-400">{result.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ views ------------------------------ */

function WorkoutView({ plan }) {
  return (
    <div className="space-y-3">
      {plan.workout.days.map((d) => (
        <div key={`${d.day}-${d.focus}`} className="rounded-xl border border-ink-700 bg-ink-900/40">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-700">
            <p className="text-sm font-semibold text-bone-100">{d.day}</p>
            <span className="text-xs text-ink-400">{d.focus}</span>
          </div>
          <ul className="divide-y divide-ink-700">
            {d.exercises.map((e, i) => (
              <li key={`${e.exercise_name}-${i}`} className="px-4 py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-bone-100 flex items-center gap-2 flex-wrap">
                    {e.exercise_name}
                    {!e.in_library && <Badge>Not in library</Badge>}
                  </p>
                  {e.notes && <p className="text-[11px] text-ink-400 mt-0.5">{e.notes}</p>}
                </div>
                <p className="text-xs text-bone-200 tabular shrink-0 text-right">
                  {e.sets} × {e.reps ? `${e.reps} reps` : `${e.duration} min`}
                  <span className="block text-ink-400">rest {e.rest_seconds}s</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function DietView({ plan }) {
  const { meals, totals } = plan.diet;
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/40 overflow-x-auto">
      <table className="w-full text-sm min-w-[520px]">
        <thead>
          <tr className="text-[11px] text-ink-400 text-left border-b border-ink-700">
            <th className="px-4 py-2.5 font-medium">Meal</th>
            <th className="px-2 py-2.5 font-medium">Food</th>
            <th className="px-2 py-2.5 font-medium text-right">kcal</th>
            <th className="px-2 py-2.5 font-medium text-right">P</th>
            <th className="px-2 py-2.5 font-medium text-right">C</th>
            <th className="px-4 py-2.5 font-medium text-right">F</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-700">
          {meals.map((m, i) => (
            <tr key={`${m.meal_time}-${m.food_name}-${i}`} className="align-top">
              <td className="px-4 py-2.5">
                <p className="text-bone-100">{m.meal_type}</p>
                <p className="text-[11px] text-ink-400 tabular">{m.meal_time}</p>
              </td>
              <td className="px-2 py-2.5">
                <p className="text-bone-100">{m.food_name}</p>
                <p className="text-[11px] text-ink-400 tabular">
                  {m.quantity} {m.unit}
                </p>
              </td>
              <td className="px-2 py-2.5 text-right tabular text-bone-100">{m.calories}</td>
              <td className="px-2 py-2.5 text-right tabular text-bone-200">{m.protein}</td>
              <td className="px-2 py-2.5 text-right tabular text-bone-200">{m.carbs}</td>
              <td className="px-4 py-2.5 text-right tabular text-bone-200">{m.fats}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-ink-600 text-bone-100 font-semibold">
            <td className="px-4 py-2.5" colSpan={2}>Daily total</td>
            <td className="px-2 py-2.5 text-right tabular">{totals.calories}</td>
            <td className="px-2 py-2.5 text-right tabular">{totals.protein}</td>
            <td className="px-2 py-2.5 text-right tabular">{totals.carbs}</td>
            <td className="px-4 py-2.5 text-right tabular">{totals.fats}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ------------------------------ bits ------------------------------ */

function Macro({ label, value, unit }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/40 px-3 py-2.5">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className="font-display text-xl text-bone-100 leading-none mt-1 tabular">
        {value} <span className="text-[11px] text-ink-400 font-sans">{unit}</span>
      </p>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
        active ? 'border-volt-500 text-volt-500' : 'border-transparent text-ink-400 hover:text-bone-100'
      }`}
    >
      <Icon size={13} /> {children}
    </button>
  );
}

function Notice({ tone, icon: Icon, children }) {
  const tones = {
    error: 'text-ember-500 bg-ember-500/10 border-ember-500/20',
    warn: 'text-amber-600 bg-amber-500/10 border-amber-500/25',
  };
  return (
    <div className={`flex items-start gap-2 text-xs border rounded-xl px-3 py-2.5 ${tones[tone]}`}>
      {Icon && <Icon size={14} className="mt-0.5 shrink-0" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
