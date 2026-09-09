import { Loader2 } from 'lucide-react';

const BADGE_TONES = {
  active: 'bg-volt-500/10 text-volt-600 border-volt-500/25',
  paid: 'bg-volt-500/10 text-volt-600 border-volt-500/25',
  inactive: 'bg-ink-600/50 text-ink-500 border-ink-600',
  deactive: 'bg-ink-600/50 text-ink-500 border-ink-600',
  suspended: 'bg-ember-500/10 text-ember-600 border-ember-500/25',
  failed: 'bg-ember-500/10 text-ember-600 border-ember-500/25',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/25',
  frozen: 'bg-sky-500/10 text-sky-600 border-sky-500/25',
  default: 'bg-ink-600/50 text-bone-200 border-ink-600',
};

export function Badge({ children }) {
  const key = String(children || '').toLowerCase();
  const tone = BADGE_TONES[key] || BADGE_TONES.default;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {children}
    </span>
  );
}

export function Spinner({ size = 22, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-volt-500 ${className}`} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size={26} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-ink-600 rounded-2xl bg-ink-800/50">
      {Icon && (
        <div className="rounded-2xl bg-gradient-brand-soft p-3.5 mb-4">
          <Icon size={22} className="text-volt-500" />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold text-bone-100 leading-none mb-2">{title}</h3>
      {description && <p className="text-sm text-ink-400 max-w-xs mb-4 leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}

const STAT_TONES = [
  { bg: 'bg-[#EFECFD]', fg: 'text-[#6C5DD3]' }, // violet
  { bg: 'bg-[#FFEDE6]', fg: 'text-[#FF7A4D]' }, // coral
  { bg: 'bg-[#E7F6EF]', fg: 'text-[#22B07D]' }, // green
  { bg: 'bg-[#EAF2FF]', fg: 'text-[#3B82F6]' }, // blue
];

export function StatCard({ label, value, icon: Icon, accent = false, tone = 0 }) {
  const t = STAT_TONES[tone % STAT_TONES.length];
  return (
    <div className="surface-card px-5 py-4 flex items-start justify-between hover:shadow-card transition-shadow">
      <div>
        <p className="text-xs font-medium text-ink-400 mb-2">{label}</p>
        <p className={`font-display text-3xl font-bold leading-none tabular ${accent ? 'text-volt-600' : 'text-bone-100'}`}>
          {value}
        </p>
      </div>
      {Icon && (
        <div className={`rounded-xl p-2.5 ${t.bg}`}>
          <Icon size={17} className={t.fg} />
        </div>
      )}
    </div>
  );
}
