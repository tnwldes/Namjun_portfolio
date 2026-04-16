/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { usePortfolioStore } from './store';

export default function App() {
  const isAuthenticated = usePortfolioStore((state) => state.isAuthenticated);
  const initAuth = usePortfolioStore((state) => state.initAuth);

  React.useEffect(() => {
    console.log('App initialized, calling initAuth');
    initAuth();
  }, [initAuth]);

  React.useEffect(() => {
    console.log('Auth state in App.tsx:', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route 
          path="/admin" 
          element={isAuthenticated ? <AdminPanel /> : <Login />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

