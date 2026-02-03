/**
 * Startup Sound v5 - With Wind-Down
 * 
 * Wind-Down Timeline (~900ms):
 * - 0ms:    Click acknowledgment - soft confirmation
 * - 80ms:   Descending sweep begins (A4 → F#4 → D4 → A3 → D3)
 * - 500ms:  Low settle (D2 hum) - system going quiet
 * - ~900ms: Silence, ready for startup
 * 
 * Startup Timeline (existing):
 * - 400ms:  Punch (line draws) - satisfying thock
 * - 800ms:  Bloom (status appears) - with extended tail
 * - 2000ms: Zoooop - long rising sweep (~2s)
 * - 4200ms: Complete (typing done) - positive ascending ding
 * 
 * Now with cancellation support for navigation/toggle scenarios.
 */

// =============================================================================
// D MAJOR PENTATONIC FREQUENCIES
// =============================================================================

const N = {
    D2: 73.42,
    D3: 146.83,
    A3: 220.00,
    D4: 293.66,
    'F#4': 369.99,
    A4: 440.00,
    D5: 587.33,
    A5: 880.00,
};

// =============================================================================
// ACTIVE NODES TRACKING - For cancellation
// =============================================================================

let activeStartupNodes: AudioNode[] = [];
let isStartupPlaying = false;

let activeWindDownNodes: AudioNode[] = [];
let isWindDownPlaying = false;

/**
 * Register a node for potential cancellation (startup)
 */
function trackNode(node: AudioNode): void {
    activeStartupNodes.push(node);
}

/**
 * Register a node for potential cancellation (wind-down)
 */
function trackWindDownNode(node: AudioNode): void {
    activeWindDownNodes.push(node);
}

/**
 * Cancel all currently playing/scheduled startup sound nodes
 */
export function cancelStartupSound(): void {
    if (!isStartupPlaying) return;

    activeStartupNodes.forEach(node => {
        try {
            if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
                node.stop();
            }
            node.disconnect();
        } catch (e) {
            // Node may have already stopped - ignore
        }
    });

    activeStartupNodes = [];
    isStartupPlaying = false;
}

/**
 * Cancel wind-down sound
 */
export function cancelWindDownSound(): void {
    if (!isWindDownPlaying) return;

    activeWindDownNodes.forEach(node => {
        try {
            if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
                node.stop();
            }
            node.disconnect();
        } catch (e) {
            // Node may have already stopped - ignore
        }
    });

    activeWindDownNodes = [];
    isWindDownPlaying = false;
}

/**
 * Check if startup sound is currently playing
 */
export function isStartupSoundPlaying(): boolean {
    return isStartupPlaying;
}

// =============================================================================
// WIND-DOWN SOUND (~500ms)
// Character: System gracefully powering down, closing connection
// =============================================================================

/**
 * Play the wind-down sound sequence
 * Timeline synced with visual animations (~900ms):
 * - 0ms: Click ack
 * - 80ms: Sweep begins
 * - 500ms: Low settle
 * - 900ms: Silence
 */
