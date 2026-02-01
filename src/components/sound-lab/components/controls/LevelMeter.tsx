/**
 * LevelMeter Component
 * Visual indicator showing output level
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './LevelMeter.module.css';
import { getWaveformData } from '../../lib/engine';

interface LevelMeterProps {
  isPlaying: boolean;
  segments?: number;
}

export function LevelMeter({ isPlaying, segments = 16 }: LevelMeterProps) {
  const [level, setLevel] = useState(0);
  const animationRef = useRef<number | null>(null);

  const updateLevel = useCallback(() => {
    const data = getWaveformData();
    
    if (data && data.length > 0) {
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / data.length);
      
      // Convert to 0-1 range with some headroom
      const newLevel = Math.min(1, rms * 3);
      setLevel(newLevel);
    } else {
      setLevel(prev => prev * 0.9); // Decay
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateLevel);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateLevel);
    } else {
      // Decay when stopped
      const decay = () => {
        setLevel(prev => {
          if (prev < 0.01) return 0;
          return prev * 0.85;
        });
      };
      const interval = setInterval(decay, 50);
      return () => clearInterval(interval);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, updateLevel]);

  const activeSegments = Math.round(level * segments);

  return (
    <div className={styles.container}>
      <div className={styles.meter}>
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeSegments;
          const isHigh = i >= segments - 3; // Last 3 segments are "hot"
          
          return (
            <span
              key={i}
              className={`${styles.segment} ${isActive ? styles.active : ''} ${isHigh ? styles.high : ''}`}
            >
              {isActive ? '●' : '○'}
            </span>
          );
        })}
      </div>
      <div className={styles.labels}>
        <span>-20</span>
        <span>0</span>
        <span>+6</span>
      </div>
    </div>
  );
}

export default LevelMeter;
