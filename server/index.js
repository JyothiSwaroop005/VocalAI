import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { executeYouTubeAutomation } from './adapters/youtubeAdapter.js';
import { executeMapsAutomation } from './adapters/mapsAdapter.js';
import { executeWhatsAppAutomation } from './adapters/whatsappAdapter.js';
import { executeGmailAutomation } from './adapters/gmailAdapter.js';
import { executeFlightAutomation } from './adapters/flightAdapter.js';

dotenv.config();

const app = express();
const PORT = process.env.AUTOMATION_PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// SSE Clients for Live Intelligence Stream events
const eventClients = new Set();

function emitEvent(type, data) {
  const eventPayload = {
    type,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    ...data
  };

  console.log(`[SSE EVENT] ${type}:`, data.message || data);

  const formattedData = `data: ${JSON.stringify(eventPayload)}\n\n`;
  for (const res of eventClients) {
    try {
      res.write(formattedData);
    } catch (_) {
      eventClients.delete(res);
    }
  }
}

// SSE Event Stream Endpoint
app.get('/api/automation/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  eventClients.add(res);

  req.on('close', () => {
    eventClients.delete(res);
  });
});

// Main Automation Execution Endpoint
app.post('/api/automation/execute', async (req, res) => {
  const { intent, service, query, parameters } = req.body;
  const s = (service || '').toLowerCase();
  const i = (intent || '').toLowerCase();

  console.log(`[AUTOMATION ROUTER] Received command: "${query}" (intent: ${intent}, service: ${service})`);

  emitEvent('TASK_STARTED', { message: `Task initialized for intent "${intent}" via ${service || 'Auto-Router'}.` });
  emitEvent('INTENT_DETECTED', { intent, confidence: 99 });
  emitEvent('SERVICE_SELECTED', { service: service || 'Playwright Agent' });

  try {
    let result;

    if (s.includes('youtube') || i.includes('music') || i.includes('playback')) {
      const title = parameters?.title || query?.replace(/^play\s+/i, '');
      const artist = parameters?.artist || '';
      result = await executeYouTubeAutomation({ title, artist, rawQuery: query }, emitEvent);
    } else if (s.includes('maps') || i.includes('maps') || i.includes('direction')) {
      const destination = parameters?.destination || query;
      result = await executeMapsAutomation({ destination, rawQuery: query }, emitEvent);
    } else if (s.includes('whatsapp') || i.includes('message')) {
      const recipient = parameters?.recipient || '';
      const message = parameters?.message || '';
      result = await executeWhatsAppAutomation({ recipient, message, rawQuery: query }, emitEvent);
    } else if (s.includes('gmail') || i.includes('email')) {
      const action = parameters?.action || 'open';
      result = await executeGmailAutomation({ action, query, recipient: parameters?.recipient, subject: parameters?.subject }, emitEvent);
    } else if (s.includes('flight') || s.includes('travel') || i.includes('flight') || i.includes('hotel')) {
      const origin = parameters?.origin || 'Delhi';
      const destination = parameters?.destination || 'Mumbai';
      result = await executeFlightAutomation({ origin, destination, rawQuery: query }, emitEvent);
    } else {
      // Default: YouTube / General search
      result = await executeYouTubeAutomation({ title: query, rawQuery: query }, emitEvent);
    }

    return res.json({ success: true, result });
  } catch (err) {
    console.error('[AUTOMATION SERVER ERROR]', err);
    emitEvent('TASK_FAILED', { message: `Task execution failed: ${err.message}` });
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'VocalLabs Playwright Automation Server', port: PORT });
});

app.listen(PORT, () => {
  console.log(`🚀 VocalLabs Playwright Automation Server running at http://localhost:${PORT}`);
});
