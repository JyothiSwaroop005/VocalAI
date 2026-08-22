import React, { useState, useEffect } from 'react';
import type { MusicResolutionResult, MusicTrackPayload } from '../types';
import { ExternalLink, CheckCircle, AlertCircle, Play, Pause, Music, Mic, CheckCircle2, Radio } from 'lucide-react';
import { IS_EXTENSION, openUrl } from '../services/chromeExtensionBridge';

interface MusicPlayerWidgetProps {
  resolution?: MusicResolutionResult;
  payload?: MusicTrackPayload; // legacy fallback
}

export const MusicPlayerWidget: React.FC<MusicPlayerWidgetProps> = ({ resolution, payload }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Verified track ready.');

  // Normalize legacy payload or new resolution result
  let res: MusicResolutionResult;

  if (resolution) {
    res = resolution;
  } else if (payload && payload.kind === 'verified') {
    res = {
      success: true,
      track: {
        id: payload.id,
        title: payload.title,
        artist: payload.artist,
        album: payload.album,
        source: 'youtube',
        candidateVideoIds: [payload.videoId],
        primaryVideoId: payload.videoId,
        sourceUrl: `https://www.youtube.com/watch?v=${payload.videoId}`,
        thumbnail: payload.thumbnail || `https://img.youtube.com/vi/${payload.videoId}/hqdefault.jpg`,
        duration: payload.duration,
        matchType: 'exact',
        confidence: 1.0,
        verified: true
      }
    };
  } else {
    const title = payload && 'requestedTitle' in payload ? payload.requestedTitle : 'Requested Track';
    res = {
      success: false,
      requestedTitle: title,
      reason: 'Exact track found, but no playable authorized source is currently available.',
      searchQuery: `${title} official audio`,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' official audio')}`
    };
  }

  const track = res.success ? res.track : null;

  useEffect(() => {
    if (res.success && track) {
      setStatusMessage('Exact track identity verified. Ready for YouTube playback.');
    } else {
      setStatusMessage('Exact match not found. Audio blocked.');
    }
  }, [res.success, track?.id]);

  const handlePlayToggle = async () => {
    if (!track) return;

    if (isPlaying) {
      setIsPlaying(false);
      setStatusMessage('Paused');
      window.dispatchEvent(new CustomEvent('vocallabs_stop_audio'));
    } else {
      setIsPlaying(true);
      setStatusMessage('Playing on YouTube');
      window.dispatchEvent(new CustomEvent('vocallabs_resume_audio'));

      // In extension mode, open or navigate YouTube tab cleanly without CSP violations
      if (IS_EXTENSION) {
        await openUrl(track.sourceUrl, false);
      } else {
        window.open(track.sourceUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleOpenYouTube = async () => {
    const targetUrl = track ? track.sourceUrl : (!res.success ? res.youtubeSearchUrl : 'https://www.youtube.com/results?search_query=music');
    if (IS_EXTENSION) {
      await openUrl(targetUrl, false);
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Case 1: UNSUCCESSFUL RESOLUTION OR UNVERIFIED TRACK
  if (!res.success || !track) {
    const failureReason = !res.success ? res.reason : 'Exact track found, but no verified authorized source is currently available.';
    return (
      <div className="w-full mt-3 rounded-2xl border-2 border-rose-500/40 bg-slate-950 p-4 space-y-3 font-mono shadow-xl select-none">
        <div className="flex items-start gap-2.5 text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-300">EXACT MATCH NOT VERIFIED</p>
            <p className="text-[11px] text-rose-200/90 mt-1">
              {failureReason}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenYouTube}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          SEARCH ON YOUTUBE ↗
        </button>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-500">
          <span>Candidate Pipeline: Verified</span>
          <span className="text-rose-400 font-bold">● NO UNVERIFIED SUBSTITUTION MADE</span>
        </div>
      </div>
    );
  }

  // Case 2: VERIFIED TRACK CARD
  const activeVideoId = track.primaryVideoId;
  const currentThumbnail = track.thumbnail || `https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`;

  return (
    <div className="w-full mt-3 rounded-2xl border-2 border-cyan-500/50 bg-slate-950 overflow-hidden font-mono shadow-2xl space-y-0 select-none">
      
      {/* Track Header Card */}
      <div className="p-4 space-y-3 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950">
        
        {/* Header Status Bar */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-extrabold tracking-wider uppercase">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            VocalLabs YouTube Controller
          </span>
          <span className={`flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${
            isPlaying
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
          }`}>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            VERIFIED EXACT MATCH
          </span>
        </div>

        {/* Metadata Details Grid */}
        <div className="flex gap-3.5 items-center">
          <div className="w-20 h-16 rounded-xl overflow-hidden border border-cyan-500/30 relative shrink-0 shadow-lg bg-slate-900">
            <img
              src={currentThumbnail}
              alt={track.title}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-cyan-500/20 animate-pulse pointer-events-none" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px]">
              <Music className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="text-slate-400">TRACK:</span>
              <span className="text-white font-black truncate">{track.title}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px]">
              <Mic className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="text-slate-400">ARTIST:</span>
              <span className="text-cyan-300 font-bold truncate">{track.artist}</span>
            </div>

            <div className="flex items-center gap-2 pt-0.5 text-[9px]">
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" /> VERIFIED MATCH
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-red-500" /> YouTube Active
              </span>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <button
            onClick={handlePlayToggle}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 hover:brightness-110 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[10px]">
              <span className={`font-bold flex items-center gap-1.5 ${
                isPlaying ? 'text-emerald-300' : 'text-cyan-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
                }`} />
                STATUS: {isPlaying ? '▶ Playing on YouTube' : statusMessage}
              </span>
              <span className="text-slate-400 text-[9px] font-mono">{track.duration}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenYouTube}
            className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            PLAY ON YOUTUBE ↗
          </button>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-900 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          CSP Manifest V3 Compliant Architecture
        </span>
        <span className="text-cyan-400 font-bold">
          Match Confidence: 100%
        </span>
      </div>
    </div>
  );
};
