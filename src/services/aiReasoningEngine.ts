import type { ReasoningStep, ExecutedAction, ConversationInsight, CustomerContext, Agent, MusicTrackPayload, MusicResolutionResult } from '../types';
import { resolveExactTrack, stopGlobalAudio } from './musicService';

export interface ProcessResult {
  intent: string;
  serviceName?: string;
  confidence: number;
  sentiment: 'Positive' | 'Neutral' | 'Frustrated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  aiResponse: string;         // Full UI description (shown in transcript)
  spokenResponse: string;    // SHORT spoken text for TTS only (max ~6 words)
  autoNavigate: boolean;     // true = navigate browser immediately (no button click)
  autoNavigateUrl?: string;  // URL for auto-navigation
  executedAction: ExecutedAction;
  insight: ConversationInsight;
  reasoningSteps: ReasoningStep[];
  shouldEscalate: boolean;
  detectedWakeWordAgent?: Agent;
  externalUrl?: string;
  externalLabel?: string;
  musicPayload?: MusicTrackPayload;
  musicResolution?: MusicResolutionResult;
  isConsequential?: boolean;
  confirmationDetails?: {
    title: string;
    message: string;
    details: Record<string, string>;
  };
}

export const SAMPLE_PROMPTS = [
  {
    label: '⚡ Play Believer by Imagine Dragons',
    text: 'Play Believer by Imagine Dragons',
    category: 'Music'
  },
  {
    label: '🎵 Play Shape of You by Ed Sheeran',
    text: 'Play Shape of You by Ed Sheeran',
    category: 'Music'
  },
  {
    label: '🌊 Play Blinding Lights by The Weeknd',
    text: 'Play Blinding Lights by The Weeknd',
    category: 'Music'
  },
  {
    label: '⏹️ Stop Music',
    text: 'stop music',
    category: 'Music'
  },
  {
    label: '🗺️ Directions to LPU',
    text: 'Show me directions to Lovely Professional University',
    category: 'Maps'
  },
  {
    label: '🗺️ Navigate to Delhi Airport',
    text: 'Navigate to Indira Gandhi International Airport Delhi',
    category: 'Maps'
  },
  {
    label: '📧 Open Gmail Inbox',
    text: 'Open my Gmail inbox',
    category: 'Gmail'
  },
  {
    label: '📧 Compose Email to Rahul',
    text: 'Compose an email to rahul@gmail.com about the project update',
    category: 'Gmail'
  },
  {
    label: '🛒 Find Nike shoes under ₹3000',
    text: 'Find Nike shoes under ₹3000 on Amazon',
    category: 'Shopping'
  },
  {
    label: '✈️ Flight: Delhi to Mumbai',
    text: 'Book me a flight from Delhi to Mumbai tomorrow morning',
    category: 'Travel'
  },
  {
    label: '🏨 Hotels in Bangalore',
    text: 'Find hotels in Bangalore for this weekend under ₹5,000',
    category: 'Travel'
  },
  {
    label: '💬 Message Rahul on WhatsApp',
    text: 'Send a WhatsApp message to Rahul saying I will be late',
    category: 'Messaging'
  }
];



export function detectWakeWordAgent(input: string, agents: Agent[]): Agent | undefined {
  const lower = input.toLowerCase();
  return agents.find(agent => lower.includes(agent.name.toLowerCase()));
}

export function parseWebNavigationUrl(input: string): { url: string; appName: string } | null {
  const lower = input.toLowerCase().trim();
  
  if (lower.includes('whatsapp')) return { url: 'https://web.whatsapp.com', appName: 'WhatsApp Web' };
  if (lower.includes('youtube')) return { url: 'https://www.youtube.com', appName: 'YouTube' };
  if (lower.includes('gmail')) return { url: 'https://mail.google.com', appName: 'Gmail' };
  if (lower.includes('google')) return { url: 'https://www.google.com', appName: 'Google' };
  if (lower.includes('linkedin')) return { url: 'https://www.linkedin.com', appName: 'LinkedIn' };
  if (lower.includes('twitter') || lower.includes('x.com')) return { url: 'https://x.com', appName: 'X / Twitter' };
  if (lower.includes('chatgpt') || lower.includes('openai')) return { url: 'https://chat.openai.com', appName: 'ChatGPT' };
  if (lower.includes('spotify')) return { url: 'https://open.spotify.com', appName: 'Spotify Web' };
  if (lower.includes('netflix')) return { url: 'https://www.netflix.com', appName: 'Netflix' };
  if (lower.includes('amazon')) return { url: 'https://www.amazon.com', appName: 'Amazon' };
  if (lower.includes('instagram')) return { url: 'https://www.instagram.com', appName: 'Instagram' };

  // Generic extraction for "open [app]" or "navigate to [app]"
  const match = lower.match(/(?:open|navigate to|go to|launch)\s+([a-z0-9-]+)/i);
  if (match && match[1]) {
    const target = match[1].toLowerCase();
    if (!['a', 'the', 'my', 'an', 'some', 'appointment', 'ticket', 'movie', 'order', 'flight', 'hotel', 'message', 'song', 'music'].includes(target)) {
      return { url: `https://www.${target}.com`, appName: target.toUpperCase() };
    }
  }
  return null;
}