export function playWindDownSound(ctx: AudioContext, volume: number = 0.7): number {
    cancelWindDownSound();

    const now = ctx.currentTime;
    isWindDownPlaying = true;

    // ===== CLICK ACKNOWLEDGMENT (0ms) =====
    // Quick confirmation that the click registered
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();

    clickOsc.type = 'sine';
    clickOsc.frequency.value = N.D4;

    clickFilter.type = 'lowpass';
    clickFilter.frequency.value = 2000;

    clickGain.gain.setValueAtTime(0, now);
    clickGain.gain.linearRampToValueAtTime(volume * 0.12, now + 0.01);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    clickOsc.connect(clickFilter).connect(clickGain).connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.1);

    trackWindDownNode(clickOsc);
    trackWindDownNode(clickGain);
    trackWindDownNode(clickFilter);

    // ===== DESCENDING SWEEP (80ms - 700ms) =====
    // "Connection closing" - slower, more deliberate falling pitch
    const sweepStart = now + 0.08;

    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    const sweepFilter = ctx.createBiquadFilter();

    sweepOsc.type = 'sine';
    sweepOsc.frequency.setValueAtTime(N.A4, sweepStart);
    sweepOsc.frequency.exponentialRampToValueAtTime(N['F#4'], sweepStart + 0.15);
    sweepOsc.frequency.exponentialRampToValueAtTime(N.D4, sweepStart + 0.30);
    sweepOsc.frequency.exponentialRampToValueAtTime(N.A3, sweepStart + 0.45);
    sweepOsc.frequency.exponentialRampToValueAtTime(N.D3, sweepStart + 0.62);

    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(2500, sweepStart);
    sweepFilter.frequency.exponentialRampToValueAtTime(1800, sweepStart + 0.15);
    sweepFilter.frequency.exponentialRampToValueAtTime(1200, sweepStart + 0.30);
    sweepFilter.frequency.exponentialRampToValueAtTime(600, sweepStart + 0.45);
    sweepFilter.frequency.exponentialRampToValueAtTime(250, sweepStart + 0.62);
    sweepFilter.Q.value = 0.6;

    sweepGain.gain.setValueAtTime(0, sweepStart);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.1, sweepStart + 0.04);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.09, sweepStart + 0.20);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.07, sweepStart + 0.35);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.04, sweepStart + 0.50);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, sweepStart + 0.65);

    sweepOsc.connect(sweepFilter).connect(sweepGain).connect(ctx.destination);
    sweepOsc.start(sweepStart);
    sweepOsc.stop(sweepStart + 0.7);

    trackWindDownNode(sweepOsc);
    trackWindDownNode(sweepGain);
    trackWindDownNode(sweepFilter);

    // ===== SUB HARMONIC (parallel to sweep) =====
    // Adds weight to the descent
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(N.D3, sweepStart);
    subOsc.frequency.exponentialRampToValueAtTime(N.A3, sweepStart + 0.20);
    subOsc.frequency.exponentialRampToValueAtTime(N.D3, sweepStart + 0.40);
    subOsc.frequency.exponentialRampToValueAtTime(N.D2, sweepStart + 0.60);

    subFilter.type = 'lowpass';
    subFilter.frequency.value = 250;

    subGain.gain.setValueAtTime(0, sweepStart);
    subGain.gain.linearRampToValueAtTime(volume * 0.08, sweepStart + 0.06);
    subGain.gain.linearRampToValueAtTime(volume * 0.06, sweepStart + 0.30);
    subGain.gain.linearRampToValueAtTime(volume * 0.04, sweepStart + 0.50);
    subGain.gain.exponentialRampToValueAtTime(0.001, sweepStart + 0.65);

    subOsc.connect(subFilter).connect(subGain).connect(ctx.destination);
    subOsc.start(sweepStart);
    subOsc.stop(sweepStart + 0.7);

    trackWindDownNode(subOsc);
    trackWindDownNode(subGain);
    trackWindDownNode(subFilter);

    // ===== LOW SETTLE (500ms - 900ms) =====
    // Final "system off" tone - quiet D2 that fades slowly
    const settleStart = now + 0.5;

    const settleOsc = ctx.createOscillator();
    const settleGain = ctx.createGain();
    const settleFilter = ctx.createBiquadFilter();

    settleOsc.type = 'sine';
    settleOsc.frequency.value = N.D2;

    settleFilter.type = 'lowpass';
    settleFilter.frequency.value = 150;
    settleFilter.Q.value = 0.7;

    settleGain.gain.setValueAtTime(0, settleStart);
    settleGain.gain.linearRampToValueAtTime(volume * 0.07, settleStart + 0.06);
    settleGain.gain.linearRampToValueAtTime(volume * 0.05, settleStart + 0.15);
    settleGain.gain.linearRampToValueAtTime(volume * 0.02, settleStart + 0.30);
    settleGain.gain.exponentialRampToValueAtTime(0.001, settleStart + 0.40);

    settleOsc.connect(settleFilter).connect(settleGain).connect(ctx.destination);
    settleOsc.start(settleStart);
    settleOsc.stop(settleStart + 0.45);

    trackWindDownNode(settleOsc);
    trackWindDownNode(settleGain);
    trackWindDownNode(settleFilter);

    // Auto-cleanup after wind-down completes
    const WIND_DOWN_DURATION = 900;
    setTimeout(() => {
        activeWindDownNodes = [];
        isWindDownPlaying = false;
    }, WIND_DOWN_DURATION + 100);

    return WIND_DOWN_DURATION;
}

