import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  Users,
  UserRound,
  ClipboardList,
  Repeat,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const SUPER_ADMIN_NAV = [
  { to: '/app/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/app/tenants', label: 'Gyms (Tenants)', icon: ShieldCheck },
];

const ADMIN_NAV = [
  { to: '/app/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/app/tenant', label: 'My Gym', icon: Building2 },
  { to: '/app/branches', label: 'Branches', icon: Building2 },
  { to: '/app/users', label: 'Staff', icon: Users },
  { to: '/app/members', label: 'Members', icon: UserRound },
  { to: '/app/membership-plans', label: 'Plans', icon: ClipboardList },
  { to: '/app/memberships', label: 'Memberships', icon: Repeat },
];

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user } = useAuth();
  const items = user?.role === 'SUPER_ADMIN' ? SUPER_ADMIN_NAV : ADMIN_NAV;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-ink-950/70 z-30 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-ink-950 border-r border-ink-700
          flex flex-col transition-transform duration-200 lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-ink-700">
          <div className="rounded-md bg-volt-500 p-1.5">
            <Dumbbell size={16} className="text-ink-900" />
          </div>
          <span className="font-display text-2xl tracking-tightish text-bone-100 leading-none pt-0.5">
            IRONLINE
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-volt-500/10 text-volt-500'
                    : 'text-bone-300 hover:bg-ink-800 hover:text-bone-100'
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-ink-700">
          <p className="text-[11px] text-ink-400 leading-relaxed">
            Ironline — multi-branch gym operations, built on your API.
          </p>
        </div>
      </aside>
    </>
  );
}
