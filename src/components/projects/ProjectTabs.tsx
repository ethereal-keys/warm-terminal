import { useState, type ReactNode } from 'react';
import styles from './ProjectTabs.module.css';

interface Tab {
  id: string;
  label: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: './overview' },
  { id: 'technical', label: './technical' },
  { id: 'demo', label: './demo' },
  { id: 'reflections', label: './reflections' },
];

interface ProjectTabsProps {
  children: ReactNode;
}

export default function ProjectTabs({ children }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className={styles.tabs}>
      <nav className={styles.tabNav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}

        <div className={styles.tabIndicator}>└──</div>
      </nav>

      <div className={styles.tabDivider} aria-hidden="true">
        ───────────────────────────────────────────────────────────────────────
      </div>

      <div className={styles.tabContent} role="tabpanel">
        {children}
      </div>
    </div>
  );
}