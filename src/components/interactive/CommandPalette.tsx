/**
 * Command Palette with Sound Effects
 * 
 * Updated to trigger sounds on:
 * - Open: paletteOpen
 * - Close: paletteClose  
 * - Navigate (arrow keys): paletteNav
 * - Select: paletteSelect
 * - No results: error
 * - Easter egg found: easterEgg
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SITE } from '@/lib/config';
import { useSound } from '@/hooks/useSound';
import styles from './CommandPalette.module.css';

interface PaletteItem {
  id: string;
  type: 'navigation' | 'command';
  label: string;
  description: string;
  path?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  currentPath?: string;
}

const EASTER_EGGS: Record<string, string> = {
  'hello': 'hey! thanks for reaching out into the void.',
  'hi': 'hey! thanks for reaching out into the void.',
  '/hello': 'hey! thanks for reaching out into the void.',
  '/credits': 'designed & built by sushanth kashyap, with a lot of care.',
  '/current': 'currently: exploring new opportunities & building cool things.',
};

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  currentPath = ''
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [easterEggMessage, setEasterEggMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef(isOpen);
  const { play } = useSound();

  const navItems: PaletteItem[] = SITE.nav.map(item => ({
    id: item.id,
    type: 'navigation',
    label: `./${item.id}`,
    description: item.annotation,
    path: item.path,
  }));

  const filteredItems = query
    ? navItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : navItems;

  // Play open/close sounds
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      // Just opened
      play('paletteOpen');
    } else if (!isOpen && prevOpenRef.current) {
      // Just closed
      play('paletteClose');
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, play]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setEasterEggMessage(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Easter egg detection
  useEffect(() => {
    const lowerQuery = query.toLowerCase().trim();
    if (EASTER_EGGS[lowerQuery]) {
      if (!easterEggMessage) {
        play('easterEgg');
      }
      setEasterEggMessage(EASTER_EGGS[lowerQuery]);
    } else {
      setEasterEggMessage(null);
    }
  }, [query, easterEggMessage, play]);

  // Play error sound when no results
  useEffect(() => {
    if (query && filteredItems.length === 0 && !easterEggMessage) {
      play('error');
    }
  }, [filteredItems.length, query, easterEggMessage, play]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (filteredItems.length > 0) {
          setSelectedIndex(i => {
            const newIndex = Math.min(i + 1, filteredItems.length - 1);
            if (newIndex !== i) play('paletteNav');
            return newIndex;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (filteredItems.length > 0) {
          setSelectedIndex(i => {
            const newIndex = Math.max(i - 1, 0);
            if (newIndex !== i) play('paletteNav');
            return newIndex;
          });
        }
        break;
      case 'Enter':
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected?.path) {
          play('paletteSelect');
          onNavigate(selected.path);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredItems, selectedIndex, onNavigate, onClose, play]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className={styles.palette}
        onClick={e => e.stopPropagation()}
      >
        <span className={`${styles.corner} ${styles.tl}`}>┌</span>
        <span className={`${styles.corner} ${styles.tr}`}>┐</span>
        <span className={`${styles.corner} ${styles.bl}`}>└</span>
        <span className={`${styles.corner} ${styles.br}`}>┘</span>

        <div className={styles.content}>
          <div className={styles.header}>
            where would you like to go?
          </div>

          <div className={styles.inputWrapper}>
            <span className={styles.prompt}>&gt; </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="_"
              className={styles.input}
              aria-label="Search or enter command"
            />
          </div>

          {easterEggMessage && (
            <div className={styles.easterEgg}>
              {easterEggMessage}
            </div>
          )}

          {!easterEggMessage && (
            <div className={styles.results}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>navigation</div>
                <div className={styles.sectionDivider}>──────────</div>
              </div>

              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  className={`${styles.item} ${index === selectedIndex ? styles.selected : ''}`}
                  onClick={() => {
                    if (item.path) {
                      play('paletteSelect');
                      onNavigate(item.path);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => {
                    if (selectedIndex !== index) {
                      play('paletteNav');
                      setSelectedIndex(index);
                    }
                  }}
                >
                  <span className={styles.itemMarker}>
                    {currentPath === item.path ? '◦' : '·'}
                  </span>
                  <span className={styles.itemLabel}>{item.label}</span>
                  <span className={styles.itemDescription}>{item.description}</span>
                </button>
              ))}

              {filteredItems.length === 0 && (
                <div className={styles.noResults}>
                  no matches found
                </div>
              )}
            </div>
          )}

          <div className={styles.footer}>
            <span>type to filter</span>
            <span>esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
