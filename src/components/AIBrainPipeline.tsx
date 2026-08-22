import React from 'react';
import { useOS } from '../context/OSContext';
import { 
  Brain, Mic, Cpu, Search, Database, HeartHandshake, 
  ShieldCheck, Workflow, CheckCircle, Sparkles, ArrowDown 
} from 'lucide-react';

export const AIBrainPipeline: React.FC = () => {
  const { reasoningSteps, callState, activeCustomer, latestResult } = useOS();

  const defaultSteps = [
    {
      stage: 'speech_ingest',
      label: '1. Customer Speaks / Voice Ingest',
      icon: Mic,
      detail: 'Captured natural acoustic input stream via Web Speech API',
      status: callState !== 'idle' ? 'completed' : 'pending'
    },
    {
      stage: 'voice_understanding',
      label: '2. NLU Voice Understanding',
      icon: Cpu,
      detail: 'Phonetic parsing & semantic tokenization into vector space',
      status: callState !== 'idle' ? 'completed' : 'pending'
    },
    {
      stage: 'intent_detection',
      label: '3. Intent Detection & Classification',
      icon: Search,
      detail: `Detected Intent: "${latestResult?.intent || 'Appointment Booking'}" (${latestResult?.confidence || 96}% confidence)`,
      status: callState !== 'idle' ? 'completed' : 'pending'
    },
    {
      stage: 'context_analysis',
      label: '4. Context Analysis & Customer Memory',
      icon: Database,
      detail: `Loaded Customer Memory Profile: ${activeCustomer.name} (${activeCustomer.tier} - ${activeCustomer.company})`,
      status: callState !== 'idle' ? 'completed' : 'pending'
    },
    {
      stage: 'sentiment_analysis',
      label: '5. Sentiment & Urgency Analysis',
      icon: HeartHandshake,
      detail: `Evaluated Sentiment: ${latestResult?.sentiment || 'Positive'} (Urgency: ${latestResult?.priority || 'Medium'})`,
      status: callState !== 'idle' ? 'completed' : 'pending'
    },
    {
      stage: 'business_rules',
      label: '6. Business Rules Matrix Evaluation',
      icon: ShieldCheck,
      detail: 'Verified clinic EHR availability, SLA parameters, and HIPAA authorization',
      status: callState !== 'idle' ? 'completed' : 'pending'
    },
    {
      stage: 'decision_engine',
      label: '7. Autonomous Decision Engine',
      icon: Brain,
      detail: 'Selected optimal action workflow: "Schedule Clinic Appointment & Sync EHR"',
      status: callState !== 'idle' ? 'completed' : 'pending'
    },
    {
      stage: 'action_execution',
      label: '8. Action Execution & API Dispatch',
      icon: Workflow,
      detail: 'Dispatched calendar reservation API, dispatched SMS confirmation link',
      status: callState !== 'idle' ? 'completed' : 'pending'
    },
    {
      stage: 'outcome',
      label: '9. Outcome & Business Intelligence Loop',
      icon: CheckCircle,
      detail: 'Updated CRM customer memory, logged ROI metrics in Business Pulse',
      status: callState !== 'idle' ? 'completed' : 'pending'
    }
  ];

  const stepsToRender = reasoningSteps.length > 0 ? reasoningSteps : defaultSteps;

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Visual AI Reasoning Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            Real-time step-by-step neural reasoning flow demonstrating how VocalLabs OS transforms acoustic voice input into business actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Active Pipeline Execution Engine
          </span>
        </div>
      </div>

      {/* Reasoning Node Graph Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {stepsToRender.map((step, idx) => {
          const Icon = defaultSteps[idx]?.icon || Brain;
          const isCompleted = step.status === 'completed';
          const isProcessing = step.status === 'processing';

          return (
            <div
              key={idx}
              className={`relative glass-panel-interactive p-4 rounded-xl border transition-all duration-300 ${
                isCompleted 
                  ? 'border-cyan-500/40 bg-slate-900/80 shadow-lg shadow-cyan-500/10' 
                  : isProcessing
                  ? 'border-purple-500/60 bg-purple-950/30 animate-pulse'
                  : 'border-white/5 opacity-60'
              }`}
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center border border-cyan-500/30">
                  0{idx + 1}
                </span>

                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : isProcessing 
                    ? 'bg-purple-500/20 text-purple-300 animate-bounce'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? '✓ Done' : isProcessing ? 'Processing...' : 'Pending'}
                </span>
              </div>

              {/* Title & Icon */}
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isCompleted ? 'text-cyan-400' : 'text-slate-400'}`} />
                <h3 className="text-xs font-bold text-white truncate">
                  {step.label}
                </h3>
              </div>

              {/* Detail description */}
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {step.detail}
              </p>

              {/* Arrow Connector for larger screens */}
              {idx < stepsToRender.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ArrowDown className="w-4 h-4 text-cyan-400/50 -rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
