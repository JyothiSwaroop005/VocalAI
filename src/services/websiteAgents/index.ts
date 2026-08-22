import type { WebsiteAgent, AgentResult } from './types';
import { youtubeAgent } from './YouTubeAgent';
import { flightAgent } from './FlightAgent';
import { whatsappAgent } from './WhatsAppAgent';
import { gmailAgent } from './GmailAgent';
import { mapsAgent } from './MapsAgent';
import { shoppingAgent } from './ShoppingAgent';
import { hotelAgent } from './HotelAgent';
import { genericBrowserAgent } from './GenericBrowserAgent';

export * from './types';
export { youtubeAgent, flightAgent, whatsappAgent, gmailAgent, mapsAgent, shoppingAgent, hotelAgent, genericBrowserAgent };

const AGENTS: WebsiteAgent[] = [
  youtubeAgent,
  flightAgent,
  whatsappAgent,
  gmailAgent,
  mapsAgent,
  shoppingAgent,
  hotelAgent,
  genericBrowserAgent // Fallback agent
];

export async function dispatchToWebsiteAgent(input: string): Promise<AgentResult> {
  const cleanInput = input.replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '').trim();

  for (const agent of AGENTS) {
    if (agent.canHandle(cleanInput)) {
      console.log(`[SERVICE ROUTER] Selected Agent: ${agent.name} for input: "${cleanInput}"`);
      return await agent.execute(cleanInput, input);
    }
  }

  return await genericBrowserAgent.execute('generic', input);
}
