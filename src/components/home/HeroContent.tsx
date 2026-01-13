import { useState, useEffect } from 'react';
import { SITE, TIMING } from '@/lib/config';
import { SignatureMark } from '@/components/interactive/SignatureMark';
import { SoundToggle } from '@/components/interactive/SoundToggle';
import { TypedLine } from '@/components/interactive/TypedLine';
import { TypedText } from '@/components/interactive/TypedText';
import { useDelayedState } from '@/hooks/useDelayedState';
import { useSound } from '@/hooks/useSound';
import styles from './HeroContent.module.css';

export default function HeroContent() {
  const { enabled: soundOn, toggle: toggleSound } = useSound();
  const showStatus = useDelayedState(false, TIMING.connectionDelay);
  const [lineWidth, setLineWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setLineWidth(160), TIMING.lineDrawDelay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={styles.hero}>
      {/* Connection status */}
      {showStatus && (
        <div className={styles.status}>
          <span className={styles.statusDot}>●</span>
          <TypedText
            text={SITE.connectionMessage}
            delay={200}
            speed={35}
            showCursor={false}
          />
        </div>
      )}

      {/* Header row */}
      <div className={styles.header}>
        <SignatureMark
          soundOn={soundOn}
          onToggleSound={toggleSound}
        />

        <div className={styles.titleArea}>
          <h1 className={styles.name}>{SITE.name}</h1>
          <div
            className={styles.titleLine}
            style={{ width: `${lineWidth}px` }}
          />
          <p className={styles.tagline}>{SITE.tagline}</p>
        </div>

        <SoundToggle soundOn={soundOn} onToggle={toggleSound} />
      </div>

      {/* Terminal lines */}
      <div className={styles.terminal}>
        <div className={styles.terminalLine}>
          <span className={styles.prompt}>&gt;</span>
          <span className={styles.command}>
            <TypedLine text={SITE.status} delay={TIMING.typingDelay} speed={TIMING.typingSpeed} />
          </span>
        </div>

        {SITE.experience.map((line, i) => (
          <div key={i} className={styles.terminalLine}>
            <span className={styles.prompt}>{line.prefix}</span>
            <span className={styles.output}>{line.text}</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className={styles.ctas}>
        <a href="/projects" className="btn-primary">[ view projects ]</a>
        <a href="/Sushanth_resume.pdf" download className="btn-secondary">[ download resume ]</a>
        <span className={styles.ctaAnnotation}>← jan '25</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {SITE.nav.map((item, i) => (
          <NavItem
            key={item.id}
            item={item}
            isFirst={i === 0}
          />
        ))}
      </nav>
    </div>
  );
}

function NavItem({ item, isFirst }: { item: typeof SITE.nav[0]; isFirst: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={styles.navItem}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a href={item.path} className={`${styles.navLink} ${isFirst ? styles.navLinkActive : ''}`}>
        ./{item.id}
      </a>

      {isFirst && (
        <div className={styles.navIndicator}>
          <span className={styles.navCorner}>└──</span>
          <span className={styles.navHere}>here</span>
        </div>
      )}

      {!isFirst && hovered && (
        <div className={styles.navTooltip}>
          {item.annotation}
        </div>
      )}
    </div>
  );
}