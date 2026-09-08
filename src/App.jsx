import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TelemetryDrawer from './components/TelemetryDrawer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  useEffect(() => {
    // Check localStorage for saved session
    const saved = localStorage.getItem('apex_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('apex_user');
      }
    } else {
      // Default to Sarah Chen for quick instant testing
      const defaultUser = {
        id: 1,
        name: 'Sarah Chen',
        email: 'sarah.chen@techscale.io',
        role: 'admin',
        company: 'TechScale Global Inc.',
        balance: 348250.75
      };
      setUser(defaultUser);
      localStorage.setItem('apex_user', JSON.stringify(defaultUser));
    }
  }, []);

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem('apex_user', JSON.stringify(userData));
    localStorage.setItem('apex_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('apex_user');
    localStorage.removeItem('apex_token');
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onOpenTelemetry={() => setIsTelemetryOpen(true)}
        />

        <main className="flex-1 pt-28">
          <Routes>
            <Route path="/" element={<LandingPage onOpenTelemetry={() => setIsTelemetryOpen(true)} />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/signup" element={<SignupPage onLoginSuccess={handleLoginSuccess} />} />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  user={user}
                  onOpenTelemetry={() => setIsTelemetryOpen(true)}
                />
              }
            />
            <Route path="/admin" element={<AdminPage onOpenTelemetry={() => setIsTelemetryOpen(true)} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Security & Audit Telemetry Drawer */}
        <TelemetryDrawer
          isOpen={isTelemetryOpen}
          onClose={() => setIsTelemetryOpen(!isTelemetryOpen)}
        />
      </div>
    </Router>
  );
}