// =============================================================================
// PUNCH (400ms) - Line draws - satisfying thock with weight
// =============================================================================

function playPunch(ctx: AudioContext, startTime: number, volume: number): void {
    // ===== LOW THUMP - The punch you feel =====
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    const thumpFilter = ctx.createBiquadFilter();

    thump.type = 'sine';
    thump.frequency.setValueAtTime(150, startTime);
    thump.frequency.exponentialRampToValueAtTime(60, startTime + 0.08);
    thump.frequency.exponentialRampToValueAtTime(40, startTime + 0.15);

    thumpFilter.type = 'lowpass';
    thumpFilter.frequency.value = 200;
    thumpFilter.Q.value = 0.7;

    thumpGain.gain.setValueAtTime(0, startTime);
    thumpGain.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.008);
    thumpGain.gain.exponentialRampToValueAtTime(volume * 0.08, startTime + 0.06);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    thump.connect(thumpFilter).connect(thumpGain).connect(ctx.destination);
    thump.start(startTime);
    thump.stop(startTime + 0.25);

    trackNode(thump);
    trackNode(thumpGain);
    trackNode(thumpFilter);

    // ===== BODY - Tonal warmth (D3) =====
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    const bodyFilter = ctx.createBiquadFilter();

    body.type = 'triangle';
    body.frequency.value = N.D3;

    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.value = 800;
    bodyFilter.Q.value = 0.5;

    bodyGain.gain.setValueAtTime(0, startTime);
    bodyGain.gain.linearRampToValueAtTime(volume * 0.1, startTime + 0.01);
    bodyGain.gain.exponentialRampToValueAtTime(volume * 0.04, startTime + 0.08);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    body.connect(bodyFilter).connect(bodyGain).connect(ctx.destination);
    body.start(startTime);
    body.stop(startTime + 0.3);

    trackNode(body);
    trackNode(bodyGain);
    trackNode(bodyFilter);

    // ===== CLICK - High transient for definition =====
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();

    click.type = 'square';
    click.frequency.value = 1200;

    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 1500;
    clickFilter.Q.value = 2;

    clickGain.gain.setValueAtTime(0, startTime);
    clickGain.gain.linearRampToValueAtTime(volume * 0.04, startTime + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.025);

    click.connect(clickFilter).connect(clickGain).connect(ctx.destination);
    click.start(startTime);
    click.stop(startTime + 0.03);

    trackNode(click);
    trackNode(clickGain);
    trackNode(clickFilter);

    // ===== TONE - A4 ping for brightness =====
    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    const toneFilter = ctx.createBiquadFilter();

    tone.type = 'sine';
    tone.frequency.value = N.A4;

    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = 2500;

    toneGain.gain.setValueAtTime(0, startTime);
    toneGain.gain.linearRampToValueAtTime(volume * 0.08, startTime + 0.005);
    toneGain.gain.exponentialRampToValueAtTime(volume * 0.03, startTime + 0.1);
    toneGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    tone.connect(toneFilter).connect(toneGain).connect(ctx.destination);
    tone.start(startTime);
    tone.stop(startTime + 0.35);

    trackNode(tone);
    trackNode(toneGain);
    trackNode(toneFilter);
}

// =============================================================================
// BLOOM (800ms) - Quieter, with extended warm tail
// =============================================================================

