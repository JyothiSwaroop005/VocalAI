import type { WebsiteAgent, AgentResult, AgentStep } from './types';
import { openUrl, executeDOMAction, findActiveMediaTab } from '../chromeExtensionBridge';

export class YouTubeAgent implements WebsiteAgent {
  name = 'YouTubeAgent';

  canHandle(intent: string): boolean {
    const i = intent.toLowerCase();
    return i.includes('youtube') ||
      i.includes('music') ||
      i.includes('song') ||
      i.startsWith('play ') ||
      i === 'pause' || i.includes('pause') ||
      i === 'resume' || i.includes('resume') ||
      i === 'stop' || i.includes('stop') ||
      i.includes('next') || i.includes('skip') ||
      i.includes('previous') || i.includes('restart') ||
      i.includes('forward') || i.includes('rewind') || i.includes('seek') ||
      i.includes('volume') || i.includes('louder') || i.includes('quieter') ||
      i.includes('mute') || i.includes('unmute');
  }

  async execute(_intent: string, input: string): Promise<AgentResult> {
    const cleanInput = input.replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '').trim();
    const lower = cleanInput.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ── Helper to execute media action on target tab ──────────────────────
    const targetTab = await findActiveMediaTab();
    const tabId = targetTab?.id;

    // 1. PAUSE MUSIC
    if (lower === 'pause' || lower.includes('pause music') || lower.includes('pause the music')) {
      const res = await executeDOMAction({ type: 'pause_youtube_video' }, tabId);
      if (!res.success) {
        return {
          success: false,
          intent: 'PAUSE_MUSIC',
          completedSteps: [],
          finalMessage: 'No music is currently playing.',
          spokenResponse: 'No music is currently playing.',
          executionRecord: { action: 'pause_video', target: 'Media Tab', status: 'FAILED', timestamp }
        };
      }
      return {
        success: true,
        intent: 'PAUSE_MUSIC',
        completedSteps: [],
        finalMessage: 'Paused music playback.',
        spokenResponse: 'Paused.',
        executionRecord: { action: 'pause_video', target: 'Media Player', status: 'VERIFIED', timestamp }
      };
    }

    // 2. RESUME MUSIC
    if (lower === 'resume' || lower.includes('resume music') || lower.includes('continue playing')) {
      const res = await executeDOMAction({ type: 'resume_youtube_video' }, tabId);
      if (!res.success) {
        return {
          success: false,
          intent: 'RESUME_MUSIC',
          completedSteps: [],
          finalMessage: 'No music is currently playing.',
          spokenResponse: 'No music is currently playing.',
          executionRecord: { action: 'resume_video', target: 'Media Tab', status: 'FAILED', timestamp }
        };
      }
      return {
        success: true,
        intent: 'RESUME_MUSIC',
        completedSteps: [],
        finalMessage: 'Resumed music playback.',
        spokenResponse: 'Resuming.',
        executionRecord: { action: 'resume_video', target: 'Media Player', status: 'VERIFIED', timestamp }
      };
    }

    // 3. STOP MUSIC (Stop playback AND reset currentTime to 0)
    if (lower === 'stop' || lower === 'stop music' || lower.includes('stop the music')) {
      const res = await executeDOMAction({ type: 'stop_youtube_video' }, tabId);
      if (!res.success) {
        return {
          success: false,
          intent: 'STOP_MUSIC',
          completedSteps: [],
          finalMessage: 'No music is currently playing.',
          spokenResponse: 'No music is currently playing.',
          executionRecord: { action: 'stop_video', target: 'Media Tab', status: 'FAILED', timestamp }
        };
      }
      return {
        success: true,
        intent: 'STOP_MUSIC',
        completedSteps: [],
        finalMessage: 'Stopped music playback.',
        spokenResponse: 'Music stopped.',
        executionRecord: { action: 'stop_video', target: 'Media Player', status: 'VERIFIED', timestamp }
      };
    }

    // 4. NEXT TRACK
    if (lower.includes('next') || lower.includes('skip this song') || lower.includes('skip song')) {
      const res = await executeDOMAction({ type: 'next_youtube_video' }, tabId);
      return {
        success: res.success,
        intent: 'NEXT_TRACK',
        completedSteps: [],
        finalMessage: res.success ? 'Skipped to next track.' : 'No active player to skip track.',
        spokenResponse: res.success ? 'Skipped to the next track.' : 'No music is currently playing.',
        executionRecord: { action: 'next_track', target: 'YouTube', status: res.success ? 'VERIFIED' : 'FAILED', timestamp }
      };
    }

