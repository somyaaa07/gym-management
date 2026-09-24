import { useEffect, useRef, useState } from 'react';
import usePageMeta from '../../lib/usePageMeta.js';
import { memberDashboardApi } from '../../lib/api.js';
import { PageSpinner, EmptyState } from '../../components/ui/Misc.jsx';

/* ------------------------------------------------------------------ *
 * Assumed profile shape (adjust keys in SECTIONS / helpers if yours differ):
 * { blood_group, height_cm, weight_kg, allergies[], conditions[],
 *   medications[], emergency_name, emergency_phone, emergency_relation }
 * Lists may also arrive as comma-separated strings; toList() handles both.
 * ------------------------------------------------------------------ */

const toList = (v) =>
  Array.isArray(v) ? v.filter(Boolean) : typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const LISTS = {
  allergies: {
    title: 'Allergies',
    hint: 'Things that cause a reaction, like foods, medicines or dust.',
    empty: 'No allergies recorded',
    tone: 'alert',
    suggest: ['Peanuts', 'Dairy', 'Gluten', 'Penicillin', 'Dust', 'Latex'],
  },
  conditions: {
    title: 'Medical conditions',
    hint: 'Ongoing conditions your trainer should know about.',
    empty: 'No conditions recorded',
    tone: 'calm',
    suggest: ['Asthma', 'Diabetes', 'Hypertension', 'Thyroid', 'Back pain', 'Knee injury'],
  },
  medications: {
    title: 'Medications',
    hint: 'Anything you take regularly.',
    empty: 'No medications recorded',
    tone: 'calm',
    suggest: ['Metformin', 'Inhaler', 'Vitamin D', 'Blood pressure tablet'],
  },
};

const bmiInfo = (h, w) => {
  if (!h || !w) return null;
  const v = w / Math.pow(h / 100, 2);
  const label = v < 18.5 ? 'Underweight' : v < 25 ? 'Healthy range' : v < 30 ? 'Overweight' : 'Obese range';
  return { v, label, pct: Math.min(100, Math.max(0, ((v - 15) / 25) * 100)) };
};

const isDone = (p, key) => {
  if (key === 'vitals') return !!(p.height_cm && p.weight_kg);
  if (key === 'blood') return !!p.blood_group;
  if (key === 'emergency') return !!(p.emergency_name && p.emergency_phone);
  return toList(p[key]).length > 0 || !!p[`${key}_confirmed`];
};

const STEPS = [
  ['vitals', 'Height and weight'],
  ['blood', 'Blood group'],
  ['allergies', 'Allergies'],
  ['conditions', 'Medical conditions'],
  ['medications', 'Medications'],
  ['emergency', 'Emergency contact'],
];

