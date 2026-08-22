import React from 'react';
import { useOS } from '../context/OSContext';
import { Network, Sparkles, Zap } from 'lucide-react';

export const DigitalTwinMap: React.FC = () => {
  const { activePartner, partners, selectPartner } = useOS();

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Partner Business Digital Twin & Journey Mapper
          </h2>
          <p className="text-xs text-slate-400">
            Interactive digital twin visualizing full end-to-end customer journey stages and highlighting VocalLabs AI intervention nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Active Digital Twin:</span>
          <select
            value={activePartner.id}
            onChange={(e) => selectPartner(e.target.value)}
            className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-cyan-500/40 focus:outline-none"
          >
            {partners.map(p => (
              <option key={p.id} value={p.id}>{p.logo} {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Partner Bio Banner */}
      <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-lg">
            {activePartner.logo}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">{activePartner.name}</h3>
            <p className="text-xs font-mono text-cyan-300">{activePartner.tagline}</p>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              {activePartner.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-center px-3 py-2 rounded-xl bg-slate-900 border border-white/10">
            <span className="block text-[10px] text-slate-400 uppercase">Monthly Voice Calls</span>
            <span className="text-cyan-400 font-bold text-sm">{activePartner.monthlyCalls}</span>
          </div>
          <div className="text-center px-3 py-2 rounded-xl bg-slate-900 border border-white/10">
            <span className="block text-[10px] text-slate-400 uppercase">Automation Rate</span>
            <span className="text-emerald-400 font-bold text-sm">{activePartner.automationRate}</span>
          </div>
        </div>
      </div>

      {/* Customer Journey Stage Map */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          End-to-End Customer Journey & VocalLabs AI Intervention Map
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePartner.journeyNodes.map((node, idx) => (
            <div
              key={node.id}
              className={`glass-panel p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                node.status === 'optimized'
                  ? 'border-emerald-500/40 bg-slate-900/80 shadow-lg shadow-emerald-500/10'
                  : node.status === 'active'
                  ? 'border-cyan-500/40 bg-slate-900/80 shadow-lg shadow-cyan-500/10'
                  : 'border-amber-500/40 bg-slate-900/80'
              }`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-white/10 uppercase">
                  Stage 0{idx+1}: {node.stage}
                </span>

                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  node.status === 'optimized'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : node.status === 'active'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {node.status}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-sm font-bold text-white">{node.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono mt-1">
                  {node.description}
                </p>
              </div>

              {/* AI Intervention Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> VOCALLABS AI INTERVENTION
                </span>
                <p className="text-xs text-cyan-200 leading-relaxed font-mono">
                  {node.aiIntervention}
                </p>
              </div>

              {/* Value Impact Attribution */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Business Value:</span>
                <span className="text-emerald-400 font-bold">{node.potentialValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
