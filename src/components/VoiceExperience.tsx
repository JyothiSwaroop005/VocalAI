import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { SAMPLE_PROMPTS } from '../services/aiReasoningEngine';
import { MusicPlayerWidget } from './MusicPlayerWidget';
import { 
  Mic, MicOff, Volume2, Sparkles, CheckCircle2, 
  Send, Cpu, ExternalLink, XCircle, Clock, Zap,
  Music, Map, Mail, ShoppingBag, Plane, MessageSquare,
  Globe, AlertTriangle, Activity, Terminal
} from 'lucide-react';
import { voiceEngine, type VoiceDiagnosticState } from '../services/voiceEngine';
import type { TranscriptMessage } from '../types';

// ── Service icon helper ──────────────────────────────────────────────────────
function ServiceBadge({ intent, serviceName }: { intent?: string; serviceName?: string }) {
  if (!intent && !serviceName) return null;
  const s = (serviceName || '').toLowerCase();
  const i = (intent || '').toLowerCase();
  let icon = <Globe className="w-3 h-3" />;
  let label = serviceName || 'General';
  let color = 'text-slate-400 border-slate-700';

  if (s.includes('youtube') || i.includes('music') || i.includes('playback')) {
    icon = <Music className="w-3 h-3" />; label = serviceName || 'YouTube'; color = 'text-purple-400 border-purple-700 bg-purple-950/30';
  } else if (s.includes('maps') || i.includes('maps') || i.includes('direction')) {
    icon = <Map className="w-3 h-3" />; label = serviceName || 'Google Maps'; color = 'text-emerald-400 border-emerald-700 bg-emerald-950/30';
  } else if (s.includes('gmail') || i.includes('gmail') || i.includes('email')) {
    icon = <Mail className="w-3 h-3" />; label = serviceName || 'Gmail'; color = 'text-red-400 border-red-700 bg-red-950/30';
  } else if (s.includes('amazon') || i.includes('shopping') || i.includes('product')) {
    icon = <ShoppingBag className="w-3 h-3" />; label = serviceName || 'Amazon'; color = 'text-amber-400 border-amber-700 bg-amber-950/30';
  } else if (s.includes('flight') || s.includes('booking') || i.includes('travel')) {
    icon = <Plane className="w-3 h-3" />; label = serviceName || 'Travel'; color = 'text-sky-400 border-sky-700 bg-sky-950/30';
  } else if (s.includes('whatsapp') || i.includes('message')) {
    icon = <MessageSquare className="w-3 h-3" />; label = serviceName || 'WhatsApp'; color = 'text-green-400 border-green-700 bg-green-950/30';
  } else {
    icon = <Globe className="w-3 h-3" />; label = serviceName || 'Web App'; color = 'text-cyan-400 border-cyan-700 bg-cyan-950/30';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold font-mono ${color}`}>
      {icon}
      {label}
    </span>
  );
}

// ── Execution type badge ─────────────────────────────────────────────────────
function ExecTypeBadge({ label }: { label: string }) {
  const lower = label.toLowerCase();
  if (lower.includes('direct') || lower.includes('in-app')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
        <Zap className="w-2.5 h-2.5" /> DIRECT EXECUTION
      </span>
    );
  }
  if (lower.includes('external')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold">
        <ExternalLink className="w-2.5 h-2.5" /> EXTERNAL REDIRECT
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-bold">
      <XCircle className="w-2.5 h-2.5" /> NOT EXECUTED
    </span>
  );
}

// ── Per-message action workflow display ──────────────────────────────────────
function ActionWorkflowCard({ msg }: { msg: TranscriptMessage }) {
  if (!msg.intent && !msg.externalUrl && !msg.musicResolution && !msg.musicPayload) return null;

  const steps = msg.gatewayResult?.steps || [];
  const hasSteps = steps.length > 0;
  const execType = msg.musicResolution?.success
    ? 'Direct Execution'
    : msg.externalUrl
    ? 'External Redirect'
    : 'Not Executed';

  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
      {/* Execution type */}
      <div className="flex items-center gap-2 flex-wrap">
        <ExecTypeBadge label={execType} />
        {msg.intent && (
          <span className="text-[9px] text-slate-400 font-mono">Service Router Active</span>
        )}
      </div>

      {/* Action steps */}
      {hasSteps && (
        <div className="space-y-1">
          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">EXECUTION PIPELINE</p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] font-mono">
              {step.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />}
              {step.status === 'failed' && <XCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />}
              {step.status === 'skipped' && <Clock className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />}
              <div className="min-w-0">
                <span className={
                  step.status === 'completed' ? 'text-emerald-300 font-bold' :
                  step.status === 'failed' ? 'text-rose-300 font-bold' :
                  'text-slate-500'
                }>{step.label}</span>
                <p className="text-slate-400 text-[9px] truncate">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Intent / Confidence footer */}
      {msg.intent && (
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-white/5">
          <span>Intent: <span className="text-cyan-400">{msg.intent}</span></span>
          {msg.confidence && <span>Confidence: <span className="text-cyan-400">{msg.confidence}%</span></span>}
        </div>
      )}
    </div>
  );
}

// ── Main VoiceExperience Component ───────────────────────────────────────────
export const VoiceExperience: React.FC = () => {
  const { 
    activeAgent, 
    activeCustomer, 
    callState, 
    startVoiceCall, 
    endVoiceCall, 
    enableMicrophone,
    transcript, 
    processUserInput, 
    latestResult
  } = useOS();

  const [inputVal, setInputVal] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [diag, setDiag] = useState<VoiceDiagnosticState>(() => voiceEngine.getDiagnostics());
  const [micButtonState, setMicButtonState] = useState<'idle' | 'requesting' | 'error'>('idle');
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Poll diagnostics every 300ms for live UI state
  useEffect(() => {
    const interval = setInterval(() => {
      setDiag(voiceEngine.getDiagnostics());
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleEnableMicrophone = async () => {
    console.log('[VOICE] Enable Microphone button clicked.');
    setMicButtonState('requesting');
    setMicErrorMsg(null);
    try {
      await enableMicrophone();
      setMicButtonState('idle');
    } catch (err: any) {
      console.error('[VOICE ERROR] enableMicrophone threw:', err);
      setMicButtonState('error');
      setMicErrorMsg(err?.message || 'Unknown error requesting microphone.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    processUserInput(inputVal);
    setInputVal('');
  };

  const currentIntent = latestResult?.intent || '—';
  const currentConfidence = latestResult?.confidence || null;
  const currentSentiment = latestResult?.sentiment || '—';
  const currentPriority = latestResult?.priority || '—';

  // Derive service from intent or latestResult
  const getService = (intent: string) => {
    if (latestResult?.serviceName) return latestResult.serviceName;
    const l = intent.toLowerCase();
    if (l.includes('music') || l.includes('playback') || l.includes('control')) return 'YouTube IFrame API';
    if (l.includes('maps') || l.includes('direction')) return 'Google Maps';
    if (l.includes('gmail') || l.includes('email')) return 'Gmail Web';
    if (l.includes('shopping') || l.includes('product')) return 'Amazon';
    if (l.includes('flight') || l.includes('hotel') || l.includes('travel')) return 'Google Flights';
    if (l.includes('message') || l.includes('whatsapp')) return 'WhatsApp Web';
    return 'Browser Redirect';
  };

  const currentService = latestResult?.serviceName || (currentIntent !== '—' ? getService(currentIntent) : '—');

  // Derive execution type for live stream
  const getExecType = () => {
    if (!latestResult) return '—';
    if (latestResult.musicResolution?.success) return '● Direct (In-App Player)';
    if (latestResult.externalUrl) return '● External Redirect';
    if (latestResult.musicResolution && !latestResult.musicResolution.success) return '✗ Not Executed';
    return '● Completed';
  };

  const getVerificationStatus = () => {
    if (!latestResult) return '—';
    if (latestResult.musicResolution?.success) return '✓ Verified (Exact Match)';
    if (latestResult.musicResolution && !latestResult.musicResolution.success) return '✗ Verification Failed';
    if (latestResult.externalUrl) return '— Not Applicable (External)';
    return '— Not Applicable';
  };

  // Category filters
  const categories = ['All', ...Array.from(new Set(SAMPLE_PROMPTS.map(p => p.category)))];
  const filteredPrompts = activeCategoryFilter === 'All'
    ? SAMPLE_PROMPTS
    : SAMPLE_PROMPTS.filter(p => p.category === activeCategoryFilter);

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            AI Action Gateway — Live Intelligence Stream
          </h2>
          <p className="text-xs text-slate-400">
            Real-time intent routing, service dispatch, verification & execution. Every action is tracked end-to-end.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Not yet granted mic — show ENABLE button for all non-granted states */}
          {diag.micPermission !== 'MIC_PERMISSION_GRANTED' && diag.micPermission !== 'MIC_REQUESTING' ? (
            <div className="flex flex-col items-end gap-1.5">
              <button
                id="enable-microphone-btn"
                onClick={handleEnableMicrophone}
                disabled={micButtonState === 'requesting'}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer font-mono disabled:opacity-60 disabled:cursor-wait disabled:animate-none
                  ${diag.micPermission === 'MIC_PERMISSION_DENIED' || diag.micPermission === 'MIC_IN_USE'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/20 hover:scale-[1.02] active:scale-95 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/20 hover:scale-[1.02] active:scale-95 animate-pulse'
                  }`}
              >
                <Mic className="w-4 h-4 text-white" />
                {micButtonState === 'requesting'
                  ? '🎙 REQUESTING MICROPHONE...'
                  : diag.micPermission === 'MIC_PERMISSION_DENIED'
                  ? '🔒 MICROPHONE DENIED — RETRY'
                  : diag.micPermission === 'MIC_IN_USE'
                  ? '⚠ MIC IN USE — RETRY'
                  : '🎙 ENABLE MICROPHONE ACCESS'}
              </button>
              {/* Show error context */}
              {(diag.micErrorMessage || micErrorMsg) && (
                <p className="text-[10px] text-rose-400 font-mono max-w-[280px] text-right leading-relaxed">
                  {diag.micErrorMessage || micErrorMsg}
                </p>
              )}
              {diag.micPermission === 'MIC_PERMISSION_REQUIRED' && !diag.micErrorMessage && (
                <p className="text-[10px] text-amber-400/80 font-mono text-right">
                  Click to allow microphone access for Nova
                </p>
              )}
            </div>
          ) : diag.micPermission === 'MIC_REQUESTING' ? (
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs opacity-70 cursor-wait font-mono"
            >
              <Mic className="w-4 h-4 text-white animate-pulse" />
              🎙 REQUESTING MICROPHONE...
            </button>
          ) : callState === 'idle' || callState === 'completed' ? (
            <button
              id="start-voice-call-btn"
              onClick={startVoiceCall}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer font-mono"
            >
              <Mic className="w-4 h-4 text-white animate-pulse" />
              ● NOVA LISTENING
            </button>
          ) : (
            <button
              id="stop-voice-call-btn"
              onClick={endVoiceCall}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer font-mono"
            >
              <MicOff className="w-4 h-4 text-white" />
              STOP VOICE CALL
            </button>
          )}
        </div>

      </div>

      {/* Category Filters + Preset Prompts */}
      <div className="glass-panel p-3 rounded-xl border border-cyan-500/20 bg-slate-900/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            INTERACTIVE JUDGE TEST PROMPTS — Click to Simulate
          </span>
          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono border transition-all cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                    : 'bg-slate-800 border-white/10 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => processUserInput(prompt.text)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/80 text-xs text-slate-200 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-1.5 font-mono"
            >
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Orb + Telemetry | Right Live Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Voice Orb & Live Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Animated Voice Orb Visualizer Box */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center relative overflow-hidden bg-slate-950/80">
            <div className="relative w-36 h-36 flex items-center justify-center my-2">
              
              {/* Outer Ripple Rings */}
              {callState === 'listening' || callState === 'speaking' ? (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
                  <div className="absolute inset-[-12px] rounded-full border border-purple-500/30 animate-pulse" />
                </>
              ) : null}

              {/* Glowing Orb Center */}
              <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                callState === 'listening'
                  ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 glow-cyan animate-pulse'
                  : callState === 'processing'
                  ? 'bg-gradient-to-tr from-purple-500 to-indigo-600 glow-purple animate-spin-slow'
                  : callState === 'speaking'
                  ? 'bg-gradient-to-tr from-emerald-400 to-teal-600 shadow-emerald-500/50 animate-bounce'
                  : 'bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/20'
              }`}>
                <Cpu className="w-10 h-10 text-white" />
              </div>
            </div>

            <span className={`text-xs font-mono uppercase tracking-wider font-bold mt-2 flex items-center gap-1.5 justify-center ${
              diag.micPermission === 'MIC_PERMISSION_DENIED' ? 'text-rose-400' :
              callState === 'listening' ? 'text-emerald-400' :
              callState === 'processing' ? 'text-amber-400' :
              callState === 'speaking' ? 'text-sky-400' :
              'text-emerald-400'
            }`}>
              {diag.micPermission === 'MIC_PERMISSION_DENIED' ? '🔴 MICROPHONE ACCESS DENIED' :
               callState === 'calling' ? '⚡ WAKE WORD DETECTED ("Hey Nova")' :
               callState === 'listening' ? '🟢 NOVA LISTENING ("Listening for your command...")' :
               callState === 'processing' ? '🟡 NOVA PROCESSING' :
               callState === 'speaking' ? '🔵 NOVA SPEAKING' :
               '🟢 MICROPHONE ACTIVE — LISTENING ("Hey Nova")'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Hands-Free Agent {activeAgent.name} ({activeAgent.tone} Tone)
            </span>
          </div>

          {/* REAL Live Intelligence Stream */}
          <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              LIVE INTELLIGENCE STREAM
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Intent:</span>
                <span className="font-bold text-white text-right max-w-[55%] truncate">{currentIntent}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Service Router:</span>
                <span className="font-bold text-purple-300 text-right max-w-[55%] truncate">{currentService}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Confidence:</span>
                <span className={`font-bold ${currentConfidence ? (currentConfidence > 90 ? 'text-emerald-400' : currentConfidence > 70 ? 'text-amber-400' : 'text-rose-400') : 'text-slate-500'}`}>
                  {currentConfidence ? `${currentConfidence}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Sentiment:</span>
                <span className={`font-bold ${currentSentiment === 'Positive' ? 'text-emerald-400' : currentSentiment === 'Frustrated' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {currentSentiment}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Priority:</span>
                <span className="font-bold text-amber-400">{currentPriority}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Verification:</span>
                <span className={`font-bold text-right max-w-[55%] text-[10px] ${
                  getVerificationStatus().startsWith('✓') ? 'text-emerald-400' :
                  getVerificationStatus().startsWith('✗') ? 'text-rose-400' :
                  'text-slate-400'
                }`}>{getVerificationStatus()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Execution:</span>
                <span className={`font-bold text-right max-w-[55%] text-[10px] ${
                  getExecType().includes('Direct') ? 'text-cyan-400' :
                  getExecType().includes('External') ? 'text-amber-400' :
                  getExecType().includes('✗') ? 'text-rose-400' :
                  'text-emerald-400'
                }`}>{getExecType()}</span>
              </div>
            </div>
          </div>

          {/* Real Action Workflow Execution (from latest result reasoning factors) */}
          <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              ACTION WORKFLOW EXECUTION
            </span>
            {latestResult ? (
              <ul className="text-[10px] space-y-1.5 text-slate-300 font-mono">
                {latestResult.reasoningSteps.slice(0, 5).map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={step.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'}>
                      {step.status === 'completed' ? '✓' : '○'}
                    </span>
                    <div className="min-w-0">
                      <span className={step.status === 'completed' ? 'text-slate-200' : 'text-slate-500'}>{step.label}</span>
                      <p className="text-slate-500 text-[9px] truncate">{step.detail.slice(0, 60)}{step.detail.length > 60 ? '…' : ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="text-xs space-y-1.5 text-slate-500 font-mono">
                <li className="flex items-center gap-2"><span>○</span> Waiting for command...</li>
              </ul>
            )}
          </div>

          {/* Developer Diagnostics Panel (Requirement 17) */}
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 bg-slate-900/90 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                DEVELOPER DIAGNOSTICS & TELEMETRY
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                LIVE STATE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-slate-950/60 p-2 rounded border border-white/5 space-y-0.5">
                <span className="text-slate-500 block">Browser API:</span>
                <span className="text-slate-200 font-bold">{diag.browser}</span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-white/5 space-y-0.5">
                <span className="text-slate-500 block">Microphone:</span>
                <span className={`font-bold ${
                  diag.micPermission === 'MIC_PERMISSION_GRANTED' ? 'text-emerald-400' :
                  diag.micPermission === 'MIC_PERMISSION_DENIED' ? 'text-rose-400' :
                  diag.micPermission === 'MIC_REQUESTING' ? 'text-yellow-400' :
                  diag.micPermission === 'MIC_IN_USE' ? 'text-orange-400' :
                  diag.micPermission === 'MIC_UNAVAILABLE' ? 'text-rose-400' :
                  'text-amber-400'
                }`}>
                  {diag.micPermission === 'MIC_PERMISSION_GRANTED' ? '● CONNECTED' :
                   diag.micPermission === 'MIC_PERMISSION_DENIED' ? '✖ BLOCKED' :
                   diag.micPermission === 'MIC_REQUESTING' ? '◌ REQUESTING' :
                   diag.micPermission === 'MIC_IN_USE' ? '⚠ IN USE' :
                   diag.micPermission === 'MIC_UNAVAILABLE' ? '✖ NOT FOUND' :
                   '● PERMISSION REQUIRED'}
                </span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-white/5 space-y-0.5">
                <span className="text-slate-500 block">SpeechRecognition:</span>
                <span className={diag.speechRecognitionSupported ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {diag.speechRecognitionSupported ? '✓ Supported' : '✖ Unsupported'}
                </span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-white/5 space-y-0.5">
                <span className="text-slate-500 block">SpeechSynthesis:</span>
                <span className={diag.speechSynthesisSupported ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {diag.speechSynthesisSupported ? '✓ Supported' : '✖ Unsupported'}
                </span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-white/5 space-y-0.5">
                <span className="text-slate-500 block">Recognition Loop:</span>
                <span className={`font-bold ${diag.recognitionState === 'Listening' ? 'text-emerald-400 animate-pulse' : 'text-cyan-300'}`}>
                  {diag.recognitionState === 'Listening' ? '● CONTINUOUS' : '○ IDLE'}
                </span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-white/5 space-y-0.5">
                <span className="text-slate-500 block">Nova Agent State:</span>
                <span className="text-purple-300 font-bold">{diag.novaState}</span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded border border-white/5 space-y-0.5 col-span-2">
                <span className="text-slate-500 block">Last Captured Command:</span>
                <span className="text-cyan-300 font-bold truncate block">{diag.lastFinalCommand || '— None yet'}</span>
              </div>
            </div>

            {/* Mic error message */}
            {diag.micErrorMessage && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-[10px] font-mono text-rose-200">
                <span className="text-rose-400 font-bold block mb-0.5">Microphone Error:</span>
                <p>{diag.micErrorMessage}</p>
              </div>
            )}

            {diag.currentInterimTranscript && (
              <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-[10px] font-mono text-amber-200">
                <span className="text-amber-400 font-bold block mb-0.5">Interim Speech:</span>
                <p className="italic font-mono animate-pulse">"{diag.currentInterimTranscript}"</p>
              </div>
            )}

            {diag.pendingActionType && (
              <div className="p-2 rounded bg-purple-950/40 border border-purple-500/30 text-[10px] font-mono text-purple-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-bounce" />
                <span>Pending Confirmation Context: <strong className="text-white underline">{diag.pendingActionType}</strong> (Say "Yes" or "Confirm")</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live Conversation Transcript */}
        <div className="lg:col-span-7 flex flex-col h-[600px] glass-panel rounded-2xl border border-white/10 overflow-hidden">
          
          {/* Transcript Header */}
          <div className="p-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              LIVE TRANSCRIPT & ACTION STREAM
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">{transcript.length} messages</span>
              {callState === 'processing' && (
                <span className="flex items-center gap-1 text-[10px] text-purple-400 font-mono animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  PROCESSING
                </span>
              )}
            </div>
          </div>

          {/* Transcript Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {transcript.map((msg) => {
              const isCustomer = msg.speaker === 'customer';
              const isSystem = msg.speaker === 'system';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 font-mono">
                    {msg.intent && !isCustomer && (
                      <ServiceBadge intent={msg.intent} serviceName={msg.serviceName} />
                    )}
                    <span>{isCustomer ? (activeCustomer.name) : isSystem ? 'SECURITY SYSTEM' : activeAgent.name}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed font-mono ${
                      isCustomer
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                        : isSystem
                        ? 'bg-rose-950/80 border border-rose-500/40 text-rose-200 rounded-tl-none'
                        : 'bg-slate-900 border border-white/15 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Exact Match Music Resolution Player */}
                    {(msg.musicResolution || msg.musicPayload) && (
                      <MusicPlayerWidget resolution={msg.musicResolution} payload={msg.musicPayload} />
                    )}

                    {/* External Link Action Button */}
                    {msg.externalUrl && !msg.musicResolution && !msg.musicPayload && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => window.open(msg.externalUrl, '_blank', 'noopener,noreferrer')}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:scale-105 text-white font-extrabold text-[11px] shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-white" />
                          <span>{msg.externalLabel || 'OPEN ACTION LINK ↗'}</span>
                        </button>
                        {/* Honest external label */}
                        <p className="text-[9px] text-amber-400/80 font-mono mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          External service — opens in a new browser tab
                        </p>
                      </div>
                    )}

                    {/* Action Workflow Steps for this message */}
                    <ActionWorkflowCard msg={msg} />
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Text Input Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type a command — 'Play Believer', 'Directions to LPU', 'Open Gmail'..."
              className="flex-1 bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400 font-mono placeholder:text-slate-600"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
