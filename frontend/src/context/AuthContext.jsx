import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi, registerUnauthorizedHandler, extractErrorMessage } from '../lib/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ironline_token';

function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    // payload: { id, email, role, tenant_id, iat, exp }
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => decodeToken(localStorage.getItem(TOKEN_KEY)));
  const [profile, setProfile] = useState(null); // extra details from /auth/me (ADMIN only)
  const [ready, setReady] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => logout());
  }, [logout]);

  const login = async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    const t = res.token;
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(decodeToken(t));
    return res;
  };

  const register = async (payload) => {
    return authApi.register(payload);
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) {
      authApi
        .me()
        .then((res) => setProfile(res.data))
        .catch(() => {});
    } else {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const value = useMemo(
    () => ({
      token,
      user, // { id, email, role, tenant_id }
      profile,
      isAuthenticated: !!token && !!user,
      ready,
      login,
      register,
      logout,
    }),
    [token, user, profile, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { extractErrorMessage };
