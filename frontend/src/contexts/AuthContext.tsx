import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useUser } from '@stackframe/react';
import type { AuthContextType } from '../models/Auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const user = useUser();

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoggedIn: !!user,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
