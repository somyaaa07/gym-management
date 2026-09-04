import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Snowflake, Ban, Phone, Mail, MapPin, CalendarDays } from 'lucide-react';
import usePageMeta from '../lib/usePageMeta.js';
import { memberApi, membershipPlanApi, memberMembershipApi, extractErrorMessage } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Field, Input, Select } from '../components/ui/Field.jsx';
import { PageSpinner, Badge, EmptyState } from '../components/ui/Misc.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const EMPTY_ENROLL = { membership_plan_id: '', start_date: new Date().toISOString().slice(0, 10), discount: 0, payment_status: 'PAID', auto_renew: false };
const EMPTY_FREEZE = { freeze_start_date: '', freeze_end_date: '' };

export default function MemberDetail() {
  usePageMeta('Member profile', '');
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [member, setMember] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState(EMPTY_ENROLL);
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [freezeTarget, setFreezeTarget] = useState(null);
  const [freezeForm, setFreezeForm] = useState(EMPTY_FREEZE);
  const [freezeSaving, setFreezeSaving] = useState(false);
  const [freezeError, setFreezeError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () => {
    memberApi
      .getById(id)
      .then((res) => setMember(res.data))
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    membershipPlanApi.list().then((res) => setPlans(res.data)).catch(() => setPlans([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openEnroll = () => {
    setEnrollForm({ ...EMPTY_ENROLL, membership_plan_id: plans[0]?.id || '' });
    setEnrollError('');
    setEnrollOpen(true);
  };

  const onEnroll = async (e) => {
    e.preventDefault();
    setEnrollError('');
    if (!plans.length) {
      setEnrollError('Create a membership plan first.');
      return;
    }
    setEnrollSaving(true);
    try {
      await memberMembershipApi.create({ ...enrollForm, member_id: id, discount: Number(enrollForm.discount) || 0 });
      toast.success('Member enrolled.');
      setEnrollOpen(false);
      load();
    } catch (err) {
      setEnrollError(extractErrorMessage(err, 'Could not enroll member'));
    } finally {
      setEnrollSaving(false);
    }
  };

  const onDeactivate = async (membershipId) => {
    setBusyId(membershipId);
    try {
      await memberMembershipApi.deactivate(membershipId);
      toast.success('Membership deactivated.');
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not deactivate'));
    } finally {
      setBusyId('');
    }
  };

  const openFreeze = (membership) => {
    setFreezeForm(EMPTY_FREEZE);
    setFreezeError('');
    setFreezeTarget(membership);
  };

  const onFreeze = async (e) => {
    e.preventDefault();
    setFreezeError('');
    setFreezeSaving(true);
    try {
      await memberMembershipApi.freeze(freezeTarget.id, freezeForm);
      toast.success('Membership frozen.');
      setFreezeTarget(null);
      load();
    } catch (err) {
      setFreezeError(extractErrorMessage(err, 'Could not freeze membership'));
    } finally {
      setFreezeSaving(false);
    }
  };

  if (loading) return <PageSpinner />;

  if (!member) {
    return (
      <EmptyState
        title="Member not found"
        description="This member may have been removed."
        action={<Link to="/app/members"><Button variant="secondary"><ArrowLeft size={14} /> Back to members</Button></Link>}
      />
    );
  }

  const memberships = member.MemberMemberships || [];

  return (
    <div className="space-y-6">
      <Link to="/app/members" className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-bone-100">
        <ArrowLeft size={13} /> All members
      </Link>

      <div className="rounded-xl border border-ink-600 bg-ink-800 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-volt-500 flex items-center justify-center text-ink-900 font-display text-2xl">
              {member.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-3xl text-bone-100 leading-none">{member.name}</h2>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge>{member.status}</Badge>
                <span className="text-xs text-ink-400 capitalize">{member.gender}</span>
              </div>
            </div>
          </div>
          <Button onClick={openEnroll}>
            <Plus size={15} /> Enroll in plan
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-ink-700 text-sm">
          <InfoRow icon={Phone} label="Phone" value={member.phone} />
          <InfoRow icon={Mail} label="Email" value={member.email} />
          <InfoRow icon={CalendarDays} label="Joined" value={String(member.joining_date).slice(0, 10)} />
          <InfoRow icon={MapPin} label="Address" value={member.address || '—'} />
        </div>
      </div>

      <div>
        <h3 className="font-display text-2xl text-bone-100 leading-none mb-4">Membership history</h3>
        {memberships.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No memberships yet"
            description="Enroll this member into a plan to start tracking their access."
            action={<Button onClick={openEnroll}><Plus size={15} /> Enroll in plan</Button>}
          />
        ) : (
          <div className="space-y-3">
            {memberships.map((m) => (
              <div key={m.id} className="rounded-xl border border-ink-600 bg-ink-800 p-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-display text-xl text-bone-100 leading-none">
                      {m.MembershipPlan?.name || 'Plan'}
                    </p>
                    <Badge>{m.status}</Badge>
                    <Badge>{m.payment_status}</Badge>
                  </div>
                  <p className="text-xs text-ink-400 tabular">
                    {String(m.start_date).slice(0, 10)} → {String(m.end_date).slice(0, 10)} · ₹{m.final_amount}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m.status !== 'FROZEN' && m.status !== 'DEACTIVE' && (
                    <Button variant="secondary" size="sm" onClick={() => openFreeze(m)}>
                      <Snowflake size={13} /> Freeze
                    </Button>
                  )}
                  {m.status !== 'DEACTIVE' && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={busyId === m.id}
                      onClick={() => onDeactivate(m.id)}
                    >
                      <Ban size={13} /> Deactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={enrollOpen} onClose={() => setEnrollOpen(false)} title="Enroll in plan" subtitle={member.name}>
        <form onSubmit={onEnroll} className="space-y-4">
          <Field label="Membership plan" required>
            <Select required value={enrollForm.membership_plan_id} onChange={(e) => setEnrollForm({ ...enrollForm, membership_plan_id: e.target.value })}>
              <option value="" disabled>Select plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" required>
              <Input type="date" required value={enrollForm.start_date} onChange={(e) => setEnrollForm({ ...enrollForm, start_date: e.target.value })} />
            </Field>
            <Field label="Discount">
              <Input type="number" min={0} value={enrollForm.discount} onChange={(e) => setEnrollForm({ ...enrollForm, discount: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Payment status" required>
              <Select required value={enrollForm.payment_status} onChange={(e) => setEnrollForm({ ...enrollForm, payment_status: e.target.value })}>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </Select>
            </Field>
            <Field label="Auto-renew">
              <Select value={enrollForm.auto_renew ? 'yes' : 'no'} onChange={(e) => setEnrollForm({ ...enrollForm, auto_renew: e.target.value === 'yes' })}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </Field>
          </div>

          {enrollError && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{enrollError}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setEnrollOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={enrollSaving} className="flex-1">Enroll</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!freezeTarget} onClose={() => setFreezeTarget(null)} title="Freeze membership" subtitle="Extends the end date by the frozen days" width="max-w-sm">
        <form onSubmit={onFreeze} className="space-y-4">
          <Field label="Freeze from" required>
            <Input type="date" required value={freezeForm.freeze_start_date} onChange={(e) => setFreezeForm({ ...freezeForm, freeze_start_date: e.target.value })} />
          </Field>
          <Field label="Freeze until" required>
            <Input type="date" required value={freezeForm.freeze_end_date} onChange={(e) => setFreezeForm({ ...freezeForm, freeze_end_date: e.target.value })} />
          </Field>

          {freezeError && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-md px-3 py-2">{freezeError}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setFreezeTarget(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={freezeSaving} className="flex-1">Freeze</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-ink-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-ink-400">{label}</p>
        <p className="text-bone-100">{value}</p>
      </div>
    </div>
  );
}
