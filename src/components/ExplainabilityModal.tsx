import React from 'react';
import { useOS } from '../context/OSContext';
import { HelpCircle, X, CheckCircle2 } from 'lucide-react';

export const ExplainabilityModal: React.FC = () => {
  const { explainabilityData, isExplainModalOpen, setIsExplainModalOpen } = useOS();

  if (!isExplainModalOpen || !explainabilityData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-5 relative bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Why Did AI Take This Action?
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Transparent Decision Factors & Rule Compliance
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExplainModalOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Title */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30">
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">Executed Action</span>
          <h4 className="text-sm font-bold text-white">{explainabilityData.actionTitle}</h4>
        </div>

        {/* Decision Factors */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-300 uppercase font-bold block">
            Primary Decision Factors
          </span>
          <div className="space-y-2">
            {explainabilityData.decisionFactors.map((factor, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-200 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rules Enforced */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-300 uppercase font-bold block">
            VocalLabs Compliance Rules Enforced
          </span>
          <div className="flex flex-wrap gap-2">
            {explainabilityData.rulesTriggered.map((rule, i) => (
              <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {rule}
              </span>
            ))}
          </div>
        </div>

        {/* Confidence Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Decision Confidence:</span>
          <span className="text-cyan-400 font-bold">{explainabilityData.confidenceScore}%</span>
        </div>

      </div>
    </div>
  );
};
