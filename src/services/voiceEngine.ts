/**
 * VocalLabs Intelligence OS — Continuous Voice Engine
 *
 * PIPELINE:
 * MICROPHONE → SpeechRecognition → Final Transcript → Command Processor → Website Action → Verification → Nova TTS → Auto-Resume Listening
 */

export type VoiceState =
  | 'IDLE'
  | 'REQUESTING_MIC'
  | 'LISTENING_FOR_WAKE'
  | 'WAKE_DETECTED'
  | 'CAPTURING_COMMAND'
  | 'PROCESSING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'ERROR'
  | 'WAITING_FOR_CONFIRMATION';

export type MicPermissionState =
  | 'MIC_PERMISSION_REQUIRED'   // Not yet authorized
  | 'MIC_REQUESTING'            // getUserMedia() in flight
  | 'MIC_PERMISSION_GRANTED'    // getUserMedia() succeeded & stream active
  | 'MIC_PERMISSION_DENIED'     // User explicitly denied permission in Chrome
  | 'MIC_IN_USE'                // Another app has exclusive access
  | 'MIC_UNAVAILABLE';          // No microphone hardware found

export interface SpeechEngineCallbacks {
  onStateChange?: (state: VoiceState) => void;
  onMicPermissionChange?: (state: MicPermissionState, errorMsg?: string) => void;
  onWakeWordDetected?: () => void;
  onSpeechStart?: () => void;
  onSpeechResult?: (transcript: string, isFinal: boolean) => void;
  onCommandCaptured?: (command: string) => void;
  onSpeechEnd?: () => void;
  onError?: (error: string) => void;
  onDiagnosticUpdate?: (diag: VoiceDiagnosticState) => void;
}

export interface VoiceDiagnosticState {
  browser: string;
  micPermission: MicPermissionState;
  micErrorMessage: string | null;
  hasActiveStream: boolean;
  speechRecognitionSupported: boolean;
  speechSynthesisSupported: boolean;
  recognitionState: string;
  currentInterimTranscript: string;
  lastFinalCommand: string;
  lastError: string | null;
  novaState: VoiceState;
  pendingActionType: string | null;
  commandQueueCount: number;
}

