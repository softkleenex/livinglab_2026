import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FarmerChat from './pages/FarmerChat.jsx';
import B2BConsole from './pages/B2BConsole.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/farmer" replace />} />
        <Route path="/farmer" element={<FarmerChat />} />
        <Route path="/console" element={<B2BConsole />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/farmer" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
