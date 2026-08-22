/**
 * Action Gateway — Central Action Dispatcher with Real Playwright Automation Integration
 *
 * Architecture:
 * Client Request → ActionGateway.execute(intent)
 *                     ↓
 *           Playwright Server (http://localhost:3001/api/automation/execute)
 *                     ↓ (fallback if server unreachable)
 *           Client Adapters (/integrations/*)
 */

export type ExecutionType = 'direct' | 'external_redirect' | 'not_executed';

export interface ActionResult {
  success: boolean;
  executionType: ExecutionType;
  intent: string;
  service: string;
  title: string;
  description: string;
  confidence: number;
  verificationStatus: 'verified' | 'unverified' | 'failed' | 'not_applicable';
  steps: ActionStep[];
  externalUrl?: string;
  externalLabel?: string;
  payload?: Record<string, unknown>;
  errorReason?: string;
  requiresConfirmation?: boolean;
  confirmationPayload?: {
    title: string;
    message: string;
    details: Record<string, string>;
  };
}

export interface ActionStep {
  label: string;
  status: 'completed' | 'failed' | 'skipped';
  detail: string;
}

export interface GatewayIntent {
  type: string;           // e.g. 'music.play', 'maps.directions', 'web.open'
  service: string;        // e.g. 'youtube', 'google_maps', 'whatsapp'
  parameters: Record<string, string>;
  rawInput: string;
  userContext?: {
    name: string;
    company?: string;
  };
}

// Import client adapters as fallbacks
import { youtubeAdapter } from './integrations/youtube';
import { whatsappAdapter } from './integrations/whatsapp';
import { mapsAdapter } from './integrations/maps';
import { gmailAdapter } from './integrations/gmail';
import { travelAdapter } from './integrations/travel';
import { shoppingAdapter } from './integrations/shopping';

const ADAPTER_MAP: Record<string, (intent: GatewayIntent) => Promise<ActionResult>> = {
  'youtube': youtubeAdapter,
  'whatsapp': whatsappAdapter,
  'google_maps': mapsAdapter,
  'gmail': gmailAdapter,
  'travel': travelAdapter,
  'shopping': shoppingAdapter,
};

const BACKEND_URL = 'http://localhost:3001';

/**
 * Subscribe to real-time Server-Sent Events (SSE) from the Playwright Automation Server
 */
export function subscribeToAutomationEvents(onEvent: (event: any) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  try {
    const eventSource = new EventSource(`${BACKEND_URL}/api/automation/events`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
      } catch (err) {
        console.warn('[SSE PARSE ERROR]', err);
      }
    };

    eventSource.onerror = () => {
      // Reconnect handled automatically by EventSource
    };

    return () => {
      eventSource.close();
    };
  } catch (err) {
    console.warn('[SSE CONNECTION ERROR]', err);
    return () => {};
  }
}

