import { useCallback, useEffect, useRef, useState } from 'react';
import usePageMeta from '../../lib/usePageMeta.js';
// ⚠️ Ye teeno lib/api.js mein hone chahiye (path apne project ke hisaab se check kar lena)
import { memberDashboardApi, healthProfileApi, measurementApi, extractErrorMessage } from '../../lib/api.js';
import { PageSpinner, EmptyState } from '../../components/ui/Misc.jsx';

/* ------------------------------------------------------------------ *
 * Health profile fields = backend (healthProfile.validation.js) ke fields:
 * blood_group, doctor_clearance, medical_condition, allergies, current_medication,
 * injury_history, exercise_restriction, doctor_notes, health_risk_level (auto)
 * Page data: memberDashboardApi.get() -> { member, health_profile }
 * ------------------------------------------------------------------ */

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// [key, label, max length] — min 3 chars (backend rule)
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

// Backend empty string reject karta hai, isliye khali fields bhejte hi nahi
const toPayload = (f) => {
  const out = { doctor_clearance: f.doctor_clearance === 'yes' };
  if (f.blood_group) out.blood_group = f.blood_group;
  TEXT_FIELDS.forEach(([k]) => {
    const v = f[k].trim();
    if (v) out[k] = v;
  });
  return out;
};

const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

// zod issues (error / errors) + normal message dono handle
const errText = (e, fallback) => {
  const d = e?.response?.data;
  const issues = d?.error || d?.errors;
  if (Array.isArray(issues) && issues.length) return issues.map((i) => `${i.path?.join('.')}: ${i.message}`).join(' | ');
  return d?.message || e?.message || fallback;
};

const bmiLabel = (v) => {
  const n = Number(v);
  if (!n) return '';
  return n < 18.5 ? 'Underweight' : n < 25 ? 'Healthy range' : n < 30 ? 'Overweight' : 'Obese range';
};

/* ---------------------------- measurements --------------------------- */

const M_FIELDS = [
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

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';
const toInputDate = (v) => (v ? new Date(v) : new Date()).toISOString().slice(0, 10);

/*
 * ⚠️ GET /measurements tenant ke SAARE members ka data deta hai. Yahan client-side filter hai
 * taaki page chale; member portal ke liye backend pe GET /measurements/me jaisa endpoint banao
 * aur sirf is function ko badlo.
 */
const fetchMine = async (memberId) => {
  try {
    const rows = toArray(await measurementApi.list()).filter((m) => String(m.member_id) === String(memberId));
    return rows.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at));
  } catch (e) {
    if (e?.response?.status === 404) return []; // backend empty pe 404 bhejta hai
    throw e;
  }
};

