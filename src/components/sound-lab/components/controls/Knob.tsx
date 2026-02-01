/**
 * Knob Component
 * Rotary control with vintage lab equipment aesthetic
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Knob.module.css';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  displayValue?: string;
  disabled?: boolean;
  logarithmic?: boolean;
  onChange: (value: number) => void;
}

export function Knob({
  value,
  min,
  max,
  step = 1,
  label,
  unit = '',
  displayValue,
  disabled = false,
  logarithmic = false,
  onChange,
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  // Convert value to normalized 0-1 range
  const normalize = useCallback((v: number): number => {
    if (logarithmic && min > 0) {
      return (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min));
    }
    return (v - min) / (max - min);
  }, [min, max, logarithmic]);

  // Convert normalized to actual value
  const denormalize = useCallback((n: number): number => {
    const clamped = Math.max(0, Math.min(1, n));
    if (logarithmic && min > 0) {
      return Math.exp(Math.log(min) + clamped * (Math.log(max) - Math.log(min)));
    }
    return min + clamped * (max - min);
  }, [min, max, logarithmic]);

  // Rotation angle (-135 to +135 degrees)
  const rotation = normalize(value) * 270 - 135;

  // Handle mouse/touch drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled || isEditing) return;
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = normalize(value);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [disabled, isEditing, value, normalize]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaY = startYRef.current - e.clientY;
    const sensitivity = e.shiftKey ? 0.001 : 0.005; // Fine control with shift
    const newNorm = startValueRef.current + deltaY * sensitivity;
    const newValue = denormalize(newNorm);
    
    // Snap to step
    const stepped = Math.round(newValue / step) * step;
    const clamped = Math.max(min, Math.min(max, stepped));
    
    if (clamped !== value) {
      onChange(clamped);
    }
  }, [isDragging, denormalize, step, min, max, value, onChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Handle scroll wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (disabled || isEditing) return;
    e.preventDefault();
    
    const direction = e.deltaY > 0 ? -1 : 1;
    const multiplier = e.shiftKey ? 0.1 : 1;
    const delta = step * direction * multiplier;
    
    const newValue = Math.max(min, Math.min(max, value + delta));
    const stepped = Math.round(newValue / step) * step;
    
    if (stepped !== value) {
      onChange(stepped);
    }
  }, [disabled, isEditing, step, min, max, value, onChange]);

  // Handle double-click to edit
  const handleDoubleClick = useCallback(() => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(String(Math.round(value * 100) / 100));
  }, [disabled, value]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseFloat(editValue);
      if (!isNaN(parsed)) {
        const clamped = Math.max(min, Math.min(max, parsed));
        onChange(clamped);
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [editValue, min, max, onChange]);

  const handleEditBlur = useCallback(() => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
    setIsEditing(false);
  }, [editValue, min, max, onChange]);

  // Format display value
  const formattedValue = displayValue ?? (
    value >= 1000 
      ? `${(value / 1000).toFixed(1)}k` 
      : value >= 100 
        ? Math.round(value).toString()
        : value >= 1
          ? value.toFixed(1)
          : value.toFixed(2)
  );

  return (
    <div 
      className={`${styles.container} ${disabled ? styles.disabled : ''} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.label}>{label}</div>
      
      <div
        ref={knobRef}
        className={styles.knob}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
      >
        {/* Outer ring */}
        <svg viewBox="0 0 60 60" className={styles.ring}>
          {/* Track background */}
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke="var(--panel-inset)"
            strokeWidth="3"
            strokeDasharray="122.5 40"
            strokeDashoffset="61.25"
            strokeLinecap="round"
          />
          {/* Active track */}
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke="var(--rust-muted)"
            strokeWidth="3"
            strokeDasharray={`${normalize(value) * 122.5} 163`}
            strokeDashoffset="61.25"
            strokeLinecap="round"
            className={styles.activeTrack}
          />
        </svg>
        
        {/* Knob body */}
        <div 
          className={styles.body}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className={styles.indicator} />
        </div>
        
        {/* Tick marks */}
        <div className={styles.ticks}>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <div
              key={i}
              className={styles.tick}
              style={{ transform: `rotate(${t * 270 - 135}deg)` }}
            />
          ))}
        </div>
      </div>
      
      {/* Value display */}
      <div className={styles.valueContainer}>
        {isEditing ? (
          <input
            type="text"
            className={styles.editInput}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditBlur}
            autoFocus
          />
        ) : (
          <span className={styles.value}>
            {formattedValue}{unit && <span className={styles.unit}>{unit}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

export default Knob;
