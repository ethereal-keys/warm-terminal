import { useState, useEffect, useRef, type ReactNode } from 'react';
import styles from './ProjectTabs.module.css';

interface Tab {
  id: string;
  label: string;
  targetId: string; // The heading ID to scroll to
}

const TABS: Tab[] = [
  { id: 'overview', label: './overview', targetId: 'overview' },
  { id: 'technical', label: './technical', targetId: 'technical-implementation' },
  { id: 'demo', label: './demo', targetId: 'demo' },
  { id: 'reflections', label: './reflections', targetId: 'reflections' },
];

interface ProjectTabsProps {
  children: ReactNode;
}

export default function ProjectTabs({ children }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const navRef = useRef<HTMLElement>(null);

  const handleTabClick = (tab: Tab) => {
    const element = document.getElementById(tab.targetId);
    if (element) {
      const offset = 0;
      const targetPosition = element.offsetTop - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      setActiveTab(tab.id);
    }
  };

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeButton = tabRefs.current[activeTab];
    if (activeButton && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - navRect.left + 4
      });
    }
  }, [activeTab]);

  // Update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (let i = TABS.length - 1; i >= 0; i--) {
        const element = document.getElementById(TABS[i].targetId);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveTab(TABS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.tabs}>
      <nav className={styles.tabNav} ref={navRef}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[tab.id] = el; }}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => handleTabClick(tab)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}

        <div
          className={styles.tabIndicator}
          style={{ left: `${indicatorStyle.left}px` }}
        >
          <span className={styles.tabCorner}>└──</span>
          <span className={styles.tabHere}>here</span>
        </div>
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