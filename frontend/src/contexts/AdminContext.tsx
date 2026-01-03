import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { checkAdminStatus } from '../services/adminService';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      if (user) {
        try {
          const adminStatus = await checkAdminStatus();
          if (isMounted) {
            setIsAdmin(adminStatus);
          }
        } catch (error) {
          console.error('Failed to check admin status:', error);
          if (isMounted) {
            setIsAdmin(false);
          }
        }
      } else {
        if (isMounted) {
          setIsAdmin(false);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only re-run if user ID changes, not the entire user object

  return (
    <AdminContext.Provider value={{ isAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
