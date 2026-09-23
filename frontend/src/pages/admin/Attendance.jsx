import { useCallback, useEffect, useState } from 'react';
import { ScanFace, LogIn, LogOut, CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import usePageMeta from '../../lib/usePageMeta.js';
import { attendanceApi, branchApi, memberApi, extractErrorMessage } from '../../lib/api.js';
import FaceCamera from '../../components/FaceCamera.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, Select } from '../../components/ui/Field.jsx';
import { Spinner } from '../../components/ui/Misc.jsx';

const MODES = [
  { value: 'CHECK_IN', label: 'Check in', icon: LogIn },
  { value: 'CHECK_OUT', label: 'Check out', icon: LogOut },
];

export default function Attendance() {
  usePageMeta('Attendance', 'Check members in and out with face ID');

  const [mode, setMode] = useState('CHECK_IN');
  const [method, setMethod] = useState('FACE');

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');

  const [members, setMembers] = useState([]);
  const [manualMemberId, setManualMemberId] = useState('');

  const [scanKey, setScanKey] = useState(0);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { ok: bool, message, data }

  useEffect(() => {
    branchApi.list().then((res) => {
      setBranches(res.data || []);
      setBranchId((res.data || [])[0]?.id || '');
    }).catch(() => setBranches([]));
    memberApi.list().then((res) => setMembers(res.data || [])).catch(() => setMembers([]));
  }, []);

  const resetScan = () => {
    setImage(null);
    setResult(null);
    setScanKey((k) => k + 1);
  };

  const switchMode = (m) => {
    setMode(m);
    resetScan();
  };

  const switchMethod = (m) => {
    setMethod(m);
    resetScan();
  };

  // Memoized so FaceCamera's stream-setup effect (which depends on this
  // callback) doesn't tear down and restart the camera on every re-render.
  const handleFaceCaptured = useCallback((imageBase64) => {
    setImage(imageBase64);
  }, []);

  const submit = async () => {
    setResult(null);

    if (method === 'FACE' && !image) {
      setResult({ ok: false, message: 'Hold still in front of the camera — capturing the frame…' });
      return;
    }
    if (method === 'MANUAL' && !manualMemberId) {
      setResult({ ok: false, message: 'Select a member first.' });
      return;
    }
    if (mode === 'CHECK_IN' && !branchId) {
      setResult({ ok: false, message: 'Select a branch first.' });
      return;
    }

    const payload =
      method === 'FACE'
        ? { method: 'FACE', image, ...(mode === 'CHECK_IN' ? { branch_id: branchId } : {}) }
        : { method: 'MANUAL', member_id: manualMemberId, ...(mode === 'CHECK_IN' ? { branch_id: branchId } : {}) };

    setSubmitting(true);
    try {
      const res =
        mode === 'CHECK_IN' ? await attendanceApi.checkIn(payload) : await attendanceApi.checkOut(payload);
      setResult({ ok: true, message: res.message, data: res.data });
    } catch (err) {
      setResult({ ok: false, message: extractErrorMessage(err, 'Could not record attendance') });
    } finally {
      setSubmitting(false);
      if (method === 'FACE') {
        // let the person see the result before the camera locks onto a new frame
        setTimeout(() => setScanKey((k) => k + 1), 50);
        setImage(null);
      }
    }
  };

  // Auto-submit as soon as a face frame is captured, so the flow at a gym
  // entrance is "walk up, look at camera, done" rather than an extra tap.
  useEffect(() => {
    if (method === 'FACE' && image && !submitting) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const memberName = (id) => members.find((m) => m.id === id)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-ink-600 bg-ink-800 p-1">
          {MODES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => switchMode(value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                mode === value ? 'bg-gradient-brand text-white shadow-glow' : 'text-ink-400 hover:text-bone-100'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-xl border border-ink-600 bg-ink-800 p-1">
          {[
            { value: 'FACE', label: 'Face ID' },
            { value: 'MANUAL', label: 'Manual' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => switchMethod(value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                method === value ? 'bg-white/10 text-bone-100' : 'text-ink-400 hover:text-bone-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6 items-start">
        <div className="surface-card p-4 sm:p-5 space-y-4">
          {mode === 'CHECK_IN' && (
            <Field label="Branch" required hint="The desk / kiosk this check-in counts against">
              <Select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                <option value="" disabled>
                  {branches.length ? 'Select branch' : 'No branches yet — create one first'}
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {method === 'FACE' ? (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-ink-950">
              <span className="pointer-events-none absolute left-4 top-4 h-9 w-9 border-l-[3px] border-t-[3px] border-white/40 rounded-tl-lg z-10" />
              <span className="pointer-events-none absolute right-4 top-4 h-9 w-9 border-r-[3px] border-t-[3px] border-white/40 rounded-tr-lg z-10" />
              <span className="pointer-events-none absolute left-4 bottom-4 h-9 w-9 border-l-[3px] border-b-[3px] border-white/40 rounded-bl-lg z-10" />
              <span className="pointer-events-none absolute right-4 bottom-4 h-9 w-9 border-r-[3px] border-b-[3px] border-white/40 rounded-br-lg z-10" />

              <FaceCamera key={scanKey} resetKey={scanKey} onFaceDetected={handleFaceCaptured} />

              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 text-white/85 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />
                  {submitting ? 'Checking…' : 'Center your face'}
                </span>
              </div>

              {submitting && (
                <div className="absolute inset-0 grid place-items-center bg-ink-950/50 z-10">
                  <Spinner size={28} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Member" required>
                <Select value={manualMemberId} onChange={(e) => setManualMemberId(e.target.value)}>
                  <option value="" disabled>
                    {members.length ? 'Select member' : 'No members yet'}
                  </option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.phone}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button onClick={submit} loading={submitting} className="w-full">
                <ScanFace size={16} />
                {mode === 'CHECK_IN' ? 'Check in' : 'Check out'}
              </Button>
            </div>
          )}

          {method === 'FACE' && (
            <Button variant="secondary" onClick={resetScan} className="w-full" disabled={submitting}>
              <RotateCcw size={14} /> Rescan
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {!result && (
            <div className="surface-card p-6 flex flex-col items-center text-center gap-3">
              <div className="rounded-2xl bg-gradient-brand-soft p-3.5">
                <ScanFace size={22} className="text-volt-500" />
              </div>
              <h2 className="font-display text-lg font-bold text-bone-100">Ready to scan</h2>
              <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
                {method === 'FACE'
                  ? 'Have the member look at the camera — a frame captures automatically and checks them in or out.'
                  : `Pick a member from the list and hit ${mode === 'CHECK_IN' ? 'check in' : 'check out'}.`}
              </p>
            </div>
          )}

          {result && result.ok && (
            <div className="surface-card p-6 sm:p-7 flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-volt-500/10 p-4">
                <CheckCircle2 size={30} className="text-volt-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-bone-100">
                {mode === 'CHECK_IN' ? 'Checked in' : 'Checked out'}
              </h2>
              <p className="text-sm text-ink-400">
                {memberName(result.data?.member_id) || 'Member'} ·{' '}
                {new Date(result.data?.check_in_time || result.data?.check_out_time || Date.now()).toLocaleTimeString()}
              </p>
              {result.data?.check_in_status && (
                <span className="text-[11px] rounded-full border border-volt-500/30 bg-volt-500/10 text-volt-500 px-2.5 py-0.5">
                  {result.data.check_in_status}
                </span>
              )}
              {result.data?.check_out_status && (
                <span className="text-[11px] rounded-full border border-volt-500/30 bg-volt-500/10 text-volt-500 px-2.5 py-0.5">
                  {result.data.check_out_status}
                </span>
              )}
            </div>
          )}

          {result && !result.ok && (
            <div className="surface-card p-6 flex flex-col items-center text-center gap-3 border-ember-500/30">
              <div className="rounded-2xl bg-ember-500/10 p-3.5">
                <XCircle size={22} className="text-ember-500" />
              </div>
              <h2 className="font-display text-lg font-bold text-bone-100">Couldn't record it</h2>
              <p className="flex items-start gap-2 text-sm text-ink-400 leading-relaxed max-w-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {result.message}
              </p>
              {method === 'FACE' && (
                <Button variant="secondary" size="sm" onClick={resetScan}>
                  <RotateCcw size={13} /> Try again
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
