import { useState } from 'react';
import { useAnimationPhase } from '@/hooks/useAnimationPhase';
import { useDelayedState } from '@/hooks/useDelayedState';
import { useEasterEgg } from '@/hooks/useEasterEgg';
import { Oscilloscope } from './Oscilloscope';
import { TIMING, ANIMATION } from '@/lib/config';
import styles from './SignatureMark.module.css';

interface SignatureMarkProps {
  compact?: boolean;
  soundOn?: boolean;
  onToggleSound?: () => void;
}

export function SignatureMark({
  compact = false,
  soundOn = false,
  onToggleSound
}: SignatureMarkProps) {
  const [hovered, setHovered] = useState(false);
  const noticed = useDelayedState(false, TIMING.markNoticeDelay);
  const breath = useAnimationPhase(TIMING.breathCycle, noticed);
  const { triggered: easterEggTriggered, handleClick: handleEasterEggClick } = useEasterEgg(7);

  const breathVal = Math.sin(breath);
  const baseSpacing = compact ? 3 : 5;
  const breathAmt = compact ? 2.5 : 3.5;

  const spacing = !noticed ? 0
    : hovered ? baseSpacing * 0.15
    : baseSpacing + breathVal * breathAmt;

  const handleClick = () => {
    handleEasterEggClick();
    onToggleSound?.();
  };

  const dotsContent = (
    <span
      className={styles.dots}
      style={{ width: compact ? '26px' : '35px' }}
    >
      <span
        className={styles.dot}
        style={{
          transform: `translateX(${-spacing}px)`,
          transition: noticed ? `transform 0.35s ${ANIMATION.spring}` : 'none'
        }}
      >
        ·
      </span>
      <span
        className={styles.dot}
        style={{
          transform: `translateX(${spacing}px)`,
          transition: noticed ? `transform 0.35s ${ANIMATION.spring}` : 'none'
        }}
      >
        ·
      </span>
    </span>
  );

  const content = soundOn ? (
    <Oscilloscope width={compact ? 24 : 30} height={compact ? 8 : 10} />
  ) : dotsContent;

  const markStyle = {
    cursor: 'pointer',
    color: hovered ? 'var(--rust-warm)' : '#4A4540',
    transition: 'all 0.35s ease',
  };

  if (compact) {
    return (
      <button
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
    <button
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