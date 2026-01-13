import { useState } from 'react';
import { Oscilloscope } from './Oscilloscope';
import styles from './SoundToggle.module.css';

interface SoundToggleProps {
  soundOn: boolean;
  onToggle: () => void;
}

export function SoundToggle({ soundOn, onToggle }: SoundToggleProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className={styles.toggle}
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
          <Oscilloscope width={24} height={9} />
        ) : (
          '· ·'
        )})
      </span>
    </button>
  );
}