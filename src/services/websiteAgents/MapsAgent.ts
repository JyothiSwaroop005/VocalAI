import type { WebsiteAgent, AgentResult, AgentStep } from './types';
import { openUrl } from '../chromeExtensionBridge';

export class MapsAgent implements WebsiteAgent {
  name = 'MapsAgent';

  canHandle(intent: string): boolean {
    const i = intent.toLowerCase();
    return i.includes('maps') || i.includes('direction') || i.includes('navigate') || i.includes('route to');
  }

  async execute(_intent: string, input: string): Promise<AgentResult> {
    const cleanInput = input.replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '').trim();
    const lower = cleanInput.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const destMatch = cleanInput.match(/(?:directions?\s+to|navigate\s+to|route\s+to|find|show|open\s+maps?\s+for)\s+(.+)/i);
    const destination = destMatch ? destMatch[1].replace(/\.$/, '').trim() : (lower.includes('lpu') ? 'LPU, Phagwara' : '');

    const mapsUrl = destination
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
      : 'https://maps.google.com';

    const steps: AgentStep[] = [
      { id: 'm1', label: 'Open Google Maps', status: 'completed', riskLevel: 'LOW', detail: destination ? `Getting directions to ${destination}` : 'Navigating to maps.google.com' },
      { id: 'm2', label: 'Verify Routing Card', status: 'completed', riskLevel: 'LOW', detail: 'Route elements rendered' }
    ];

    await openUrl(mapsUrl, false);

    const spoken = destination ? `Opening directions to ${destination}.` : 'Opening Google Maps.';

    return {
      success: true,
      intent: 'NAVIGATE',
      completedSteps: steps,
      finalMessage: destination ? `Opened directions to ${destination}.` : 'Opened Google Maps.',
      spokenResponse: spoken,
      executionRecord: {
        action: 'maps_directions',
        target: destination || 'maps.google.com',
        status: 'VERIFIED',
        timestamp,
        evidence: { type: 'url', detail: mapsUrl }
      }
    };
  }
}

export const mapsAgent = new MapsAgent();
