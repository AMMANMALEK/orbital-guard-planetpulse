import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export type UserRole = 'admin' | 'officer' | 'viewer';

const STORAGE_KEY = 'planetpulse_auth';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assigned_state?: string;
  assigned_city?: string;
  assigned_region?: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface StoredSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<UserRole>;
  register: (name: string, email: string, password: string, role?: UserRole, assigned_region?: any) => Promise<UserRole>;
  selectRole: (role: UserRole) => void;
  logout: () => void;
}

// ─── Hardcoded test accounts (bypass backend entirely) ───────────────────────
const TEST_ACCOUNTS: Record<string, AuthUser & { password: string }> = {
  'admin@test.com': {
    id: 'test-admin-001',
    name: 'Test Admin',
    email: 'admin@test.com',
    role: 'admin',
    assigned_state: 'India',
    assigned_city: 'Delhi',
    assigned_region: { name: 'Global', latitude: 20.5937, longitude: 78.9629 },
    password: 'admin123',
  },
  'officer@test.com': {
    id: 'test-officer-001',
    name: 'Test Officer',
    email: 'officer@test.com',
    role: 'officer',
    assigned_state: 'Gujarat',
    assigned_city: 'Anand',
    assigned_region: { name: 'Western Ghats', latitude: 13.217, longitude: 75.143 },
    password: 'officer123',
  },
  'viewer@test.com': {
    id: 'test-viewer-001',
    name: 'Test Viewer',
    email: 'viewer@test.com',
    role: 'viewer',
    assigned_region: { name: 'Public', latitude: 20.0, longitude: 78.0 },
    password: 'viewer123',
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (data.expiresAt && Date.now() > data.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser, token: string) {
  const session: StoredSession = {
    user,
    token,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadSession();
    if (stored?.user) {
      setUser(stored.user);
      setIsAuthenticated(true);
    }
    setHydrated(true);
  }, []);

  const persistUser = (u: AuthUser, token: string) => {
    setUser(u);
    setIsAuthenticated(true);
    saveSession(u, token);
  };

  const login = async (email: string, password: string): Promise<UserRole> => {
    // Check test accounts first (no backend needed)
    const testAccount = TEST_ACCOUNTS[email.toLowerCase()];
    if (testAccount && testAccount.password === password) {
      const { password: _pw, ...u } = testAccount;
      persistUser(u, 'test-token-' + u.role);
      return u.role;
    }

    // Fall back to real backend API
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = res.data;
      const u: AuthUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        assigned_state: userData.assigned_state,
        assigned_city: userData.assigned_city,
        assigned_region: userData.assigned_region,
      };
      persistUser(u, access_token);
      return u.role;
    } catch (err: any) {
      // Give a friendlier hint for demo purposes
      throw err;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'viewer',
    assigned_region: any = null
  ): Promise<UserRole> => {
    const res = await api.post('/auth/register', { name, email, password, role, assigned_region });
    const { access_token, user: userData } = res.data;
    const u: AuthUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      assigned_state: userData.assigned_state,
      assigned_city: userData.assigned_city,
      assigned_region: userData.assigned_region,
    };
    persistUser(u, access_token);
    return u.role;
  };

  const selectRole = (role: UserRole) => {
    if (user) {
      const u = { ...user, role };
      setUser(u);
      const stored = loadSession();
      if (stored) saveSession(u, stored.token);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearSession();
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    role: user?.role || null,
    login,
    register,
    selectRole,
    logout,
  };

  if (!hydrated) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
