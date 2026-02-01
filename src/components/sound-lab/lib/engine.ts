/**
 * Sound Lab Synthesis Engine
 * Web Audio API synthesizer for UI sounds
 */

import type { 
  SimpleParams, 
  SequenceParams, 
  OscillatorParams, 
  EnvelopeParams, 
  FilterParams,
  SequenceNote 
} from './types';
import { isSimpleParams } from './types';

// =============================================================================
// AUDIO CONTEXT MANAGEMENT
// =============================================================================

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let masterGain: GainNode | null = null;
let activeNodes: AudioNode[] = [];
let playing = false;

export function getContext(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function getAnalyser(): AnalyserNode {
  const c = getContext();
  if (!analyser) {
    analyser = c.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3;
  }
  return analyser;
}

export function getMaster(): GainNode {
  const c = getContext();
  if (!masterGain) {
    masterGain = c.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(getAnalyser());
    getAnalyser().connect(c.destination);
  }
  return masterGain;
}

export function setMasterVolume(vol: number): void {
  getMaster().gain.value = Math.max(0, Math.min(1, vol));
}

// =============================================================================
// WAVEFORM DATA FOR OSCILLOSCOPE
// =============================================================================

export function getWaveformData(): Uint8Array {
  const a = getAnalyser();
  const data = new Uint8Array(a.frequencyBinCount);
  a.getByteTimeDomainData(data);
  return data;
}

// =============================================================================
// PLAYBACK CONTROL
// =============================================================================

export function isPlaying(): boolean {
  return playing;
}

export function stop(): void {
  activeNodes.forEach(node => {
    try {
      if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
        node.stop();
      }
      node.disconnect();
    } catch (e) {
      // Already stopped
    }
  });
  activeNodes = [];
  playing = false;
}

// =============================================================================
// PLAY SOUND
// =============================================================================

export function play(params: SimpleParams | SequenceParams): number {
  stop();
  
  if (isSimpleParams(params)) {
    return playSimple(params);
  } else {
    return playSequence(params);
  }
}

function playSimple(p: SimpleParams): number {
  const c = getContext();
  const now = c.currentTime;
  const master = getMaster();
  
  // Calculate duration
  const { attack, decay, release } = p.envelope;
  const envTime = (attack + decay + 50 + release) / 1000;
  
  // Create filter chain if enabled
  let dest: AudioNode = master;
  if (p.filter.enabled) {
    const filter = createFilter(c, p.filter, p.envelope, now);
    filter.connect(master);
    activeNodes.push(filter);
    dest = filter;
  }
  
  // Create oscillators
  if (p.oscA.enabled) {
    createOsc(c, p.oscA, p.envelope, now, dest);
  }
  if (p.oscB.enabled) {
    createOsc(c, p.oscB, p.envelope, now, dest);
  }
  
  playing = true;
  const duration = envTime * 1000;
  
  setTimeout(() => {
    if (playing) stop();
  }, duration + 50);
  
  return duration;
}

function playSequence(p: SequenceParams): number {
  const c = getContext();
  const now = c.currentTime;
  const master = getMaster();
  
  // Create filter if enabled
  let dest: AudioNode = master;
  if (p.filter.enabled) {
    const filter = createFilter(c, p.filter, p.envelope, now);
    filter.connect(master);
    activeNodes.push(filter);
    dest = filter;
  }
  
  let maxEnd = 0;
  
  p.notes.forEach(note => {
    const startTime = now + note.delay / 1000;
    const noteEnd = note.delay + note.duration + p.envelope.release;
    maxEnd = Math.max(maxEnd, noteEnd);
    
    createNote(c, note, p.envelope, startTime, dest);
  });
  
  playing = true;
  const duration = maxEnd + 50;
  
  setTimeout(() => {
    if (playing) stop();
  }, duration);
  
  return duration;
}

// =============================================================================
// CREATE OSCILLATOR
// =============================================================================

