import { useCallback, useEffect, useMemo, useState } from 'react';
// ⚠️ Apne project ke hisaab se paths adjust kar lena
import { measurementApi } from '../api/measurementApi';
import { memberApi } from '../api/memberApi';   // expects: memberApi.list()
import { branchApi } from '../api/branchApi';   // expects: branchApi.list()

/* ---------- helpers ---------- */

// unwrap() ka shape pata nahi -> dono cases handle: { data: [...] } ya seedha [...]
const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

const errMsg = (e) => {
  const d = e?.response?.data;
  if (d?.error?.length) return d.error.map((i) => `${i.path?.join('.')}: ${i.message}`).join(' | ');
  if (d?.errors?.length) return d.errors.map((i) => `${i.path?.join('.')}: ${i.message}`).join(' | ');
  return d?.message || e?.message || 'Something went wrong';
};

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const toInputDate = (v) => (v ? new Date(v).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));

const bmiInfo = (bmi) => {
  const n = Number(bmi);
  if (!n) return { label: '—', cls: 'text-zinc-400 bg-zinc-800' };
  if (n < 18.5) return { label: 'Underweight', cls: 'text-sky-300 bg-sky-500/10' };
  if (n < 25) return { label: 'Normal', cls: 'text-emerald-300 bg-emerald-500/10' };
  if (n < 30) return { label: 'Overweight', cls: 'text-amber-300 bg-amber-500/10' };
  return { label: 'Obese', cls: 'text-rose-300 bg-rose-500/10' };
};

const REQUIRED = ['weight', 'height'];
const OPTIONAL = [
  { key: 'body_fat', label: 'Body fat', unit: '%' },
  { key: 'muscle_mass', label: 'Muscle mass', unit: 'kg' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'arms', label: 'Arms', unit: 'cm' },
  { key: 'thighs', label: 'Thighs', unit: 'cm' },
  { key: 'neck', label: 'Neck', unit: 'cm' },
  { key: 'systolic_bp', label: 'Systolic BP', unit: 'mmHg' },
  { key: 'diastolic_bp', label: 'Diastolic BP', unit: 'mmHg' },
];

const emptyForm = () => ({
  member_id: '',
  measured_at: toInputDate(),
  weight: '',
  height: '',
  ...Object.fromEntries(OPTIONAL.map((f) => [f.key, ''])),
});

const inputCls =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 disabled:opacity-50';

/* ---------- page ---------- */

