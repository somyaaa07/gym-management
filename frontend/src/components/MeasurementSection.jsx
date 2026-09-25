import { useState } from 'react';
import { Ruler, Pencil, Plus, Trash2 } from 'lucide-react';
import { measurementApi, extractErrorMessage } from '../lib/api.js';
import Button from './ui/Button.jsx';
import Modal from './ui/Modal.jsx';
import { Field, Input } from './ui/Field.jsx';
import { EmptyState, Badge } from './ui/Misc.jsx';
import { useToast } from './ui/Toast.jsx';

// Optional fields (weight + height + date are required)
const OPTIONAL_FIELDS = [
  ['body_fat', 'Body fat', '%'],
  ['muscle_mass', 'Muscle mass', 'kg'],
  ['waist', 'Waist', 'cm'],
  ['chest', 'Chest', 'cm'],
  ['arms', 'Arms', 'cm'],
  ['thighs', 'Thighs', 'cm'],
  ['neck', 'Neck', 'cm'],
  ['systolic_bp', 'Systolic BP', 'mmHg'],
  ['diastolic_bp', 'Diastolic BP', 'mmHg'],
];

const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const bmiLabel = (v) => {
  const n = Number(v);
  if (!n) return '';
  return n < 18.5 ? 'UNDERWEIGHT' : n < 25 ? 'NORMAL' : n < 30 ? 'OVERWEIGHT' : 'OBESE';
};

const toForm = (row, defaults) => ({
  measured_at: row?.measured_at ? String(row.measured_at).slice(0, 10) : today(),
  weight: row?.weight ?? defaults?.weight ?? '',
  height: row?.height ?? defaults?.height ?? '',
  ...Object.fromEntries(OPTIONAL_FIELDS.map(([k]) => [k, row?.[k] ?? ''])),
});

// zod issues (error / errors) ko readable banao, warna common helper
const errText = (err, fallback) => {
  const d = err?.response?.data;
  const issues = d?.error || d?.errors;
  if (Array.isArray(issues) && issues.length) return issues.map((i) => `${i.path?.join('.')}: ${i.message}`).join(' | ');
  return extractErrorMessage(err, fallback);
};

/**
 * Props
 *  memberId      members.id
 *  memberName    modal subtitle
 *  measurements  this member's measurements, newest first
 *  onChanged     called after add / edit / delete so parent reloads
 *  canEdit       hide buttons when false (default true)
 */
