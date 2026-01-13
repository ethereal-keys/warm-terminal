import type { SoundName, SoundConfig } from '@/types';

// Sound configuration - paths to be filled when sounds are created
const SOUND_MANIFEST: SoundConfig[] = [
  { name: 'click', src: '/sounds/interactions/click.mp3', volume: 0.6 },
  { name: 'hover', src: '/sounds/interactions/hover.mp3', volume: 0.3 },
  { name: 'tab', src: '/sounds/interactions/tab.mp3', volume: 0.5 },
  { name: 'error', src: '/sounds/interactions/error.mp3', volume: 0.4 },
  { name: 'pageTransition', src: '/sounds/transitions/page.mp3', volume: 0.5 },
  { name: 'navShift', src: '/sounds/transitions/nav-shift.mp3', volume: 0.4 },
  { name: 'paletteOpen', src: '/sounds/palette/open.mp3', volume: 0.5 },
  { name: 'paletteClose', src: '/sounds/palette/close.mp3', volume: 0.5 },
  { name: 'paletteNav', src: '/sounds/palette/navigate.mp3', volume: 0.3 },
  { name: 'paletteSelect', src: '/sounds/palette/select.mp3', volume: 0.5 },
  { name: 'soundOn', src: '/sounds/toggle/sound-on.mp3', volume: 0.6 },
  { name: 'soundOff', src: '/sounds/toggle/sound-off.mp3', volume: 0.6 },
  { name: 'easterEgg', src: '/sounds/special/easter-egg.mp3', volume: 0.7 },
  { name: 'markHover', src: '/sounds/special/mark-hover.mp3', volume: 0.3 },
];

// Type for Howl - we'll import dynamically
type HowlType = {
  play: () => void;
  load: () => void;
  state: () => string;
};

// Sound system singleton
class SoundSystem {
  private sounds: Map<SoundName, HowlType> = new Map();
  private enabled: boolean = true;
  private loaded: boolean = false;
  private masterVolume: number = 0.7;

  async init(): Promise<void> {
    if (this.loaded || typeof window === 'undefined') return;

    // Dynamic import Howler only on client
    const { Howl } = await import('howler');

    for (const config of SOUND_MANIFEST) {
      const sound = new Howl({
        src: [config.src],
        volume: (config.volume ?? 1) * this.masterVolume,
        preload: false,
      });
      this.sounds.set(config.name, sound);
    }

    this.loaded = true;
  }

  enable(): void {
    this.enabled = true;
    this.play('soundOn');
  }

  disable(): void {
    this.play('soundOff');
    this.enabled = false;
  }

  toggle(): boolean {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  play(name: SoundName): void {
    if (!this.enabled || !this.loaded) return;

    const sound = this.sounds.get(name);
    if (sound) {
      // Load on first play
      if (sound.state() === 'unloaded') {
        sound.load();
      }
      sound.play();
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

export const soundSystem = new SoundSystem();

// Convenience function for components
export function playSound(name: SoundName): void {
  soundSystem.play(name);
}