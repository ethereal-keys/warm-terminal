import { useState, useEffect } from 'react';

/**
 * Creates an animation phase value that cycles smoothly
 * Used for breathing animations, oscillations, etc.
 */
export function useAnimationPhase(speed: number, enabled: boolean = true): number {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setPhase(p => (p + speed) % (Math.PI * 2));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [speed, enabled]);

  return phase;
}