import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${width} h-full sm:h-auto sm:max-h-[88vh] overflow-y-auto
          bg-ink-800 sm:rounded-xl border-l sm:border border-ink-600 shadow-2xl
          animate-[slideIn_0.2s_ease-out]`}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-ink-600 bg-ink-800/95 backdrop-blur px-6 py-5">
          <div>
            <h2 className="font-display text-2xl tracking-tightish text-bone-100 leading-none">{title}</h2>
            {subtitle && <p className="text-xs text-ink-400 mt-1.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-ink-400 hover:text-bone-100 hover:bg-ink-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @media (min-width: 640px) {
          @keyframes slideIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        }
      `}</style>
    </div>
  );
}
