import { useEffect, useCallback } from 'react';

type KeyboardShortcutCallback = () => void;
type KeyModifiers = {
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

/**
 * Registers a keyboard shortcut
 * Automatically handles cleanup
 */
export function useKeyboardShortcut(
  key: string,
  callback: KeyboardShortcutCallback,
  modifiers: KeyModifiers = {},
  deps: unknown[] = []
): void {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Check modifiers
    if (modifiers.meta && !event.metaKey) return;
    if (modifiers.ctrl && !event.ctrlKey) return;
    if (modifiers.shift && !event.shiftKey) return;
    if (modifiers.alt && !event.altKey) return;

    // Check key
    if (event.key.toLowerCase() === key.toLowerCase()) {
      event.preventDefault();
      callback();
    }
  }, [key, callback, modifiers, ...deps]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}