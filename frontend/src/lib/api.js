import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

export const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ironline_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = () => {};
export const registerUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(err);
  }
);

const unwrap = (promise) => promise.then((res) => res.data);

// ---------- Auth ----------
export const authApi = {
  register: (payload) => unwrap(client.post('/auth/register', payload)),
  login: (payload) => unwrap(client.post('/auth/login', payload)),
  me: () => unwrap(client.get('/auth/me')),
  logout:() => unwrap(client.post('/auth/logout')),
};

// ---------- Tenant ----------
export const tenantApi = {
  create: (payload) => unwrap(client.post('/tenant', payload)),
  list: () => unwrap(client.get('/tenant')),
  me: () => unwrap(client.get('/tenant/me')),
  getDetails: (tenantId) =>
    unwrap(client.get(`/tenant/${tenantId}`)),
};

// ---------- Attendance (check-in / check-out) ----------
export const attendanceApi = {
  checkIn: (payload) => unwrap(client.post('/attendance/checkin', payload)),
  checkOut: (payload) => unwrap(client.post('/attendance/checkout', payload)),
  history: (params) => unwrap(client.get('/attendance/attendance-history', { params })),
};

// ---------- Attendance Rules ----------
export const attendanceRuleApi = {
  get: () => unwrap(client.get('/attendance-rule')),
  update: (payload) => unwrap(client.put('/attendance-rule', payload)),
};

export const memberSlotApi = {
  create: (payload) => unwrap(client.post('/member-slot', payload)),
  getByMember: (memberId) =>
    unwrap(client.get(`/member-slot/${memberId}`)),
  update: (memberId, payload) =>
    unwrap(client.put(`/member-slot/${memberId}`, payload)),
};


// ---------- Users (staff) ----------
export const userApi = {
  create: (payload) => unwrap(client.post('/users', payload)),
  list: () => unwrap(client.get('/users')),
  getById: (id) => unwrap(client.get(`/users/${id}`)),
  getByBranch: (branchId) => unwrap(client.get(`/users/branch/${branchId}`)),
  update: (id, payload) => unwrap(client.patch(`/users/${id}`, payload)),
  remove: (id) => unwrap(client.delete(`/users/${id}`)),
};

// ---------- Branches ----------
export const branchApi = {
  create: (payload) => unwrap(client.post('/branches', payload)),
  list: () => unwrap(client.get('/branches')),
  getById: (id) => unwrap(client.get(`/branches/${id}`)),
  update: (id, payload) => unwrap(client.patch(`/branches/${id}`, payload)),
  remove: (id) => unwrap(client.delete(`/branches/${id}`)),
};

// ---------- Members ----------
export const memberApi = {
  create: (payload) => unwrap(client.post('/members', payload)),
  list: () => unwrap(client.get('/members')),
  getById: (id) => unwrap(client.get(`/members/${id}`)),
  getByBranch: (branchId) => unwrap(client.get(`/members/branch/${branchId}`)),
  getByBranchAndId: (branchId, memberId) =>
    unwrap(client.get(`/members/branch/${branchId}/member/${memberId}`)),
  update: (id, payload) => unwrap(client.put(`/members/${id}`, payload)),
  remove: (id) => unwrap(client.delete(`/members/${id}`)),
};

// ---------- Member Dashboard ----------
export const memberDashboardApi = {
  get: () => unwrap(client.get('/member-dashboard')),
};

// ---------- Membership Plans ----------
export const membershipPlanApi = {
  create: (payload) => unwrap(client.post('/membership', payload)),
  list: () => unwrap(client.get('/membership')),
  getById: (id) => unwrap(client.get(`/membership/${id}`)),
  update: (id, payload) => unwrap(client.put(`/membership/${id}`, payload)),
  remove: (id) => unwrap(client.delete(`/membership/${id}`)),
};

// ---------- Member Memberships ----------
export const memberMembershipApi = {
  create: (payload) => unwrap(client.post('/member-membership', payload)),
  list: () => unwrap(client.get('/member-membership')),
  getByMember: (memberId) => unwrap(client.get(`/member-membership/member/${memberId}`)),
  getById: (id) => unwrap(client.get(`/member-membership/${id}`)),
  update: (id, payload) => unwrap(client.patch(`/member-membership/${id}`, payload)),
  deactivate: (id) => unwrap(client.patch(`/member-membership/${id}/deactivate`)),
  freeze: (id, payload) => unwrap(client.patch(`/member-membership/${id}/freeze`, payload)),
};

