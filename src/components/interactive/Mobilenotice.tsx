/**
 * MobileNotice — "best viewed on desktop"
 *
 * Warm-terminal themed modal that appears only on mobile viewports.
 * Styled to match the command palette and sound-lab help card.
 *
 * Usage:
 *   Place once in your root layout:
 *   <MobileNotice />
 *
 *   It auto-detects viewport width (≤768px) via CSS.
 *   Dismissed state is stored in sessionStorage so it
 *   only shows once per session.
 */

import { useState, useEffect } from 'react';
import styles from './Mobilenotice.module.css';

const STORAGE_KEY = 'warm-terminal:mobile-notice-dismissed';

export function MobileNotice() {
    const [dismissed, setDismissed] = useState(true); // hidden until we check

    useEffect(() => {
        // Only show if not previously dismissed this session
        const wasDismissed = sessionStorage.getItem(STORAGE_KEY);
        if (!wasDismissed) {
            setDismissed(false);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem(STORAGE_KEY, '1');
        setDismissed(true);
    };

    if (dismissed) return null;

    return (
        <div
            className={styles.overlay}
            onClick={handleDismiss}
            role="dialog"
            aria-modal="true"
            aria-label="Desktop viewing recommendation"
        >
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                {/* Corner brackets — same as command palette */}
                <span className={`${styles.corner} ${styles.tl}`}>┌</span>
                <span className={`${styles.corner} ${styles.tr}`}>┐</span>
                <span className={`${styles.corner} ${styles.bl}`}>└</span>
                <span className={`${styles.corner} ${styles.br}`}>┘</span>

                <div className={styles.content}>
                    <div className={styles.title}>desktop recommended</div>
                    <div className={styles.rule} />

                    <p className={styles.body}>
                        parts of this site are still under construction for
                        mobile. things may look a little off. best viewed
                        on desktop for now.
                    </p>

                    <div className={styles.terminal}>
                        <span className={styles.prompt}>$ </span>
                        <span className={styles.command}>mobile-support --status wip</span>
                    </div>

                    <span className={styles.annotation}>
                        working on it, promise
                    </span>

                    <div className={styles.rule} />

                    <div className={styles.actions}>
                        <button className={styles.dismissBtn} onClick={handleDismiss}>
                            don't show again
                        </button>
                        <button className={styles.continueBtn} onClick={handleDismiss}>
                            continue anyway
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MobileNotice;