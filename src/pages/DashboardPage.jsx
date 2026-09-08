import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  Building, 
  CheckCircle2,
  Terminal,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import TransactionModal from '../components/TransactionModal';

export default function DashboardPage({ user, onOpenTelemetry }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(348250.75);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detectedAlert, setDetectedAlert] = useState('');

  const fetchTransactions = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?search=${encodeURIComponent(query)}&userId=1`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.balance) setBalance(data.balance);

        // Check if query was flagged as suspicious
        if (query.match(/'\s*OR\s*'?1'?\s*=\s*'?1/i) || query.includes('--') || query.includes('<script>')) {
          setDetectedAlert(`Security Telemetry Dispatched: Query '${query}' flagged as an anomalous pattern.`);
          setTimeout(() => setDetectedAlert(''), 5000);
        }
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(searchTerm);
  }, [searchTerm]);

  const handleTransactionComplete = (newBalance) => {
    setBalance(newBalance);
    fetchTransactions('');
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'INFLOW') return tx.type === 'credit';
    if (categoryFilter === 'OUTFLOW') return tx.type === 'debit';
    return true;
  });

  const totalInflows = transactions
    .filter((t) => t.type === 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOutflows = transactions
    .filter((t) => t.type === 'debit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080a0f]">
      {/* Top Banner & Company Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mb-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{user?.company || 'TechScale Global Inc.'}</span>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400">FedNow Node #098 Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
            Institutional Treasury Operating Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Disburse Wire Payout</span>
          </button>
          <button
            onClick={onOpenTelemetry}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>SecOps Console</span>
          </button>
        </div>
      </div>

      {/* Real-Time Detection Notification (Zero Emojis) */}
      {detectedAlert && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-mono">{detectedAlert}</span>
          </div>
          <button
            onClick={onOpenTelemetry}
            className="text-slate-300 hover:text-white font-medium ml-4 shrink-0 flex items-center gap-1 cursor-pointer font-mono"
          >
            <span>View Telemetry Console</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* LIQUIDITY CARDS (Solid Surfaces, Zero Gradients, Tabular Figures) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Available Liquidity */}
        <div className="bg-[#0c101a] p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-mono tracking-wider text-[10px]">Available Treasury Liquidity</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">
              USD Account
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] tracking-tight tabular-nums">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium font-mono flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" /> +8.4%
            </span>
            <span className="text-slate-500 font-mono text-[11px]">vs previous month</span>
          </div>
        </div>

        {/* Card 2: 30-Day Inflows */}
        <div className="bg-[#0c101a] p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-mono tracking-wider text-[10px]">30-Day Gross Inflows</span>
            <div className="w-5 h-5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-['Outfit'] tracking-tight tabular-nums">
            +${totalInflows.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500">
            Venture tranches, wire settlements & merchant revenue
          </div>
        </div>

        {/* Card 3: 30-Day Outflows */}
        <div className="bg-[#0c101a] p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-mono tracking-wider text-[10px]">30-Day Gross Disbursements</span>
            <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-200 font-['Outfit'] tracking-tight tabular-nums">
            -${totalOutflows.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500">
            Automated cloud clusters, engineering payroll & vendors
          </div>
        </div>
      </div>

      {/* TRANSACTION TABLE & CONTROLS */}
      <div className="bg-[#0c101a] rounded-xl border border-slate-800 p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white font-['Outfit']">Real-Time Treasury Transactions</h2>
            <p className="text-xs text-slate-400">Continuously monitored ledger records & automated settlements</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex bg-[#080b12] p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer font-mono text-[11px] ${
                  categoryFilter === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setCategoryFilter('INFLOW')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer font-mono text-[11px] ${
                  categoryFilter === 'INFLOW' ? 'bg-slate-800 text-emerald-400 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Inflows
              </button>
              <button
                onClick={() => setCategoryFilter('OUTFLOW')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer font-mono text-[11px] ${
                  categoryFilter === 'OUTFLOW' ? 'bg-slate-800 text-slate-200 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Outflows
              </button>
            </div>

            <button
              onClick={() => fetchTransactions(searchTerm)}
              className="p-1.5 rounded-lg bg-[#080b12] border border-slate-800 hover:text-white text-slate-400 transition-colors cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Query Simulation Chips */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by counterparty, vendor, invoice description, or category..."
              className="w-full bg-[#080b12] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-colors font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 text-xs text-slate-500 hover:text-white font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Demo Test Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-slate-500">
              <Terminal className="w-3 h-3 text-slate-400" />
              Test Queries:
            </span>
            <button
              onClick={() => setSearchTerm("' OR '1'='1' --")}
              className="px-2 py-0.5 rounded bg-[#080b12] hover:bg-rose-950/30 text-rose-300 border border-rose-900/60 transition-colors cursor-pointer"
              title="Simulates suspicious SQL pattern"
            >
              ' OR '1'='1' -- (Simulate Attack)
            </button>
            <button
              onClick={() => setSearchTerm('Amazon')}
              className="px-2 py-0.5 rounded bg-[#080b12] hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              Amazon
            </button>
            <button
              onClick={() => setSearchTerm('Payroll')}
              className="px-2 py-0.5 rounded bg-[#080b12] hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              Payroll
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-2.5 font-semibold">Counterparty / Merchant</th>
                <th className="pb-2.5 font-semibold">Category</th>
                <th className="pb-2.5 font-semibold">Description</th>
                <th className="pb-2.5 font-semibold">Execution Date</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-mono">
                    Loading ledger data...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-mono">
                    No transactions matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <tr key={tx.id} className="hover:bg-[#0f1422] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-200">{tx.counterparty}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 rounded bg-[#080b12] border border-slate-800 text-slate-400 font-mono text-[10px]">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 max-w-xs truncate font-mono text-[11px]">
                        {tx.description}
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-400 text-[11px]">
                        {tx.date}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-mono">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-mono font-semibold tabular-nums ${
                        isCredit ? 'text-emerald-400' : 'text-slate-200'
                      }`}>
                        {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Wire Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionComplete={handleTransactionComplete}
        currentBalance={balance}
      />
    </div>
  );
}
