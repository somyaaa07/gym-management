import { useEffect, useState } from 'react';
import { Dumbbell, Utensils } from 'lucide-react';
import { workoutPlanApi, dietPlanApi } from '../lib/api.js';
import { Badge, EmptyState } from './ui/Misc.jsx';

export default function PlansSection({ memberId, reloadKey }) {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      workoutPlanApi.getByMember(memberId).then((res) => res.data || []).catch(() => []),
      dietPlanApi.getByMember(memberId).then((res) => res.data || []).catch(() => []),
    ])
      .then(([w, d]) => {
        setWorkoutPlans(w);
        setDietPlans(d);
      })
      .finally(() => setLoading(false));
  }, [memberId, reloadKey]);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl text-bone-100 leading-none mb-4">Workout plans</h3>
        {workoutPlans.length === 0 ? (
          <EmptyState icon={Dumbbell} title="No workout plan yet" description="Apply an AI suggestion, or create one manually." />
        ) : (
          <div className="space-y-3">
            {workoutPlans.map((p) => (
              <div key={p.id} className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <p className="font-display text-xl text-bone-100 leading-none">{p.name}</p>
                  <Badge>{p.status}</Badge>
                </div>
                <p className="text-xs text-ink-400 tabular mb-3">
                  {String(p.start_date).slice(0, 10)} → {String(p.end_date).slice(0, 10)}
                </p>
                {(p.WorkoutPlanExercises || []).length > 0 && (
                  <div className="rounded-xl border border-ink-700 bg-ink-900/40 divide-y divide-ink-700">
                    {p.WorkoutPlanExercises.map((e) => (
                      <div key={e.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-bone-100">{e.Exercise?.name || 'Exercise'}</p>
                          <p className="text-[11px] text-ink-400">{e.day}</p>
                        </div>
                        <p className="text-xs text-bone-200 tabular text-right shrink-0">
                          {e.sets} × {e.reps ? `${e.reps} reps` : `${e.duration} min`}
                          <span className="block text-ink-400">rest {e.rest_seconds}s</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display text-2xl text-bone-100 leading-none mb-4">Diet plans</h3>
        {dietPlans.length === 0 ? (
          <EmptyState icon={Utensils} title="No diet plan yet" description="Apply an AI suggestion, or create one manually." />
        ) : (
          <div className="space-y-3">
            {dietPlans.map((p) => (
              <div key={p.id} className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <p className="font-display text-xl text-bone-100 leading-none">{p.name}</p>
                  <Badge>{p.status}</Badge>
                </div>
                <p className="text-xs text-ink-400 tabular mb-3">
                  {String(p.start_date).slice(0, 10)} → {String(p.end_date).slice(0, 10)}
                </p>
                {(p.DietPlanMeals || []).length > 0 && (
                  <div className="rounded-xl border border-ink-700 bg-ink-900/40 overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead>
                        <tr className="text-[11px] text-ink-400 text-left border-b border-ink-700">
                          <th className="px-4 py-2 font-medium">Meal</th>
                          <th className="px-2 py-2 font-medium">Food</th>
                          <th className="px-2 py-2 font-medium text-right">kcal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-700">
                        {p.DietPlanMeals.map((m) => (
                          <tr key={m.id}>
                            <td className="px-4 py-2">
                              <p className="text-bone-100">{m.meal_type}</p>
                              <p className="text-[11px] text-ink-400 tabular">{String(m.meal_time).slice(0, 5)}</p>
                            </td>
                            <td className="px-2 py-2">
                              <p className="text-bone-100">{m.food_name}</p>
                              <p className="text-[11px] text-ink-400 tabular">{m.quantity} {m.unit}</p>
                            </td>
                            <td className="px-2 py-2 text-right tabular text-bone-100">{m.calories}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}