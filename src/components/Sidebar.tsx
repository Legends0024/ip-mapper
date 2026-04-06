import { Search, BarChart3, History, Map, GitCompare, Globe2, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";

type View = 'dashboard' | 'search' | 'analytics' | 'history' | 'compare';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Globe2 },
  { id: 'search', label: 'IP Lookup', icon: Search },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
  { id: 'compare', label: 'Compare IPs', icon: GitCompare },
];

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        id="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] w-10 h-10 bg-brand-glass backdrop-blur-xl border border-brand-border rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-colors"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[49]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-[#060912]/95 backdrop-blur-2xl border-r border-brand-border
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-[72px] border-b border-brand-border/50 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Globe2 className="text-white" size={20} />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold tracking-tight text-white font-display">
                Geo<span className="text-indigo-400">Track</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Intelligence</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <p className={`text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] px-4 mb-3 ${collapsed ? 'hidden' : ''}`}>
            Navigation
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              className={`sidebar-link w-full ${currentView === item.id ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden md:block px-3 pb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 text-xs font-medium transition-all border border-transparent hover:border-brand-border"
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
          </button>
        </div>

        {/* Version tag */}
        {!collapsed && (
          <div className="px-5 pb-5 text-[10px] text-slate-600">
            <span className="px-2 py-1 bg-indigo-500/5 border border-indigo-500/10 rounded-md font-mono">v2.0.0-prototype</span>
          </div>
        )}
      </aside>
    </>
  );
}

export type { View };