function createOsc(
  c: AudioContext,
  osc: OscillatorParams,
  env: EnvelopeParams,
  startTime: number,
  dest: AudioNode
): void {
  const o = c.createOscillator();
  const g = c.createGain();
  
  o.type = osc.waveform;
  o.detune.value = osc.detune;
  
  // Pitch envelope or static frequency
  if (osc.pitchEnvelope.enabled) {
    o.frequency.setValueAtTime(osc.pitchEnvelope.startFreq, startTime);
    o.frequency.exponentialRampToValueAtTime(
      Math.max(osc.pitchEnvelope.endFreq, 20),
      startTime + osc.pitchEnvelope.time / 1000
    );
  } else {
    o.frequency.value = osc.frequency;
  }
  
  // ADSR
  const { attack, decay, sustain, release } = env;
  const aEnd = startTime + attack / 1000;
  const dEnd = aEnd + decay / 1000;
  const sHold = 0.05; // Brief sustain for UI sounds
  const rStart = dEnd + sHold;
  const rEnd = rStart + release / 1000;
  
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(osc.level, aEnd);
  g.gain.linearRampToValueAtTime(osc.level * sustain, dEnd);
  g.gain.setValueAtTime(osc.level * sustain, rStart);
  g.gain.linearRampToValueAtTime(0.0001, rEnd);
  
  o.connect(g);
  g.connect(dest);
  
  o.start(startTime);
  o.stop(rEnd + 0.05);
  
  activeNodes.push(o, g);
}

// =============================================================================
// CREATE SEQUENCE NOTE
// =============================================================================

function createNote(
  c: AudioContext,
  note: SequenceNote,
  env: EnvelopeParams,
  startTime: number,
  dest: AudioNode
): void {
  const o = c.createOscillator();
  const g = c.createGain();
  
  o.type = note.waveform;
  o.frequency.value = note.frequency;
  
  const { attack, decay, sustain, release } = env;
  const noteDur = note.duration / 1000;
  const aEnd = startTime + Math.min(attack / 1000, noteDur * 0.3);
  const dEnd = aEnd + Math.min(decay / 1000, noteDur * 0.3);
  const rStart = startTime + noteDur;
  const rEnd = rStart + release / 1000;
  
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(note.level, aEnd);
  g.gain.linearRampToValueAtTime(note.level * sustain, dEnd);
  g.gain.setValueAtTime(note.level * sustain, rStart);
  g.gain.linearRampToValueAtTime(0.0001, rEnd);
  
  o.connect(g);
  g.connect(dest);
  
  o.start(startTime);
  o.stop(rEnd + 0.05);
  
  activeNodes.push(o, g);
}

// =============================================================================
// CREATE FILTER
// =============================================================================

function createFilter(
  c: AudioContext,
  f: FilterParams,
  env: EnvelopeParams,
  startTime: number
): BiquadFilterNode {
  const filter = c.createBiquadFilter();
  filter.type = f.type;
  filter.Q.value = f.resonance;
  
  if (f.envelopeAmount !== 0) {
    const base = f.cutoff;
    const amt = f.envelopeAmount;
    const max = Math.min(base * (1 + Math.abs(amt) * 4), 18000);
    const min = Math.max(base * (1 - Math.abs(amt) * 0.9), 20);
    
    const { attack, decay, sustain } = env;
    const aEnd = startTime + attack / 1000;
    const dEnd = aEnd + decay / 1000;
    
    if (amt > 0) {
      filter.frequency.setValueAtTime(min, startTime);
      filter.frequency.exponentialRampToValueAtTime(max, aEnd);
      filter.frequency.exponentialRampToValueAtTime(min + (max - min) * sustain, dEnd);
    } else {
      filter.frequency.setValueAtTime(max, startTime);
      filter.frequency.exponentialRampToValueAtTime(min, aEnd);
      filter.frequency.exponentialRampToValueAtTime(max - (max - min) * sustain, dEnd);
    }
  } else {
    filter.frequency.value = f.cutoff;
  }
  
  return filter;
}

// =============================================================================
// WAV EXPORT
// =============================================================================

