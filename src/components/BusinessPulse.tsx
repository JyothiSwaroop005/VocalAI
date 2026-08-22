import React from 'react';
import { useOS } from '../context/OSContext';
import { TrendingUp, Play, Activity } from 'lucide-react';

export const BusinessPulse: React.FC = () => {
  const { 
    simulationEvents, 
    runBusinessSimulation, 
    isSimulating, 
    simulationProgress 
  } = useOS();

  const metrics = [
    { label: 'Customer Satisfaction (CSAT)', value: '98.4%', change: '↑ 18%', isPos: true, color: 'text-emerald-400' },
    { label: 'Autonomous Resolution Rate', value: '94.6%', change: '↑ 12%', isPos: true, color: 'text-cyan-400' },
    { label: 'AI End-to-End Automation', value: '73.0%', change: '↑ 24%', isPos: true, color: 'text-purple-400' },
    { label: 'Missed Opportunities', value: '4.2%', change: '↓ 31%', isPos: true, color: 'text-emerald-400' },
    { label: 'Average Voice Response SLA', value: '1.2s', change: '⚡ Instant', isPos: true, color: 'text-amber-400' }
  ];

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            AI Business Pulse & ROI Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Real-time business performance pulse tracking satisfaction lift, resolution velocity, and operational cost savings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
            DEMO SIMULATION METRICS
          </span>

          <button
            onClick={runBusinessSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer transition-all"
          >
            <Play className={`w-3.5 h-3.5 text-white ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? `SIMULATING (${simulationProgress}%)...` : 'RUN 24H BUSINESS SIMULATION'}
          </button>
        </div>
      </div>

      {/* Progress Bar when Simulating */}
      {isSimulating && (
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
          <div 
            className="bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${simulationProgress}%` }}
          />
        </div>
      )}

      {/* Animated Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-1 bg-slate-900/70">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{m.label}</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-extrabold font-mono ${m.color}`}>{m.value}</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Simulation Event Stream Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
          <span>Live 24-Hour AI Activity Event Stream</span>
          <span className="text-cyan-400 text-[10px]">{simulationEvents.length} events logged</span>
        </h3>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-950/80 space-y-3 max-h-80 overflow-y-auto">
          {simulationEvents.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-cyan-500/30 transition-all text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 text-[11px] bg-slate-800 px-2 py-1 rounded">
                  {evt.time}
                </span>
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    {evt.title}
                  </h4>
                  <p className="text-slate-300 font-mono text-[11px]">{evt.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Agent: {evt.agentName}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {evt.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
