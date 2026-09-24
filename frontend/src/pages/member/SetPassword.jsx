import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, Check, CircleCheck, TriangleAlert } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Field, Input } from '../../components/ui/Field.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const RULES = [
  { key: 'len', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'case', label: 'Upper and lowercase letters', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { key: 'num', label: 'A number or symbol', test: (p) => /[\d\W_]/.test(p) },
];
const STRENGTH = ['Too short', 'Weak', 'Okay', 'Strong'];
const BAR_COLORS = ['bg-ember-500', 'bg-ember-500', 'bg-amber-400', 'bg-volt-500'];

function Shell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="h-10 w-10 rounded-xl bg-volt-500 flex items-center justify-center text-white">
            <Dumbbell size={20} />
          </div>
          <span className="font-display text-2xl text-bone-100">Gym Management</span>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export default function SetPassword() {
  useEffect(() => {
    document.title = 'Set your password';
  }, []);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passed = RULES.filter((r) => r.test(password)).length;
  const level = password ? (password.length < 8 ? 0 : passed) : -1; // 0..3
  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/members/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Something went wrong. The link may have expired.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-ember-500/10 flex items-center justify-center text-ember-500">
            <TriangleAlert size={22} />
          </div>
          <h1 className="font-display text-2xl text-bone-100 mt-4">Link is invalid</h1>
          <p className="text-sm text-ink-400 mt-2">
            This link is missing its token. Please open the link from your invitation email again.
          </p>
          <Link to="/login" className="inline-block mt-6">
            <Button variant="secondary">Go to login</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  if (success) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-volt-500/10 flex items-center justify-center text-volt-500">
            <CircleCheck size={24} />
          </div>
          <h1 className="font-display text-2xl text-bone-100 mt-4">Password set</h1>
          <p className="text-sm text-ink-400 mt-2">You can now log in. Taking you there in a moment.</p>
          <Button className="mt-6 w-full" onClick={() => navigate('/login')}>Log in now</Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="font-display text-3xl text-bone-100 leading-none">Set your password</h1>
      <p className="text-sm text-ink-400 mt-2">Choose a password to activate your member account.</p>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <Field label="New password" required>
          <Input
            type={show ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {/* Strength meter */}
        <div>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-colors ${level >= i || (level === 0 && i === 1) ? BAR_COLORS[level] : 'bg-ink-700'}`}
              />
            ))}
          </div>
          <p className="text-xs text-ink-400 mt-1.5">
            {level < 0 ? 'Use at least 8 characters' : `Strength: ${STRENGTH[level]}`}
          </p>
        </div>

        <ul className="space-y-1.5">
          {RULES.map((r) => {
            const ok = r.test(password);
            return (
              <li key={r.key} className={`flex items-center gap-2 text-xs ${ok ? 'text-volt-500' : 'text-ink-400'}`}>
                <Check size={13} className={ok ? '' : 'opacity-30'} /> {r.label}
              </li>
            );
          })}
        </ul>

        <Field label="Confirm password" required>
          <Input
            type={show ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        {mismatch && <p className="text-xs text-ember-500 -mt-2">Passwords do not match yet.</p>}

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-bone-100"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? 'Hide' : 'Show'} passwords
        </button>

        {error && (
          <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">{error}</p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Set password
        </Button>
      </form>
    </Shell>
  );
}