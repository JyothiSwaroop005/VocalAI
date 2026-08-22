import React from 'react';
import { OSProvider, useOS } from './context/OSContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { AICommandCenter } from './components/AICommandCenter';
import { AIBrainPipeline } from './components/AIBrainPipeline';
import { VoiceExperience } from './components/VoiceExperience';
import { AgentCustomizer } from './components/AgentCustomizer';
import { ActionGraph } from './components/ActionGraph';
import { MultiAgentSelector } from './components/MultiAgentSelector';
import { CustomerContextPanel } from './components/CustomerContextPanel';
import { DigitalTwinMap } from './components/DigitalTwinMap';
import { BusinessPulse } from './components/BusinessPulse';
import { ConnectedEcosystem } from './components/ConnectedEcosystem';
import { VocalLabsOrchestrator } from './components/VocalLabsOrchestrator';
import { IntegrationDetailModal } from './components/IntegrationDetailModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ExplainabilityModal } from './components/ExplainabilityModal';
import { HumanHandoffModal } from './components/HumanHandoffModal';
import { WowMomentModal } from './components/WowMomentModal';
import { CommandPalette } from './components/CommandPalette';
import { PresentationMode } from './components/PresentationMode';

const MainContent: React.FC = () => {
  const { user, activeTab } = useOS();

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* Visual Centerpiece: AI Command Center OS */}
        <AICommandCenter />

        {/* Dynamic OS Active Tab Content */}
        <div className="w-full">
          {activeTab === 'command_center' && (
            <div className="space-y-8">
              <VocalLabsOrchestrator />
              <ConnectedEcosystem />
              <AIBrainPipeline />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6">
                  <CustomerContextPanel />
                </div>
                <div className="lg:col-span-6">
                  <ActionGraph />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orchestrator' && <VocalLabsOrchestrator />}
          {activeTab === 'ecosystem' && <ConnectedEcosystem />}
          {activeTab === 'brain' && <AIBrainPipeline />}
          {activeTab === 'voice' && <VoiceExperience />}
          {activeTab === 'actions' && <ActionGraph />}
          {activeTab === 'multi_agent' && <MultiAgentSelector />}
          {activeTab === 'digital_twin' && <DigitalTwinMap />}
          {activeTab === 'pulse' && <BusinessPulse />}
          {activeTab === 'agent_config' && <AgentCustomizer />}
        </div>

        {/* Global Modals & Overlays */}
        <IntegrationDetailModal />
        <ConfirmationModal />
        <ExplainabilityModal />
        <HumanHandoffModal />
        <WowMomentModal />
        <CommandPalette />
        <PresentationMode />
      </main>
    </div>
  );
};

export function App() {
  return (
    <OSProvider>
      <MainContent />
    </OSProvider>
  );
}

export default App;
