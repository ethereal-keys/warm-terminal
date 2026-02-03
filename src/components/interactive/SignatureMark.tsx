/**
 * Signature Mark with Sound Effects
 * 
 * Updated to support:
 * - easterEgg: When clicking 7 times triggers the easter egg
 * - windingDown: Visual wind-down animation before startup
 */

import { useState, useEffect, useRef } from 'react';
import { useAnimationPhase } from '@/hooks/useAnimationPhase';
import { useDelayedState } from '@/hooks/useDelayedState';
import { useEasterEgg } from '@/hooks/useEasterEgg';
import { useSound } from '@/hooks/useSound';
import { TIMING, ANIMATION } from '@/lib/config';
import { Oscilloscope } from './Oscilloscope';
import styles from './SignatureMark.module.css';

interface SignatureMarkProps {
  compact?: boolean;
  soundOn?: boolean;
  onToggleSound?: () => void;
  windingDown?: boolean;
  poweringUp?: boolean;
}

export function SignatureMark({
  compact = false,
  soundOn = false,
  onToggleSound,
  windingDown = false,
  poweringUp = false
}: SignatureMarkProps) {
  const [hovered, setHovered] = useState(false);
  const noticed = useDelayedState(false, TIMING.markNoticeDelay);
  const breath = useAnimationPhase(TIMING.breathCycle, noticed);
  const { triggered: easterEggTriggered, handleClick: handleEasterEggClick } = useEasterEgg(7);
  const prevTriggered = useRef(false);
  const { play } = useSound();
  const isInteractive = !!onToggleSound;

  // Play easter egg sound when triggered
  useEffect(() => {
    if (easterEggTriggered && !prevTriggered.current) {
      play('easterEgg');
    }
    prevTriggered.current = easterEggTriggered;
  }, [easterEggTriggered, play]);

  const breathVal = Math.sin(breath);
  const baseSpacing = compact ? 3 : 5;
  const breathAmt = compact ? 2.5 : 3.5;

  // During wind-down, force spacing to 0 (dots collapse to center)
  const spacing = windingDown ? 0
    : !noticed ? 0
      : hovered ? baseSpacing * 0.15
        : baseSpacing + breathVal * breathAmt;

  const handleClick = (e: React.MouseEvent) => {
    handleEasterEggClick();
    if (isInteractive) {
      e.stopPropagation();
      e.preventDefault();
      onToggleSound?.();
    }
  };

  const dotsContent = (
    <span
      className={`${styles.dots} ${windingDown ? styles.dotsWindingDown : ''}`}
      style={{ width: compact ? '26px' : '35px' }}
    >
      <span
        className={styles.dot}
        style={{
          transform: `translateX(${-spacing}px)`,
          transition: windingDown
            ? 'transform 0.7s ease-in'
            : noticed ? `transform 0.35s ${ANIMATION.spring}` : 'none'
        }}
      >
        ·
      </span>
      <span
        className={styles.dot}
        style={{
          transform: `translateX(${spacing}px)`,
          transition: windingDown
            ? 'transform 0.7s ease-in'
            : noticed ? `transform 0.35s ${ANIMATION.spring}` : 'none'
        }}
      >
        ·
      </span>
    </span>
  );

  // During wind-down with sound on, show oscilloscope powering down
  const content = soundOn ? (
    <Oscilloscope
      width={compact ? 24 : 30}
      height={compact ? 8 : 10}
      poweringDown={windingDown}
      poweringUp={poweringUp}
    />
  ) : dotsContent;

  const markStyle = {
    cursor: 'pointer',
    color: hovered ? 'var(--rust-warm)' : '#4A4540',
    transition: 'all 0.35s ease',
  };

  if (compact) {
    if (isInteractive) {
      return (
        <button
          type="button"
          className={`${styles.markCompact} ${easterEggTriggered ? styles.wiggle : ''}`}
          style={markStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleClick}
          aria-label={soundOn ? 'Sound on, click to toggle' : 'Sound off, click to toggle'}
        >
          ({content})
          {easterEggTriggered && <span className={styles.tooltip}>hi there :)</span>}
        </button>
      );
    }
    return (
      <div
        className={`${styles.markCompact} ${easterEggTriggered ? styles.wiggle : ''}`}
        style={markStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        ({content})
        {easterEggTriggered && <span className={styles.tooltip}>hi there :)</span>}
      </div>
    );
  }

  // Full version
  if (isInteractive) {
    return (
      <button
        type="button"
        className={`${styles.mark} ${easterEggTriggered ? styles.wiggle : ''}`}
        style={{
          ...markStyle,
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        aria-label={soundOn ? 'Sound on, click to toggle' : 'Sound off, click to toggle'}
      >
        <pre className={styles.ascii}>{`╭─────╮
│ `}<span className={styles.contentWrapper}>{content}</span>{` │
╰─────╯`}</pre>
        {easterEggTriggered && <span className={styles.tooltip}>hi there :)</span>}
      </button>
    );
  }

  return (
    <div
      className={`${styles.mark} ${easterEggTriggered ? styles.wiggle : ''}`}
      style={{
        ...markStyle,
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <pre className={styles.ascii}>{`╭─────╮
│ `}<span className={styles.contentWrapper}>{content}</span>{` │
╰─────╯`}</pre>
      {easterEggTriggered && <span className={styles.tooltip}>hi there :)</span>}
    </div>
  );
}