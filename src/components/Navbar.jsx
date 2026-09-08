import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Activity, ArrowRight, ArrowLeft, LayoutDashboard, Lock, LogOut } from 'lucide-react';

export default function Navbar({ onOpenTelemetry, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/admin';

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto bg-[#0c101a] border border-slate-800 rounded-2xl shadow-xl px-4 sm:px-6 py-2.5 flex items-center justify-between w-full max-w-5xl h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white font-['Outfit']">
                  Apex<span className="text-slate-400">Pay</span>
                </span>
                <span className="text-[9px] tracking-widest uppercase text-slate-400 font-mono -mt-1">
                  Treasury Operating System
                </span>
              </div>
            </Link>

            {/* Security Audit Badge */}
            <button
              onClick={onOpenTelemetry}
              className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 transition-colors ml-4 cursor-pointer"
              title="Open Security Audit & Telemetry Console"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[11px] text-slate-300">SecOps Active</span>
              <Activity className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* Navigation Links */}
          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Platform</a>
              <a href="#treasury" className="hover:text-white transition-colors">Global Treasury</a>
              <a href="#security" className="hover:text-white transition-colors">Security & SOC</a>
              <Link to="/admin" className="text-slate-400 hover:text-white transition-colors text-xs font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Admin Ops
              </Link>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    location.pathname === '/dashboard'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    onLogout();
                    navigate('/login');
                  }}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : !isAuthPage ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs text-slate-300 hover:text-white font-medium px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <span>Open Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
            )}
          </div>
      </nav>
    </div>
  );
}
