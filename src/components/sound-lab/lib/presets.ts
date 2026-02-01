/**
 * Sound Lab Default Presets
 * The 14 core UI sounds for Warm Terminal
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
// SIMPLE SOUND PARAMETERS
// =============================================================================

const clickParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'square',
    frequency: 800,
    detune: 0,
    level: 0.3,
    pitchEnvelope: { enabled: true, startFreq: 800, endFreq: 200, time: 50 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 1, decay: 30, sustain: 0, release: 20 },
  filter: { enabled: true, type: 'lowpass', cutoff: 2000, resonance: 0.5, envelopeAmount: 0 },
};

const hoverParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.E4,
    detune: 0,
    level: 0.15,
    pitchEnvelope: { enabled: false, startFreq: N.E4, endFreq: N.E4, time: 30 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 2, decay: 20, sustain: 0, release: 10 },
  filter: defaultFilter(false),
};

const tabParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'triangle',
    frequency: 600,
    detune: 0,
    level: 0.25,
    pitchEnvelope: { enabled: true, startFreq: 600, endFreq: 300, time: 50 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 1, decay: 40, sustain: 0, release: 10 },
  filter: defaultFilter(false),
};

const errorParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.B3,
    detune: 0,
    level: 0.3,
    pitchEnvelope: { enabled: false, startFreq: N.B3, endFreq: N.B3, time: 200 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 10, decay: 100, sustain: 0.3, release: 90 },
  filter: { enabled: true, type: 'lowpass', cutoff: 800, resonance: 0.5, envelopeAmount: 0 },
};

const pageTransitionParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D3,
    detune: 0,
    level: 0.2,
    pitchEnvelope: { enabled: false, startFreq: N.D3, endFreq: N.D3, time: 200 },
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.A3,
    detune: 0,
    level: 0.15,
    pitchEnvelope: { enabled: false, startFreq: N.A3, endFreq: N.A3, time: 200 },
  },
  envelope: { attack: 10, decay: 100, sustain: 0.2, release: 90 },
  filter: defaultFilter(false),
};

const navShiftParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: 1000,
    detune: 0,
    level: 0.1,
    pitchEnvelope: { enabled: true, startFreq: 800, endFreq: 1200, time: 150 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 20, decay: 80, sustain: 0, release: 50 },
  filter: { enabled: true, type: 'bandpass', cutoff: 1000, resonance: 0.5, envelopeAmount: 0 },
};

const paletteOpenParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D4,
    detune: 0,
    level: 0.25,
    pitchEnvelope: { enabled: true, startFreq: N.D4, endFreq: N.A4, time: 150 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 5, decay: 100, sustain: 0.3, release: 150 },
  filter: defaultFilter(false),
};

const paletteCloseParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.A4,
    detune: 0,
    level: 0.25,
    pitchEnvelope: { enabled: true, startFreq: N.A4, endFreq: N.D4, time: 150 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 5, decay: 100, sustain: 0.2, release: 150 },
  filter: defaultFilter(false),
};

const paletteNavParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N['F#4'],
    detune: 0,
    level: 0.12,
    pitchEnvelope: { enabled: false, startFreq: N['F#4'], endFreq: N['F#4'], time: 30 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 2, decay: 20, sustain: 0, release: 10 },
  filter: defaultFilter(false),
};

const paletteSelectParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'square',
    frequency: 600,
    detune: 0,
    level: 0.15,
    pitchEnvelope: { enabled: true, startFreq: 600, endFreq: 200, time: 20 },
  },
  oscB: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D4,
    detune: 0,
    level: 0.2,
    pitchEnvelope: { enabled: false, startFreq: N.D4, endFreq: N.D4, time: 100 },
  },
  envelope: { attack: 2, decay: 60, sustain: 0, release: 40 },
  filter: defaultFilter(false),
};

const markHoverParams: SimpleParams = {
  oscA: {
    enabled: true,
    waveform: 'sine',
    frequency: N.D5,
    detune: 0,
    level: 0.1,
    pitchEnvelope: { enabled: false, startFreq: N.D5, endFreq: N.D5, time: 50 },
  },
  oscB: defaultOsc(false),
  envelope: { attack: 2, decay: 30, sustain: 0, release: 20 },
  filter: defaultFilter(false),
};

// =============================================================================
// SEQUENCE SOUND PARAMETERS
// =============================================================================

const soundOnParams: SequenceParams = {
  notes: [
    { id: '1', delay: 0, frequency: N.D4, duration: 120, level: 0.2, waveform: 'sine' },
    { id: '2', delay: 100, frequency: N['F#4'], duration: 120, level: 0.2, waveform: 'sine' },
    { id: '3', delay: 200, frequency: N.A4, duration: 150, level: 0.25, waveform: 'sine' },
  ],
  envelope: { attack: 5, decay: 80, sustain: 0.3, release: 50 },
  filter: defaultFilter(false),
};

const soundOffParams: SequenceParams = {
  notes: [
    { id: '1', delay: 0, frequency: N.A4, duration: 400, level: 0.2, waveform: 'sine' },
  ],
  envelope: { attack: 10, decay: 200, sustain: 0.1, release: 190 },
  filter: { enabled: true, type: 'lowpass', cutoff: 2000, resonance: 0.5, envelopeAmount: -0.5 },
};

const easterEggParams: SequenceParams = {
  notes: [
    { id: '1', delay: 0, frequency: N.D4, duration: 120, level: 0.25, waveform: 'sine' },
    { id: '2', delay: 150, frequency: N['F#4'], duration: 120, level: 0.25, waveform: 'sine' },
    { id: '3', delay: 300, frequency: N.A4, duration: 120, level: 0.25, waveform: 'sine' },
    { id: '4', delay: 450, frequency: N.B4, duration: 120, level: 0.25, waveform: 'sine' },
    { id: '5', delay: 600, frequency: N.A4, duration: 200, level: 0.25, waveform: 'sine' },
  ],
  envelope: { attack: 5, decay: 80, sustain: 0.4, release: 60 },
  filter: defaultFilter(false),
};

// =============================================================================
// SOUND DEFINITIONS
// =============================================================================

export const DEFAULT_SOUNDS: Record<string, Sound> = {
  click: {
    id: 'click', name: 'click', description: 'soft mechanical key',
    category: 'interactions', type: 'simple', locked: false, modified: false,
    params: clickParams,
  },
  hover: {
    id: 'hover', name: 'hover', description: 'quiet tonal ping',
    category: 'interactions', type: 'simple', locked: false, modified: false,
    params: hoverParams,
  },
  tab: {
    id: 'tab', name: 'tab', description: 'light click',
    category: 'interactions', type: 'simple', locked: false, modified: false,
    params: tabParams,
  },
  error: {
    id: 'error', name: 'error', description: 'low muted tone',
    category: 'interactions', type: 'simple', locked: false, modified: false,
    params: errorParams,
  },
  pageTransition: {
    id: 'pageTransition', name: 'pageTransition', description: 'low warm tone + step',
    category: 'transitions', type: 'simple', locked: false, modified: false,
    params: pageTransitionParams,
  },
  navShift: {
    id: 'navShift', name: 'navShift', description: 'subtle whoosh',
    category: 'transitions', type: 'simple', locked: false, modified: false,
    params: navShiftParams,
  },
  paletteOpen: {
    id: 'paletteOpen', name: 'paletteOpen', description: 'two notes ascending',
    category: 'palette', type: 'simple', locked: false, modified: false,
    params: paletteOpenParams,
  },
  paletteClose: {
    id: 'paletteClose', name: 'paletteClose', description: 'two notes descending',
    category: 'palette', type: 'simple', locked: false, modified: false,
    params: paletteCloseParams,
  },
  paletteNav: {
    id: 'paletteNav', name: 'paletteNav', description: 'soft tick',
    category: 'palette', type: 'simple', locked: false, modified: false,
    params: paletteNavParams,
  },
  paletteSelect: {
    id: 'paletteSelect', name: 'paletteSelect', description: 'click + tonal confirm',
    category: 'palette', type: 'simple', locked: false, modified: false,
    params: paletteSelectParams,
  },
  soundOn: {
    id: 'soundOn', name: 'soundOn', description: 'warm tone awakening',
    category: 'toggle', type: 'sequence', locked: false, modified: false,
    params: soundOnParams,
  },
  soundOff: {
    id: 'soundOff', name: 'soundOff', description: 'gentle fade/sigh',
    category: 'toggle', type: 'sequence', locked: false, modified: false,
    params: soundOffParams,
  },
  easterEgg: {
    id: 'easterEgg', name: 'easterEgg', description: 'melodic phrase',
    category: 'special', type: 'sequence', locked: false, modified: false,
    params: easterEggParams,
  },
  markHover: {
    id: 'markHover', name: 'markHover', description: 'tiny bright ping',
    category: 'special', type: 'simple', locked: false, modified: false,
    params: markHoverParams,
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
