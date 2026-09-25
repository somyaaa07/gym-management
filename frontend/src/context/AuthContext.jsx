import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { jwtDecode } from "jwt-decode";

import {
  authApi,
  registerUnauthorizedHandler,
  extractErrorMessage,
} from "../lib/api.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "ironline_token";

function decodeToken(token) {
  if (!token) return null;

  try {
    const payload = jwtDecode(token);

    // payload:
    // {
    //   id,
    //   email,
    //   role,
    //   tenant_id,
    //   branch_id,
    //   iat,
    //   exp
    // }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const [user, setUser] = useState(() =>
    decodeToken(localStorage.getItem(TOKEN_KEY)),
  );

  const [profile, setProfile] = useState(null);

  const [ready, setReady] = useState(true);

const logout = useCallback(async () => {
    try {
        await authApi.logout();
    } catch (err) {
        console.log("Logout API failed, clearing session anyway", err);
    } finally {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setProfile(null);
    }
}, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => logout());
  }, [logout]);

  // ==========================================
  // LOGIN
  // ==========================================
  const login = async ({ email, password }) => {
    const res = await authApi.login({
      email,
      password,
    });

    const t = res.token;

    localStorage.setItem(TOKEN_KEY, t);

    setToken(t);

    // JWT contains:
    // id, email, role, tenant_id, branch_id
    const decodedUser = decodeToken(t);

    setUser(decodedUser);

    return decodedUser;
  };

  // ==========================================
  // REGISTER
  // ==========================================
  const register = async (payload) => {
    return authApi.register(payload);
  };

  // ==========================================
  // GET CURRENT USER PROFILE
  // ==========================================
  useEffect(() => {
    if (!token || !user) {
      setProfile(null);
      return;
    }

    // /auth/me is only for admin-side roles. MEMBER never calls it — the
    // backend rejects it with 403, and members don't need it anyway:
    // their own data (diet plan, workout plan, goals, attendance...) is
    // resolved server-side from req.user.id via findLoggedInMember(), not
    // from anything merged into this profile.
    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "BRANCH_ADMIN"];

    if (!allowedRoles.includes(user.role)) {
      setProfile(null);
      return;
    }

    authApi
      .me()
      .then((res) => {
        setProfile(res.data);

        // Keep JWT data and /auth/me data together.
        // This makes branch_id available to Users.jsx.
        setUser((prev) => ({
          ...prev,
          ...res.data,
        }));
      })
      .catch(() => {
        // Keep your existing behavior:
        // don't logout just because /auth/me failed.
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  const value = useMemo(
    () => ({
      token,

      // {
      //   id,
      //   email,
      //   role,
      //   tenant_id,
      //   branch_id
      // }
      user,

      profile,

      isAuthenticated: !!token && !!user,

      ready,

      login,
      register,
      logout,
    }),
    [token, user, profile, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}

export { extractErrorMessage };