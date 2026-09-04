import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserRound, Pencil, Trash2 } from 'lucide-react';
import usePageMeta from '../lib/usePageMeta.js';
import { memberApi, branchApi, extractErrorMessage } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { Field, Input, Select, Textarea } from '../components/ui/Field.jsx';
import Table from '../components/ui/Table.jsx';
import { PageSpinner, EmptyState, Badge } from '../components/ui/Misc.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  date_of_birth: '',
  gender: 'male',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  joining_date: new Date().toISOString().slice(0, 10),
  branch_id: '',
};

export default function Members() {
  usePageMeta('Members', 'Everyone training under your gym');
  const toast = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState(null);
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    memberApi
      .list()
      .then((res) => setMembers(res.data))
      .catch(() => setMembers([]));
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

  const openEdit = (m) => {
    setForm({
      name: m.name || '',
      phone: m.phone || '',
      email: m.email || '',
      date_of_birth: m.date_of_birth || '',
      gender: m.gender || 'male',
      address: m.address || '',
      emergency_contact_name: m.emergency_contact_name || '',
      emergency_contact_phone: m.emergency_contact_phone || '',
      joining_date: m.joining_date ? String(m.joining_date).slice(0, 10) : EMPTY_FORM.joining_date,
      branch_id: m.branch_id || '',
    });
    setError('');
    setModal({ mode: 'edit', data: m });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!branches.length) {
      setError('Create a branch first — members must belong to one.');
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await memberApi.create(form);
        toast.success('Member added.');
      } else {
        await memberApi.update(modal.data.id, form);
        toast.success('Member updated.');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save member'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await memberApi.remove(deleteTarget.id);
      toast.success('Member removed.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not remove member'));
    } finally {
      setDeleting(false);
    }
  };

  if (members === null) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        <Button onClick={openCreate}>
          <Plus size={15} /> New member
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No members yet"
          description="Onboard your first member, then enroll them into a membership plan."
          action={
            <Button onClick={openCreate}>
              <Plus size={15} /> New member
            </Button>
          }
        />
      ) : (
        <Table
          onRowClick={(r) => navigate(`/app/members/${r.id}`)}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'phone', header: 'Phone' },
            { key: 'branch', header: 'Branch', render: (r) => branchName(r.branch_id) },
            { key: 'joining_date', header: 'Joined', render: (r) => String(r.joining_date).slice(0, 10) },
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
          rows={members}
        />
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'New member' : 'Edit member'} width="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name" required>
              <Input required minLength={5} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Phone" required>
              <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Date of birth">
              <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
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
          <Field label="Address" hint="10–100 characters">
            <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Emergency contact name">
              <Input value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} />
            </Field>
            <Field label="Emergency contact phone">
              <Input value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} />
            </Field>
          </div>
          <Field label="Joining date" required>
            <Input type="date" required value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} />
          </Field>

          {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">
              {modal?.mode === 'create' ? 'Add member' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Remove this member?"
        description={`${deleteTarget?.name} will be marked inactive.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
