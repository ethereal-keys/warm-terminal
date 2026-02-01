/**
 * Sound Lab Type Definitions
 */

// =============================================================================
// SYNTHESIS TYPES
// =============================================================================

export type WaveformType = 'sine' | 'triangle' | 'square' | 'sawtooth';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass';
export type SoundType = 'simple' | 'sequence';
export type CategoryId = 'interactions' | 'transitions' | 'palette' | 'toggle' | 'special' | 'custom';

// =============================================================================
// PARAMETER INTERFACES
// =============================================================================

export interface PitchEnvelope {
  enabled: boolean;
  startFreq: number;  // Hz
  endFreq: number;    // Hz
  time: number;       // ms
}

export interface OscillatorParams {
  enabled: boolean;
  waveform: WaveformType;
  frequency: number;   // Hz (20-20000)
  detune: number;      // cents (-100 to +100)
  level: number;       // 0-1
  pitchEnvelope: PitchEnvelope;
}

export interface EnvelopeParams {
  attack: number;      // ms (0-2000)
  decay: number;       // ms (0-2000)
  sustain: number;     // 0-1
  release: number;     // ms (0-5000)
}

export interface FilterParams {
  enabled: boolean;
  type: FilterType;
  cutoff: number;         // Hz (20-20000)
  resonance: number;      // Q (0.1-20)
  envelopeAmount: number; // -1 to +1
}

// =============================================================================
// SIMPLE SOUND PARAMS
// =============================================================================

export interface SimpleParams {
  oscA: OscillatorParams;
  oscB: OscillatorParams;
  envelope: EnvelopeParams;
  filter: FilterParams;
}

// =============================================================================
// SEQUENCE TYPES
// =============================================================================

export interface SequenceNote {
  id: string;
  delay: number;       // ms from start
  duration: number;    // ms
  frequency: number;   // Hz
  level: number;       // 0-1
  waveform: WaveformType;
}

export interface SequenceParams {
  notes: SequenceNote[];
  envelope: EnvelopeParams;
  filter: FilterParams;
}

// =============================================================================
// SOUND DEFINITION
// =============================================================================

export interface Sound {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  type: SoundType;
  locked: boolean;
  modified: boolean;
  params: SimpleParams | SequenceParams;
}

// Type guards
export function isSimpleParams(p: SimpleParams | SequenceParams): p is SimpleParams {
  return 'oscA' in p;
}

export function isSequenceParams(p: SimpleParams | SequenceParams): p is SequenceParams {
  return 'notes' in p;
}

// =============================================================================
// CATEGORY
// =============================================================================

export interface Category {
  id: CategoryId;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: 'interactions', name: 'INTERACTIONS' },
  { id: 'transitions', name: 'TRANSITIONS' },
  { id: 'palette', name: 'PALETTE' },
  { id: 'toggle', name: 'TOGGLE' },
  { id: 'special', name: 'SPECIAL' },
  { id: 'custom', name: 'CUSTOM' },
];

// =============================================================================
// UI STATE
// =============================================================================

export type TabId = 'oscA' | 'oscB' | 'envelope' | 'filter' | 'sequence';

export interface SoundLabState {
  sounds: Record<string, Sound>;
  selectedId: string | null;
  activeTab: TabId;
  expandedCategories: Set<CategoryId>;
  isPlaying: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const FREQUENCY_MIN = 20;
export const FREQUENCY_MAX = 20000;

// =============================================================================
// NOTE HELPERS
// =============================================================================

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function frequencyToNote(freq: number): string {
  if (freq <= 0) return '--';
  const noteNum = 12 * Math.log2(freq / 440) + 69;
  const rounded = Math.round(noteNum);
  const noteIndex = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

// Alias for backwards compatibility
export const freqToNote = frequencyToNote;

export function noteToFreq(note: string): number {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 440;
  const [, name, octStr] = match;
  const noteIndex = NOTE_NAMES.indexOf(name);
  if (noteIndex === -1) return 440;
  const octave = parseInt(octStr, 10);
  const noteNum = noteIndex + (octave + 1) * 12;
  return 440 * Math.pow(2, (noteNum - 69) / 12);
}

// =============================================================================
// ID GENERATOR
// =============================================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// D major pentatonic reference frequencies
export const D_PENTATONIC = {
  D3: 146.83, E3: 164.81, 'F#3': 185.00, A3: 220.00, B3: 246.94,
  D4: 293.66, E4: 329.63, 'F#4': 369.99, A4: 440.00, B4: 493.88,
  D5: 587.33, E5: 659.25, 'F#5': 739.99, A5: 880.00, B5: 987.77,
} as const;
