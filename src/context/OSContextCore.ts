import { createContext, useContext } from 'react';
import type { 
  Agent, Partner, CustomerContext, TranscriptMessage, 
  ExecutedAction, ConversationInsight, SimulationEvent, 
  ReasoningStep, ExplainabilityData, IntegrationPlatform,
  OrchestrationWorkflow
} from '../types';
import type { UserProfile, AuthCredentials, ConfirmationRequest } from '../types/auth';
import type { ProcessResult } from '../services/aiReasoningEngine';

export interface OSContextType {
  // Auth & Recognition
  user: UserProfile | null;
  loginUser: (credentials: AuthCredentials) => void;
  loginGoogle: () => void;
  loginDemoProfile: (profileId: string) => void;
  logout: () => void;
  timeOfDayGreeting: string;
  
  // Confirmation Safety Modal
  confirmationRequest: ConfirmationRequest | null;
  setConfirmationRequest: (req: ConfirmationRequest | null) => void;

  activeAgent: Agent;
  agents: Agent[];
  activePartner: Partner;
  partners: Partner[];
  activeCustomer: CustomerContext;
  customers: CustomerContext[];
  activeTab: 'command_center' | 'brain' | 'voice' | 'actions' | 'multi_agent' | 'digital_twin' | 'pulse' | 'agent_config' | 'ecosystem' | 'orchestrator';
  setActiveTab: (tab: any) => void;
  
  callState: 'idle' | 'calling' | 'listening' | 'processing' | 'speaking' | 'completed' | 'escalated';
  transcript: TranscriptMessage[];
  actionHistory: ExecutedAction[];
  insightHistory: ConversationInsight[];
  simulationEvents: SimulationEvent[];
  isSimulating: boolean;
  simulationProgress: number;
  reasoningSteps: ReasoningStep[];
  
  explainabilityData: ExplainabilityData | null;
  isExplainModalOpen: boolean;
  setIsExplainModalOpen: (open: boolean) => void;
  
  isHandoffModalOpen: boolean;
  setIsHandoffModalOpen: (open: boolean) => void;
  
  isPresentationMode: boolean;
  setIsPresentationMode: (open: boolean) => void;
  presentationSlideIndex: number;
  setPresentationSlideIndex: (idx: number | ((prev: number) => number)) => void;
  
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  isWowDemoRunning: boolean;
  wowStepIndex: number;

  latestResult: ProcessResult | null;

  // Integration & Orchestration States
  selectedIntegration: IntegrationPlatform | null;
  setSelectedIntegration: (item: IntegrationPlatform | null) => void;
  openIntegrationDetail: (item: IntegrationPlatform) => void;
  
  isOrchestrationActive: boolean;
  orchestrationWorkflow: OrchestrationWorkflow | null;
  runCrossPlatformOrchestration: () => void;

  selectAgent: (agentId: string) => void;
  updateAgentConfig: (agentId: string, updates: Partial<Agent>) => void;
  selectPartner: (partnerId: string) => void;
  selectCustomer: (customerId: string) => void;
  enableMicrophone: () => Promise<void>;
  startVoiceCall: () => void;
  endVoiceCall: () => void;
  processUserInput: (text: string) => void;
  runBusinessSimulation: () => void;
  triggerWowDemo: () => void;
  openExplainability: (action: ExecutedAction) => void;
  triggerHumanHandoff: () => void;
}

export const OSContext = createContext<OSContextType | undefined>(undefined);

export const useOS = (): OSContextType => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
