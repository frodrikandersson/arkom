import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StackHandler } from '@stackframe/react';
import { stackClientApp } from '../config/stack';
import { MainLayout } from '../layouts/MainLayout';

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const UserProfilePage = lazy(() => import('../pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const TestNotifications = lazy(() => import('../pages/TestNotifications').then(m => ({ default: m.TestNotifications })));

function HandlerRoutes() {
  const location = useLocation();
  return <StackHandler app={stackClientApp} location={location.pathname} fullPage />;
}

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    color: 'var(--color-text)'
  }}>
    Loading...
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Auth handler routes (no layout) */}
        <Route path="/handler/*" element={<HandlerRoutes />} />
        
        {/* Main app routes (with layout) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          
          {/* Placeholder routes */}
          <Route path="/commissions" element={<div style={{ padding: '2rem' }}>Commissions Page</div>} />
          <Route path="/store" element={<div style={{ padding: '2rem' }}>Store Page</div>} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/requests" element={<div style={{ padding: '2rem' }}>My Requests Page</div>} />
          <Route path="/orders" element={<div style={{ padding: '2rem' }}>My Orders Page</div>} />
          <Route path="/characters" element={<div style={{ padding: '2rem' }}>Characters Page</div>} />
          <Route path="/saved" element={<div style={{ padding: '2rem' }}>Saved Page</div>} />
          <Route path="/artist-dashboard" element={<div style={{ padding: '2rem' }}>Artist Dashboard Page</div>} />
          <Route path="/test-notifications" element={<TestNotifications />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<div style={{ padding: '2rem' }}>Help Page</div>} />
          <Route path="/about" element={<div style={{ padding: '2rem' }}>About Us Page</div>} />
          <Route path="/terms" element={<div style={{ padding: '2rem' }}>Terms of Service Page</div>} />
          <Route path="/privacy" element={<div style={{ padding: '2rem' }}>Privacy Policy Page</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};