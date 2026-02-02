/**
 * Warm Terminal Sound System
 * 
 * Web Audio API synthesis engine matching the design doc specifications.
 * D major pentatonic tonal palette (D, E, F#, A, B) — notes that can't clash.
 * 
 * Drop-in replacement for the Howler.js version.
 */

import type { SoundName } from '@/types';
import type { Sound } from '../components/sound-lab/lib/types';
import { playCustomSound } from './sound-player';

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
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  },

  tab: (ctx, volume) => {
    // Light click - triangle wave
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  error: (ctx, volume) => {
    // Low muted tone - B3 (resolution down)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = NOTES.B3;

    filter.type = 'lowpass';
    filter.frequency.value = 800;

    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  },

  // ---------------------------------------------------------------------------
  // TRANSITIONS
  // ---------------------------------------------------------------------------

  pageTransition: (ctx, volume) => {
    // Low warm tone + step - D3 base with A3 step
    const now = ctx.currentTime;

    // Base tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = NOTES.D3;
    gain1.gain.setValueAtTime(volume * 0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start();
    osc1.stop(now + 0.2);

    // Step up
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = NOTES.A3;
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(volume * 0.15, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start();
    osc2.stop(now + 0.2);
  },

  navShift: (ctx, volume) => {
    // Subtle whoosh - filtered noise
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate noise with envelope baked in
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  },

  // ---------------------------------------------------------------------------
  // PALETTE (Command Palette)
  // ---------------------------------------------------------------------------

  paletteOpen: (ctx, volume) => {
    // Two notes ascending - D4 → A4 (root + fifth)
    const now = ctx.currentTime;

    // First note: D4
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = NOTES.D4;
    gain1.gain.setValueAtTime(volume * 0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start();
    osc1.stop(now + 0.15);

    // Second note: A4
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = NOTES.A4;
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(volume * 0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.3);
  },

  paletteClose: (ctx, volume) => {
    // Two notes descending - A4 → D4
    const now = ctx.currentTime;

    // First note: A4
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = NOTES.A4;
    gain1.gain.setValueAtTime(volume * 0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start();
    osc1.stop(now + 0.15);

    // Second note: D4
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = NOTES.D4;
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(volume * 0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.3);
  },

  paletteNav: (ctx, volume) => {
    // Soft tick - F#4 sine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = NOTES['F#4'];

    gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  },

  paletteSelect: (ctx, volume) => {
    // Click + tonal confirm
    const now = ctx.currentTime;

    // Click component
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(600, now);
    clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.02);
    clickGain.gain.setValueAtTime(volume * 0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    clickOsc.connect(clickGain).connect(ctx.destination);
    clickOsc.start();
    clickOsc.stop(now + 0.02);

    // Tonal confirm - D4
    const toneOsc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    toneOsc.type = 'sine';
    toneOsc.frequency.value = NOTES.D4;
    toneGain.gain.setValueAtTime(0, now + 0.015);
    toneGain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.025);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    toneOsc.connect(toneGain).connect(ctx.destination);
    toneOsc.start(now + 0.015);
    toneOsc.stop(now + 0.1);
  },

  // ---------------------------------------------------------------------------
  // TOGGLE (Sound On/Off)
  // ---------------------------------------------------------------------------

  soundOn: (ctx, volume) => {
    // Warm tone awakening - rising phrase D4 → F#4 → A4
    const now = ctx.currentTime;
    const notes = [NOTES.D4, NOTES['F#4'], NOTES.A4];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const start = now + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume * 0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  },

  soundOff: (ctx, volume) => {
    // Gentle fade/sigh - falling A4 → D3 with lowpass sweep
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES.A4, now);
    osc.frequency.exponentialRampToValueAtTime(NOTES.D3, now + 0.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.4);
  },

  // ---------------------------------------------------------------------------
  // SPECIAL
  // ---------------------------------------------------------------------------

  easterEgg: (ctx, volume) => {
    // Melodic phrase: D-F#-A-B-A (delight!)
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

  play(name: SoundName): void {
    if (!this.enabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

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
}

// =============================================================================
// EXPORTS
// =============================================================================

export const soundSystem = new SoundSystem();

export function playSound(name: SoundName): void {
  soundSystem.play(name);
}