function playBloom(ctx: AudioContext, startTime: number, volume: number): void {

    // ===== SUB-BASS - Extended tail through typing =====
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    sub.type = 'sine';
    sub.frequency.value = N.D2;

    subFilter.type = 'lowpass';
    subFilter.frequency.value = 120;

    subGain.gain.setValueAtTime(0, startTime);
    subGain.gain.linearRampToValueAtTime(volume * 0.12, startTime + 0.06);
    subGain.gain.linearRampToValueAtTime(volume * 0.08, startTime + 0.4);
    subGain.gain.linearRampToValueAtTime(volume * 0.04, startTime + 1.0);
    subGain.gain.linearRampToValueAtTime(volume * 0.015, startTime + 1.8);
    subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.5);

    sub.connect(subFilter).connect(subGain).connect(ctx.destination);
    sub.start(startTime);
    sub.stop(startTime + 2.6);

    trackNode(sub);
    trackNode(subGain);
    trackNode(subFilter);

    // ===== BASS BODY - Also extended =====
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();

    bass.type = 'triangle';
    bass.frequency.value = N.D3;
    bass.detune.value = 2;

    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 400;
    bassFilter.Q.value = 0.5;

    bassGain.gain.setValueAtTime(0, startTime);
    bassGain.gain.linearRampToValueAtTime(volume * 0.07, startTime + 0.04);
    bassGain.gain.linearRampToValueAtTime(volume * 0.04, startTime + 0.5);
    bassGain.gain.linearRampToValueAtTime(volume * 0.015, startTime + 1.2);
    bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.0);

    bass.connect(bassFilter).connect(bassGain).connect(ctx.destination);
    bass.start(startTime);
    bass.stop(startTime + 2.1);

    trackNode(bass);
    trackNode(bassGain);
    trackNode(bassFilter);

    // ===== CHORD VOICES - Quieter =====
    const chordNotes = [
        { freq: N.D4, delay: 0, level: 0.15, detune: 0 },
        { freq: N['F#4'], delay: 0.055, level: 0.12, detune: 3 },
        { freq: N.A4, delay: 0.11, level: 0.13, detune: -2 },
    ];

    chordNotes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const noteStart = startTime + note.delay;

        osc.type = 'sine';
        osc.frequency.value = note.freq;
        osc.detune.value = note.detune;

        // Subtle vibrato
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.type = 'sine';
        vibrato.frequency.value = 4.5;
        vibratoGain.gain.value = 2;
        vibrato.connect(vibratoGain).connect(osc.detune);
        vibrato.start(noteStart + 0.3);
        vibrato.stop(noteStart + 1.3);

        trackNode(vibrato);
        trackNode(vibratoGain);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, noteStart);
        filter.frequency.linearRampToValueAtTime(2400, noteStart + 0.2);
        filter.frequency.linearRampToValueAtTime(2000, noteStart + 0.6);
        filter.Q.value = 0.4;

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(volume * note.level, noteStart + 0.04);
        gain.gain.linearRampToValueAtTime(volume * note.level * 0.8, noteStart + 0.3);
        gain.gain.linearRampToValueAtTime(volume * note.level * 0.4, noteStart + 0.7);
        gain.gain.exponentialRampToValueAtTime(volume * note.level * 0.05, noteStart + 1.1);
        gain.gain.linearRampToValueAtTime(0.0001, startTime + 1.3);

        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 1.4);

        trackNode(osc);
        trackNode(gain);
        trackNode(filter);
    });

    // ===== HIGH SHIMMER - Sparkle on top =====
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    const shimmerFilter = ctx.createBiquadFilter();

    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.value = N.D5;
    shimmerOsc.detune.value = 5;

    shimmerFilter.type = 'lowpass';
    shimmerFilter.frequency.value = 5000;

    shimmerGain.gain.setValueAtTime(0, startTime + 0.15);
    shimmerGain.gain.linearRampToValueAtTime(volume * 0.03, startTime + 0.25);
    shimmerGain.gain.exponentialRampToValueAtTime(volume * 0.01, startTime + 0.5);
    shimmerGain.gain.linearRampToValueAtTime(0.0001, startTime + 0.8);

    shimmerOsc.connect(shimmerFilter).connect(shimmerGain).connect(ctx.destination);
    shimmerOsc.start(startTime + 0.15);
    shimmerOsc.stop(startTime + 0.9);

    trackNode(shimmerOsc);
    trackNode(shimmerGain);
    trackNode(shimmerFilter);
}

// =============================================================================
// ZOOOOP (2000ms) - Long rising sweep (~2s, ends near shimmer)
// =============================================================================

