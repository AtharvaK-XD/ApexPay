import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, Radio, Send, CheckCircle2, AlertTriangle, RefreshCw, Zap, Terminal, AlertCircle, Key } from 'lucide-react';

export default function TelemetryDrawer({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [flareUrl, setFlareUrl] = useState(() => localStorage.getItem('apex_flare_url') || 'http://127.0.0.1:8000/api/v1/ingest/eve');
  const [flareToken, setFlareToken] = useState(() => localStorage.getItem('apex_flare_token') || '96X5rC0B7QxJzJD_E1qZETJJjdGGjGyGfAG9YIG284Nh5T5PHUm3Uz742dY2T4Vq');
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState('');

  // Fetch telemetry logs and config
  const fetchTelemetry = async () => {
    try {
      const [logsRes, configRes] = await Promise.all([
        fetch('/api/telemetry/events'),
        fetch('/api/telemetry/config')
      ]);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.flare_webhook_url) {
          setFlareUrl(configData.flare_webhook_url);
          localStorage.setItem('apex_flare_url', configData.flare_webhook_url);
        }
        if (configData.flare_service_token) {
          setFlareToken(configData.flare_service_token);
          localStorage.setItem('apex_flare_token', configData.flare_service_token);
        }
      }
    } catch (err) {
      console.error('Failed to fetch telemetry data:', err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSavingUrl(true);
    setSaveMessage('');
    localStorage.setItem('apex_flare_url', flareUrl);
    localStorage.setItem('apex_flare_token', flareToken);
    try {
      const res = await fetch('/api/telemetry/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flare_webhook_url: flareUrl,
          flare_service_token: flareToken
        })
      });
      if (res.ok) {
        setSaveError(false);
        setSaveMessage('Flare Config Saved');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveError(true);
        setSaveMessage('Failed to save config');
      }
    } catch (err) {
      setSaveError(false);
      setSaveMessage('Saved locally in browser');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleTriggerScenario = async (scenario, label) => {
    setTriggerStatus(`Emitting ${label}...`);
    try {
      const res = await fetch('/api/telemetry/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      if (res.ok) {
        setTriggerStatus(`[DISPATCHED] ${label}`);
        fetchTelemetry();
      } else {
        setTriggerStatus('[FAILED] Could not dispatch event');
      }
    } catch (err) {
      setTriggerStatus('[ERROR] Network error');
    } finally {
      setTimeout(() => setTriggerStatus(''), 3500);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onClose}
        className="fixed bottom-4 right-4 z-50 flex items-center space-x-2.5 bg-[#0d111a] hover:bg-[#131926] text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg shadow-xl cursor-pointer transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-xs font-mono font-medium tracking-wide">
          Flare SOC Stream
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
          {logs.length}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end p-4 sm:p-6 transition-all">
      <div className="w-full max-w-xl bg-[#0c101a]/95 backdrop-blur-3xl border border-slate-700/50 rounded-3xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                Flare SOC Sensor & Telemetry Stream
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                  Suricata EVE v1
                </span>
              </h2>
              <p className="text-xs text-slate-400">Live security event ingestion for Flare AI SOC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Flare ngrok Endpoint Configuration */}
        <div className="p-4 border-b border-slate-700/50 bg-black/20">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              Flare Ingest Endpoint (ngrok or direct):
            </label>
            {saveMessage && (
              <span className={`text-xs font-mono flex items-center gap-1 ${saveError ? 'text-rose-400' : 'text-emerald-400'}`}>
                {saveError ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {saveMessage}
              </span>
            )}
          </div>
          <form onSubmit={handleSaveConfig} className="space-y-2">
            <input
              type="text"
              value={flareUrl}
              onChange={(e) => setFlareUrl(e.target.value)}
              placeholder="e.g. https://abc-123.ngrok-free.app/api/v1/ingest/eve"
              className="w-full text-xs font-mono bg-[#080b12] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={flareToken}
                  onChange={(e) => setFlareToken(e.target.value)}
                  placeholder="INGEST_SERVICE_TOKEN (from Flare .env)"
                  className="w-full text-xs font-mono bg-[#080b12] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingUrl}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer font-mono"
              >
                Save Config
              </button>
            </div>
          </form>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Attacks against this website will immediately forward Suricata EVE alerts to Flare.
          </p>
        </div>

        {/* Live Attack Scenarios Buttons */}
        <div className="p-4 border-b border-slate-700/50 bg-black/30">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              One-Click Attack Emulation
            </h3>
            {triggerStatus && (
              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {triggerStatus}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleTriggerScenario('sql_probe', 'SQL Injection')}
              className="p-2.5 rounded-lg bg-[#0c101a] border border-slate-800 hover:border-rose-500/60 text-left transition-colors cursor-pointer"
            >
              <div className="text-[10px] font-mono text-rose-400 font-bold mb-0.5">SCENARIO 1</div>
              <div className="text-xs font-semibold text-slate-200">SQL Injection</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">UNION SELECT & ' OR '1'='1'</div>
            </button>

            <button
              onClick={() => handleTriggerScenario('xss_probe', 'XSS Reflection')}
              className="p-2.5 rounded-lg bg-[#0c101a] border border-slate-800 hover:border-amber-500/60 text-left transition-colors cursor-pointer"
            >
              <div className="text-[10px] font-mono text-amber-400 font-bold mb-0.5">SCENARIO 2</div>
              <div className="text-xs font-semibold text-slate-200">Cross-Site Scripting</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">&lt;script&gt;alert('XSS')</div>
            </button>

            <button
              onClick={() => handleTriggerScenario('admin_probe', 'Directory Traversal')}
              className="p-2.5 rounded-lg bg-[#0c101a] border border-slate-800 hover:border-blue-500/60 text-left transition-colors cursor-pointer"
            >
              <div className="text-[10px] font-mono text-blue-400 font-bold mb-0.5">SCENARIO 3</div>
              <div className="text-xs font-semibold text-slate-200">Path Traversal</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">../../etc/passwd probe</div>
            </button>
          </div>
        </div>

        {/* Live Telemetry Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              Event Stream ({logs.length} logged)
            </h3>
            <button
              onClick={fetchTelemetry}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-xs font-mono">
              Waiting for incoming requests or security events...
            </div>
          ) : (
            logs.map((log) => {
              const isCrit = log.severity === 'CRITICAL';
              const isHigh = log.severity === 'HIGH';
              const isMed = log.severity === 'MEDIUM';

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    isCrit
                      ? 'bg-rose-950/20 border-rose-900/50'
                      : isHigh
                        ? 'bg-amber-950/20 border-amber-900/50'
                        : isMed
                          ? 'bg-yellow-950/20 border-yellow-900/50'
                          : 'bg-white/5 border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                        isCrit
                          ? 'bg-rose-900/40 text-rose-300 border border-rose-700/50'
                          : isHigh
                            ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                            : isMed
                              ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {log.severity} • {log.event_type}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>

                  <p className="text-slate-200 leading-relaxed mb-2 font-mono text-[11px]">
                    {log.summary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/60">
                    <span>
                      {log.method} {log.endpoint}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      {log.dispatched_to_flare ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Dispatched to Flare
                        </span>
                      ) : (
                        <span className="text-slate-500">Local Only</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
