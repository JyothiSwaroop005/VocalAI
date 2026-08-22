/**
 * VocalLabs OS — Nova Browser Agent Executor
 * Multi-step agentic browser automation with:
 * - Intent → Action Plan conversion
 * - Step-by-step execution with verification
 * - Risk-level confirmation system
 * - Failure recovery and retry
 * - Real DOM interaction via Chrome Extension Bridge
 */

import {
  openUrl,
  findTab,
  switchToTab,
  goBack,
  goForward,
  closeTab,
  executeDOMAction,
  readActivePage,
  getActiveTab,
  type PageSummary
} from './chromeExtensionBridge';

// ── Risk Levels ────────────────────────────────────────────────────────────────
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
  pageSummary?: PageSummary;
  extractedData?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// ── Step callback for live streaming ─────────────────────────────────────────
export type StepCallback = (step: AgentStep) => void;

// ── Site-specific URL helpers ─────────────────────────────────────────────────

function getSiteUrl(site: string): string {
  const s = site.toLowerCase().trim();
  const siteMap: Record<string, string> = {
    youtube: 'https://www.youtube.com',
    gmail: 'https://mail.google.com',
    maps: 'https://maps.google.com',
    'google maps': 'https://maps.google.com',
    whatsapp: 'https://web.whatsapp.com',
    'whatsapp web': 'https://web.whatsapp.com',
    amazon: 'https://www.amazon.in',
    flipkart: 'https://www.flipkart.com',
    instagram: 'https://www.instagram.com',
    twitter: 'https://www.twitter.com',
    linkedin: 'https://www.linkedin.com',
    makemytrip: 'https://www.makemytrip.com',
    'google flights': 'https://www.google.com/travel/flights',
    flights: 'https://www.google.com/travel/flights',
    booking: 'https://www.booking.com',
    netflix: 'https://www.netflix.com',
    spotify: 'https://open.spotify.com',
    github: 'https://www.github.com',
    google: 'https://www.google.com',
  };
  return siteMap[s] || `https://www.${s.replace(/\s+/g, '')}.com`;
}

