import React from 'react';
import { ShieldCheck, Lock, Globe, Server } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#080a0f] text-slate-400 text-sm">
      {/* Security & Compliance Badges Strip */}
      <div className="border-b border-slate-800/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-slate-300">
            <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <Lock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <Server className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Continuous SIEM Ingestion</span>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <span>180+ Country Treasury Rails</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
              <span className="font-bold text-white font-['Outfit'] text-base tracking-tight">ApexPay</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Programmatic treasury orchestration, multi-currency virtual accounts, and automated disbursement infrastructure for institutional finance.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 font-mono">Treasury Products</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#treasury" className="hover:text-white transition-colors">Multi-Currency Virtual IBANs</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Instant Automated Payouts</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Corporate Spend Controls</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Liquidity Sweeps & Yield</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 font-mono">Security & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#security" className="hover:text-white transition-colors">SOC Threat Triage Pipeline</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Zero-Trust Authorization Rails</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Continuous Ledger Auditing</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">SIEM Telemetry Streaming</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 font-mono">Enterprise SecOps</h4>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              Continuous threat intelligence, real-time access telemetry, and automated incident triage.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              Instance: US-EAST-CLUSTER-04<br/>
              Security Rail: SIEM Stream Active
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>2026 ApexPay Technologies Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            Institutional Financial Systems & Telemetry Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