export async function renderToWav(params: SimpleParams | SequenceParams): Promise<Blob> {
  // Calculate duration
  let duration: number;
  if (isSimpleParams(params)) {
    const { attack, decay, release } = params.envelope;
    duration = (attack + decay + 100 + release) / 1000 + 0.1;
  } else {
    const maxEnd = Math.max(...params.notes.map(n => n.delay + n.duration));
    duration = (maxEnd + params.envelope.release) / 1000 + 0.1;
  }
  
  const sampleRate = 44100;
  const length = Math.ceil(sampleRate * duration);
  const offline = new OfflineAudioContext(1, length, sampleRate);
  
  const gain = offline.createGain();
  gain.gain.value = 0.7;
  gain.connect(offline.destination);
  
  // Render sound
  if (isSimpleParams(params)) {
    renderSimpleOffline(offline, params, gain);
  } else {
    renderSequenceOffline(offline, params, gain);
  }
  
  const buffer = await offline.startRendering();
  return encodeWav(buffer);
}

function renderSimpleOffline(c: OfflineAudioContext, p: SimpleParams, dest: AudioNode): void {
  let d = dest;
  
  if (p.filter.enabled) {
    const f = c.createBiquadFilter();
    f.type = p.filter.type;
    f.frequency.value = p.filter.cutoff;
    f.Q.value = p.filter.resonance;
    f.connect(dest);
    d = f;
  }
  
  const createOfflineOsc = (osc: OscillatorParams) => {
    const o = c.createOscillator();
    const g = c.createGain();
    
    o.type = osc.waveform;
    if (osc.pitchEnvelope.enabled) {
      o.frequency.setValueAtTime(osc.pitchEnvelope.startFreq, 0);
      o.frequency.exponentialRampToValueAtTime(
        Math.max(osc.pitchEnvelope.endFreq, 20),
        osc.pitchEnvelope.time / 1000
      );
    } else {
      o.frequency.value = osc.frequency;
    }
    o.detune.value = osc.detune;
    
    const { attack, decay, sustain, release } = p.envelope;
    const aEnd = attack / 1000;
    const dEnd = aEnd + decay / 1000;
    const rStart = dEnd + 0.05;
    const rEnd = rStart + release / 1000;
    
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(osc.level, aEnd);
    g.gain.linearRampToValueAtTime(osc.level * sustain, dEnd);
    g.gain.setValueAtTime(osc.level * sustain, rStart);
    g.gain.linearRampToValueAtTime(0.0001, rEnd);
    
    o.connect(g);
    g.connect(d);
    o.start(0);
    o.stop(rEnd + 0.05);
  };
  
  if (p.oscA.enabled) createOfflineOsc(p.oscA);
  if (p.oscB.enabled) createOfflineOsc(p.oscB);
}

function renderSequenceOffline(c: OfflineAudioContext, p: SequenceParams, dest: AudioNode): void {
  let d = dest;
  
  if (p.filter.enabled) {
    const f = c.createBiquadFilter();
    f.type = p.filter.type;
    f.frequency.value = p.filter.cutoff;
    f.Q.value = p.filter.resonance;
    f.connect(dest);
    d = f;
  }
  
  p.notes.forEach(note => {
    const start = note.delay / 1000;
    const dur = note.duration / 1000;
    
    const o = c.createOscillator();
    const g = c.createGain();
    
    o.type = note.waveform;
    o.frequency.value = note.frequency;
    
    const { attack, decay, sustain, release } = p.envelope;
    const aEnd = start + Math.min(attack / 1000, dur * 0.3);
    const dEnd = aEnd + Math.min(decay / 1000, dur * 0.3);
    const rStart = start + dur;
    const rEnd = rStart + release / 1000;
    
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(note.level, aEnd);
    g.gain.linearRampToValueAtTime(note.level * sustain, dEnd);
    g.gain.setValueAtTime(note.level * sustain, rStart);
    g.gain.linearRampToValueAtTime(0.0001, rEnd);
    
    o.connect(g);
    g.connect(d);
    o.start(start);
    o.stop(rEnd + 0.05);
  });
}

// =============================================================================
// WAV ENCODING
// =============================================================================

function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const data = buffer.getChannelData(0);
  const samples = data.length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = samples * blockAlign;
  const fileSize = 44 + dataSize;
  
  const ab = new ArrayBuffer(fileSize);
  const view = new DataView(ab);
  
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
  writeStr(0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  
  let offset = 44;
  for (let i = 0; i < samples; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([ab], { type: 'audio/wav' });
}
