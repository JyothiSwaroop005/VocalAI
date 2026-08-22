/**
 * musicEngine.ts — DEPRECATED
 * This file is intentionally kept as a stub to avoid breaking imports during the migration.
 * All music playback now goes through musicService.ts.
 * The Web Audio API synthesizer is NOT used for music requests.
 */

export const stopGlobalAudio = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vocallabs_stop_audio'));
  }
};