/* ------------------------------ styles ------------------------------ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=Figtree:wght@400;500;600&display=swap');
.hp{--bg:#f6f4fc;--card:#fff;--ink:#1a1240;--mute:#6b6488;--line:#e2ddf3;--brand:#6a52d9;--brand-soft:#e8e3fb;--brand-ink:#4b37b0;--hero:#231466;--alert:#c8402f;--alert-soft:#fbe4df;--r:22px;
font-family:Figtree,system-ui,sans-serif;color:var(--ink);background:var(--bg);min-height:100%;padding:24px 16px 64px}
.hp *{box-sizing:border-box}
.hp-wrap{max-width:1040px;margin:0 auto;display:grid;gap:16px}
.hp h1,.hp h2,.hp .disp{font-family:'Bricolage Grotesque',Figtree,sans-serif;letter-spacing:-.02em;margin:0}
.hp button{font:inherit;cursor:pointer}
.hp :focus-visible{outline:3px solid var(--brand);outline-offset:2px;border-radius:8px}

.hp-hero{background:linear-gradient(135deg,#2c1a7d 0%,var(--hero) 55%,#1a1240 100%);color:#fff;border-radius:28px;padding:28px;display:grid;gap:24px;grid-template-columns:1fr auto;align-items:center}
.hp-hero h1{font-size:clamp(28px,5vw,44px);font-weight:800;line-height:1.05}
.hp-hero p{margin:8px 0 0;color:#cbc3f0;max-width:46ch;line-height:1.5}
.hp-hbtns{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.hp-cta{background:#fff;color:var(--ink);border:0;border-radius:999px;padding:11px 18px;font-weight:600}
.hp-cta.ghost{background:transparent;color:#fff;border:1px solid #6a5bc0}
.hp-cta.ghost:hover{border-color:#fff}
.hp-hstats{display:grid;grid-template-columns:repeat(3,minmax(92px,1fr));gap:10px}
.hp-hstat{background:rgba(255,255,255,.09);border-radius:16px;padding:12px 14px}
.hp-hstat span{font-size:12px;color:#cbc3f0;display:block}
.hp-hstat b{font:800 24px 'Bricolage Grotesque';display:block;margin-top:2px}

.hp-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
.hp-card{background:var(--card);border-radius:var(--r);padding:22px;border:1px solid var(--line);grid-column:span 12;display:flex;flex-direction:column;gap:14px}
.hp-head{display:flex;justify-content:space-between;align-items:start;gap:12px}
.hp-head h2{font-size:20px;font-weight:700}
.hp-head p{margin:4px 0 0;color:var(--mute);font-size:14px}
.hp-edit{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;font-size:14px;font-weight:600;color:var(--ink);white-space:nowrap}
.hp-edit:hover{background:var(--brand-soft);border-color:var(--brand)}

.hp-chips{display:flex;flex-wrap:wrap;gap:8px}
.hp-chip{display:inline-flex;align-items:center;gap:6px;background:var(--brand-soft);color:var(--brand-ink);border-radius:999px;padding:7px 13px;font-size:14px;font-weight:600}
.hp-chip.alert{background:var(--alert-soft);color:#8f2a1d}
.hp-empty{color:var(--mute);font-size:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.hp-link{border:0;background:none;color:var(--brand);font-weight:600;padding:0;text-decoration:underline}
.hp-link.danger{color:var(--alert)}

.hp-fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.hp-fblock{background:var(--bg);border-radius:16px;padding:14px}
.hp-fblock.alert{background:var(--alert-soft)}
.hp-fblock span{font-size:13px;color:var(--mute);display:block}
.hp-fblock.alert span{color:var(--alert)}
.hp-fblock p{margin:4px 0 0;white-space:pre-line;font-size:15px;line-height:1.45}
.hp-fblock p.none{color:var(--mute)}

/* measurement history */
.hp-mtop{display:grid;grid-template-columns:1fr 1.2fr;gap:16px;align-items:stretch}
.hp-mlatest{background:var(--bg);border-radius:18px;padding:16px;display:grid;gap:12px}
.hp-mlatest .big{font:800 40px 'Bricolage Grotesque';line-height:1}
.hp-mlatest .big em{font:500 15px Figtree;font-style:normal;color:var(--mute);margin-left:4px}
.hp-delta{font-size:14px;font-weight:600;color:var(--brand-ink)}
.hp-spark{width:100%;height:84px;display:block}
.hp-mstats{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px}
.hp-mstat{border:1px solid var(--line);border-radius:14px;padding:10px 12px}
.hp-mstat span{font-size:12px;color:var(--mute);display:block}
.hp-mstat b{font:700 18px 'Bricolage Grotesque'}
.hp-mstat b em{font:500 12px Figtree;font-style:normal;color:var(--mute);margin-left:2px}
.hp-mlist{display:grid}
.hp-mrow{display:grid;grid-template-columns:1.1fr 1fr 1fr auto;gap:12px;align-items:center;padding:12px 4px;border-top:1px solid var(--line);font-size:14px}
.hp-mrow:first-child{border-top:0}
.hp-mrow .d{font-weight:600}
.hp-mrow .m{color:var(--mute)}
.hp-mrow .a{display:flex;gap:14px;justify-content:flex-end}

