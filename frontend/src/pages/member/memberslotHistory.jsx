import { useEffect, useState } from 'react';
import usePageMeta from '../../lib/usePageMeta.js';
import { memberDashboardApi } from '../../lib/api.js';
import { PageSpinner, EmptyState } from '../../components/ui/Misc.jsx';
import SlotHistory from '../../components/SlotHistory.jsx';

export default function MySlotHistory() {
  usePageMeta('My slot', '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    memberDashboardApi
      .get()
      .then((res) => {
        console.log('slot page data:', res.data); // remove after debugging
        setData(res.data);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Could not load your slot'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (error || !data) return <EmptyState title="Slot unavailable" description={error} />;

  return <SlotHistory current={data.slot} history={data.slot_history} />;
}