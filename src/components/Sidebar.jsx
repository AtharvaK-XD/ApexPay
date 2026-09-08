import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Radio, 
  Activity, 
  Zap, 
  FileText, 
  Network, 
  Gauge, 
  ListChecks, 
  BookOpen, 
  Bell, 
  Download, 
  Settings 
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', icon: LayoutGrid, path: '/dashboard' },
    { name: 'Live Feed', icon: Radio, path: '/live' },
    { name: 'Health Metrics', icon: Activity, path: '/health' },
    { name: 'Event Velocity', icon: Zap, path: '/velocity' },
    { name: 'Audit Logs', icon: FileText, path: '/audit' },
    { name: 'Threat Clusters', icon: Network, path: '/threats' },
    { name: 'Evaluation', icon: Gauge, path: '/evaluation' },
    { name: 'Rules', icon: ListChecks, path: '/rules' },
    { name: 'Playbooks', icon: BookOpen, path: '/playbooks' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Export', icon: Download, path: '/export' },
    { name: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <aside className="fixed top-6 bottom-6 left-6 w-64 z-40 flex flex-col pointer-events-none">
      <div className="flex-1 pointer-events-auto bg-[#0c101a]/40 backdrop-blur-3xl rounded-3xl p-4 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Brand */}
        <div className="flex items-center space-x-3 mb-8 px-2 mt-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wider">
              FLARE <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded ml-1">OPS</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">incident command</p>
          </div>
        </div>

        {/* Workspace Info */}
        <div className="bg-white/5 rounded-2xl p-3.5 mb-6 border border-white/5">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-mono mb-1">Workspace</div>
          <div className="text-xs font-bold text-white font-['Outfit'] tracking-wide">THREAT OPERATIONS</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-mono text-emerald-400">system nominal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.name === 'Live Feed' && location.pathname === '/');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="text-sm font-medium font-['Outfit']">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Metrics */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Queue</div>
              <div className="text-xs font-mono font-bold text-white mt-0.5">010 / 200</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Uptime</div>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">99.98%</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl px-3 py-2 border border-white/5 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Build</span>
            <span className="text-[10px] font-mono text-slate-400">v2.4.0-stable</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
