import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Mic, Play, TrendingUp, Network, 
  Sliders, Presentation, Search, Workflow 
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveTab, 
    startVoiceCall, 
    runBusinessSimulation,
    setIsPresentationMode,
    runCrossPlatformOrchestration,
    agents,
    selectAgent
  } = useOS();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const commands = [
    {
      id: 'cmd-orchestrate',
      label: 'Run Cross-Platform AI Orchestration (Goa Trip Simulation)',
      category: 'Orchestrator',
      icon: Workflow,
      action: () => {
        setIsCommandPaletteOpen(false);
        runCrossPlatformOrchestration();
      }
    },
    {
      id: 'cmd-ecosystem',
      label: 'Open AI Connected Ecosystem (22 Platform Agents)',
      category: 'Ecosystem',
      icon: Network,
      action: () => {
        setIsCommandPaletteOpen(false);
        setActiveTab('ecosystem');
      }
    },
    {
      id: 'cmd-voice',
      label: 'Start AI Voice Call',
      category: 'Action',
      icon: Mic,
      action: () => {
        setIsCommandPaletteOpen(false);
        startVoiceCall();
      }
    },
    {
      id: 'cmd-sim',
      label: 'Run 24-Hour Business Simulation',
      category: 'Action',
      icon: Play,
      action: () => {
        setIsCommandPaletteOpen(false);
        runBusinessSimulation();
      }
    },
    {
      id: 'cmd-judge',
      label: 'Open Hackathon Judge Presentation Mode',
      category: 'Navigation',
      icon: Presentation,
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsPresentationMode(true);
      }
    },
    {
      id: 'cmd-pulse',
      label: 'Open AI Business Pulse Analytics',
      category: 'Navigation',
      icon: TrendingUp,
      action: () => {
        setIsCommandPaletteOpen(false);
        setActiveTab('pulse');
      }
    },
    {
      id: 'cmd-digital-twin',
      label: 'View Partner Digital Twin Customer Journey',
      category: 'Navigation',
      icon: Network,
      action: () => {
        setIsCommandPaletteOpen(false);
        setActiveTab('digital_twin');
      }
    },
    {
      id: 'cmd-customizer',
      label: 'Configure AI Agent Personality & Rules',
      category: 'Navigation',
      icon: Sliders,
      action: () => {
        setIsCommandPaletteOpen(false);
        setActiveTab('agent_config');
      }
    }
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-cyan-500/40 shadow-2xl overflow-hidden bg-slate-900">
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search platform agents... (e.g. Orchestration, Goa, YouTube)"
            className="w-full bg-transparent text-sm text-white focus:outline-none font-mono placeholder:text-slate-500"
          />
          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
            ESC to close
          </span>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.map(cmd => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/10 group-hover:border-cyan-400/50">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
                      {cmd.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {cmd.category}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
                  Execute →
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Agent Select Bar */}
        <div className="p-3 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Quick Agent Switch:</span>
          <div className="flex items-center gap-1">
            {agents.map(a => (
              <button
                key={a.id}
                onClick={() => {
                  selectAgent(a.id);
                  setIsCommandPaletteOpen(false);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 text-[10px] border border-white/5 cursor-pointer"
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
