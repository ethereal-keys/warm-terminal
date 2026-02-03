/**
 * Sound Lab Presets - Musical, Organic, Tech-Adjacent
 * 
 * Design Philosophy:
 * - Musical: All sounds rooted in D major pentatonic (D, E, F#, A, B)
 * - Organic: Gentle curves, breathing envelopes, slight imperfections
 * - Tech-adjacent: Clean sine foundations with subtle harmonic richness
 * 
 * Tonal Guidelines (from design doc):
 * - Positive (select, success): D, A (root + fifth)
 * - Neutral (navigate, hover): E, F# (gentle steps)  
 * - Negative (error, close): B, lower D (resolution down)
 * - Delight: Full phrase D-F#-A-B-A
 */

import type { Sound, SimpleParams, SequenceParams, OscillatorParams, EnvelopeParams, FilterParams } from './types';
import { D_PENTATONIC as N } from './types';

// =============================================================================
// DEFAULT PARAMETER FACTORIES
// =============================================================================

const defaultOsc = (enabled = true): OscillatorParams => ({
  enabled,
  waveform: 'sine',
  frequency: 440,
  detune: 0,
  level: 0.7,
  pitchEnvelope: { enabled: false, startFreq: 440, endFreq: 440, time: 50 },
});

const defaultEnv = (): EnvelopeParams => ({
  attack: 5,
  decay: 50,
  sustain: 0.5,
  release: 100,
});

const defaultFilter = (enabled = false): FilterParams => ({
  enabled,
  type: 'lowpass',
  cutoff: 2000,
  resonance: 1,
  envelopeAmount: 0,
});

// =============================================================================
// INTERACTIONS - Soft, round, organic
// =============================================================================

/**
 * CLICK - Gentle thud with warmth
 * Character: Like a muted piano key or soft wooden tap - round, not sharp
 * Duration: ~120ms
 */
const clickParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',      // Pure sine for maximum softness
    frequency: N.D3,       // Low D for warmth and body
    detune: 0,
    level: 0.2,
    pitchEnvelope: { enabled: true, startFreq: N.A3, endFreq: N.D3, time: 60 }, // Gentle fall, not sharp
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D4,       // Octave above for subtle presence
    detune: 5,             // Slight detuning for organic warmth
    level: 0.08,
    pitchEnvelope: { enabled: false, startFreq: N.D4, endFreq: N.D4, time: 50 },
  },
  envelope: { attack: 5, decay: 80, sustain: 0, release: 40 }, // Slower attack, longer decay
  filter: { enabled: true, type: 'lowpass', cutoff: 800, resonance: 0.5, envelopeAmount: 0 }, // Heavy filtering
};

/**
 * HOVER - Gentle breath of air
 * Character: Almost felt more than heard - like a soft exhale
 * Duration: ~70ms
 */
const hoverParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.E4,       // Neutral E
    detune: 0,
    level: 0.04,           // Very quiet
    pitchEnvelope: { enabled: false, startFreq: N.E4, endFreq: N.E4, time: 25 }, // No pitch movement
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.E3,       // Octave below for soft body
    detune: 0,
    level: 0.025,
    pitchEnvelope: { enabled: false, startFreq: N.E3, endFreq: N.E3, time: 30 },
  },
  envelope: { attack: 15, decay: 30, sustain: 0, release: 25 }, // Slow fade in/out - breathing
  filter: { enabled: true, type: 'lowpass', cutoff: 1200, resonance: 0.3, envelopeAmount: 0 },
};

/**
 * TAB - Soft step
 * Character: Like a gentle footstep on carpet - muted and warm
 * Duration: ~100ms
 */
const tabParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',      // Pure sine, no harmonics
    frequency: N.A3,       // Lower frequency
    detune: 0,
    level: 0.15,
    pitchEnvelope: { enabled: true, startFreq: N.D4, endFreq: N.A3, time: 70 }, // Slower, gentler fall
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D3,       // Warm bass body
    detune: 3,
    level: 0.08,
    pitchEnvelope: { enabled: false, startFreq: N.D3, endFreq: N.D3, time: 50 },
  },
  envelope: { attack: 8, decay: 60, sustain: 0, release: 30 }, // Softer envelope
  filter: { enabled: true, type: 'lowpass', cutoff: 1000, resonance: 0.4, envelopeAmount: 0 },
};

/**
 * ERROR - Low muted tone with subtle dissonance
 * Character: Not alarming, but clearly "no" - like a gentle door bump
 * Duration: ~200ms
 */
const errorParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.B3,       // B for negative/resolution
    detune: 0,
    level: 0.25,
    pitchEnvelope: { enabled: true, startFreq: N.B3, endFreq: N.B3 * 0.95, time: 180 }, // Slight droop
  },
  oscB: {
    enabled: true,
    waveform: 'triangle',
    frequency: N.D3,       // Lower D for gravity
    detune: -5,            // Slight beating for organic feel
    level: 0.12,
    pitchEnvelope: { enabled: false, startFreq: N.D3, endFreq: N.D3, time: 200 },
  },
  envelope: { attack: 15, decay: 120, sustain: 0.15, release: 80 },
  filter: { enabled: true, type: 'lowpass', cutoff: 600, resonance: 0.8, envelopeAmount: -0.2 },
};

// =============================================================================
// TRANSITIONS - Movement, space, journey
// =============================================================================

/**
 * PAGE TRANSITION - Low warm tone with upward resolution
 * Character: Like stepping into a new room - space and possibility
 * Duration: ~200ms
 */
const pageTransitionParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D3,       // Root for grounding
    detune: 0,
    level: 0.18,
    pitchEnvelope: { enabled: true, startFreq: N.D3, endFreq: N.A3, time: 150 }, // D to A - upward resolution
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.A3,       // Fifth for harmonic richness
    detune: 2,
    level: 0.12,
    pitchEnvelope: { enabled: true, startFreq: N.D3, endFreq: N.D4, time: 180 }, // Octave bloom
  },
  envelope: { attack: 20, decay: 100, sustain: 0.2, release: 80 },
  filter: { enabled: true, type: 'lowpass', cutoff: 2500, resonance: 0.5, envelopeAmount: 0.4 },
};

/**
 * NAV SHIFT - Subtle whoosh with tonal movement
 * Character: Air moving, like pages turning in wind
 * Duration: ~150ms  
 */
const navShiftParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: 800,
    detune: 0,
    level: 0.08,
    pitchEnvelope: { enabled: true, startFreq: 600, endFreq: 1100, time: 120 }, // Sweep up
  },
  oscB: {
    enabled: true,
    waveform: 'triangle',
    frequency: 400,
    detune: 0,
    level: 0.05,
    pitchEnvelope: { enabled: true, startFreq: 300, endFreq: 550, time: 130 }, // Parallel sweep
  },
  envelope: { attack: 25, decay: 70, sustain: 0, release: 55 },
  filter: { enabled: true, type: 'bandpass', cutoff: 900, resonance: 1.5, envelopeAmount: 0.6 },
};

// =============================================================================
// PALETTE - Command palette interactions
// =============================================================================

/**
 * PALETTE OPEN - Two notes ascending (D → A)
 * Character: Invitation, opening up, possibility
 * Duration: ~300ms
 */
const paletteOpenParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D4,
    detune: 0,
    level: 0.22,
    pitchEnvelope: { enabled: true, startFreq: N.D4, endFreq: N.A4, time: 200 }, // D to A - positive interval
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D5,       // Octave shimmer
    detune: 4,
    level: 0.08,
    pitchEnvelope: { enabled: true, startFreq: N.D5, endFreq: N.A5, time: 220 },
  },
  envelope: { attack: 8, decay: 150, sustain: 0.25, release: 140 },
  filter: { enabled: true, type: 'lowpass', cutoff: 5000, resonance: 0.3, envelopeAmount: 0.2 },
};

