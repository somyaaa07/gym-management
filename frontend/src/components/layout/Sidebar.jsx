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
  ScanFace,
  Fingerprint,
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
  { to: '/app/attendance', label: 'Attendance', icon: ScanFace },
  { to: '/app/faceidtest', label: 'Face Registration', icon: Fingerprint },
];


// Icons shown on the mobile bottom tab bar — keep to the 5 most-used destinations
const MOBILE_TAB_ICONS = ['/app/dashboard', '/app/members', '/app/attendance', '/app/branches', '/app/membership-plans'];

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-6 h-16 shrink-0">
      <div className="rounded-xl bg-gradient-brand p-2 shadow-glow">
        <Dumbbell size={16} className="text-white" strokeWidth={2.4} />
      </div>
      <span className="font-display text-xl font-bold tracking-tightish text-white leading-none pt-0.5">
        Gym Management
      </span>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user } = useAuth();
  const items = user?.role === 'SUPER_ADMIN' ? SUPER_ADMIN_NAV : ADMIN_NAV;
  const mobileItems = items.filter((i) => MOBILE_TAB_ICONS.includes(i.to)).slice(0, 5);

  return (
    <>
      {/* Desktop / tablet sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm z-30 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 shrink-0 bg-gradient-dark
          flex flex-col transition-transform duration-200 lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Brand />

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-white/12 text-white shadow-panel'
                    : 'text-white/55 hover:bg-white/8 hover:text-white/90'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid place-items-center h-8 w-8 rounded-lg shrink-0 transition-colors ${
                      isActive ? 'bg-gradient-brand text-white' : 'bg-white/5 text-white/50'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.2} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-4 mb-5 rounded-2xl bg-white/6 border border-white/10 px-4 py-4">
          <p className="text-[11px] text-white/45 leading-relaxed">
           GYM Management— multi-branch gym operations, built on your API.
          </p>
        </div>
      </aside>

      {/* Mobile bottom tab bar — mirrors the reference app's nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-ink-800/95 backdrop-blur-md border-t border-ink-700 shadow-nav">
        <div className="flex items-stretch justify-between px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {mobileItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 min-w-0"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid place-items-center h-9 w-9 rounded-xl transition-all ${
                      isActive ? 'bg-gradient-brand text-white shadow-glow' : 'text-ink-500'
                    }`}
                  >
                    <Icon size={17} strokeWidth={2.3} />
                  </span>
                  <span
                    className={`text-[10px] font-medium leading-none truncate max-w-full ${
                      isActive ? 'text-volt-500' : 'text-ink-500'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
