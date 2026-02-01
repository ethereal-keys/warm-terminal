/**
 * WaveformSelector Component
 * Toggle switch for oscillator waveform types
 */

import React from 'react';
import styles from './WaveformSelector.module.css';
import type { WaveformType } from '../../lib/types';

interface WaveformSelectorProps {
  value: WaveformType;
  onChange: (value: WaveformType) => void;
  disabled?: boolean;
}

const WAVEFORMS: { type: WaveformType; label: string; icon: string }[] = [
  { type: 'sine', label: 'SIN', icon: '∿' },
  { type: 'triangle', label: 'TRI', icon: '△' },
  { type: 'square', label: 'SQR', icon: '⊓' },
  { type: 'sawtooth', label: 'SAW', icon: '⩘' },
];

export function WaveformSelector({ value, onChange, disabled = false }: WaveformSelectorProps) {
  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.label}>WAVE</div>
      <div className={styles.options}>
        {WAVEFORMS.map(({ type, label, icon }) => (
          <button
            key={type}
            className={`${styles.option} ${value === type ? styles.selected : ''}`}
            onClick={() => !disabled && onChange(type)}
            disabled={disabled}
            title={label}
            aria-label={`${label} waveform`}
            aria-pressed={value === type}
          >
            <span className={styles.indicator}>{value === type ? '●' : '○'}</span>
            <span className={styles.text}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default WaveformSelector;
