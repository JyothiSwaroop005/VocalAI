import React from 'react';
import { useOS } from '../context/OSContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const WowMomentModal: React.FC = () => {
  const { isWowDemoRunning, wowStepIndex, activePartner, activeAgent } = useOS();

  if (!isWowDemoRunning) return null;

  const wowSteps = [
    { title: '1. Business Selected', desc: `Analyzing ${activePartner.name} digital footprint...` },
    { title: '2. AI Business Analysis', desc: 'Identified 42 clinics and 142k annual patient call volume.' },
    { title: '3. Identifying Opportunities', desc: 'Mapped zero-wait appointment booking & Rx refill opportunities.' },
    { title: '4. Agent Construction', desc: `Assembled autonomous Agent "${activeAgent.name}" with care persona.` },
    { title: '5. Workflow Synthesis', desc: 'Generated 6 custom action graphs connected to partner EHR.' },
    { title: '6. Live Call Simulation', desc: 'Simulated acoustic call with patient asking for afternoon slot.' },
    { title: '7. Intent & NLU Detection', desc: 'Intent "Appointment Booking" classified with 98% confidence.' },
    { title: '8. Autonomous Action', desc: 'Reserved Thursday 2:30 PM slot; Calendar & SMS invite sent.' },
    { title: '9. Agent Ready!', desc: 'Estimated automation potential: $420,000 / year saved!' }
  ];

  const isComplete = wowStepIndex >= 8;

  const triggerDeploy = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border-2 border-cyan-500/50 shadow-2xl space-y-6 relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
        
        {/* Glowing Background Radial */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.15)_0,transparent_70%)] pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] shadow-xl glow-cyan animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            VOCALLABS INTELLIGENCE TRANSFORMATION
          </h2>
          <p className="text-xs font-mono text-cyan-300">
            Autonomous End-to-End Agent Creation & Business Deployment
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span>Stage 0{wowStepIndex + 1} of 09</span>
            <span className="text-cyan-400 font-bold">{Math.round(((wowStepIndex + 1) / 9) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${((wowStepIndex + 1) / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Active Step Box */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40 bg-slate-900/90 text-center space-y-2 relative z-10 shadow-lg">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            {wowSteps[wowStepIndex]?.title}
          </span>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {wowSteps[wowStepIndex]?.desc}
          </p>
        </div>

        {/* Final Ready Box */}
        {isComplete && (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3 animate-fade-in relative z-10">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">YOUR AI AGENT IS READY FOR DEPLOYMENT</h3>
            <p className="text-xs text-slate-300 font-mono">
              Agent: {activeAgent.name} | Automation Potential: 84% | ROI: $420,000 / year
            </p>
            <button
              onClick={triggerDeploy}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 hover:scale-105 cursor-pointer transition-all"
            >
              DEPLOY AGENT TO PRODUCTION
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
