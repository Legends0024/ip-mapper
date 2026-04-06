import { useState, useEffect } from "react";
import { BarChart3, Globe2, ShieldAlert, Search, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton";

interface AnalyticsData {
  total_searches: number;
  unique_ips: number;
  unique_countries: number;
  high_risk_count: number;
  top_countries: { country: string; country_code: string; count: number }[];
  risk_distribution: { risk_level: string; count: number }[];
  recent_activity: { id: number; ip: string; country: string; country_code: string; city: string; risk_level: string; timestamp: string }[];
}

function getFlag(cc: string): string {
  if (!cc) return '🌍';
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
}

function RiskDot({ level }: { level: string }) {
  const color = { low: 'bg-emerald-400', medium: 'bg-amber-400', high: 'bg-red-400' }[level] || 'bg-slate-400';
  return <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />;
}

const RISK_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-indigo-500/20 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value} searches</p>
    </div>
  );
};

interface AnalyticsDashboardProps {
  refreshTrigger?: number;
}

export default function AnalyticsDashboard({ refreshTrigger }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        if (json.status === "success") {
          setData(json);
        }
      } catch {}
      setLoading(false);
    };
    fetchAnalytics();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
        </div>
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card-static p-8 text-center">
        <BarChart3 size={32} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500">Unable to load analytics</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Searches", value: data.total_searches, icon: Search, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Unique IPs", value: data.unique_ips, icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Countries", value: data.unique_countries, icon: Globe2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "High Risk", value: data.high_risk_count, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  const barData = data.top_countries.map(c => ({
    name: `${getFlag(c.country_code)} ${c.country}`,
    searches: c.count,
  }));

  const pieData = data.risk_distribution.map(r => ({
    name: r.risk_level.charAt(0).toUpperCase() + r.risk_level.slice(1),
    value: r.count,
    color: RISK_COLORS[r.risk_level] || '#64748b',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display mb-1">Analytics</h2>
        <p className="text-sm text-slate-500">Overview of your IP tracking activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.12em] font-semibold mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-white font-display">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 glass-card-static p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-indigo-400" />
            <h3 className="font-bold text-sm">Top Countries</h3>
          </div>
          {barData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                <Bar dataKey="searches" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card-static p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={18} className="text-indigo-400" />
            <h3 className="font-bold text-sm">Risk Distribution</h3>
          </div>
          {pieData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                    <span>{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card-static p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Activity size={18} className="text-indigo-400" />
          <h3 className="font-bold text-sm">Recent Activity</h3>
        </div>
        {data.recent_activity.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-6">No activity yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-brand-border/50">
                  <th className="text-left pb-3 font-semibold">IP Address</th>
                  <th className="text-left pb-3 font-semibold">Location</th>
                  <th className="text-left pb-3 font-semibold">Risk</th>
                  <th className="text-right pb-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/30">
                {data.recent_activity.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-mono text-xs text-white">{row.ip}</td>
                    <td className="py-3 text-xs text-slate-400">
                      {getFlag(row.country_code)} {row.city}{row.country ? `, ${row.country}` : ''}
                    </td>
                    <td className="py-3"><RiskDot level={row.risk_level} /></td>
                    <td className="py-3 text-right text-[10px] text-slate-600">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
