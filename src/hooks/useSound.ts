import { useCallback, useEffect, useState } from 'react';
import { soundSystem, playSound } from '@/lib/sounds';
import type { SoundName } from '@/types';

/**
 * Hook for managing sound state and playing sounds.
 * All instances share the same global state via soundSystem.
 */
export function useSound() {
  const [enabled, setEnabled] = useState(() => soundSystem.isEnabled());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize sound system on client
    soundSystem.init().then(() => {
      setInitialized(true);
      // Sync initial state
      setEnabled(soundSystem.isEnabled());
    });

    // Subscribe to state changes from other instances
    const unsubscribe = soundSystem.subscribe((newEnabled) => {
      setEnabled(newEnabled);
    });

    return unsubscribe;
  }, []);

  const toggle = useCallback(() => {
    return soundSystem.toggle();
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