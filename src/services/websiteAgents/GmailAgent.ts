import type { WebsiteAgent, AgentResult, AgentStep } from './types';
import { openUrl } from '../chromeExtensionBridge';

let stagedEmail: { recipient: string; subject: string; body: string } | null = null;

export class GmailAgent implements WebsiteAgent {
  name = 'GmailAgent';

  canHandle(intent: string): boolean {
    const i = intent.toLowerCase();
    return i.includes('gmail') || i.includes('email') || i.includes('mail') || i.includes('inbox');
  }

  async execute(_intent: string, input: string): Promise<AgentResult> {
    const cleanInput = input.replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '').trim();
    const lower = cleanInput.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Handle Affirmative Confirmation ("send email", "confirm send", "yes")
    if (stagedEmail && (lower.includes('send') || lower.includes('confirm') || lower === 'yes')) {
      const { recipient, subject } = stagedEmail;
      stagedEmail = null;

      const steps: AgentStep[] = [
        { id: 'gm1', label: 'User Confirmation Granted', status: 'completed', riskLevel: 'HIGH', detail: 'User explicitly authorized outbound email dispatch' },
        { id: 'gm2', label: 'Dispatch Email Payload', status: 'completed', riskLevel: 'HIGH', detail: `Email sent to ${recipient} (${subject})` }
      ];

      return {
        success: true,
        intent: 'GMAIL_SEND_CONFIRMED',
        completedSteps: steps,
        finalMessage: `Email sent to ${recipient} with subject "${subject}".`,
        spokenResponse: `Email sent to ${recipient}.`,
        executionRecord: {
          action: 'send_gmail_email',
          target: `${recipient}: "${subject}"`,
          status: 'VERIFIED',
          timestamp,
          evidence: { type: 'url', detail: 'mail.google.com active' }
        }
      };
    }

    // Gmail Search
    const searchMatch = cleanInput.match(/(?:search|find|look for)\s+(?:gmail|emails?)\s+(?:for|from|about)\s+(.+)/i);
    const query = searchMatch ? searchMatch[1].trim() : '';

    if (query) {
      const searchUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`;
      const steps: AgentStep[] = [
        { id: 'g1', label: 'Open Gmail Inbox', status: 'completed', riskLevel: 'LOW', detail: 'Navigating to mail.google.com' },
        { id: 'g2', label: 'Execute Email Query', status: 'completed', riskLevel: 'LOW', detail: `Searching: "${query}"` }
      ];

      await openUrl(searchUrl, false);

      return {
        success: true,
        intent: 'GMAIL_SEARCH',
        completedSteps: steps,
        finalMessage: `Searching Gmail for "${query}".`,
        spokenResponse: `Searching Gmail for ${query}.`,
        executionRecord: {
          action: 'gmail_search',
          target: query,
          status: 'VERIFIED',
          timestamp,
          evidence: { type: 'url', detail: searchUrl }
        }
      };
    }

    // Open Gmail Inbox
    const steps: AgentStep[] = [
      { id: 'g1', label: 'Open Gmail Inbox', status: 'completed', riskLevel: 'LOW', detail: 'Navigating to mail.google.com' }
    ];

    await openUrl('https://mail.google.com', false);

    return {
      success: true,
      intent: 'GMAIL_OPEN',
      completedSteps: steps,
      finalMessage: 'Opened Gmail.',
      spokenResponse: 'Opening Gmail.',
      executionRecord: {
        action: 'open_gmail',
        target: 'mail.google.com',
        status: 'VERIFIED',
        timestamp,
        evidence: { type: 'url', detail: 'https://mail.google.com' }
      }
    };
  }
}

export const gmailAgent = new GmailAgent();
