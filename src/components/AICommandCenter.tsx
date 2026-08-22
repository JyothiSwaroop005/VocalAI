import React, { useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Sparkles, Mic, Activity, CheckCircle2, 
  Brain, Workflow, Users, Network, TrendingUp, Sliders, 
  ArrowRight, HelpCircle 
} from 'lucide-react';

export const AICommandCenter: React.FC = () => {
  const { 
    user,
    timeOfDayGreeting,
    activeAgent, 
    callState, 
    startVoiceCall, 
    endVoiceCall, 
    latestResult, 
    activeTab, 
    setActiveTab,
    openExplainability,
    actionHistory
  } = useOS();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated canvas neural core rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 65;

      rotation += 0.015;
      pulse += 0.04;
      const currentPulse = Math.sin(pulse) * 6;

      // Outer glow circle
      const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius + 40);
      gradient.addColorStop(0, callState === 'listening' ? 'rgba(0, 242, 254, 0.4)' : callState === 'processing' ? 'rgba(112, 0, 255, 0.5)' : 'rgba(0, 242, 254, 0.2)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 35 + currentPulse, 0, Math.PI * 2);
      ctx.fill();

      // Orbital Rings
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 3);
        
        ctx.beginPath();
        ctx.ellipse(0, 0, radius + i * 14 + currentPulse / 2, (radius + i * 14) * 0.4, rotation, 0, Math.PI * 2);
        ctx.strokeStyle = i === 0 ? 'rgba(0, 242, 254, 0.6)' : i === 1 ? 'rgba(168, 85, 247, 0.5)' : 'rgba(52, 211, 153, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Orbital particle nodes
        const px = Math.cos(rotation * 2 + i) * (radius + i * 14);
        const py = Math.sin(rotation * 2 + i) * ((radius + i * 14) * 0.4);
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [callState]);

  const currentIntent = latestResult?.intent || 'Appointment Booking';
  const currentConfidence = latestResult?.confidence || 96;
  const currentSentiment = latestResult?.sentiment || 'Positive';
  const currentPriority = latestResult?.priority || 'Medium';

  return (
    <section className="w-full glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden bg-slate-950/70 shadow-2xl">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Personalized Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-white/15 shadow">
            {user ? user.avatar : activeAgent.avatar}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight font-mono">
                {timeOfDayGreeting}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 font-bold">
                {user ? user.tier : 'Enterprise VIP'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Agent {activeAgent.name} ({activeAgent.role}) ready. What can I take care of for you today?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {callState === 'idle' || callState === 'completed' ? (
            <button
              onClick={startVoiceCall}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-white animate-pulse" />
              START AI CONVERSATION
            </button>
          ) : (
            <button
              onClick={endVoiceCall}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-white" />
              END CONVERSATION
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Intelligence Metrics */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-white/10 pb-2 flex justify-between">
            <span>REAL-TIME NLU TELEMETRY</span>
            <span className="text-cyan-400">LIVE OS STREAM</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="glass-panel p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] font-mono">DETECTED INTENT</span>
              <span className="font-bold text-white font-mono truncate block mt-0.5">{currentIntent}</span>
            </div>

            <div className="glass-panel p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] font-mono">CONFIDENCE SCORE</span>
              <span className="font-bold text-cyan-400 font-mono text-sm block mt-0.5">{currentConfidence}%</span>
            </div>

            <div className="glass-panel p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] font-mono">SENTIMENT SCORE</span>
              <span className="font-bold text-emerald-400 font-mono text-sm block mt-0.5">{currentSentiment}</span>
            </div>

            <div className="glass-panel p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] font-mono">PRIORITY LEVEL</span>
              <span className="font-bold text-amber-400 font-mono text-sm block mt-0.5">{currentPriority}</span>
            </div>
          </div>
        </div>

        {/* Center Animated Intelligence Neural Orb */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-52 h-52 flex items-center justify-center">
            
            {/* Canvas Animated Rings */}
            <canvas 
              ref={canvasRef} 
              width={220} 
              height={220} 
              className="absolute inset-0 pointer-events-none"
            />

            {/* Overlay Center Status */}
            <div className="relative z-10 text-center pointer-events-none">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-900/80 border border-cyan-400/50 flex items-center justify-center mb-1 shadow-lg">
                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                {callState === 'listening' ? 'LISTENING...' : callState === 'processing' ? 'REASONING...' : callState === 'speaking' ? 'SPEAKING...' : 'AI CORE ONLINE'}
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">
                {callState === 'idle' ? 'Ready for Call' : 'Processing Neural Graph'}
              </span>
            </div>
          </div>

          {/* Reasoning Pipeline Quick Flow */}
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span className={callState === 'listening' ? 'text-cyan-400 font-bold' : ''}>Listening</span>
            <span>→</span>
            <span className={callState === 'processing' ? 'text-purple-400 font-bold' : ''}>Understanding</span>
            <span>→</span>
            <span className={callState === 'speaking' ? 'text-emerald-400 font-bold' : ''}>Acting</span>
            <span>→</span>
            <span>Learning</span>
          </div>
        </div>

        {/* Right Recommended Action & Explainability */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>RECOMMENDED AI ACTION</span>
            <span className="text-purple-400">AUTONOMOUS</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-purple-500/30 space-y-2 bg-gradient-to-br from-slate-900/90 to-purple-950/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Schedule Clinic Appointment
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Book consultation slot for Thursday 2:30 PM with Dr. Aris Thorne. Auto-sync EHR and send SMS calendar confirmation.
            </p>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              {actionHistory.length > 0 && (
                <button
                  onClick={() => openExplainability(actionHistory[0])}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  WHY DID AI DO THIS?
                </button>
              )}

              <button
                onClick={() => setActiveTab('actions')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
              >
                Inspect Graph <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* OS Navigation Tabs */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'command_center', label: 'AI Command Center', icon: Activity },
          { id: 'orchestrator', label: 'VocalLabs Orchestrator', icon: Workflow },
          { id: 'ecosystem', label: '22 Connected Platform Agents', icon: Network },
          { id: 'brain', label: 'AI Brain Pipeline', icon: Brain },
          { id: 'voice', label: 'Voice Experience', icon: Mic },
          { id: 'actions', label: 'Action Graph', icon: Workflow },
          { id: 'multi_agent', label: 'Multi-Agent Hub', icon: Users },
          { id: 'digital_twin', label: 'Digital Twin Map', icon: Network },
          { id: 'pulse', label: 'Business Pulse', icon: TrendingUp },
          { id: 'agent_config', label: 'Agent Customizer', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </section>
  );
};
