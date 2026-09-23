import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import AuthShell from "../components/layout/AuthShell.jsx";
import { Field, Input } from "../components/ui/Field.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { extractErrorMessage } from "../lib/api.js";
import { useToast } from "../components/ui/Toast.jsx";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back.");
      navigate("/app/dashboard");
    } catch (err) {
      setError(extractErrorMessage(err, "Could not sign in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="OPERATIONS PLATFORM"
      title={
        <>
          Run the floor.
          <br />
          Not the spreadsheets.
        </>
      }
    >
      <h2 className="font-display text-2xl font-bold text-bone-100 leading-none mb-1.5">
        Sign in
      </h2>
      <p className="text-sm text-ink-400 mb-7">
        Enter your credentials to reach your dashboard.
      </p>

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
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-volt-400 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {error && (
          <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full mt-2">
          <LogIn size={15} />
          Sign in
        </Button>
      </form>

      <p className="text-xs text-ink-400 mt-6 text-center">
        New here?{" "}
        <Link to="/register" className="text-volt-500 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