export async function executeAction(intent: GatewayIntent): Promise<ActionResult> {
  // Try sending to Playwright Automation Backend Server first
  try {
    const response = await fetch(`${BACKEND_URL}/api/automation/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: intent.type,
        service: intent.service,
        query: intent.rawInput,
        parameters: intent.parameters
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.result) {
        const res = data.result;
        return {
          success: res.success !== false,
          executionType: res.verified ? 'direct' : 'external_redirect',
          intent: intent.type,
          service: res.service || intent.service,
          title: res.title || `Execute ${intent.service}`,
          description: res.details?.details || res.message || `Playwright Chromium automation executed for ${intent.rawInput}`,
          confidence: 99,
          verificationStatus: res.verified ? 'verified' : 'unverified',
          steps: [
            { label: 'Intent Identified', status: 'completed', detail: `Intent: ${intent.type}` },
            { label: 'Service Router Selected', status: 'completed', detail: `Service: ${res.service || intent.service}` },
            { label: 'Playwright Chromium Browser Launched', status: 'completed', detail: 'Controlled Chromium session active' },
            { label: 'DOM Action & Navigation Executed', status: 'completed', detail: res.url || 'Target page active' },
            { label: 'Verification Engine Result', status: res.verified ? 'completed' : 'failed', detail: res.verified ? 'DOM state & video playback confirmed verified' : 'Verification unconfirmed' }
          ],
          externalUrl: res.url,
          externalLabel: `🌐 OPEN ${ (res.service || intent.service).toUpperCase() } NOW ↗`
        };
      }
    }
  } catch (err) {
    console.log('[ACTION GATEWAY] Backend server unavailable. Falling back to client-side adapter execution:', err);
  }

  // Fallback to client adapter
  const adapter = ADAPTER_MAP[intent.service] || youtubeAdapter;
  try {
    return await adapter(intent);
  } catch (err) {
    return {
      success: false,
      executionType: 'not_executed',
      intent: intent.type,
      service: intent.service,
      title: 'Action Execution Failed',
      description: String(err),
      confidence: 0,
      verificationStatus: 'failed',
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: `Intent: ${intent.type}` },
        { label: 'Action Execution', status: 'failed', detail: String(err) },
      ],
      errorReason: String(err)
    };
  }
}

/**
 * Intent classification from raw natural language input.
 */
export function classifyIntent(input: string, userName?: string): GatewayIntent | null {
  const lower = input.toLowerCase().trim();

  // Music playback
  if (lower.startsWith('play') || (lower.includes('listen to') && !lower.includes('listen to me'))) {
    const titleArtist = parseTitleArtist(input);
    return {
      type: 'music.play',
      service: 'youtube',
      parameters: titleArtist,
      rawInput: input,
      userContext: userName ? { name: userName } : undefined
    };
  }

  // Music control
  if (lower === 'stop' || lower === 'pause' || lower === 'resume' ||
      lower.includes('stop music') || lower.includes('pause music') || lower.includes('resume music')) {
    return {
      type: 'music.control',
      service: 'youtube',
      parameters: {
        action: lower === 'resume' || lower.includes('resume') ? 'resume' : 'stop'
      },
      rawInput: input,
      userContext: userName ? { name: userName } : undefined
    };
  }

  // Google Maps / Directions
  if (lower.includes('direction') || lower.includes('navigate to') || lower.includes('take me to') ||
      (lower.includes('show me') && lower.includes('map')) || lower.includes('where is') ||
      lower.includes('how to get to') || lower.includes('route to') || lower.includes('lpu') ||
      lower.includes('lovely professional university')) {
    const destination = extractDestination(input);
    return {
      type: 'maps.directions',
      service: 'google_maps',
      parameters: { destination },
      rawInput: input,
      userContext: userName ? { name: userName } : undefined
    };
  }

  // Gmail
  if (lower.includes('gmail') || lower.includes('email') || lower.includes('mail') ||
      lower.includes('inbox') || lower.includes('compose') || lower.includes('send email')) {
    const action = lower.includes('compose') || lower.includes('send') ? 'compose' :
                   lower.includes('search') || lower.includes('find') ? 'search' : 'open';
    return {
      type: `gmail.${action}`,
      service: 'gmail',
      parameters: { action, query: input },
      rawInput: input,
      userContext: userName ? { name: userName } : undefined
    };
  }

  // WhatsApp
  if (lower.includes('whatsapp') || (lower.includes('send') && lower.includes('message') && !lower.includes('email'))) {
    const recipientMatch = input.match(/(?:to|for)\s+([A-Z][a-z]+)/i);
    const recipient = recipientMatch ? recipientMatch[1] : '';
    const msgMatch = input.match(/saying\s+(.+)$/i);
    const message = msgMatch ? msgMatch[1] : '';
    return {
      type: 'whatsapp.send',
      service: 'whatsapp',
      parameters: { recipient, message },
      rawInput: input,
      userContext: userName ? { name: userName } : undefined
    };
  }

  // Travel / Flights
  if (lower.includes('flight') || lower.includes('fly') ||
      (lower.includes('book') && (lower.includes('trip') || lower.includes('travel'))) ||
      (lower.includes('delhi') && lower.includes('mumbai'))) {
    const originMatch = input.match(/from\s+([A-Za-z\s]+?)(?:\s+to|\s*$)/i);
    const destMatch = input.match(/to\s+([A-Za-z\s]+?)(?:\s+(?:on|for|tomorrow|next)|$)/i);
    return {
      type: 'travel.search',
      service: 'travel',
      parameters: {
        origin: originMatch ? originMatch[1].trim() : 'Delhi',
        destination: destMatch ? destMatch[1].trim() : 'Mumbai',
        date: lower.includes('tomorrow') ? 'tomorrow' : 'today',
        type: 'flight'
      },
      rawInput: input,
      userContext: userName ? { name: userName } : undefined
    };
  }

  // Shopping
  if (lower.includes('find') && (lower.includes('under') || lower.includes('buy') || lower.includes('shop') ||
      lower.includes('shoes') || lower.includes('charger') || lower.includes('product'))) {
    return {
      type: 'shopping.search',
      service: 'shopping',
      parameters: { query: input },
      rawInput: input,
      userContext: userName ? { name: userName } : undefined
    };
  }

  return null;
}

function parseTitleArtist(input: string): { title: string; artist: string } {
  let cleaned = input
    .replace(/^(can you|please|hey\s+\w+|yo)?\s*(play|listen to|stream|put on|play me|play the song)\s*/i, '')
    .replace(/\s*(for me|now|please|right now)$/i, '')
    .trim();

  const byMatch = cleaned.match(/^(.+?)\s+by\s+(.+)$/i);
  if (byMatch) return { title: byMatch[1].trim(), artist: byMatch[2].trim() };

  const dashMatch = cleaned.match(/^(.+?)\s*[-:]\s*(.+)$/);
  if (dashMatch) return { title: dashMatch[2].trim(), artist: dashMatch[1].trim() };

  return { title: cleaned, artist: '' };
}

function extractDestination(input: string): string {
  const patterns = [
    /(?:to|for|at|navigate to|directions to|take me to|show me|route to|way to)\s+([A-Za-z\s,]+?)(?:\s*$|[\.,!?])/i,
    /(?:where is|find)\s+([A-Za-z\s,]+?)(?:\s*$|[\.,!?])/i,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m && m[1]) return m[1].trim();
  }
  if (input.toLowerCase().includes('lpu')) return 'Lovely Professional University, Phagwara';
  return input;
}
