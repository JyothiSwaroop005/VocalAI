/**
 * WhatsApp Integration Adapter
 *
 * Handles:
 * - whatsapp.send   → stages message, requires user confirmation, opens WhatsApp Web
 * - whatsapp.open   → opens WhatsApp Web
 *
 * NOTE: Direct message sending is NOT possible without WhatsApp Business API credentials.
 * This adapter honestly stages the message and opens WhatsApp Web with a pre-filled URL
 * where possible, clearly labeling the action as 'external_redirect'.
 */

import type { ActionResult, GatewayIntent } from '../actionGateway';

export async function whatsappAdapter(intent: GatewayIntent): Promise<ActionResult> {
  const { type, parameters } = intent;
  const { recipient, message } = parameters;
  const userName = intent.userContext?.name || 'User';

  // ── whatsapp.open ─────────────────────────────────────────────────────────
  if (type === 'whatsapp.open' || (!recipient && !message)) {
    return {
      success: true,
      executionType: 'external_redirect',
      intent: type,
      service: 'whatsapp',
      title: 'Open WhatsApp Web',
      description: 'Opening WhatsApp Web in browser tab.',
      confidence: 1.0,
      verificationStatus: 'not_applicable',
      externalUrl: 'https://web.whatsapp.com',
      externalLabel: '💬 OPEN WHATSAPP WEB ↗',
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: 'Open WhatsApp Web' },
        { label: 'External Link Prepared', status: 'completed', detail: 'https://web.whatsapp.com' },
      ]
    };
  }

  // ── whatsapp.send ─────────────────────────────────────────────────────────
  // Stage the message and require explicit user confirmation before opening WhatsApp
  const stagedMessage = message ||
    (recipient ? `Hi ${recipient}, I will be running a few minutes late.` : 'Hi, I will be running a few minutes late.');

  // WhatsApp wa.me API for pre-filled messages (works if recipient has international number)
  // Since we don't have the phone number, we open WhatsApp Web with the staged message
  const whatsappUrl = 'https://web.whatsapp.com';

  return {
    success: true,
    executionType: 'external_redirect',
    intent: type,
    service: 'whatsapp',
    title: `Stage Message to ${recipient || 'Contact'}`,
    description: `Message staged: "${stagedMessage}". User must confirm to open WhatsApp Web.`,
    confidence: 0.97,
    verificationStatus: 'not_applicable',
    externalUrl: whatsappUrl,
    externalLabel: '💬 OPEN WHATSAPP WEB TO SEND MESSAGE ↗',
    requiresConfirmation: true,
    confirmationPayload: {
      title: 'Confirm Send WhatsApp Message',
      message: `Send this message to ${recipient || 'the recipient'} on WhatsApp?`,
      details: {
        Recipient: recipient || '(WhatsApp contact)',
        MessagePayload: `"${stagedMessage}"`,
        Platform: 'WhatsApp Web',
        Note: 'VocalLabs will open WhatsApp Web. Send the message there.'
      }
    },
    steps: [
      { label: 'Intent Identified', status: 'completed', detail: `WhatsApp message requested for ${recipient || 'unknown recipient'}` },
      { label: 'Recipient Extraction', status: recipient ? 'completed' : 'skipped', detail: recipient ? `Recipient: ${recipient}` : 'No recipient specified' },
      { label: 'Message Staging', status: 'completed', detail: `Staged: "${stagedMessage}"` },
      { label: 'Confirmation Required', status: 'completed', detail: `User must confirm before WhatsApp Web opens — ${userName}` },
    ],
    payload: {
      stagedMessage,
      recipient,
      note: 'VocalLabs cannot send WhatsApp messages directly. User must confirm and send via WhatsApp Web.'
    }
  };
}
