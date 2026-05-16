import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainApp from './pages/MainApp.jsx';
import Onboarding from './pages/Onboarding.jsx';

export default function App() {
  const [userContext, setUserContext] = useState(() => {
    const saved = localStorage.getItem('mdga_user_context');
    return saved ? JSON.parse(saved) : null;
  });

  const handleOnboardComplete = (context) => {
    localStorage.setItem('mdga_user_context', JSON.stringify(context));
    setUserContext(context);
  };

  const handleLogout = () => {
    localStorage.removeItem('mdga_user_context');
    setUserContext(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          userContext ? (
            <MainApp userContext={userContext} onLogout={handleLogout} />
          ) : (
            <Onboarding onComplete={handleOnboardComplete} />
          )
        } />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
