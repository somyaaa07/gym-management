import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: `
    bg-gradient-brand text-white
    shadow-glow
    hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg
    active:translate-y-0 active:brightness-95
    focus-visible:ring-2 focus-visible:ring-volt-400/60
  `,

  secondary: `
    bg-ink-800/90 text-bone-100
    border border-ink-600
    shadow-soft
    hover:-translate-y-0.5
    hover:border-volt-400/70
    hover:bg-ink-700
    hover:text-volt-400
    active:translate-y-0
    focus-visible:ring-2 focus-visible:ring-volt-400/40
  `,

  danger: `
    bg-ember-500/5 text-ember-400
    border border-ember-500/40
    hover:-translate-y-0.5
    hover:bg-ember-500/10
    hover:border-ember-500/70
    active:translate-y-0
    focus-visible:ring-2 focus-visible:ring-ember-500/30
  `,

  ghost: `
    bg-transparent text-bone-200
    hover:bg-ink-700/80
    hover:text-white
    active:bg-ink-600
    focus-visible:ring-2 focus-visible:ring-volt-400/30
  `,
};

const SIZES = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12.5 px-6 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled = false,
  type = "button",
  leftIcon,
  rightIcon,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`
        group relative
        inline-flex items-center justify-center
        gap-2 overflow-hidden
        rounded-xl
        font-semibold tracking-tight
        whitespace-nowrap
        select-none
        transition-all duration-200 ease-out
        focus:outline-none
        disabled:cursor-not-allowed
        disabled:translate-y-0
        disabled:opacity-50
        disabled:shadow-none

        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      {...rest}
    >
      {/* Subtle shine */}
      {variant === "primary" && !isDisabled && (
        <span
          className="
            pointer-events-none absolute inset-0
            -translate-x-full
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
            transition-transform duration-700
            group-hover:translate-x-full
          "
        />
      )}

      {/* Content */}
      {/* Content */}
      <span className="relative inline-flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 size={15} strokeWidth={2.5} className="animate-spin" />
        ) : (
          leftIcon
        )}

        <span className="inline-flex items-center gap-2">{children}</span>

        {!loading && rightIcon && rightIcon}
      </span>
    </button>
  );
}
