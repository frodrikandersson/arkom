import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';
import { AdminProvider } from './contexts/AdminContext';

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
    <Suspense fallback={null}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  );
};

export default App;
