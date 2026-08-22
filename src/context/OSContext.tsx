import React, { useState, useEffect } from 'react';
import type { 
  Agent, Partner, CustomerContext, TranscriptMessage, 
  ExecutedAction, ConversationInsight, SimulationEvent, 
  ReasoningStep, ExplainabilityData, IntegrationPlatform,
  OrchestrationWorkflow
} from '../types';
import type { UserProfile, AuthCredentials, ConfirmationRequest } from '../types/auth';
import { INITIAL_AGENTS, INITIAL_PARTNERS, DEMO_CUSTOMERS, INITIAL_SIMULATION_EVENTS, INITIAL_ACTIONS } from '../data/mockData';
import { parseCustomerInput, detectWakeWordAgent, type ProcessResult } from '../services/aiReasoningEngine';
import { buildGoaTripOrchestrationWorkflow } from '../services/orchestratorEngine';
import { subscribeToAutomationEvents } from '../services/actionGateway';
import { authService } from '../services/authService';
import { voiceEngine } from '../services/voiceEngine';
import { soundEffects } from '../services/soundEffects';
import { OSContext, useOS } from './OSContextCore';
import { IS_EXTENSION } from '../services/chromeExtensionBridge';
import { dispatchToWebsiteAgent } from '../services/websiteAgents';

