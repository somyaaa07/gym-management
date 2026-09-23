import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Copy, ShieldCheck, Check, UserPlus } from "lucide-react";
import usePageMeta from "../../lib/usePageMeta.js";
import { tenantApi, userApi, extractErrorMessage } from "../../lib/api.js";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { Field, Input } from "../../components/ui/Field.jsx";
import { EmptyState, PageSpinner } from "../../components/ui/Misc.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  postal_code: "",
};

const EMPTY_ADMIN_FORM = { name: "", email: "", phone: "", password: "" };

export default function Tenants() {
  usePageMeta("Gyms", "Provision new gyms on the platform");

  const navigate = useNavigate();
  const toast = useToast();
  const [tenants, setTenants] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [adminTarget, setAdminTarget] = useState(null);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState("");

  const load = () => {
    tenantApi
      .list()
      .then((res) => setTenants(res.data || []))
      .catch((err) => {
        setTenants([]);
        toast.error(extractErrorMessage(err, "Could not load gyms"));
      });
  };

  useEffect(load, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await tenantApi.create(form);
      toast.success('Gym created. Open "Add admin" to give it an owner.');
      setForm(EMPTY_FORM);
      setOpen(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not create gym"));
    } finally {
      setLoading(false);
    }
  };

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1500);
  };

  const openAddAdmin = (tenant) => {
    setAdminForm(EMPTY_ADMIN_FORM);
    setAdminError("");
    setAdminTarget(tenant);
  };

  const onCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError("");
    setAdminSaving(true);
    try {
      await userApi.create({
        ...adminForm,
        tenant_id: adminTarget.id,
        role: "ADMIN",
      });
      toast.success(`Admin created for ${adminTarget.name}.`);
      setAdminTarget(null);
      load();
    } catch (err) {
      setAdminError(extractErrorMessage(err, "Could not create admin"));
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400 max-w-lg">
          Every gym on the platform. Provision a new one, then hand its tenant
          ID to an admin — or add the admin account directly from here.
        </p>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus size={15} /> New gym
        </Button>
      </div>

      {tenants === null ? (
        <PageSpinner />
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No gyms created yet"
          description="Provision your first gym to get its tenant ID and hand it to an admin."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={15} /> New gym
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/app/tenants/${t.id}`)}
              className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5 cursor-pointer hover:border-volt-500/40 transition-colors"
            >
              {" "}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-2xl text-bone-100 leading-none">
                    {t.name}
                  </p>
                  <p className="text-xs text-ink-400 mt-1.5">
                    {t.subscription_plan || "Standard"} · up to{" "}
                    {t.max_branches ?? "—"} branches
                  </p>
                </div>
                <span className="text-[11px] rounded-full border border-volt-500/30 bg-volt-500/10 text-volt-500 px-2.5 py-0.5">
                  {t.status || "ACTIVE"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-900 border border-ink-600 px-3 py-2">
                <code className="text-[11px] text-ink-300 truncate flex-1">
                  {t.id}
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyId(t.id);
                  }}
                  className="shrink-0 text-ink-400 hover:text-volt-500 transition-colors"
                >
                  {copiedId === t.id ? (
                    <Check size={14} className="text-volt-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openAddAdmin(t);
                }}
                className="mt-3 w-full"
              >
                <UserPlus size={13} /> Add admin
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New gym"
        subtitle="Create a tenant on the platform"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Gym name" required>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Iron Forge Fitness"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="owner@gym.com"
              />
            </Field>
            <Field label="Phone" required>
              <Input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
              />
            </Field>
          </div>
          <Field label="Address" required>
            <Input
              required
              value={form.address_line}
              onChange={(e) =>
                setForm({ ...form, address_line: e.target.value })
              }
              placeholder="Street, area"
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" required>
              <Input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field label="State" required>
              <Input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </Field>
            <Field label="Postal code" required>
              <Input
                required
                value={form.postal_code}
                onChange={(e) =>
                  setForm({ ...form, postal_code: e.target.value })
                }
              />
            </Field>
          </div>

          {error && (
            <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create gym
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!adminTarget}
        onClose={() => setAdminTarget(null)}
        title="Add admin"
        subtitle={
          adminTarget ? `Grants gym-admin access to ${adminTarget.name}` : ""
        }
      >
        <form onSubmit={onCreateAdmin} className="space-y-4">
          <Field label="Full name" required>
            <Input
              required
              value={adminForm.name}
              onChange={(e) =>
                setAdminForm({ ...adminForm, name: e.target.value })
              }
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              required
              value={adminForm.email}
              onChange={(e) =>
                setAdminForm({ ...adminForm, email: e.target.value })
              }
            />
          </Field>
          <Field label="Phone" required>
            <Input
              required
              value={adminForm.phone}
              onChange={(e) =>
                setAdminForm({ ...adminForm, phone: e.target.value })
              }
            />
          </Field>
          <Field
            label="Temporary password"
            required
            hint="At least 8 characters. Share this with the admin securely."
          >
            <Input
              type="password"
              required
              minLength={8}
              value={adminForm.password}
              onChange={(e) =>
                setAdminForm({ ...adminForm, password: e.target.value })
              }
            />
          </Field>

          {adminError && (
            <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">
              {adminError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setAdminTarget(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={adminSaving} className="flex-1">
              Create admin
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