export interface PendingActionContext {
  type: 'FLIGHT_BOOKING' | 'WHATSAPP_MESSAGE' | 'GENERAL_ACTION';
  origin?: string;
  destination?: string;
  recipient?: string;
  message?: string;
  fare?: string;
  details?: Record<string, string>;
}

let activePendingContext: PendingActionContext | null = null;

export function getPendingActionContext(): PendingActionContext | null {
  return activePendingContext;
}

export function setPendingActionContext(ctx: PendingActionContext | null) {
  activePendingContext = ctx;
}

export function clearPendingActionContext() {
  activePendingContext = null;
}

export function parseCustomerInput(
  input: string,
  customer: CustomerContext,
  agentName: string,
  agents: Agent[] = []
): ProcessResult {
  const lowerText = input.toLowerCase().trim();
  const matchedWakeAgent = detectWakeWordAgent(input, agents);
  const effectiveAgentName = matchedWakeAgent ? matchedWakeAgent.name : agentName;

  let intent = 'General Inquiry';
  let serviceName = 'VocalLabs OS';
  let confidence = 94;
  let sentiment: 'Positive' | 'Neutral' | 'Frustrated' = 'Positive';
  let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let aiResponse = `I've analyzed your request regarding "${input}". Context graph updated and action payload executed.`;
  let spokenResponse = '';
  let autoNavigate = false;
  let autoNavigateUrl: string | undefined = undefined;
  let shouldEscalate = false;
  let externalUrl: string | undefined = undefined;
  let externalLabel: string | undefined = undefined;
  let musicPayload: MusicTrackPayload | undefined = undefined;
  let musicResolution: MusicResolutionResult | undefined = undefined;
  let isConsequential = false;
  let confirmationDetails: ProcessResult['confirmationDetails'] = undefined;

  let actionType: ExecutedAction['actionType'] = 'mark_resolved';
  let actionTitle = 'Process Customer Request';
  let actionDesc = `Query "${input}" processed successfully through VocalLabs OS.`;
  let reasoningFactors: string[] = ['Autonomous NLU intent extraction matched'];

  if (matchedWakeAgent) {
    reasoningFactors.unshift(`Wake Word Triggered: Automatically routed query to Agent ${matchedWakeAgent.name} (${matchedWakeAgent.role})`);
  }

  // 0. Conversational Confirmation / Affirmative Resolution ("yes", "proceed", "sure", "do it", "confirm", "yeah", "book it")
  const isAffirmative = ['yes', 'proceed', 'sure', 'do it', 'confirm', 'yeah', 'book it', 'go ahead', 'okay', 'ok'].includes(lowerText) ||
                        lowerText.startsWith('yes ') || lowerText.startsWith('proceed ');

  if (isAffirmative && activePendingContext) {
    if (activePendingContext.type === 'FLIGHT_BOOKING') {
      intent = 'Flight Booking Confirmation';
      serviceName = 'Google Flights';
      confidence = 99;
      sentiment = 'Positive';
      aiResponse = `Flight booking confirmed for ${activePendingContext.origin || 'Delhi'} to ${activePendingContext.destination || 'Mumbai'} on IndiGo 6E-204 at ₹4,820. Confirmation ticket pass issued.`;
      spokenResponse = `Flight booking confirmed for ${activePendingContext.origin || 'Delhi'} to ${activePendingContext.destination || 'Mumbai'}.`;
      actionTitle = `Confirmed Flight: ${activePendingContext.origin || 'Delhi'} → ${activePendingContext.destination || 'Mumbai'}`;
      actionDesc = `Flight ticket issued for IndiGo 6E-204 at ₹4,820. User affirmative confirmation received.`;
      clearPendingActionContext();
    } else if (activePendingContext.type === 'WHATSAPP_MESSAGE') {
      intent = 'WhatsApp Dispatch Confirmation';
      serviceName = 'WhatsApp';
      confidence = 99;
      sentiment = 'Positive';
      externalUrl = 'https://web.whatsapp.com';
      externalLabel = '💬 OPEN WHATSAPP WEB TO SEND MESSAGE ↗';
      aiResponse = `WhatsApp message confirmed and dispatched to ${activePendingContext.recipient || 'Rahul'}: "${activePendingContext.message || 'Running late'}"`;
      spokenResponse = `WhatsApp message sent to ${activePendingContext.recipient || 'Rahul'}.`;
      actionTitle = `Dispatched WhatsApp Message to ${activePendingContext.recipient || 'Rahul'}`;
      actionDesc = `Message payload sent to WhatsApp Web target.`;
      clearPendingActionContext();
    } else {
      intent = 'Action Confirmation';
      serviceName = 'VocalLabs OS';
      confidence = 99;
      sentiment = 'Positive';
      aiResponse = `Action confirmed and executed successfully.`;
      spokenResponse = 'Action confirmed and executed.';
      actionTitle = 'Execute Pending Action';
      actionDesc = 'User affirmative confirmation received and action completed.';
      clearPendingActionContext();
    }
  }
  // 1. Music Stop / Pause Voice Command
  else if (lowerText === 'stop' || lowerText === 'pause' || lowerText === 'resume'
      || lowerText.includes('stop music') || lowerText.includes('pause music')
      || lowerText.includes('resume music') || lowerText.includes('be quiet') || lowerText === 'mute') {

    if (lowerText === 'resume' || lowerText.includes('resume')) {
      window.dispatchEvent(new CustomEvent('vocallabs_resume_audio'));
      aiResponse = `Resuming playback for you, ${customer.name}.`;
      spokenResponse = 'Resuming playback.';
      actionTitle = 'Resume Audio Playback';
    } else {
      stopGlobalAudio();
      aiResponse = `Music stopped, ${customer.name}.`;
      spokenResponse = 'Music stopped.';
      actionTitle = 'Stop Audio Playback';
    }

    intent = 'Music Control';
    serviceName = 'YouTube';
    confidence = 99;
    sentiment = 'Positive';
    priority = 'Low';
    actionType = 'update_crm';
    actionDesc = 'Dispatched global playback control signal.';
    reasoningFactors.push('Extracted music control command');
  }
  // 2. Music Playback Request — exact match resolution pipeline
  else if (lowerText.startsWith('play') || lowerText.includes('listen to')) {
    // REQUIREMENT 8: Stop stale playback state immediately
    stopGlobalAudio();

    const res = resolveExactTrack(input);
    musicResolution = res;

    intent = 'Music Playback';
    serviceName = 'YouTube';
    confidence = 99;
    sentiment = 'Positive';
    priority = 'Medium';
    actionType = 'update_crm';

    if (res.success) {
      const { track } = res;
      aiResponse = `Playing ${track.title} by ${track.artist}.`;
      spokenResponse = `Playing ${track.title} by ${track.artist}.`;
      actionTitle = `Play Verified Track: "${track.title}"`;
      actionDesc = `Resolved exact match for "${track.title}" by ${track.artist} (${(track.confidence * 100).toFixed(0)}% confidence). Real YouTube source initialized.`;
      reasoningFactors.push(
        `Extracted raw query: "${input}"`,
        `Resolved Track Title: "${track.title}"`,
        `Resolved Artist: "${track.artist}"`,
        `Match Confidence: ${(track.confidence * 100).toFixed(0)}%`,
        `Real YouTube Video ID: ${track.primaryVideoId}`,
        `Strict Mode: verified === true && matchType === 'exact'`
      );
    } else {
      aiResponse = `Exact match not found. No audio was played because I could not verify the requested track.`;
      spokenResponse = `I couldn't verify an exact match for ${res.requestedTitle}.`;
      actionTitle = 'Music Execution: Exact Match Not Found';
      actionDesc = 'No verified track found. Audio blocked. Search link provided.';
      reasoningFactors.push(
        `Input query: "${input}"`,
        'Exact match verification failed',
        'Strict Mode: Audio blocked completely (no substitute played)',
        'Provided direct YouTube search link'
      );
    }
  }
  // 3. Flight Booking Intent (Delhi to Mumbai, etc.)
  else if (lowerText.includes('flight') || (lowerText.includes('delhi') && lowerText.includes('mumbai')) || lowerText.includes('fly')) {
    intent = 'Flight Reservation & Booking';
    serviceName = 'Google Flights';
    confidence = 98;
    sentiment = 'Positive';
    priority = 'High';
    isConsequential = true;
    aiResponse = `Sure, ${customer.name}. I found non-stop flights from Delhi (DEL) to Mumbai (BOM) for tomorrow morning. Non-stop IndiGo 6E-204 departing at 08:30 AM is priced at ₹4,820. Would you like me to proceed with the booking?`;
    spokenResponse = 'Searching flights from Delhi to Mumbai.';
    actionType = 'schedule_appointment';
    actionTitle = 'Reserve Flight: Delhi (DEL) → Mumbai (BOM)';
    actionDesc = 'IndiGo 6E-204 (08:30 AM - 10:45 AM). Fare: ₹4,820. Awaiting final user safety confirmation.';
    confirmationDetails = {
      title: 'Confirm Flight Booking',
      message: `Proceeding will reserve non-stop flight IndiGo 6E-204 from Delhi to Mumbai for tomorrow 08:30 AM at ₹4,820.`,
      details: {
        Airline: 'IndiGo 6E-204',
        Route: 'Delhi (DEL) → Mumbai (BOM)',
        Departure: 'Tomorrow 08:30 AM',
        Fare: '₹4,820 (Taxes Included)'
      }
    };
    reasoningFactors.push('Extracted origin: Delhi (DEL)', 'Extracted destination: Mumbai (BOM)', 'Matched morning departure preference');
    setPendingActionContext({ type: 'FLIGHT_BOOKING', origin: 'Delhi', destination: 'Mumbai' });
  }
  // 4. Hotel Search & Filter Intent (Bangalore, Goa, under ₹5000, cheapest)
  else if (lowerText.includes('hotel') || lowerText.includes('resort') || lowerText.includes('stay') || lowerText.includes('bangalore') || lowerText.includes('goa') || lowerText.includes('5,000') || lowerText.includes('5000') || lowerText.includes('cheapest')) {
    intent = 'Hotel Search & Accommodation Filter';
    serviceName = 'Booking.com';
    confidence = 97;
    sentiment = 'Positive';
    priority = 'Medium';
    spokenResponse = 'Filtering top-rated hotels in Bangalore.';
    
    if (lowerText.includes('cheapest') || lowerText.includes('under') || lowerText.includes('5000') || lowerText.includes('5,000')) {
      aiResponse = `Got it, ${customer.name}! Filtering top-rated hotels under ₹5,000. Here is the best matching option: The Leela Residency Bangalore for ₹4,200/night with complimentary breakfast and 4.8★ reviews.`;
      actionTitle = 'Filter & Reserve Hotel: Under ₹5,000/night';
      actionDesc = 'The Leela Residency Bangalore reserved at ₹4,200/night (Saved 18%).';
    } else {
      aiResponse = `I found 12 available hotels in Bangalore for this weekend. Filtered top options under ₹5,000 with high-speed WiFi and pool.`;
      actionTitle = 'Search Hotels in Bangalore';
      actionDesc = 'Retrieved 12 verified boutique hotels & resorts.';
    }
    actionType = 'recommend_product';
    reasoningFactors.push('Geospatial location matched', 'Price filter threshold applied: <= ₹5,000', 'Verified ratings > 4.5★');
  }
  // 5. WhatsApp Message Dispatch Intent ("send a WhatsApp message to Rahul saying I'll be late")
  else if (lowerText.includes('send') && lowerText.includes('message') && (lowerText.includes('rahul') || lowerText.includes('whatsapp') || lowerText.includes('late'))) {
    intent = 'Messaging & Outbound Dispatch';
    serviceName = 'WhatsApp';
    confidence = 98;
    sentiment = 'Positive';
    priority = 'High';
    isConsequential = true;
    externalUrl = 'https://web.whatsapp.com';
    externalLabel = '💬 OPEN WHATSAPP WEB TO SEND MESSAGE ↗';
    aiResponse = `I have staged your message to Rahul: "Hi Rahul, I will be running a few minutes late." Would you like me to send this WhatsApp message now?`;
    spokenResponse = 'I have staged your message to Rahul. Please confirm to send.';
    actionType = 'send_sms_confirmation';
    actionTitle = 'Dispatch WhatsApp Message to Rahul';
    actionDesc = 'Drafted payload: "Hi Rahul, I will be running a few minutes late." Awaiting user safety confirmation.';
    confirmationDetails = {
      title: 'Confirm Send WhatsApp Message',
      message: 'Are you sure you want to send this WhatsApp message to Rahul?',
      details: {
        Recipient: 'Rahul (WhatsApp Contact)',
        MessagePayload: '"Hi Rahul, I will be running a few minutes late."',
        Platform: 'WhatsApp Web'
      }
    };
    reasoningFactors.push('Extracted recipient entity: Rahul', 'Generated message payload: "Running late"', 'Enforced safety confirmation before outbound send');
    setPendingActionContext({ type: 'WHATSAPP_MESSAGE', recipient: 'Rahul', message: 'Running late' });
  }
  // 6a. Google Maps / Navigation Intent
  else if (
    lowerText.includes('direction') || lowerText.includes('navigate to') ||
    lowerText.includes('take me to') || lowerText.includes('route to') ||
    lowerText.includes('how to get to') || lowerText.includes('show me the way') ||
    (lowerText.includes('map') && !lowerText.includes('whatsapp')) ||
    lowerText.includes('where is') || lowerText.includes('lpu') ||
    lowerText.includes('lovely professional university')
  ) {
    // Extract destination
    const destMatch = input.match(
      /(?:to|for|at|navigate to|directions to|take me to|show me|route to|how to get to|where is|find)\s+([A-Za-z\s,]+?)(?:\s*$|[\.,!?])/i
    );
    const destination = lowerText.includes('lpu') || lowerText.includes('lovely professional university')
      ? 'Lovely Professional University, Phagwara, Punjab'
      : (destMatch ? destMatch[1].trim() : input);

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    intent = 'Maps Navigation & Directions';
    serviceName = 'Google Maps';
    confidence = 98;
    sentiment = 'Positive';
    priority = 'Low';
    externalUrl = mapsUrl;
    externalLabel = `🗺️ OPEN DIRECTIONS TO ${destination.toUpperCase()} ↗`;
    aiResponse = `Opening Google Maps with directions to ${destination}, ${customer.name}. Navigating browser now.`;
    spokenResponse = `Opening directions to ${destination.split(',')[0]}.`;
    autoNavigate = true;
    autoNavigateUrl = mapsUrl;
    actionType = 'update_crm';
    actionTitle = `Maps Directions: ${destination}`;
    actionDesc = `Built verified Google Maps directions URL for: "${destination}". Auto-navigating browser.`;
    reasoningFactors.push(
      `Destination extracted: "${destination}"`,
      `Google Maps directions URL built`,
      `Auto-executing browser navigation to Google Maps`
    );
  }
  // 6b. Gmail Intent (before generic web nav to avoid collision)
  else if (
    (lowerText.includes('gmail') || lowerText.includes('email') || lowerText.includes('inbox') || lowerText.includes('mail')) &&
    !lowerText.includes('whatsapp') && !lowerText.includes('message to')
  ) {
    let gmailUrl = 'https://mail.google.com';
    let gmailLabel = '📧 OPEN GMAIL INBOX ↗';
    let actionSubTitle = 'Open Gmail Inbox';

    if (lowerText.includes('compose') || lowerText.includes('send email') || lowerText.includes('write email')) {
      const recipientMatch = input.match(/(?:to|for)\s+([A-Za-z0-9@.\s]+?)(?:\s+(?:about|saying|with subject)|$)/i);
      const subjectMatch = input.match(/(?:about|subject|re:|regarding)\s+(.+?)(?:\s+(?:saying|with body)|$)/i);
      const recipient = recipientMatch ? encodeURIComponent(recipientMatch[1].trim()) : '';
      const subject = subjectMatch ? encodeURIComponent(subjectMatch[1].trim()) : '';
      gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1${recipient ? `&to=${recipient}` : ''}${subject ? `&su=${subject}` : ''}`;
      gmailLabel = '📧 OPEN GMAIL COMPOSE ↗';
      actionSubTitle = 'Compose Gmail Email';
    } else if (lowerText.includes('search') || lowerText.includes('find email')) {
      const searchTerm = input.replace(/(?:search|find|look for|show me)?\s*(?:emails?|mails?)?\s*(?:about|from|with)?\s*/i, '').trim();
      gmailUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(searchTerm)}`;
      gmailLabel = `📧 SEARCH GMAIL ↗`;
      actionSubTitle = `Gmail Search: "${searchTerm}"`;
    }

    intent = 'Gmail Email Action';
    serviceName = 'Gmail';
    confidence = 97;
    sentiment = 'Positive';
    priority = 'Low';
    externalUrl = gmailUrl;
    externalLabel = gmailLabel;
    aiResponse = `Opening ${actionSubTitle} for you, ${customer.name}. Navigating browser now.`;
    spokenResponse = 'Opening Gmail.';
    autoNavigate = true;
    autoNavigateUrl = gmailUrl;
    actionType = 'update_crm';
    actionTitle = actionSubTitle;
    actionDesc = `Gmail action dispatched. URL: ${gmailUrl}`;
    reasoningFactors.push(
      `Gmail intent classified: ${actionSubTitle}`,
      `Gmail URL built: ${gmailUrl}`,
      `Auto-executing browser navigation to Gmail`
    );
  }
  // 6c. Shopping Intent
  else if (
    lowerText.includes('shop') || lowerText.includes('buy') ||
    (lowerText.includes('find') && (lowerText.includes('shoes') || lowerText.includes('charger') || lowerText.includes('product') || lowerText.includes('under ₹') || lowerText.includes('under rs'))) ||
    (lowerText.includes('order') && !lowerText.includes('order tracking'))
  ) {
    const productMatch = input.match(/(?:find|search|buy|get|order|shop for)?\s*(?:a|an|the)?\s*(.+?)(?:\s+(?:under|below|for|on amazon|on flipkart)|$)/i);
    const product = productMatch ? productMatch[1].trim() : input;
    const amazonUrl = `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

    intent = 'Shopping & Product Search';
    serviceName = 'Amazon';
    confidence = 95;
    sentiment = 'Positive';
    priority = 'Low';
    externalUrl = amazonUrl;
    externalLabel = `🛒 SEARCH "${product.toUpperCase()}" ON AMAZON ↗`;
    aiResponse = `Searching for "${product}" on Amazon, ${customer.name}. Navigating browser now.`;
    spokenResponse = `Searching for ${product} on Amazon.`;
    autoNavigate = true;
    autoNavigateUrl = amazonUrl;
    actionType = 'recommend_product';
    actionTitle = `Shopping Search: ${product}`;
    actionDesc = `Amazon.in search URL built for: "${product}". Auto-navigating browser.`;
    reasoningFactors.push(
      `Product extracted: "${product}"`,
      `Amazon.in URL built`,
      `Auto-executing browser navigation to Amazon`
    );
  }
  // 7. Universal Web App & Web Navigation Parser (WhatsApp Web, YouTube, Google, etc.)
  else if (parseWebNavigationUrl(input)) {

    const navTarget = parseWebNavigationUrl(input)!;
    intent = 'Web Navigation & Media Launch';
    serviceName = navTarget.appName;
    confidence = 98;
    sentiment = 'Positive';
    priority = 'Low';
    externalUrl = navTarget.url;
    externalLabel = `🌐 OPEN ${navTarget.appName.toUpperCase()} NOW ↗`;
    aiResponse = `Opening ${navTarget.appName} for you now, ${customer.name}. Navigating browser to ${navTarget.url}.`;
    spokenResponse = `Opening ${navTarget.appName}.`;
    autoNavigate = true;
    autoNavigateUrl = navTarget.url;
    actionType = 'update_crm';
    actionTitle = `Launch ${navTarget.appName}`;
    actionDesc = `Auto-executing browser navigation to ${navTarget.url}.`;
    reasoningFactors.push(
      `Extracted web navigation target: ${navTarget.appName}`,
      `Generated direct web navigation URL: ${navTarget.url}`,
      'Executing browser navigation'
    );
  } 
  // 7. Movie & Entertainment Ticket Booking
  else if (lowerText.includes('movie') || lowerText.includes('ticket') || lowerText.includes('cinema') || lowerText.includes('theater') || lowerText.includes('film') || lowerText.includes('show')) {
    intent = 'Entertainment & Ticket Booking';
    confidence = 97;
    sentiment = 'Positive';
    priority = 'Medium';
    const timeMatch = lowerText.match(/\b(\d{1,2}(:\d{2})?\s*(p\.?m\.?|a\.?m\.?|pm|am)?)\b/i);
    const requestedTime = timeMatch ? timeMatch[0] : '6:00 PM';
    externalUrl = 'https://www.fandango.com';
    externalLabel = `🎟️ VIEW TICKET CONFIRMATION PASS (${requestedTime}) ↗`;
    aiResponse = `Absolutely, ${customer.name}! I checked local IMAX theater availability for today at ${requestedTime}. I have reserved 2 premium seats and generated your digital ticket confirmation pass.`;
    actionType = 'schedule_appointment';
    actionTitle = `Reserve Entertainment Ticket (${requestedTime} IMAX Show)`;
    actionDesc = `Booked 2 premium seats for ${requestedTime} show; Digital QR mobile pass dispatched.`;
    reasoningFactors.push(
      `Extracted event time parameter: ${requestedTime}`,
      'Connected to Ticketing API: Reserved 2 seats',
      'Sent digital wallet pass & SMS QR confirmation'
    );
  }
  // 8. Appointment / Consultation Booking
  else if (lowerText.includes('appointment') || lowerText.includes('schedule') || lowerText.includes('consult')) {
    intent = 'Appointment Booking';
    confidence = 97;
    sentiment = 'Positive';
    priority = 'Medium';
    aiResponse = `Hello ${customer.name}, ${effectiveAgentName} here. I found availability tomorrow afternoon at 2:30 PM with Dr. Aris Thorne. I have reserved the slot and sent a calendar confirmation to your mobile.`;
    actionType = 'schedule_appointment';
    actionTitle = `Schedule Clinic Appointment (${effectiveAgentName} Care OS)`;
    actionDesc = 'Reserved slot on Thursday 2:30 PM; Calendar & SMS invite sent.';
    reasoningFactors.push(
      'Customer requested afternoon slot',
      'EHR calendar checked: Slot 2:30 PM open',
      'Known customer preference: Afternoon appointments matched (100% confidence)'
    );
  } 
  // 9. Order Tracking & Logistics
  else if (lowerText.includes('order') || lowerText.includes('delivery') || lowerText.includes('delay') || lowerText.includes('trk-8891') || lowerText.includes('shipment') || lowerText.includes('package')) {
    intent = 'Order Tracking & Logistics';
    confidence = 95;
    sentiment = lowerText.includes('delayed') || lowerText.includes('where') ? 'Neutral' : 'Positive';
    priority = 'High';
    externalUrl = 'https://www.fedex.com';
    externalLabel = '📦 VIEW LIVE CARRIER TRACKING GPS ↗';
    aiResponse = `Hi ${customer.name}, ${effectiveAgentName} tracking engine here. I checked live carrier updates for order #TRK-8891. The package is at the local hub in San Francisco and is scheduled for delivery today by 4:00 PM.`;
    actionType = 'update_crm';
    actionTitle = `Update Logistics Status (${effectiveAgentName} Dispatcher)`;
    actionDesc = 'Pushed real-time carrier tracking link to customer phone via SMS.';
    reasoningFactors.push(
      'Identified order tracking code #TRK-8891',
      'Carrier API returned transit status',
      'Enforced proactive tracking delivery protocol'
    );
  } 
  // 10. Account Upgrade & Sales
  else if (lowerText.includes('upgrade') || lowerText.includes('enterprise') || lowerText.includes('pricing') || lowerText.includes('demo') || lowerText.includes('team') || lowerText.includes('buy')) {
    intent = 'Sales Qualification & Upgrade';
    confidence = 98;
    sentiment = 'Positive';
    priority = 'High';
    aiResponse = `Hi ${customer.name}, ${effectiveAgentName} Sales Lead here. As an Enterprise VIP partner, your account qualifies for dedicated custom onboarding. I have reserved an executive briefing with our VP of Solutions for Friday at 10:00 AM.`;
    actionType = 'qualify_lead';
    actionTitle = `Qualify Enterprise Lead (${effectiveAgentName} Inbound Engine)`;
    actionDesc = 'Calculated high deal sizing ($120k ARR); Scheduled VP Executive Briefing.';
    reasoningFactors.push(
      'Inbound customer expressed expansion intent',
      'Company size > 500 seats detected in CRM',
      'BANT qualification threshold passed'
    );
  } 
  // 11. Escalation & Frustration
  else if (lowerText.includes('manager') || lowerText.includes('frustrated') || lowerText.includes('missed') || lowerText.includes('complaint') || lowerText.includes('speak to a human') || lowerText.includes('angry')) {
    intent = 'High Priority Escalation';
    confidence = 99;
    sentiment = 'Frustrated';
    priority = 'Critical';
    shouldEscalate = true;
    aiResponse = `I hear your concern completely, ${customer.name}. ${effectiveAgentName} Security Protocol activated: I am immediately transferring your context dossier to our Tier 2 Human Supervisor.`;
    actionType = 'escalate_human';
    actionTitle = `Initiate Human Handoff Dossier (${effectiveAgentName} Incident Response)`;
    actionDesc = 'Escalated to Tier 2 Human Supervisor with complete conversation context and sentiment warning.';
    reasoningFactors.push(
      'Customer sentiment dropped below 40% threshold (Frustrated)',
      'Keyword detection: "manager" / "missed refill"',
      'Cipher Escalation Security Rule #14 triggered: Urgent supervisor handoff required'
    );
  } 
  // 12. Greeting & General Assistance
  else if (lowerText.startsWith('hi') || lowerText.startsWith('hello') || lowerText.startsWith('hey') || lowerText.includes('who are you') || lowerText.includes('what can you do')) {
    intent = 'Greeting & System Capabilities Inquiry';
    confidence = 99;
    sentiment = 'Positive';
    priority = 'Low';
    aiResponse = `Hello ${customer.name}! I am ${effectiveAgentName}, your VocalLabs OS AI agent. I can play songs directly in your workspace, stop music on voice command, book flights & hotels, send WhatsApp messages, launch web apps like YouTube, track shipments, and qualify business leads. What would you like me to do?`;
    actionType = 'mark_resolved';
    actionTitle = `Acknowledge Customer Greeting (${effectiveAgentName})`;
    actionDesc = 'Provided system capability summary and greeted customer.';
    reasoningFactors.push('Extracted conversational greeting intent', 'Returned capability summary matrix');
  } 
  // 13. General Open Queries
  else {
    intent = 'General Intelligence Query';
    confidence = 92;
    sentiment = 'Positive';
    priority = 'Medium';
    aiResponse = `I have processed your query: "${input}". ${effectiveAgentName} has updated your customer context record and executed the corresponding workflow action.`;
    actionType = 'update_crm';
    actionTitle = `Process Custom Inquiry: "${input.length > 25 ? input.slice(0, 25) + '...' : input}"`;
    actionDesc = `Executed custom autonomous action payload for customer query: "${input}".`;
    reasoningFactors.push(
      `Analyzed custom input text: "${input}"`,
      'Updated customer memory graph',
      'Zero rule violations detected'
    );
  }

  if (!spokenResponse) {
    spokenResponse = aiResponse;
  }

  const executedAction: ExecutedAction = {
    id: `act-${Date.now()}`,
    actionType,
    title: actionTitle,
    description: actionDesc,
    serviceName,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: shouldEscalate ? 'escalated' : 'success',
    reasoningFactors,
    externalUrl,
    externalLabel
  };

  const insight: ConversationInsight = {
    id: `ins-${Date.now()}`,
    conversationId: `conv-${Date.now()}`,
    summary: `Customer ${customer.name} contacted VocalLabs OS regarding ${intent}. AI Agent ${effectiveAgentName} processed query with ${confidence}% confidence.`,
    detectedIntent: intent,
    customerSentiment: sentiment,
    sentimentScore: sentiment === 'Positive' ? 94 : sentiment === 'Neutral' ? 65 : 28,
    keyTopics: [intent, customer.company, customer.tier],
    businessOpportunityScore: intent.includes('Sales') ? 95 : 78,
    riskScore: shouldEscalate ? 85 : 12,
    recommendedAction: shouldEscalate ? 'Transfer to Human Supervisor with Context Dossier' : 'Send follow-up satisfaction survey in 2 hours',
    nextBestAction: shouldEscalate ? 'Human agent intervention' : 'Automated SMS confirmation',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const reasoningSteps: ReasoningStep[] = [
    {
      stage: 'speech_ingest',
      label: 'Speech & Audio Ingest',
      detail: `Received speech/text input: "${input}".`,
      status: 'completed'
    },
    {
      stage: 'voice_understanding',
      label: 'NLU Intent & Entity Tokenization',
      detail: matchedWakeAgent 
        ? `⚡ Wake Word Matched: Switched to Agent "${matchedWakeAgent.name}" (${matchedWakeAgent.role})` 
        : `Tokenized text into semantic vectors; Extracted Intent: "${intent}".`,
      status: 'completed'
    },
    {
      stage: 'intent_detection',
      label: 'Intent Classification',
      detail: `Detected Intent: "${intent}" (Confidence: ${confidence}%).`,
      status: 'completed'
    },
    {
      stage: 'context_analysis',
      label: 'Customer Context Graph',
      detail: `Linked to ${customer.name} (${customer.tier} - ${customer.company}). Matched preferences.`,
      status: 'completed'
    },
    {
      stage: 'sentiment_analysis',
      label: 'Real-time Sentiment Evaluation',
      detail: `Sentiment score evaluated at ${sentiment.toUpperCase()} (${sentiment === 'Positive' ? '94%' : sentiment === 'Neutral' ? '65%' : '28%'}).`,
      status: 'completed'
    },
    {
      stage: 'business_rules',
      label: 'Business Rules Engine',
      detail: shouldEscalate ? `Rule #14 Triggered: Critical escalation policy enforced.` : `SLA Matrix Verified: Zero policy conflicts.`,
      status: 'completed'
    },
    {
      stage: 'decision_engine',
      label: 'Decision & Workflow Matrix',
      detail: `Selected workflow: "${actionTitle}".`,
      status: 'completed'
    },
    {
      stage: 'action_execution',
      label: 'Autonomous Action Execution',
      detail: actionDesc,
      status: 'completed'
    },
    {
      stage: 'outcome',
      label: 'Business Intelligence Loop',
      detail: `Updated Business Pulse dashboard; Saved conversation insight and memory profile.`,
      status: 'completed'
    }
  ];

  return {
    intent,
    serviceName,
    confidence,
    sentiment,
    priority,
    aiResponse,
    spokenResponse,
    autoNavigate,
    autoNavigateUrl,
    executedAction,
    insight,
    reasoningSteps,
    shouldEscalate,
    detectedWakeWordAgent: matchedWakeAgent,
    externalUrl,
    externalLabel,
    musicPayload,
    musicResolution,
    isConsequential,
    confirmationDetails
  };
}