export default function MeasurementsPage() {
  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { type: 'ok' | 'err', text }

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // measurement object | null
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  /* ----- data ----- */

  const memberMap = useMemo(() => {
    const m = {};
    members.forEach((x) => (m[x.id] = x));
    return m;
  }, [members]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = branchId ? await measurementApi.getByBranch(branchId) : await measurementApi.list();
      const list = toArray(res).sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at));
      setRows(list);
    } catch (e) {
      // backend empty list pe 404 bhejta hai -> usko error nahi, empty state maano
      if (e?.response?.status === 404) setRows([]);
      else flash('err', errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        setMembers(toArray(await memberApi.list()));
      } catch (e) {
        flash('err', 'Members load nahi hue: ' + errMsg(e));
      }
      try {
        setBranches(toArray(await branchApi.list()));
      } catch {
        /* branch filter optional hai */
      }
    })();
  }, []);

  const memberName = (id) => {
    const m = memberMap[id];
    return m ? m.name || m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || `#${id}` : `#${id}`;
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => memberName(r.member_id).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, memberMap]);

  /* ----- summary ----- */

  const summary = useMemo(() => {
    const avg = (key) => {
      const v = visible.map((r) => Number(r[key])).filter((n) => n > 0);
      return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '—';
    };
    const memberCount = new Set(visible.map((r) => r.member_id)).size;
    return { total: visible.length, memberCount, avgWeight: avg('weight'), avgBmi: avg('bmi') };
  }, [visible]);

  /* ----- modal ----- */

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      member_id: row.member_id,
      measured_at: toInputDate(row.measured_at),
      weight: row.weight ?? '',
      height: row.height ?? '',
      ...Object.fromEntries(OPTIONAL.map((f) => [f.key, row[f.key] ?? ''])),
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setModalOpen(false);
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const buildPayload = () => {
    const payload = {
      measured_at: new Date(form.measured_at).toISOString(),
      weight: Number(form.weight),
      height: Number(form.height),
    };
    if (!editing) payload.member_id = Number(form.member_id) || form.member_id;
    OPTIONAL.forEach(({ key }) => {
      if (form[key] !== '' && form[key] !== null) payload[key] = Number(form[key]);
    });
    return payload;
  };

  const handleSave = async () => {
    setFormError('');
    if (!editing && !form.member_id) return setFormError('Member select karo');
    for (const k of REQUIRED) {
      if (!form[k] || Number(form[k]) <= 0) return setFormError(`${k} valid number hona chahiye`);
    }
    if (!form.measured_at) return setFormError('Measurement date required hai');

    setSaving(true);
    try {
      if (editing) {
        await measurementApi.update(editing.id, buildPayload());
        flash('ok', 'Measurement updated');
      } else {
        await measurementApi.create(buildPayload());
        flash('ok', 'Measurement added');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await measurementApi.remove(toDelete.id);
      flash('ok', 'Measurement deleted');
      setToDelete(null);
      await load();
    } catch (e) {
      flash('err', errMsg(e));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  /* live BMI preview in form */
  const previewBmi = useMemo(() => {
    const w = Number(form.weight);
    const h = Number(form.height) / 100;
    return w > 0 && h > 0 ? (w / (h * h)).toFixed(1) : null;
  }, [form.weight, form.height]);

  /* ---------- render ---------- */

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Measurements</h1>
            <p className="mt-1 text-sm text-zinc-400">Track member body stats and progress over time.</p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            Add measurement
          </button>
        </div>

        {/* notice */}
        {notice && (
          <div
            role="status"
            className={`mt-4 rounded-lg border px-4 py-2 text-sm ${
              notice.type === 'ok'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Records', value: summary.total },
            { label: 'Members measured', value: summary.memberCount },
            { label: 'Avg weight (kg)', value: summary.avgWeight },
            { label: 'Avg BMI', value: summary.avgBmi },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="text-xs text-zinc-400">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            className={inputCls + ' sm:max-w-xs'}
            placeholder="Search by member name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {branches.length > 0 && (
            <select className={inputCls + ' sm:max-w-xs'} value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || `Branch #${b.id}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                {['Member', 'Date', 'Weight', 'Height', 'BMI', 'Body fat', 'BP', ''].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                    Loading measurements…
                  </td>
                </tr>
              )}

              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-zinc-300">No measurements yet</p>
                    <p className="mt-1 text-sm text-zinc-500">Add a member's first measurement to start tracking.</p>
                    <button
                      onClick={openCreate}
                      className="mt-4 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
                    >
                      Add measurement
                    </button>
                  </td>
                </tr>
              )}

              {!loading &&
                visible.map((r) => {
                  const b = bmiInfo(r.bmi);
                  return (
                    <tr key={r.id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 font-medium">{memberName(r.member_id)}</td>
                      <td className="px-4 py-3 text-zinc-300">{fmtDate(r.measured_at)}</td>
                      <td className="px-4 py-3">{r.weight} kg</td>
                      <td className="px-4 py-3">{r.height} cm</td>
                      <td className="px-4 py-3">
                        <span className="mr-2">{r.bmi ? Number(r.bmi).toFixed(1) : '—'}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${b.cls}`}>{b.label}</span>
                      </td>
                      <td className="px-4 py-3">{r.body_fat != null ? `${r.body_fat}%` : '—'}</td>
                      <td className="px-4 py-3">
                        {r.systolic_bp && r.diastolic_bp ? `${r.systolic_bp}/${r.diastolic_bp}` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button onClick={() => openEdit(r)} className="mr-3 text-emerald-300 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => setToDelete(r)} className="text-rose-300 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* add / edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">{editing ? 'Edit measurement' : 'Add measurement'}</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-1">
                <span className="mb-1 block text-xs text-zinc-400">Member</span>
                <select
                  className={inputCls}
                  value={form.member_id}
                  disabled={!!editing}
                  onChange={(e) => setField('member_id', e.target.value)}
                >
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {memberName(m.id)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-zinc-400">Measured on</span>
                <input
                  type="date"
                  className={inputCls}
                  value={form.measured_at}
                  onChange={(e) => setField('measured_at', e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-zinc-400">Weight (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={inputCls}
                  value={form.weight}
                  onChange={(e) => setField('weight', e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-zinc-400">Height (cm)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={inputCls}
                  value={form.height}
                  onChange={(e) => setField('height', e.target.value)}
                />
              </label>
            </div>

            {previewBmi && (
              <p className="mt-3 text-sm text-zinc-400">
                BMI: <span className="font-medium text-zinc-100">{previewBmi}</span>{' '}
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${bmiInfo(previewBmi).cls}`}>
                  {bmiInfo(previewBmi).label}
                </span>
              </p>
            )}

            <div className="mt-6 border-t border-zinc-800 pt-4">
              <p className="mb-3 text-sm text-zinc-400">Optional details</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {OPTIONAL.map((f) => (
                  <label key={f.key} className="block">
                    <span className="mb-1 block text-xs text-zinc-400">
                      {f.label} ({f.unit})
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className={inputCls}
                      value={form[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {formError && (
              <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {formError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
              >
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add measurement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {toDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !deleting && setToDelete(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Delete measurement?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              {memberName(toDelete.member_id)}'s measurement from {fmtDate(toDelete.measured_at)} will be removed
              permanently.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setToDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete measurement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}