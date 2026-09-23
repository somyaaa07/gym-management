import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  Users,
  Clock,
  Timer,
  LogIn,
  LogOut,
  CalendarDays,
} from 'lucide-react';
import usePageMeta from '../../lib/usePageMeta.js';
import { attendanceApi, branchApi, memberApi, extractErrorMessage } from '../../lib/api.js';
import { Field, Select } from '../../components/ui/Field.jsx';
import Button from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Misc.jsx';

// ---------- status -> color mapping ----------
// ON_TIME      -> volt (brand green, matches success elsewhere in app)
// LATE         -> amber (distinct warning, not used elsewhere yet)
// EARLY_LEAVE  -> ember (existing error/alert color)
// ACTIVE       -> sky (still inside the gym, hasn't checked out)
const STATUS_META = {
  ON_TIME: { label: 'On time', classes: 'bg-volt-500/10 text-volt-500 border-volt-500/30' },
  LATE: { label: 'Late', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  EARLY_LEAVE: { label: 'Early leave', classes: 'bg-ember-500/10 text-ember-500 border-ember-500/30' },
  ACTIVE: { label: 'Still in', classes: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status || '—', classes: 'bg-ink-700 text-ink-300 border-ink-600' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${meta.classes}`}>
      {meta.label}
    </span>
  );
}

function fmtTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function duration(checkIn, checkOut) {
  if (!checkIn) return '—';
  const end = checkOut ? new Date(checkOut) : new Date();
  const mins = Math.max(0, Math.round((end - new Date(checkIn)) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const STAT_CARDS = [
  { key: 'total', label: 'Total records', icon: Users, classes: 'text-bone-100' },
  { key: 'onTime', label: 'On time', icon: Clock, classes: 'text-volt-500' },
  { key: 'late', label: 'Late', icon: Timer, classes: 'text-amber-400' },
  { key: 'active', label: 'Still in', icon: LogIn, classes: 'text-sky-400' },
  { key: 'earlyLeave', label: 'Early leaves', icon: LogOut, classes: 'text-ember-500' },
];

export default function AttendanceAdmin() {
  usePageMeta('Attendance · Admin', 'All members, check-in and check-out at a glance');

  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [branchId, setBranchId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [attRes, branchRes, memberRes] = await Promise.all([
        attendanceApi.history(
          memberId || (fromDate && toDate) ? { member_id: memberId || undefined, from_date: fromDate || undefined, to_date: toDate || undefined } : undefined
        ),
        branchApi.list(),
        memberApi.list(),
      ]);
      setRecords(attRes.data || []);
      setBranches(branchRes.data || []);
      setMembers(memberRes.data || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load attendance'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // server already filters by member_id / date range when set; re-fetch on those changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, fromDate, toDate]);

  const branchName = (id) => branches.find((b) => b.id === id)?.name || '—';

  const rows = useMemo(() => {
    return records.map((r) => {
      const checkInStatus = r.check_in_status;
      const checkOutStatus = r.check_out_time ? r.check_out_status : 'ACTIVE';
      return { ...r, checkInStatus, checkOutStatus };
    });
  }, [records]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (branchId && r.branch_id !== branchId) return false;
      if (statusFilter && r.checkInStatus !== statusFilter && r.checkOutStatus !== statusFilter) return false;
      if (q) {
        const name = (r.Member?.name || '').toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [rows, branchId, statusFilter, search]);

  const stats = useMemo(() => {
    const s = { total: filteredRows.length, onTime: 0, late: 0, active: 0, earlyLeave: 0 };
    filteredRows.forEach((r) => {
      if (r.checkInStatus === 'LATE') s.late += 1;
      if (r.checkInStatus === 'ON_TIME') s.onTime += 1;
      if (r.checkOutStatus === 'ACTIVE') s.active += 1;
      if (r.checkOutStatus === 'EARLY_LEAVE') s.earlyLeave += 1;
    });
    return s;
  }, [filteredRows]);

  const clearFilters = () => {
    setBranchId('');
    setMemberId('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-bone-100"></h1>
          <p className="text-sm text-ink-400"></p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map(({ key, label, icon: Icon, classes }) => (
          <div key={key} className="surface-card p-4 flex items-center gap-3">
            <div className="rounded-xl bg-ink-800 p-2.5">
              <Icon size={16} className={classes} />
            </div>
            <div>
              <div className={`font-display text-lg font-bold ${classes}`}>{stats[key]}</div>
              <div className="text-[11px] text-ink-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="surface-card p-4 sm:p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <Field label="Search member">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name…"
              className="w-full rounded-xl border border-ink-600 bg-ink-800 pl-9 pr-3 py-2 text-sm text-bone-100 placeholder:text-ink-500 outline-none focus:border-volt-500/50"
            />
          </div>
        </Field>

        <Field label="Branch">
          <Select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Member">
          <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">All members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Any status</option>
            <option value="ON_TIME">On time</option>
            <option value="LATE">Late</option>
            <option value="EARLY_LEAVE">Early leave</option>
            <option value="ACTIVE">Still in</option>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="From">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-bone-100 outline-none focus:border-volt-500/50"
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-bone-100 outline-none focus:border-volt-500/50"
            />
          </Field>
        </div>

        <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      {/* table */}
      <div className="surface-card overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner size={26} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-ember-500">{error}</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-400">No attendance records match these filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold">Branch</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Check-in</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Check-out</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} className="border-b border-ink-800 last:border-0 hover:bg-ink-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-bone-100">{r.Member?.name || '—'}</td>
                    <td className="px-4 py-3 text-ink-400">{branchName(r.branch_id)}</td>
                    <td className="px-4 py-3 text-ink-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-ink-500" />
                        {fmtDate(r.check_in_time)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-300">{fmtTime(r.check_in_time)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.checkInStatus} />
                    </td>
                    <td className="px-4 py-3 text-ink-300">{fmtTime(r.check_out_time)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.checkOutStatus} />
                    </td>
                    <td className="px-4 py-3 text-ink-400">{duration(r.check_in_time, r.check_out_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}