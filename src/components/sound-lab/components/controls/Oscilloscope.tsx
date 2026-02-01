/**
 * Oscilloscope Component
 * Real-time waveform visualization with warm paper aesthetic
 */

import React, { useRef, useEffect, useCallback } from 'react';
import styles from './Oscilloscope.module.css';
import { getWaveformData } from '../../lib/engine';

interface OscillatorProps {
  isPlaying: boolean;
  width?: number;
  height?: number;
}

export function Oscilloscope({ isPlaying, width = 400, height = 80 }: OscillatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear with cream/paper background
    ctx.fillStyle = '#EBE8E1';
    ctx.fillRect(0, 0, w, h);

    // Draw grid (graph paper style)
    ctx.strokeStyle = '#D4CFC4';
    ctx.lineWidth = 0.5;

    // Minor grid lines
    const minorStep = 10;
    for (let x = 0; x <= w; x += minorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += minorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Major grid lines
    ctx.strokeStyle = '#C9C4B8';
    ctx.lineWidth = 1;
    const majorStep = 40;
    for (let x = 0; x <= w; x += majorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += majorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = '#B0AAA0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Get waveform data
    const data = getWaveformData();
    
    if (data && data.length > 0) {
      // Draw waveform with rust color
      ctx.beginPath();
      ctx.strokeStyle = '#BF4D28';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const sliceWidth = w / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
    }

    // Continue animation if playing
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }
  }, [isPlaying]);

  useEffect(() => {
    draw();

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, draw]);

  useEffect(() => {
    if (!isPlaying) {
      const timeout = setTimeout(draw, 100);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, draw]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.canvas}
      />
    </div>
  );
}

export default Oscilloscope;