    // 5. PREVIOUS TRACK
    if (lower.includes('previous') || lower.includes('previous song') || lower.includes('go back to the previous')) {
      const res = await executeDOMAction({ type: 'previous_youtube_video' }, tabId);
      return {
        success: res.success,
        intent: 'PREVIOUS_TRACK',
        completedSteps: [],
        finalMessage: res.success ? 'Returned to previous track.' : 'No active player for previous track.',
        spokenResponse: res.success ? 'Returned to the previous track.' : 'No music is currently playing.',
        executionRecord: { action: 'previous_track', target: 'YouTube', status: res.success ? 'VERIFIED' : 'FAILED', timestamp }
      };
    }

    // 6. RESTART TRACK
    if (lower.includes('restart') || lower.includes('start the song again')) {
      const res = await executeDOMAction({ type: 'restart_youtube_video' }, tabId);
      return {
        success: res.success,
        intent: 'RESTART_TRACK',
        completedSteps: [],
        finalMessage: res.success ? 'Restarted track from beginning.' : 'No active music to restart.',
        spokenResponse: res.success ? 'Restarting the song.' : 'No music is currently playing.',
        executionRecord: { action: 'restart_track', target: 'YouTube', status: res.success ? 'VERIFIED' : 'FAILED', timestamp }
      };
    }

    // 7. SEEK FORWARD / BACKWARD
    if (lower.includes('forward') || lower.includes('rewind') || lower.includes('skip ahead') || lower.includes('go back')) {
      const secMatch = lower.match(/(\d+)\s*(?:seconds?|secs?)/);
      let seconds = secMatch ? parseInt(secMatch[1], 10) : 10;
      if (lower.includes('rewind') || lower.includes('go back')) seconds = -seconds;

      const res = await executeDOMAction({ type: 'seek_youtube_video', seconds }, tabId);
      const isForward = seconds > 0;
      return {
        success: res.success,
        intent: isForward ? 'SEEK_FORWARD' : 'SEEK_BACKWARD',
        completedSteps: [],
        finalMessage: res.success ? `Seeked ${isForward ? 'forward' : 'backward'} ${Math.abs(seconds)} seconds.` : 'No active music to seek.',
        spokenResponse: res.success ? `Seeked ${isForward ? 'forward' : 'backward'} ${Math.abs(seconds)} seconds.` : 'No music is currently playing.',
        executionRecord: { action: 'seek_video', target: 'YouTube', status: res.success ? 'VERIFIED' : 'FAILED', timestamp }
      };
    }

    // 8. VOLUME UP / DOWN
    if (lower.includes('volume') || lower.includes('louder') || lower.includes('quieter')) {
      const isUp = lower.includes('up') || lower.includes('increase') || lower.includes('louder');
      const res = await executeDOMAction({ type: 'volume_youtube_video', direction: isUp ? 'up' : 'down' }, tabId);
      return {
        success: res.success,
        intent: isUp ? 'VOLUME_UP' : 'VOLUME_DOWN',
        completedSteps: [],
        finalMessage: res.success ? `Volume ${isUp ? 'increased' : 'decreased'}.` : 'No active media to adjust volume.',
        spokenResponse: res.success ? `Volume ${isUp ? 'increased' : 'decreased'}.` : 'No music is currently playing.',
        executionRecord: { action: 'adjust_volume', target: 'YouTube', status: res.success ? 'VERIFIED' : 'FAILED', timestamp }
      };
    }

    // 9. MUTE
    if (lower === 'mute' || lower === 'mute music') {
      const res = await executeDOMAction({ type: 'mute_youtube_video' }, tabId);
      return {
        success: res.success,
        intent: 'MUTE',
        completedSteps: [],
        finalMessage: res.success ? 'Muted music player.' : 'No active player to mute.',
        spokenResponse: res.success ? 'Muted.' : 'No music is currently playing.',
        executionRecord: { action: 'mute_video', target: 'YouTube', status: res.success ? 'VERIFIED' : 'FAILED', timestamp }
      };
    }

