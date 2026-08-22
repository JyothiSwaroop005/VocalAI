import React from 'react';
import { useOS } from '../context/OSContext';
import { Users, CheckCircle, Activity } from 'lucide-react';

export const MultiAgentSelector: React.FC = () => {
  const { agents, activeAgent, selectAgent } = useOS();

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Multi-Agent Intelligence Orchestrator
          </h2>
          <p className="text-xs text-slate-400">
            Select and switch specialized domain agents. Each agent maintains distinct capabilities, objectives, and performance metrics.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
          6 Specialized Agents Online
        </span>
      </div>

      {/* Grid of Specialized Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const isSelected = activeAgent.id === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => selectAgent(agent.id)}
              className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-500/60 bg-slate-900/90 shadow-xl shadow-cyan-500/15 ring-2 ring-cyan-500/30'
                  : 'border-white/10 hover:border-white/20 bg-slate-950/60 hover:bg-slate-900/70'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> ACTIVE OS AGENT
                </div>
              )}

              {/* Agent Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${agent.accentColor} p-[2px] shadow-lg`}>
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-2xl">
                    {agent.avatar}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white">{agent.name}</h3>
                  <p className="text-xs text-cyan-300 font-mono">{agent.role}</p>
                </div>
              </div>

              {/* Objective */}
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                {agent.objective}
              </p>

              {/* Capabilities Pills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {agent.capabilities.slice(0, 3).map((cap, i) => (
                  <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10">
                    {cap}
                  </span>
                ))}
                {agent.capabilities.length > 3 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    +{agent.capabilities.length - 3}
                  </span>
                )}
              </div>

              {/* Metrics Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{agent.activeTasks} active tasks</span>
                </div>

                <span className="text-emerald-400 font-bold">
                  {agent.performanceScore}% Score
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
