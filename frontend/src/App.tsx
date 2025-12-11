import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StackProvider, StackTheme, useUser } from '@stackframe/react';
import { stackClientApp } from './config/stack';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';

function AppContent() {
  const user = useUser();
  
  return (
    <ThemeProvider userId={user?.id}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export const App: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <AppContent />
          </StackTheme>
        </StackProvider>
      </BrowserRouter>
    </Suspense>
  );
};

export default App;