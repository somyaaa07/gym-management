import { useState } from 'react';
import { HeartPulse, Pencil, Plus } from 'lucide-react';
import { healthProfileApi, extractErrorMessage } from '../lib/api.js';
import Button from './ui/Button.jsx';
import Modal from './ui/Modal.jsx';
import { Field, Select, Textarea } from './ui/Field.jsx';
import { EmptyState, Badge } from './ui/Misc.jsx';
import { useToast } from './ui/Toast.jsx';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// [key, label, max length] (limits match healthProfile.validation.js, min is 3)
const TEXT_FIELDS = [
  ['medical_condition', 'Medical conditions', 500],
  ['allergies', 'Allergies', 300],
  ['current_medication', 'Current medication', 500],
  ['injury_history', 'Injury history', 1000],
  ['exercise_restriction', 'Exercise restrictions', 500],
  ['doctor_notes', 'Doctor notes', 1000],
];

const toForm = (p) => ({
  blood_group: p?.blood_group || '',
  doctor_clearance: p?.doctor_clearance ? 'yes' : 'no',
  ...Object.fromEntries(TEXT_FIELDS.map(([k]) => [k, p?.[k] || ''])),
});

// The API rejects empty strings (min 3 chars), so empty fields are simply not sent.
const toPayload = (f) => {
  const out = { doctor_clearance: f.doctor_clearance === 'yes' };
  if (f.blood_group) out.blood_group = f.blood_group;
  TEXT_FIELDS.forEach(([k]) => {
    const v = f[k].trim();
    if (v) out[k] = v;
  });
  return out;
};

/**
 * Props
 *  memberId    members.id of the person the profile belongs to
 *  memberName  shown in the modal subtitle
 *  profile     the health profile object, or null if none exists yet
 *  onChanged   called after a successful save so the parent can reload
 *  canEdit     hide Add/Edit buttons when false (default true)
 */
export default function HealthProfileSection({ memberId, memberName, profile, onChanged, canEdit = true }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(toForm(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openModal = () => {
    setForm(toForm(profile));
    setError('');
    setOpen(true);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setError('');

    for (const [k, label] of TEXT_FIELDS) {
      const v = form[k].trim();
      if (v && v.length < 3) return setError(`${label} must be at least 3 characters.`);
    }

    setSaving(true);
    try {
      const payload = toPayload(form);
      if (profile) {
        await healthProfileApi.update(profile.id, payload);
      } else {
        await healthProfileApi.create({ member_id: memberId, ...payload });
      }
      toast.success('Health profile saved.');
      setOpen(false);
      onChanged?.();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save health profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h3 className="font-display text-2xl text-bone-100 leading-none">Health profile</h3>
        {profile && canEdit && (
          <Button variant="secondary" size="sm" onClick={openModal}>
            <Pencil size={14} /> Edit
          </Button>
        )}
      </div>

      {!profile ? (
        <EmptyState
          icon={HeartPulse}
          title="No health profile yet"
          description="Record conditions, allergies and restrictions so trainers can plan safely."
          action={canEdit ? <Button onClick={openModal}><Plus size={15} /> Add health profile</Button> : null}
        />
      ) : (
        <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {profile.blood_group && <Badge>{profile.blood_group}</Badge>}
            {profile.health_risk_level && <Badge>{profile.health_risk_level} RISK</Badge>}
            <Badge>{profile.doctor_clearance ? 'DOCTOR CLEARED' : 'NO CLEARANCE'}</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {TEXT_FIELDS.map(([key, label]) => (
              <div key={key}>
                <p className="text-[11px] text-ink-400">{label}</p>
                <p className="text-bone-100 whitespace-pre-line">{profile[key] || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={profile ? 'Edit health profile' : 'Add health profile'}
        subtitle={memberName}
        width="max-w-2xl"
      >
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Blood group">
              <Select value={form.blood_group} onChange={set('blood_group')}>
                <option value="">Not set</option>
                {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
              </Select>
            </Field>
            <Field label="Doctor clearance">
              <Select value={form.doctor_clearance} onChange={set('doctor_clearance')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {TEXT_FIELDS.map(([key, label, max]) => (
              <Field key={key} label={label} hint={`3–${max} characters`}>
                <Textarea rows={2} maxLength={max} value={form[key]} onChange={set(key)} />
              </Field>
            ))}
          </div>

          <p className="text-xs text-ink-400">Risk level is calculated automatically when you save.</p>

          {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Save profile</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}