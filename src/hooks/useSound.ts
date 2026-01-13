import { useCallback, useEffect, useState } from 'react';
import { soundSystem, playSound } from '@/lib/sounds';
import type { SoundName } from '@/types';

/**
 * Hook for managing sound state and playing sounds
 */
export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize sound system on client
    soundSystem.init().then(() => {
      setInitialized(true);
    });
  }, []);

  const toggle = useCallback(() => {
    const newState = soundSystem.toggle();
    setEnabled(newState);
    return newState;
  }, []);

  const play = useCallback((name: SoundName) => {
    playSound(name);
  }, []);

  return {
    enabled,
    initialized,
    toggle,
    play,
  };
}