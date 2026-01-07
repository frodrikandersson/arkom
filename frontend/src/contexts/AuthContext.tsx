import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser } from '../services/authService';
import type { AuthContextType, User } from '../models/Auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(response.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const contextValue: AuthContextType = {
    user,
    isLoggedIn: !!user,
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
