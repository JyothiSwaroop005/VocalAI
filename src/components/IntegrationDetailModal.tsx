import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  X, CheckCircle2, Play, 
  ArrowRight, Cpu 
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export const IntegrationDetailModal: React.FC = () => {
  const { 
    selectedIntegration, 
    setSelectedIntegration, 
    processUserInput 
  } = useOS();

  const [isSimulatingStep, setIsSimulatingStep] = useState(false);
  const [simStepIndex, setSimStepIndex] = useState(0);

  if (!selectedIntegration) return null;

  const steps = selectedIntegration.simulatedWorkflowSteps || [
    'Understanding user request',
    'Extracting key parameters & dates',
    'Evaluating platform API capabilities',
    'Executing workflow payload'
  ];

  const handleSimulate = () => {
    soundEffects.playNeuralPulse();
    setIsSimulatingStep(true);
    setSimStepIndex(0);

    const interval = setInterval(() => {
      setSimStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsSimulatingStep(false);
          soundEffects.playSuccess();
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, 800);
  };

  const handleRunInOS = () => {
    setSelectedIntegration(null);
    processUserInput(selectedIntegration.sampleQuery);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border-2 border-cyan-500/40 shadow-2xl space-y-6 relative bg-slate-900 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-white/15 shadow">
              {selectedIntegration.logo}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">
                  {selectedIntegration.name}
                </h3>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  selectedIntegration.status === 'CONNECTED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {selectedIntegration.status}
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-300">
                VocalLabs {selectedIntegration.agentName} ({selectedIntegration.agentRole})
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedIntegration(null)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capabilities Pills */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Configured AI Capabilities</span>
          <div className="flex flex-wrap gap-1.5">
            {selectedIntegration.capabilities.map((cap, i) => (
              <span key={i} className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 text-slate-200 border border-cyan-500/30">
                ✓ {cap}
              </span>
            ))}
          </div>
        </div>

        {/* User Request Simulation Box */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-2 bg-slate-950/80 relative z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Simulated User Request</span>
          <p className="text-xs font-mono text-white italic bg-slate-900 p-2.5 rounded-lg border border-white/5">
            "{selectedIntegration.sampleQuery}"
          </p>
        </div>

        {/* Animated Workflow Pipeline */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> AI REASONING & WORKFLOW PIPELINE
            </span>
            <button
              onClick={handleSimulate}
              disabled={isSimulatingStep}
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow"
            >
              <Play className="w-3 h-3" />
              <span>{isSimulatingStep ? 'Simulating...' : 'Simulate Workflow'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {steps.map((st, idx) => {
              const isPassed = idx <= simStepIndex;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
                    isPassed
                      ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200 font-bold'
                      : 'border-white/5 bg-slate-950/40 text-slate-500'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isPassed ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="truncate">{st}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulated AI Result Card */}
        <div className="glass-panel p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> AI RESULT PAYLOAD
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              VERIFIED SIMULATION
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">{selectedIntegration.sampleResult.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono mt-1">
              {selectedIntegration.sampleResult.summary}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-3 text-xs font-mono">
            {Object.entries(selectedIntegration.sampleResult.metrics).map(([k, v]) => (
              <span key={k} className="text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10">
                {k}: <strong className="text-emerald-400">{v}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
          <span className="text-[10px] font-mono text-slate-400">
            Status: {selectedIntegration.status} | Privacy: 100% Local Simulation
          </span>

          <button
            onClick={handleRunInOS}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Run Prompt in Voice OS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
