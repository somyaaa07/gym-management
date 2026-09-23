import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-900 text-center px-6 relative overflow-hidden">
      {/* background accent */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-volt-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-volt-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* construction icon */}
        <div className="mb-4 text-volt-500 animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.375l-5.85 4.883m5.85-4.883l-2.5-2.5m-3.35 5.383l-2.5-2.5"
            />
          </svg>
        </div>

        <p className="font-display text-7xl text-volt-500 leading-none tracking-tight">
          🚧
        </p>
        <h1 className="font-display text-3xl text-bone-100 mt-4 mb-2">
          Still Building This
        </h1>
        <p className="text-sm text-ink-400 mb-6 max-w-sm">
          This page is under construction. We're putting the finishing touches on it — check back soon.
        </p>

        <div className="flex items-center gap-2 mb-8 text-xs text-ink-500 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-volt-500 animate-ping" />
          Work in progress
        </div>

        <Link to="/">
          <Button>Back home</Button>
        </Link>
      </div>
    </div>
  );
}