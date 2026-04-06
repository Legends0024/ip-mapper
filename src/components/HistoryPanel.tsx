import { useState, useEffect, useCallback } from "react";
import { History, Trash2, ExternalLink, Clock, MapPin, ShieldCheck, Shield, ShieldAlert, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GeoResult } from "./SearchPanel";
import LoadingSkeleton from "./LoadingSkeleton";

function getFlag(cc: string): string {
  if (!cc) return '🌍';
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
}

function RiskDot({ level }: { level: string }) {
  const color = { low: 'bg-emerald-400', medium: 'bg-amber-400', high: 'bg-red-400' }[level] || 'bg-slate-400';
  return <div className={`w-2 h-2 rounded-full ${color}`} title={`${level} risk`} />;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface HistoryEntry {
  id: number;
  ip: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  isp: string;
  lat: number;
  lon: number;
  timezone: string;
  risk_level: string;
  risk_reasons: string[];
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
  timestamp: string;
}

interface HistoryPanelProps {
  onSelect: (entry: HistoryEntry) => void;
  refreshTrigger?: number;
}

export default function HistoryPanel({ onSelect, refreshTrigger }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history?limit=50");
      const data = await res.json();
      if (data.status === "success") {
        setHistory(data.searches || []);
        setTotal(data.total || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory, refreshTrigger]);

  const deleteEntry = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h.id !== id));
      setTotal(prev => prev - 1);
    } catch {}
  };

  const clearAll = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
      setTotal(0);
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card-static p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <History size={20} className="text-indigo-400" />
            <h2 className="text-lg font-bold font-display">Search History</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchHistory} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors" title="Refresh">
              <RefreshCw size={15} />
            </button>
            {history.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-400/70 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                Clear All
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500">{total} total searches recorded</p>
      </div>

      {/* List */}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : history.length === 0 ? (
        <div className="glass-card-static p-8 text-center">
          <Clock size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No search history yet</p>
          <p className="text-slate-600 text-xs mt-1">Track an IP to see it here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          <AnimatePresence>
            {history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onSelect(entry)}
                className="glass-card p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <RiskDot level={entry.risk_level} />
                      <span className="font-mono text-sm font-semibold text-white truncate">{entry.ip}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>{getFlag(entry.country_code)}</span>
                      <span className="truncate">{entry.city}{entry.country ? `, ${entry.country}` : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-600">{timeAgo(entry.timestamp)}</span>
                    <button
                      onClick={(e) => deleteEntry(entry.id, e)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export type { HistoryEntry };
