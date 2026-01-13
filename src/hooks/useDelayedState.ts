import { useState, useEffect } from 'react';

/**
 * Returns a boolean that becomes true after a delay
 * Useful for staged animations on mount
 */
export function useDelayedState(initialValue: boolean, delay: number): boolean {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => setValue(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return value;
}