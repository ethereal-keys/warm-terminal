/**
 * Stateless Sound Player
 * Adapted from Sound Lab engine for global system use.
 * Fire-and-forget playback of Sound Lab definitions.
 */

import type {
    Sound,
    SimpleParams,
    SequenceParams,
    OscillatorParams,
    EnvelopeParams,
    FilterParams,
    SequenceNote
} from '../components/sound-lab/lib/types';
import { isSimpleParams } from '../components/sound-lab/lib/types';

// =============================================================================
// PLAY SOUND
// =============================================================================

export function playCustomSound(
    ctx: AudioContext,
    destination: AudioNode,
    sound: Sound,
    volume: number
): void {
    // Create a master gain for this specific sound instance to control its volume
    const soundGain = ctx.createGain();
    soundGain.gain.value = volume;
    soundGain.connect(destination);

    if (isSimpleParams(sound.params)) {
        playSimple(ctx, soundGain, sound.params);
    } else {
        playSequence(ctx, soundGain, sound.params);
    }
}

function playSimple(ctx: AudioContext, dest: AudioNode, p: SimpleParams): void {
    const now = ctx.currentTime;

    // Create filter chain if enabled
    let output: AudioNode = dest;
    if (p.filter.enabled) {
        const filter = createFilter(ctx, p.filter, p.envelope, now);
        filter.connect(dest);
        output = filter;
    }

    // Create oscillators
    if (p.oscA.enabled) {
        createOsc(ctx, p.oscA, p.envelope, now, output);
    }
    if (p.oscB.enabled) {
        createOsc(ctx, p.oscB, p.envelope, now, output);
    }
}

function playSequence(ctx: AudioContext, dest: AudioNode, p: SequenceParams): void {
    const now = ctx.currentTime;

    // Create filter if enabled
    let output: AudioNode = dest;
    if (p.filter.enabled) {
        const filter = createFilter(ctx, p.filter, p.envelope, now);
        filter.connect(dest);
        output = filter;
    }

    p.notes.forEach(note => {
        const startTime = now + note.delay / 1000;
        createNote(ctx, note, p.envelope, startTime, output);
    });
}

// =============================================================================
// AUDIO NODE CREATION
// =============================================================================

function createOsc(
    ctx: AudioContext,
    osc: OscillatorParams,
    env: EnvelopeParams,
    startTime: number,
    dest: AudioNode
): void {
    const o = ctx.createOscillator();
    const g = ctx.createGain();

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
    const sHold = 0.05; // Brief sustain minimum
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
    o.stop(rEnd + 0.1);
}

function createNote(
    ctx: AudioContext,
    note: SequenceNote,
    env: EnvelopeParams,
    startTime: number,
    dest: AudioNode
): void {
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = note.waveform;
    o.frequency.value = note.frequency;

    const { attack, decay, sustain, release } = env;
    const noteDur = note.duration / 1000;

    // Adjust envelope to fit note duration if needed
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
    o.stop(rEnd + 0.1);
}

function createFilter(
    ctx: AudioContext,
    f: FilterParams,
    env: EnvelopeParams,
    startTime: number
): BiquadFilterNode {
    const filter = ctx.createBiquadFilter();
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
