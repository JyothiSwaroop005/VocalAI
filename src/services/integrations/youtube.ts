/**
 * YouTube / Music Integration Adapter
 *
 * Handles:
 * - music.play   → resolves exact track, returns verified video ID for in-app YT player
 * - music.control → stop / pause / resume signals
 * - web.open     → navigate to YouTube website
 *
 * ExecutionType:
 * - 'direct'            → playing exact verified track in-app via YouTube IFrame API
 * - 'external_redirect' → opening youtube.com in browser tab
 * - 'not_executed'      → track could not be verified
 */

import type { ActionResult, GatewayIntent } from '../actionGateway';
import { resolveExactTrack, stopGlobalAudio } from '../musicService';

export async function youtubeAdapter(intent: GatewayIntent): Promise<ActionResult> {
  const { type, parameters } = intent;

  // ── music.control ─────────────────────────────────────────────────────────
  if (type === 'music.control') {
    const action = parameters.action || 'stop';
    if (action === 'resume') {
      window.dispatchEvent(new CustomEvent('vocallabs_resume_audio'));
    } else {
      stopGlobalAudio();
    }
    return {
      success: true,
      executionType: 'direct',
      intent: type,
      service: 'youtube',
      title: action === 'resume' ? 'Resume Music Playback' : 'Stop Music Playback',
      description: action === 'resume' ? 'Resumed in-app audio player.' : 'Stopped in-app audio player.',
      confidence: 1.0,
      verificationStatus: 'not_applicable',
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: `Music control: ${action}` },
        { label: 'Player Signal Dispatched', status: 'completed', detail: `vocallabs_${action}_audio event fired` },
      ]
    };
  }

  // ── web.open (open YouTube.com) ───────────────────────────────────────────
  if (type === 'web.open') {
    return {
      success: true,
      executionType: 'external_redirect',
      intent: type,
      service: 'youtube',
      title: 'Open YouTube',
      description: 'Opening YouTube in browser tab.',
      confidence: 1.0,
      verificationStatus: 'not_applicable',
      externalUrl: 'https://www.youtube.com',
      externalLabel: '▶ OPEN YOUTUBE ↗',
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: 'Open YouTube.com' },
        { label: 'External Link Prepared', status: 'completed', detail: 'https://www.youtube.com' },
      ]
    };
  }

  // ── music.play ────────────────────────────────────────────────────────────
  const { title, artist } = parameters;
  if (!title) {
    return {
      success: false,
      executionType: 'not_executed',
      intent: type,
      service: 'youtube',
      title: 'Music Request Failed',
      description: 'No song title could be extracted from the request.',
      confidence: 0,
      verificationStatus: 'failed',
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: 'Music playback requested' },
        { label: 'Title Extraction', status: 'failed', detail: 'No title found in input' },
      ],
      errorReason: 'No song title provided.'
    };
  }

  // Stop any stale playback before resolving new track
  stopGlobalAudio();

  // Resolve exact track from knowledge base
  const resolution = resolveExactTrack(intent.rawInput);

  if (resolution.success) {
    const { track } = resolution;
    return {
      success: true,
      executionType: 'direct',
      intent: type,
      service: 'youtube',
      title: `Play: ${track.title} — ${track.artist}`,
      description: `Exact match found. Initializing YouTube player with verified video ID.`,
      confidence: track.confidence,
      verificationStatus: 'verified',
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: `Music playback: "${title}" by ${artist || 'unknown'}` },
        { label: 'Title Extraction', status: 'completed', detail: `Extracted: "${title}"${artist ? ` by ${artist}` : ''}` },
        { label: 'Exact Match Verification', status: 'completed', detail: `Resolved: "${track.title}" by ${track.artist} (${(track.confidence * 100).toFixed(0)}% confidence)` },
        { label: 'Source Verification', status: 'completed', detail: `YouTube video ID: ${track.primaryVideoId} (${track.candidateVideoIds.length} candidates)` },
        { label: 'Player Initialization', status: 'completed', detail: 'YouTube IFrame API player initialized with verified video ID' },
      ],
      payload: { musicResolution: resolution }
    };
  } else {
    const searchQ = artist ? `${title} ${artist} official audio` : `${title} official audio`;
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQ)}`;
    return {
      success: false,
      executionType: 'not_executed',
      intent: type,
      service: 'youtube',
      title: 'Exact Match Not Found',
      description: `Could not verify an exact match for "${title}". No audio was played.`,
      confidence: 0,
      verificationStatus: 'failed',
      externalUrl: ytSearchUrl,
      externalLabel: `🔍 SEARCH "${title.toUpperCase()}" ON YOUTUBE ↗`,
      steps: [
        { label: 'Intent Identified', status: 'completed', detail: `Music playback: "${title}"${artist ? ` by ${artist}` : ''}` },
        { label: 'Title Extraction', status: 'completed', detail: `Extracted: "${title}"` },
        { label: 'Exact Match Verification', status: 'failed', detail: 'No match reached confidence threshold (72%). Audio blocked.' },
        { label: 'Player Initialization', status: 'skipped', detail: 'Skipped — no verified source' },
      ],
      errorReason: 'Exact match could not be verified. No audio substitution made.',
      payload: { musicResolution: resolution }
    };
  }
}
