import { useState, useCallback } from 'react';

/**
 * Track clicks for Easter egg activation
 */
export function useEasterEgg(requiredClicks: number = 7, resetDelay: number = 2000) {
  const [clicks, setClicks] = useState(0);
  const [triggered, setTriggered] = useState(false);

  const handleClick = useCallback(() => {
    if (triggered) return;

    setClicks(prev => {
      const newCount = prev + 1;

      if (newCount >= requiredClicks) {
        setTriggered(true);
        // Reset after delay
        setTimeout(() => {
          setTriggered(false);
          setClicks(0);
        }, resetDelay);
        return newCount;
      }

      // Reset clicks if user stops clicking
      setTimeout(() => {
        setClicks(c => (c === newCount ? 0 : c));
      }, 1000);

      return newCount;
    });
  }, [triggered, requiredClicks, resetDelay]);

  return { clicks, triggered, handleClick };
}