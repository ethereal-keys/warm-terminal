import { useState, useEffect, type ReactNode } from 'react';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useSound } from '@/hooks/useSound';
import { SignatureMark } from './SignatureMark';
import { SoundToggle } from './SoundToggle';
import { CommandPalette } from './CommandPalette';
import { SITE } from '@/lib/config';
import styles from './StickyNav.module.css';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface StickyNavProps {
  currentPath: string;
  breadcrumb?: BreadcrumbItem[];
  children?: ReactNode;
  alwaysVisible?: boolean;
}

export default function StickyNav({
  currentPath,
  breadcrumb,
  children,
  alwaysVisible = false
}: StickyNavProps) {
  const { enabled: soundOn, toggle: toggleSound } = useSound();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isScrolled = useScrollPosition(100);
  const isVisible = alwaysVisible || isScrolled;

  // Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  const isDeep = breadcrumb && breadcrumb.length > 0;

  return (
    <>
      <nav
        className={`${styles.nav} ${isVisible ? styles.visible : ''}`}
        aria-label="Main navigation"
      >
        <div className={styles.left}>
          <a href="/" className={styles.logoLink}>
            <SignatureMark
              compact
              soundOn={soundOn}
            />
            <span className={styles.initials}>sk</span>
          </a>

          {isDeep && (
            <div className={styles.breadcrumb}>
              {breadcrumb.map((item) => (
                <span key={item.path}>
                  <span className={styles.separator}>&gt;</span>
                  <a href={item.path} className={styles.breadcrumbLink}>
                    {item.label}
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>

        {!isDeep && (
          <div className={styles.navItems}>
            {SITE.nav.slice(0, 3).map(item => (
              <a
                key={item.id}
                href={item.path}
                className={`${styles.navLink} ${currentPath === item.path ? styles.active : ''}`}
              >
                ./{item.id}
                {currentPath === item.path && <span className={styles.underline} />}
              </a>
            ))}
          </div>
        )}

        <div className={styles.right}>
          {children}

          <SoundToggle soundOn={soundOn} onToggle={toggleSound} />

          {isDeep && (
            <button
              className={styles.upButton}
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              ↑
            </button>
          )}
        </div>
      </nav>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={handleNavigate}
        currentPath={currentPath}
      />
    </>
  );
}