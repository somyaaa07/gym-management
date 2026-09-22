// test-targets.js
import { computeTargets } from './src/modules/ai/ai.service.js';

const result = computeTargets({
    member: { date_of_birth: '1996-03-10', gender: 'male' },
    measurement: { weight: 82.5, height: 175 },
    goal: { goal_type: 'WEIGHT_LOSS', target_value: 74, target_unit: 'KG', start_value: 82.5, target_date: '2026-12-31' },
    preferences: { days_per_week: 4 },
});
console.log(result);