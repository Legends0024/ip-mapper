import { useState } from "react";
import { GitCompare, Search, ArrowRight, MapPin, Network, Globe2, Server, ShieldCheck, Shield, ShieldAlert, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MapView from "./MapView";
import type { MapMarker } from "./MapView";

interface CompareResult {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  isp: string;
  org: string;
  lat: number;
  lon: number;
  timezone: string;
  risk_level: string;
  risk_reasons: string[];
}

function getFlag(cc: string): string {
  if (!cc) return '🌍';
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
}

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { cls: string; icon: any; text: string }> = {
    low: { cls: 'risk-low', icon: ShieldCheck, text: 'Low' },
    medium: { cls: 'risk-medium', icon: Shield, text: 'Medium' },
    high: { cls: 'risk-high', icon: ShieldAlert, text: 'High' },
  };
  const c = config[level] || config.low;
  return (
    <span className={`risk-badge ${c.cls}`}>
      <c.icon size={12} />
      {c.text}
    </span>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function IPCompare() {
  const [ip1, setIp1] = useState("");
  const [ip2, setIp2] = useState("");
  const [result1, setResult1] = useState<CompareResult | null>(null);
  const [result2, setResult2] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!ip1.trim() || !ip2.trim()) {
      setError("Please enter both IP addresses");
      return;
    }
    setLoading(true);
    setError("");
    setResult1(null);
    setResult2(null);

    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ip: ip1.trim() }) }),
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ip: ip2.trim() }) }),
      ]);
      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

      if (data1.status !== "success") {
        setError(`IP 1 (${ip1}): ${data1.message || 'Failed'}`);
        return;
      }
      if (data2.status !== "success") {
        setError(`IP 2 (${ip2}): ${data2.message || 'Failed'}`);
        return;
      }

      setResult1(data1);
      setResult2(data2);
    } catch {
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const markers: MapMarker[] = [];
  if (result1?.lat && result1?.lon) markers.push({ lat: result1.lat, lon: result1.lon, label: result1.city || result1.ip, sublabel: result1.ip });
  if (result2?.lat && result2?.lon) markers.push({ lat: result2.lat, lon: result2.lon, label: result2.city || result2.ip, sublabel: result2.ip, isCompare: true });

  const distance = result1 && result2 ? haversine(result1.lat, result1.lon, result2.lat, result2.lon) : null;

  const compareFields = [
    { label: "Country", get: (r: CompareResult) => `${getFlag(r.country_code)} ${r.country}` },
    { label: "City", get: (r: CompareResult) => r.city },
    { label: "Region", get: (r: CompareResult) => r.region },
    { label: "ISP", get: (r: CompareResult) => r.isp },
    { label: "Org", get: (r: CompareResult) => r.org },
    { label: "Timezone", get: (r: CompareResult) => r.timezone },
    { label: "Lat / Lon", get: (r: CompareResult) => `${r.lat?.toFixed(4)}, ${r.lon?.toFixed(4)}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display mb-1">Compare IPs</h2>
        <p className="text-sm text-slate-500">Compare geolocation data of two IP addresses side by side</p>
      </div>

      {/* Input */}
      <div className="glass-card-static p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Network size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
            <input
              id="compare-ip1"
              type="text"
              value={ip1}
              onChange={(e) => setIp1(e.target.value)}
              placeholder="First IP (e.g. 8.8.8.8)"
              className="w-full h-11 bg-white/[0.03] border border-brand-border rounded-xl pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all font-mono text-sm"
            />
          </div>
          <ArrowRight size={18} className="text-slate-600 shrink-0 hidden sm:block" />
          <div className="relative flex-1">
            <Network size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              id="compare-ip2"
              type="text"
              value={ip2}
              onChange={(e) => setIp2(e.target.value)}
              placeholder="Second IP (e.g. 1.1.1.1)"
              className="w-full h-11 bg-white/[0.03] border border-brand-border rounded-xl pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/40 transition-all font-mono text-sm"
            />
          </div>
          <button
            id="compare-button"
            onClick={handleCompare}
            disabled={loading}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] shrink-0"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <GitCompare size={16} />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-3 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result1 && result2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Distance */}
            {distance !== null && (
              <div className="glass-card-static p-4 flex items-center justify-center gap-3">
                <Ruler size={18} className="text-indigo-400" />
                <span className="text-sm text-slate-300">
                  Distance between locations: <strong className="text-white font-display">{distance.toFixed(1).toLocaleString()} km</strong>
                  <span className="text-slate-500"> ({(distance * 0.621371).toFixed(1)} mi)</span>
                </span>
              </div>
            )}

            {/* Map */}
            <div className="glass-card-static overflow-hidden h-[350px]">
              <MapView markers={markers} />
            </div>

            {/* Comparison Table */}
            <div className="glass-card-static overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border/50">
                    <th className="text-left px-5 py-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold w-1/4">Field</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold w-[37.5%]">
                      <span className="flex items-center gap-1.5 text-indigo-400"><Network size={12} /> {result1.ip}</span>
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold w-[37.5%]">
                      <span className="flex items-center gap-1.5 text-amber-400"><Network size={12} /> {result2.ip}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30">
                  {compareFields.map((field) => {
                    const v1 = field.get(result1);
                    const v2 = field.get(result2);
                    const differ = v1 !== v2;
                    return (
                      <tr key={field.label} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-xs text-slate-500 font-medium">{field.label}</td>
                        <td className={`px-5 py-3 text-xs ${differ ? 'text-white font-medium' : 'text-slate-400'}`}>{v1 || '—'}</td>
                        <td className={`px-5 py-3 text-xs ${differ ? 'text-white font-medium' : 'text-slate-400'}`}>{v2 || '—'}</td>
                      </tr>
                    );
                  })}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-500 font-medium">Risk Level</td>
                    <td className="px-5 py-3"><RiskBadge level={result1.risk_level} /></td>
                    <td className="px-5 py-3"><RiskBadge level={result2.risk_level} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
