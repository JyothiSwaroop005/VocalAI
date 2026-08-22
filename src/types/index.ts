export type AgentTone = 'Professional' | 'Friendly' | 'Empathetic' | 'Concise' | 'Premium';
export type AgentBehavior = 'Proactive' | 'Helpful' | 'Sales-oriented' | 'Support-oriented';

export interface AgentMetric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  role: string;
  avatar: string;
  tone: AgentTone;
  behavior: AgentBehavior;
  objective: string;
  capabilities: string[];
  systemRules: string[];
  status: 'idle' | 'listening' | 'reasoning' | 'speaking' | 'executing' | 'escalated';
  activeTasks: number;
  performanceScore: number;
  accentColor: string;
  glowColor: string;
}

export type IntegrationCategory =
  | 'All' | 'Communication' | 'Travel' | 'Productivity'
  | 'Shopping' | 'Food' | 'Entertainment' | 'Development' | 'Career' | 'Meetings';

export type IntegrationStatus = 'CONNECTED' | 'AVAILABLE' | 'DEMO' | 'CONCEPT';

export interface IntegrationPlatform {
  id: string;
  name: string;
  agentName: string;
  agentRole: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  logo: string;
  description: string;
  capabilities: string[];
  accentColor: string;
  sampleQuery: string;
  simulatedWorkflowSteps: string[];
  sampleResult: {
    title: string;
    summary: string;
    metrics: Record<string, string>;
  };
}

export interface OrchestrationNode {
  id: string;
  platformId: string;
  platformName: string;
  agentName: string;
  action: string;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
  detail: string;
}

export interface OrchestrationWorkflow {
  id: string;
  userPrompt: string;
  intent: string;
  nodes: OrchestrationNode[];
  summary: string;
  totalAgentsCount: number;
  totalIntegrationsCount: number;
  isCompleted: boolean;
}

export interface PartnerJourneyNode {
  id: string;
  stage: 'Discovery' | 'Inquiry' | 'Conversation' | 'Purchase' | 'Support' | 'Retention';
  title: string;
  description: string;
  aiIntervention: string;
  status: 'active' | 'optimized' | 'opportunity';
  potentialValue: string;
}

export interface Partner {
  id: string;
  name: string;
  industry: string;
  tagline: string;
  logo: string;
  description: string;
  activeAgentsCount: number;
  monthlyCalls: string;
  automationRate: string;
  journeyNodes: PartnerJourneyNode[];
}

export interface CustomerContext {
  id: string;
  name: string;
  avatar: string;
  company: string;
  tier: 'Standard' | 'Pro' | 'Enterprise VIP';
  previousInteractions: number;
  lastInteraction: string;
  knownPreferences: string[];
  sentimentHistory: ('Positive' | 'Neutral' | 'Frustrated' | 'Delighted')[];
  openIssue: string | null;
  aiRecommendation: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export type PipelineStage =
  | 'idle' | 'speech_ingest' | 'voice_understanding' | 'intent_detection'
  | 'context_analysis' | 'sentiment_analysis' | 'business_rules'
  | 'decision_engine' | 'action_execution' | 'outcome';

export interface ReasoningStep {
  stage: PipelineStage;
  label: string;
  detail: string;
  status: 'pending' | 'processing' | 'completed' | 'skipped';
  metrics?: Record<string, string | number>;
}

/**
 * StrictTrack — Single source of truth for resolved exact-match tracks.
 * Contains candidate video IDs for fallback if Candidate 1 encounters YouTube embed restrictions.
 */
export interface StrictTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  source: 'youtube';
  candidateVideoIds: string[];
  primaryVideoId: string;
  sourceUrl: string;
  thumbnail: string;
  duration: string;
  matchType: 'exact';
  confidence: number;
  verified: boolean;
}

export type TrackLifecycleState =
  | 'resolving'
  | 'verifying'
  | 'testing_candidate'
  | 'ready_to_play'
  | 'playing'
  | 'paused'
  | 'unavailable';

export type MusicResolutionResult =
  | {
    success: true;
    track: StrictTrack;
  }
  | {
    success: false;
    requestedTitle: string;
    requestedArtist?: string;
    reason: string;
    searchQuery: string;
    youtubeSearchUrl: string;
  };

// Legacy compatibility alias
export type MusicTrackPayload =
  | {
    kind: 'verified';
    id: string;
    title: string;
    artist: string;
    album: string;
    videoId: string;
    channelName: string;
    thumbnail: string;
    duration: string;
    isVerified: true;
    keywords: string[];
  }
  | {
    kind: 'not_found';
    requestedTitle: string;
    requestedArtist: string;
    searchQuery: string;
    youtubeSearchUrl: string;
    reason: string;
  };

export interface TranscriptMessage {
  id: string;
  speaker: 'customer' | 'ai' | 'system' | 'human_agent';
  text: string;
  timestamp: string;
  intent?: string;
  serviceName?: string;
  confidence?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Frustrated';
  audioUrl?: string;
  externalUrl?: string;
  externalLabel?: string;
  musicResolution?: MusicResolutionResult;
  musicPayload?: MusicTrackPayload;
  // Action gateway result — contains structured steps for display
  gatewayResult?: import('../services/actionGateway').ActionResult;
}

export interface ExecutedAction {
  id: string;
  actionType:
  | 'create_ticket' | 'schedule_appointment' | 'escalate_human'
  | 'send_sms_confirmation' | 'recommend_product' | 'update_crm'
  | 'qualify_lead' | 'mark_resolved';
  title: string;
  description: string;
  serviceName?: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed' | 'escalated';
  reasoningFactors?: string[];
  externalUrl?: string;
  externalLabel?: string;
  payload?: Record<string, any>;
}

export interface ConversationInsight {
  id: string;
  conversationId: string;
  summary: string;
  detectedIntent: string;
  customerSentiment: 'Positive' | 'Neutral' | 'Frustrated' | 'Delighted';
  sentimentScore: number;
  keyTopics: string[];
  businessOpportunityScore: number;
  riskScore: number;
  recommendedAction: string;
  nextBestAction: string;
  timestamp: string;
}

export interface SimulationEvent {
  id: string;
  time: string;
  type:
  | 'call_received' | 'intent_matched' | 'action_executed'
  | 'escalation' | 'appointment_booked' | 'inquiry_resolved'
  | 'lead_qualified' | 'escalation_detected' | 'handoff_prepared' | 'followup_sent';
  title: string;
  detail: string;
  agentName: string;
  impact: string;
}

export interface ExplainabilityData {
  actionId: string;
  actionTitle: string;
  decisionFactors: string[];
  rulesTriggered: string[];
  confidenceScore: number;
  humanInterventionReason?: string;
}
