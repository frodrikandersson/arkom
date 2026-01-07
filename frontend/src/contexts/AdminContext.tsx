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
  
  // Extract ID as a stable primitive
  const userId = user?.id ?? null;
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      if (userId) {
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
  }, [userId]); // Depend on the extracted primitive, not user?.id

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
