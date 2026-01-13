import { useAnimationPhase } from '@/hooks/useAnimationPhase';
import { TIMING } from '@/lib/config';
import styles from './BreathingCursor.module.css';

interface BreathingCursorProps {
  animate?: boolean;
}

export function BreathingCursor({ animate = true }: BreathingCursorProps) {
  const phase = useAnimationPhase(TIMING.cursorPulse, animate);
  const opacity = animate ? (0.4 + Math.sin(phase) * 0.45) : 1;
  const glow = animate ? (4 + Math.sin(phase) * 4) : 6;

  return (
    <span
      className={styles.cursor}
      style={{
        opacity,
        boxShadow: `0 0 ${glow}px rgba(194, 85, 53, ${opacity * 0.3})`,
        transition: animate ? 'opacity 0.15s ease, box-shadow 0.15s ease' : 'none',
      }}
      aria-hidden="true"
    />
  );
}