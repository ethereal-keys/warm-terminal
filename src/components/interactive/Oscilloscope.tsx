import { useAnimationPhase } from '@/hooks/useAnimationPhase';
import styles from './Oscilloscope.module.css';

interface OscilloscopeProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Oscilloscope({
  width = 32,
  height = 10,
  className
}: OscilloscopeProps) {
  const phase = useAnimationPhase(0.14);

  const points = Array.from({ length: 21 }, (_, i) => {
    const x = (i / 20) * width;
    const y = height / 2 + Math.sin((i * 50 + phase * 180 / Math.PI) * Math.PI / 180) * (height / 2 - 1);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg
      width={width}
      height={height}
      className={`${styles.oscilloscope} ${className || ''}`}
      aria-hidden="true"
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