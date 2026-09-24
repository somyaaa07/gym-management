import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tenants from "./pages/super-admin/Tenants.jsx";
import Tenant from "./pages/admin/Tenant.jsx";
import TenantDetails from "./pages/super-admin/TenantDetails.jsx";
import Branches from "./pages/admin/Branches.jsx";
import Users from "./pages/admin/Users.jsx";
import Members from "./pages/admin/Members.jsx";
import MemberDetail from "./pages/admin/MemberDetail.jsx";
import MembershipPlans from "./pages/admin/MembershipPlans.jsx";
import MemberMemberships from "./pages/admin/MemberMemberships.jsx";
import NotFound from "./pages/NotFound.jsx";
import FaceIdTest from "./pages/FaceRegistration.jsx";
import FaceVerification from "./pages/FaceVerification.jsx";
import Attendance from "./pages/admin/Attendance.jsx";
import SetPassword from "./pages/member/SetPassword.jsx";
import AttendanceAdmin from "./pages/admin/AdminAttendance.jsx";
import MemberDashboard from "./pages/member/memberDashboard.jsx";
import MemberSlotHistory from "./pages/member/memberslotHistory.jsx";
import MyAttendance from "./pages/member/memberAttendanceHistory.jsx";
import MyHealthProfile from "./pages/member/myhealthprofile.jsx";
export default function App() {
const { isAuthenticated, user } = useAuth();
const home = user?.role === "MEMBER" ? "/app/member-dashboard" : "/app/member-dashboard";

  return (
    <Routes>
     <Route path="/" element={<Navigate to={isAuthenticated ? home : "/login"} replace />} />

   <Route path="/login" element={isAuthenticated ? <Navigate to={home} replace /> : <Login />} />

    <Route path="/register" element={isAuthenticated ? <Navigate to={home} replace /> : <Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="tenants"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <Tenants />
            </ProtectedRoute>
          }
        />
        <Route
          path="tenants/:tenantId"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <TenantDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="tenant"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Tenant />
            </ProtectedRoute>
          }
        />

        <Route
          path="branches"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Branches />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN","BRANCH_ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="members"
          element={
            <ProtectedRoute roles={["ADMIN","BRANCH_ADMIN"]}>
              <Members />
            </ProtectedRoute>
          }
        /> */}

        

     <Route 
  path="members" 
  element={ 
    <ProtectedRoute>
      <Members 
        branchId={
          user?.role === "BRANCH_ADMIN"
            ? user?.branch_id
            : undefined
        } 
      />
    </ProtectedRoute>
  } 
/>
          
      
        <Route
          path="members/:id"
          element={
            <ProtectedRoute roles={["ADMIN","BRANCH_ADMIN"]}>
              <MemberDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="membership-plans"
          element={
            <ProtectedRoute roles={["ADMIN","BRANCH_ADMIN"]}>
              <MembershipPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="memberships"
          element={
            <ProtectedRoute roles={["ADMIN","BRANCH_ADMIN"]}>
              <MemberMemberships />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER", "RECEPTIONIST"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="faceidtest"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <FaceIdTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="faceidverification"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER", "RECEPTIONIST"]}>
              <FaceVerification />
            </ProtectedRoute>
          }
        />

        <Route 
        path="attendance-history"
        element={
          <ProtectedRoute roles={["ADMIN","BRANCH_ADMIN"]}>
            <AttendanceAdmin/>
          </ProtectedRoute>
        }
        />
              <Route path="member-dashboard" element={            <ProtectedRoute roles={["MEMBER"]}>

        <MemberDashboard />

      </ProtectedRoute>
        
        } />

        <Route path="myslot-history" element={
          <ProtectedRoute roles={["MEMBER"]}>
            <MemberSlotHistory />
          </ProtectedRoute>
        } />

        <Route path="my-attendance" element={
          <ProtectedRoute roles={["MEMBER"]}>
           <MyAttendance/>
          </ProtectedRoute>
        }/>
         <Route path="health-profile" element={
          <ProtectedRoute roles={["MEMBER","ADMIN"]}>
            <MyHealthProfile/>
          </ProtectedRoute>
        }/>


        {/* <Route path="myattendance" element={
          <ProtectedRoute roles={["MEMBER"]}></ProtectedRoute>
        }/> */}
      </Route>

              <Route path="/set-password" element={<SetPassword />} />
              



      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
