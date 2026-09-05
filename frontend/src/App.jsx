import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ui/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tenants from './pages/Tenants.jsx';
import Tenant from './pages/Tenant.jsx';
import Branches from './pages/Branches.jsx';
import Users from './pages/Users.jsx';
import Members from './pages/Members.jsx';
import MemberDetail from './pages/MemberDetail.jsx';
import MembershipPlans from './pages/MembershipPlans.jsx';
import MemberMemberships from './pages/MemberMemberships.jsx';
import NotFound from './pages/NotFound.jsx';
import FaceIdTest from './pages/FaceRegistration.jsx';
import FaceVerification  from './pages/FaceVerification.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/app/dashboard' : '/login'} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tenants" element={<ProtectedRoute roles={['SUPER_ADMIN']}><Tenants /></ProtectedRoute>} />
        <Route path="tenant" element={<ProtectedRoute roles={['ADMIN']}><Tenant /></ProtectedRoute>} />
        <Route path="branches" element={<ProtectedRoute roles={['ADMIN']}><Branches /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}><Users /></ProtectedRoute>} />
        <Route path="members" element={<ProtectedRoute roles={['ADMIN']}><Members /></ProtectedRoute>} />
        <Route path="members/:id" element={<ProtectedRoute roles={['ADMIN']}><MemberDetail /></ProtectedRoute>} />
        <Route path="membership-plans" element={<ProtectedRoute roles={['ADMIN']}><MembershipPlans /></ProtectedRoute>} />
        <Route path="memberships" element={<ProtectedRoute roles={['ADMIN']}><MemberMemberships /></ProtectedRoute>} />
        <Route path="faceidtest" element={<ProtectedRoute roles={['ADMIN']}><FaceIdTest /></ProtectedRoute>} />
                <Route path="faceidverification" element={<FaceVerification/>} />

      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
