import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import usePageMeta from '../lib/usePageMeta.js';
import { tenantApi, extractErrorMessage } from '../lib/api.js';
import { PageSpinner, EmptyState, Badge } from '../components/ui/Misc.jsx';

export default function Tenant() {
  usePageMeta('My Gym', 'Tenant profile for your organization');
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantApi
      .me()
      .then((res) => setTenant(res.data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load gym profile')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  if (error || !tenant) {
    return (
      <EmptyState
        icon={Building2}
        title="No gym linked"
        description={error || 'Your account isn’t linked to a gym yet.'}
      />
    );
  }

  const rows = [
    { label: 'Subscription plan', value: tenant.subscription_plan || 'Standard' },
    { label: 'Max branches', value: tenant.max_branches ?? '—' },
    { label: 'Status', value: <Badge>{tenant.status}</Badge> },
    { label: 'Tenant ID', value: <code className="text-xs text-ink-400">{tenant.id}</code> },
  ];

  return (
    <div className="max-w-xl">
      <div className="rounded-xl border border-ink-600 bg-ink-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-volt-500/10 p-2.5">
            <Building2 size={18} className="text-volt-500" />
          </div>
          <h2 className="font-display text-3xl text-bone-100 leading-none">{tenant.name}</h2>
        </div>
        <dl className="divide-y divide-ink-700">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-3 text-sm">
              <dt className="text-ink-400">{r.label}</dt>
              <dd className="text-bone-100">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
