import { ReactNode } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { UnderDevelopmentPage } from '../../pages/UnderDevelopmentPage';

interface MaintenanceGuardProps {
  children: ReactNode;
}

// Set this to false to disable maintenance mode
const MAINTENANCE_MODE = true;

export const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const { isAdmin, loading } = useAdmin();

  // If maintenance mode is disabled, show the app
  if (!MAINTENANCE_MODE) {
    return <>{children}</>;
  }

  // While checking admin status, show loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-background)',
        color: 'var(--color-text)'
      }}>
        Loading...
      </div>
    );
  }

  // If user is admin, show the app
  if (isAdmin) {
    return <>{children}</>;
  }

  // Otherwise show under development page
  return <UnderDevelopmentPage />;
};
