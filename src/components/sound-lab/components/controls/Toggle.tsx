/**
 * Toggle Component
 * On/Off switch with vintage lab aesthetic
 */

import React from 'react';
import styles from './Toggle.module.css';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  labelOn?: string;
  labelOff?: string;
}

export function Toggle({ 
  value, 
  onChange, 
  disabled = false,
  labelOn = 'ON',
  labelOff = 'OFF'
}: ToggleProps) {
  return (
    <button
      className={`${styles.toggle} ${value ? styles.on : styles.off} ${disabled ? styles.disabled : ''}`}
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      role="switch"
      aria-checked={value}
    >
      <span className={`${styles.label} ${styles.labelOff}`}>{labelOff}</span>
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      <span className={`${styles.label} ${styles.labelOn}`}>{labelOn}</span>
    </button>
  );
}

export default Toggle;
