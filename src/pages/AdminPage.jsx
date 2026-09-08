import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Server, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';

export default function AdminPage({ onOpenTelemetry }) {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, metricsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/metrics')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080a0f]">
      {/* Admin Notice */}
      <div className="p-4 rounded-xl bg-[#0c101a] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="font-bold text-white uppercase font-mono tracking-wider">Internal Administrative Control Node</span>
            <p className="text-slate-400 mt-0.5">
              Access to this route is restricted and monitored under continuous SIEM telemetry.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenTelemetry}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer font-mono text-xs"
        >
          Security Console
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c101a] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono text-[11px] uppercase text-slate-500">Corporate Tenants</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-['Outfit'] tabular-nums">
            {metrics?.active_enterprises || users.length}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">100% KYC Verified</span>
        </div>

        <div className="bg-[#0c101a] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono text-[11px] uppercase text-slate-500">Settled Transactions</span>
            <Server className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-['Outfit'] tabular-nums">
            {metrics?.total_transactions || 12}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">SQLite Ledger</span>
        </div>

        <div className="bg-[#0c101a] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono text-[11px] uppercase text-slate-500">Core Availability</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-['Outfit'] tabular-nums">
            {metrics?.uptime || '99.99%'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Latency: 180ms</span>
        </div>

        <div className="bg-[#0c101a] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono text-[11px] uppercase text-slate-500">SIEM Pipeline</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-200 font-['Outfit']">
            Active
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Streaming Live</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0c101a] rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-['Outfit']">Registered Institutional Accounts</h2>
            <p className="text-xs text-slate-400">Database user records and role allocations</p>
          </div>
          <button
            onClick={fetchAdminData}
            className="p-1.5 rounded-lg bg-[#080b12] border border-slate-800 hover:text-white text-slate-400 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-2.5 font-semibold">User ID</th>
                <th className="pb-2.5 font-semibold">Name</th>
                <th className="pb-2.5 font-semibold">Corporate Email</th>
                <th className="pb-2.5 font-semibold">Role</th>
                <th className="pb-2.5 font-semibold">Company Entity</th>
                <th className="pb-2.5 font-semibold text-right">Treasury Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-mono">
                    Loading admin records...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#0f1422] transition-colors">
                    <td className="py-3 pr-4 font-mono text-slate-500">#{u.id}</td>
                    <td className="py-3 pr-4 font-medium text-slate-200">{u.name}</td>
                    <td className="py-3 pr-4 font-mono text-slate-400 text-[11px]">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                          : 'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{u.company}</td>
                    <td className="py-3 text-right font-mono font-medium text-slate-200 tabular-nums">
                      ${u.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
