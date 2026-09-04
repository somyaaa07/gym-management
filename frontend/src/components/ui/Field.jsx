export function Field({ label, hint, error, required, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-bone-300 mb-1.5">
        {label} {required && <span className="text-ember-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[11px] text-ink-400 mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-ember-500 mt-1">{error}</span>}
    </label>
  );
}

const baseClasses =
  'w-full rounded-md bg-ink-800 border border-ink-600 px-3 py-2 text-sm text-bone-100 placeholder:text-ink-400 outline-none focus:border-volt-500 transition-colors';

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
