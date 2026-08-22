import React from 'react';
import { useOS } from '../context/OSContext';
import { 
  Workflow, CheckCircle2, ArrowRight, 
  HelpCircle, ShieldAlert, Sparkles, ExternalLink 
} from 'lucide-react';

export const ActionGraph: React.FC = () => {
  const { actionHistory, openExplainability } = useOS();

  const workflowSteps = [
    { label: '1. Customer Call', desc: 'Acoustic input captured' },
    { label: '2. Identify Intent', desc: '96% confidence score' },
    { label: '3. Check Context', desc: 'Customer graph matched' },
    { label: '4. Determine Priority', desc: 'Priority rule enforced' },
    { label: '5. Select Workflow', desc: 'Autonomous dispatch' },
    { label: '6. Execute Action', desc: 'API payload executed' },
    { label: '7. Confirm Result', desc: 'EHR / CRM synced' },
    { label: '8. Update BI', desc: 'Business pulse updated' }
  ];

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-cyan-400" />
            Autonomous AI Action Graph & Execution History
          </h2>
          <p className="text-xs text-slate-400">
            Real-time execution graph proving that VocalLabs OS takes direct autonomous action (CRM updates, appointment scheduling, ticket dispatch).
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {actionHistory.length} Actions Recorded Local State
        </span>
      </div>

      {/* Visual Action Flow Pipeline Bar */}
      <div className="glass-panel p-4 rounded-xl border border-white/10 bg-slate-900/70 overflow-x-auto">
        <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-3">
          AUTONOMOUS ACTION WORKFLOW STAGES
        </span>
        <div className="flex items-center gap-2 min-w-[700px]">
          {workflowSteps.map((s, idx) => (
            <React.Fragment key={idx}>
              <div className="flex-1 bg-slate-950 p-2.5 rounded-lg border border-cyan-500/30 text-center">
                <span className="text-[10px] font-mono font-bold text-cyan-400 block">{s.label}</span>
                <span className="text-[9px] text-slate-400 font-mono block">{s.desc}</span>
              </div>
              {idx < workflowSteps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Executed Action History Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Executed Action History Log
        </h3>

        <div className="space-y-3">
          {actionHistory.map((act) => {
            const isEscalated = act.status === 'escalated';

            return (
              <div
                key={act.id}
                className={`glass-panel p-4 rounded-xl border transition-all ${
                  isEscalated
                    ? 'border-rose-500/40 bg-rose-950/20'
                    : 'border-white/10 hover:border-cyan-500/40 bg-slate-900/60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isEscalated ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <h4 className="text-sm font-bold text-white">{act.title}</h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isEscalated
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {act.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono">{act.timestamp}</span>
                    <button
                      onClick={() => openExplainability(act)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      WHY DID AI DO THIS?
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono mb-2">
                  {act.description}
                </p>

                {act.externalUrl && (
                  <div className="my-2">
                    <button
                      type="button"
                      onClick={() => window.open(act.externalUrl, '_blank', 'noopener,noreferrer')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/30 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                      <span>{act.externalLabel || 'OPEN ACTION LINK ↗'}</span>
                    </button>
                  </div>
                )}

                {act.reasoningFactors && act.reasoningFactors.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Reasoning Factors</span>
                    <div className="flex flex-wrap gap-2">
                      {act.reasoningFactors.map((rf, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-white/10">
                          • {rf}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