function playZoooop(ctx: AudioContext, startTime: number, volume: number): void {
    // ===== MAIN SWEEP - Slow, gradual rise =====
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    const sweepFilter = ctx.createBiquadFilter();

    sweepOsc.type = 'sine';
    sweepOsc.frequency.setValueAtTime(N.D3, startTime);
    sweepOsc.frequency.exponentialRampToValueAtTime(N.A3, startTime + 0.5);
    sweepOsc.frequency.exponentialRampToValueAtTime(N.D4, startTime + 1.0);
    sweepOsc.frequency.exponentialRampToValueAtTime(N.A4, startTime + 1.5);

    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(300, startTime);
    sweepFilter.frequency.exponentialRampToValueAtTime(800, startTime + 0.5);
    sweepFilter.frequency.exponentialRampToValueAtTime(1500, startTime + 1.0);
    sweepFilter.frequency.exponentialRampToValueAtTime(2500, startTime + 1.5);
    sweepFilter.Q.value = 0.8;

    sweepGain.gain.setValueAtTime(0, startTime);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.05, startTime + 0.15);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.07, startTime + 0.6);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.08, startTime + 1.1);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.05, startTime + 1.6);
    sweepGain.gain.linearRampToValueAtTime(volume * 0.02, startTime + 1.85);
    sweepGain.gain.linearRampToValueAtTime(0.0001, startTime + 2.1);

    sweepOsc.connect(sweepFilter).connect(sweepGain).connect(ctx.destination);
    sweepOsc.start(startTime);
    sweepOsc.stop(startTime + 2.15);

    trackNode(sweepOsc);
    trackNode(sweepGain);
    trackNode(sweepFilter);

    // ===== HARMONIC LAYER - Octave above, fades in midway =====
    const harmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();
    const harmonicFilter = ctx.createBiquadFilter();

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(N.D4, startTime + 0.7);
    harmonic.frequency.exponentialRampToValueAtTime(N.A4, startTime + 1.2);
    harmonic.frequency.exponentialRampToValueAtTime(N.D5, startTime + 1.6);
    harmonic.detune.value = 3;

    harmonicFilter.type = 'lowpass';
    harmonicFilter.frequency.value = 3000;

    harmonicGain.gain.setValueAtTime(0, startTime + 0.7);
    harmonicGain.gain.linearRampToValueAtTime(volume * 0.03, startTime + 0.95);
    harmonicGain.gain.linearRampToValueAtTime(volume * 0.025, startTime + 1.4);
    harmonicGain.gain.linearRampToValueAtTime(0.0001, startTime + 1.9);

    harmonic.connect(harmonicFilter).connect(harmonicGain).connect(ctx.destination);
    harmonic.start(startTime + 0.7);
    harmonic.stop(startTime + 1.95);

    trackNode(harmonic);
    trackNode(harmonicGain);
    trackNode(harmonicFilter);

    // ===== SOFT LANDING - Gentle A4 that the sweep arrives at =====
    const landing = ctx.createOscillator();
    const landingGain = ctx.createGain();
    const landingFilter = ctx.createBiquadFilter();

    landing.type = 'sine';
    landing.frequency.value = N.A4;
    landing.detune.value = -2;

    landingFilter.type = 'lowpass';
    landingFilter.frequency.value = 2000;
    landingFilter.Q.value = 0.5;

    landingGain.gain.setValueAtTime(0, startTime + 1.35);
    landingGain.gain.linearRampToValueAtTime(volume * 0.04, startTime + 1.5);
    landingGain.gain.linearRampToValueAtTime(volume * 0.025, startTime + 1.75);
    landingGain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.1);

    landing.connect(landingFilter).connect(landingGain).connect(ctx.destination);
    landing.start(startTime + 1.35);
    landing.stop(startTime + 2.15);

    trackNode(landing);
    trackNode(landingGain);
    trackNode(landingFilter);
}

// =============================================================================
// COMPLETE (4200ms) - Typing done - positive resolution
// =============================================================================

