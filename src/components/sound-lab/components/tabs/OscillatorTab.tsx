/**
 * OscillatorTab Component
 * Controls for oscillator A or B parameters
 */

import React from 'react';
import styles from './OscillatorTab.module.css';
import { Knob, WaveformSelector, Toggle } from '../controls';
import type { OscillatorParams } from '../../lib/types';
import { frequencyToNote, FREQUENCY_MIN, FREQUENCY_MAX } from '../../lib/types';

interface OscillatorTabProps {
  label: string;
  params: OscillatorParams;
  onChange: (params: OscillatorParams) => void;
  disabled?: boolean;
}

export function OscillatorTab({ label, params, onChange, disabled = false }: OscillatorTabProps) {
  const updateParam = <K extends keyof OscillatorParams>(
    key: K, 
    value: OscillatorParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  const updatePitchEnvelope = (
    key: keyof OscillatorParams['pitchEnvelope'],
    value: number | boolean
  ) => {
    onChange({
      ...params,
      pitchEnvelope: { ...params.pitchEnvelope, [key]: value }
    });
  };

  const noteDisplay = `${frequencyToNote(params.frequency)} · ${Math.round(params.frequency)} Hz`;
  const isDisabled = disabled || !params.enabled;

  return (
    <div className={styles.container}>
      {/* Header with enable toggle */}
      <div className={styles.header}>
        <h3 className={styles.title}>{label}</h3>
        <Toggle
          value={params.enabled}
          onChange={(v) => updateParam('enabled', v)}
          disabled={disabled}
        />
      </div>

      {/* Main parameters */}
      <div className={`${styles.section} ${isDisabled ? styles.disabled : ''}`}>
        <div className={styles.row}>
          <WaveformSelector
            value={params.waveform}
            onChange={(v) => updateParam('waveform', v)}
            disabled={isDisabled}
          />

          <div className={styles.knobGroup}>
            <Knob
              label="FREQUENCY"
              value={params.frequency}
              min={FREQUENCY_MIN}
              max={FREQUENCY_MAX}
              step={1}
              displayValue={noteDisplay}
              logarithmic
              onChange={(v) => updateParam('frequency', v)}
              disabled={isDisabled}
            />

            <Knob
              label="DETUNE"
              value={params.detune}
              min={-100}
              max={100}
              step={1}
              unit="¢"
              onChange={(v) => updateParam('detune', v)}
              disabled={isDisabled}
            />

            <Knob
              label="LEVEL"
              value={params.level}
              min={0}
              max={1}
              step={0.01}
              displayValue={`${Math.round(params.level * 100)}%`}
              onChange={(v) => updateParam('level', v)}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>

      {/* Pitch Envelope */}
      <div className={`${styles.section} ${isDisabled ? styles.disabled : ''}`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>PITCH ENVELOPE</span>
          <Toggle
            value={params.pitchEnvelope.enabled}
            onChange={(v) => updatePitchEnvelope('enabled', v)}
            disabled={isDisabled}
          />
        </div>

        <div className={`${styles.pitchEnvelope} ${!params.pitchEnvelope.enabled ? styles.disabled : ''}`}>
          <div className={styles.knobRow}>
            <Knob
              label="START"
              value={params.pitchEnvelope.startFreq}
              min={FREQUENCY_MIN}
              max={FREQUENCY_MAX}
              step={1}
              displayValue={`${Math.round(params.pitchEnvelope.startFreq)} Hz`}
              logarithmic
              onChange={(v) => updatePitchEnvelope('startFreq', v)}
              disabled={isDisabled || !params.pitchEnvelope.enabled}
            />

            <Knob
              label="END"
              value={params.pitchEnvelope.endFreq}
              min={FREQUENCY_MIN}
              max={FREQUENCY_MAX}
              step={1}
              displayValue={`${Math.round(params.pitchEnvelope.endFreq)} Hz`}
              logarithmic
              onChange={(v) => updatePitchEnvelope('endFreq', v)}
              disabled={isDisabled || !params.pitchEnvelope.enabled}
            />

            <Knob
              label="TIME"
              value={params.pitchEnvelope.time}
              min={1}
              max={2000}
              step={1}
              unit="ms"
              onChange={(v) => updatePitchEnvelope('time', v)}
              disabled={isDisabled || !params.pitchEnvelope.enabled}
            />
          </div>

          {/* Pitch curve preview */}
          <div className={styles.pitchCurve}>
            <svg viewBox="0 0 200 60" className={styles.curveSvg}>
              <PitchCurve
                startFreq={params.pitchEnvelope.startFreq}
                endFreq={params.pitchEnvelope.endFreq}
                time={params.pitchEnvelope.time}
                enabled={params.pitchEnvelope.enabled && params.enabled}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pitch curve visualization
function PitchCurve({ 
  startFreq, 
  endFreq, 
  time, 
  enabled 
}: { 
  startFreq: number; 
  endFreq: number; 
  time: number;
  enabled: boolean;
}) {
  const points: string[] = [];
  const steps = 50;
  
  const logStart = Math.log(startFreq);
  const logEnd = Math.log(endFreq);
  const logMin = Math.log(FREQUENCY_MIN);
  const logMax = Math.log(FREQUENCY_MAX);
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Exponential interpolation
    const logFreq = logStart + (logEnd - logStart) * t;
    // Normalize to 0-1
    const normalized = (logFreq - logMin) / (logMax - logMin);
    
    const x = 10 + t * 180;
    const y = 55 - normalized * 50;
    
    points.push(`${x},${y}`);
  }

  return (
    <>
      {/* Grid lines */}
      <line x1="10" y1="30" x2="190" y2="30" stroke="#D4CFC4" strokeWidth="0.5" />
      <line x1="10" y1="5" x2="10" y2="55" stroke="#D4CFC4" strokeWidth="0.5" />
      
      {/* Curve */}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={enabled ? '#BF4D28' : '#C9C4B8'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

export default OscillatorTab;
