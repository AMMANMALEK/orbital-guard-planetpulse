import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'officer' | 'viewer';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: UserRole | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  selectRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email: string, _password: string) => {
    setUser({ id: '1', name: email.split('@')[0], email, role: 'admin' });
    setIsAuthenticated(true);
    return true;
  };

  const register = (name: string, email: string, _password: string) => {
    setUser({ id: '1', name, email, role: 'admin' });
    setIsAuthenticated(true);
    return true;
  };

  const selectRole = (role: UserRole) => {
    if (user) setUser({ ...user, role });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role: user?.role || null, login, register, selectRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