function playComplete(ctx: AudioContext, startTime: number, volume: number): void {
    // ===== QUICK UPLIFT - Rising into the note =====
    const rise = ctx.createOscillator();
    const riseGain = ctx.createGain();
    const riseFilter = ctx.createBiquadFilter();

    rise.type = 'sine';
    rise.frequency.setValueAtTime(N.A4, startTime);
    rise.frequency.exponentialRampToValueAtTime(N.D5, startTime + 0.06);

    riseFilter.type = 'lowpass';
    riseFilter.frequency.value = 3000;

    riseGain.gain.setValueAtTime(0, startTime);
    riseGain.gain.linearRampToValueAtTime(volume * 0.08, startTime + 0.015);
    riseGain.gain.linearRampToValueAtTime(volume * 0.04, startTime + 0.06);
    riseGain.gain.linearRampToValueAtTime(0.0001, startTime + 0.12);

    rise.connect(riseFilter).connect(riseGain).connect(ctx.destination);
    rise.start(startTime);
    rise.stop(startTime + 0.15);

    trackNode(rise);
    trackNode(riseGain);
    trackNode(riseFilter);

    // ===== MAIN TONE - D5, the "ding" =====
    const ding = ctx.createOscillator();
    const dingGain = ctx.createGain();
    const dingFilter = ctx.createBiquadFilter();

    ding.type = 'sine';
    ding.frequency.value = N.D5;

    dingFilter.type = 'lowpass';
    dingFilter.frequency.value = 4000;
    dingFilter.Q.value = 0.5;

    dingGain.gain.setValueAtTime(0, startTime + 0.04);
    dingGain.gain.linearRampToValueAtTime(volume * 0.12, startTime + 0.055);
    dingGain.gain.exponentialRampToValueAtTime(volume * 0.06, startTime + 0.15);
    dingGain.gain.exponentialRampToValueAtTime(volume * 0.02, startTime + 0.35);
    dingGain.gain.linearRampToValueAtTime(0.0001, startTime + 0.6);

    ding.connect(dingFilter).connect(dingGain).connect(ctx.destination);
    ding.start(startTime + 0.04);
    ding.stop(startTime + 0.65);

    trackNode(ding);
    trackNode(dingGain);
    trackNode(dingFilter);

    // ===== WARMTH - D4 underneath for body =====
    const warm = ctx.createOscillator();
    const warmGain = ctx.createGain();
    const warmFilter = ctx.createBiquadFilter();

    warm.type = 'sine';
    warm.frequency.value = N.D4;
    warm.detune.value = -2;

    warmFilter.type = 'lowpass';
    warmFilter.frequency.value = 1500;

    warmGain.gain.setValueAtTime(0, startTime + 0.05);
    warmGain.gain.linearRampToValueAtTime(volume * 0.05, startTime + 0.08);
    warmGain.gain.exponentialRampToValueAtTime(volume * 0.02, startTime + 0.25);
    warmGain.gain.linearRampToValueAtTime(0.0001, startTime + 0.5);

    warm.connect(warmFilter).connect(warmGain).connect(ctx.destination);
    warm.start(startTime + 0.05);
    warm.stop(startTime + 0.55);

    trackNode(warm);
    trackNode(warmGain);
    trackNode(warmFilter);

    // ===== SPARKLE - High harmonic for brightness =====
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();

    sparkle.type = 'sine';
    sparkle.frequency.value = N.A5;
    sparkle.detune.value = 3;

    sparkleGain.gain.setValueAtTime(0, startTime + 0.05);
    sparkleGain.gain.linearRampToValueAtTime(volume * 0.025, startTime + 0.07);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    sparkle.connect(sparkleGain).connect(ctx.destination);
    sparkle.start(startTime + 0.05);
    sparkle.stop(startTime + 0.25);

    trackNode(sparkle);
    trackNode(sparkleGain);
}

// =============================================================================
// MAIN EXPORTS
// =============================================================================

const STARTUP_SOUND_DURATION = 5000; // Total duration in ms

export function playStartupSound(ctx: AudioContext, volume: number = 0.7): number {
    // Cancel any existing startup sound
    cancelStartupSound();

    const now = ctx.currentTime;
    isStartupPlaying = true;

    playPunch(ctx, now + 0.4, volume);      // 400ms - line draws - thock
    playBloom(ctx, now + 0.8, volume);      // 800ms - status appears
    playZoooop(ctx, now + 2.0, volume);     // 2000ms - rising sweep
    playComplete(ctx, now + 4.2, volume);   // 4200ms - done!

    // Auto-cleanup after sound completes
    setTimeout(() => {
        activeStartupNodes = [];
        isStartupPlaying = false;
    }, STARTUP_SOUND_DURATION + 100);

    return STARTUP_SOUND_DURATION;
}