import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StackProvider, StackTheme } from '@stackframe/react';
import { stackClientApp } from './config/stack';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <ThemeProvider>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </BrowserRouter>
    </Suspense>
  );
};

export default App;