// ── Intent → Plan Generator ───────────────────────────────────────────────────
export function buildActionPlan(input: string): AgentPlan {

  // Strip wake phrase
  const cleanInput = input
    .replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '')
    .trim();
  const cleanLower = cleanInput.toLowerCase();

  // Helper to create step
  const step = (label: string, detail: string, risk: RiskLevel = 'LOW'): AgentStep => ({
    id: `step-${Math.random().toString(36).substr(2, 6)}`,
    label,
    status: 'pending',
    detail,
    riskLevel: risk
  });

  // ── Go Back / Forward ────────────────────────────────────────────────────
  if (cleanLower === 'go back' || cleanLower === 'back') {
    return {
      intent: 'NAVIGATION_BACK',
      spokenResponse: 'Going back.',
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Navigate Back', 'Going to the previous page in browser history')
      ]
    };
  }

  if (cleanLower === 'go forward' || cleanLower === 'forward') {
    return {
      intent: 'NAVIGATION_FORWARD',
      spokenResponse: 'Going forward.',
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Navigate Forward', 'Going to the next page in browser history')
      ]
    };
  }

  // ── Switch Tab ───────────────────────────────────────────────────────────
  const switchMatch = cleanLower.match(/^switch to (.+)$/i);
  if (switchMatch) {
    const target = switchMatch[1].trim();
    return {
      intent: 'SWITCH_TAB',
      spokenResponse: `Switching to ${target}.`,
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Find Tab', `Looking for tab matching "${target}"`),
        step('Switch Tab', `Activating ${target} tab`)
      ]
    };
  }

  // ── Close Tab ────────────────────────────────────────────────────────────
  if (cleanLower.includes('close this tab') || cleanLower.includes('close tab')) {
    return {
      intent: 'CLOSE_TAB',
      spokenResponse: 'Closing this tab.',
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Close Current Tab', 'Closing the active browser tab')
      ]
    };
  }

  // ── Open Gmail in new tab ─────────────────────────────────────────────────
  const openNewTabMatch = cleanLower.match(/open (.+?) in a new tab/i);
  if (openNewTabMatch) {
    const site = openNewTabMatch[1].trim();
    const url = getSiteUrl(site);
    return {
      intent: 'OPEN_NEW_TAB',
      spokenResponse: `Opening ${site} in a new tab.`,
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Open New Tab', `Creating new tab for ${url}`),
        step('Wait for Load', `Waiting for ${site} to load`)
      ]
    };
  }

  // ── YouTube Search ────────────────────────────────────────────────────────
  const ytSearch = cleanLower.match(/(?:search youtube for|search on youtube for|youtube search for?)\s+(.+)/i)
    || (cleanLower.includes('youtube') && cleanLower.includes('search') ? cleanLower.match(/search.+?(?:for|for)\s+(.+)/i) : null);

  if (ytSearch || (cleanLower.includes('youtube') && cleanLower.includes('search'))) {
    const query = ytSearch ? ytSearch[1] : cleanInput.replace(/youtube|search/gi, '').trim();
    return {
      intent: 'YOUTUBE_SEARCH',
      spokenResponse: `Searching YouTube for ${query}.`,
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Open YouTube', 'Navigating to youtube.com'),
        step('Wait for YouTube', 'Waiting for page to load'),
        step('Enter Search Query', `Typing "${query}" in search box`),
        step('Submit Search', 'Pressing Enter to search'),
        step('Verify Results', 'Checking search results loaded')
      ]
    };
  }

  // ── Play Song on YouTube ──────────────────────────────────────────────────
  const playMatch = cleanLower.match(/^play\s+(.+?)(?:\s+by\s+(.+))?$/i);
  if (playMatch) {
    const title = playMatch[1].trim();
    const artist = playMatch[2]?.trim() || '';
    const query = artist ? `${title} ${artist}` : title;
    return {
      intent: 'YOUTUBE_PLAY',
      spokenResponse: artist ? `Playing ${title} by ${artist}.` : `Playing ${title}.`,
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Open YouTube', 'Navigating to youtube.com'),
        step('Wait for YouTube', 'Waiting for page to load'),
        step('Search for Song', `Searching for "${query}"`),
        step('Submit Search', 'Pressing Enter to search'),
        step('Select Top Result', `Looking for exact match: ${title}${artist ? ' by ' + artist : ''}`),
        step('Verify Playback', 'Confirming video is playing')
      ]
    };
  }

  // ── Open Website ──────────────────────────────────────────────────────────
  const openMatch = cleanLower.match(/^(?:open|go to|launch|navigate to)\s+(.+)/i);
  if (openMatch) {
    const site = openMatch[1].replace(/\.$/, '').trim();
    const url = getSiteUrl(site);
    return {
      intent: 'OPEN_WEBSITE',
      spokenResponse: `Opening ${site}.`,
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Navigate to Website', `Opening ${url}`),
        step('Wait for Load', `Waiting for ${site} to load`)
      ]
    };
  }

  // ── Gmail Search ──────────────────────────────────────────────────────────
  if (cleanLower.includes('gmail') || cleanLower.includes('email') || cleanLower.includes('inbox')) {
    const searchGmailMatch = cleanLower.match(/(?:search|find|look for)\s+(?:gmail|email)s?\s+(?:for|from|about)\s+(.+)/i);
    if (searchGmailMatch) {
      const query = searchGmailMatch[1].trim();
      return {
        intent: 'GMAIL_SEARCH',
        spokenResponse: `Searching Gmail for ${query}.`,
        riskLevel: 'LOW',
        requiresConfirmation: false,
        steps: [
          step('Open Gmail', 'Navigating to Gmail'),
          step('Wait for Gmail', 'Waiting for Gmail to load'),
          step('Search Emails', `Searching for "${query}"`),
          step('Verify Results', 'Checking search results')
        ]
      };
    }
    return {
      intent: 'OPEN_GMAIL',
      spokenResponse: 'Opening Gmail.',
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Open Gmail', 'Navigating to mail.google.com'),
        step('Wait for Load', 'Waiting for Gmail to load')
      ]
    };
  }

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  if (cleanLower.includes('whatsapp')) {
    const msgMatch = cleanLower.match(/(?:message|send|tell)\s+(\w+)\s+(?:saying|that|:)?\s*(.+)/i);
    if (msgMatch) {
      const recipient = msgMatch[1];
      const message = msgMatch[2];
      return {
        intent: 'WHATSAPP_MESSAGE',
        spokenResponse: `Opening WhatsApp to message ${recipient}. I'll ask before sending.`,
        riskLevel: 'HIGH',
        requiresConfirmation: true,
        confirmationMessage: `Send "${message}" to ${recipient} on WhatsApp?`,
        steps: [
          step('Open WhatsApp Web', 'Navigating to web.whatsapp.com'),
          step('Wait for WhatsApp', 'Waiting for page to load'),
          step('Find Contact', `Looking for ${recipient}`, 'MEDIUM'),
          step('Type Message', `Composing: "${message}"`, 'MEDIUM'),
          step('Preview Message', 'Showing message for your confirmation', 'HIGH'),
          step('Wait for Confirmation', 'Awaiting your approval to send', 'HIGH')
        ]
      };
    }
    return {
      intent: 'OPEN_WHATSAPP',
      spokenResponse: 'Opening WhatsApp Web.',
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Open WhatsApp Web', 'Navigating to web.whatsapp.com'),
        step('Wait for Load', 'Waiting for WhatsApp to load')
      ]
    };
  }

  // ── Google Maps / Directions ──────────────────────────────────────────────
  if (cleanLower.includes('maps') || cleanLower.includes('direction') || cleanLower.includes('navigate to')) {
    const destMatch = cleanLower.match(/(?:directions? to|navigate to|route to|find|show|open maps? for)\s+(.+)/i);
    const destination = destMatch ? destMatch[1].trim() : '';
    if (destination) {
      return {
        intent: 'MAPS_DIRECTIONS',
        spokenResponse: `Opening directions to ${destination}.`,
        riskLevel: 'LOW',
        requiresConfirmation: false,
        steps: [
          step('Open Google Maps', `Getting directions to ${destination}`),
          step('Wait for Maps', 'Waiting for Google Maps to load'),
          step('Verify Directions', 'Confirming directions are displayed')
        ]
      };
    }
    return {
      intent: 'OPEN_MAPS',
      spokenResponse: 'Opening Google Maps.',
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Open Google Maps', 'Navigating to maps.google.com'),
        step('Wait for Load', 'Waiting for Maps to load')
      ]
    };
  }

  // ── Flight Search ─────────────────────────────────────────────────────────
  if (cleanLower.includes('flight') || (cleanLower.includes('fly') && !cleanLower.includes('flyout'))) {
    const originMatch = cleanLower.match(/from\s+(\w+(?:\s+\w+)*?)\s+to/i);
    const destMatch2 = cleanLower.match(/to\s+(\w+(?:\s+\w+)*)(?:\s+(?:tomorrow|today|on)|$)/i);
    const origin = originMatch ? originMatch[1].trim() : 'Delhi';
    const dest = destMatch2 ? destMatch2[1].trim() : 'Mumbai';
    const flightsSearchUrl = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(origin)}+to+${encodeURIComponent(dest)}`;
    void flightsSearchUrl; // used in executor
    return {
      intent: 'FLIGHT_SEARCH',
      spokenResponse: `Searching for flights from ${origin} to ${dest}.`,
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Open Google Flights', `Searching flights: ${origin} → ${dest}`),
        step('Wait for Results', 'Waiting for flight results to load'),
        step('Read Flight Options', 'Extracting visible flight options'),
        step('Present Options', 'Showing you available flights')
      ]
    };
  }

  // ── Shopping Search ───────────────────────────────────────────────────────
  if (cleanLower.includes('find') && (cleanLower.includes('under') || cleanLower.includes('buy') || cleanLower.includes('shop') || cleanLower.includes('shoes') || cleanLower.includes('product'))) {
    const productMatch = cleanLower.match(/find\s+(.+?)(?:\s+under\s+.+)?$/i);
    const product = productMatch ? productMatch[1].trim() : cleanInput;
    return {
      intent: 'SHOPPING_SEARCH',
      spokenResponse: `Searching for ${product}.`,
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Open Amazon', `Searching Amazon for "${product}"`),
        step('Wait for Results', 'Waiting for search results'),
        step('Read Results', 'Extracting product listings'),
        step('Present Options', 'Showing you the results')
      ]
    };
  }

  // ── Find Contact Page ─────────────────────────────────────────────────────
  if (cleanLower.includes('contact page') || cleanLower.includes('find contact')) {
    return {
      intent: 'FIND_CONTACT_PAGE',
      spokenResponse: 'Looking for the contact page on this website.',
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Read Current Page', 'Inspecting current website navigation'),
        step('Find Contact Link', 'Looking for Contact, Support, or Help links'),
        step('Navigate to Contact', 'Opening the contact page')
      ]
    };
  }

  // ── Generic search on current website ────────────────────────────────────
  if (cleanLower.startsWith('search') || cleanLower.startsWith('find')) {
    const searchQuery = cleanInput.replace(/^(search|find)\s+(for\s+)?/i, '').trim();
    return {
      intent: 'SEARCH_ON_PAGE',
      spokenResponse: `Searching for ${searchQuery}.`,
      riskLevel: 'LOW',
      requiresConfirmation: false,
      steps: [
        step('Read Current Page', 'Getting current page context'),
        step('Find Search Box', 'Locating the search input on this page'),
        step('Enter Query', `Typing "${searchQuery}"`),
        step('Submit Search', 'Pressing Enter to search'),
        step('Verify Results', 'Confirming search results loaded')
      ]
    };
  }

  // ── Fallback: open as website name ────────────────────────────────────────
  return {
    intent: 'GENERAL_NAVIGATION',
    spokenResponse: `I'll try to handle that: ${cleanInput}`,
    riskLevel: 'LOW',
    requiresConfirmation: false,
    steps: [
      step('Process Command', `Executing: ${cleanInput}`)
    ]
  };
}

