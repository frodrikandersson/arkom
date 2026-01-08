import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';
import { AdminProvider } from './contexts/AdminContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function AppContent() {
  const { isLoading } = useTheme();
  
  if (isLoading) {
    return null;
  }
  
  return (
    <AdminProvider>
      <AppRoutes />
    </AdminProvider>
  );
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
