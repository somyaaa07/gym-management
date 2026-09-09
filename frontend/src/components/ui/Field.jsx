export function Field({ label, hint, error, required, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-bone-200 mb-1.5">
        {label} {required && <span className="text-ember-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[11px] text-ink-400 mt-1.5">{hint}</span>}
      {error && <span className="block text-[11px] text-ember-500 mt-1.5">{error}</span>}
    </label>
  );
}

const baseClasses =
  'w-full rounded-xl bg-ink-800 border border-ink-600 px-3.5 py-2.5 text-sm text-bone-100 placeholder:text-ink-400 outline-none focus:border-volt-500 focus:ring-4 focus:ring-volt-500/10 transition-all shadow-soft';

export function Input(props) {
  return <input {...props} className={`${baseClasses} ${props.className || ''}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${baseClasses} ${props.className || ''}`}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea {...props} className={`${baseClasses} resize-none ${props.className || ''}`} />;
}
