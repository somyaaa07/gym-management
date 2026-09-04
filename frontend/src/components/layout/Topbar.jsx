import { useState } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Gym Admin',
  MANAGER: 'Manager',
  TRAINER: 'Trainer',
  RECEPTIONIST: 'Receptionist',
  ACCOUNTANT: 'Accountant',
};

export default function Topbar({ title, subtitle, onOpenMobile }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 h-16 px-4 sm:px-6 border-b border-ink-700 bg-ink-900/90 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden shrink-0 rounded-md p-1.5 text-bone-200 hover:bg-ink-700"
        >
          <Menu size={19} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl leading-none tracking-tightish text-bone-100 truncate">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-ink-400 mt-1 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-lg border border-ink-600 bg-ink-800 pl-1.5 pr-2.5 py-1.5 hover:border-ink-500 transition-colors"
        >
          <div className="h-7 w-7 rounded-md bg-volt-500 flex items-center justify-center text-ink-900 text-xs font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-bone-100 leading-tight">{displayName}</p>
            <p className="text-[10px] text-ink-400 leading-tight">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-ink-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-ink-600 bg-ink-800 shadow-xl z-20 overflow-hidden">
              <div className="px-3.5 py-3 border-b border-ink-600">
                <p className="text-xs text-bone-100 truncate">{user?.email}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">{ROLE_LABELS[user?.role] || user?.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-xs text-ember-500 hover:bg-ink-700 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
