import { useState, useEffect } from 'react';
import styles from './ReadingProgress.module.css';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const article = document.getElementById('post-content');
      if (!article) return;

      const { top, height } = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const scrolled = Math.max(0, -top);
      const scrollable = height - windowHeight;

      if (scrollable <= 0) {
        setProgress(100);
      } else {
        const percentage = Math.min(100, Math.max(0, (scrolled / scrollable) * 100));
        setProgress(Math.round(percentage));
      }
    };

    calculateProgress();
    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, []);

  const totalBlocks = 12;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;

  const progressBar = '▓'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Reading progress: ${progress}%`}
    >
      <span className={styles.bar}>{progressBar}</span>
      <span className={styles.percentage}>{progress}%</span>
    </div>
  );
}