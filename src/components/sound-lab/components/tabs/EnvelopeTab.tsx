/**
 * EnvelopeTab Component
 * ADSR envelope controls with visual curve display
 */

import React from 'react';
import styles from './EnvelopeTab.module.css';
import { Knob } from '../controls';
import type { EnvelopeParams } from '../../lib/types';

interface EnvelopeTabProps {
  params: EnvelopeParams;
  onChange: (params: EnvelopeParams) => void;
  disabled?: boolean;
}

export function EnvelopeTab({ params, onChange, disabled = false }: EnvelopeTabProps) {
  const updateParam = <K extends keyof EnvelopeParams>(key: K, value: number) => {
    onChange({ ...params, [key]: value });
  };

  const totalTime = params.attack + params.decay + 100 + params.release;

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>AMPLITUDE ENVELOPE</h3>
        <span className={styles.duration}>~{Math.round(totalTime)}ms</span>
      </div>

      {/* ADSR Curve Visualization */}
      <div className={styles.curveContainer}>
        <svg viewBox="0 0 400 120" className={styles.curve}>
          <ADSRCurve params={params} />
        </svg>
        <div className={styles.curveLabels}>
          <span>A</span>
          <span>D</span>
          <span>S</span>
          <span>R</span>
        </div>
      </div>

      {/* Knobs */}
      <div className={styles.knobs}>
        <Knob
          label="ATTACK"
          value={params.attack}
          min={0}
          max={2000}
          step={1}
          unit="ms"
          onChange={(v) => updateParam('attack', v)}
          disabled={disabled}
        />

        <Knob
          label="DECAY"
          value={params.decay}
          min={0}
          max={2000}
          step={1}
          unit="ms"
          onChange={(v) => updateParam('decay', v)}
          disabled={disabled}
        />

        <Knob
          label="SUSTAIN"
          value={params.sustain}
          min={0}
          max={1}
          step={0.01}
          displayValue={`${Math.round(params.sustain * 100)}%`}
          onChange={(v) => updateParam('sustain', v)}
          disabled={disabled}
        />

        <Knob
          label="RELEASE"
          value={params.release}
          min={0}
          max={5000}
          step={1}
          unit="ms"
          onChange={(v) => updateParam('release', v)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// ADSR Curve Visualization
function ADSRCurve({ params }: { params: EnvelopeParams }) {
  const { attack, decay, sustain, release } = params;
  
  // Normalize times to fit in the view
  const totalTime = attack + decay + 100 + release; // 100ms sustain hold
  const scale = 380 / totalTime;
  
  const attackX = 10 + attack * scale;
  const decayX = attackX + decay * scale;
  const sustainX = decayX + 100 * scale; // Fixed sustain display width
  const releaseX = Math.min(sustainX + release * scale, 390);
  
  const sustainY = 110 - sustain * 100;
  
  const pathD = `
    M 10 110
    L ${attackX} 10
    L ${decayX} ${sustainY}
    L ${sustainX} ${sustainY}
    L ${releaseX} 110
  `;

  return (
    <>
      {/* Grid */}
      <line x1="10" y1="110" x2="390" y2="110" stroke="#D4CFC4" strokeWidth="1" />
      <line x1="10" y1="10" x2="10" y2="110" stroke="#D4CFC4" strokeWidth="1" />
      
      {/* Dotted lines for sustain level */}
      <line 
        x1="10" y1={sustainY} x2="390" y2={sustainY} 
        stroke="#D4CFC4" 
        strokeWidth="0.5" 
        strokeDasharray="4 4" 
      />
      
      {/* Phase markers */}
      <line x1={attackX} y1="10" x2={attackX} y2="110" stroke="#E8E4D9" strokeWidth="0.5" />
      <line x1={decayX} y1="10" x2={decayX} y2="110" stroke="#E8E4D9" strokeWidth="0.5" />
      <line x1={sustainX} y1="10" x2={sustainX} y2="110" stroke="#E8E4D9" strokeWidth="0.5" />
      
      {/* Envelope curve */}
      <path
        d={pathD}
        fill="none"
        stroke="#BF4D28"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Points */}
      <circle cx="10" cy="110" r="3" fill="#BF4D28" />
      <circle cx={attackX} cy="10" r="3" fill="#BF4D28" />
      <circle cx={decayX} cy={sustainY} r="3" fill="#BF4D28" />
      <circle cx={sustainX} cy={sustainY} r="3" fill="#BF4D28" />
      <circle cx={releaseX} cy="110" r="3" fill="#BF4D28" />
    </>
  );
}

export default EnvelopeTab;
