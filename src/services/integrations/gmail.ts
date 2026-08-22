/**
 * Gmail Integration Adapter
 *
 * Handles:
 * - gmail.open    → open Gmail inbox
 * - gmail.compose → open Gmail compose window with pre-filled params
 * - gmail.search  → open Gmail with a search query
 *
 * ExecutionType: always 'external_redirect' — Gmail requires browser/authentication.
 * VocalLabs does NOT send emails directly (no API key / OAuth flow in demo mode).
 */

import type { ActionResult, GatewayIntent } from '../actionGateway';

export async function gmailAdapter(intent: GatewayIntent): Promise<ActionResult> {
  const { type, parameters } = intent;
  const { action, query } = parameters;

  // ── gmail.compose ──────────────────────────────────────────────────────────
  if (type === 'gmail.compose' || action === 'compose') {
    // Extract recipient / subject from query if present
    const recipientMatch = query?.match(/(?:to|for)\s+([A-Za-z0-9@.\s]+?)(?:\s+(?:about|saying|with subject|re:)|$)/i);
    const subjectMatch = query?.match(/(?:about|subject|re:|regarding)\s+(.+?)(?:\s+(?:saying|with body)|$)/i);
    const recipient = recipientMatch ? recipientMatch[1].trim() : '';
    const subject = subjectMatch ? subjectMatch[1].trim() : '';

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1${recipient ? `&to=${encodeURIComponent(recipient)}` : ''}${subject ? `&su=${encodeURIComponent(subject)}` : ''}`;

    return {
      success: true,
      executionType: 'external_redirect',
      intent: type,
      service: 'gmail',
      title: 'Compose Email in Gmail',
      description: `Gmail compose window prepared${recipient ? ` for ${recipient}` : ''}.`,
      confidence: 0.97,
      verificationStatus: 'not_applicable',
      externalUrl: gmailComposeUrl,
      externalLabel: '📧 OPEN GMAIL COMPOSE ↗',
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: 'Email compose requested' },
        { label: 'Recipient Extraction', status: recipient ? 'completed' : 'skipped', detail: recipient ? `To: ${recipient}` : 'No recipient specified' },
        { label: 'Subject Extraction', status: subject ? 'completed' : 'skipped', detail: subject ? `Subject: ${subject}` : 'No subject specified' },
        { label: 'Gmail Compose URL Built', status: 'completed', detail: gmailComposeUrl },
      ],
      payload: { recipient, subject }
    };
  }

  // ── gmail.search ──────────────────────────────────────────────────────────
  if (type === 'gmail.search' || action === 'search') {
    const searchTerm = query?.replace(/(?:search|find|look for|show me)?\s*(?:emails?|mails?|inbox)?\s*(?:about|from|to|with)?\s*/i, '').trim() || '';
    const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(searchTerm)}`;

    return {
      success: true,
      executionType: 'external_redirect',
      intent: type,
      service: 'gmail',
      title: `Search Gmail: "${searchTerm}"`,
      description: `Gmail search prepared for: ${searchTerm}`,
      confidence: 0.96,
      verificationStatus: 'not_applicable',
      externalUrl: gmailSearchUrl,
      externalLabel: `📧 SEARCH GMAIL FOR "${searchTerm.toUpperCase()}" ↗`,
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: `Search emails: ${searchTerm}` },
        { label: 'Search Query Built', status: 'completed', detail: `Query: "${searchTerm}"` },
        { label: 'Gmail Search URL Ready', status: 'completed', detail: gmailSearchUrl },
      ]
    };
  }

  // ── gmail.open (default) ───────────────────────────────────────────────────
  return {
    success: true,
    executionType: 'external_redirect',
    intent: type,
    service: 'gmail',
    title: 'Open Gmail Inbox',
    description: 'Opening Gmail inbox in browser tab.',
    confidence: 1.0,
    verificationStatus: 'not_applicable',
    externalUrl: 'https://mail.google.com',
    externalLabel: '📧 OPEN GMAIL INBOX ↗',
    steps: [
      { label: 'Intent Identified', status: 'completed', detail: 'Open Gmail' },
      { label: 'External Link Prepared', status: 'completed', detail: 'https://mail.google.com' },
    ]
  };
}
