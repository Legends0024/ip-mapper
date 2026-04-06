import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map as MapIcon, Search, Globe2, Activity, TrendingUp, Zap, Server, Network } from "lucide-react";
import Sidebar from "./components/Sidebar";
import type { View } from "./components/Sidebar";
import SearchPanel from "./components/SearchPanel";
import MapView from "./components/MapView";
import type { MapMarker } from "./components/MapView";
import HistoryPanel from "./components/HistoryPanel";
import type { HistoryEntry } from "./components/HistoryPanel";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import IPCompare from "./components/IPCompare";
import NetworkBot from "./components/NetworkBot";

interface GeoResult {
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

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [latestResult, setLatestResult] = useState<GeoResult | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [botQuery, setBotQuery] = useState<string | null>(null);

  const handleResult = useCallback((data: GeoResult) => {
    setLatestResult(data);
    setError(null);
    if (data.lat && data.lon) {
      setMarkers((prev) => {
        const exists = prev.some((m) => m.lat === data.lat && m.lon === data.lon);
        if (exists) return prev;
        return [
          { lat: data.lat, lon: data.lon, label: data.city || data.ip, sublabel: data.ip },
          ...prev,
        ].slice(0, 20);
      });
    }
    setRefreshTrigger((p) => p + 1);
  }, []);

  const handleError = useCallback((title: string, message: string) => {
    setError({ title, message });
    setLatestResult(null);
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setLatestResult({
      status: "success",
      ip: entry.ip,
      country: entry.country,
      country_code: entry.country_code,
      city: entry.city,
      region: entry.region,
      isp: entry.isp,
      org: "",
      as_name: "",
      lat: entry.lat,
      lon: entry.lon,
      timezone: entry.timezone,
      risk_level: entry.risk_level,
      risk_reasons: entry.risk_reasons,
      protocol_details: entry.protocol_details,
    });
    if (entry.lat && entry.lon) {
      setMarkers((prev) => {
        const exists = prev.some((m) => m.lat === entry.lat && m.lon === entry.lon);
        if (exists) return prev;
        return [
          { lat: entry.lat, lon: entry.lon, label: entry.city || entry.ip, sublabel: entry.ip },
          ...prev,
        ].slice(0, 20);
      });
    }
    setCurrentView("search");
  }, []);

  function getFlag(cc: string): string {
    if (!cc) return "🌍";
    const cp = cc.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...cp);
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold font-display tracking-tight"
          >
            Welcome to <span className="text-gradient">GeoTrack</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 mt-1 text-sm"
          >
            IP Geolocation Intelligence Dashboard — Prototype v2.1
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/15">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            System Online
          </span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Search, title: "IP Lookup", desc: "Search any IP address", color: "from-blue-500 to-indigo-500", view: "search" as View },
          { icon: MapIcon, title: "Live Map", desc: `${markers.length} pins active`, color: "from-indigo-500 to-purple-500", view: "search" as View },
          { icon: TrendingUp, title: "Analytics", desc: "View tracking insights", color: "from-cyan-500 to-blue-500", view: "analytics" as View },
          { icon: Zap, title: "Compare IPs", desc: "Side-by-side analysis", color: "from-amber-500 to-orange-500", view: "compare" as View },
        ].map((card, i) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            onClick={() => setCurrentView(card.view)}
            className="glass-card p-5 text-left group"
          >
            <div className={`w-10 h-10 bg-gradient-to-tr ${card.color} rounded-xl flex items-center justify-center mb-3 group-hover:shadow-lg transition-all`}>
              <card.icon size={20} className="text-white" />
            </div>
            <h3 className="font-bold text-white text-sm mb-0.5 font-display">{card.title}</h3>
            <p className="text-xs text-slate-500">{card.desc}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card-static p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-indigo-400" />
              <h3 className="font-bold text-sm">Latest Lookup</h3>
            </div>
            {latestResult && (
               <button 
                onClick={() => setBotQuery(`Explain the network details of ${latestResult.ip}`)}
                className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider hover:text-indigo-300"
               >
                 Ask Tutor
               </button>
            )}
          </div>

          {latestResult ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFlag(latestResult.country_code)}</span>
                <div>
                  <p className="font-mono text-sm font-bold text-white leading-none mb-1">{latestResult.ip}</p>
                  <p className="text-xs text-slate-500">
                    {latestResult.city}, {latestResult.country}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  { l: "ISP", v: latestResult.isp },
                  { l: "IP Version", v: latestResult.protocol_details?.version || "IPv4" },
                  { l: "IP Class", v: latestResult.protocol_details?.ip_class || "Class A" },
                  { l: "Risk", v: latestResult.risk_level?.toUpperCase() },
                ].map((item) => (
                  <div key={item.l} className="bg-white/[0.02] rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">{item.l}</p>
                    <p className="text-xs text-slate-300 font-medium truncate">{item.v || "—"}</p>
                  </div>
                ))}
              </div>
              {latestResult.protocol_details && (
                <div className="mt-4 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                   <p className="text-[9px] text-indigo-400/60 uppercase font-bold mb-1">Binary Stream (L3)</p>
                   <p className="font-mono text-[10px] text-indigo-400/80 break-all leading-tight">
                     {latestResult.protocol_details.binary}
                   </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe2 size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-600">No recent activity</p>
              <button
                onClick={() => setCurrentView("search")}
                className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
              >
                Scan IP address →
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3 glass-card-static overflow-hidden h-[400px] lg:h-auto min-h-[400px] border-indigo-500/10"
        >
          <MapView markers={markers} zoom={3} height="100%" />
        </motion.div>
      </div>
    </div>
  );

  const renderSearchView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SearchPanel 
          onResult={handleResult} 
          onError={handleError} 
          onAskBot={(q) => { setBotQuery(q); }}
        />
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card-static p-5 border-red-500/20 text-center"
          >
            <p className="text-red-400 font-semibold text-sm mb-1">{error.title}</p>
            <p className="text-slate-400 text-xs">{error.message}</p>
          </motion.div>
        )}
        <div className="glass-card-static overflow-hidden h-[450px] relative border-indigo-500/10 shadow-xl">
          <div className="absolute top-0 left-0 right-0 p-3 bg-brand-darker/90 backdrop-blur-xl z-[400] flex items-center gap-2 border-b border-brand-border/50">
            <div className="flex items-center gap-2 text-indigo-400">
               <Network size={16} />
               <span className="font-bold text-xs tracking-widest uppercase">Global Network Topology</span>
            </div>
            <span className="ml-auto text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
              {markers.length} NODES
            </span>
          </div>
          <MapView markers={markers} height="100%" />
        </div>
      </div>
      <div className="lg:col-span-1">
        <HistoryPanel onSelect={handleHistorySelect} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return renderDashboard();
      case "search": return renderSearchView();
      case "analytics": return <AnalyticsDashboard refreshTrigger={refreshTrigger} />;
      case "history": return <HistoryPanel onSelect={handleHistorySelect} refreshTrigger={refreshTrigger} />;
      case "compare": return <IPCompare />;
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-dark selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[120px]" />
      </div>

      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1 md:ml-[260px] min-h-screen relative z-10">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 pt-20 md:pt-8 mb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <NetworkBot initialQuery={botQuery} onCloseQuery={() => setBotQuery(null)} />
    </div>
  );
}
