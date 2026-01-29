import { useState, useEffect, useRef, type ReactNode } from 'react';
import styles from './ProjectTabs.module.css';

interface Tab {
  id: string;
  label: string;
  targetId: string; // The heading ID to scroll to
}

// Keep TABS as a fallback only
const DEFAULT_TABS: Tab[] = [
  { id: 'overview', label: './overview', targetId: 'overview' },
  { id: 'technical', label: './technical', targetId: 'technical-implementation' },
  { id: 'demo', label: './demo', targetId: 'demo' },
  { id: 'reflections', label: './reflections', targetId: 'reflections' },
];

interface ProjectTabsProps {
  children: ReactNode;
  tabs?: { label: string; id: string }[];
}

export default function ProjectTabs({ children, tabs }: ProjectTabsProps) {
  // Convert passed tabs to component format or use default
  const activeTabs = tabs
    ? tabs.map(t => ({ id: t.id, label: t.label, targetId: t.id }))
    : DEFAULT_TABS;

  const [activeTab, setActiveTab] = useState(activeTabs[0]?.id || 'overview');
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

      for (let i = activeTabs.length - 1; i >= 0; i--) {
        const element = document.getElementById(activeTabs[i].targetId);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveTab(activeTabs[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTabs]);

  return (
    <div className={styles.tabs}>
      <nav className={styles.tabNav} ref={navRef}>
        {activeTabs.map(tab => (
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