/* ------------------------------ styles ------------------------------ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=Figtree:wght@400;500;600&display=swap');
.hp{--bg:#eef3f1;--card:#fff;--ink:#12292c;--mute:#5b7175;--line:#d5e0dd;--brand:#0e7a63;--brand-soft:#d7efe7;--alert:#c8402f;--alert-soft:#fbe4df;--r:22px;
font-family:Figtree,system-ui,sans-serif;color:var(--ink);background:var(--bg);min-height:100%;padding:24px 16px 64px}
.hp *{box-sizing:border-box}
.hp-wrap{max-width:1040px;margin:0 auto;display:grid;gap:16px}
.hp h1,.hp h2,.hp .disp{font-family:'Bricolage Grotesque',Figtree,sans-serif;letter-spacing:-.02em;margin:0}
.hp button{font:inherit;cursor:pointer}
.hp :focus-visible{outline:3px solid var(--brand);outline-offset:2px;border-radius:8px}

.hp-hero{background:var(--ink);color:#fff;border-radius:28px;padding:28px;display:grid;gap:24px;grid-template-columns:1fr auto;align-items:center}
.hp-hero h1{font-size:clamp(28px,5vw,44px);font-weight:800;line-height:1.05}
.hp-hero p{margin:8px 0 0;color:#b7cfcb;max-width:46ch;line-height:1.5}
.hp-cta{margin-top:16px;background:#fff;color:var(--ink);border:0;border-radius:999px;padding:11px 18px;font-weight:600}
.hp-ring{position:relative;width:132px;height:132px}
.hp-ring svg{transform:rotate(-90deg)}
.hp-ring b{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font-family:'Bricolage Grotesque';font-size:30px;line-height:1}
.hp-ring small{display:block;font:500 12px Figtree;color:#b7cfcb;margin-top:4px}
.hp-steps{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}
.hp-step{border:1px solid #3a5457;background:transparent;color:#cfe2df;border-radius:999px;padding:7px 12px;font-size:13px;display:flex;gap:6px;align-items:center}
.hp-step.done{background:#1c4a44;border-color:#1c4a44;color:#fff}
.hp-step:not(.done):hover{border-color:#fff}

.hp-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
.hp-card{background:var(--card);border-radius:var(--r);padding:22px;border:1px solid var(--line);grid-column:span 6;display:flex;flex-direction:column;gap:14px}
.hp-card.w12{grid-column:span 12}.hp-card.w7{grid-column:span 7}.hp-card.w5{grid-column:span 5}
.hp-head{display:flex;justify-content:space-between;align-items:start;gap:12px}
.hp-head h2{font-size:20px;font-weight:700}
.hp-head p{margin:4px 0 0;color:var(--mute);font-size:14px}
.hp-edit{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;font-size:14px;font-weight:600;color:var(--ink);white-space:nowrap}
.hp-edit:hover{background:var(--brand-soft);border-color:var(--brand)}

.hp-vitals{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.hp-vital{background:var(--bg);border-radius:16px;padding:14px}
.hp-vital span{font-size:13px;color:var(--mute)}
.hp-vital div{font:800 30px 'Bricolage Grotesque';margin-top:4px}
.hp-vital em{font:500 14px Figtree;font-style:normal;color:var(--mute);margin-left:3px}
.hp-blood{background:var(--alert-soft);color:var(--alert)}
.hp-blood span{color:var(--alert)}

.hp-bmi{margin-top:4px}
.hp-bar{position:relative;height:10px;border-radius:99px;background:linear-gradient(90deg,#7fb3d9 0 14%,#4fb58f 14% 40%,#e6b64c 40% 60%,#d9694f 60%)}
.hp-bar i{position:absolute;top:-5px;width:20px;height:20px;border-radius:50%;background:#fff;border:4px solid var(--ink);transform:translateX(-50%);transition:left .4s}
.hp-bmi p{margin:10px 0 0;font-size:14px;color:var(--mute)}
.hp-bmi strong{color:var(--ink)}

.hp-chips{display:flex;flex-wrap:wrap;gap:8px}
.hp-chip{display:inline-flex;align-items:center;gap:6px;background:var(--brand-soft);color:#0a5443;border-radius:999px;padding:7px 13px;font-size:14px;font-weight:500}
.hp-chip.alert{background:var(--alert-soft);color:#8f2a1d}
.hp-chip button{border:0;background:none;color:inherit;padding:0;font-size:16px;line-height:1;opacity:.7}
.hp-chip button:hover{opacity:1}
.hp-empty{color:var(--mute);font-size:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.hp-link{border:0;background:none;color:var(--brand);font-weight:600;padding:0;text-decoration:underline}

.hp-sos{display:flex;align-items:center;gap:14px}
.hp-avatar{width:48px;height:48px;border-radius:50%;background:var(--alert-soft);color:var(--alert);display:grid;place-items:center;font:800 18px 'Bricolage Grotesque'}
.hp-call{margin-left:auto;background:var(--alert);color:#fff;border-radius:999px;padding:10px 16px;font-weight:600;text-decoration:none;font-size:14px}

.hp-scrim{position:fixed;inset:0;background:rgba(18,41,44,.5);display:flex;align-items:flex-end;justify-content:center;z-index:50}
.hp-sheet{background:#fff;width:100%;max-width:520px;border-radius:26px 26px 0 0;padding:24px;display:grid;gap:16px;max-height:90vh;overflow:auto;animation:hp-up .22s ease-out}
@keyframes hp-up{from{transform:translateY(24px);opacity:0}}
.hp-sheet h2{font-size:22px}
.hp-field{display:grid;gap:6px;font-size:14px;font-weight:600}
.hp-field input{font:400 16px Figtree;border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;width:100%}
.hp-field input:focus{border-color:var(--brand);outline:none;box-shadow:0 0 0 3px var(--brand-soft)}
.hp-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.hp-blood-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.hp-blood-grid button{border:1.5px solid var(--line);background:#fff;border-radius:12px;padding:12px 0;font:700 17px 'Bricolage Grotesque'}
.hp-blood-grid button[aria-pressed=true]{background:var(--alert);border-color:var(--alert);color:#fff}
.hp-sug{display:flex;flex-wrap:wrap;gap:6px}
.hp-sug button{border:1px dashed #9db5b1;background:#fff;border-radius:999px;padding:5px 11px;font-size:13px;color:var(--mute)}
.hp-sug button:hover{border-color:var(--brand);color:var(--brand)}
.hp-actions{display:flex;gap:10px;justify-content:flex-end;align-items:center;flex-wrap:wrap}
.hp-btn{border-radius:999px;padding:12px 20px;font-weight:600;border:1.5px solid var(--line);background:#fff}
.hp-btn.pri{background:var(--brand);border-color:var(--brand);color:#fff}
.hp-btn:disabled{opacity:.6;cursor:wait}
.hp-err{color:var(--alert);font-size:14px;margin:0}
.hp-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:#fff;padding:12px 20px;border-radius:999px;font-weight:600;z-index:60}

@media(max-width:760px){
 .hp-hero{grid-template-columns:1fr}.hp-ring{order:-1}
 .hp-card,.hp-card.w7,.hp-card.w5{grid-column:span 12}
 .hp-scrim{align-items:flex-end}
}
@media(min-width:761px){.hp-scrim{align-items:center}.hp-sheet{border-radius:26px}}
@media(prefers-reduced-motion:reduce){.hp-sheet{animation:none}.hp-bar i{transition:none}}
`;

/* ---------------------------- small pieces --------------------------- */
function Ring({ done, total }) {
  const r = 56, c = 2 * Math.PI * r, pct = done / total;
  return (
    <div className="hp-ring" role="img" aria-label={`${done} of ${total} sections complete`}>
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={r} fill="none" stroke="#2a4649" strokeWidth="12" />
        <circle cx="66" cy="66" r={r} fill="none" stroke="#5fe0b8" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset .6s' }} />
      </svg>
      <b><span>{Math.round(pct * 100)}%<small>complete</small></span></b>
    </div>
  );
}

