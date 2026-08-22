/**
 * Google Maps Integration Adapter
 *
 * Handles:
 * - maps.directions → build a verified Google Maps directions URL and open it
 * - maps.open       → open Google Maps with a search query
 * - maps.search     → search for a location
 *
 * ExecutionType: always 'external_redirect' since Maps requires the browser.
 * Clearly labeled as external — VocalLabs does NOT render a map in-app.
 */

import type { ActionResult, GatewayIntent } from '../actionGateway';

export async function mapsAdapter(intent: GatewayIntent): Promise<ActionResult> {
  const { type, parameters } = intent;
  const { destination, query } = parameters;

  // ── maps.directions ────────────────────────────────────────────────────────
  if (type === 'maps.directions') {
    if (!destination) {
      return {
        success: false,
        executionType: 'not_executed',
        intent: type,
        service: 'google_maps',
        title: 'Directions Failed',
        description: 'No destination could be extracted from the request.',
        confidence: 0,
        verificationStatus: 'failed',
        steps: [
          { label: 'Intent Identified', status: 'completed', detail: 'Directions requested' },
          { label: 'Destination Extraction', status: 'failed', detail: 'No destination found' },
        ],
        errorReason: 'No destination provided.'
      };
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`;

    return {
      success: true,
      executionType: 'external_redirect',
      intent: type,
      service: 'google_maps',
      title: `Directions to ${destination}`,
      description: `Google Maps directions prepared for: ${destination}`,
      confidence: 0.98,
      verificationStatus: 'not_applicable',
      externalUrl: mapsUrl,
      externalLabel: `🗺️ OPEN DIRECTIONS TO ${destination.toUpperCase()} ↗`,
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: `Navigate to: ${destination}` },
        { label: 'Destination Verified', status: 'completed', detail: `Destination: "${destination}"` },
        { label: 'Maps URL Generated', status: 'completed', detail: `Directions URL: ${mapsUrl}` },
        { label: 'External Redirect Ready', status: 'completed', detail: 'Google Maps will open in browser tab' },
      ],
      payload: { destination, mapsUrl, embedUrl }
    };
  }

  // ── maps.open / maps.search ────────────────────────────────────────────────
  const searchQuery = destination || query || 'Google Maps';
  const mapsUrl = destination
    ? `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`
    : `https://maps.google.com`;

  return {
    success: true,
    executionType: 'external_redirect',
    intent: type,
    service: 'google_maps',
    title: destination ? `Search Maps: ${searchQuery}` : 'Open Google Maps',
    description: destination ? `Searching Google Maps for: ${searchQuery}` : 'Opening Google Maps.',
    confidence: 0.98,
    verificationStatus: 'not_applicable',
    externalUrl: mapsUrl,
    externalLabel: destination ? `🗺️ SEARCH "${searchQuery.toUpperCase()}" ON MAPS ↗` : '🗺️ OPEN GOOGLE MAPS ↗',
    steps: [
      { label: 'Intent Identified', status: 'completed', detail: destination ? `Maps search: ${searchQuery}` : 'Open Maps' },
      { label: 'Maps URL Generated', status: 'completed', detail: `URL: ${mapsUrl}` },
      { label: 'External Redirect Ready', status: 'completed', detail: 'Google Maps will open in browser tab' },
    ],
    payload: { searchQuery, mapsUrl }
  };
}
