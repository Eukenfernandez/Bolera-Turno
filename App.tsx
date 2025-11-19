import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TurnManagement from './pages/TurnManagement';
import AdminManagement from './pages/AdminManagement';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/turn-management" element={<TurnManagement />} />
        <Route path="/admin-management" element={<AdminManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}