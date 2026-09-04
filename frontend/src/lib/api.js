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
};

// ---------- Tenant ----------
export const tenantApi = {
  create: (payload) => unwrap(client.post('/tenant', payload)),
  me: () => unwrap(client.get('/tenant/me')),
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

export const extractErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (data.message) return data.message;
  if (Array.isArray(data.errors)) return data.errors.map((e) => e.message).join(', ');
  if (Array.isArray(data.error)) return data.error.map((e) => e.message).join(', ');
  return fallback;
};