function Card({ title, hint, onEdit, cls = '', children, editLabel = 'Edit' }) {
  return (
    <section className={`hp-card ${cls}`}>
      <div className="hp-head">
        <div><h2>{title}</h2>{hint && <p>{hint}</p>}</div>
        <button className="hp-edit" onClick={onEdit} aria-label={`${editLabel} ${title.toLowerCase()}`}>{editLabel}</button>
      </div>
      {children}
    </section>
  );
}

function ListCard({ k, profile, onEdit }) {
  const cfg = LISTS[k];
  const items = toList(profile[k]);
  return (
    <Card title={cfg.title} hint={items.length ? null : cfg.hint} onEdit={() => onEdit(k)} editLabel={items.length ? 'Edit' : 'Add'}>
      {items.length ? (
        <div className="hp-chips">
          {items.map((i) => <span key={i} className={`hp-chip ${cfg.tone === 'alert' ? 'alert' : ''}`}>{i}</span>)}
        </div>
      ) : (
        <div className="hp-empty">
          {profile[`${k}_confirmed`] ? 'You told us there is nothing to report.' : cfg.empty}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------ editors ------------------------------ */
function Sheet({ title, onClose, onSave, saving, error, extra, children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector('input,button[aria-pressed]')?.focus();
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="hp-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hp-sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h2>{title}</h2>
        {children}
        {error && <p className="hp-err" role="alert">{error}</p>}
        <div className="hp-actions">
          {extra}
          <button className="hp-btn" onClick={onClose}>Cancel</button>
          <button className="hp-btn pri" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

function ListEditor({ k, profile, onSave, onClose }) {
  const cfg = LISTS[k];
  const [items, setItems] = useState(toList(profile[k]));
  const [text, setText] = useState('');
  const [state, setState] = useState({ saving: false, error: '' });

  const add = (v) => {
    const t = v.trim();
    if (t && !items.some((i) => i.toLowerCase() === t.toLowerCase())) setItems([...items, t]);
    setText('');
  };
  const submit = (patch) => {
    setState({ saving: true, error: '' });
    onSave(patch).then(onClose).catch((e) => setState({ saving: false, error: e?.response?.data?.message || 'Could not save. Check your connection and try again.' }));
  };

  return (
    <Sheet title={cfg.title} onClose={onClose} saving={state.saving} error={state.error}
      onSave={() => submit({ [k]: items, [`${k}_confirmed`]: true })}
      extra={!items.length && <button className="hp-link" onClick={() => submit({ [k]: [], [`${k}_confirmed`]: true })}>Nothing to report</button>}>
      <div className="hp-field">
        <label htmlFor="hp-add">Add one and press Enter</label>
        <input id="hp-add" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type here"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text); } }} />
      </div>
      <div className="hp-sug" aria-label="Common suggestions">
        {cfg.suggest.filter((s) => !items.includes(s)).map((s) => <button key={s} onClick={() => add(s)}>+ {s}</button>)}
      </div>
      {items.length > 0 && (
        <div className="hp-chips">
          {items.map((i) => (
            <span key={i} className={`hp-chip ${cfg.tone === 'alert' ? 'alert' : ''}`}>
              {i}<button aria-label={`Remove ${i}`} onClick={() => setItems(items.filter((x) => x !== i))}>×</button>
            </span>
          ))}
        </div>
      )}
    </Sheet>
  );
}

function FieldsEditor({ kind, profile, onSave, onClose }) {
  const [f, setF] = useState({ ...profile });
  const [state, setState] = useState({ saving: false, error: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const keys = { vitals: ['height_cm', 'weight_kg'], blood: ['blood_group'], emergency: ['emergency_name', 'emergency_phone', 'emergency_relation'] }[kind];
  const titles = { vitals: 'Height and weight', blood: 'Blood group', emergency: 'Emergency contact' };

  const save = () => {
    const patch = Object.fromEntries(keys.map((k) => [k, f[k] ?? '']));
    if (kind === 'vitals') {
      const h = Number(patch.height_cm), w = Number(patch.weight_kg);
      if ((patch.height_cm && (h < 50 || h > 260)) || (patch.weight_kg && (w < 10 || w > 400)))
        return setState({ saving: false, error: 'Enter height in cm (50–260) and weight in kg (10–400).' });
    }
    setState({ saving: true, error: '' });
    onSave(patch).then(onClose).catch((e) => setState({ saving: false, error: e?.response?.data?.message || 'Could not save. Try again.' }));
  };

  return (
    <Sheet title={titles[kind]} onClose={onClose} onSave={save} saving={state.saving} error={state.error}>
      {kind === 'vitals' && (
        <div className="hp-two">
          <label className="hp-field">Height (cm)<input inputMode="decimal" value={f.height_cm ?? ''} onChange={(e) => set('height_cm', e.target.value)} /></label>
          <label className="hp-field">Weight (kg)<input inputMode="decimal" value={f.weight_kg ?? ''} onChange={(e) => set('weight_kg', e.target.value)} /></label>
        </div>
      )}
      {kind === 'blood' && (
        <div className="hp-blood-grid" role="group" aria-label="Blood group">
          {BLOOD.map((b) => (
            <button key={b} aria-pressed={f.blood_group === b} onClick={() => set('blood_group', f.blood_group === b ? '' : b)}>{b}</button>
          ))}
        </div>
      )}
      {kind === 'emergency' && (
        <>
          <label className="hp-field">Full name<input value={f.emergency_name ?? ''} onChange={(e) => set('emergency_name', e.target.value)} /></label>
          <div className="hp-two">
            <label className="hp-field">Phone<input type="tel" value={f.emergency_phone ?? ''} onChange={(e) => set('emergency_phone', e.target.value)} /></label>
            <label className="hp-field">Relationship<input value={f.emergency_relation ?? ''} onChange={(e) => set('emergency_relation', e.target.value)} placeholder="Parent, spouse…" /></label>
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ------------------------------- view -------------------------------- */
function HealthProfileView({ member, profile: initial, onChanged }) {
  const [profile, setProfile] = useState(initial || {});
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');
  useEffect(() => setProfile(initial || {}), [initial]);

  // TODO: point this at your real update endpoint.
  const save = async (patch) => {
    await memberDashboardApi.updateHealthProfile(member.id, patch);
    setProfile((p) => ({ ...p, ...patch }));
    setToast('Saved');
    setTimeout(() => setToast(''), 2200);
    onChanged?.();
  };

  const done = STEPS.filter(([k]) => isDone(profile, k)).length;
  const next = STEPS.find(([k]) => !isDone(profile, k));
  const bmi = bmiInfo(Number(profile.height_cm), Number(profile.weight_kg));
  const first = (member.name || '').split(' ')[0];

  return (
    <div className="hp">
      <style>{css}</style>
      <div className="hp-wrap">
        <header className="hp-hero">
          <div>
            <h1>{first ? `${first}'s health profile` : 'Your health profile'}</h1>
            <p>
              {next
                ? 'Your trainers use this to keep your workouts safe. It takes about two minutes to finish.'
                : 'All sections are complete. Update anything that changes so your trainers always have the latest.'}
            </p>
            {next && <button className="hp-cta" onClick={() => setEditing(next[0])}>Add {next[1].toLowerCase()}</button>}
          </div>
          <Ring done={done} total={STEPS.length} />
          <div className="hp-steps">
            {STEPS.map(([k, label]) => (
              <button key={k} className={`hp-step ${isDone(profile, k) ? 'done' : ''}`} onClick={() => setEditing(k)}>
                <span aria-hidden>{isDone(profile, k) ? '✓' : '+'}</span>{label}
              </button>
            ))}
          </div>
        </header>

        <div className="hp-grid">
          <Card cls="w7" title="Body measurements" onEdit={() => setEditing('vitals')} editLabel={bmi ? 'Edit' : 'Add'}>
            <div className="hp-vitals">
              <div className="hp-vital"><span>Height</span><div>{profile.height_cm || '–'}<em>cm</em></div></div>
              <div className="hp-vital"><span>Weight</span><div>{profile.weight_kg || '–'}<em>kg</em></div></div>
              <div className="hp-vital hp-blood">
                <span>Blood group</span>
                <div>{profile.blood_group || '–'}</div>
              </div>
            </div>
            {bmi ? (
              <div className="hp-bmi">
                <div className="hp-bar"><i style={{ left: `${bmi.pct}%` }} /></div>
                <p>BMI <strong>{bmi.v.toFixed(1)}</strong> · {bmi.label}. BMI is a rough guide and does not account for muscle mass.</p>
              </div>
            ) : (
              <div className="hp-empty">Add your height and weight to see your BMI.</div>
            )}
            <button className="hp-link" style={{ alignSelf: 'flex-start' }} onClick={() => setEditing('blood')}>
              {profile.blood_group ? 'Change blood group' : 'Add blood group'}
            </button>
          </Card>

          <Card cls="w5" title="Emergency contact" onEdit={() => setEditing('emergency')} editLabel={profile.emergency_name ? 'Edit' : 'Add'}>
            {profile.emergency_name ? (
              <div className="hp-sos">
                <div className="hp-avatar" aria-hidden>{profile.emergency_name[0]?.toUpperCase()}</div>
                <div>
                  <strong>{profile.emergency_name}</strong>
                  <div style={{ color: 'var(--mute)', fontSize: 14 }}>{[profile.emergency_relation, profile.emergency_phone].filter(Boolean).join(' · ')}</div>
                </div>
                {profile.emergency_phone && <a className="hp-call" href={`tel:${profile.emergency_phone}`}>Call</a>}
              </div>
            ) : (
              <div className="hp-empty">Someone we can reach if you need help at the gym.</div>
            )}
          </Card>

          <ListCard k="allergies" profile={profile} onEdit={setEditing} />
          <ListCard k="conditions" profile={profile} onEdit={setEditing} />
          <div className="hp-card w12" style={{ padding: 0, border: 0, background: 'none' }}>
            <ListCard k="medications" profile={profile} onEdit={setEditing} />
          </div>
        </div>
      </div>

      {editing && LISTS[editing] && <ListEditor key={editing} k={editing} profile={profile} onSave={save} onClose={() => setEditing(null)} />}
      {editing && !LISTS[editing] && <FieldsEditor key={editing} kind={editing} profile={profile} onSave={save} onClose={() => setEditing(null)} />}
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