export class VoiceEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  private currentState: VoiceState = 'IDLE';

  // Retain active MediaStream instance in the voice controller
  private activeMediaStream: MediaStream | null = null;

  // Start as REQUIRED (not DENIED) — we haven't asked yet
  private micPermission: MicPermissionState = 'MIC_PERMISSION_REQUIRED';
  private micErrorMessage: string | null = null;

  private callbacks: SpeechEngineCallbacks = {};
  private silenceTimer: any = null;
  private wakeWords: string[] = ['hey nova', 'nova', 'hi nova', 'okay nova', 'ok nova'];
  private isSpeakingTTS: boolean = false;
  private autoRestartWakeLoop: boolean = false;

  private currentInterimTranscript: string = '';
  private lastFinalCommand: string = '';
  private lastError: string | null = null;
  private pendingActionType: string | null = null;

  // Command deduplication lock
  private lastExecutedTranscript: string = '';
  private lastExecutedTimestamp: number = 0;

  // Restart backoff — prevents infinite rapid-restart loops
  private restartAttempts: number = 0;
  private maxRestartAttempts: number = 8;
  private restartTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.isSupported = true;
        console.log('[VOICE] SpeechRecognition API available.');
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';
          console.log('[VOICE] SpeechRecognition instance initialized.');
        } catch (e) {
          console.error('[VOICE ERROR] SpeechRecognition init failed:', e);
          this.isSupported = false;
        }
      } else {
        console.warn('[VOICE ERROR] SpeechRecognition not available in this browser context.');
      }
    }
  }

  public checkSupport(): boolean { return this.isSupported; }
  public getState(): VoiceState { return this.currentState; }

  public setPendingActionType(type: string | null) {
    this.pendingActionType = type;
    this.notifyDiagnostics();
  }

  public getDiagnostics(): VoiceDiagnosticState {
    const isChrome = typeof window !== 'undefined' && !!(window as any).chrome;
    const isSynthSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return {
      browser: isChrome ? 'Google Chrome' : 'Web Browser',
      micPermission: this.micPermission,
      micErrorMessage: this.micErrorMessage,
      hasActiveStream: !!this.activeMediaStream && this.activeMediaStream.active,
      speechRecognitionSupported: this.isSupported,
      speechSynthesisSupported: isSynthSupported,
      recognitionState: this.isListening ? 'Listening' : 'Idle',
      currentInterimTranscript: this.currentInterimTranscript,
      lastFinalCommand: this.lastFinalCommand,
      lastError: this.lastError,
      novaState: this.currentState,
      pendingActionType: this.pendingActionType,
      commandQueueCount: 0
    };
  }

  private notifyDiagnostics() {
    this.callbacks.onDiagnosticUpdate?.(this.getDiagnostics());
  }

  private setState(newState: VoiceState) {
    console.log(`[VOICE STATE] ${this.currentState} → ${newState}`);
    this.currentState = newState;
    this.callbacks.onStateChange?.(newState);
    this.notifyDiagnostics();
  }

  /**
   * PRIMARY ENTRY POINT — called from "ENABLE MICROPHONE ACCESS" / RETRY button.
   *
   * 1. Calls navigator.mediaDevices.getUserMedia({audio: true})
   * 2. Retains the active MediaStream in this.activeMediaStream (DO NOT STOP TRACKS)
   * 3. Sets micPermission = 'MIC_PERMISSION_GRANTED'
   * 4. Starts SpeechRecognition continuous listening loop
   */
  public async requestMicAndStart(callbacks: SpeechEngineCallbacks): Promise<{ granted: boolean; error?: string }> {
    console.log('[VOICE] requestMicAndStart() called — user gesture in progress.');
    this.callbacks = callbacks;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const msg = 'navigator.mediaDevices.getUserMedia is unavailable in this browser context.';
      console.error('[VOICE ERROR]', msg);
      this.micPermission = 'MIC_UNAVAILABLE';
      this.micErrorMessage = msg;
      this.setState('ERROR');
      this.notifyDiagnostics();
      callbacks.onError?.(msg);
      return { granted: false, error: msg };
    }

    if (!this.isSupported) {
      const msg = 'Speech recognition is not supported in this browser. Please use Google Chrome.';
      console.error('[VOICE ERROR]', msg);
      this.micErrorMessage = msg;
      this.notifyDiagnostics();
      callbacks.onError?.(msg);
      return { granted: false, error: msg };
    }

    this.micPermission = 'MIC_REQUESTING';
    this.setState('REQUESTING_MIC');
    callbacks.onMicPermissionChange?.('MIC_REQUESTING');
    this.notifyDiagnostics();

    console.log('[VOICE] Invoking getUserMedia({ audio: true })...');

    try {
      if (this.activeMediaStream) {
        this.activeMediaStream.getTracks().forEach(t => t.stop());
        this.activeMediaStream = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.activeMediaStream = stream;

      console.log('[VOICE] MediaStream acquired and retained in voice controller:', stream.id);
      this.micPermission = 'MIC_PERMISSION_GRANTED';
      this.micErrorMessage = null;
      this.lastError = null;
      callbacks.onMicPermissionChange?.('MIC_PERMISSION_GRANTED');
      this.notifyDiagnostics();

      this.startHandsFreeEngine(callbacks);
      return { granted: true };

    } catch (err: any) {
      console.error('[VOICE ERROR] getUserMedia() failed:', err.name, err.message);

      let errorMsg: string;
      let permState: MicPermissionState = 'MIC_PERMISSION_DENIED';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Microphone access was denied. Click the lock icon in the Chrome address bar, allow Microphone access, then click RETRY.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        permState = 'MIC_UNAVAILABLE';
        errorMsg = 'No microphone hardware detected. Please connect a microphone.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        permState = 'MIC_IN_USE';
        errorMsg = 'Microphone is currently in use by another application.';
      } else if (err.name === 'SecurityError') {
        errorMsg = 'Microphone access is blocked by browser security policy.';
      } else if (err.name === 'AbortError') {
        errorMsg = 'Microphone request was aborted. Please try again.';
      } else {
        errorMsg = `Microphone error (${err.name || 'Unknown'}): ${err.message || 'Please try again.'}`;
      }

      this.micPermission = permState;
      this.micErrorMessage = errorMsg;
      this.lastError = errorMsg;
      this.setState('ERROR');
      callbacks.onMicPermissionChange?.(permState, errorMsg);
      callbacks.onError?.(errorMsg);
      this.notifyDiagnostics();
      return { granted: false, error: errorMsg };
    }
  }

  /**
   * Starts the continuous speech recognition loop.
   */
  public startHandsFreeEngine(callbacks: SpeechEngineCallbacks): boolean {
    this.callbacks = callbacks;
    this.autoRestartWakeLoop = true;
    this.restartAttempts = 0;

    if (!this.isSupported || !this.recognition) {
      const msg = 'SpeechRecognition is not available.';
      console.error('[VOICE ERROR]', msg);
      this.setState('ERROR');
      callbacks.onError?.(msg);
      return false;
    }

    if (this.isListening) {
      console.log('[VOICE] Recognition already running. Refreshing state...');
      this.setState('LISTENING_FOR_WAKE');
      return true;
    }

    this._doStart(callbacks);
    return true;
  }

  private _doStart(callbacks: SpeechEngineCallbacks) {
    this.setupRecognitionListeners();
    try {
      console.log('[VOICE] recognition.start() executing...');
      this.recognition.start();
      this.setState('LISTENING_FOR_WAKE');
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        console.log('[VOICE] SpeechRecognition already active (InvalidStateError). Set state to LISTENING_FOR_WAKE.');
        this.isListening = true;
        this.setState('LISTENING_FOR_WAKE');
      } else if (err.name === 'NotAllowedError') {
        console.error('[VOICE ERROR] recognition.start() NotAllowedError');
        if (!this.activeMediaStream || !this.activeMediaStream.active) {
          this.micPermission = 'MIC_PERMISSION_DENIED';
          this.micErrorMessage = 'Microphone access is denied in browser settings.';
          this.setState('ERROR');
          this.autoRestartWakeLoop = false;
          callbacks.onError?.(this.micErrorMessage);
        } else {
          setTimeout(() => {
            if (this.autoRestartWakeLoop && !this.isListening) {
              try { this.recognition.start(); } catch (_) {}
            }
          }, 300);
        }
        this.notifyDiagnostics();
      } else {
        console.error('[VOICE ERROR] recognition.start() failed:', err);
        this.setState('ERROR');
        this.lastError = err.message;
        callbacks.onError?.(err.message || 'Failed to start speech recognition.');
      }
    }
  }

  private setupRecognitionListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.restartAttempts = 0;
      if (this.activeMediaStream && this.activeMediaStream.active) {
        this.micPermission = 'MIC_PERMISSION_GRANTED';
      }
      console.log('[VOICE] SpeechRecognition STARTED — Nova is listening.');
      this.notifyDiagnostics();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      const rawText = (finalTranscript || interimTranscript).trim();
      if (!rawText) return;

      console.log('[VOICE] Speech detected:', `"${rawText}"`, 'isFinal:', !!finalTranscript);
      this.currentInterimTranscript = interimTranscript || rawText;
      this.notifyDiagnostics();

      // User interrupted Nova while TTS is speaking -> cancel TTS
      if (this.isSpeakingTTS || this.currentState === 'SPEAKING') {
        console.log('[VOICE] User interrupt during TTS — cancelling speech synthesis.');
        this.stopSpeaking();
        this.setState('CAPTURING_COMMAND');
      }

      // Extract command: strip wake words if present, or use raw text directly
      const lowerText = rawText.toLowerCase();
      let cleanCommand = rawText;
      const matchedWake = this.wakeWords.find(w => lowerText.includes(w));
      if (matchedWake) {
        for (const w of this.wakeWords) {
          cleanCommand = cleanCommand.replace(new RegExp(`^.*?${w}[,\\s]*`, 'i'), '');
        }
        cleanCommand = cleanCommand.trim();
        this.callbacks.onWakeWordDetected?.();
      }

      const finalCommand = (cleanCommand || rawText).trim();
      if (!finalCommand || finalCommand.length < 2) return;

      // Command Deduplication: ignore duplicate commands received within 3 seconds
      const normFinal = finalCommand.toLowerCase();
      if (this.lastExecutedTranscript === normFinal && (Date.now() - this.lastExecutedTimestamp < 3000)) {
        console.log(`[VOICE DEDUPLICATION] Ignoring duplicate command: "${finalCommand}"`);
        return;
      }

      // Execute on final result immediately
      if (finalTranscript) {
        this.lastExecutedTranscript = normFinal;
        this.lastExecutedTimestamp = Date.now();
        this.lastFinalCommand = finalCommand;
        this.currentInterimTranscript = '';
        this.setState('PROCESSING');
        this.stopListening();
        console.log(`[VOICE DISPATCH] Executing final transcript command: "${finalCommand}"`);
        this.callbacks.onCommandCaptured?.(finalCommand);
        return;
      }

      // Fallback VAD timer for continuous speech
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      this.silenceTimer = setTimeout(() => {
        if (this.lastExecutedTranscript !== normFinal) {
          this.lastExecutedTranscript = normFinal;
          this.lastExecutedTimestamp = Date.now();
          this.lastFinalCommand = finalCommand;
          this.currentInterimTranscript = '';
          this.setState('PROCESSING');
          this.stopListening();
          console.log(`[VOICE VAD DISPATCH] Executing VAD silent command: "${finalCommand}"`);
          this.callbacks.onCommandCaptured?.(finalCommand);
        }
      }, 600);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('[VOICE] Recognition error event:', event.error);
      this.lastError = event.error;

      switch (event.error) {
        case 'not-allowed':
          if (!this.activeMediaStream || !this.activeMediaStream.active) {
            this.micPermission = 'MIC_PERMISSION_DENIED';
            this.micErrorMessage = 'Microphone access is denied in browser settings.';
            this.autoRestartWakeLoop = false;
            this.setState('ERROR');
            this.callbacks.onMicPermissionChange?.('MIC_PERMISSION_DENIED', this.micErrorMessage);
            this.callbacks.onError?.(this.micErrorMessage);
          }
          break;
        case 'audio-capture':
          this.micErrorMessage = 'Audio capture failed — check microphone connection.';
          this.callbacks.onError?.(this.micErrorMessage);
          break;
        case 'no-speech':
          break;
        case 'network':
          console.warn('[VOICE] Network hiccup in speech recognition.');
          break;
        case 'aborted':
          break;
        default:
          console.warn('[VOICE] Unhandled recognition error:', event.error);
      }
      this.notifyDiagnostics();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log(`[VOICE] Recognition loop ended. autoRestart:${this.autoRestartWakeLoop} state:${this.currentState} speaking:${this.isSpeakingTTS}`);
      this.notifyDiagnostics();

      if (
        this.autoRestartWakeLoop &&
        !this.isSpeakingTTS &&
        this.currentState !== 'PROCESSING' &&
        this.currentState !== 'EXECUTING' &&
        this.currentState !== 'ERROR' &&
        (this.micPermission === 'MIC_PERMISSION_GRANTED' || !!this.activeMediaStream)
      ) {
        if (this.restartAttempts >= this.maxRestartAttempts) {
          console.error('[VOICE ERROR] Max restart attempts reached.');
          this.autoRestartWakeLoop = false;
          this.setState('ERROR');
          this.lastError = 'Speech recognition loop paused. Click microphone button to restart.';
          this.callbacks.onError?.(this.lastError);
          return;
        }

        const delay = 300 * Math.pow(1.4, this.restartAttempts);
        this.restartAttempts++;

        if (this.restartTimer) clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
          if (!this.isListening && this.autoRestartWakeLoop) {
            try {
              this.setState('LISTENING_FOR_WAKE');
              this.recognition.start();
              console.log('[VOICE] Recognition restarted successfully.');
            } catch (e: any) {
              if (e.name !== 'InvalidStateError') {
                console.error('[VOICE ERROR] Restart failed:', e);
              }
            }
          }
        }, delay);
      }
    };
  }

  public stopListening() {
    if (this.silenceTimer) { clearTimeout(this.silenceTimer); this.silenceTimer = null; }
    if (this.restartTimer) { clearTimeout(this.restartTimer); this.restartTimer = null; }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        console.log('[VOICE] Recognition stopped.');
      } catch (_) {}
      this.isListening = false;
      this.notifyDiagnostics();
    }
  }

  public stopHandsFreeEngine() {
    this.autoRestartWakeLoop = false;
    this.restartAttempts = 0;
    this.stopListening();
    if (this.activeMediaStream) {
      this.activeMediaStream.getTracks().forEach(t => t.stop());
      this.activeMediaStream = null;
      console.log('[VOICE] MediaStream tracks stopped.');
    }
    this.setState('IDLE');
    console.log('[VOICE] Hands-free engine completely stopped.');
  }

  /**
   * Speak Nova response aloud with TTS Self-Hearing Protection.
   */
  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined') {
      if (onEnd) onEnd();
      return;
    }

    console.log('[VOICE] Nova speaking aloud:', `"${text}"`);

    this.isSpeakingTTS = true;
    this.stopListening();
    this.setState('SPEAKING');

    if (!('speechSynthesis' in window)) {
      console.warn('[VOICE] speechSynthesis not supported.');
      this.isSpeakingTTS = false;
      if (onEnd) setTimeout(onEnd, 800);
      this._resumeAfterSpeech();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        v => v.lang.startsWith('en') &&
          (v.name.includes('Google') || v.name.includes('Natural') ||
           v.name.includes('Samantha') || v.name.includes('Karen') ||
           v.name.includes('Daniel'))
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      const handleEnd = () => {
        console.log('[VOICE] Nova speech completed.');
        this.isSpeakingTTS = false;
        if (onEnd) onEnd();
        this._resumeAfterSpeech();
      };

      utterance.onend = handleEnd;
      utterance.onerror = (e) => {
        console.warn('[VOICE] TTS error:', e.error);
        handleEnd();
      };

      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      setTimeout(() => {
        if (this.isSpeakingTTS && !utterance.onend) doSpeak();
      }, 600);
    }
  }

  private _resumeAfterSpeech() {
    if (this.autoRestartWakeLoop) {
      setTimeout(() => {
        if (!this.isListening && this.autoRestartWakeLoop) {
          this.setState('LISTENING_FOR_WAKE');
          try {
            this.recognition.start();
            console.log('[VOICE] Continuous listening resumed post-TTS.');
          } catch (e: any) {
            if (e.name !== 'InvalidStateError') {
              console.error('[VOICE ERROR] Failed to resume after TTS:', e);
            }
          }
        }
      }, 400);
    } else {
      this.setState('IDLE');
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingTTS = false;
  }
}

export const voiceEngine = new VoiceEngine();
