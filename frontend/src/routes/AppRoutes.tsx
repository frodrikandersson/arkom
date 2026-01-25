import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { MaintenanceGuard } from '../components/guards/MaintenanceGuard';

// Eager load only critical auth pages for fast initial render
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

// Lazy load all other pages to reduce initial bundle size
const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const CommissionsPage = lazy(() => import('../pages/CommissionsPage').then(m => ({ default: m.CommissionsPage })));
const StorePage = lazy(() => import('../pages/StorePage').then(m => ({ default: m.StorePage })));
const ServicePage = lazy(() => import('../pages/ServicePage').then(m => ({ default: m.ServicePage })));
const ShopDashboard = lazy(() => import('../pages/ShopDashboard').then(m => ({ default: m.ShopDashboard })));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const UserProfilePage = lazy(() => import('../pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

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
    <MaintenanceGuard>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </MaintenanceGuard>
  );
};