// ---------- Goals ----------
export const goalApi = {
  create: (payload) => unwrap(client.post('/goals', payload)),
  list: () => unwrap(client.get('/goals')),
  getById: (id) => unwrap(client.get(`/goals/${id}`)),
  update: (id, payload) => unwrap(client.patch(`/goals/${id}`, payload)),
  remove: (id) => unwrap(client.delete(`/goals/${id}`)),
};

export const healthProfileApi = {
  create: (payload) =>
    unwrap(client.post('/health-profile', payload)),

  list: () =>
    unwrap(client.get('/health-profile')),

  getByBranch: (branchId) =>
    unwrap(client.get(`/health-profile/branch/${branchId}`)),

  getById: (id) =>
    unwrap(client.get(`/health-profile/${id}`)),

  update: (id, payload) =>
    unwrap(client.patch(`/health-profile/${id}`, payload)),

  remove: (id) =>
    unwrap(client.delete(`/health-profile/${id}`)),
};

// ---------- Measurements ----------
export const measurementApi = {
  create: (payload) =>
    unwrap(client.post('/measurements', payload)),

  list: () =>
    unwrap(client.get('/measurements')),

  getByBranch: (branchId) =>
    unwrap(client.get(`/measurements/branch/${branchId}`)),

  getById: (id) =>
    unwrap(client.get(`/measurements/${id}`)),

  update: (id, payload) =>
    unwrap(client.patch(`/measurements/${id}`, payload)),

  remove: (id) =>
    unwrap(client.delete(`/measurements/${id}`)),
};

// ---------- Diet Plans ----------
export const dietPlanApi = {
  create: (payload) =>
    unwrap(client.post('/diet-plans', payload)),

  list: () =>
    unwrap(client.get('/diet-plans')),

  getById: (id) =>
    unwrap(client.get(`/diet-plans/${id}`)),

  update: (id, payload) =>
    unwrap(client.put(`/diet-plans/${id}`, payload)),

  remove: (id) =>
    unwrap(client.delete(`/diet-plans/${id}`)),
};

// ---------- Diet Plan Meals ----------
export const dietPlanMealApi = {
  create: (payload) =>
    unwrap(client.post('/diet-plan-meals', payload)),

  list: () =>
    unwrap(client.get('/diet-plan-meals')),

  getById: (id) =>
    unwrap(client.get(`/diet-plan-meals/${id}`)),

  update: (id, payload) =>
    unwrap(client.put(`/diet-plan-meals/${id}`, payload)),

  remove: (id) =>
    unwrap(client.delete(`/diet-plan-meals/${id}`)),
};

// ---------- Exercises ----------
export const exerciseApi = {
  create: (payload) =>
    unwrap(client.post('/exercises', payload)),

  list: () =>
    unwrap(client.get('/exercises')),

  getById: (id) =>
    unwrap(client.get(`/exercises/${id}`)),

  update: (id, payload) =>
    unwrap(client.patch(`/exercises/${id}`, payload)),

  remove: (id) =>
    unwrap(client.delete(`/exercises/${id}`)),
};

// ---------- Workout Plans ----------
export const workoutPlanApi = {
  create: (payload) =>
    unwrap(client.post('/workout-plans', payload)),

  list: () =>
    unwrap(client.get('/workout-plans')),

  getById: (id) =>
    unwrap(client.get(`/workout-plans/${id}`)),

  update: (id, payload) =>
    unwrap(client.patch(`/workout-plans/${id}`, payload)),

  remove: (id) =>
    unwrap(client.delete(`/workout-plans/${id}`)),
};

// ---------- Workout Plan Exercises ----------
export const workoutPlanExerciseApi = {
  create: (payload) =>
    unwrap(client.post('/workout-plan-exercises', payload)),

  list: () =>
    unwrap(client.get('/workout-plan-exercises')),

  getById: (id) =>
    unwrap(client.get(`/workout-plan-exercises/${id}`)),

  update: (id, payload) =>
    unwrap(client.patch(`/workout-plan-exercises/${id}`, payload)),

  remove: (id) =>
    unwrap(client.delete(`/workout-plan-exercises/${id}`)),
};

// ---------- AI (local Ollama: Llama / Gemma) ----------
export const aiApi = {
  models: () => unwrap(client.get('/ai/models')),
  // local models can take a while on CPU, so no axios timeout; pass `signal` to cancel
  suggest: (payload, { signal } = {}) => unwrap(client.post('/ai/suggest', payload, { signal, timeout: 0 })),
};

export const extractErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (data.message) return data.message;
  if (Array.isArray(data.errors)) return data.errors.map((e) => e.message).join(', ');
  if (Array.isArray(data.error)) return data.error.map((e) => e.message).join(', ');
  return fallback;
};
