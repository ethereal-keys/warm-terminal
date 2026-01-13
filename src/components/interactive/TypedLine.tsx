import { useState, useEffect } from 'react';
import { useDelayedState } from '@/hooks/useDelayedState';
import { BreathingCursor } from './BreathingCursor';
import { TIMING } from '@/lib/config';

interface TypedLineProps {
  text: string;
  delay?: number;
  speed?: number;
}

export function TypedLine({
  text,
  delay = 0,
  speed = TIMING.typingSpeed
}: TypedLineProps) {
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
    }
  }, [started, displayed, text, speed, done]);

  return (
    <span>
      {displayed}
      <BreathingCursor animate={done} />
    </span>
  );
}