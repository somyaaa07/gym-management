import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Pencil, Snowflake, Ban } from 'lucide-react';
import usePageMeta from '../lib/usePageMeta.js';
import { memberMembershipApi, extractErrorMessage } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Field, Input, Select } from '../components/ui/Field.jsx';
import Table from '../components/ui/Table.jsx';
import { PageSpinner, EmptyState, Badge } from '../components/ui/Misc.jsx';
import { useToast } from '../components/ui/Toast.jsx';

export default function MemberMemberships() {
  usePageMeta('Memberships', 'Every enrollment across your gym');
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ payment_status: 'PAID', auto_renew: false, discount: 0 });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [freezeTarget, setFreezeTarget] = useState(null);
  const [freezeForm, setFreezeForm] = useState({ freeze_start_date: '', freeze_end_date: '' });
  const [freezeSaving, setFreezeSaving] = useState(false);
  const [freezeError, setFreezeError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () => {
    memberMembershipApi
      .list()
      .then((res) => setRows(res.data))
      .catch(() => setRows([]));
  };

  useEffect(load, []);

  const openEdit = (m) => {
    setEditForm({ payment_status: m.payment_status, auto_renew: m.auto_renew, discount: m.discount });
    setEditError('');
    setEditTarget(m);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSaving(true);
    try {
      await memberMembershipApi.update(editTarget.id, { ...editForm, discount: Number(editForm.discount) || 0 });
      toast.success('Membership updated.');
      setEditTarget(null);
      load();
    } catch (err) {
      setEditError(extractErrorMessage(err, 'Could not update membership'));
    } finally {
      setEditSaving(false);
    }
  };

  const openFreeze = (m) => {
    setFreezeForm({ freeze_start_date: '', freeze_end_date: '' });
    setFreezeError('');
    setFreezeTarget(m);
  };

  const onFreeze = async (e) => {
    e.preventDefault();
    setFreezeError('');
    setFreezeSaving(true);
    try {
      await memberMembershipApi.freeze(freezeTarget.id, freezeForm);
      toast.success('Membership frozen.');
      setFreezeTarget(null);
      load();
    } catch (err) {
      setFreezeError(extractErrorMessage(err, 'Could not freeze membership'));
    } finally {
      setFreezeSaving(false);
    }
  };

  const onDeactivate = async (id) => {
    setBusyId(id);
    try {
      await memberMembershipApi.deactivate(id);
      toast.success('Membership deactivated.');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not deactivate'));
    } finally {
      setBusyId('');
    }
  };

  if (rows === null) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-400">{rows.length} membership{rows.length !== 1 ? 's' : ''} · enroll a member from their profile page</p>

      {rows.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No memberships yet"
          description="Enroll a member into a plan from the member's profile to see it here."
        />
      ) : (
        <Table
          columns={[
            { key: 'member', header: 'Member', render: (r) => (
              <Link to={`/app/members/${r.Member?.id || r.member_id}`} className="hover:text-volt-500" onClick={(e) => e.stopPropagation()}>
                {r.Member?.name || r.member_id}
              </Link>
            ) },
            { key: 'plan', header: 'Plan', render: (r) => r.MembershipPlan?.name || '—' },
            { key: 'period', header: 'Period', render: (r) => `${String(r.start_date).slice(0, 10)} → ${String(r.end_date).slice(0, 10)}` },
            { key: 'amount', header: 'Amount', render: (r) => `₹${r.final_amount}` },
            { key: 'payment_status', header: 'Payment', render: (r) => <Badge>{r.payment_status}</Badge> },
            { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="p-1.5 text-ink-400 hover:text-volt-500 rounded-md hover:bg-ink-700">
                    <Pencil size={14} />
                  </button>
                  {r.status !== 'FROZEN' && r.status !== 'DEACTIVE' && (
                    <button onClick={(e) => { e.stopPropagation(); openFreeze(r); }} className="p-1.5 text-ink-400 hover:text-sky-400 rounded-md hover:bg-ink-700">
                      <Snowflake size={14} />
                    </button>
                  )}
                  {r.status !== 'DEACTIVE' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeactivate(r.id); }}
                      disabled={busyId === r.id}
                      className="p-1.5 text-ink-400 hover:text-ember-500 rounded-md hover:bg-ink-700 disabled:opacity-50"
                    >
                      <Ban size={14} />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      )}

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit membership" subtitle={editTarget?.Member?.name} width="max-w-sm">
        <form onSubmit={onEditSubmit} className="space-y-4">
          <Field label="Payment status" required>
            <Select required value={editForm.payment_status} onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value })}>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </Select>
          </Field>
          <Field label="Discount (₹)">
            <Input type="number" min={0} value={editForm.discount} onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })} />
          </Field>
          <Field label="Auto-renew">
            <Select value={editForm.auto_renew ? 'yes' : 'no'} onChange={(e) => setEditForm({ ...editForm, auto_renew: e.target.value === 'yes' })}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </Field>

          {editError && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{editError}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setEditTarget(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={editSaving} className="flex-1">Save changes</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!freezeTarget} onClose={() => setFreezeTarget(null)} title="Freeze membership" subtitle="Extends the end date by the frozen days" width="max-w-sm">
        <form onSubmit={onFreeze} className="space-y-4">
          <Field label="Freeze from" required>
            <Input type="date" required value={freezeForm.freeze_start_date} onChange={(e) => setFreezeForm({ ...freezeForm, freeze_start_date: e.target.value })} />
          </Field>
          <Field label="Freeze until" required>
            <Input type="date" required value={freezeForm.freeze_end_date} onChange={(e) => setFreezeForm({ ...freezeForm, freeze_end_date: e.target.value })} />
          </Field>

          {freezeError && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{freezeError}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setFreezeTarget(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={freezeSaving} className="flex-1">Freeze</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
