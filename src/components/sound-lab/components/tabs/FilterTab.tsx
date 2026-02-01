/**
 * FilterTab Component
 * Filter controls with frequency response visualization
 */

import React from 'react';
import styles from './FilterTab.module.css';
import { Knob, Toggle } from '../controls';
import type { FilterParams, FilterType } from '../../lib/types';

interface FilterTabProps {
  params: FilterParams;
  onChange: (params: FilterParams) => void;
  disabled?: boolean;
}

const FILTER_TYPES: { type: FilterType; label: string }[] = [
  { type: 'lowpass', label: 'LP' },
  { type: 'highpass', label: 'HP' },
  { type: 'bandpass', label: 'BP' },
];

export function FilterTab({ params, onChange, disabled = false }: FilterTabProps) {
  const updateParam = <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  const isDisabled = disabled || !params.enabled;

  return (
    <div className={styles.container}>
      {/* Header with enable toggle */}
      <div className={styles.header}>
        <h3 className={styles.title}>FILTER</h3>
        <Toggle
          value={params.enabled}
          onChange={(v) => updateParam('enabled', v)}
          disabled={disabled}
        />
      </div>

      <div className={`${styles.content} ${isDisabled ? styles.disabled : ''}`}>
        {/* Filter Type Selector */}
        <div className={styles.typeSection}>
          <span className={styles.sectionLabel}>TYPE</span>
          <div className={styles.typeOptions}>
            {FILTER_TYPES.map(({ type, label }) => (
              <button
                key={type}
                className={`${styles.typeButton} ${params.type === type ? styles.selected : ''}`}
                onClick={() => updateParam('type', type)}
                disabled={isDisabled}
              >
                <span className={styles.indicator}>
                  {params.type === type ? '●' : '○'}
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Response Visualization */}
        <div className={styles.responseContainer}>
          <span className={styles.responseLabel}>FREQUENCY RESPONSE</span>
          <div className={styles.response}>
            <svg viewBox="0 0 400 80" className={styles.responseSvg}>
              <FilterResponse 
                type={params.type} 
                cutoff={params.cutoff} 
                resonance={params.resonance}
                enabled={params.enabled}
              />
            </svg>
            <div className={styles.freqLabels}>
              <span>20</span>
              <span>100</span>
              <span>1k</span>
              <span>10k</span>
              <span>20k</span>
            </div>
          </div>
        </div>

        {/* Knobs */}
        <div className={styles.knobs}>
          <Knob
            label="CUTOFF"
            value={params.cutoff}
            min={20}
            max={20000}
            step={1}
            displayValue={params.cutoff >= 1000 
              ? `${(params.cutoff / 1000).toFixed(1)}k Hz`
              : `${Math.round(params.cutoff)} Hz`
            }
            logarithmic
            onChange={(v) => updateParam('cutoff', v)}
            disabled={isDisabled}
          />

          <Knob
            label="RESONANCE"
            value={params.resonance}
            min={0.1}
            max={20}
            step={0.1}
            displayValue={params.resonance.toFixed(1)}
            onChange={(v) => updateParam('resonance', v)}
            disabled={isDisabled}
          />

          <Knob
            label="ENV AMOUNT"
            value={params.envelopeAmount}
            min={-1}
            max={1}
            step={0.01}
            displayValue={`${params.envelopeAmount >= 0 ? '+' : ''}${Math.round(params.envelopeAmount * 100)}%`}
            onChange={(v) => updateParam('envelopeAmount', v)}
            disabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
}

// Filter Response Visualization
function FilterResponse({ 
  type, 
  cutoff, 
  resonance,
  enabled 
}: { 
  type: FilterType; 
  cutoff: number; 
  resonance: number;
  enabled: boolean;
}) {
  const points: string[] = [];
  const steps = 100;
  
  // Log scale for frequency
  const minF = Math.log(20);
  const maxF = Math.log(20000);
  const cutoffLog = Math.log(cutoff);
  const cutoffNorm = (cutoffLog - minF) / (maxF - minF);
  
  for (let i = 0; i <= steps; i++) {
    const x = 10 + (i / steps) * 380;
    const freqNorm = i / steps;
    
    let gain: number;
    const relativeFreq = freqNorm - cutoffNorm;
    
    // Simplified filter response
    switch (type) {
      case 'lowpass':
        if (freqNorm < cutoffNorm) {
          gain = 1;
        } else {
          const falloff = (freqNorm - cutoffNorm) * 10;
          gain = Math.max(0, 1 - falloff);
        }
        // Add resonance peak
        if (Math.abs(relativeFreq) < 0.1) {
          gain += (resonance / 20) * 0.3 * (1 - Math.abs(relativeFreq) * 10);
        }
        break;
        
      case 'highpass':
        if (freqNorm > cutoffNorm) {
          gain = 1;
        } else {
          const falloff = (cutoffNorm - freqNorm) * 10;
          gain = Math.max(0, 1 - falloff);
        }
        // Add resonance peak
        if (Math.abs(relativeFreq) < 0.1) {
          gain += (resonance / 20) * 0.3 * (1 - Math.abs(relativeFreq) * 10);
        }
        break;
        
      case 'bandpass':
        const bandwidth = 0.15;
        const distance = Math.abs(relativeFreq);
        if (distance < bandwidth) {
          gain = 1 - (distance / bandwidth) * 0.5;
          gain += (resonance / 20) * 0.3 * (1 - distance / bandwidth);
        } else {
          gain = Math.max(0, 0.5 - (distance - bandwidth) * 3);
        }
        break;
        
      default:
        gain = 1;
    }
    
    gain = Math.min(1.3, Math.max(0, gain));
    const y = 70 - gain * 60;
    points.push(`${x},${y}`);
  }

  const color = enabled ? '#BF4D28' : '#C9C4B8';
  const fillColor = enabled ? 'rgba(191, 77, 40, 0.1)' : 'rgba(201, 196, 184, 0.1)';

  return (
    <>
      {/* Grid lines */}
      <line x1="10" y1="70" x2="390" y2="70" stroke="#D4CFC4" strokeWidth="0.5" />
      <line x1="10" y1="40" x2="390" y2="40" stroke="#E8E4D9" strokeWidth="0.5" strokeDasharray="4 4" />
      <line x1="10" y1="10" x2="390" y2="10" stroke="#E8E4D9" strokeWidth="0.5" strokeDasharray="4 4" />
      
      {/* Cutoff marker */}
      <line 
        x1={10 + cutoffNorm * 380} 
        y1="5" 
        x2={10 + cutoffNorm * 380} 
        y2="75" 
        stroke={color} 
        strokeWidth="1" 
        strokeDasharray="2 2"
        opacity="0.5"
      />
      
      {/* Fill area */}
      <polygon
        points={`10,70 ${points.join(' ')} 390,70`}
        fill={fillColor}
      />
      
      {/* Response curve */}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

export default FilterTab;
