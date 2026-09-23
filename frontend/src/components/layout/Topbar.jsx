import { useState } from 'react';
import { Menu, LogOut, ChevronDown, Bell } from 'lucide-react';
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
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 h-16 sm:h-20 px-4 sm:px-6 lg:px-8 bg-ink-900/85 backdrop-blur-md border-b border-ink-700">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden shrink-0 rounded-xl p-2 text-bone-100 bg-ink-800 border border-ink-700 shadow-soft"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-lg sm:text-2xl font-semibold leading-none tracking-tightish text-bone-100 truncate">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-ink-400 mt-1.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button className="hidden sm:grid place-items-center h-10 w-10 rounded-xl bg-ink-800 border border-ink-700 text-ink-500 hover:text-volt-500 shadow-soft transition-colors">
          <Bell size={17} />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl border border-ink-700 bg-ink-800 pl-1.5 pr-2.5 py-1.5 shadow-soft hover:shadow-card transition-shadow"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold shadow-glow">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-bone-100 leading-tight">{displayName}</p>
              <p className="text-[10px] text-ink-400 leading-tight">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-ink-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-ink-700 bg-ink-800 shadow-card z-20 overflow-hidden">
                <div className="px-4 py-3.5 border-b border-ink-700 bg-gradient-brand-soft">
                  <p className="text-xs font-medium text-bone-100 truncate">{user?.email}</p>
                  <p className="text-[10px] text-ink-500 mt-0.5">{ROLE_LABELS[user?.role] || user?.role}</p>
                </div>
                <button
                  onClick={async() => {
                    await logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-xs font-medium text-ember-500 hover:bg-ember-500/8 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
