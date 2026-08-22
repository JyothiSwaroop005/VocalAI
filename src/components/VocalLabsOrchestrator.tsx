import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { buildGoaTripOrchestrationWorkflow } from '../services/orchestratorEngine';
import type { OrchestrationWorkflow } from '../types';
import { 
  Sparkles, CheckCircle2, Play, Cpu, 
  Workflow 
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export const VocalLabsOrchestrator: React.FC = () => {
  const { runCrossPlatformOrchestration, isOrchestrationActive, orchestrationWorkflow } = useOS();

  const activeWorkflow: OrchestrationWorkflow = orchestrationWorkflow || buildGoaTripOrchestrationWorkflow();

  const [nodeProgress, setNodeProgress] = useState<Record<string, number>>({
    'node-mmt': 100,
    'node-maps': 100,
    'node-cal': 100,
    'node-gmail': 100,
    'node-spotify': 100,
    'node-whatsapp': 100
  });

  useEffect(() => {
    if (isOrchestrationActive) {
      soundEffects.playNeuralPulse();
      // Animate progress sequentially across nodes
      setNodeProgress({
        'node-mmt': 0,
        'node-maps': 0,
        'node-cal': 0,
        'node-gmail': 0,
        'node-spotify': 0,
        'node-whatsapp': 0
      });

      const nodeIds = ['node-mmt', 'node-maps', 'node-cal', 'node-gmail', 'node-spotify', 'node-whatsapp'];
      nodeIds.forEach((id, idx) => {
        setTimeout(() => {
          setNodeProgress(prev => ({ ...prev, [id]: 100 }));
          soundEffects.playClick();
          if (idx === nodeIds.length - 1) {
            soundEffects.playSuccess();
          }
        }, (idx + 1) * 600);
      });
    }
  }, [isOrchestrationActive]);

  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/30 space-y-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl relative overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,242,254,0.15)_0,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Workflow className="w-6 h-6 text-cyan-400" />
              VOCALLABS ORCHESTRATOR
            </h2>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-extrabold">
              Multi-Agent Cross-Platform Engine
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Demonstrates how ONE natural language request dynamically coordinates 6 specialized AI agents across 5 digital platforms simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
            LOCAL DEMONSTRATION
          </span>

          <button
            onClick={() => {
              soundEffects.playSuccess();
              runCrossPlatformOrchestration();
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-black text-xs shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className={`w-4 h-4 text-cyan-200 ${isOrchestrationActive ? 'animate-spin' : ''}`} />
            <span>{isOrchestrationActive ? 'ORCHESTRATING WORKFLOW...' : 'RUN AI ORCHESTRATION'}</span>
          </button>
        </div>
      </div>

      {/* Natural Language Prompt Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40 bg-slate-950/90 relative z-10 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> USER NATURAL LANGUAGE REQUEST
          </span>
          <span className="text-slate-400">1 Request → 6 Agents Orchestrated</span>
        </div>
        <p className="text-sm font-semibold text-white italic bg-slate-900 p-3.5 rounded-xl border border-white/10 leading-relaxed font-mono">
          "{activeWorkflow.userPrompt}"
        </p>
      </div>

      {/* Visual Node Graph Topology */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase tracking-wider">
            Multi-Agent Node Topology & Live Execution Graph
          </span>
          <span className="text-emerald-400 font-bold">
            {activeWorkflow.totalAgentsCount} Specialized AI Agents Active
          </span>
        </div>

        {/* Core Orchestrator Center Node */}
        <div className="text-center py-3">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-emerald-500/20 border-2 border-cyan-500/50 shadow-xl">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-extrabold text-white font-mono uppercase tracking-wider">
              VocalLabs Core AI Intent Detection Engine
            </span>
          </div>
        </div>

        {/* 6 Specialized Agent Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeWorkflow.nodes.map((node) => {
            const progress = nodeProgress[node.id] || 0;
            const isDone = progress === 100;

            return (
              <div
                key={node.id}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden space-y-3 ${
                  isDone
                    ? 'border-emerald-500/50 bg-slate-900/90 shadow-xl shadow-emerald-500/10'
                    : 'border-cyan-500/40 bg-slate-950/80 animate-pulse'
                }`}
              >
                {/* Node Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {node.platformName}
                  </span>

                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {isDone ? '✓ Completed' : 'Processing...'}
                  </span>
                </div>

                {/* Agent Name & Action */}
                <div>
                  <h4 className="text-sm font-extrabold text-white">{node.agentName}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono mt-1">
                    {node.action}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/10">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Completion Result Detail */}
                <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-emerald-300">
                  {node.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Final Result Summary Box */}
      <div className="glass-panel p-6 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 space-y-4 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
            <h3 className="text-base font-extrabold text-white">
              UNIFIED WORKFLOW COMPLETE
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              6 AI AGENTS
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              5 INTEGRATIONS
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
              1 USER REQUEST
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-mono">
          {activeWorkflow.summary}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Flight & Resort</span>
            <span className="text-emerald-400 font-bold">Taj Exotica Reserved</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Route & Stops</span>
            <span className="text-cyan-400 font-bold">NH 66 Coastal Mapped</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Calendar & Gmail</span>
            <span className="text-purple-400 font-bold">OOO Leave Staged</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Spotify & WhatsApp</span>
            <span className="text-amber-400 font-bold">Playlist & Group Ready</span>
          </div>
        </div>
      </div>

    </div>
  );
};