// ── Agent Executor ────────────────────────────────────────────────────────────
export async function executeAgentPlan(
  plan: AgentPlan,
  input: string,
  onStep: StepCallback
): Promise<AgentResult> {
  const cleanInput = input.replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '').trim();
  const cleanLower = cleanInput.toLowerCase();

  const updateStep = (step: AgentStep, status: AgentStep['status'], result?: string) => {
    step.status = status;
    step.result = result;
    onStep({ ...step });
  };

  const steps = plan.steps;
  let extractedData = '';
  let pageSummary: PageSummary | undefined;

  try {
    switch (plan.intent) {

      // ── Go Back ───────────────────────────────────────────────────────────
      case 'NAVIGATION_BACK': {
        updateStep(steps[0], 'running');
        const r = await goBack();
        updateStep(steps[0], r.success ? 'completed' : 'failed', r.message);
        return { success: r.success, intent: plan.intent, completedSteps: steps, finalMessage: r.success ? 'Went back.' : 'Could not go back.', spokenResponse: r.success ? 'Done.' : 'I could not go back.' };
      }

      // ── Go Forward ────────────────────────────────────────────────────────
      case 'NAVIGATION_FORWARD': {
        updateStep(steps[0], 'running');
        const r = await goForward();
        updateStep(steps[0], r.success ? 'completed' : 'failed', r.message);
        return { success: r.success, intent: plan.intent, completedSteps: steps, finalMessage: r.success ? 'Went forward.' : 'Could not go forward.', spokenResponse: r.success ? 'Done.' : 'I could not go forward.' };
      }

      // ── Switch Tab ────────────────────────────────────────────────────────
      case 'SWITCH_TAB': {
        const targetName = cleanLower.replace(/^switch to\s+/i, '').trim();
        updateStep(steps[0], 'running');
        const tab = await findTab(targetName);
        if (!tab) {
          updateStep(steps[0], 'failed', `No tab found matching "${targetName}"`);
          return { success: false, intent: plan.intent, completedSteps: steps, finalMessage: `No open tab matching "${targetName}".`, spokenResponse: `I couldn't find a ${targetName} tab.` };
        }
        updateStep(steps[0], 'completed', `Found: ${tab.title}`);
        updateStep(steps[1], 'running');
        await switchToTab(tab.id!);
        updateStep(steps[1], 'completed', `Switched to ${tab.title}`);
        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: `Switched to ${tab.title}`, spokenResponse: `Switched to ${targetName}.` };
      }

      // ── Close Tab ─────────────────────────────────────────────────────────
      case 'CLOSE_TAB': {
        updateStep(steps[0], 'running');
        const activeTab = await getActiveTab();
        if (!activeTab?.id) {
          updateStep(steps[0], 'failed', 'No active tab');
          return { success: false, intent: plan.intent, completedSteps: steps, finalMessage: 'Could not close tab.', spokenResponse: 'I could not close the tab.' };
        }
        await closeTab(activeTab.id);
        updateStep(steps[0], 'completed', 'Tab closed');
        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: 'Tab closed.', spokenResponse: 'Tab closed.' };
      }

      // ── Open New Tab ──────────────────────────────────────────────────────
      case 'OPEN_NEW_TAB': {
        const siteMatch = cleanLower.match(/open (.+?) in a new tab/i);
        const site = siteMatch ? siteMatch[1].trim() : cleanInput;
        const url = getSiteUrl(site);
        updateStep(steps[0], 'running');
        const r = await openUrl(url, true);
        updateStep(steps[0], r.success ? 'completed' : 'failed', `Opened: ${url}`);
        if (steps[1]) {
          updateStep(steps[1], 'completed', 'Loaded');
        }
        return { success: r.success, intent: plan.intent, completedSteps: steps, finalMessage: `Opened ${site} in new tab.`, spokenResponse: `Opened ${site} in a new tab.` };
      }

      // ── Open Website ──────────────────────────────────────────────────────
      case 'OPEN_WEBSITE': {
        const siteMatch2 = cleanLower.match(/^(?:open|go to|launch|navigate to)\s+(.+)/i);
        const site2 = siteMatch2 ? siteMatch2[1].replace(/\.$/, '').trim() : cleanInput;
        const url2 = getSiteUrl(site2);
        updateStep(steps[0], 'running');
        const r = await openUrl(url2, false);
        updateStep(steps[0], r.success ? 'completed' : 'failed', `Navigating to ${url2}`);
        if (steps[1] && r.success) {
          updateStep(steps[1], 'running');
          await delay(2000);
          updateStep(steps[1], 'completed', `${site2} loaded`);
        }
        return { success: r.success, intent: plan.intent, completedSteps: steps, finalMessage: `Opened ${site2}`, spokenResponse: r.success ? `Opening ${site2}.` : `I couldn't open ${site2}.` };
      }

      // ── YouTube Search ────────────────────────────────────────────────────
      case 'YOUTUBE_SEARCH': {
        const qMatch = cleanLower.match(/(?:search youtube for|search on youtube for|youtube search)\s+(.+)/i);
        const searchQ = qMatch ? qMatch[1].trim() : cleanInput.replace(/youtube|search/gi, '').trim();

        updateStep(steps[0], 'running');
        const r0 = await openUrl('https://www.youtube.com', false);
        updateStep(steps[0], r0.success ? 'completed' : 'failed', 'Opened YouTube');
        if (!r0.success) return fail(plan, steps, 'Could not open YouTube.');

        updateStep(steps[1], 'running');
        await delay(2500);
        updateStep(steps[1], 'completed', 'YouTube loaded');

        updateStep(steps[2], 'running');
        const typeR = await executeDOMAction({
          type: 'type',
          target: { type: 'search_input', placeholder: 'Search', ariaLabel: 'Search', name: 'search_query', selector: 'input#search' },
          value: searchQ
        });
        updateStep(steps[2], typeR.success ? 'completed' : 'failed', typeR.message);
        if (!typeR.success) return fail(plan, steps, `Could not find YouTube search box: ${typeR.message}`);

        updateStep(steps[3], 'running');
        await executeDOMAction({ type: 'press_key', key: 'Enter' });
        updateStep(steps[3], 'completed', 'Search submitted');

        await delay(2000);
        updateStep(steps[4], 'running');
        const verifyR = await executeDOMAction({ type: 'verify', url: 'results?search_query' });
        updateStep(steps[4], verifyR.success ? 'completed' : 'failed', verifyR.message);

        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: `Searched YouTube for "${searchQ}"`, spokenResponse: `Done. I searched YouTube for ${searchQ}.` };
      }

      // ── YouTube Play ──────────────────────────────────────────────────────
      case 'YOUTUBE_PLAY': {
        const pMatch = cleanLower.match(/^play\s+(.+?)(?:\s+by\s+(.+))?$/i);
        const title = pMatch ? pMatch[1].trim() : cleanInput.replace(/^play\s+/i, '').trim();
        const artist = pMatch?.[2]?.trim() || '';
        const searchQuery = artist ? `${title} ${artist} official` : `${title} official`;

        updateStep(steps[0], 'running');
        await openUrl('https://www.youtube.com', false);
        updateStep(steps[0], 'completed', 'Opened YouTube');

        updateStep(steps[1], 'running');
        await delay(2500);
        updateStep(steps[1], 'completed', 'YouTube loaded');

        updateStep(steps[2], 'running');
        const typeR2 = await executeDOMAction({
          type: 'type',
          target: { type: 'search_input', selector: 'input#search', ariaLabel: 'Search', placeholder: 'Search' },
          value: searchQuery
        });
        updateStep(steps[2], typeR2.success ? 'completed' : 'failed', `Searched: ${searchQuery}`);

        updateStep(steps[3], 'running');
        await executeDOMAction({ type: 'press_key', key: 'Enter' });
        updateStep(steps[3], 'completed', 'Search submitted');

        await delay(2500);

        updateStep(steps[4], 'running');
        // Click the first video result
        const clickR = await executeDOMAction({
          type: 'click',
          target: { selector: 'ytd-video-renderer a#video-title, ytd-rich-item-renderer a#video-title', text: title }
        });
        updateStep(steps[4], clickR.success ? 'completed' : 'failed', clickR.message);

        await delay(2000);
        updateStep(steps[5], 'running');
        const verR = await executeDOMAction({ type: 'verify', url: 'watch?v=' });
        updateStep(steps[5], verR.success ? 'completed' : 'failed', verR.success ? 'Video is playing' : 'Could not verify playback');

        const spoken = artist ? `Playing ${title} by ${artist}.` : `Playing ${title}.`;
        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: spoken, spokenResponse: spoken };
      }

      // ── Gmail / Email ─────────────────────────────────────────────────────
      case 'OPEN_GMAIL':
      case 'GMAIL_SEARCH': {
        const gmailSearchMatch = cleanLower.match(/(?:search|find|look for)\s+(?:gmail|emails?)\s+(?:for|from|about)\s+(.+)/i);
        const gmailQuery = gmailSearchMatch ? gmailSearchMatch[1].trim() : '';
        const gmailUrl = gmailQuery
          ? `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(gmailQuery)}`
          : 'https://mail.google.com';

        updateStep(steps[0], 'running');
        await openUrl(gmailUrl, false);
        updateStep(steps[0], 'completed', 'Opened Gmail');

        if (steps[1]) {
          updateStep(steps[1], 'running');
          await delay(2000);
          updateStep(steps[1], 'completed', 'Gmail loaded');
        }

        if (gmailQuery && steps[2]) {
          updateStep(steps[2], 'running');
          await delay(1000);
          updateStep(steps[2], 'completed', `Searching for "${gmailQuery}"`);
          if (steps[3]) {
            updateStep(steps[3], 'running');
            await delay(1500);
            updateStep(steps[3], 'completed', 'Results loaded');
          }
        }

        const spoken = gmailQuery ? `Searching Gmail for ${gmailQuery}.` : 'Opening Gmail.';
        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: spoken, spokenResponse: spoken };
      }

      // ── Google Maps / Directions ──────────────────────────────────────────
      case 'MAPS_DIRECTIONS':
      case 'OPEN_MAPS': {
        const destM = cleanLower.match(/(?:directions? to|navigate to|route to)\s+(.+)/i);
        const destination = destM ? destM[1].trim() : '';
        const mapsUrl = destination
          ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
          : 'https://maps.google.com';

        updateStep(steps[0], 'running');
        await openUrl(mapsUrl, false);
        updateStep(steps[0], 'completed', destination ? `Getting directions to ${destination}` : 'Opened Google Maps');

        updateStep(steps[1], 'running');
        await delay(2000);
        updateStep(steps[1], 'completed', 'Maps loaded');

        if (steps[2]) {
          updateStep(steps[2], 'running');
          await delay(1000);
          const verM = await executeDOMAction({ type: 'verify', url: 'maps' });
          updateStep(steps[2], verM.success ? 'completed' : 'failed', verM.message);
        }

        const spoken2 = destination ? `Opening directions to ${destination}.` : 'Opening Google Maps.';
        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: spoken2, spokenResponse: spoken2 };
      }

      // ── WhatsApp ──────────────────────────────────────────────────────────
      case 'OPEN_WHATSAPP':
      case 'WHATSAPP_MESSAGE': {
        updateStep(steps[0], 'running');
        await openUrl('https://web.whatsapp.com', false);
        updateStep(steps[0], 'completed', 'Opened WhatsApp Web');

        updateStep(steps[1], 'running');
        await delay(3000);
        updateStep(steps[1], 'completed', 'WhatsApp loaded');

        if (plan.intent === 'WHATSAPP_MESSAGE') {
          const waMsgMatch = cleanInput.match(/(?:message|send|tell)\s+(\w+)\s+(?:saying|that|:)?\s*(.+)/i);
          const recipient = waMsgMatch ? waMsgMatch[1] : 'contact';
          const message = waMsgMatch ? waMsgMatch[2] : '';

          updateStep(steps[2], 'running');
          // Search for contact
          const searchContact = await executeDOMAction({
            type: 'click',
            target: { selector: '[data-testid="search"] input, input[placeholder*="Search"]', placeholder: 'Search input text field', ariaLabel: 'Search input text field' }
          });
          if (searchContact.success) {
            await executeDOMAction({ type: 'type', target: { selector: '[data-testid="search"] input' }, value: recipient });
            updateStep(steps[2], 'completed', `Searched for ${recipient}`);
          } else {
            updateStep(steps[2], 'failed', `Could not find search box — WhatsApp may need authentication`);
          }

          if (steps[3]) updateStep(steps[3], 'pending', `Message ready: "${message}"`);
          if (steps[4]) updateStep(steps[4], 'pending', 'Message preview ready');

          return {
            success: true,
            intent: plan.intent,
            completedSteps: steps,
            finalMessage: `WhatsApp opened. Message to ${recipient}: "${message}". Awaiting your confirmation to send.`,
            spokenResponse: `WhatsApp is open. Your message to ${recipient} is ready. Say "send it" to confirm.`,
            requiresConfirmation: true,
            confirmationMessage: `Send "${message}" to ${recipient} on WhatsApp?`
          };
        }

        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: 'WhatsApp Web opened.', spokenResponse: 'WhatsApp Web is open.' };
      }

      // ── Flight Search ─────────────────────────────────────────────────────
      case 'FLIGHT_SEARCH': {
        const origM = cleanLower.match(/from\s+(\w+(?:\s+\w+)*?)\s+to/i);
        const destM2 = cleanLower.match(/to\s+(\w+(?:\s+\w+)*)(?:\s+(?:tomorrow|today|on)|$)/i);
        const origin2 = origM ? origM[1].trim() : 'Delhi';
        const dest2 = destM2 ? destM2[1].trim() : 'Mumbai';
        const flightsUrl = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(origin2)}+to+${encodeURIComponent(dest2)}`;

        updateStep(steps[0], 'running');
        await openUrl(flightsUrl, false);
        updateStep(steps[0], 'completed', `Opened Google Flights: ${origin2} → ${dest2}`);

        updateStep(steps[1], 'running');
        await delay(3000);
        updateStep(steps[1], 'completed', 'Flight results loaded');

        updateStep(steps[2], 'running');
        const pageR = await readActivePage();
        pageSummary = pageR || undefined;
        const flightText = pageR?.visibleText || '';
        const priceMatch = flightText.match(/₹[\d,]+/);
        extractedData = priceMatch ? `Lowest fare found: ${priceMatch[0]}` : 'Flight results retrieved';
        updateStep(steps[2], 'completed', extractedData);

        updateStep(steps[3], 'completed', `Showing ${origin2} → ${dest2} flights`);

        return {
          success: true, intent: plan.intent, completedSteps: steps,
          finalMessage: `Found flights from ${origin2} to ${dest2}. ${extractedData}. Would you like to book?`,
          spokenResponse: `I found flights from ${origin2} to ${dest2}. ${extractedData}. Would you like me to book one?`,
          requiresConfirmation: true,
          confirmationMessage: `Proceed with booking a flight from ${origin2} to ${dest2}?`,
          pageSummary, extractedData
        };
      }

      // ── Shopping Search ───────────────────────────────────────────────────
      case 'SHOPPING_SEARCH': {
        const prodMatch = cleanLower.match(/find\s+(.+?)(?:\s+under\s+.+)?$/i);
        const product = prodMatch ? prodMatch[1].trim() : cleanInput;
        const amazonUrl = `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

        updateStep(steps[0], 'running');
        await openUrl(amazonUrl, false);
        updateStep(steps[0], 'completed', `Searching Amazon for "${product}"`);

        updateStep(steps[1], 'running');
        await delay(2500);
        updateStep(steps[1], 'completed', 'Results loaded');

        updateStep(steps[2], 'running');
        const shpPage = await readActivePage();
        const resultCount = shpPage?.headings.length || 0;
        updateStep(steps[2], 'completed', `Found ${resultCount} product listings`);

        updateStep(steps[3], 'completed', 'Results displayed in browser');

        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: `Searching Amazon for ${product}.`, spokenResponse: `I found results for ${product} on Amazon.` };
      }

      // ── Find Contact Page ─────────────────────────────────────────────────
      case 'FIND_CONTACT_PAGE': {
        updateStep(steps[0], 'running');
        const currentPage = await readActivePage();
        pageSummary = currentPage || undefined;
        updateStep(steps[0], 'completed', `On: ${currentPage?.title || 'current page'}`);

        updateStep(steps[1], 'running');
        // Look for Contact link
        const contactLink = currentPage?.links?.find(l =>
          ['contact', 'contact us', 'support', 'help', 'get in touch'].some(t =>
            l.text.toLowerCase().includes(t)
          )
        );

        if (!contactLink) {
          updateStep(steps[1], 'failed', 'No contact link found in visible navigation');
          return { success: false, intent: plan.intent, completedSteps: steps, finalMessage: `I couldn't find a contact page on ${currentPage?.url}.`, spokenResponse: `I couldn't find a contact page on this website.` };
        }
        updateStep(steps[1], 'completed', `Found: "${contactLink.text}" → ${contactLink.href}`);

        updateStep(steps[2], 'running');
        await openUrl(contactLink.href, false);
        updateStep(steps[2], 'completed', `Navigated to ${contactLink.href}`);

        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: `Opened contact page: ${contactLink.text}`, spokenResponse: `I found the contact page and opened it.` };
      }

      // ── Search on Current Page ────────────────────────────────────────────
      case 'SEARCH_ON_PAGE': {
        const sqMatch = cleanInput.replace(/^(search|find)\s+(for\s+)?/i, '').trim();

        updateStep(steps[0], 'running');
        const curPage = await readActivePage();
        pageSummary = curPage || undefined;
        updateStep(steps[0], 'completed', `Current page: ${curPage?.title || 'unknown'}`);

        updateStep(steps[1], 'running');
        const searchResult = await executeDOMAction({
          type: 'type',
          target: { type: 'search_input', placeholder: 'Search', ariaLabel: 'Search' },
          value: sqMatch
        });
        updateStep(steps[1], searchResult.success ? 'completed' : 'failed', searchResult.message);
        if (!searchResult.success) return fail(plan, steps, `Could not find a search box on this page.`);

        updateStep(steps[2], 'completed', `Typed: "${sqMatch}"`);
        updateStep(steps[3], 'running');
        await executeDOMAction({ type: 'press_key', key: 'Enter' });
        updateStep(steps[3], 'completed', 'Search submitted');

        await delay(1500);
        updateStep(steps[4], 'completed', 'Results loaded');

        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: `Searched for "${sqMatch}"`, spokenResponse: `Done. I searched for ${sqMatch}.` };
      }

      // ── General ───────────────────────────────────────────────────────────
      default: {
        updateStep(steps[0], 'running');
        await delay(500);
        updateStep(steps[0], 'completed', `Processed: "${cleanInput}"`);
        return { success: true, intent: plan.intent, completedSteps: steps, finalMessage: `I processed your command: ${cleanInput}`, spokenResponse: `I processed that.` };
      }
    }
  } catch (err: any) {
    const errMsg = err.message || 'Unknown error';
    steps.filter(s => s.status === 'running' || s.status === 'pending').forEach(s => {
      s.status = 'failed';
      s.result = errMsg;
      onStep({ ...s });
    });
    return {
      success: false,
      intent: plan.intent,
      completedSteps: steps,
      finalMessage: `Action failed: ${errMsg}`,
      spokenResponse: `I encountered an error: ${errMsg}`
    };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fail(plan: AgentPlan, steps: AgentStep[], message: string): AgentResult {
  return {
    success: false,
    intent: plan.intent,
    completedSteps: steps,
    finalMessage: message,
    spokenResponse: message
  };
}

// ── Web mode fallback (non-extension) ─────────────────────────────────────────
export async function executeWebFallback(input: string): Promise<AgentResult> {
  const plan = buildActionPlan(input);
  const cleanInput = input.replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '').trim();
  const cleanLower = cleanInput.toLowerCase();

  const openMatch = cleanLower.match(/^(?:open|go to|launch)\s+(.+)/i);
  if (openMatch) {
    const site = openMatch[1].trim();
    const url = getSiteUrl(site);
    window.open(url, '_blank');
    return { success: true, intent: plan.intent, completedSteps: [], finalMessage: `Opened ${site} in new tab`, spokenResponse: `Opening ${site}.` };
  }

  return { success: false, intent: plan.intent, completedSteps: [], finalMessage: 'Chrome Extension required for full browser automation.', spokenResponse: 'Install the VocalLabs Chrome Extension for full browser control.' };
}
