import { useEffect, useState } from "react";
import { Plus, Building2, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import usePageMeta from "../lib/usePageMeta.js";
import { branchApi, extractErrorMessage } from "../lib/api.js";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { Field, Input } from "../components/ui/Field.jsx";
import Table from "../components/ui/Table.jsx";
import { PageSpinner, EmptyState } from "../components/ui/Misc.jsx";
import { useToast } from "../components/ui/Toast.jsx";

const EMPTY_FORM = {
  name: "",
  code: "",
  phone: "",
  email: "",
  address_line: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  opening_time: "06:00",
  closing_time: "22:00",
  capacity: 100,

  // Branch Admin credentials
  admin_name: "",
  admin_email: "",
  admin_password: "",
  admin_password_confirmation: "",
};

export default function Branches() {
  usePageMeta("Branches", "Locations under your gym");
  const toast = useToast();
  const [branches, setBranches] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', data }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const load = () => {
    branchApi
      .list()
      .then((res) => setBranches(res.data))
      .catch(() => setBranches([]));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError("");
    setModal({ mode: "create" });
  };

  const openEdit = (branch) => {
    setForm({
      name: branch.name || "",
      code: branch.code || "",
      phone: branch.phone || "",
      email: branch.email || "",
      address_line: branch.address_line || "",
      city: branch.city || "",
      state: branch.state || "",
      postal_code: branch.postal_code || "",
      country: branch.country || "",
      opening_time: branch.opening_time || "06:00",
      closing_time: branch.closing_time || "22:00",
      capacity: branch.capacity || 100,
    });
    setError("");
    setModal({ mode: "edit", data: branch });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (modal.mode === "create") {
      if (!form.admin_name.trim()) {
        setError("Branch admin name is required.");
        return;
      }

      if (!form.admin_email.trim()) {
        setError("Branch admin email is required.");
        return;
      }

      if (!form.admin_password) {
        setError("Branch admin password is required.");
        return;
      }

      if (form.admin_password.length < 8) {
        setError("Branch admin password must be at least 8 characters.");
        return;
      }

      if (form.admin_password !== form.admin_password_confirmation) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        code: form.code,
        phone: form.phone,
        email: form.email,
        address_line: form.address_line,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
        capacity: Number(form.capacity),
      };

      if (modal.mode === "create") {
        payload.admin_name = form.admin_name;
        payload.admin_email = form.admin_email;
        payload.admin_password = form.admin_password;

        await branchApi.create(payload);

        toast.success("Branch and branch admin created.");
      } else {
        await branchApi.update(modal.data.id, payload);

        toast.success("Branch updated.");
      }

      setModal(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not save branch"));
    } finally {
      setSaving(false);
    }
  };
  const onDelete = async () => {
    setDeleting(true);
    try {
      await branchApi.remove(deleteTarget.id);
      toast.success("Branch removed.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not remove branch"));
    } finally {
      setDeleting(false);
    }
  };

  if (branches === null) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">
          {branches.length} branch{branches.length !== 1 ? "es" : ""}
        </p>
        <Button onClick={openCreate}>
          <Plus size={15} /> New branch
        </Button>
      </div>

      {branches.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No branches yet"
          description="Add your first location to start assigning staff and members to it."
          action={
            <Button onClick={openCreate}>
              <Plus size={15} /> New branch
            </Button>
          }
        />
      ) : (
        <Table
          columns={[
            { key: "name", header: "Branch" },
            { key: "code", header: "Code" },
            { key: "email", header: "Email" },
            { key: "city", header: "City" },
            {
              key: "hours",
              header: "Hours",
              render: (r) => `${r.opening_time} – ${r.closing_time}`,
            },
            { key: "capacity", header: "Capacity" },
            {
              key: "actions",
              header: "",
              render: (r) => (
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(r);
                    }}
                    className="p-1.5 text-ink-400 hover:text-volt-500 rounded-xl hover:bg-ink-700"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(r);
                    }}
                    className="p-1.5 text-ink-400 hover:text-ember-500 rounded-xl hover:bg-ink-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
          rows={branches}
        />
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "New branch" : "Edit branch"}
        width="max-w-xl"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Branch name" required>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Downtown"
              />
            </Field>
            <Field label="Branch code" required hint="Unique short code">
              <Input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="DTN01"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" required>
              <Input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <Field label="Country" required>
            <Input
              required
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="India"
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Opens" required>
              <Input
                type="time"
                required
                value={form.opening_time}
                onChange={(e) =>
                  setForm({ ...form, opening_time: e.target.value })
                }
              />
            </Field>
            <Field label="Closes" required>
              <Input
                type="time"
                required
                value={form.closing_time}
                onChange={(e) =>
                  setForm({ ...form, closing_time: e.target.value })
                }
              />
            </Field>
            <Field label="Capacity" required>
              <Input
                type="number"
                min={1}
                required
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </Field>
          </div>
          {modal?.mode === "create" && (
            <div className="pt-3 border-t border-ink-700">
              <h3 className="text-sm font-semibold text-bone-100 mb-1">
                Branch Admin Login
              </h3>

              <p className="text-xs text-ink-400 mb-4">
                Create login credentials for the administrator of this branch.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Admin name" required>
                  <Input
                    required
                    value={form.admin_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        admin_name: e.target.value,
                      })
                    }
                    placeholder="Branch Admin"
                  />
                </Field>

                <Field label="Branch Admin email" required>
                  <Input
                    type="email"
                    required
                    value={form.admin_email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        admin_email: e.target.value,
                      })
                    }
                    placeholder="admin@branch.com"
                  />
                </Field>

                <Field label="Password" required>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.admin_password}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          admin_password: e.target.value,
                        }))
                      }
                      placeholder="Enter password"
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-bone-100"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm password" required>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.admin_password_confirmation}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          admin_password_confirmation: e.target.value,
                        }))
                      }
                      placeholder="Confirm password"
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-bone-100"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </Field>
              </div>
            </div>
          )}
          {error && (
            <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModal(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {modal?.mode === "create" ? "Create branch" : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Remove this branch?"
        description={`${deleteTarget?.name} will be deactivated and hidden from active lists.`}
        confirmLabel="Remove branch"
      />
    </div>
  );
}
