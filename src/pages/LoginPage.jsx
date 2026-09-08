import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative bg-[#080a0f]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-['Outfit']">
              Apex<span className="text-slate-400">Pay</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white font-['Outfit']">Sign In to Treasury Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise SSO & Institutional Account Access</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0c101a] p-6 sm:p-7 rounded-xl border border-slate-800 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#080b12] border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">Password</label>
                <span className="text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer">Forgot?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#080b12] border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Treasury'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-slate-400" />
              Demo Quick-Fill Credentials:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill('sarah.chen@techscale.io', 'password123')}
                className="p-2 rounded-lg bg-[#080b12] border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-medium text-slate-200">Sarah Chen</div>
                <div className="text-[10px] font-mono text-slate-500">Executive Admin</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('marcus.vance@vanguard.co', 'vance2026')}
                className="p-2 rounded-lg bg-[#080b12] border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-medium text-slate-200">Marcus Vance</div>
                <div className="text-[10px] font-mono text-slate-500">Finance Manager</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-5 font-mono">
          Don't have an enterprise account?{' '}
          <Link to="/signup" className="text-slate-300 hover:text-white font-medium underline">
            Open Corporate Account
          </Link>
        </p>
      </div>
    </div>
  );
}
