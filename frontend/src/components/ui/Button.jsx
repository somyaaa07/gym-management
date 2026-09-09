import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-gradient-brand text-white shadow-glow hover:brightness-105 active:brightness-95 disabled:opacity-50 disabled:shadow-none',
  secondary:
    'bg-ink-800 text-bone-100 border border-ink-600 hover:border-volt-400 hover:text-volt-500 shadow-soft',
  danger: 'bg-transparent text-ember-500 border border-ember-500/40 hover:bg-ember-500/10',
  ghost: 'bg-transparent text-bone-200 hover:bg-ink-700',
};

const SIZES = {
  sm: 'text-xs px-3.5 py-2',
  md: 'text-sm px-5 py-2.75',
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tightish
        transition-all duration-150 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
