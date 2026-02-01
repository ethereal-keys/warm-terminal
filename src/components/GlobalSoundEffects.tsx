/**
 * Global Sound Effects
 * 
 * Adds hover, click, and page transition sounds to interactive elements.
 * Uses event delegation for efficiency.
 * 
 * Usage: Add <GlobalSoundEffects client:only="react" /> to your BaseLayout
 * 
 * ============================================================================
 * CUSTOMIZATION via data attributes:
 * ============================================================================
 * 
 * HOVER SOUNDS:
 *   data-sound-hover="none"      → No hover sound
 *   data-sound-hover="hover"     → Default hover sound (default)
 *   data-sound-hover="markHover" → Bright ping (for special elements)
 *   data-sound-hover="tab"       → Tab-switch sound
 *   data-sound-hover="paletteNav"→ Soft tick
 *   data-sound-hover="[any]"     → Any valid SoundName
 * 
 * CLICK SOUNDS:
 *   data-sound-click="none"      → No click sound
 *   data-sound-click="click"     → Default click (default for buttons)
 *   data-sound-click="pageTransition" → Page transition (default for internal links)
 *   data-sound-click="[any]"     → Any valid SoundName
 * 
 * DISABLE ALL SOUNDS:
 *   data-no-sound                → Disables both hover and click
 * 
 * ============================================================================
 * EXAMPLES:
 * ============================================================================
 * 
 * <!-- Silent link -->
 * <a href="/about" data-sound-hover="none">About</a>
 * 
 * <!-- Special hover sound -->
 * <button data-sound-hover="markHover">Special Button</button>
 * 
 * <!-- Card with tab hover sound -->
 * <div class="project-card" data-sound-hover="tab">...</div>
 * 
 * <!-- No sounds at all -->
 * <button data-no-sound>Silent</button>
 * 
 * <!-- Custom click sound, no hover -->
 * <button data-sound-hover="none" data-sound-click="paletteSelect">Submit</button>
 */

import React, { useEffect } from 'react';
import { playSound, soundSystem } from '@/lib/sounds';
import type { SoundName } from '@/types';

// Valid sound names for hover (subset that makes sense for hover)
const VALID_HOVER_SOUNDS: Set<string> = new Set([
  'hover', 'markHover', 'tab', 'paletteNav', 'click'
]);

// Valid sound names for click
const VALID_CLICK_SOUNDS: Set<string> = new Set([
  'click', 'pageTransition', 'paletteSelect', 'tab', 'error'
]);

export default function GlobalSoundEffects(): React.ReactElement | null {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    soundSystem.init();

    let currentHoverElement: Element | null = null;
    let lastSoundTime = 0;
    const SOUND_COOLDOWN = 100;

    /**
     * Check if element should be completely skipped (SVG, oscilloscope, etc.)
     */
    const shouldSkipElement = (el: Element): boolean => {
      // Skip SVG internals
      if (['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g']
          .includes(el.tagName.toLowerCase())) {
        return true;
      }
      
      // Skip signature mark / oscilloscope
      const classCheck = el.className?.toString?.() || '';
      if (classCheck.includes('mark') || classCheck.includes('Mark') || 
          classCheck.includes('oscilloscope') || classCheck.includes('Oscilloscope') ||
          classCheck.includes('signature') || classCheck.includes('Signature')) {
        return true;
      }
      
      // Check parents for signature mark
      let parent = el.parentElement;
      while (parent) {
        const parentClass = parent.className?.toString?.() || '';
        if (parentClass.includes('mark') || parentClass.includes('Mark') ||
            parentClass.includes('oscilloscope') || parentClass.includes('Oscilloscope')) {
          return true;
        }
        parent = parent.parentElement;
      }
      
      return false;
    };

    /**
     * Find the interactive container for hover sounds
     */
    const findHoverContainer = (el: Element): Element | null => {
      // Elements with explicit hover sound setting take priority
      const withHoverAttr = el.closest('[data-sound-hover]');
      if (withHoverAttr) return withHoverAttr;
      
      // Cards (contain many children)
      const card = el.closest('.project-card, .post-card, [data-sound-card]');
      if (card) return card;
      
      // Standard interactive elements
      const interactive = el.closest('a[href], button, [role="button"], [role="tab"]');
      return interactive;
    };

    /**
     * Get the hover sound for an element
     * Returns null if sound should be skipped
     */
    const getHoverSound = (container: Element): SoundName | null => {
      // Check for no-sound
      if (container.closest('[data-no-sound]') || container.closest('[aria-label*="sound"]')) {
        return null;
      }
      
      // Check for explicit hover sound
      const hoverAttr = container.getAttribute('data-sound-hover');
      if (hoverAttr) {
        if (hoverAttr === 'none') return null;
        if (VALID_HOVER_SOUNDS.has(hoverAttr)) return hoverAttr as SoundName;
        // Fallback to hover if invalid sound name
        console.warn(`Invalid data-sound-hover value: "${hoverAttr}". Using "hover".`);
        return 'hover';
      }
      
      // Default sound
      return 'hover';
    };

    /**
     * Get the click sound for an element
     * Returns null if sound should be skipped
     */
    const getClickSound = (container: Element): SoundName | null => {
      // Check for no-sound
      if (container.closest('[data-no-sound]') || container.closest('[aria-label*="sound"]')) {
        return null;
      }
      
      // Check for explicit click sound
      const clickAttr = container.getAttribute('data-sound-click');
      if (clickAttr) {
        if (clickAttr === 'none') return null;
        if (VALID_CLICK_SOUNDS.has(clickAttr)) return clickAttr as SoundName;
        console.warn(`Invalid data-sound-click value: "${clickAttr}". Using "click".`);
        return 'click';
      }
      
      // Default: pageTransition for internal links, click for others
      const link = container.closest('a[href]') as HTMLAnchorElement | null;
      if (link) {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('/') && !href.startsWith('//')) {
          return 'pageTransition';
        }
      }
      
      return 'click';
    };

    /**
     * Handle mouseover events
     */
    const handleMouseOver = (e: MouseEvent) => {
      if (!soundSystem.isEnabled()) return;
      
      const target = e.target as Element;
      if (shouldSkipElement(target)) return;
      
      const container = findHoverContainer(target);
      if (!container) return;
      
      // Skip if still in same container
      if (currentHoverElement === container) return;
      if (currentHoverElement && currentHoverElement.contains(target)) return;
      
      // Get the sound to play
      const sound = getHoverSound(container);
      if (!sound) {
        currentHoverElement = container;
        return;
      }
      
      // Cooldown check
      const now = Date.now();
      if (now - lastSoundTime < SOUND_COOLDOWN) {
        currentHoverElement = container;
        return;
      }
      
      currentHoverElement = container;
      lastSoundTime = now;
      playSound(sound);
    };

    /**
     * Handle mouseout events
     */
    const handleMouseOut = (e: MouseEvent) => {
      if (!currentHoverElement) return;
      
      const relatedTarget = e.relatedTarget as Element | null;
      
      if (!relatedTarget || !currentHoverElement.contains(relatedTarget)) {
        if (relatedTarget) {
          const newContainer = findHoverContainer(relatedTarget);
          if (newContainer === currentHoverElement) return;
        }
        currentHoverElement = null;
      }
    };

    /**
     * Handle click events
     */
    const handleClick = (e: MouseEvent) => {
      if (!soundSystem.isEnabled()) return;
      
      const target = e.target as Element;
      const interactive = target.closest('a[href], button, [role="button"]');
      
      if (!interactive) return;
      
      const sound = getClickSound(interactive);
      if (sound) {
        playSound(sound);
      }
    };

    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
