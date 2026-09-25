import React from 'react';
import { 
  LayoutDashboard, 
  Cctv, 
  Search, 
  Navigation, 
  Map as MapIcon, 
  ShieldAlert, 
  BellRing, 
  FileText, 
  BarChart3, 
  Server, 
  GitMerge, 
  Settings, 
  Cpu, 
  Activity, 
  Wifi, 
  Radio,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = () => {
  const { 
    activePage, 
    setActivePage, 
    isMuted, 
    dndPreset, 
    unreadAlertCount, 
    watchlist,
    cameras 
  } = useApp();

  const navSections = [
    {
      groupTitle: 'SURVEILLANCE GRID',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: 'LIVE',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        },
        {
          id: 'cameras',
          label: 'Live Cameras',
          icon: Cctv,
          badge: `${cameras.length} Nodes`,
          badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        },
        {
          id: 'search',
          label: 'Vehicle Search',
          icon: Search,
          badge: 'ANPR',
          badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
        },
        {
          id: 'tracking',
          label: 'Vehicle Tracking',
          icon: Navigation,
          badge: 'Correlation',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        },
        {
          id: 'map',
          label: 'GIS Tactical Map',
          icon: MapIcon,
          badge: 'Routes',
          badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        },
      ],
    },
    {
      groupTitle: 'LAW ENFORCEMENT INTEL',
      items: [
        {
          id: 'watchlist',
          label: 'Watchlist Registry',
          icon: ShieldAlert,
          badge: `${watchlist.length} BOLO`,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        },
        {
          id: 'alerts',
          label: 'Real-Time Alerts',
          icon: BellRing,
          badge: unreadAlertCount > 0 ? `${unreadAlertCount} NEW` : 'Log',
          badgeColor: unreadAlertCount > 0 
            ? 'bg-rose-600 text-white font-bold animate-pulse' 
            : 'bg-slate-800 text-slate-400 border-slate-700',
        },
        {
          id: 'dossier',
          label: 'Investigation Dossier',
          icon: FileText,
          badge: 'Evidence',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          id: 'analytics',
          label: 'Analytics & Trends',
          icon: BarChart3,
          badge: 'AI Insights',
          badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        },
      ],
    },
    {
      groupTitle: 'SYSTEM CONFIG',
      items: [
        {
          id: 'fleet',
          label: 'Camera Fleet Mgmt',
          icon: Server,
          badge: 'Edge VMS',
          badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
        },
        {
          id: 'pipeline',
          label: 'Pipeline Architecture',
          icon: GitMerge,
          badge: 'YOLOv8',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: Settings,
          badge: null,
          badgeColor: '',
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#070b16]/95 backdrop-blur-2xl border-r border-cyan-500/15 flex flex-col justify-between flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto select-none z-20">
      {/* Navigation Groupings */}
      <div className="p-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Section Header */}
            <div className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center justify-between border-b border-slate-800/60 pb-1 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-sm bg-cyan-500/70"></span>
                {section.groupTitle}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">0{idx + 1}</span>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-transparent text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/70 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : 'text-slate-400 group-hover:text-cyan-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM TELEMETRY & SYSTEM HEALTH WIDGET (Mandatory Requirement B) */}
      <div className="p-3 border-t border-slate-800/80 bg-[#050811]/90 m-2 rounded-xl border border-cyan-500/15">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wider">
              GRID TELEMETRY
            </span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            HEALTH 99.4%
          </span>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-2.5">
          <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 block text-[9px]">ACTIVE NODES</span>
            <span className="text-cyan-300 font-bold text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              248 / 250
            </span>
          </div>
          <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 block text-[9px]">INFERENCE TIME</span>
            <span className="text-slate-200 font-bold text-xs">12.4 ms</span>
          </div>
        </div>

        {/* Notification State Tag */}
        <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            {isMuted ? (
              <VolumeX className="w-3 h-3 text-rose-400" />
            ) : (
              <Volume2 className="w-3 h-3 text-cyan-400" />
            )}
            NOTIF STATE:
          </span>
          <span
            className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
              isMuted
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                : dndPreset === 'critical'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
            }`}
          >
            {isMuted ? 'MUTED' : dndPreset.toUpperCase()}
          </span>
        </div>
      </div>
    </aside>
  );
};
