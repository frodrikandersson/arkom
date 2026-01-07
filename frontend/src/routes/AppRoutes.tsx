import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ShopDashboard } from '../pages/ShopDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { CommissionsPage } from '../pages/CommissionsPage';
import { StorePage } from '../pages/StorePage';
import { ServicePage } from '../pages/ServicePage';

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const UserProfilePage = lazy(() => import('../pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })));

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
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Main app routes (with layout) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            
            {/* Browse routes */}
            <Route path="/commissions" element={<CommissionsPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/service/:serviceId" element={<ServicePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/requests" element={<div style={{ padding: '2rem' }}>My Requests Page</div>} />
            <Route path="/orders" element={<div style={{ padding: '2rem' }}>My Orders Page</div>} />
            <Route path="/saved" element={<div style={{ padding: '2rem' }}>Saved Page</div>} />
            <Route path="/shop-dashboard" element={<ShopDashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<div style={{ padding: '2rem' }}>Help Page</div>} />
            <Route path="/about" element={<div style={{ padding: '2rem' }}>About Us Page</div>} />
            <Route path="/terms" element={<div style={{ padding: '2rem' }}>Terms of Service Page</div>} />
            <Route path="/privacy" element={<div style={{ padding: '2rem' }}>Privacy Policy Page</div>} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
  );
};