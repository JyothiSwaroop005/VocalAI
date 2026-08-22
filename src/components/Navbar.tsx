import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Cpu, Sparkles, Volume2, VolumeX, 
  Presentation, Command, ChevronDown, Workflow, LogOut 
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export const Navbar: React.FC = () => {
  const { 
    user,
    logout,
    activeAgent, 
    partners, 
    activePartner, 
    selectPartner,
    triggerWowDemo,
    setIsPresentationMode,
    setIsCommandPaletteOpen,
    runCrossPlatformOrchestration,
    isOrchestrationActive
  } = useOS();

  const [soundOn, setSoundOn] = useState(true);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEffects.setMuted(!next);
  };

  return (
    <header className="w-full glass-panel border-b border-white/10 sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1px] flex items-center justify-center glow-cyan shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white font-mono">
                  VOCALLABS
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 font-mono">
                  INTELLIGENCE OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
                Multi-Platform AI Business Conversation Operating System
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

          {/* Live OS Pulse Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-400 font-mono">
              Live OS Engine ● {activeAgent.name} Active
            </span>
          </div>
        </div>

        {/* Center Partner Digital Twin Selector */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium font-mono">Partner Ecosystem:</span>
          <div className="relative group">
            <select
              value={activePartner.id}
              onChange={(e) => {
                soundEffects.playClick();
                selectPartner(e.target.value);
              }}
              className="bg-slate-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/15 focus:outline-none focus:border-cyan-400 cursor-pointer appearance-none pr-8 hover:bg-slate-800 transition-colors font-mono"
            >
              {partners.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.logo} {p.name} ({p.industry})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right CTA Action Buttons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* User Profile Badge & Logout */}
          {user && (
            <div className="flex items-center gap-2 pr-2 border-r border-white/10">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/15">
                <span className="text-sm">{user.avatar}</span>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight font-mono">{user.name}</span>
                  <span className="text-[9px] text-cyan-400 font-mono block leading-none">{user.tier}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  logout();
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 border border-white/15 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Sign Out of VocalLabs OS"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cross-Platform Orchestrator Primary Button */}
          <button
            onClick={() => {
              soundEffects.playSuccess();
              runCrossPlatformOrchestration();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white text-xs font-black shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer font-mono"
          >
            <Workflow className={`w-3.5 h-3.5 text-cyan-200 ${isOrchestrationActive ? 'animate-spin' : ''}`} />
            <span>RUN AI ORCHESTRATION</span>
          </button>
          
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={soundOn ? 'Audio FX Enabled' : 'Audio FX Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* WOW Showcase Button */}
          <button
            onClick={() => {
              soundEffects.playSuccess();
              triggerWowDemo();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/15 transition-all active:scale-95 cursor-pointer font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>VOCALLABS DEMO</span>
          </button>

          {/* Presentation Mode */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsPresentationMode(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors cursor-pointer font-mono"
            title="Hackathon Presentation Mode for Judges"
          >
            <Presentation className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">JUDGE MODE</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsCommandPaletteOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            title="Command Palette (⌘K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="hidden md:inline">⌘K</span>
          </button>
        </div>
      </div>
    </header>
  );
};
