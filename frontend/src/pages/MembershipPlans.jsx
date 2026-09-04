import { useEffect, useState } from 'react';
import { Plus, ClipboardList, Pencil, Trash2 } from 'lucide-react';
import usePageMeta from '../lib/usePageMeta.js';
import { membershipPlanApi, extractErrorMessage } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { Field, Input, Select, Textarea } from '../components/ui/Field.jsx';
import { PageSpinner, EmptyState, Badge } from '../components/ui/Misc.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const EMPTY_FORM = {
  name: '',
  description: '',
  duration: 1,
  duration_unit: 'MONTHS',
  price: '',
  discount: 0,
  access_type: 'SINGLE_BRANCH',
};

export default function MembershipPlans() {
  usePageMeta('Membership plans', 'Pricing and access tiers members enroll into');
  const toast = useToast();
  const [plans, setPlans] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    membershipPlanApi
      .list()
      .then((res) => setPlans(res.data))
      .catch(() => setPlans([]));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      description: p.description || '',
      duration: p.duration || 1,
      duration_unit: p.duration_unit || 'MONTHS',
      price: p.price || '',
      discount: p.discount || 0,
      access_type: p.access_type || 'SINGLE_BRANCH',
    });
    setError('');
    setModal({ mode: 'edit', data: p });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        duration: Number(form.duration),
        price: Number(form.price),
        discount: Number(form.discount) || 0,
      };
      if (modal.mode === 'create') {
        await membershipPlanApi.create(payload);
        toast.success('Plan created.');
      } else {
        await membershipPlanApi.update(modal.data.id, payload);
        toast.success('Plan updated.');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save plan'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await membershipPlanApi.remove(deleteTarget.id);
      toast.success('Plan removed.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not remove plan'));
    } finally {
      setDeleting(false);
    }
  };

  if (plans === null) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        <Button onClick={openCreate}>
          <Plus size={15} /> New plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No plans yet"
          description="Create pricing tiers members can be enrolled into."
          action={<Button onClick={openCreate}><Plus size={15} /> New plan</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="rounded-xl border border-ink-600 bg-ink-800 p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <p className="font-display text-2xl text-bone-100 leading-none">{p.name}</p>
                <Badge>{p.access_type === 'ALL_BRANCHES' ? 'All branches' : 'Single branch'}</Badge>
              </div>
              <p className="text-xs text-ink-400 leading-relaxed mb-4 flex-1">{p.description || 'No description provided.'}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-display text-3xl text-volt-500 leading-none tabular">₹{p.price}</p>
                  <p className="text-[11px] text-ink-400 mt-1">
                    per {p.duration} {p.duration_unit.toLowerCase()}
                    {p.discount > 0 ? ` · ₹${p.discount} off` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-ink-400 hover:text-volt-500 rounded-md hover:bg-ink-700">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-ink-400 hover:text-ember-500 rounded-md hover:bg-ink-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'New plan' : 'Edit plan'}>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Plan name" required>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gold" />
          </Field>
          <Field label="Description" hint="5–255 characters">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration" required>
              <Input type="number" min={1} required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </Field>
            <Field label="Duration unit" required>
              <Select required value={form.duration_unit} onChange={(e) => setForm({ ...form, duration_unit: e.target.value })}>
                <option value="DAYS">Days</option>
                <option value="WEEKS">Weeks</option>
                <option value="MONTHS">Months</option>
                <option value="YEARS">Years</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)" required>
              <Input type="number" min={0} step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Discount (₹)">
              <Input type="number" min={0} step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            </Field>
          </div>
          <Field label="Access" required>
            <Select required value={form.access_type} onChange={(e) => setForm({ ...form, access_type: e.target.value })}>
              <option value="SINGLE_BRANCH">Single branch</option>
              <option value="ALL_BRANCHES">All branches</option>
            </Select>
          </Field>

          {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">
              {modal?.mode === 'create' ? 'Create plan' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Remove this plan?"
        description={`${deleteTarget?.name} will be marked inactive and hidden from enrollment.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
