import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, UserRound, ClipboardList, ShieldCheck, ArrowUpRight, Lock } from 'lucide-react';
import usePageMeta from '../lib/usePageMeta.js';
import { useAuth } from '../context/AuthContext.jsx';
import { branchApi, userApi, memberApi, membershipPlanApi } from '../lib/api.js';
import { StatCard, PageSpinner } from '../components/ui/Misc.jsx';

function AdminDashboard() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.allSettled([branchApi.list(), userApi.list(), memberApi.list(), membershipPlanApi.list()]).then(
      ([branches, staff, members, plans]) => {
        setStats({
          branches: branches.status === 'fulfilled' ? branches.value.data.length : 0,
          staff: staff.status === 'fulfilled' ? staff.value.data.length : 0,
          members: members.status === 'fulfilled' ? members.value.data.length : 0,
          plans: plans.status === 'fulfilled' ? plans.value.data.length : 0,
        });
      }
    );
  }, []);

  if (!stats) return <PageSpinner />;

  const cards = [
    { label: 'Active branches', value: stats.branches, icon: Building2, to: '/app/branches' },
    { label: 'Staff members', value: stats.staff, icon: Users, to: '/app/users' },
    { label: 'Members', value: stats.members, icon: UserRound, to: '/app/members' },
    { label: 'Membership plans', value: stats.plans, icon: ClipboardList, to: '/app/membership-plans' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">
          Signed in as <span className="text-bone-100">{profile?.name || user.email}</span> — here's how
          your gym looks right now.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <StatCard label={c.label} value={c.value} icon={c.icon} accent={c.value > 0} />
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <QuickAction
          title="Add a branch"
          description="Register a new location under your gym before assigning staff or members to it."
          to="/app/branches"
          icon={Building2}
        />
        <QuickAction
          title="Build a membership plan"
          description="Set pricing, duration and access level members can be enrolled into."
          to="/app/membership-plans"
          icon={ClipboardList}
        />
        <QuickAction
          title="Onboard a member"
          description="Create a member profile and enroll them into an active plan."
          to="/app/members"
          icon={UserRound}
        />
        <QuickAction
          title="Add staff"
          description="Bring a manager, trainer, receptionist or accountant onto a branch."
          to="/app/users"
          icon={Users}
        />
      </div>
    </div>
  );
}

function QuickAction({ title, description, to, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-xl border border-ink-600 bg-ink-800 p-5 hover:border-volt-500/40 transition-colors"
    >
      <div className="rounded-lg bg-ink-700 p-2.5 shrink-0">
        <Icon size={17} className="text-volt-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-bone-100">{title}</p>
        <p className="text-xs text-ink-400 mt-1 leading-relaxed">{description}</p>
      </div>
      <ArrowUpRight size={16} className="text-ink-500 group-hover:text-volt-500 transition-colors shrink-0 mt-0.5" />
    </Link>
  );
}

function SuperAdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-400">
        Signed in as <span className="text-bone-100">{user.email}</span> — platform-level access.
      </p>
      <div className="rounded-xl border border-ink-600 bg-ink-800 p-8 flex flex-col items-start gap-4 max-w-xl">
        <div className="rounded-lg bg-volt-500/10 p-3">
          <ShieldCheck size={22} className="text-volt-500" />
        </div>
        <div>
          <h3 className="font-display text-3xl text-bone-100 leading-none mb-2">Onboard a new gym</h3>
          <p className="text-sm text-ink-400 leading-relaxed">
            As a super admin, you provision new gyms (tenants) on the platform. Once a gym is created,
            hand its admin account the tenant ID so they can be linked in.
          </p>
        </div>
        <Link
          to="/app/tenants"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-volt-500 hover:underline"
        >
          Go to Tenants <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function RestrictedDashboard() {
  const { user } = useAuth();
  return (
    <div className="rounded-xl border border-dashed border-ink-600 p-10 flex flex-col items-center text-center gap-3 max-w-lg mx-auto mt-10">
      <div className="rounded-full bg-ink-700 p-3">
        <Lock size={20} className="text-ink-400" />
      </div>
      <h3 className="font-display text-2xl text-bone-100 leading-none">No dashboard access yet</h3>
      <p className="text-sm text-ink-400 leading-relaxed">
        Your role ({user.role}) doesn't have any views enabled on this API yet — that access is
        currently reserved for gym admins. Ask your admin to extend permissions when it's ready.
      </p>
    </div>
  );
}

export default function Dashboard() {
  usePageMeta('Overview', 'Your gym at a glance');
  const { user } = useAuth();

  if (user.role === 'SUPER_ADMIN') return <SuperAdminDashboard />;
  if (user.role === 'ADMIN') return <AdminDashboard />;
  return <RestrictedDashboard />;
}
