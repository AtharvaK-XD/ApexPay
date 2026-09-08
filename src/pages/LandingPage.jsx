import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Globe2, 
  CreditCard, 
  Activity, 
  ChevronRight,
  Server,
  Lock,
  Layers
} from 'lucide-react';

export default function LandingPage({ onOpenTelemetry }) {
  return (
    <div className="relative overflow-hidden bg-[#080a0f]">
      {/* Structural Subtle Grid Pattern (Zero Glows, Zero Gradients) */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23334155' stroke-width='1' stroke-opacity='0.25'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-mono text-slate-300">ApexPay Architecture v2.4</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">Institutional Treasury & SOC Telemetry</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-['Outfit'] max-w-4xl mx-auto leading-[1.15]">
          Institutional Treasury Operations for Enterprise Scale
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Manage multi-currency liquidity, automate high-volume vendor disbursements, and protect treasury reserves with continuous SOC telemetry streaming.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs"
          >
            <span>Open Operating Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onOpenTelemetry}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-medium transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Open SecOps Diagnostics</span>
          </button>
        </div>

        {/* Structured Fintech Terminal Preview */}
        <div className="mt-14 max-w-4xl mx-auto text-left">
          <div className="bg-[#0c101a] rounded-xl border border-slate-800 shadow-2xl p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Master Treasury Ledger</span>
                <div className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] mt-1 tabular-nums">
                  $5,626,761.25
                  <span className="text-xs font-normal text-emerald-400 ml-2.5 font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60">
                    +14.2% MoM
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono">
                  FedNow Direct Rail
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono">
                  USD / EUR / GBP / JPY
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
              <div className="p-3.5 rounded-lg bg-[#080b12] border border-slate-800/80">
                <span className="text-[11px] font-mono uppercase text-slate-500">Liquid Reserve</span>
                <p className="text-lg font-bold text-white font-['Outfit'] mt-1 tabular-nums">$3,482,500.00</p>
                <span className="text-[10px] text-slate-500 font-mono">Tier 1 institutional custody</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#080b12] border border-slate-800/80">
                <span className="text-[11px] font-mono uppercase text-slate-500">30-Day Disbursements</span>
                <p className="text-lg font-bold text-white font-['Outfit'] mt-1 tabular-nums">$1,842,910.40</p>
                <span className="text-[10px] text-emerald-400 font-mono">99.99% settlement SLA</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#080b12] border border-slate-800/80">
                <span className="text-[11px] font-mono uppercase text-slate-500">Threat Index</span>
                <p className="text-lg font-bold text-slate-200 font-['Outfit'] mt-1 tabular-nums">0.02 (Nominal)</p>
                <span className="text-[10px] text-slate-500 font-mono">Zero anomalous spikes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENCHMARKS STRIP */}
      <section className="border-y border-slate-800/80 bg-[#07090e] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] tabular-nums">$1.4B+</div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mt-1">Clearing Volume</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] tabular-nums">180ms</div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mt-1">Settlement Latency</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] tabular-nums">15,000+</div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mt-1">Enterprise Accounts</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-['Outfit'] tabular-nums">99.999%</div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mt-1">Rail Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-2">
            Institutional Architecture
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Engineered for high throughput, strict isolation, and audit readiness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-[#0c101a] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 mb-5">
                <Globe2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit'] mb-2">Multi-Currency Rails</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hold, convert, and disburse 35+ local currencies with virtual IBANs in the US, EU, UK, and APAC without intermediary friction.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span>Instant SEPA & FedNow</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0c101a] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 mb-5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit'] mb-2">Continuous SOC Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authentication events, ledger queries, and administrative actions stream directly to institutional SIEM pipelines for continuous auditability.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span>Automated Audit Ledger</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0c101a] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 mb-5">
                <CreditCard className="w-4 h-4 text-slate-200" />
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit'] mb-2">Automated Disbursements</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Execute batch vendor payouts, payroll schedules, and programmatic card controls via secure REST endpoints and webhook triggers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span>Programmatic Webhook APIs</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ACTION BANNER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#0c101a] p-8 sm:p-10 rounded-xl border border-slate-800 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] mb-3">
            Inspect the Live Treasury Dashboard
          </h2>
          <p className="text-slate-400 text-xs max-w-lg mx-auto mb-6 leading-relaxed">
            Test real transactions, query filtering, and real-time SIEM telemetry emissions in an active environment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-lg text-xs transition-colors"
            >
              Open Live Dashboard
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium hover:text-white hover:border-slate-600 transition-colors"
            >
              Sign In with Corporate Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
