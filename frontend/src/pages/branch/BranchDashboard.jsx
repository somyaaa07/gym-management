import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Clock,
  RefreshCw,
  Phone,
  Mail,
  LogIn,
  LogOut,
} from "lucide-react";

import { branchDashboardApi, extractErrorMessage } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Spinner } from "../../components/ui/Misc.jsx";
import usePageMeta from "../../lib/usePageMeta.js";

export default function BranchDashboard() {
  usePageMeta(
    "Branch Dashboard",
    "Manage and monitor your branch"
  );

  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await branchDashboardApi.get();

      setDashboard(res.data || {});
    } catch (err) {
      console.error("Branch dashboard error:", err);

      setError(
        extractErrorMessage(
          err,
          "Could not load branch dashboard"
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

 

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  // ERROR


  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-red-600 mb-3">
            {error}
          </p>

          <button
            onClick={() => loadDashboard()}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const recentMembers = dashboard?.recentMembers || [];
  const recentAttendance = dashboard?.recentAttendance || [];

  return (
    <div className="p-4 md:p-6 space-y-6">


    

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
         

          <p className="text-md text-gray-500 mt-1">
            Welcome back, {user?.name || "Branch Admin"}
          </p>
        </div>

        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* ==========================================
          STAT CARDS
      ========================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Total Members */}

        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Members
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalMembers ?? 0}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users
                size={22}
                className="text-blue-600"
              />
            </div>

          </div>

        </div>

        {/* Active Members */}

        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Active Members
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeMembers ?? 0}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
              <UserCheck
                size={22}
                className="text-green-600"
              />
            </div>

          </div>

        </div>

        {/* Today's Attendance */}

        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Today's Check
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.todayAttendance ?? 0}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-purple-50 flex items-center justify-center">
              <Clock
                size={22}
                className="text-purple-600"
              />
            </div>

          </div>

        </div>

      </div>


      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


        <div className="bg-white border rounded-xl shadow-sm">

          <div className="p-5 border-b">

            <h2 className="text-lg font-semibold text-gray-900">
              Recent Members
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Recently added members in your branch
            </p>

          </div>

          <div className="divide-y">

            {recentMembers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No members found
              </div>
            ) : (
              recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between gap-4"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users size={18} />
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        {member.name}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500">

                        {member.phone && (
                          <>
                            <Phone size={13} />
                            <span>{member.phone}</span>
                          </>
                        )}

                      </div>
                    </div>

                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      member.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {member.status || "ACTIVE"}
                  </span>

                </div>
              ))
            )}

          </div>

        </div>

        {/* ========================================
            RECENT ATTENDANCE
        ======================================== */}

        <div className="bg-white border rounded-xl shadow-sm">

          <div className="p-5 border-b">

            <h2 className="text-lg font-semibold text-gray-900">
              Recent Attendance
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest check-in activity
            </p>

          </div>

          <div className="divide-y">

            {recentAttendance.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No attendance records found
              </div>
            ) : (
              recentAttendance.map((attendance) => {

                const member =
                  attendance.Member ||
                  attendance.member;

                return (
                  <div
                    key={attendance.id}
                    className="p-4 flex items-center justify-between gap-4"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                        <Clock
                          size={18}
                          className="text-purple-600"
                        />
                      </div>

                      <div>

                        <p className="font-medium text-gray-900">
                          {member?.name || "Unknown Member"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {member?.phone || ""}
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <LogIn size={14} />
                        {attendance.check_in_time
                          ? new Date(
                              attendance.check_in_time
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--"}
                      </div>

                      {attendance.check_out_time && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <LogOut size={13} />
                          {new Date(
                            attendance.check_out_time
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>

      </div>

    </div>
  );
}