/**
 * PALETTE CLOSE - Same notes descending (A → D)
 * Character: Gentle closing, resolution, return
 * Duration: ~300ms
 */
const paletteCloseParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.A4,
    detune: 0,
    level: 0.2,
    pitchEnvelope: { enabled: true, startFreq: N.A4, endFreq: N.D4, time: 200 }, // A to D - return home
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.A5,
    detune: 4,
    level: 0.06,
    pitchEnvelope: { enabled: true, startFreq: N.A5, endFreq: N.D5, time: 220 },
  },
  envelope: { attack: 8, decay: 140, sustain: 0.15, release: 150 },
  filter: { enabled: true, type: 'lowpass', cutoff: 4000, resonance: 0.3, envelopeAmount: -0.3 },
};

/**
 * PALETTE NAV - Soft tick for navigating results
 * Character: Gentle step, barely there
 * Duration: ~50ms
 */
const paletteNavParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.E4,       // Neutral E
    detune: 0,
    level: 0.08,           // Quieter
    pitchEnvelope: { enabled: false, startFreq: N.E4, endFreq: N.E4, time: 20 }, // No pitch movement
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.E3,       // Octave below for body
    detune: 0,
    level: 0.04,
    pitchEnvelope: { enabled: false, startFreq: N.E3, endFreq: N.E3, time: 20 },
  },
  envelope: { attack: 8, decay: 25, sustain: 0, release: 20 }, // Softer attack
  filter: { enabled: true, type: 'lowpass', cutoff: 1500, resonance: 0.3, envelopeAmount: 0 },
};

/**
 * PALETTE SELECT - Soft confirmation with rising tone
 * Character: Gentle "yes" - confirmation without sharpness
 * Duration: ~130ms
 */
const paletteSelectParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',      // Pure sine, no transient click
    frequency: N.D4,
    detune: 0,
    level: 0.18,
    pitchEnvelope: { enabled: true, startFreq: N.D4, endFreq: N.A4, time: 100 }, // Rising confirmation
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D3,       // Bass body for warmth
    detune: 2,
    level: 0.1,
    pitchEnvelope: { enabled: false, startFreq: N.D3, endFreq: N.D3, time: 100 },
  },
  envelope: { attack: 5, decay: 80, sustain: 0.1, release: 50 },
  filter: { enabled: true, type: 'lowpass', cutoff: 3000, resonance: 0.4, envelopeAmount: 0.15 },
};

// =============================================================================
// SPECIAL - Mark hover and easter egg
// =============================================================================

/**
 * MARK HOVER - Soft jewel-like ping on signature mark
 * Character: Gentle sparkle, precious moment
 * Duration: ~80ms
 */
const markHoverParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D5,       // High D - bright but filtered
    detune: 0,
    level: 0.06,           // Quieter
    pitchEnvelope: { enabled: false, startFreq: N.D5, endFreq: N.D5, time: 35 }, // No pitch movement
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.A4,       // Fifth below for warmth
    detune: 3,
    level: 0.03,
    pitchEnvelope: { enabled: false, startFreq: N.A4, endFreq: N.A4, time: 50 },
  },
  envelope: { attack: 10, decay: 40, sustain: 0, release: 30 }, // Slower attack
  filter: { enabled: true, type: 'lowpass', cutoff: 2500, resonance: 0.3, envelopeAmount: 0 },
};

// =============================================================================
// SEQUENCE SOUNDS - Multi-note compositions
// =============================================================================

/**
 * SOUND ON - Warm awakening sequence (D → F# → A)
 * Character: System coming alive, like sunrise
 * Duration: ~400ms
 */
