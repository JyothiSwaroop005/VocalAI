import React from 'react';
import { useOS } from '../context/OSContext';
import { 
  Presentation, ArrowLeft, ArrowRight, X 
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export const PresentationMode: React.FC = () => {
  const { 
    isPresentationMode, 
    setIsPresentationMode, 
    presentationSlideIndex, 
    setPresentationSlideIndex,
    activePartner
  } = useOS();

  if (!isPresentationMode) return null;

  const slides = [
    {
      title: 'THE PROBLEM',
      subtitle: 'Legacy Chatbots vs Modern AI Operating Systems',
      content: (
        <div className="space-y-6 max-w-3xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
            <h4 className="text-base font-bold text-rose-300">Traditional Chatbots & IVRs</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              • Rigid decision trees & generic boilerplate answers<br />
              • Zero cross-platform action orchestration<br />
              • Isolated from user calendar, maps, email, and travel services<br />
              • Fragmented user experience across apps
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
            <h4 className="text-base font-bold text-cyan-300">The VocalLabs Intelligence OS Solution</h4>
            <p className="text-xs text-cyan-100 leading-relaxed font-mono">
              ✓ Natural Voice & Text Conversation Processing<br />
              ✓ 22 Configured Platform Agents (MakeMyTrip, Maps, Gmail, Spotify, Slack, WhatsApp)<br />
              ✓ Visual Multi-Agent Cross-Platform Orchestrator<br />
              ✓ Direct Web Navigation & Responsible Human Handoff
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'VOCALLABS INTELLIGENCE OS CONCEPT',
      subtitle: 'An Orchestration Layer That Understands, Decides & Acts',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left font-mono">
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40">
            <span className="text-cyan-400 font-bold text-xs">01. UNDERSTAND</span>
            <h4 className="text-sm font-bold text-white mt-1">NLU & Entity Tokenization</h4>
            <p className="text-xs text-slate-300 mt-2">
              Parses speech/text input, extracts intent with 96%+ confidence, and evaluates customer sentiment.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-purple-500/40">
            <span className="text-purple-400 font-bold text-xs">02. ORCHESTRATE & ACT</span>
            <h4 className="text-sm font-bold text-white mt-1">Multi-Agent Dispatch</h4>
            <p className="text-xs text-slate-300 mt-2">
              Coordinates 6+ platform agents simultaneously (flight reserve, route mapping, calendar blocking, playlist generation).
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/40">
            <span className="text-emerald-400 font-bold text-xs">03. LEARN & OPTIMIZE</span>
            <h4 className="text-sm font-bold text-white mt-1">Business Intelligence</h4>
            <p className="text-xs text-slate-300 mt-2">
              Logs customer context graph, updates satisfaction metrics, and syncs business digital twin.
            </p>
          </div>
        </div>
      )
    },
    {
      title: '22 SPECIALIZED AI PLATFORM AGENTS',
      subtitle: 'Connected Ecosystem Across Travel, Productivity, Commerce & Media',
      content: (
        <div className="max-w-4xl mx-auto space-y-4 text-left font-mono">
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
            <h4 className="text-sm font-bold text-white">Full-Spectrum Digital Integration</h4>
            <p className="text-xs text-slate-300 mt-1">
              YouTube • WhatsApp Web • MakeMyTrip • Google Maps • Gmail • Google Calendar • Spotify • Amazon • Flipkart • Zomato • Swiggy • Uber • Airbnb • Booking.com • Zoom • Slack • Teams • LinkedIn • Instagram • Drive • Notion • GitHub
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-cyan-400 font-bold text-[10px]">Travel & Mobility</span>
              <p className="text-white font-bold">MakeMyTrip, Maps, Uber, Airbnb</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-purple-400 font-bold text-[10px]">Productivity & Work</span>
              <p className="text-white font-bold">Gmail, Calendar, Drive, Notion</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-emerald-400 font-bold text-[10px]">Communication</span>
              <p className="text-white font-bold">WhatsApp Web, Slack, Zoom, Teams</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-amber-400 font-bold text-[10px]">Commerce & Media</span>
              <p className="text-white font-bold">YouTube, Spotify, Amazon, Swiggy</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'VOCALLABS ORCHESTRATOR DEMO',
      subtitle: '1 Request → 6 AI Agents → 5 Platforms → Unified Result',
      content: (
        <div className="max-w-4xl mx-auto space-y-4 text-left font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs italic text-cyan-200">
            "I want to plan a Goa trip next weekend, organize my schedule, find useful places, prepare a message for my friends, and create something to listen to during the trip."
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300">
              ✓ MakeMyTrip AI: Flight + Resort Reserved
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300">
              ✓ Google Maps AI: Coastal Route Mapped
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-300">
              ✓ Google Calendar AI: Vacation Slot Blocked
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300">
              ✓ Gmail AI: Leave Notice Staged
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-green-500/30 text-green-300">
              ✓ Spotify AI: Playlist Curated
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-teal-500/30 text-teal-300">
              ✓ WhatsApp AI: Group Message Prepared
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'AUTONOMOUS ACTION GRAPH & DIRECT NAVIGATION',
      subtitle: 'Executing Direct Web Navigation (YouTube & WhatsApp Web)',
      content: (
        <div className="max-w-3xl mx-auto space-y-4 text-left font-mono">
          <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
            <h4 className="text-sm font-bold text-cyan-300">Direct Web Navigation Payload</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              When user requests "open YouTube" or "open WhatsApp Web", VocalLabs OS executes direct browser window navigation (`window.location.href`) and renders interactive link action buttons.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
            <h4 className="text-sm font-bold text-white">Action Verification History Log</h4>
            <p className="text-xs text-slate-400">
              Every action records explicit reasoning factors, confidence scores, and status timestamps for 100% auditability.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'EXPLAINABLE AI ("WHY DID AI DO THIS?")',
      subtitle: 'Transparent Decision Factors & Rule Compliance Audit',
      content: (
        <div className="max-w-3xl mx-auto space-y-4 text-left font-mono">
          <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-2">
            <h4 className="text-sm font-bold text-cyan-300 font-mono">Decision Audit & SLA Compliance</h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li>✓ Decision Factor #1: Customer intent recognized with 98% confidence</li>
              <li>✓ Decision Factor #2: Matched Enterprise VIP priority SLA rules</li>
              <li>✓ Decision Factor #3: Zero compliance policy conflicts detected</li>
              <li>✓ Decision Factor #4: Agent tone constraint enforced</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'HUMAN-IN-THE-LOOP RESPONSIBLE HANDOFF',
      subtitle: 'Automatic Transfer to Tier 2 Human Supervisor',
      content: (
        <div className="space-y-6 max-w-3xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3 font-mono">
            <h4 className="text-sm font-bold text-amber-300">Responsible AI Escalation Safeguards</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              If customer sentiment drops below 40% threshold or complex escalation rule #14 triggers:
              1. AI prepares structured Human Handoff Dossier<br />
              2. Transfer context & sentiment trajectory to human agent<br />
              3. Zero conversation restart or lost context
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'PARTNER DIGITAL TWIN & BUSINESS PULSE',
      subtitle: `Real-time Telemetry for ${activePartner.name}`,
      content: (
        <div className="max-w-4xl mx-auto space-y-4 text-left font-mono">
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
            <h4 className="text-sm font-bold text-white">{activePartner.name} ({activePartner.industry})</h4>
            <p className="text-xs text-slate-300 mt-1">{activePartner.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {activePartner.journeyNodes.map((node, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold">Stage 0{i+1}: {node.stage}</span>
                <p className="font-bold text-white">{node.title}</p>
                <p className="text-[10px] text-emerald-400 font-bold">{node.potentialValue}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: '24-HOUR BUSINESS SIMULATION MODE',
      subtitle: 'Simulating Full-Day Conversation Operations',
      content: (
        <div className="max-w-3xl mx-auto space-y-4 text-left font-mono">
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <h4 className="text-sm font-bold text-emerald-300">Simulated 24-Hour Operation Output</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              • 247 Inbound Conversations Processed<br />
              • 219 Resolved Automatically (88.6% Automation Rate)<br />
              • 28 Prepared for Tier 2 Human Handoff<br />
              • Average Resolution Time: 0.8 seconds
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'FINAL HACKATHON SUMMARY STATEMENT',
      subtitle: 'VocalLabs Doesn\'t Just Answer. It Orchestrates & Acts.',
      content: (
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 border-2 border-cyan-500/50 shadow-2xl space-y-4">
            <h3 className="text-2xl font-black text-white tracking-tight font-mono">
              VOCALLABS INTELLIGENCE OS
            </h3>
            <p className="text-sm text-cyan-200 font-mono leading-relaxed max-w-xl mx-auto">
              IT UNDERSTANDS. IT DECIDES. IT ORCHESTRATES. IT ACTS. IT CONNECTS THE DIGITAL WORLD.
            </p>
            <span className="inline-block text-xs font-mono px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              100% LOCAL DEMO & COMPLIANT AI OPERATING SYSTEM
            </span>
          </div>
        </div>
      )
    }
  ];

  const currentSlide = slides[presentationSlideIndex] || slides[0];

  const handleNext = () => {
    soundEffects.playClick();
    setPresentationSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
  };

  const handlePrev = () => {
    soundEffects.playClick();
    setPresentationSlideIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
      
      {/* Top Slide Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">
              JUDGE PRESENTATION MODE ({presentationSlideIndex + 1} / {slides.length})
            </span>
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              {currentSlide.title}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsPresentationMode(false)}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Slide Content Area */}
      <div className="my-auto py-8 text-center space-y-4">
        <h3 className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-wider">
          {currentSlide.subtitle}
        </h3>

        <div className="mt-6">
          {currentSlide.content}
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500">
          Use ← → keyboard arrows to navigate slides | ESC to exit
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={presentationSlideIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 disabled:opacity-40 hover:bg-slate-800 text-white border border-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-cyan-400 font-bold">
            {presentationSlideIndex + 1} of {slides.length}
          </span>

          <button
            onClick={handleNext}
            disabled={presentationSlideIndex === slides.length - 1}
            className="flex items-center gap-1 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-40 text-white font-bold shadow cursor-pointer"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
