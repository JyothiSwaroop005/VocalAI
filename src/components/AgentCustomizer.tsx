import React from 'react';
import { useOS } from '../context/OSContext';
import type { AgentTone, AgentBehavior } from '../types';
import { Sliders, Sparkles, Shield, Target } from 'lucide-react';

export const AgentCustomizer: React.FC = () => {
  const { activeAgent, updateAgentConfig } = useOS();

  const tones: AgentTone[] = ['Professional', 'Friendly', 'Empathetic', 'Concise', 'Premium'];
  const behaviors: AgentBehavior[] = ['Proactive', 'Helpful', 'Sales-oriented', 'Support-oriented'];

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            AI Agent Personality Configurator
          </h2>
          <p className="text-xs text-slate-400">
            Tune speech tone, operating persona, primary objective, and compliance system rules with live immediate preview.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
          Live Configuration Sync Enabled
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Agent Customizer Controls */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Agent Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5 uppercase">
                Agent Name
              </label>
              <input
                type="text"
                value={activeAgent.name}
                onChange={(e) => updateAgentConfig(activeAgent.id, { name: e.target.value })}
                className="w-full bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-cyan-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5 uppercase">
                Role / Specialty Title
              </label>
              <input
                type="text"
                value={activeAgent.role}
                onChange={(e) => updateAgentConfig(activeAgent.id, { role: e.target.value })}
                className="w-full bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Voice Personality Tone Selection */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">
              Voice Personality Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => updateAgentConfig(activeAgent.id, { tone: t })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeAgent.tone === t
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Operating Behavior Selection */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">
              Operating Behavior Mode
            </label>
            <div className="flex flex-wrap gap-2">
              {behaviors.map((b) => (
                <button
                  key={b}
                  onClick={() => updateAgentConfig(activeAgent.id, { behavior: b })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeAgent.behavior === b
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Objective */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5 uppercase flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Primary Objective
            </label>
            <textarea
              rows={2}
              value={activeAgent.objective}
              onChange={(e) => updateAgentConfig(activeAgent.id, { objective: e.target.value })}
              className="w-full bg-slate-900 text-white text-xs p-3 rounded-xl border border-white/15 focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          {/* System Compliance Rules */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5 uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              Active System Rules ({activeAgent.systemRules.length})
            </label>
            <div className="space-y-2">
              {activeAgent.systemRules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/10 text-xs text-slate-300 font-mono">
                  <span className="text-cyan-400 font-bold">Rule #{idx + 1}:</span>
                  <span className="flex-1">{rule}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Preview Card: Instant Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>LIVE AGENT PREVIEW CARD</span>
            <span className="text-emerald-400">INSTANT SYNC</span>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-cyan-400">
              <Sparkles className="w-32 h-32" />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] shadow-lg glow-cyan">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
                  {activeAgent.avatar}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Meet {activeAgent.name}
                </h3>
                <p className="text-xs font-mono text-cyan-300">
                  {activeAgent.role}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Tone: {activeAgent.tone}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Behavior: {activeAgent.behavior}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Primary Objective</span>
              <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-white/5">
                "{activeAgent.objective}"
              </p>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Configured Capabilities</span>
              <div className="flex flex-wrap gap-1.5">
                {activeAgent.capabilities.map((cap, i) => (
                  <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/10">
                    ✓ {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>Performance Score</span>
              <span className="font-bold text-sm">{activeAgent.performanceScore}%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
