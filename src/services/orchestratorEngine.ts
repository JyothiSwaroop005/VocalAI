import type { OrchestrationWorkflow, OrchestrationNode } from '../types';

export function buildGoaTripOrchestrationWorkflow(): OrchestrationWorkflow {
  const nodes: OrchestrationNode[] = [
    {
      id: 'node-mmt',
      platformId: 'makemytrip',
      platformName: 'MakeMyTrip',
      agentName: 'AI Travel Agent',
      action: 'Search non-stop flights & reserve beachfront pool resort in Goa',
      status: 'completed',
      progress: 100,
      detail: '✓ Flight IndiGo 6E-204 + Taj Exotica Resort Reserved ($480 package)'
    },
    {
      id: 'node-maps',
      platformId: 'googlemaps',
      platformName: 'Google Maps',
      agentName: 'AI Location Agent',
      action: 'Calculate scenic coastal route & landmark stops from Mumbai to Goa',
      status: 'completed',
      progress: 100,
      detail: '✓ NH 66 Coastal Highway Route Mapped (585 km, 2 scenic stops)'
    },
    {
      id: 'node-cal',
      platformId: 'gcalendar',
      platformName: 'Google Calendar',
      agentName: 'AI Scheduling Agent',
      action: 'Block Thursday-Sunday out-of-office vacation slot & resolve meeting conflicts',
      status: 'completed',
      progress: 100,
      detail: '✓ Out of Office Block Created (June 12-15); 3 Meetings Rescheduled'
    },
    {
      id: 'node-gmail',
      platformId: 'gmail',
      platformName: 'Gmail',
      agentName: 'AI Email Agent',
      action: 'Draft formal out-of-office leave notice to manager & attach itinerary',
      status: 'completed',
      progress: 100,
      detail: '✓ Email Draft Staged in Gmail Outbox: "Out of Office: Goa Travel Notice"'
    },
    {
      id: 'node-spotify',
      platformId: 'spotify',
      platformName: 'Spotify',
      agentName: 'AI Music Agent',
      action: 'Curate 4-hour road trip playlist with tropical acoustic vibes',
      status: 'completed',
      progress: 100,
      detail: '✓ Playlist Published: "Goa Coastal Drive 🌅" (65 tracks, 4h 12m)'
    },
    {
      id: 'node-whatsapp',
      platformId: 'whatsapp',
      platformName: 'WhatsApp Web',
      agentName: 'AI Conversation Agent',
      action: 'Draft broadcast trip announcement message for friends WhatsApp group',
      status: 'completed',
      progress: 100,
      detail: '✓ Group Message Drafted & Dispatched to "Goa Squad 🌴" Group'
    }
  ];

  return {
    id: `orch-${Date.now()}`,
    userPrompt: 'I want to plan a Goa trip next weekend, organize my schedule, find useful places, prepare a message for my friends, and create something to listen to during the trip.',
    intent: 'Cross-Platform Vacation & Travel Workflow Synthesis',
    nodes,
    summary: 'Orchestrated 6 specialized AI agents across 5 digital platforms autonomously from 1 user natural language request.',
    totalAgentsCount: 6,
    totalIntegrationsCount: 5,
    isCompleted: true
  };
}

export function parseOrchestrationFromPrompt(_prompt: string): OrchestrationWorkflow {
  return buildGoaTripOrchestrationWorkflow();
}
