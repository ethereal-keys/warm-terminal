import { useState, useEffect, useCallback, useRef } from 'react';
import { SITE } from '@/lib/config';
import type { CommandPaletteProps } from '@/types';
import styles from './CommandPalette.module.css';

interface PaletteItem {
  id: string;
  type: 'navigation' | 'command' | 'recent';
  label: string;
  description: string;
  path?: string;
  action?: () => void;
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

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setEasterEggMessage(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const lowerQuery = query.toLowerCase().trim();
    if (EASTER_EGGS[lowerQuery]) {
      setEasterEggMessage(EASTER_EGGS[lowerQuery]);
    } else {
      setEasterEggMessage(null);
    }
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected?.path) {
          onNavigate(selected.path);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredItems, selectedIndex, onNavigate, onClose]);

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
                      onNavigate(item.path);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
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