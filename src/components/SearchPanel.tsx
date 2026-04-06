import { useState } from "react";
import { Search, Laptop, Network, Globe2, MapPin, Server, Clock, Building2, ShieldCheck, ShieldAlert, Shield, Activity, Workflow } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface GeoResult {
  status: string;
  ip: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as_name: string;
  risk_level: string;
  risk_reasons: string[];
  search_id?: number;
  protocol_details?: {
    version: string;
    ip_class: string;
    subnet_mask: string;
    host_range: string;
    binary: string;
    hex: string;
    rir: string;
    reverse_dns: string;
    is_mobile: boolean;
    is_proxy: boolean;
    is_hosting: boolean;
  };
}

interface SearchPanelProps {
  onResult: (data: GeoResult) => void;
  onError: (title: string, message: string) => void;
  onAskBot: (query: string) => void;
}

function getFlag(countryCode: string): string {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function RiskBadge({ level }: { level: string }) {
  const config = {
    low: { class: 'risk-low', icon: ShieldCheck, text: 'Low Risk' },
    medium: { class: 'risk-medium', icon: Shield, text: 'Medium Risk' },
    high: { class: 'risk-high', icon: ShieldAlert, text: 'High Risk' },
  }[level] || { class: 'risk-low', icon: ShieldCheck, text: 'Unknown' };

  return (
    <span className={`risk-badge ${config.class}`}>
      <config.icon size={12} />
      {config.text}
    </span>
  );
}

export default function SearchPanel({ onResult, onError, onAskBot }: SearchPanelProps) {
  const [ip, setIp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeoResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleTrack = async (targetIp?: string) => {
    const searchIp = targetIp || ip;
    if (!searchIp.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: searchIp.trim() }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setResult(data);
        onResult(data);
      } else {
        onError("Tracking Failed", data.message || "Invalid IP or data unavailable.");
      }
    } catch {
      onError("Connection Error", "Unable to connect to the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const detectMyIp = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setIp(data.ip);
      handleTrack(data.ip);
    } catch {
      onError("Detection Failed", "Could not detect your IP address.");
    }
  };

  const presets = ["8.8.8.8", "1.1.1.1", "208.67.222.222", "9.9.9.9"];

  const statCards = result ? [
    { label: "IP Address", value: result.ip, icon: Network, mono: true },
    { label: "Country", value: `${getFlag(result.country_code)} ${result.country}`, icon: Globe2 },
    { label: "City", value: result.city, icon: MapPin },
    { label: "Region", value: result.region, icon: MapPin },
    { label: "ISP", value: result.isp, icon: Server },
    { label: "Autonomous System", value: result.as_name, icon: Workflow },
    { label: "Organization", value: result.org, icon: Building2 },
    { label: "Coordinates", value: `${result.lat?.toFixed(4)}, ${result.lon?.toFixed(4)}`, icon: Activity, mono: true },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="glass-card-static p-6">
        <h2 className="text-xl font-bold mb-1 font-display">IP Address Lookup</h2>
        <p className="text-sm text-slate-500 mb-5">Enter an IP address to retrieve geolocation intelligence</p>

        <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="ip-search-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Enter IP address (e.g. 8.8.8.8)"
              className="w-full h-12 bg-white/[0.03] border border-brand-border rounded-xl pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono text-sm"
            />
          </div>
          <button
            id="track-button"
            type="submit"
            disabled={isLoading || !ip.trim()}
            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search size={16} />
                <span className="hidden sm:inline">Track</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            id="detect-my-ip"
            type="button"
            onClick={detectMyIp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold transition-colors border border-indigo-500/15"
          >
            <Laptop size={13} /> My IP
          </button>
          <span className="text-slate-600 text-xs">|</span>
          <span className="text-slate-600 text-xs">Quick:</span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => { setIp(preset); handleTrack(preset); }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-indigo-500/10 hover:text-indigo-400 text-slate-500 text-xs font-mono transition-colors border border-brand-border/50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-mono font-bold text-white tracking-tight">{result.ip}</h3>
                {result.protocol_details && (
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 uppercase">
                    {result.protocol_details.version}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-600 font-mono">ID: #{result.search_id}</span>
            </div>
            <div className="glass-card-static p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <RiskBadge level={result.risk_level} />
                <span className="text-sm text-slate-400">
                  {result.risk_reasons?.join(' • ') || 'No risk indicators'}
                </span>
                <button 
                  onClick={() => onAskBot("Tell me about the risk assessment for this IP")}
                  className="p-1.5 rounded-full hover:bg-white/5 text-slate-500 hover:text-indigo-400 transition-all ml-1"
                >
                  <Activity size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                   onClick={() => setShowAnalysis(!showAnalysis)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showAnalysis ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}
                >
                  <Network size={14} /> Protocol Analysis
                </button>
                <span className="text-xs text-slate-600 font-mono">ID: #{result.search_id}</span>
              </div>
            </div>

            {showAnalysis && result.protocol_details && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-card-static p-6 border-indigo-500/20 bg-indigo-500/[0.02] overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                      <Network size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-white">Network Layer (Layer 3) Analysis</h3>
                  </div>
                  <button 
                    onClick={() => onAskBot("Explain these protocol details for me")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Activity size={13} /> Ask Tutor
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Binary Representation</p>
                      <p className="font-mono text-xs text-indigo-400 break-all leading-relaxed">
                        {result.protocol_details.binary}
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Hexadecimal Format</p>
                      <p className="font-mono text-sm text-indigo-400">
                        {result.protocol_details.hex}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: "Version", v: result.protocol_details.version, q: "IPv4 vs IPv6" },
                      { l: "Class", v: result.protocol_details.ip_class, q: "IP Address Classes" },
                      { l: "Subnet Mask", v: result.protocol_details.subnet_mask, q: "Subnet Masks" },
                      { l: "Usable Hosts", v: result.protocol_details.host_range, q: "Host Range" },
                      { l: "Registry", v: result.protocol_details.rir, q: "Regional Registries" },
                      { l: "Hostname", v: result.protocol_details.reverse_dns, q: "Reverse DNS" },
                    ].map((item) => (
                      <div key={item.l} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 relative group">
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">{item.l}</p>
                        <p className="text-xs text-slate-200 font-medium truncate">{item.v}</p>
                        <button 
                          onClick={() => onAskBot(item.q)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-indigo-500"
                        >
                          <Activity size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="stat-card"
                >
                  <card.icon size={18} className="text-indigo-400 mb-2.5" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.12em] font-semibold mb-1">{card.label}</p>
                  <p className={`text-sm font-bold text-white break-all ${card.mono ? 'font-mono' : ''}`}>
                    {card.value || '—'}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
