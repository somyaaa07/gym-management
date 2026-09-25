import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Calendar,
  Snowflake,
  AlertTriangle,
  RefreshCw,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
} from "lucide-react";
import { memberDashboardApi } from "../../lib/api"; // adjust to your actual path

const THEME = {
  bg: "#F5F5FA",
  card: "#FFFFFF",
  border: "#ECEBF6",
  text: "#1F2033",
  muted: "#8B8AA0",
  accent: "#6D5CF6",
  accentSoft: "#EFECFE",
  track: "#EEEDF8",
  success: "#1FAE7A",
  successSoft: "#E7F8F1",
  warning: "#E08A1E",
  warningSoft: "#FCF0DE",
  danger: "#D64545",
  dangerSoft: "#FBEAEA",
  frozen: "#3B9AE1",
  frozenSoft: "#EAF4FC",
  cancelled: "#B4B3C6",
  cancelledSoft: "#F1F0F6",
};

const STATUS_META = {
  ACTIVE: { label: "Active", color: THEME.success, soft: THEME.successSoft, icon: CheckCircle2 },
  FROZEN: { label: "Frozen", color: THEME.frozen, soft: THEME.frozenSoft, icon: Snowflake },
  DEACTIVE: { label: "Inactive", color: THEME.cancelled, soft: THEME.cancelledSoft, icon: XCircle },
};

function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.DEACTIVE;
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function elapsedPct(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (!s || !e || Number.isNaN(s) || Number.isNaN(e) || e <= s) return null;
  return Math.max(0, Math.min(100, ((now - s) / (e - s)) * 100));
}

function StatusPill({ status }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0"
      style={{ background: meta.soft, color: meta.color }}
    >
      <Icon size={12} /> {meta.label}
    </span>
  );
}

function DetailField({ label, value, sub }) {
  return (
    <div>
      <p className="text-xs" style={{ color: THEME.muted }}>{label}</p>
      <p className="font-medium mt-0.5" style={{ color: THEME.text }}>{value}</p>
      {sub}
    </div>
  );
}

function Banner({ tone, icon, children }) {
  const map = {
    danger: { bg: THEME.dangerSoft, color: THEME.danger },
    frozen: { bg: THEME.frozenSoft, color: THEME.frozen },
  };
  const c = map[tone];
  const Icon = icon;
  return (
    <div
      className="mt-4 rounded-xl px-3.5 py-3 text-sm flex items-start gap-2.5"
      style={{ background: c.bg, color: c.color }}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function MembershipSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}>
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-2">
          <div className="h-5 w-40 rounded" style={{ background: THEME.track }} />
          <div className="h-3 w-56 rounded" style={{ background: THEME.track }} />
        </div>
        <div className="h-6 w-16 rounded-full" style={{ background: THEME.track }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-16 rounded" style={{ background: THEME.track }} />
            <div className="h-4 w-20 rounded" style={{ background: THEME.track }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyMembership() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembership = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await memberDashboardApi.membership();
      setData(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Couldn't load membership details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, []);

  const pct = useMemo(() => {
    if (!data?.current) return null;
    return elapsedPct(data.current.start_date, data.current.end_date);
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6" style={{ background: THEME.bg }}>
        <MembershipSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl p-5 flex items-start gap-3 text-sm"
        style={{ background: THEME.dangerSoft, color: THEME.danger, border: `1px solid ${THEME.danger}22` }}
      >
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <p>{error}</p>
          <button
            onClick={fetchMembership}
            className="mt-2 inline-flex items-center gap-1.5 font-semibold underline underline-offset-2"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center text-center py-16 px-6"
        style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: THEME.accentSoft }}>
          <CreditCard size={28} color={THEME.accent} />
        </div>
        <h3 className="font-bold text-lg mb-1.5" style={{ color: THEME.text }}>
          No membership record found
        </h3>
        <p className="text-sm max-w-xs" style={{ color: THEME.muted }}>
          Contact gym staff to get your membership set up.
        </p>
      </div>
    );
  }

  const { current, days_remaining, is_expired, freeze_days_remaining, history } = data;
  const plan = current.MembershipPlan;
  const meta = statusMeta(current.status);

  return (
    <div className="space-y-6">
      {/* Current membership */}
      <div className="rounded-2xl p-5" style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-bold" style={{ color: THEME.text }}>
              {plan?.name || "Membership Plan"}
            </h3>
            {plan?.description && (
              <p className="text-sm mt-0.5" style={{ color: THEME.muted }}>{plan.description}</p>
            )}
          </div>
          <StatusPill status={current.status} />
        </div>

        {is_expired && current.status !== "DEACTIVE" && (
          <Banner tone="danger" icon={AlertTriangle}>
            Your membership has expired. Contact gym staff to renew.
          </Banner>
        )}

        {current.status === "FROZEN" && (
          <Banner tone="frozen" icon={Snowflake}>
            Frozen from {formatDate(current.freeze_start_date)} to {formatDate(current.freeze_end_date)}.
            {freeze_days_remaining !== null &&
              freeze_days_remaining >= 0 &&
              ` ${freeze_days_remaining} day${freeze_days_remaining === 1 ? "" : "s"} left until it unfreezes.`}
          </Banner>
        )}

        {!is_expired && current.status !== "DEACTIVE" && pct !== null && (
          <div className="mt-4 rounded-xl px-4 py-3.5" style={{ background: THEME.bg }}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: THEME.text }}>
                <Clock size={14} style={{ color: meta.color }} />
                {days_remaining} day{days_remaining === 1 ? "" : "s"} left
              </span>
              <span className="text-xs tabular-nums" style={{ color: THEME.muted }}>
                {Math.round(pct)}% complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: THEME.track }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${pct}%`, background: meta.color, transition: "width 500ms ease" }}
              />
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-sm">
          <DetailField label="Start date" value={formatDate(current.start_date)} />
          <DetailField label="End date" value={formatDate(current.end_date)} />
          <DetailField
            label="Duration"
            value={plan ? `${plan.duration} ${plan.duration_unit?.toLowerCase()}` : "—"}
          />
          <DetailField
            label="Amount paid"
            value={formatCurrency(current.final_amount)}
            sub={
              Number(current.discount) > 0 && (
                <p className="text-xs line-through mt-0.5" style={{ color: THEME.muted }}>
                  {formatCurrency(current.price)}
                </p>
              )
            }
          />
          <DetailField label="Payment status" value={current.payment_status} />
          <DetailField
            label="Auto renew"
            value={
              <span className="flex items-center gap-1.5">
                {current.auto_renew ? (
                  <CheckCircle2 size={14} style={{ color: THEME.success }} />
                ) : (
                  <XCircle size={14} style={{ color: THEME.muted }} />
                )}
                {current.auto_renew ? "Enabled" : "Disabled"}
              </span>
            }
          />
        </div>
      </div>

      {/* Past memberships */}
      {history?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-3.5" style={{ color: THEME.text }}>
            <History size={15} style={{ color: THEME.muted }} /> Past memberships
          </h4>
          <div className="space-y-2">
            {history.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-shadow hover:shadow-[0_2px_12px_rgba(31,32,51,0.06)]"
                style={{ background: THEME.bg }}
              >
                <div className="min-w-0">
                  <p className="font-medium truncate" style={{ color: THEME.text }}>
                    {m.MembershipPlan?.name || "Plan"}
                  </p>
                  <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: THEME.muted }}>
                    <Calendar size={11} /> {formatDate(m.start_date)} – {formatDate(m.end_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: THEME.muted }}>
                    <Tag size={11} /> {formatCurrency(m.final_amount)}
                  </span>
                  <StatusPill status={m.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}