import { useEffect, useState } from 'react';
import { Plus, Users as UsersIcon, Pencil, Trash2 } from 'lucide-react';
import usePageMeta from '../lib/usePageMeta.js';
import { userApi, branchApi, extractErrorMessage } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { Field, Input, Select } from '../components/ui/Field.jsx';
import Table from '../components/ui/Table.jsx';
import { PageSpinner, EmptyState, Badge } from '../components/ui/Misc.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const ROLES = ['MANAGER', 'TRAINER', 'RECEPTIONIST', 'ACCOUNTANT'];

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', branch_id: '', role: 'TRAINER' };

export default function Users() {
  usePageMeta('Staff', 'Manage branch-level team members');
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    userApi
      .list()
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    load();
    branchApi.list().then((res) => setBranches(res.data)).catch(() => setBranches([]));
  }, []);

  const branchName = (id) => branches.find((b) => b.id === id)?.name || '—';

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, branch_id: branches[0]?.id || '' });
    setError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', branch_id: u.branch_id || '', role: u.role });
    setError('');
    setModal({ mode: 'edit', data: u });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!branches.length) {
      setError('Create a branch first — staff must belong to one.');
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await userApi.create(form);
        toast.success('Staff member added.');
      } else {
        const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, branch_id: form.branch_id };
        if (form.password) payload.password = form.password;
        await userApi.update(modal.data.id, payload);
        toast.success('Staff member updated.');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save staff member'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await userApi.remove(deleteTarget.id);
      toast.success('Staff member removed.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not remove staff member'));
    } finally {
      setDeleting(false);
    }
  };

  if (users === null) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">{users.length} staff member{users.length !== 1 ? 's' : ''}</p>
        <Button onClick={openCreate}>
          <Plus size={15} /> Add staff
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No staff yet"
          description="Add managers, trainers, receptionists or accountants to your branches."
          action={
            <Button onClick={openCreate}>
              <Plus size={15} /> Add staff
            </Button>
          }
        />
      ) : (
        <Table
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role', render: (r) => <Badge>{r.role}</Badge> },
            { key: 'branch', header: 'Branch', render: (r) => branchName(r.branch_id) },
            { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="p-1.5 text-ink-400 hover:text-volt-500 rounded-md hover:bg-ink-700">
                    <Pencil size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }} className="p-1.5 text-ink-400 hover:text-ember-500 rounded-md hover:bg-ink-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
          rows={users}
        />
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Add staff' : 'Edit staff'}>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name" required>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email" required>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone" required>
            <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label={modal?.mode === 'create' ? 'Password' : 'New password'} required={modal?.mode === 'create'} hint={modal?.mode === 'edit' ? 'Leave blank to keep current password' : 'At least 8 characters'}>
            <Input type="password" required={modal?.mode === 'create'} minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" required>
              <Select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Branch" required>
              <Select required value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                <option value="" disabled>Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">
              {modal?.mode === 'create' ? 'Add staff' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Remove this staff member?"
        description={`${deleteTarget?.name} will lose access immediately.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