    // 10. UNMUTE
    if (lower === 'unmute' || lower === 'unmute music') {
      const res = await executeDOMAction({ type: 'unmute_youtube_video' }, tabId);
      return {
        success: res.success,
        intent: 'UNMUTE',
        completedSteps: [],
        finalMessage: res.success ? 'Unmuted music player.' : 'No active player to unmute.',
        spokenResponse: res.success ? 'Unmuted.' : 'No music is currently playing.',
        executionRecord: { action: 'unmute_video', target: 'YouTube', status: res.success ? 'VERIFIED' : 'FAILED', timestamp }
      };
    }

    // 11. PLAY MUSIC (Exact match resolution)
    let title = '';
    let artist = '';

    const searchYtMatch = cleanInput.match(/^(?:search\s+youtube\s+for|search\s+for|search)\s+(.+?)(?:\s+on\s+youtube)?$/i);
    const targetText = searchYtMatch ? searchYtMatch[1] : cleanInput.replace(/^play\s+/i, '').replace(/^youtube\s+play\s+/i, '').trim();

    const byMatch = targetText.match(/^(.+?)\s+by\s+(.+)$/i);
    if (byMatch) {
      title = byMatch[1].trim();
      artist = byMatch[2].trim();
    } else {
      title = targetText.trim();
      artist = '';
    }

    const searchQuery = artist ? `${title} ${artist}` : title;

    console.log(`[YOUTUBE ROUTER] Title: "${title}", Artist: "${artist}", Query: "${searchQuery}"`);

    const steps: AgentStep[] = [
      { id: 's1', label: 'Open YouTube Search', status: 'running', riskLevel: 'LOW', detail: `Searching YouTube for "${searchQuery}"` },
      { id: 's2', label: 'Select Verified Track Result', status: 'pending', riskLevel: 'LOW', detail: `Matching "${title}" by ${artist || 'artist'}` },
      { id: 's3', label: 'Trigger Video Player', status: 'pending', riskLevel: 'LOW', detail: 'Executing play on video element' },
      { id: 's4', label: 'Verify Video Playback', status: 'pending', riskLevel: 'LOW', detail: 'Inspecting video element DOM state' }
    ];

    try {
      await openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, false);
      steps[0].status = 'completed';
      steps[0].result = `Opened search results for "${searchQuery}"`;

      await new Promise(r => setTimeout(r, 1500));

      steps[1].status = 'running';
      const clickR = await executeDOMAction({
        type: 'select_and_play_youtube_video',
        title,
        artist
      });

      steps[1].status = 'completed';
      steps[1].result = clickR.message || 'Clicked YouTube result';

      await new Promise(r => setTimeout(r, 2000));

      steps[2].status = 'running';
      const playR = await executeDOMAction({
        type: 'select_and_play_youtube_video',
        title,
        artist
      });
      steps[2].status = 'completed';
      steps[2].result = playR.message || 'Video player active';

      steps[3].status = 'running';
      await new Promise(r => setTimeout(r, 1000));
      const verifyR = await executeDOMAction({ type: 'verify_youtube_playback' });

      steps[3].status = 'completed';
      steps[3].result = verifyR.message || 'Playback verified';

      const isAutoplayBlocked = verifyR.paused === true;
      const trackLabel = artist ? `${title} by ${artist}` : title;

      const spokenResponse = isAutoplayBlocked
        ? `${trackLabel} is open, but Chrome blocked automatic playback.`
        : `Playing ${trackLabel}.`;

      return {
        success: true,
        intent: 'PLAY_MUSIC',
        completedSteps: steps,
        finalMessage: isAutoplayBlocked
          ? `${trackLabel} is open on YouTube. (Autoplay blocked by browser policy).`
          : `Playing track: ${trackLabel} on YouTube.`,
        spokenResponse,
        executionRecord: {
          action: 'play_track',
          target: `YouTube: "${trackLabel}"`,
          status: isAutoplayBlocked ? 'WAITING_FOR_CONFIRMATION' : 'VERIFIED',
          timestamp,
          evidence: { type: 'video_state', detail: isAutoplayBlocked ? 'Video page active, autoplay paused' : 'Video element playing' }
        }
      };
    } catch (err: any) {
      return {
        success: false,
        intent: 'PLAY_MUSIC',
        completedSteps: steps,
        finalMessage: `YouTube execution error: ${err.message}`,
        spokenResponse: "I couldn't complete that action.",
        executionRecord: {
          action: 'play_track',
          target: title,
          status: 'FAILED',
          timestamp,
          error: err.message
        }
      };
    }
  }
}

export const youtubeAgent = new YouTubeAgent();
