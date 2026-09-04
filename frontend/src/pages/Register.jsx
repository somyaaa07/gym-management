import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthShell from '../components/layout/AuthShell.jsx';
import { Field, Input } from '../components/ui/Field.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { extractErrorMessage } from '../lib/api.js';
import { useToast } from '../components/ui/Toast.jsx';

export default function Register() {
  const { register, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      await login({ email: form.email, password: form.password });
      toast.success('Account created. Let’s get your gym set up.');
      navigate('/app/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="GET STARTED" title={<>Every branch.<br />One line of sight.</>}>
      <h2 className="font-display text-3xl text-bone-100 leading-none mb-1">Create account</h2>
      <p className="text-sm text-ink-400 mb-7">
        This creates your admin login. Your gym profile is set up right after.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" required>
          <Input
            required
            placeholder="Alex Rivera"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Email" required>
          <Input
            type="email"
            required
            placeholder="you@yourgym.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Phone" required>
          <Input
            required
            placeholder="9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field label="Password" required hint="At least 8 characters.">
          <Input
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>

        {error && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{error}</p>}

        <Button type="submit" loading={loading} className="w-full mt-2">
          <UserPlus size={15} />
          Create account
        </Button>
      </form>

      <p className="text-xs text-ink-400 mt-6 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-volt-500 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
