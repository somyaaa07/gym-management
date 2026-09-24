import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Snowflake, Ban, Phone, Mail, MapPin, CalendarDays, Target, Hash } from 'lucide-react';
import usePageMeta from '../../lib/usePageMeta.js';
import { memberApi, membershipPlanApi, memberMembershipApi, goalApi, extractErrorMessage } from '../../lib/api.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Field, Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { PageSpinner, Badge, EmptyState } from '../../components/ui/Misc.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import GoalAiSuggestions from '../../components/ai/GoalSuggestion.jsx';

const EMPTY_ENROLL = { membership_plan_id: '', start_date: new Date().toISOString().slice(0, 10), discount: 0, payment_status: 'PAID', auto_renew: false };
const EMPTY_FREEZE = { freeze_start_date: '', freeze_end_date: '' };

const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const EMPTY_GOAL = { goal_type: 'WEIGHT_LOSS', target_value: '', target_unit: 'KG', start_value: '', target_date: '', notes: '' };
const EMPTY_PREFS = { days_per_week: 4, session_duration_minutes: 60, fitness_level: 'BEGINNER', diet_preference: 'ANY' };
const GOAL_LABELS = {
  WEIGHT_LOSS: 'Weight loss',
  WEIGHT_GAIN: 'Weight gain',
  FAT_LOSS: 'Fat loss',
  MUSCLE_GAIN: 'Muscle gain',
  STRENGTH: 'Strength',
  FITNESS: 'General fitness',
};
const UNIT_LABELS = { KG: 'kg', PERCENT: '%', REPS: 'reps', MINUTES: 'min' };

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
  const [goals, setGoals] = useState([]);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState(EMPTY_GOAL);
  const [prefs, setPrefs] = useState(EMPTY_PREFS);
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState('');

  const load = () => {
    memberApi
      .getById(id)
      .then((res) => setMember(res.data))
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  };

  const loadGoals = () => {
    // API returns 404 when the tenant has no goals yet, so treat any error as "none".
    goalApi
      .list()
      .then((res) => setGoals((res.data || []).filter((g) => g.member_id === id)))
      .catch(() => setGoals([]));
  };

  useEffect(() => {
    load();
    loadGoals();
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

  const openGoal = () => {
    setGoalForm({ ...EMPTY_GOAL, target_date: daysFromNow(90) });
    setPrefs(EMPTY_PREFS);
    setGoalError('');
    setGoalOpen(true);
  };

  const onSaveGoal = async (e) => {
    e.preventDefault();
    setGoalError('');
    setGoalSaving(true);
    try {
      await goalApi.create({
        member_id: id,
        goal_type: goalForm.goal_type,
        target_value: Number(goalForm.target_value),
        target_unit: goalForm.target_unit,
        start_value: Number(goalForm.start_value) > 0 ? Number(goalForm.start_value) : undefined,
        target_date: goalForm.target_date,
        notes: goalForm.notes.trim() || undefined,
      });
      toast.success('Goal saved.');
      setGoalOpen(false);
      loadGoals();
    } catch (err) {
      setGoalError(extractErrorMessage(err, 'Could not save goal'));
    } finally {
      setGoalSaving(false);
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

      <div className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-6">
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
          <InfoRow
            icon={Hash}
            label="Member ID"
            value={<span className="font-mono text-xs break-all">{member.id}</span>}
          />
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
              <div key={m.id} className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5 flex items-center justify-between flex-wrap gap-4">
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

      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-display text-2xl text-bone-100 leading-none">Goals</h3>
          <Button variant="secondary" size="sm" onClick={openGoal}>
            <Plus size={14} /> Set goal
          </Button>
        </div>
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Set a goal and get an AI-suggested workout and diet plan while you enter it."
            action={<Button onClick={openGoal}><Plus size={15} /> Set goal</Button>}
          />
        ) : (
          <div className="space-y-3">
            {goals.map((g) => (
              <div key={g.id} className="rounded-2xl border border-ink-700 bg-ink-800 shadow-soft p-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-display text-xl text-bone-100 leading-none">{GOAL_LABELS[g.goal_type] || g.goal_type}</p>
                    <Badge>{g.status}</Badge>
                  </div>
                  <p className="text-xs text-ink-400 tabular">
                    {g.start_value ? `${Number(g.start_value)} → ` : 'Target '}{Number(g.target_value)} {UNIT_LABELS[g.target_unit] || g.target_unit} · by {String(g.target_date).slice(0, 10)}
                  </p>
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

          {enrollError && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">{enrollError}</p>}

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

          {freezeError && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">{freezeError}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setFreezeTarget(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={freezeSaving} className="flex-1">Freeze</Button>
          </div>
        </form>
      </Modal>

      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="Set goal" subtitle={member.name} width="max-w-2xl">
        <form onSubmit={onSaveGoal} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Goal type" required>
              <Select required value={goalForm.goal_type} onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value })}>
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Target date" required>
              <Input type="date" required min={daysFromNow(1)} value={goalForm.target_date} onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Target value" required>
              <Input type="number" required min={0} step="0.1" value={goalForm.target_value} onChange={(e) => setGoalForm({ ...goalForm, target_value: e.target.value })} />
            </Field>
            <Field label="Unit" required>
              <Select required value={goalForm.target_unit} onChange={(e) => setGoalForm({ ...goalForm, target_unit: e.target.value })}>
                <option value="KG">kg</option>
                <option value="PERCENT">%</option>
                <option value="REPS">reps</option>
                <option value="MINUTES">minutes</option>
              </Select>
            </Field>
            <Field label="Start value">
              <Input type="number" min={0} step="0.1" value={goalForm.start_value} onChange={(e) => setGoalForm({ ...goalForm, start_value: e.target.value })} />
            </Field>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Days / week">
              <Select value={prefs.days_per_week} onChange={(e) => setPrefs({ ...prefs, days_per_week: Number(e.target.value) })}>
                {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="Session (min)">
              <Select value={prefs.session_duration_minutes} onChange={(e) => setPrefs({ ...prefs, session_duration_minutes: Number(e.target.value) })}>
                {[30, 45, 60, 75, 90].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="Fitness level">
              <Select value={prefs.fitness_level} onChange={(e) => setPrefs({ ...prefs, fitness_level: e.target.value })}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </Select>
            </Field>
            <Field label="Diet">
              <Select value={prefs.diet_preference} onChange={(e) => setPrefs({ ...prefs, diet_preference: e.target.value })}>
                <option value="ANY">Any</option>
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="NON_VEGETARIAN">Non-vegetarian</option>
                <option value="EGGETARIAN">Eggetarian</option>
                <option value="VEGAN">Vegan</option>
              </Select>
            </Field>
          </div>

          <Field label="Notes">
            <Textarea rows={2} value={goalForm.notes} onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })} />
          </Field>

          <GoalAiSuggestions memberId={id} goal={goalForm} preferences={prefs} />

          {goalError && <p className="text-xs text-ember-500 bg-ember-500/10 border border-ember-500/20 rounded-xl px-3 py-2">{goalError}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setGoalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={goalSaving} className="flex-1">Save goal</Button>
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
