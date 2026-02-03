/**
 * Web Audio Synthesizer Sound System
 * 
 * All sounds are synthesized using Web Audio API - no audio files needed.
 * D major pentatonic tonal palette (D, E, F#, A, B) — notes that can't clash.
 * 
 * Drop-in replacement for the Howler.js version.
 */

import type { SoundName } from '@/types';
import type { Sound } from '../components/sound-lab/lib/types';
import { playCustomSound } from './sound-player';
import { playStartupSound, cancelStartupSound, playWindDownSound } from './startup-sound';

// =============================================================================
// TONAL PALETTE - D Major Pentatonic
// =============================================================================

const NOTES = {
  D3: 146.83,
  E3: 164.81,
  'F#3': 185.00,
  A3: 220.00,
  B3: 246.94,
  D4: 293.66,
  E4: 329.63,
  'F#4': 369.99,
  A4: 440.00,
  B4: 493.88,
  D5: 587.33,
} as const;

// =============================================================================
// SOUND SYNTHESIZERS
// Each function creates and plays a sound using Web Audio API
// =============================================================================

type SoundSynthesizer = (ctx: AudioContext, volume: number) => void;

const SYNTHESIZERS: Record<SoundName, SoundSynthesizer> = {
  // ---------------------------------------------------------------------------
  // INTERACTIONS
  // ---------------------------------------------------------------------------

  click: (ctx, volume) => {
    // Soft mechanical key - square wave with frequency sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);

    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  hover: (ctx, volume) => {
    // Quiet tonal ping - E4 sine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = NOTES.E4;

    gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  },

  tab: (ctx, volume) => {
    // Tab switch - soft click with slight pitch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES.A4, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(NOTES.D4, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  },

  error: (ctx, volume) => {
    // Error buzz - low frequency wobble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(NOTES.D3, ctx.currentTime);
    osc.frequency.setValueAtTime(NOTES.E3, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(NOTES.D3, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },

  // ---------------------------------------------------------------------------
  // TRANSITIONS
  // ---------------------------------------------------------------------------

  pageTransition: (ctx, volume) => {
    // Page transition - rising then settling tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES.D4, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(NOTES.A4, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(NOTES['F#4'], ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  },

  navShift: (ctx, volume) => {
    // Navigation shift - subtle sliding tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES.E4, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(NOTES.A4, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  },

  // ---------------------------------------------------------------------------
  // COMMAND PALETTE
  // ---------------------------------------------------------------------------

  paletteOpen: (ctx, volume) => {
    // Opening chord - D4 + F#4 sine
    [NOTES.D4, NOTES['F#4']].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.02);
      osc.stop(ctx.currentTime + 0.2);
    });
  },

  paletteClose: (ctx, volume) => {
    // Closing - single soft thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES.D3, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  },

  paletteNav: (ctx, volume) => {
    // Navigation tick - tiny click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = NOTES.A4;

    gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  },

  paletteSelect: (ctx, volume) => {
    // Selection confirm - D4 to F#4 quick rise
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES.D4, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(NOTES['F#4'], ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  },

  // ---------------------------------------------------------------------------
  // TOGGLE SOUNDS
  // ---------------------------------------------------------------------------

  soundOn: (ctx, volume) => {
    // Pleasant rising tone - D4 to A4
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES.D4, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(NOTES.A4, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  },

  soundOff: (ctx, volume) => {
    // Soft descending tone - A4 to D4
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES.A4, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(NOTES.D4, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  },

  // ---------------------------------------------------------------------------
  // SPECIAL
  // ---------------------------------------------------------------------------

  easterEgg: (ctx, volume) => {
    // Melodic phrase: D-F#-A-B-A
    const now = ctx.currentTime;
    const melody = [NOTES.D4, NOTES['F#4'], NOTES.A4, NOTES.B4, NOTES.A4];

    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const start = now + i * 0.15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume * 0.25, start + 0.02);
      gain.gain.setValueAtTime(volume * 0.25, start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  },

  markHover: (ctx, volume) => {
    // Tiny bright ping - D5 sine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = NOTES.D5;

    gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  startup: (ctx, volume) => {
    playStartupSound(ctx, volume);
  },

  windDown: (ctx, volume) => {
    playWindDownSound(ctx, volume);
  },
};

// =============================================================================
// SOUND SYSTEM CLASS
// =============================================================================

type SoundStateListener = (enabled: boolean) => void;

const STORAGE_KEY = 'warm-terminal-sound-enabled';

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;
  private masterVolume: number = 0.7;
  private listeners: Set<SoundStateListener> = new Set();
  private customSounds: Record<string, Sound> = {};

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    }
  }

  private saveState(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(this.enabled));
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    // Re-read from localStorage in case it changed
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      this.enabled = stored === 'true';
    }

    // Load custom sounds from Sound Lab
    this.loadCustomSounds();

    // Listen for updates from Sound Lab
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'soundlab-sounds') {
          this.loadCustomSounds();
        }
      });
      window.addEventListener('soundlab-update', () => {
        this.loadCustomSounds();
      });
    }

    // Pre-create AudioContext (will be resumed on first user interaction)
    this.getAudioContext();
    this.initialized = true;
  }

  private loadCustomSounds(): void {
    try {
      if (typeof window === 'undefined') return;
      const custom = localStorage.getItem('soundlab-sounds');
      if (custom) {
        this.customSounds = JSON.parse(custom);
      }
    } catch (e) {
      console.warn('Failed to load custom sounds', e);
    }
  }

  subscribe(listener: SoundStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.enabled));
  }

  enable(): void {
    this.enabled = true;
    this.saveState();
    this.play('soundOn');
    this.notifyListeners();
  }

  disable(): void {
    // Cancel any playing startup sound before playing the "off" sound
    cancelStartupSound();

    this.play('soundOff');
    this.enabled = false;
    this.saveState();
    this.notifyListeners();
  }

  toggle(): boolean {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if the AudioContext is ready for playback
   */
  isAudioReady(): boolean {
    return this.audioContext?.state === 'running';
  }

  /**
   * Unlock the AudioContext. Must be called directly from a user interaction
   * handler (click, keydown, etc.) - NOT from a setTimeout or Promise callback.
   */
  unlockAudio(): void {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  play(name: SoundName): void {
    if (!this.enabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    // =========================================================================
    // FIX: Don't schedule sounds if AudioContext is suspended
    // This prevents sounds from "queuing up" and playing all at once
    // when the context is finally resumed by user interaction.
    // =========================================================================
    if (ctx.state !== 'running') {
      console.log(`[Sound] Skipping "${name}": AudioContext is ${ctx.state}`);
      return;
    }

    // Check for custom sound first
    if (this.customSounds[name]) {
      try {
        playCustomSound(ctx, ctx.destination, this.customSounds[name], this.masterVolume);
        return;
      } catch (e) {
        console.warn(`Failed to play custom sound: ${name}`, e);
        // Fall back to default synthesizer
      }
    }

    const synthesizer = SYNTHESIZERS[name];
    if (synthesizer) {
      try {
        synthesizer(ctx, this.masterVolume);
      } catch (e) {
        console.warn(`Failed to play sound: ${name}`, e);
      }
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Cancel any currently playing startup sound.
   * Useful for cleanup on navigation.
   */
  cancelStartup(): void {
    cancelStartupSound();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const soundSystem = new SoundSystem();

export function playSound(name: SoundName): void {
  soundSystem.play(name);
}

// Re-export for direct access if needed
export { cancelStartupSound } from './startup-sound';