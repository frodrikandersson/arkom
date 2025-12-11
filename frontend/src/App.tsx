import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StackProvider, StackTheme, useUser } from '@stackframe/react';
import { stackClientApp } from './config/stack';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';

function AppContent() {
  const { isLoading } = useTheme();
  
  // Don't render until theme is loaded to prevent flash of unstyled content
  if (isLoading) {
    return null;
  }
  
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function ThemedApp() {
  const user = useUser();
  
  return (
    <ThemeProvider userId={user?.id}>
      <AppContent />
    </ThemeProvider>
  );
}

export const App: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <ThemedApp />
          </StackTheme>
        </StackProvider>
      </BrowserRouter>
    </Suspense>
  );
};

export default App;