export default function MeasurementSection({ memberId, memberName, measurements = [], onChanged, canEdit = true }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(toForm(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const latest = measurements[0];
  const prev = measurements[1];
  const delta = latest && prev ? Number(latest.weight) - Number(prev.weight) : null;
  const shown = showAll ? measurements : measurements.slice(0, 5);
  const extras = latest ? OPTIONAL_FIELDS.filter(([k]) => latest[k] != null && latest[k] !== '') : [];

  const openAdd = () => {
    setEditing(null);
    setForm(toForm(null, { weight: latest?.weight, height: latest?.height }));
    setError('');
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(toForm(row));
    setError('');
    setOpen(true);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.measured_at) return setError('Choose the measurement date.');
    if (!(Number(form.weight) > 0) || !(Number(form.height) > 0)) return setError('Weight (kg) and height (cm) are required.');

    const payload = {
      measured_at: new Date(form.measured_at).toISOString(),
      weight: Number(form.weight),
      height: Number(form.height),
    };
    OPTIONAL_FIELDS.forEach(([k]) => {
      if (form[k] !== '' && form[k] !== null) payload[k] = Number(form[k]);
    });

    setSaving(true);
    try {
      if (editing) await measurementApi.update(editing.id, payload);
      else await measurementApi.create({ member_id: memberId, ...payload });
      toast.success(editing ? 'Measurement updated.' : 'Measurement added.');
      setOpen(false);
      onChanged?.();
    } catch (err) {
      setError(errText(err, 'Could not save measurement'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await measurementApi.remove(toDelete.id);
      toast.success('Measurement deleted.');
      setToDelete(null);
      onChanged?.();
    } catch (err) {
      toast.error(errText(err, 'Could not delete measurement'));
    } finally {
      setDeleting(false);
    }
  };

  const previewBmi = (() => {
    const w = Number(form.weight);
    const h = Number(form.height) / 100;
    return w > 0 && h > 0 ? (w / (h * h)).toFixed(1) : null;
  })();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h3 className="font-display text-2xl text-bone-100 leading-none">Measurements</h3>
        {canEdit && (
          <Button variant="secondary" size="sm" onClick={openAdd}>
            <Plus size={14} /> Add measurement
          </Button>
        )}
      </div>

      {!latest ? (
        <EmptyState
          icon={Ruler}
          title="No measurements yet"
          description="Record weight and height first. Goals and AI plan suggestions start from these numbers."
          action={canEdit ? <Button onClick={openAdd}><Plus size={15} /> Add measurement</Button> : null}
        />
      ) : (
        <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[11px] text-ink-400">Weight</p>
              <p className="font-display text-2xl text-bone-100 leading-none mt-1">{latest.weight} <span className="text-xs text-ink-400">kg</span></p>
              {delta !== null && (
                <p className="text-[11px] text-ink-400 mt-1">
                  {delta === 0 ? 'No change' : `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(1)} kg`} since {fmtDate(prev.measured_at)}
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] text-ink-400">Height</p>
              <p className="font-display text-2xl text-bone-100 leading-none mt-1">{latest.height} <span className="text-xs text-ink-400">cm</span></p>
            </div>
            <div>
              <p className="text-[11px] text-ink-400">BMI</p>
              <p className="font-display text-2xl text-bone-100 leading-none mt-1">{latest.bmi ? Number(latest.bmi).toFixed(1) : '—'}</p>
              {bmiLabel(latest.bmi) && <div className="mt-1.5"><Badge>{bmiLabel(latest.bmi)}</Badge></div>}
            </div>
            <div>
              <p className="text-[11px] text-ink-400">Last recorded</p>
              <p className="text-bone-100 mt-1">{fmtDate(latest.measured_at)}</p>
            </div>
          </div>

          {extras.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-ink-700 text-sm">
              {extras.map(([k, label, unit]) => (
                <div key={k}>
                  <p className="text-[11px] text-ink-400">{label}</p>
                  <p className="text-bone-100">{latest[k]} {unit}</p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-ink-700">
            <p className="text-[11px] text-ink-400 mb-2">History</p>
            <div className="divide-y divide-ink-700">
              {shown.map((m) => (
                <div key={m.id} className="flex items-center justify-between flex-wrap gap-3 py-2.5 text-sm">
                  <div className="flex items-center gap-4 flex-wrap tabular">
                    <span className="text-bone-100 w-28">{fmtDate(m.measured_at)}</span>
                    <span className="text-bone-100">{m.weight} kg</span>
                    <span className="text-ink-400">BMI {m.bmi ? Number(m.bmi).toFixed(1) : '—'}</span>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(m)}><Pencil size={13} /> Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => setToDelete(m)}><Trash2 size={13} /> Delete</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {measurements.length > 5 && (
              <button type="button" onClick={() => setShowAll((s) => !s)} className="text-xs text-ink-400 hover:text-bone-100 mt-2">
                {showAll ? 'Show fewer' : `Show all ${measurements.length} measurements`}
              </button>
            )}
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit measurement' : 'Add measurement'} subtitle={memberName} width="max-w-2xl">
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Measured on" required>
              <Input type="date" required max={today()} value={form.measured_at} onChange={set('measured_at')} />
            </Field>
            <Field label="Weight (kg)" required>
              <Input type="number" required min={0} step="0.1" value={form.weight} onChange={set('weight')} />
            </Field>
            <Field label="Height (cm)" required>
              <Input type="number" required min={0} step="0.1" value={form.height} onChange={set('height')} />
            </Field>
          </div>

          {previewBmi && <p className="text-xs text-ink-400">BMI will be saved as <span className="text-bone-100">{previewBmi}</span></p>}

          <p className="text-xs text-ink-400">Optional</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {OPTIONAL_FIELDS.map(([k, label, unit]) => (
              <Field key={k} label={`${label} (${unit})`}>
                <Input type="number" min={0} step="0.1" value={form[k]} onChange={set(k)} />
              </Field>
            ))}
          </div>

          {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Save changes' : 'Add measurement'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete measurement?" subtitle={toDelete ? fmtDate(toDelete.measured_at) : ''} width="max-w-sm">
        <p className="text-sm text-ink-400 mb-4">This measurement will be removed permanently.</p>
        <div className="flex gap-2">
          <Button variant="secondary" type="button" onClick={() => setToDelete(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" type="button" loading={deleting} onClick={onDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}