export { useOS };

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth & Recognition State
  const [user, setUser] = useState<UserProfile | null>(() => authService.getStoredUser());
  const [confirmationRequest, setConfirmationRequest] = useState<ConfirmationRequest | null>(null);

  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [activeAgent, setActiveAgent] = useState<Agent>(INITIAL_AGENTS[0]);
  
  const [partners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [activePartner, setActivePartner] = useState<Partner>(INITIAL_PARTNERS[0]);
  
  const [customers] = useState<CustomerContext[]>(DEMO_CUSTOMERS);
  const [activeCustomer, setActiveCustomer] = useState<CustomerContext>(DEMO_CUSTOMERS[0]);
  
  const [activeTab, setActiveTab] = useState<'command_center' | 'brain' | 'voice' | 'actions' | 'multi_agent' | 'digital_twin' | 'pulse' | 'agent_config' | 'ecosystem' | 'orchestrator'>('command_center');
  
  const [callState, setCallState] = useState<'idle' | 'calling' | 'listening' | 'processing' | 'speaking' | 'completed' | 'escalated'>('idle');
  
  // Dynamic Initial Transcript with Authenticated User Recognition Greeting
  const [transcript, setTranscript] = useState<TranscriptMessage[]>(() => {
    const initialUser = authService.getStoredUser();
    const name = initialUser ? initialUser.firstName : 'there';
    return [
      {
        id: 't-init',
        speaker: 'ai',
        text: `Welcome back, ${name}. Your workspace is ready. Ask to play a song, book a flight, search hotels, send a message, open YouTube, or click "RUN AI ORCHESTRATION"!`,
        timestamp: '10:00 AM'
      }
    ];
  });
  
  const [actionHistory, setActionHistory] = useState<ExecutedAction[]>(INITIAL_ACTIONS);
  const [, setInsightHistory] = useState<ConversationInsight[]>([]);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>(INITIAL_SIMULATION_EVENTS);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [latestResult, setLatestResult] = useState<ProcessResult | null>(null);
  
  const [explainabilityData, setExplainabilityData] = useState<ExplainabilityData | null>(null);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState<boolean>(false);
  
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [presentationSlideIndex, setPresentationSlideIndex] = useState<number>(0);
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  
  const [isWowDemoRunning, setIsWowDemoRunning] = useState<boolean>(false);
  const [wowStepIndex, setWowStepIndex] = useState<number>(0);

  // Integration & Orchestrator States
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationPlatform | null>(null);
  const [isOrchestrationActive, setIsOrchestrationActive] = useState<boolean>(false);
  const [orchestrationWorkflow, setOrchestrationWorkflow] = useState<OrchestrationWorkflow | null>(buildGoaTripOrchestrationWorkflow());

  // Time-aware greeting generator
  const getTimeOfDayGreeting = (): string => {
    const hour = new Date().getHours();
    const name = user ? user.firstName : '';
    if (hour >= 5 && hour < 12) return name ? `Good morning, ${name}.` : 'Good morning.';
    if (hour >= 12 && hour < 18) return name ? `Good afternoon, ${name}.` : 'Good afternoon.';
    return name ? `Good evening, ${name}.` : 'Good evening.';
  };

  const timeOfDayGreeting = getTimeOfDayGreeting();

  // Authentication Handlers
  const loginUser = (credentials: AuthCredentials) => {
    const profile = authService.loginWithEmail(credentials);
    setUser(profile);
    updateGreetingTranscript(profile);
  };

  const loginGoogle = () => {
    const profile = authService.loginWithGoogle();
    setUser(profile);
    updateGreetingTranscript(profile);
  };

  const loginDemoProfile = (profileId: string) => {
    const profile = authService.loginWithDemoProfile(profileId);
    setUser(profile);
    updateGreetingTranscript(profile);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateGreetingTranscript = (profile: UserProfile) => {
    setTranscript([
      {
        id: `t-welcome-${Date.now()}`,
        speaker: 'ai',
        text: `${getTimeOfDayGreeting()} Welcome back, ${profile.firstName}. I'm ready. What can I take care of for you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Keyboard navigation for Presentation mode and Command Palette (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (isPresentationMode) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          setPresentationSlideIndex(prev => Math.min(prev + 1, 9));
        } else if (e.key === 'ArrowLeft') {
          setPresentationSlideIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Escape') {
          setIsPresentationMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode]);

  const selectAgent = (agentId: string) => {
    const found = agents.find(a => a.id === agentId);
    if (found) {
      setActiveAgent(found);
      soundEffects.playClick();
    }
  };

  const updateAgentConfig = (agentId: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...updates } : a));
    if (activeAgent.id === agentId) {
      setActiveAgent(prev => ({ ...prev, ...updates }));
    }
  };

  const selectPartner = (partnerId: string) => {
    const found = partners.find(p => p.id === partnerId);
    if (found) {
      setActivePartner(found);
    }
  };

  const selectCustomer = (customerId: string) => {
    const found = customers.find(c => c.id === customerId);
    if (found) {
      setActiveCustomer(found);
    }
  };

  const openIntegrationDetail = (item: IntegrationPlatform) => {
    setSelectedIntegration(item);
  };

  const runCrossPlatformOrchestration = () => {
    setActiveTab('orchestrator');
    setIsOrchestrationActive(true);
    const wf = buildGoaTripOrchestrationWorkflow();
    setOrchestrationWorkflow(wf);

    setTimeout(() => {
      setIsOrchestrationActive(false);
    }, 4200);
  };

  const executeResultWorkflow = (result: ProcessResult) => {
    setCallState('speaking');

    const aiMsg: TranscriptMessage = {
      id: `msg-ai-${Date.now()}`,
      speaker: result.shouldEscalate ? 'system' : 'ai',
      text: result.aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: result.intent,
      serviceName: result.serviceName,
      confidence: result.confidence,
      sentiment: result.sentiment,
      externalUrl: result.externalUrl,
      externalLabel: result.externalLabel,
      musicPayload: result.musicPayload,
      musicResolution: result.musicResolution
    };

    setTranscript(prev => [...prev, aiMsg]);
    setActionHistory(prev => [result.executedAction, ...prev]);
    setInsightHistory(prev => [result.insight, ...prev]);

    // Speak ONLY the short spoken response aloud (e.g. "Opening YouTube.")
    const speechText = result.spokenResponse || result.aiResponse;
    voiceEngine.speak(speechText, () => {
      if (result.shouldEscalate) {
        setCallState('escalated');
        setIsHandoffModalOpen(true);
      } else {
        setCallState('completed');
      }
    });

    // Automatically navigate the browser if autoNavigate is true
    if (result.autoNavigate && result.autoNavigateUrl) {
      const targetUrl = result.autoNavigateUrl;
      setTimeout(() => {
        window.location.assign(targetUrl);
      }, 900);
    }
  };

  const processUserInput = (text: string) => {
    if (!text.trim()) return;

    // Chrome Extension Mode: Route commands through the modular WebsiteAgent Router
    if (IS_EXTENSION) {
      const userMsg: TranscriptMessage = {
        id: `msg-${Date.now()}`,
        speaker: 'customer',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscript(prev => [...prev, userMsg]);
      setCallState('processing');

      dispatchToWebsiteAgent(text).then(res => {
        const resultMsg: TranscriptMessage = {
          id: `msg-result-${Date.now()}`,
          speaker: 'ai',
          text: res.finalMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: res.intent,
          confidence: res.success ? 99 : 60
        };
        setTranscript(prev => [...prev, resultMsg]);

        // Push real execution record evidence to Live Intelligence Stream
        const simEvent: SimulationEvent = {
          id: `ext-rec-${Date.now()}`,
          time: res.executionRecord.timestamp,
          type: 'action_executed',
          title: `Agent Action: ${res.executionRecord.action}`,
          detail: res.executionRecord.evidence?.detail || res.finalMessage,
          agentName: activeAgent.name,
          impact: res.executionRecord.status === 'VERIFIED' ? '✓ VERIFIED' : res.executionRecord.status === 'WAITING_FOR_CONFIRMATION' ? '⚠️ CONFIRMATION REQUIRED' : 'x FAILED'
        };
        setSimulationEvents(prev => [simEvent, ...prev.slice(0, 20)]);

        // Speak concise response aloud & return call state to listening continuously
        voiceEngine.speak(res.spokenResponse, () => {
          setCallState('listening');
        });
        setCallState('speaking');
      }).catch(err => {
        const errMsg: TranscriptMessage = {
          id: `msg-err-${Date.now()}`,
          speaker: 'system',
          text: `⚠️ Agent execution error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setTranscript(prev => [...prev, errMsg]);
        setCallState('listening');
      });
      return;
    }

    // Standard VocalLabs OS pipeline (web mode + non-navigation intents)
    // Check if user request matches multi-agent orchestration
    if (text.toLowerCase().includes('goa') || text.toLowerCase().includes('orchestr') || text.toLowerCase().includes('weekend trip')) {
      runCrossPlatformOrchestration();
      return;
    }

    // Check for Wake Word Agent Invocation
    const matchedWakeAgent = detectWakeWordAgent(text, agents);
    if (matchedWakeAgent && matchedWakeAgent.id !== activeAgent.id) {
      setActiveAgent(matchedWakeAgent);
      soundEffects.playNeuralPulse();

      const wakeNotice: TranscriptMessage = {
        id: `msg-wake-${Date.now()}`,
        speaker: 'system',
        text: `⚡ Wake Word Detected: Automatically switching active OS agent to "${matchedWakeAgent.name}" (${matchedWakeAgent.role}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscript(prev => [...prev, wakeNotice]);
    }

    const currentTargetAgent = matchedWakeAgent || activeAgent;

    const userMsg: TranscriptMessage = {
      id: `msg-${Date.now()}`,
      speaker: 'customer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTranscript(prev => [...prev, userMsg]);
    setCallState('processing');

    const activeUserContext: CustomerContext = user ? {
      ...activeCustomer,
      name: user.name,
      company: user.company,
      tier: user.tier
    } : activeCustomer;

    const result = parseCustomerInput(text, activeUserContext, currentTargetAgent.name, agents);
    setLatestResult(result);
    setReasoningSteps(result.reasoningSteps);

    if (result.isConsequential && result.confirmationDetails) {
      soundEffects.playNeuralPulse();
      setConfirmationRequest({
        id: `conf-${Date.now()}`,
        title: result.confirmationDetails.title,
        message: result.confirmationDetails.message,
        actionType: 'booking',
        details: result.confirmationDetails.details,
        onConfirm: () => executeResultWorkflow(result),
        onCancel: () => {
          setCallState('completed');
          const cancelMsg: TranscriptMessage = {
            id: `msg-cancel-${Date.now()}`,
            speaker: 'system',
            text: `⚠️ Action cancelled by user. Zero charges or changes were made to your account.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setTranscript(prev => [...prev, cancelMsg]);
        }
      });
    } else {
      executeResultWorkflow(result);
    }
  };

  // Subscribe to Playwright SSE events for Live Intelligence Stream
  useEffect(() => {
    const unsubscribe = subscribeToAutomationEvents((event: any) => {
      if (event.message) {
        const newSimEvent: SimulationEvent = {
          id: `sse-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          time: event.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'action_executed',
          title: `Playwright Agent: ${event.type}`,
          detail: event.message,
          agentName: activeAgent.name,
          impact: event.candidate?.title || 'Verified'
        };
        setSimulationEvents(prev => [newSimEvent, ...prev.slice(0, 15)]);
      }
    });

    return () => unsubscribe();
  }, [activeAgent.name]);

  // Build shared voice engine callbacks (used by startVoiceCall and the mic button)
  const buildVoiceCallbacks = () => ({
    onStateChange: (state: any) => {
      if (state === 'LISTENING_FOR_WAKE' || state === 'IDLE') setCallState('idle');
      else if (state === 'REQUESTING_MIC') setCallState('idle');
      else if (state === 'WAKE_DETECTED') {
        soundEffects.playNeuralPulse();
        setCallState('calling');
      } else if (state === 'CAPTURING_COMMAND') setCallState('listening');
      else if (state === 'PROCESSING' || state === 'EXECUTING') setCallState('processing');
      else if (state === 'SPEAKING') setCallState('speaking');
      else if (state === 'ERROR') setCallState('idle');
    },
    onWakeWordDetected: () => {
      soundEffects.playNeuralPulse();
      const wakeNotice: TranscriptMessage = {
        id: `msg-wake-${Date.now()}`,
        speaker: 'system',
        text: `⚡ WAKE WORD DETECTED ("Hey Nova"): Active Hands-Free Voice Agent Listening...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscript(prev => [...prev, wakeNotice]);
    },
    onCommandCaptured: (command: string) => {
      if (command && command.trim()) {
        processUserInput(command);
      }
    },
    onError: (err: string) => {
      console.error('[NOVA VOICE ENGINE ERROR]', err);
    }
  });

  // NOTE: We do NOT auto-start the voice engine on mount.
  // Starting SpeechRecognition requires a real user gesture to avoid not-allowed errors.
  // The user must click "ENABLE MICROPHONE ACCESS" or "START AI VOICE CALL" to begin.
  useEffect(() => {
    return () => {
      voiceEngine.stopHandsFreeEngine();
    };
  }, []);

  const startVoiceCall = () => {
    setCallState('listening');
    setActiveTab('voice');
    voiceEngine.startHandsFreeEngine(buildVoiceCallbacks());
  };

  const enableMicrophone = async () => {
    console.log('[VOICE] Button clicked — enabling microphone.');
    setActiveTab('voice');
    const result = await voiceEngine.requestMicAndStart(buildVoiceCallbacks());
    if (result.granted) {
      setCallState('listening');
    }
  };

  const endVoiceCall = () => {
    voiceEngine.stopHandsFreeEngine();
    voiceEngine.stopSpeaking();
    setCallState('idle');
  };

  const runBusinessSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setActiveTab('pulse');

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setSimulationProgress(current);

      if (current === 30) {
        const newSimEvent: SimulationEvent = {
          id: `sim-new-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'appointment_booked',
          title: 'Automated VIP Slot Confirmed',
          detail: 'VocalLabs AI booked instant clinic slot with zero human delay.',
          agentName: activeAgent.name,
          impact: 'Resolution Time: 0.8s'
        };
        setSimulationEvents(prev => [newSimEvent, ...prev]);
      }

      if (current >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 400);
  };

  const triggerWowDemo = () => {
    setIsWowDemoRunning(true);
    setWowStepIndex(0);

    const stepInterval = setInterval(() => {
      setWowStepIndex(prev => {
        if (prev >= 8) {
          clearInterval(stepInterval);
          return 8;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const openExplainability = (action: ExecutedAction) => {
    setExplainabilityData({
      actionId: action.id,
      actionTitle: action.title,
      decisionFactors: action.reasoningFactors || [
        'Customer intent identified with >95% confidence',
        'Customer priority tier evaluated',
        'VocalLabs AI compliance rules satisfied'
      ],
      rulesTriggered: [
        `Rule #1: ${activeAgent.tone} Tone Compliance`,
        `Rule #4: Auto-confirm appointment when slot open`,
        `Rule #7: Immediate CRM synchronization`
      ],
      confidenceScore: 97,
      humanInterventionReason: action.status === 'escalated' ? 'Sentiment threshold fell below 40%' : undefined
    });
    setIsExplainModalOpen(true);
  };

  const triggerHumanHandoff = () => {
    setCallState('escalated');
    setIsHandoffModalOpen(true);
  };

  return (
    <OSContext.Provider
      value={{
        user,
        loginUser,
        loginGoogle,
        loginDemoProfile,
        logout,
        timeOfDayGreeting,
        confirmationRequest,
        setConfirmationRequest,
        activeAgent,
        agents,
        activePartner,
        partners,
        activeCustomer,
        customers,
        activeTab,
        setActiveTab,
        callState,
        transcript,
        actionHistory,
        insightHistory: [],
        simulationEvents,
        isSimulating,
        simulationProgress,
        reasoningSteps,
        explainabilityData,
        isExplainModalOpen,
        setIsExplainModalOpen,
        isHandoffModalOpen,
        setIsHandoffModalOpen,
        isPresentationMode,
        setIsPresentationMode,
        presentationSlideIndex,
        setPresentationSlideIndex,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isWowDemoRunning,
        wowStepIndex,
        latestResult,
        selectedIntegration,
        setSelectedIntegration,
        openIntegrationDetail,
        isOrchestrationActive,
        orchestrationWorkflow,
        runCrossPlatformOrchestration,
        selectAgent,
        updateAgentConfig,
        selectPartner,
        selectCustomer,
        enableMicrophone,
        startVoiceCall,
        endVoiceCall,
        processUserInput,
        runBusinessSimulation,
        triggerWowDemo,
        openExplainability,
        triggerHumanHandoff
      }}
    >
      {children}
    </OSContext.Provider>
  );
};
