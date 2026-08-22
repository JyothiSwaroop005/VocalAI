import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { ShieldAlert, ArrowRight, CheckCircle2, X } from 'lucide-react';

export const HumanHandoffModal: React.FC = () => {
  const { 
    isHandoffModalOpen, 
    setIsHandoffModalOpen, 
    activeCustomer, 
    latestResult 
  } = useOS();

  const [transferred, setTransferred] = useState(false);

  if (!isHandoffModalOpen) return null;

  const handleTransfer = () => {
    setTransferred(true);
    setTimeout(() => {
      setTransferred(false);
      setIsHandoffModalOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-rose-500/50 shadow-2xl space-y-5 relative bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Human + AI Escalation Protocol
              </h3>
              <p className="text-xs text-rose-300 font-mono">
                Context Dossier Prepared for Human Supervisor
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHandoffModalOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {transferred ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">TRANSFERRED TO HUMAN AGENT</h4>
            <p className="text-xs text-slate-300 font-mono">
              Live call audio stream and context dossier successfully dispatched to Supervisor Desk.
            </p>
          </div>
        ) : (
          <>
            {/* Context Dossier */}
            <div className="space-y-3">
              <div className="glass-panel p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Customer Profile</span>
                <p className="text-xs font-bold text-white">{activeCustomer.name} ({activeCustomer.tier})</p>
                <p className="text-[11px] text-slate-300 font-mono">{activeCustomer.company}</p>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/30 space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Detected Escalation Reason</span>
                <p className="text-xs text-rose-200 font-mono">
                  {latestResult?.intent || 'High Priority Frustration Keyword Detected'}
                </p>
                <span className="text-[10px] font-mono text-slate-400">
                  Customer Sentiment: <strong className="text-rose-400">Frustrated (28%)</strong>
                </span>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Recommended Action for Human Agent</span>
                <p className="text-xs text-slate-200 font-mono">
                  {latestResult?.insight.nextBestAction || 'Acknowledge prescription refill delay and issue priority dispatch.'}
                </p>
              </div>
            </div>

            {/* Transfer Button */}
            <button
              onClick={handleTransfer}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>TRANSFER TO HUMAN SUPERVISOR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

      </div>
    </div>
  );
};
