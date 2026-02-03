import { useState, useEffect, useRef, useCallback } from 'react';
import { SITE, TIMING } from '@/lib/config';
import { SignatureMark } from '@/components/interactive/SignatureMark';
import { SoundToggle } from '@/components/interactive/SoundToggle';
import { TypedLine } from '@/components/interactive/TypedLine';
import { TypedText } from '@/components/interactive/TypedText';
import { BreathingCursor } from '@/components/interactive/BreathingCursor';
import { useSound } from '@/hooks/useSound';
import { soundSystem } from '@/lib/sounds';
import styles from './HeroContent.module.css';

// Debug flag - set to true to see console logs
const DEBUG_STARTUP = false;

function debugLog(...args: unknown[]) {
  if (DEBUG_STARTUP) {
    console.log('[StartupSound]', ...args);
  }
}

// Wind-down duration in ms - should match the sound and CSS animations
const WIND_DOWN_DURATION = 900;

// Characters for text scramble effect
const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// Hook for text scramble effect
function useTextScramble(originalText: string, isScrambling: boolean, duration: number = 700) {
  const [displayText, setDisplayText] = useState(originalText);
  const frameRef = useRef<number | undefined>(undefined);
  const wasScrambling = useRef<boolean>(false);

  useEffect(() => {
    // If not scrambling, only reset if we were previously scrambling
    if (!isScrambling) {
      if (wasScrambling.current) {
        setDisplayText(originalText);
        wasScrambling.current = false;
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
      return;
    }

    wasScrambling.current = true;
    const startTime = Date.now();
    const textLength = originalText.length;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // As progress increases, more characters become scrambled, then blank
      let result = '';
      for (let i = 0; i < textLength; i++) {
        const charProgress = progress + (i / textLength) * 0.3; // Stagger effect

        if (charProgress > 0.85) {
          // Fade to blank
          result += ' ';
        } else if (charProgress > 0.15) {
          // Scrambled - change character each frame for glitchy effect
          result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        } else {
          // Original
          result += originalText[i];
        }
      }

      setDisplayText(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        frameRef.current = undefined;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [isScrambling, originalText, duration]);

  return displayText;
}

export default function HeroContent() {
  const { enabled: soundOn, initialized: soundInitialized, toggle: toggleSound, play } = useSound();

  // Animation mode: 'quick' = fade-in (default), 'full' = typing animation with sound, 'winding-down' = transition
  const [animationMode, setAnimationMode] = useState<'full' | 'quick' | 'winding-down'>('quick');

  // Counter to trigger new animations (incrementing forces effects to re-run)
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // Track if animation is currently playing (to ignore clicks during animation)
  const [isAnimating, setIsAnimating] = useState(false);

  // Track if we've played the startup sound for this animation cycle
  const hasPlayedStartup = useRef(false);

  const isFullAnimation = animationMode === 'full';
  const isWindingDown = animationMode === 'winding-down';

  // Status visibility (separate from content visibility to prevent layout shift)
  const [statusVisible, setStatusVisible] = useState(true);
  const [showTypedStatus, setShowTypedStatus] = useState(false); // Controls if status shows typed content
  const [lineWidth, setLineWidth] = useState(160);

  // Wind-down status LED state: 'green' | 'amber' | 'red' | 'off'
  const [statusLedState, setStatusLedState] = useState<'green' | 'amber' | 'red' | 'off'>('green');

  // Wind-down status text state
  const [statusText, setStatusText] = useState(SITE.connectionMessage);
  const [statusGlitching, setStatusGlitching] = useState(false);

  // Terminal line scramble state
  const [terminalScrambling, setTerminalScrambling] = useState(false);
  const scrambledTerminalText = useTextScramble(SITE.status, terminalScrambling, 700);

  // Oscilloscope power state
  const [oscilloscopePoweringUp, setOscilloscopePoweringUp] = useState(false);

  // Use a ref to track the component instance for debugging
  const mountId = useRef(Math.random().toString(36).slice(2, 6));

  // =========================================================================
  // SIGNATURE MARK CLICK HANDLER
  // Triggers the wind-down, then the full animation with startup sound
  // =========================================================================
  const handleSignatureClick = useCallback(() => {
    debugLog(`[${mountId.current}] SignatureMark clicked`, { isAnimating, animationMode });

    // Ignore clicks if animation is currently in progress
    if (isAnimating) {
      debugLog(`[${mountId.current}] Ignoring: animation in progress`);
      return;
    }

    debugLog(`[${mountId.current}] Starting wind-down sequence`);

    // CRITICAL: Unlock AudioContext immediately during click event
    soundSystem.unlockAudio();

    // Start the wind-down phase
    setIsAnimating(true);
    setAnimationMode('winding-down');

    // Play wind-down sound after a small delay to ensure AudioContext is ready
    setTimeout(() => {
      if (soundSystem.isEnabled()) {
        play('windDown');
      }
    }, 50);

    // Wind-down LED sequence: green -> amber -> red -> off
    // 0ms: Start (green)
    setStatusLedState('green');

    // 80ms: First glitch + start terminal scramble
    setTimeout(() => {
      setStatusGlitching(true);
      setTerminalScrambling(true);
      setTimeout(() => setStatusGlitching(false), 100);
    }, 80);

    // 200ms: Amber + text change
    setTimeout(() => {
      setStatusLedState('amber');
      setStatusText('[RESETTING...]');
    }, 200);

    // 400ms: Second glitch
    setTimeout(() => {
      setStatusGlitching(true);
      setTimeout(() => setStatusGlitching(false), 100);
    }, 400);

    // 550ms: Red
    setTimeout(() => {
      setStatusLedState('red');
    }, 550);

    // 750ms: Begin fade out (handled by CSS)
    setTimeout(() => {
      setStatusLedState('off');
    }, 750);

    // After wind-down completes, start the startup sequence
    setTimeout(() => {
      debugLog(`[${mountId.current}] Wind-down complete, starting startup`);

      // Reset state for new animation
      hasPlayedStartup.current = false;
      setLineWidth(0);
      setStatusVisible(false); // Now hide status (will reappear with typing)
      setShowTypedStatus(true); // Next time status shows, use typed animation
      setTerminalScrambling(false);

      // Reset status for when it reappears
      setStatusLedState('green');
      setStatusText(SITE.connectionMessage);
      setStatusGlitching(false);

      // Start oscilloscope power-up
      setOscilloscopePoweringUp(true);

      // Trigger new animation
      setAnimationMode('full');
      setAnimationTrigger(prev => prev + 1);
    }, WIND_DOWN_DURATION);

  }, [isAnimating, animationMode, play]);

  // =========================================================================
  // PLAY STARTUP SOUND
  // Triggered when animationTrigger increments (new animation started)
  // =========================================================================
  useEffect(() => {
    if (animationMode !== 'full') return;
    if (animationTrigger === 0) return; // Don't play on initial mount
    if (hasPlayedStartup.current) return;
    if (!soundInitialized) return;

    debugLog(`[${mountId.current}] Playing startup sound`);

    hasPlayedStartup.current = true;

    // Small delay to ensure audio context is ready
    const timeout = setTimeout(() => {
      if (soundSystem.isEnabled()) {
        play('startup');
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [animationTrigger, animationMode, soundInitialized, play]);

  // =========================================================================
  // SHOW STATUS AFTER DELAY
  // In full animation mode, show status after connectionDelay
  // =========================================================================
  useEffect(() => {
    if (animationTrigger === 0) return; // Skip on initial mount (already visible)
    if (animationMode !== 'full') return;

    const timeout = setTimeout(() => {
      setStatusVisible(true);
    }, TIMING.connectionDelay);

    return () => clearTimeout(timeout);
  }, [animationTrigger, animationMode]);

  // =========================================================================
  // OSCILLOSCOPE POWER-UP COMPLETE
  // Reset power-up state after animation completes
  // =========================================================================
  useEffect(() => {
    if (!oscilloscopePoweringUp) return;

    const timeout = setTimeout(() => {
      setOscilloscopePoweringUp(false);
    }, 500); // Power-up animation duration

    return () => clearTimeout(timeout);
  }, [oscilloscopePoweringUp]);

  // =========================================================================
  // ANIMATION COMPLETION
  // Mark animation as complete after full duration
  // =========================================================================
  useEffect(() => {
    if (!isAnimating) return;
    if (animationMode === 'winding-down') return; // Wind-down handles its own timing

    // Total animation duration (adjust based on your TIMING values)
    // connectionDelay + typingDelay + typing time + buffer
    const animationDuration = TIMING.connectionDelay + TIMING.typingDelay + 3000;

    const timeout = setTimeout(() => {
      debugLog(`[${mountId.current}] Animation complete`);
      setIsAnimating(false);
      setShowTypedStatus(false); // Reset for next cycle
    }, animationDuration);

    return () => clearTimeout(timeout);
  }, [isAnimating, animationMode]);

  // =========================================================================
  // CLEANUP
  // Cancel startup sound on navigation
  // =========================================================================
  useEffect(() => {
    const cleanup = () => {
      soundSystem.cancelStartup();
    };

    document.addEventListener('astro:before-preparation', cleanup);

    return () => {
      cleanup();
      document.removeEventListener('astro:before-preparation', cleanup);
    };
  }, []);

  // =========================================================================
  // LINE DRAW ANIMATION
  // =========================================================================
  useEffect(() => {
    if (animationMode === 'quick' && animationTrigger === 0) {
      setLineWidth(160);
      return;
    }

    if (animationMode === 'full') {
      const timeout = setTimeout(() => setLineWidth(160), TIMING.lineDrawDelay);
      return () => clearTimeout(timeout);
    }
  }, [animationMode, animationTrigger]);

  // =========================================================================
  // STATUS LED CLASS
  // =========================================================================
  const getStatusDotClass = () => {
    const classes = [styles.statusDot];
    if (isWindingDown) {
      if (statusLedState === 'amber') classes.push(styles.statusDotAmber);
      if (statusLedState === 'red') classes.push(styles.statusDotRed);
      if (statusLedState === 'off') classes.push(styles.statusDotOff);
    }
    return classes.join(' ');
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className={`${styles.hero} ${animationMode === 'quick' ? styles.fadeIn : ''}`}>
      {/* Connection status - always in DOM to prevent layout shift */}
      <div
        className={`
          ${styles.status} 
          ${isWindingDown ? styles.statusWindingDown : ''}
          ${statusGlitching ? styles.statusGlitch : ''}
          ${!statusVisible && !isWindingDown ? styles.statusHidden : ''}
        `}
      >
        <span className={getStatusDotClass()}>◉</span>
        {statusVisible && showTypedStatus && isFullAnimation ? (
          <TypedText
            key={`typed-status-${animationTrigger}`}
            text={SITE.connectionMessage}
            delay={200}
            speed={35}
            showCursor={false}
          />
        ) : (
          <span className={statusGlitching ? styles.textGlitch : ''}>
            {statusText}
          </span>
        )}
      </div>

      {/* Header row */}
      <div className={styles.header}>
        {/* SignatureMark - clicking triggers animation (not sound toggle) */}
        <SignatureMark
          soundOn={soundOn}
          onToggleSound={handleSignatureClick}
          windingDown={isWindingDown}
          poweringUp={oscilloscopePoweringUp}
        />

        <div className={styles.titleArea}>
          <h1 className={styles.name}>{SITE.name}</h1>
          <div
            className={`${styles.titleLine} ${isWindingDown ? styles.lineWindingDown : ''}`}
            style={{ width: isWindingDown ? undefined : `${lineWidth}px` }}
          />
          <p className={styles.tagline}>{SITE.tagline}</p>
        </div>

        <div className={styles.soundControl}>
          <SoundToggle soundOn={soundOn} onToggle={toggleSound} />
          <a href="/sound-lab" className={styles.advancedLink}>
            [ advanced <span className={styles.settingsIcon}>⚙</span> ]
          </a>
        </div>
      </div>

      {/* Terminal lines */}
      <div className={styles.terminal}>
        <div className={styles.terminalLine}>
          <span className={styles.prompt}>&gt;</span>
          <span className={`${styles.command} ${terminalScrambling ? styles.terminalScramble : ''}`}>
            {isFullAnimation ? (
              <TypedLine
                key={`typed-line-${animationTrigger}`}
                text={SITE.status}
                delay={TIMING.typingDelay}
                speed={TIMING.typingSpeed}
              />
            ) : terminalScrambling ? (
              <span className={styles.scrambleText}>{scrambledTerminalText}</span>
            ) : (
              <span>
                {SITE.status}
                <BreathingCursor animate={true} />
              </span>
            )}
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

// NavItem component - matches original implementation
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