const soundOnParams: SequenceParams = {
  notes: [
    { id: '1', delay: 0, frequency: N.D4, duration: 180, level: 0.22, waveform: 'sine' },
    { id: '2', delay: 120, frequency: N['F#4'], duration: 180, level: 0.24, waveform: 'sine' },
    { id: '3', delay: 240, frequency: N.A4, duration: 220, level: 0.28, waveform: 'sine' },
  ],
  envelope: { attack: 12, decay: 100, sustain: 0.35, release: 80 },
  filter: { enabled: true, type: 'lowpass', cutoff: 4000, resonance: 0.4, envelopeAmount: 0.3 },
};

/**
 * SOUND OFF - Gentle fading sigh (A fading with filter sweep)
 * Character: Peaceful dimming, like sunset
 * Duration: ~400ms
 */
const soundOffParams: SequenceParams = {
  notes: [
    { id: '1', delay: 0, frequency: N.A4, duration: 500, level: 0.2, waveform: 'sine' },
    { id: '2', delay: 50, frequency: N.D4, duration: 450, level: 0.12, waveform: 'sine' },
  ],
  envelope: { attack: 15, decay: 250, sustain: 0.08, release: 200 },
  filter: { enabled: true, type: 'lowpass', cutoff: 3000, resonance: 0.6, envelopeAmount: -0.7 },
};

/**
 * EASTER EGG - Full melodic phrase (D → F# → A → B → A)
 * Character: Delightful discovery, reward
 * Duration: ~800ms
 */
const easterEggParams: SequenceParams = {
  notes: [
    { id: '1', delay: 0, frequency: N.D4, duration: 140, level: 0.28, waveform: 'sine' },
    { id: '2', delay: 150, frequency: N['F#4'], duration: 140, level: 0.28, waveform: 'sine' },
    { id: '3', delay: 300, frequency: N.A4, duration: 140, level: 0.3, waveform: 'sine' },
    { id: '4', delay: 450, frequency: N.B4, duration: 140, level: 0.32, waveform: 'sine' },
    { id: '5', delay: 600, frequency: N.A4, duration: 250, level: 0.28, waveform: 'sine' },
  ],
  envelope: { attack: 8, decay: 90, sustain: 0.4, release: 70 },
  filter: { enabled: true, type: 'lowpass', cutoff: 5000, resonance: 0.35, envelopeAmount: 0.15 },
};

/**
 * STARTUP CHIME - Warm welcome sequence
 * Character: "Hello, I'm here" - inviting, confident, warm
 * Duration: ~600ms
 * Notes: D4 → A4 (fifth) → D5 (octave bloom)
 */
const startupChimeParams: SequenceParams = {
  notes: [
    { id: '1', delay: 0, frequency: N.D4, duration: 200, level: 0.25, waveform: 'sine' },
    { id: '2', delay: 80, frequency: N.D3, duration: 280, level: 0.15, waveform: 'sine' },      // Bass foundation
    { id: '3', delay: 180, frequency: N.A4, duration: 200, level: 0.28, waveform: 'sine' },
    { id: '4', delay: 200, frequency: N['F#4'], duration: 180, level: 0.12, waveform: 'triangle' }, // Subtle color
    { id: '5', delay: 350, frequency: N.D5, duration: 300, level: 0.22, waveform: 'sine' },
    { id: '6', delay: 380, frequency: N.A4, duration: 280, level: 0.1, waveform: 'sine' },      // Fifth sustain
  ],
  envelope: { attack: 15, decay: 150, sustain: 0.3, release: 120 },
  filter: { enabled: true, type: 'lowpass', cutoff: 4500, resonance: 0.45, envelopeAmount: 0.25 },
};

// =============================================================================
// SOUND DEFINITIONS
// =============================================================================

