import { Loader2 } from 'lucide-react';

const BADGE_TONES = {
  active: 'bg-volt-500/10 text-volt-500 border-volt-500/30',
  paid: 'bg-volt-500/10 text-volt-500 border-volt-500/30',
  inactive: 'bg-ink-600/40 text-ink-400 border-ink-500',
  deactive: 'bg-ink-600/40 text-ink-400 border-ink-500',
  suspended: 'bg-ember-500/10 text-ember-500 border-ember-500/30',
  failed: 'bg-ember-500/10 text-ember-500 border-ember-500/30',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  frozen: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  default: 'bg-ink-600/40 text-bone-200 border-ink-500',
};

export function Badge({ children }) {
  const key = String(children || '').toLowerCase();
  const tone = BADGE_TONES[key] || BADGE_TONES.default;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tone}`}>
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
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-ink-600 rounded-xl">
      {Icon && (
        <div className="rounded-full bg-ink-700 p-3 mb-4">
          <Icon size={22} className="text-ink-400" />
        </div>
      )}
      <h3 className="font-display text-2xl text-bone-100 leading-none mb-1.5">{title}</h3>
      {description && <p className="text-sm text-ink-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, accent = false }) {
  return (
    <div className="rounded-xl border border-ink-600 bg-ink-800 px-5 py-4 flex items-start justify-between">
      <div>
        <p className="text-xs text-ink-400 mb-2">{label}</p>
        <p className={`font-display text-4xl leading-none tabular ${accent ? 'text-volt-500' : 'text-bone-100'}`}>
          {value}
        </p>
      </div>
      {Icon && (
        <div className="rounded-lg bg-ink-700 p-2">
          <Icon size={16} className="text-ink-300" />
        </div>
      )}
    </div>
  );
}
