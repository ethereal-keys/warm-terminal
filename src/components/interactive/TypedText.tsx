import { useState, useEffect } from 'react';
import { useDelayedState } from '@/hooks/useDelayedState';
import { TIMING } from '@/lib/config';
import styles from './TypedText.module.css';

interface TypedTextProps {
  text: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
  showCursor?: boolean;
}

export function TypedText({
  text,
  delay = 0,
  speed = TIMING.typingSpeed,
  onComplete,
  showCursor = true
}: TypedTextProps) {
  const [displayed, setDisplayed] = useState('');
  const started = useDelayedState(false, delay);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!started || done) return;

    if (displayed.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed + Math.random() * 15);
      return () => clearTimeout(timeout);
    } else {
      setDone(true);
      onComplete?.();
    }
  }, [started, displayed, text, speed, done, onComplete]);

  if (!started) return null;

  return (
    <span className={styles.typedText}>
      {displayed}
      {showCursor && !done && <span className={styles.typingCursor}>▌</span>}
    </span>
  );
}