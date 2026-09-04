import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthShell from '../components/layout/AuthShell.jsx';
import { Field, Input } from '../components/ui/Field.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { extractErrorMessage } from '../lib/api.js';
import { useToast } from '../components/ui/Toast.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back.');
      navigate('/app/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not sign in'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="OPERATIONS PLATFORM" title={<>Run the floor.<br />Not the spreadsheets.</>}>
      <h2 className="font-display text-3xl text-bone-100 leading-none mb-1">Sign in</h2>
      <p className="text-sm text-ink-400 mb-7">Enter your credentials to reach your dashboard.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" required>
          <Input
            type="email"
            required
            placeholder="you@yourgym.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password" required>
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>

        {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{error}</p>}

        <Button type="submit" loading={loading} className="w-full mt-2">
          <LogIn size={15} />
          Sign in
        </Button>
      </form>

      <p className="text-xs text-ink-400 mt-6 text-center">
        New here?{' '}
        <Link to="/register" className="text-volt-500 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
