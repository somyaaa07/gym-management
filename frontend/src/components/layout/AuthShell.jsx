import { Dumbbell } from 'lucide-react';

export default function AuthShell({ eyebrow, title, children }) {
  return (
    <div className="min-h-screen flex bg-ink-900">
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 overflow-hidden bg-ink-950">
       
        <div className="relative flex items-center gap-2.5">
          <div className="rounded-md bg-volt-500 p-1.5">
            <Dumbbell size={16} className="text-ink-900" />
          </div>
          <span className="font-display text-2xl tracking-tightish text-bone-100 leading-none pt-0.5">
            IRONLINE
          </span>
        </div>

        <div className="relative">
          <p className="text-volt-500 text-xs font-medium tracking-wide mb-4">{eyebrow}</p>
          <h1 className="font-display text-6xl xl:text-7xl leading-[0.92] text-bone-100 max-w-md">
            {title}
          </h1>
        </div>

        <p className="relative text-xs text-ink-400 max-w-xs leading-relaxed">
          One system for every branch, every membership, every rep of the business —
          built directly on top of your gym's own API.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="rounded-md bg-volt-500 p-1.5">
              <Dumbbell size={16} className="text-ink-900" />
            </div>
            <span className="font-display text-2xl tracking-tightish text-bone-100 leading-none pt-0.5">
              IRONLINE
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
