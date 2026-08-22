import React from 'react';
import { useOS } from '../context/OSContext';
import { User, Sparkles } from 'lucide-react';

export const CustomerContextPanel: React.FC = () => {
  const { customers, activeCustomer, selectCustomer } = useOS();

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            AI Customer Context & Memory Engine
          </h2>
          <p className="text-xs text-slate-400">
            Persistent context graph storing historical preferences, sentiment timeline, open issues, and predictive recommendations.
          </p>
        </div>

        <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
          DEMO DATA ONLY — LOCAL PRIVACY ENFORCED
        </span>
      </div>

      {/* Select Customer Profile Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {customers.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCustomer(c.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCustomer.id === c.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <span className="text-base">{c.avatar}</span>
            <span>{c.name} ({c.company})</span>
          </button>
        ))}
      </div>

      {/* Detailed Memory Profile Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 space-y-6">
        
        {/* Profile Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/15 flex items-center justify-center text-4xl shadow-inner">
              {activeCustomer.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">{activeCustomer.name}</h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  {activeCustomer.tier}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {activeCustomer.company} • Priority: <span className="text-amber-400 font-bold">{activeCustomer.priority}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              <span className="block text-[10px] uppercase">Interactions</span>
              <span className="text-white font-bold text-sm">{activeCustomer.previousInteractions} sessions</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase">Last Contact</span>
              <span className="text-white font-bold text-sm">{activeCustomer.lastInteraction}</span>
            </div>
          </div>
        </div>

        {/* Grid: Preferences | Sentiment History | Open Issues */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Known Preferences */}
          <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Known Customer Preferences</span>
            <ul className="text-xs space-y-1.5 text-slate-300 font-mono">
              {activeCustomer.knownPreferences.map((pref, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span> {pref}
                </li>
              ))}
            </ul>
          </div>

          {/* Sentiment History Timeline */}
          <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold">Sentiment History Timeline</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeCustomer.sentimentHistory.map((s, i) => (
                <span key={i} className={`text-[10px] font-mono px-2 py-1 rounded font-bold ${
                  s === 'Positive' || s === 'Delighted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  Session #{i+1}: {s}
                </span>
              ))}
            </div>
          </div>

          {/* Open Issues */}
          <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold">Open Tickets / Issues</span>
            <p className="text-xs text-slate-300 font-mono">
              {activeCustomer.openIssue ? activeCustomer.openIssue : '✓ Zero active open tickets.'}
            </p>
          </div>

        </div>

        {/* AI Predictive Recommendation Box */}
        <div className="glass-panel p-4 rounded-xl border-2 border-cyan-400/40 bg-cyan-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AI PREDICTIVE RECOMMENDATION ENGINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              HIGH CONFIDENCE (94%)
            </span>
          </div>

          <p className="text-sm font-semibold text-white leading-relaxed font-mono">
            "{activeCustomer.aiRecommendation}"
          </p>
        </div>

      </div>
    </div>
  );
};
