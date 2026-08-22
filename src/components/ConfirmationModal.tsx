import React from 'react';
import { useOS } from '../context/OSContext';
import { 
  AlertTriangle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export const ConfirmationModal: React.FC = () => {
  const { confirmationRequest, setConfirmationRequest } = useOS();

  if (!confirmationRequest) return null;

  const handleConfirm = () => {
    soundEffects.playSuccess();
    confirmationRequest.onConfirm();
    setConfirmationRequest(null);
  };

  const handleCancel = () => {
    soundEffects.playClick();
    confirmationRequest.onCancel();
    setConfirmationRequest(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-6 relative bg-slate-900 overflow-hidden">
        
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              CONFIRMATION & SAFETY GUARD
            </span>
            <h3 className="text-lg font-extrabold text-white font-mono">
              {confirmationRequest.title}
            </h3>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed font-mono">
            {confirmationRequest.message}
          </p>

          {/* Details Matrix */}
          {confirmationRequest.details && Object.keys(confirmationRequest.details).length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-1 text-xs font-mono">
              {Object.entries(confirmationRequest.details).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{k}:</span>
                  <strong className="text-amber-300">{v}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safety Note */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>VocalLabs OS Safety Protocol requires explicit user confirmation before executing financial or booking transactions.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition-all cursor-pointer font-mono"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRM ACTION</span>
          </button>
        </div>

      </div>
    </div>
  );
};
