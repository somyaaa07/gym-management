import { useEffect, useState } from 'react';
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import usePageMeta from '../lib/usePageMeta.js';
import { branchApi, extractErrorMessage } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { Field, Input } from '../components/ui/Field.jsx';
import Table from '../components/ui/Table.jsx';
import { PageSpinner, EmptyState } from '../components/ui/Misc.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const EMPTY_FORM = {
  name: '',
  code: '',
  phone: '',
  email: '',
  address_line: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  opening_time: '06:00',
  closing_time: '22:00',
  capacity: 100,
};

export default function Branches() {
  usePageMeta('Branches', 'Locations under your gym');
  const toast = useToast();
  const [branches, setBranches] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', data }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    branchApi
      .list()
      .then((res) => setBranches(res.data))
      .catch(() => setBranches([]));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (branch) => {
    setForm({
      name: branch.name || '',
      code: branch.code || '',
      phone: branch.phone || '',
      email: branch.email || '',
      address_line: branch.address_line || '',
      city: branch.city || '',
      state: branch.state || '',
      postal_code: branch.postal_code || '',
      country: branch.country || '',
      opening_time: branch.opening_time || '06:00',
      closing_time: branch.closing_time || '22:00',
      capacity: branch.capacity || 100,
    });
    setError('');
    setModal({ mode: 'edit', data: branch });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      if (modal.mode === 'create') {
        await branchApi.create(payload);
        toast.success('Branch created.');
      } else {
        await branchApi.update(modal.data.id, payload);
        toast.success('Branch updated.');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save branch'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await branchApi.remove(deleteTarget.id);
      toast.success('Branch removed.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not remove branch'));
    } finally {
      setDeleting(false);
    }
  };

  if (branches === null) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">{branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>
        <Button onClick={openCreate}>
          <Plus size={15} /> New branch
        </Button>
      </div>

      {branches.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No branches yet"
          description="Add your first location to start assigning staff and members to it."
          action={
            <Button onClick={openCreate}>
              <Plus size={15} /> New branch
            </Button>
          }
        />
      ) : (
        <Table
          columns={[
            { key: 'name', header: 'Branch' },
            { key: 'code', header: 'Code' },
            { key: 'city', header: 'City' },
            { key: 'hours', header: 'Hours', render: (r) => `${r.opening_time} – ${r.closing_time}` },
            { key: 'capacity', header: 'Capacity' },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(r);
                    }}
                    className="p-1.5 text-ink-400 hover:text-volt-500 rounded-md hover:bg-ink-700"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(r);
                    }}
                    className="p-1.5 text-ink-400 hover:text-ember-500 rounded-md hover:bg-ink-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
          rows={branches}
        />
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'New branch' : 'Edit branch'}
        width="max-w-xl"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Branch name" required>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Downtown" />
            </Field>
            <Field label="Branch code" required hint="Unique short code">
              <Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="DTN01" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" required>
              <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Email" required>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
          </div>
          <Field label="Address" required>
            <Input required value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" required>
              <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="State" required>
              <Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </Field>
            <Field label="Postal code" required>
              <Input required value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            </Field>
          </div>
          <Field label="Country" required>
            <Input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="India" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Opens" required>
              <Input type="time" required value={form.opening_time} onChange={(e) => setForm({ ...form, opening_time: e.target.value })} />
            </Field>
            <Field label="Closes" required>
              <Input type="time" required value={form.closing_time} onChange={(e) => setForm({ ...form, closing_time: e.target.value })} />
            </Field>
            <Field label="Capacity" required>
              <Input type="number" min={1} required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </Field>
          </div>

          {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {modal?.mode === 'create' ? 'Create branch' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Remove this branch?"
        description={`${deleteTarget?.name} will be deactivated and hidden from active lists.`}
        confirmLabel="Remove branch"
      />
    </div>
  );
}
