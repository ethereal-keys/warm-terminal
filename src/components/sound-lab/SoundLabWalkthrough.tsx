/**
 * Sound Lab Walkthrough — v4
 *
 * User-paced with "next →".
 * Grouped sliders: one text, simultaneous animation.
 * Individual sliders: individual text per slider.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './SoundLabWalkthrough.module.css';
import type { Sound, SimpleParams, SequenceParams } from './lib/types';

type TabId = 'oscA' | 'oscB' | 'env' | 'filter' | 'seq';

interface WalkthroughProps {
  sounds: Record<string, Sound>;
  selectedId: string;
  isPlaying: boolean;
  onSelectSound: (id: string) => void;
  onSetTab: (tab: TabId) => void;
  onUpdateById: (id: string, params: SimpleParams | SequenceParams) => void;
  onSetHighlight: (target: string | null) => void;
  onComplete: () => void;
}

// =============================================================================
// UTILS
// =============================================================================

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function setNested(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]];
  current[parts[parts.length - 1]] = value;
}

function getNested(obj: any, path: string): any {
  return path.split('.').reduce((c, k) => c?.[k], obj);
}

const TOTAL_PHASES = 8;

// =============================================================================
// COMPONENT
// =============================================================================

export default function SoundLabWalkthrough({
  sounds,
  selectedId,
  isPlaying,
  onSelectSound,
  onSetTab,
  onUpdateById,
  onSetHighlight,
  onComplete,
}: WalkthroughProps) {
  const [text, setText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [waitingForPlay, setWaitingForPlay] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  const cancelledRef = useRef(false);
  const workingParamsRef = useRef<any>(null);
  const workingSoundIdRef = useRef<string>('click');
  const playResolveRef = useRef<(() => void) | null>(null);
  const nextResolveRef = useRef<(() => void) | null>(null);
  const wasPlayingRef = useRef(false);

  // --- Typewriter effect ---
  useEffect(() => {
    if (!text) { setDisplayedText(''); return; }
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  // --- Detect play → stop ---
  useEffect(() => {
    if (waitingForPlay && isPlaying && !wasPlayingRef.current) {
      wasPlayingRef.current = true;
    }
    if (waitingForPlay && !isPlaying && wasPlayingRef.current) {
      wasPlayingRef.current = false;
      setWaitingForPlay(false);
      onSetHighlight(null);
      playResolveRef.current?.();
      playResolveRef.current = null;
    }
  }, [isPlaying, waitingForPlay, onSetHighlight]);

  // --- Helpers ---

  const delay = useCallback(
    (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms)),
    [],
  );

  const check = useCallback(() => {
    if (cancelledRef.current) throw new Error('cancelled');
  }, []);

  const say = useCallback(
    async (msg: string) => {
      setText(msg);
      setFlashKey((k) => k + 1);
      await delay(msg.length * 20 + 100);
      check();
    },
    [delay, check],
  );

  const waitForNext = useCallback(
    (): Promise<void> =>
      new Promise((resolve) => {
        setShowNext(true);
        nextResolveRef.current = resolve;
      }),
    [],
  );

  const handleNext = useCallback(() => {
    setShowNext(false);
    nextResolveRef.current?.();
    nextResolveRef.current = null;
  }, []);

  /** Animate a single param smoothly */
  const animate = useCallback(
    (path: string, to: number, duration: number): Promise<void> => {
      return new Promise((resolve) => {
        const from = getNested(workingParamsRef.current, path) ?? to;
        if (Math.abs(from - to) < 0.001) { resolve(); return; }
        const start = performance.now();
        function tick(now: number) {
          if (cancelledRef.current) { resolve(); return; }
          const t = Math.min((now - start) / duration, 1);
          setNested(
            workingParamsRef.current,
            path,
            from + (to - from) * easeInOutCubic(t),
          );
          onUpdateById(
            workingSoundIdRef.current,
            structuredClone(workingParamsRef.current),
          );
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        }
        requestAnimationFrame(tick);
      });
    },
    [onUpdateById],
  );

  /** Animate multiple params simultaneously (one clone per frame) */
  const animateAll = useCallback(
    (anims: Array<{ path: string; to: number; duration: number }>): Promise<void> => {
      return new Promise((resolve) => {
        const entries = anims.map((a) => ({
          ...a,
          from: getNested(workingParamsRef.current, a.path) ?? a.to,
        }));
        const startTime = performance.now();
        const maxDur = Math.max(...anims.map((a) => a.duration));

        function tick(now: number) {
          if (cancelledRef.current) { resolve(); return; }
          let allDone = true;
          entries.forEach(({ path, from, to, duration }) => {
            const t = Math.min((now - startTime) / duration, 1);
            setNested(workingParamsRef.current, path, from + (to - from) * easeInOutCubic(t));
            if (t < 1) allDone = false;
          });
          onUpdateById(
            workingSoundIdRef.current,
            structuredClone(workingParamsRef.current),
          );
          if (!allDone) requestAnimationFrame(tick);
          else resolve();
        }
        requestAnimationFrame(tick);
      });
    },
    [onUpdateById],
  );

  const set = useCallback(
    (path: string, value: any) => {
      setNested(workingParamsRef.current, path, value);
      onUpdateById(
        workingSoundIdRef.current,
        structuredClone(workingParamsRef.current),
      );
    },
    [onUpdateById],
  );

  const awaitPlay = useCallback(
    (): Promise<void> =>
      new Promise((resolve) => {
        wasPlayingRef.current = false;
        setWaitingForPlay(true);
        onSetHighlight('play');
        playResolveRef.current = resolve;
      }),
    [onSetHighlight],
  );

  const hl = onSetHighlight;

  // --- Main choreography ---
  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        // ==============================================================
        // SETUP
        // ==============================================================
        onSelectSound('click');
        onSetTab('oscA');
        workingSoundIdRef.current = 'click';
        await delay(400);
        check();

        workingParamsRef.current = structuredClone(sounds['click']?.params);
        if (!workingParamsRef.current) { onComplete(); return; }

        // Disable pitch envelope so base frequency drives the pitch
        set('oscA.pitchEnvelope.enabled', false);

        // ==============================================================
        // 0: INTRO (split into two beats)
        // ==============================================================
        setPhase(0);
        await say('sound-lab.');
        await waitForNext();
        check();

        await say('design and download UI sounds for your projects.');
        await waitForNext();
        check();

        // ==============================================================
        // 1: OSCILLATOR — waveform, then pitch+gain grouped
        // ==============================================================
        setPhase(1);
        await say('waveforms. the raw shape of sound.');
        hl('waveform,graphs');
        await waitForNext();
        check();

        // Cycle waveforms slowly
        set('oscA.waveform', 'triangle');
        await delay(1000);
        check();
        set('oscA.waveform', 'square');
        await delay(1000);
        check();
        set('oscA.waveform', 'sawtooth');
        await delay(1000);
        check();
        set('oscA.waveform', 'sine');
        await delay(600);
        check();
        hl(null);

        // Pitch + gain: grouped text, simultaneous animation
        await say('pitch and volume.');
        hl('note,gain');
        await waitForNext();
        check();
        await animateAll([
          { path: 'oscA.frequency', to: 293.66, duration: 3000 }, // D4
          { path: 'oscA.level', to: 0.5, duration: 1500 },
        ]);
        check();
        await delay(300);
        hl(null);
        await waitForNext();
        check();

        // ==============================================================
        // 2: SECOND OSCILLATOR — grouped
        // ==============================================================
        setPhase(2);
        onSetTab('oscB');
        await delay(300);
        check();

        await say('a second oscillator for depth.');
        set('oscB.enabled', true);
        set('oscB.pitchEnvelope.enabled', false);
        await delay(200);
        check();
        hl('note,gain');
        await waitForNext();
        check();
        await animateAll([
          { path: 'oscB.frequency', to: 440, duration: 2000 }, // A4, perfect fifth above D4
          { path: 'oscB.level', to: 0.25, duration: 1500 },
        ]);
        check();
        set('oscB.detune', 4);
        await delay(300);
        hl(null);
        await waitForNext();
        check();

        // ==============================================================
        // 3: ENVELOPE — individual text per slider
        // ==============================================================
        setPhase(3);
        onSetTab('env');
        await delay(300);
        check();

        await say('the envelope. how a sound breathes.');
        await waitForNext();
        check();

        // Attack
        await say('attack. how fast it appears.');
        hl('attack');
        await waitForNext();
        check();
        await animate('envelope.attack', 350, 1500);
        check();
        await delay(200);
        hl(null);

        // Decay
        await say('decay. the fade from peak.');
        hl('decay');
        await waitForNext();
        check();
        await animate('envelope.decay', 700, 1500);
        check();
        await delay(200);
        hl(null);

        // Sustain
        await say('sustain. the held level.');
        hl('sustain');
        await waitForNext();
        check();
        await animate('envelope.sustain', 0.5, 1200);
        check();
        await delay(200);
        hl(null);

        // Release
        await say('release. the final fade.');
        hl('release');
        await waitForNext();
        check();
        await animate('envelope.release', 1200, 1500);
        check();
        await delay(200);
        hl(null);

        await waitForNext();
        check();

        // ==============================================================
        // 4: FILTER — individual text per slider
        // ==============================================================
        setPhase(4);
        onSetTab('filter');
        await delay(300);
        check();

        await say('the filter.');
        set('filter.enabled', true);
        await waitForNext();
        check();

        // Cutoff
        await say('cutoff. which frequencies pass through.');
        hl('cutoff');
        await waitForNext();
        check();
        await animate('filter.cutoff', 3000, 2000);
        check();
        await delay(200);
        hl(null);

        // Resonance
        await say('resonance. emphasis near the cutoff.');
        hl('res');
        await waitForNext();
        check();
        await animate('filter.resonance', 1.5, 1500);
        check();
        await delay(200);
        hl(null);

        // Env amount
        await say('envelope. adds movement over time.');
        hl('env');
        await waitForNext();
        check();
        await animate('filter.envelopeAmount', 0.25, 1200);
        check();
        await delay(200);
        hl(null);

        await waitForNext();
        check();

        // ==============================================================
        // 5: PRESS PLAY
        // ==============================================================
        setPhase(5);
        await say('press ▶ to hear what we built.');
        await awaitPlay();
        check();
        await delay(800);
        check();

        // ==============================================================
        // 6: SEQUENCE
        // ==============================================================
        setPhase(6);
        await say('sounds can be sequences. notes over time.');
        onSelectSound('easterEgg');
        onSetTab('seq');
        workingSoundIdRef.current = 'easterEgg';
        workingParamsRef.current = structuredClone(sounds['easterEgg']?.params);
        await waitForNext();
        check();

        await say('press ▶ to hear it.');
        await awaitPlay();
        check();
        await delay(800);
        check();

        // ==============================================================
        // 7: FEATURES
        // ==============================================================
        setPhase(7);

        const gridEl = document.querySelector('[data-wt="grid"]');
        gridEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await delay(500);
        check();

        await say('+ new sound. [r] reset. [d] download. ? shortcuts.');
        hl('add,reset,download,help,scale');
        await waitForNext();
        check();
        hl(null);

        document.querySelector('[data-wt="graphs"]')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        await delay(400);
        check();

        await say('make something.');
        await waitForNext();
        check();

        if (mounted) onComplete();
      } catch {
        // Cancelled
      }
    }

    run();

    return () => {
      mounted = false;
      cancelledRef.current = true;
      onSetHighlight(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => {
    cancelledRef.current = true;
    onSetHighlight(null);
    onComplete();
  };

  return (
    <div className={styles.bar}>
      <div key={flashKey} className={`${styles.barInner} ${styles.barFlash}`}>
        <div className={styles.textWrap}>
          <span className={styles.caret}>&gt;</span>
          <span className={styles.text}>
            {displayedText}
            <span className={styles.cursor}>_</span>
          </span>
        </div>
        <div className={styles.progress}>
          {Array.from({ length: TOTAL_PHASES }, (_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === phase ? styles.dotActive : i < phase ? styles.dotDone : ''}`}
            />
          ))}
        </div>
        {showNext && (
          <button className={styles.next} onClick={handleNext}>
            next →
          </button>
        )}
        <button className={styles.skip} onClick={handleSkip}>
          skip
        </button>
      </div>
    </div>
  );
}
