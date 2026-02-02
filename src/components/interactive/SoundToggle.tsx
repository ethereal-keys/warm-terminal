import { useState } from 'react';
import { Oscilloscope } from './Oscilloscope';
import styles from './SoundToggle.module.css';

interface SoundToggleProps {
  soundOn: boolean;
  onToggle: () => void;
  size?: 'normal' | 'small';
}

export function SoundToggle({ soundOn, onToggle, size = 'normal' }: SoundToggleProps) {
  const [hovered, setHovered] = useState(false);
  const isSmall = size === 'small';

  return (
    <button
      className={`${styles.toggle} ${isSmall ? styles.small : ''}`}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ color: hovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
      aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
      aria-pressed={soundOn}
    >
      <span>sound</span>
      <span className={styles.indicator}>
        ({soundOn ? (
          <Oscilloscope width={isSmall ? 16 : 24} height={isSmall ? 6 : 9} />
        ) : (
          '· ·'
        )})
      </span>
    </button>
  );
}