export const DEFAULT_SOUNDS: Record<string, Sound> = {
  click: {
    id: 'click', name: 'click', description: 'gentle thud like a muted piano key',
    category: 'interactions', type: 'simple', locked: false, modified: false,
    params: clickParams,
  },
  hover: {
    id: 'hover', name: 'hover', description: 'gentle breath - felt more than heard',
    category: 'interactions', type: 'simple', locked: false, modified: false,
    params: hoverParams,
  },
  tab: {
    id: 'tab', name: 'tab', description: 'soft step like footsteps on carpet',
    category: 'interactions', type: 'simple', locked: false, modified: false,
    params: tabParams,
  },
  error: {
    id: 'error', name: 'error', description: 'gentle muted tone - not alarming',
    category: 'interactions', type: 'simple', locked: false, modified: false,
    params: errorParams,
  },
  pageTransition: {
    id: 'pageTransition', name: 'pageTransition', description: 'warm tone with upward resolution',
    category: 'transitions', type: 'simple', locked: false, modified: false,
    params: pageTransitionParams,
  },
  navShift: {
    id: 'navShift', name: 'navShift', description: 'subtle whoosh like pages turning',
    category: 'transitions', type: 'simple', locked: false, modified: false,
    params: navShiftParams,
  },
  paletteOpen: {
    id: 'paletteOpen', name: 'paletteOpen', description: 'D to A ascending - invitation',
    category: 'palette', type: 'simple', locked: false, modified: false,
    params: paletteOpenParams,
  },
  paletteClose: {
    id: 'paletteClose', name: 'paletteClose', description: 'A to D descending - return home',
    category: 'palette', type: 'simple', locked: false, modified: false,
    params: paletteCloseParams,
  },
  paletteNav: {
    id: 'paletteNav', name: 'paletteNav', description: 'soft breath for stepping through',
    category: 'palette', type: 'simple', locked: false, modified: false,
    params: paletteNavParams,
  },
  paletteSelect: {
    id: 'paletteSelect', name: 'paletteSelect', description: 'gentle rising confirmation',
    category: 'palette', type: 'simple', locked: false, modified: false,
    params: paletteSelectParams,
  },
  soundOn: {
    id: 'soundOn', name: 'soundOn', description: 'D-F#-A awakening - like sunrise',
    category: 'toggle', type: 'sequence', locked: false, modified: false,
    params: soundOnParams,
  },
  soundOff: {
    id: 'soundOff', name: 'soundOff', description: 'fading sigh - peaceful dimming',
    category: 'toggle', type: 'sequence', locked: false, modified: false,
    params: soundOffParams,
  },
  easterEgg: {
    id: 'easterEgg', name: 'easterEgg', description: 'D-F#-A-B-A melodic reward',
    category: 'special', type: 'sequence', locked: false, modified: false,
    params: easterEggParams,
  },
  markHover: {
    id: 'markHover', name: 'markHover', description: 'soft jewel-like sparkle',
    category: 'special', type: 'simple', locked: false, modified: false,
    params: markHoverParams,
  },
  startupChime: {
    id: 'startupChime', name: 'startupChime', description: 'warm welcome - D-A-D octave bloom',
    category: 'special', type: 'sequence', locked: false, modified: false,
    params: startupChimeParams,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getDefaultSimpleParams(): SimpleParams {
  return {
    oscA: defaultOsc(true),
    oscB: defaultOsc(false),
    envelope: defaultEnv(),
    filter: defaultFilter(false),
  };
}

export function getDefaultSequenceParams(): SequenceParams {
  return {
    notes: [{ id: '1', delay: 0, frequency: 440, duration: 100, level: 0.7, waveform: 'sine' }],
    envelope: defaultEnv(),
    filter: defaultFilter(false),
  };
}

export function createSound(name: string, type: 'simple' | 'sequence'): Sound {
  const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  return {
    id, name, description: '',
    category: 'custom', type, locked: false, modified: false,
    params: type === 'simple' ? getDefaultSimpleParams() : getDefaultSequenceParams(),
  };
}

export function duplicateSound(sound: Sound): Sound {
  const id = `${sound.name}-copy-${Date.now()}`;
  return {
    ...structuredClone(sound),
    id,
    name: `${sound.name} copy`,
    category: 'custom',
    locked: false,
    modified: false,
  };
}