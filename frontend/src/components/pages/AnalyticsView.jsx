import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Gauge, 
  ShieldAlert, 
  Calendar, 
  Download, 
  Clock, 
  Layers 
} from 'lucide-react';
import { TacticalCard } from '../common/TacticalCard';
import { 
  HOURLY_TRAFFIC_DATA, 
  VEHICLE_DISTRIBUTION_DATA, 
  VIOLATION_METRICS_DATA 
} from '../../data/mockData';

export const AnalyticsView = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              BIG DATA INTELLIGENCE
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Traffic Density, Violation Categories & Vector Analytics
            </h1>
          </div>
        </div>

        <button
          onClick={() => alert('Exporting Analytics CSV...')}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics Dataset</span>
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TacticalCard corners={true}>
          <span className="text-[11px] font-mono text-slate-400 uppercase">PEAK INGESTION PERIOD</span>
          <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">18:00 - 19:30 IST</div>
          <span className="text-xs text-slate-400 mt-1 block">14,890 plates/hr across 24 nodes</span>
        </TacticalCard>

        <TacticalCard corners={true}>
          <span className="text-[11px] font-mono text-slate-400 uppercase">AVERAGE VEHICLE TRANSIT SPEED</span>
          <div className="text-2xl font-mono font-bold text-amber-300 mt-1">54.2 km/h</div>
          <span className="text-xs text-slate-400 mt-1 block">Within 60 km/h urban threshold</span>
        </TacticalCard>

        <TacticalCard corners={true}>
          <span className="text-[11px] font-mono text-slate-400 uppercase">CONVOY CLUSTERING ACCURACY</span>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">98.4%</div>
          <span className="text-xs text-slate-400 mt-1 block">Time-Distance correlation metric</span>
        </TacticalCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Violations Breakdown Bar Chart */}
        <TacticalCard
          title="Violation Categories Distribution"
          subtitle="Real-time infraction classification by edge AI models"
          icon={ShieldAlert}
        >
          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VIOLATION_METRICS_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} fontFamily="JetBrains Mono" width={140} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080d1a',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="count" fill="#00f0ff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TacticalCard>

        {/* Chart 2: Hourly Average Speed Trends */}
        <TacticalCard
          title="Hourly Corridor Speed Variations"
          subtitle="Average vehicle transit speed by hour of day"
          icon={Gauge}
        >
          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip
                  formatter={(val) => [`${val} km/h`, 'Avg Speed']}
                  contentStyle={{
                    backgroundColor: '#080d1a',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
                <Area type="monotone" dataKey="avgSpeed" stroke="#f59e0b" strokeWidth={2.5} fill="url(#speedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TacticalCard>
      </div>
    </div>
  );
};
