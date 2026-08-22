import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { INTEGRATIONS_REGISTRY } from '../data/ecosystemData';
import type { IntegrationCategory } from '../types';
import { Network, Search, Sparkles, Play } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export const ConnectedEcosystem: React.FC = () => {
  const { openIntegrationDetail, runCrossPlatformOrchestration } = useOS();

  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: IntegrationCategory[] = [
    'All',
    'Communication',
    'Travel',
    'Productivity',
    'Shopping',
    'Food',
    'Entertainment',
    'Development',
    'Career',
    'Meetings'
  ];

  const filteredIntegrations = INTEGRATIONS_REGISTRY.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              AI Connected Ecosystem
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              22 Specialized AI Agents
            </span>
          </div>
          <p className="text-xs text-slate-300">
            VocalLabs AI Orchestration Layer integrating multi-platform agents across travel, productivity, communication, and commerce.
          </p>
        </div>

        {/* Global Cross-Platform Orchestrator Trigger Button */}
        <button
          onClick={() => {
            soundEffects.playSuccess();
            runCrossPlatformOrchestration();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>RUN AI ORCHESTRATION</span>
        </button>
      </div>

      {/* Controls: Search Input & Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 22 integrations..."
            className="w-full bg-slate-900 text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Grid of 22 Platform Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIntegrations.map((item) => {
          const isConnected = item.status === 'CONNECTED';

          return (
            <div
              key={item.id}
              className={`glass-panel p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:-translate-y-1 ${
                isConnected 
                  ? 'border-emerald-500/40 bg-slate-900/90 shadow-lg shadow-emerald-500/10' 
                  : 'border-white/10 hover:border-cyan-500/40 bg-slate-950/70 hover:bg-slate-900/80'
              }`}
            >
              {/* Card Header: Logo, Platform & Agent Name */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-white/10 shadow">
                      {item.logo}
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                        {item.agentName}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    item.status === 'CONNECTED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : item.status === 'AVAILABLE'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono line-clamp-2 my-2">
                  {item.description}
                </p>

                {/* Capabilities Pills */}
                <div className="flex flex-wrap gap-1 my-2">
                  {item.capabilities.slice(0, 3).map((cap, i) => (
                    <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/5">
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    openIntegrationDetail(item);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Explore AI</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    openIntegrationDetail(item);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-xs font-bold text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Simulate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
