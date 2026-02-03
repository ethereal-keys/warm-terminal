import { useAnimationPhase } from '@/hooks/useAnimationPhase';
import { useState, useEffect } from 'react';
import styles from './Oscilloscope.module.css';

interface OscilloscopeProps {
  width?: number;
  height?: number;
  className?: string;
  poweringDown?: boolean;
  poweringUp?: boolean;
}

export function Oscilloscope({
  width = 32,
  height = 10,
  className,
  poweringDown = false,
  poweringUp = false
}: OscilloscopeProps) {
  const phase = useAnimationPhase(0.14);

  // Track the power animation progress (0 = flat line, 1 = full wave)
  const [powerLevel, setPowerLevel] = useState(1); // Start at full power

  useEffect(() => {
    if (poweringDown) {
      // Animate from current level to 0 over 700ms
      const startTime = Date.now();
      const startLevel = powerLevel;
      const duration = 700;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use ease-in curve for more dramatic ending
        const easedProgress = progress * progress;
        setPowerLevel(startLevel * (1 - easedProgress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [poweringDown]);

  useEffect(() => {
    if (poweringUp) {
      // Animate from 0 to 1 over 500ms
      const startTime = Date.now();
      const duration = 500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use ease-out curve for quick start, smooth finish
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        setPowerLevel(easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      // Start from 0
      setPowerLevel(0);
      requestAnimationFrame(animate);
    }
  }, [poweringUp]);

  // Calculate amplitude based on power level
  const amplitudeMultiplier = powerLevel;

  const points = Array.from({ length: 21 }, (_, i) => {
    const x = (i / 20) * width;
    const baseAmplitude = (height / 2 - 1) * amplitudeMultiplier;
    const y = height / 2 + Math.sin((i * 50 + phase * 180 / Math.PI) * Math.PI / 180) * baseAmplitude;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  // Fade out opacity during power-down, fade in during power-up
  const opacity = poweringDown ? 0.5 + (powerLevel * 0.5) : 1;

  const isPowerTransition = poweringDown || poweringUp;

  return (
    <svg
      width={width}
      height={height}
      className={`${styles.oscilloscope} ${className || ''} ${poweringDown ? styles.poweringDown : ''} ${poweringUp ? styles.poweringUp : ''}`}
      aria-hidden="true"
      style={{ opacity: isPowerTransition ? opacity : 1 }}
    >
      <path
        d={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}