.hp-scrim{position:fixed;inset:0;background:rgba(26,18,64,.55);display:flex;align-items:flex-end;justify-content:center;z-index:50}
.hp-sheet{background:#fff;width:100%;max-width:560px;border-radius:26px 26px 0 0;padding:24px;display:grid;gap:16px;max-height:90vh;overflow:auto;animation:hp-up .22s ease-out}
@keyframes hp-up{from{transform:translateY(24px);opacity:0}}
.hp-sheet h2{font-size:22px}
.hp-sheet p.sub{margin:0;color:var(--mute);font-size:14px}
.hp-field{display:grid;gap:6px;font-size:14px;font-weight:600}
.hp-field small{font-weight:400;color:var(--mute);font-size:12px}
.hp-field input,.hp-field textarea{font:400 16px Figtree;border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;width:100%;resize:vertical}
.hp-field input:focus,.hp-field textarea:focus{border-color:var(--brand);outline:none;box-shadow:0 0 0 3px var(--brand-soft)}
.hp-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.hp-blood-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.hp-blood-grid button,.hp-seg button{border:1.5px solid var(--line);background:#fff;border-radius:12px;padding:12px 0;font:700 17px 'Bricolage Grotesque'}
.hp-blood-grid button[aria-pressed=true]{background:var(--alert);border-color:var(--alert);color:#fff}
.hp-seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.hp-seg button[aria-pressed=true]{background:var(--brand);border-color:var(--brand);color:#fff}
.hp-lbl{font-size:14px;font-weight:600;margin-bottom:6px;display:block}
.hp-actions{display:flex;gap:10px;justify-content:flex-end;align-items:center;flex-wrap:wrap}
.hp-btn{border-radius:999px;padding:12px 20px;font-weight:600;border:1.5px solid var(--line);background:#fff}
.hp-btn.pri{background:var(--brand);border-color:var(--brand);color:#fff}
.hp-btn.pri:hover{background:var(--brand-ink)}
.hp-btn.danger{background:var(--alert);border-color:var(--alert);color:#fff}
.hp-btn:disabled{opacity:.6;cursor:wait}
.hp-err{color:var(--alert);font-size:14px;margin:0}
.hp-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:#fff;padding:12px 20px;border-radius:999px;font-weight:600;z-index:60}

@media(max-width:760px){
 .hp-hero{grid-template-columns:1fr}
 .hp-fgrid{grid-template-columns:1fr}
 .hp-mtop{grid-template-columns:1fr}
 .hp-mrow{grid-template-columns:1fr 1fr;row-gap:6px}.hp-mrow .a{grid-column:1/-1;justify-content:flex-start}
}
@media(min-width:761px){.hp-scrim{align-items:center}.hp-sheet{border-radius:26px}}
@media(prefers-reduced-motion:reduce){.hp-sheet{animation:none}}
`;

/* ---------------------------- small pieces --------------------------- */
function Card({ title, hint, onEdit, children, editLabel = 'Edit' }) {
  return (
    <section className="hp-card">
      <div className="hp-head">
        <div><h2>{title}</h2>{hint && <p>{hint}</p>}</div>
        <button className="hp-edit" onClick={onEdit} aria-label={`${editLabel} ${title.toLowerCase()}`}>{editLabel}</button>
      </div>
      {children}
    </section>
  );
}

function Sheet({ title, onClose, onSave, saving, error, children, saveLabel = 'Save changes', danger = false }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose; // latest onClose, bina effect dubara chalaye (warna har re-render pe focus jump hota hai)

  useEffect(() => {
    ref.current?.querySelector('input,textarea,button[aria-pressed]')?.focus();
    const esc = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  return (
    <div className="hp-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hp-sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h2>{title}</h2>
        {children}
        {error && <p className="hp-err" role="alert">{error}</p>}
        <div className="hp-actions">
          <button className="hp-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className={`hp-btn ${danger ? 'danger' : 'pri'}`} onClick={onSave} disabled={saving}>{saving ? 'Saving…' : saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ---- health profile editor ---- */
function HealthProfileEditor({ profile, onSave, onClose }) {
  const [f, setF] = useState(toForm(profile));
  const [state, setState] = useState({ saving: false, error: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const save = () => {
    for (const [k, label] of TEXT_FIELDS) {
      const v = f[k].trim();
      if (v && v.length < 3) return setState({ saving: false, error: `${label} must be at least 3 characters.` });
    }
    setState({ saving: true, error: '' });
    onSave(toPayload(f))
      .then(onClose)
      .catch((e) => setState({ saving: false, error: extractErrorMessage(e, 'Could not save health profile') }));
  };

  return (
    <Sheet title={profile ? 'Edit health profile' : 'Add health profile'} onClose={onClose} onSave={save}
      saving={state.saving} error={state.error} saveLabel="Save profile">
      <div>
        <span className="hp-lbl">Blood group</span>
        <div className="hp-blood-grid" role="group" aria-label="Blood group">
          {BLOOD_GROUPS.map((b) => (
            <button key={b} aria-pressed={f.blood_group === b} onClick={() => set('blood_group', f.blood_group === b ? '' : b)}>{b}</button>
          ))}
        </div>
      </div>

      <div>
        <span className="hp-lbl">Doctor clearance</span>
        <div className="hp-seg" role="group" aria-label="Doctor clearance">
          <button aria-pressed={f.doctor_clearance === 'yes'} onClick={() => set('doctor_clearance', 'yes')}>Yes</button>
          <button aria-pressed={f.doctor_clearance === 'no'} onClick={() => set('doctor_clearance', 'no')}>No</button>
        </div>
      </div>

      {TEXT_FIELDS.map(([key, label, max]) => (
        <label className="hp-field" key={key}>
          {label}
          <textarea rows={2} maxLength={max} value={f[key]} onChange={(e) => set(key, e.target.value)} />
          <small>3–{max} characters. Leave empty if nothing to add.</small>
        </label>
      ))}
    </Sheet>
  );
}

/* ---- measurement editor (add / edit) ---- */
function MeasurementEditor({ row, defaults, onSave, onClose }) {
  const [f, setF] = useState({
    measured_at: toInputDate(row?.measured_at),
    weight: row?.weight ?? defaults.weight ?? '',
    height: row?.height ?? defaults.height ?? '',
    ...Object.fromEntries(M_FIELDS.map(({ key }) => [key, row?.[key] ?? ''])),
  });
  const [state, setState] = useState({ saving: false, error: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const w = Number(f.weight), h = Number(f.height) / 100;
  const preview = w > 0 && h > 0 ? (w / (h * h)).toFixed(1) : null;

  const save = () => {
    if (!f.measured_at) return setState({ saving: false, error: 'Choose the date of this measurement.' });
    if (!(Number(f.weight) > 0) || !(Number(f.height) > 0))
      return setState({ saving: false, error: 'Weight (kg) and height (cm) are required.' });
    const payload = {
      measured_at: new Date(f.measured_at).toISOString(),
      weight: Number(f.weight),
      height: Number(f.height),
    };
    M_FIELDS.forEach(({ key }) => {
      if (f[key] !== '' && f[key] !== null) payload[key] = Number(f[key]);
    });
    setState({ saving: true, error: '' });
    onSave(row?.id, payload).then(onClose).catch((e) => setState({ saving: false, error: errText(e, 'Could not save. Try again.') }));
  };

  return (
    <Sheet title={row ? 'Edit measurement' : 'Add measurement'} onClose={onClose} onSave={save}
      saving={state.saving} error={state.error} saveLabel={row ? 'Save changes' : 'Add measurement'}>
      <label className="hp-field">Measured on
        <input type="date" value={f.measured_at} max={toInputDate()} onChange={(e) => set('measured_at', e.target.value)} />
      </label>
      <div className="hp-two">
        <label className="hp-field">Weight (kg)<input inputMode="decimal" value={f.weight} onChange={(e) => set('weight', e.target.value)} /></label>
        <label className="hp-field">Height (cm)<input inputMode="decimal" value={f.height} onChange={(e) => set('height', e.target.value)} /></label>
      </div>
      {preview && <p className="sub">BMI will be saved as <strong>{preview}</strong></p>}
      <p className="sub">Everything below is optional.</p>
      <div className="hp-two">
        {M_FIELDS.map(({ key, label, unit }) => (
          <label className="hp-field" key={key}>{label} ({unit})
            <input inputMode="decimal" value={f[key]} onChange={(e) => set(key, e.target.value)} />
          </label>
        ))}
      </div>
    </Sheet>
  );
}

function DeleteMeasurement({ row, onConfirm, onClose }) {
  const [state, setState] = useState({ saving: false, error: '' });
  const go = () => {
    setState({ saving: true, error: '' });
    onConfirm(row.id).then(onClose).catch((e) => setState({ saving: false, error: errText(e, 'Could not delete. Try again.') }));
  };
  return (
    <Sheet title="Delete measurement?" onClose={onClose} onSave={go} saving={state.saving} error={state.error}
      saveLabel="Delete measurement" danger>
      <p className="sub">Your measurement from {fmtDate(row.measured_at)} will be removed permanently.</p>
    </Sheet>
  );
}

function Spark({ values }) {
  if (values.length < 2) return null;
  const W = 300, H = 84, pad = 8;
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => [
    pad + (i * (W - pad * 2)) / (values.length - 1),
    H - pad - ((v - min) / span) * (H - pad * 2),
  ]);
  const last = pts[pts.length - 1];
  return (
    <svg className="hp-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img"
      aria-label={`Weight trend across ${values.length} measurements`}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#6a52d9" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="5" fill="#6a52d9" />
    </svg>
  );
}

/* ------------------------------ cards ------------------------------- */
function HealthProfileCard({ profile, onEdit }) {
  return (
    <Card title="Health profile" hint={profile ? null : 'Record conditions, allergies and restrictions so trainers can plan safely.'}
      onEdit={onEdit} editLabel={profile ? 'Edit' : 'Add'}>
      {!profile ? (
        <div className="hp-empty">
          No health profile yet.
          <button className="hp-link" onClick={onEdit}>Add health profile</button>
        </div>
      ) : (
        <>
          <div className="hp-chips">
            {profile.blood_group && <span className="hp-chip alert">Blood group {profile.blood_group}</span>}
            {profile.health_risk_level && <span className="hp-chip">{String(profile.health_risk_level).toLowerCase()} risk</span>}
            <span className="hp-chip">{profile.doctor_clearance ? 'Doctor cleared' : 'No doctor clearance'}</span>
          </div>
          <div className="hp-fgrid">
            {TEXT_FIELDS.map(([key, label]) => (
              <div key={key} className={`hp-fblock ${key === 'allergies' && profile[key] ? 'alert' : ''}`}>
                <span>{label}</span>
                <p className={profile[key] ? '' : 'none'}>{profile[key] || 'Not recorded'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function MeasurementCard({ rows, loading, error, onAdd, onEdit, onDelete }) {
  const [showAll, setShowAll] = useState(false);
  const latest = rows[0];
  const prev = rows[1];
  const delta = latest && prev ? Number(latest.weight) - Number(prev.weight) : null;
  const trend = rows.slice(0, 10).map((r) => Number(r.weight)).reverse();
  const shown = showAll ? rows : rows.slice(0, 5);
  const extras = latest ? M_FIELDS.filter(({ key }) => latest[key] != null && latest[key] !== '') : [];

  return (
    <Card title="Measurement history" hint={latest ? `Last recorded ${fmtDate(latest.measured_at)}` : null}
      onEdit={onAdd} editLabel="Add">
      {loading && <div className="hp-empty">Loading measurements…</div>}
      {!loading && error && <div className="hp-empty">{error}</div>}
      {!loading && !error && !latest && (
        <div className="hp-empty">
          No measurements yet. Add your first one to start tracking progress.
          <button className="hp-link" onClick={onAdd}>Add measurement</button>
        </div>
      )}

      {latest && (
        <>
          <div className="hp-mtop">
            <div className="hp-mlatest">
              <div>
                <span style={{ fontSize: 13, color: 'var(--mute)' }}>Weight</span>
                <div className="big">{latest.weight}<em>kg</em></div>
              </div>
              {delta !== null && (
                <div className="hp-delta">
                  {delta === 0 ? 'No change' : `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(1)} kg`} since {fmtDate(prev.measured_at)}
                </div>
              )}
              <div style={{ fontSize: 14, color: 'var(--mute)' }}>
                BMI <strong style={{ color: 'var(--ink)' }}>{latest.bmi ? Number(latest.bmi).toFixed(1) : '–'}</strong>
                {bmiLabel(latest.bmi) ? ` · ${bmiLabel(latest.bmi)}` : ''}
                {latest.height ? ` · Height ${latest.height} cm` : ''}
              </div>
            </div>
            <div className="hp-mlatest">
              <span style={{ fontSize: 13, color: 'var(--mute)' }}>Weight trend</span>
              {trend.length > 1 ? <Spark values={trend} /> : <div className="hp-empty">Add one more measurement to see your trend.</div>}
            </div>
          </div>

          {extras.length > 0 && (
            <div className="hp-mstats">
              {extras.map(({ key, label, unit }) => (
                <div className="hp-mstat" key={key}>
                  <span>{label}</span>
                  <b>{latest[key]}<em>{unit}</em></b>
                </div>
              ))}
            </div>
          )}

          <div className="hp-mlist">
            {shown.map((r) => (
              <div className="hp-mrow" key={r.id}>
                <span className="d">{fmtDate(r.measured_at)}</span>
                <span>{r.weight} kg</span>
                <span className="m">BMI {r.bmi ? Number(r.bmi).toFixed(1) : '–'}</span>
                <span className="a">
                  <button className="hp-link" onClick={() => onEdit(r)}>Edit</button>
                  <button className="hp-link danger" onClick={() => onDelete(r)}>Delete</button>
                </span>
              </div>
            ))}
          </div>
          {rows.length > 5 && (
            <button className="hp-link" style={{ alignSelf: 'flex-start' }} onClick={() => setShowAll((s) => !s)}>
              {showAll ? 'Show fewer' : `Show all ${rows.length} measurements`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}

/* ------------------------------- view -------------------------------- */
function HealthProfileView({ member, profile, onChanged }) {
  const [hpOpen, setHpOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [measures, setMeasures] = useState({ rows: [], loading: true, error: '' });
  const [mEdit, setMEdit] = useState(null);   // null | 'new' | measurement row
  const [mDelete, setMDelete] = useState(null);

  const flash = (t) => {
    setToast(t);
    setTimeout(() => setToast(''), 2200);
  };

  const loadMeasures = useCallback(async () => {
    try {
      const rows = await fetchMine(member.id);
      setMeasures({ rows, loading: false, error: '' });
    } catch (e) {
      setMeasures({ rows: [], loading: false, error: errText(e, 'Could not load your measurements.') });
    }
  }, [member.id]);

  useEffect(() => {
    loadMeasures();
  }, [loadMeasures]);

  // Health profile: pehli baar create, baad mein update (profile.id se)
  const saveProfile = async (payload) => {
    if (profile?.id) await healthProfileApi.update(profile.id, payload);
    else await healthProfileApi.create({ member_id: member.id, ...payload });
    flash('Health profile saved');
    await onChanged?.();
  };

  const saveMeasurement = async (id, payload) => {
    if (id) await measurementApi.update(id, payload);
    else await measurementApi.create({ ...payload, member_id: member.id });
    await loadMeasures();
    flash(id ? 'Measurement updated' : 'Measurement added');
  };

  const removeMeasurement = async (id) => {
    await measurementApi.remove(id);
    await loadMeasures();
    flash('Measurement deleted');
  };

  const first = (member.name || '').split(' ')[0];
  const latest = measures.rows[0];

  return (
    <div className="hp">
      <style>{css}</style>
      <div className="hp-wrap">
        <header className="hp-hero">
          <div>
            <h1>{first ? `${first}'s health profile` : 'Your health profile'}</h1>
            <p>Your trainers use this to keep your workouts safe. Keep it and your measurements up to date.</p>
            <div className="hp-hbtns">
              <button className="hp-cta" onClick={() => setHpOpen(true)}>{profile ? 'Edit health profile' : 'Add health profile'}</button>
              <button className="hp-cta ghost" onClick={() => setMEdit('new')}>Add measurement</button>
            </div>
          </div>
          <div className="hp-hstats">
            <div className="hp-hstat"><span>Blood group</span><b>{profile?.blood_group || '–'}</b></div>
            <div className="hp-hstat"><span>Risk level</span><b style={{ fontSize: 18 }}>{profile?.health_risk_level ? String(profile.health_risk_level).toLowerCase() : '–'}</b></div>
            <div className="hp-hstat"><span>Latest BMI</span><b>{latest?.bmi ? Number(latest.bmi).toFixed(1) : '–'}</b></div>
          </div>
        </header>

        <div className="hp-grid">
          <HealthProfileCard profile={profile} onEdit={() => setHpOpen(true)} />
          <MeasurementCard
            rows={measures.rows}
            loading={measures.loading}
            error={measures.error}
            onAdd={() => setMEdit('new')}
            onEdit={setMEdit}
            onDelete={setMDelete}
          />
        </div>
      </div>

      {hpOpen && <HealthProfileEditor profile={profile} onSave={saveProfile} onClose={() => setHpOpen(false)} />}
      {mEdit && (
        <MeasurementEditor
          key={mEdit === 'new' ? 'new' : mEdit.id}
          row={mEdit === 'new' ? null : mEdit}
          defaults={{ weight: latest?.weight, height: latest?.height }}
          onSave={saveMeasurement}
          onClose={() => setMEdit(null)}
        />
      )}
      {mDelete && <DeleteMeasurement row={mDelete} onConfirm={removeMeasurement} onClose={() => setMDelete(null)} />}
      {toast && <div className="hp-toast" role="status">{toast}</div>}
    </div>
  );
}

/* ------------------------------- page -------------------------------- */
export default function MyHealthProfile() {
  usePageMeta('Health profile', '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    memberDashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Could not load your profile'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageSpinner />;
  if (error || !data) return <EmptyState title="Health profile unavailable" description={error} />;

  return <HealthProfileView member={data.member} profile={data.health_profile} onChanged={load} />;
}