import type { WebsiteAgent, AgentResult, AgentStep } from './types';
import { openUrl, readActivePage, executeDOMAction } from '../chromeExtensionBridge';

export class GenericBrowserAgent implements WebsiteAgent {
  name = 'GenericBrowserAgent';

  canHandle(): boolean {
    return true; // Fallback handler for all websites
  }

  async execute(_intent: string, input: string): Promise<AgentResult> {
    const cleanInput = input.replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '').trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Open website command
    const openMatch = cleanInput.match(/^(?:open|go to|launch|navigate to)\s+(.+)/i);
    if (openMatch) {
      const site = openMatch[1].replace(/\.$/, '').trim();
      const url = site.startsWith('http') ? site : `https://www.${site.replace(/\s+/g, '')}.com`;

      const steps: AgentStep[] = [
        { id: 'g1', label: 'Navigate Tab', status: 'completed', riskLevel: 'LOW', detail: `Opening ${url}` }
      ];

      await openUrl(url, false);

      return {
        success: true,
        intent: 'OPEN_WEBSITE',
        completedSteps: steps,
        finalMessage: `Opened ${site}.`,
        spokenResponse: `Opening ${site}.`,
        executionRecord: {
          action: 'open_website',
          target: url,
          status: 'VERIFIED',
          timestamp,
          evidence: { type: 'url', detail: url }
        }
      };
    }

    // Generic search on current webpage with Bounded Retries (MAX_RETRIES = 3)
    const MAX_RETRIES = 3;
    let attempt = 0;
    let lastErr = '';

    const steps: AgentStep[] = [
      { id: 'gen1', label: 'Inspect Active Web Page', status: 'running', riskLevel: 'LOW', detail: 'Reading DOM structure and input fields' },
      { id: 'gen2', label: 'Locate Target Semantic Element', status: 'pending', riskLevel: 'LOW', detail: `Finding input/button matching "${cleanInput}"` }
    ];

    while (attempt < MAX_RETRIES) {
      attempt++;
      try {
        const summary = await readActivePage();
        steps[0].status = 'completed';
        steps[0].result = `Inspected ${summary?.title || 'page'}`;

        steps[1].status = 'running';
        const typeR = await executeDOMAction({
          type: 'type',
          target: { type: 'search_input', placeholder: 'Search', ariaLabel: 'Search' },
          value: cleanInput
        });

        if (typeR.success) {
          await executeDOMAction({ type: 'press_key', key: 'Enter' });
          steps[1].status = 'completed';
          steps[1].result = `Typed "${cleanInput}" and submitted search`;

          return {
            success: true,
            intent: 'GENERIC_SEARCH',
            completedSteps: steps,
            finalMessage: `Executed search for "${cleanInput}".`,
            spokenResponse: `Done. I searched for ${cleanInput}.`,
            executionRecord: {
              action: 'generic_dom_search',
              target: cleanInput,
              status: 'VERIFIED',
              timestamp,
              evidence: { type: 'dom_element', detail: 'Typed into active search element' }
            }
          };
        } else {
          lastErr = typeR.message || 'Search box element not found';
        }
      } catch (err: any) {
        lastErr = err.message || 'DOM interaction failure';
      }
    }

    steps[1].status = 'failed';
    steps[1].result = `Failed after ${MAX_RETRIES} retries: ${lastErr}`;

    return {
      success: false,
      intent: 'GENERIC_ACTION_FAILED',
      completedSteps: steps,
      finalMessage: `Action failed: Search input could not be located after ${MAX_RETRIES} attempts.`,
      spokenResponse: `I could not find the search box on this page.`,
      executionRecord: {
        action: 'generic_dom_action',
        target: cleanInput,
        status: 'FAILED',
        timestamp,
        error: lastErr
      }
    };
  }
}

export const genericBrowserAgent = new GenericBrowserAgent();
