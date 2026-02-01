/**
 * Project Tabs with Sound Effects
 * 
 * Plays 'tab' sound when switching between tabs
 */

import { useState, useCallback } from 'react';
import { useSound } from '@/hooks/useSound';
import styles from './ProjectTabs.module.css';

interface Tab {
  id: string;
  label: string;
}

interface ProjectTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
}

export function ProjectTabs({ tabs, defaultTab, children }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const { play } = useSound();

  const handleTabClick = useCallback((tabId: string) => {
    if (tabId !== activeTab) {
      play('tab');
      setActiveTab(tabId);
    }
  }, [activeTab, play]);

  return (
    <div className={styles.container}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className={styles.tabMarker}>
              {activeTab === tab.id ? '▸' : '·'}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
      <div 
        className={styles.panel}
        role="tabpanel"
        id={`panel-${activeTab}`}
      >
        {children(activeTab)}
      </div>
    </div>
  );
}
