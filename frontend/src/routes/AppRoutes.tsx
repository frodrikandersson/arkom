import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StackHandler } from '@stackframe/react';
import { stackClientApp } from '../config/stack';
import { HomePage } from '../pages/HomePage';
import { ThemeSettingsPage } from '../pages/ThemeSettingsPage';

function HandlerRoutes() {
  const location = useLocation();
  return <StackHandler app={stackClientApp} location={location.pathname} fullPage />;
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/theme-settings" element={<ThemeSettingsPage />} />
      <Route path="/handler/*" element={<HandlerRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};