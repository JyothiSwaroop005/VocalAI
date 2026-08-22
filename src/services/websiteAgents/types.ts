import type { PageSummary } from '../chromeExtensionBridge';

export type AgentExecutionStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'EXECUTED'
  | 'VERIFIED'
  | 'FAILED'
  | 'BLOCKED'
  | 'WAITING_FOR_CONFIRMATION';

export interface ExecutionEvidence {
  type: 'url' | 'dom_element' | 'text_match' | 'video_state';
  detail: string;
}

export interface AgentExecutionRecord {
  action: string;
  target: string;
  status: AgentExecutionStatus;
  timestamp: string;
  evidence?: ExecutionEvidence;
  error?: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AgentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  detail?: string;
  result?: string;
  riskLevel: RiskLevel;
  requiresConfirmation?: boolean;
}

export interface AgentPlan {
  intent: string;
  spokenResponse: string;
  steps: AgentStep[];
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
}

export interface AgentResult {
  success: boolean;
  intent: string;
  completedSteps: AgentStep[];
  finalMessage: string;
  spokenResponse: string;
  executionRecord: AgentExecutionRecord;
  pageSummary?: PageSummary;
  extractedData?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  missingEntities?: string[];
  promptQuestion?: string;
}

export interface FlightBookingState {
  origin?: string;
  destination?: string;
  date?: string;
  returnDate?: string;
  passengers?: number;
  selectedAirline?: string;
  selectedFlightNo?: string;
  selectedTime?: string;
  selectedFare?: string;
  stage: 'SEARCH' | 'RESULTS_LOADED' | 'FLIGHT_SELECTED' | 'CONFIRMATION_REQUIRED' | 'BOOKING_COMPLETE';
}

export interface WebsiteAgent {
  name: string;
  canHandle(intent: string, url?: string): boolean;
  execute(intent: string, input: string, params?: Record<string, any>): Promise<AgentResult>;
}
