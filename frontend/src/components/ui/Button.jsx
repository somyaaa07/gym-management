import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-volt-500 text-ink-900 hover:bg-volt-400 disabled:bg-volt-500/40',
  secondary: 'bg-ink-700 text-bone-100 hover:bg-ink-600 border border-ink-600',
  danger: 'bg-transparent text-ember-500 border border-ember-500/40 hover:bg-ember-500/10',
  ghost: 'bg-transparent text-bone-200 hover:bg-ink-700',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tightish
        transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
