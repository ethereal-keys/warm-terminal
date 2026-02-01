import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './SoundLab.module.css';

// ============================================================================
// SOUND SYNTHESIS ENGINE
// Based on design doc: D major pentatonic (D, E, F#, A, B)
// ============================================================================

type SoundCategory = 'interactions' | 'transitions' | 'palette' | 'toggle' | 'special';

interface SoundDefinition {
  name: string;
  displayName: string;
  category: SoundCategory;
  character: string;
  duration: number;
  synthesize: (ctx: AudioContext, volume: number) => void;
}

// D major pentatonic frequencies
const NOTES = {
  D3: 146.83,
  E3: 164.81,
  'F#3': 185.00,
  A3: 220.00,
  B3: 246.94,
  D4: 293.66,
  E4: 329.63,
  'F#4': 369.99,
  A4: 440.00,
  B4: 493.88,
  D5: 587.33,
};

// Helper to create envelope
function createEnvelope(
  ctx: AudioContext,
  gainNode: GainNode,
  attack: number,
  decay: number,
  sustain: number,
  release: number,
  duration: number,
  volume: number
) {
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + attack);
  gainNode.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay);
  gainNode.gain.setValueAtTime(volume * sustain, now + duration - release);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
}

// Sound definitions matching design doc
const SOUND_DEFINITIONS: SoundDefinition[] = [
  // Interactions
  {
    name: 'click',
    displayName: 'click',
    category: 'interactions',
    character: 'Soft mechanical key',
    duration: 50,
    synthesize: (ctx, volume) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    },
  },
  {
    name: 'hover',
    displayName: 'hover',
    category: 'interactions',
    character: 'Quiet tonal ping',
    duration: 30,
    synthesize: (ctx, volume) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = NOTES.E4;
      
      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    },
  },
  {
    name: 'tab',
    displayName: 'tab',
    category: 'interactions',
    character: 'Light click',
    duration: 50,
    synthesize: (ctx, volume) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    },
  },
  {
    name: 'error',
    displayName: 'error',
    category: 'interactions',
    character: 'Low muted tone',
    duration: 200,
    synthesize: (ctx, volume) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = NOTES.B3; // Resolution down
      
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    },
  },
  
  // Transitions
  {
    name: 'pageTransition',
    displayName: 'page transition',
    category: 'transitions',
    character: 'Low warm tone + step',
    duration: 200,
    synthesize: (ctx, volume) => {
      // Base tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = NOTES.D3;
      gain1.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.2);
      
      // Step up
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = NOTES.A3;
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.2);
    },
  },
  {
    name: 'navShift',
    displayName: 'nav shift',
    category: 'transitions',
    character: 'Subtle whoosh',
    duration: 150,
    synthesize: (ctx, volume) => {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.5;
      
      gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
      
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
    },
  },
  
  // Palette
  {
    name: 'paletteOpen',
    displayName: 'palette open',
    category: 'palette',
    character: 'Two notes ascending',
    duration: 300,
    synthesize: (ctx, volume) => {
      // First note: D
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = NOTES.D4;
      gain1.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);
      
      // Second note: A (fifth)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = NOTES.A4;
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gain2.gain.linearRampToValueAtTime(volume * 0.25, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.3);
    },
  },
  {
    name: 'paletteClose',
    displayName: 'palette close',
    category: 'palette',
    character: 'Two notes descending',
    duration: 300,
    synthesize: (ctx, volume) => {
      // First note: A
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = NOTES.A4;
      gain1.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);
      
      // Second note: D (down)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = NOTES.D4;
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gain2.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.3);
    },
  },
  {
    name: 'paletteNav',
    displayName: 'palette nav',
    category: 'palette',
    character: 'Soft tick',
    duration: 30,
    synthesize: (ctx, volume) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = NOTES['F#4'];
      
      gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    },
  },
  {
    name: 'paletteSelect',
    displayName: 'palette select',
    category: 'palette',
    character: 'Click + tonal confirm',
    duration: 100,
    synthesize: (ctx, volume) => {
      // Click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(600, ctx.currentTime);
      clickOsc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02);
      clickGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      clickOsc.connect(clickGain).connect(ctx.destination);
      clickOsc.start();
      clickOsc.stop(ctx.currentTime + 0.02);
      
      // Confirm tone (D + A)
      const toneOsc = ctx.createOscillator();
      const toneGain = ctx.createGain();
      toneOsc.type = 'sine';
      toneOsc.frequency.value = NOTES.D4;
      toneGain.gain.setValueAtTime(0, ctx.currentTime + 0.015);
      toneGain.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + 0.025);
      toneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      toneOsc.connect(toneGain).connect(ctx.destination);
      toneOsc.start(ctx.currentTime + 0.015);
      toneOsc.stop(ctx.currentTime + 0.1);
    },
  },
  
  // Toggle
  {
    name: 'soundOn',
    displayName: 'sound on',
    category: 'toggle',
    character: 'Warm tone awakening',
    duration: 400,
    synthesize: (ctx, volume) => {
      // Rising phrase: D -> F# -> A
      [NOTES.D4, NOTES['F#4'], NOTES.A4].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const start = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume * 0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
        
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.15);
      });
    },
  },
  {
    name: 'soundOff',
    displayName: 'sound off',
    category: 'toggle',
    character: 'Gentle fade/sigh',
    duration: 400,
    synthesize: (ctx, volume) => {
      // Falling: A -> D
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(NOTES.A4, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(NOTES.D3, ctx.currentTime + 0.4);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    },
  },
  
  // Special
  {
    name: 'easterEgg',
    displayName: 'easter egg',
    category: 'special',
    character: 'Melodic phrase: D-F#-A-B-A',
    duration: 800,
    synthesize: (ctx, volume) => {
      const melody = [NOTES.D4, NOTES['F#4'], NOTES.A4, NOTES.B4, NOTES.A4];
      melody.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const start = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume * 0.25, start + 0.02);
        gain.gain.setValueAtTime(volume * 0.25, start + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
        
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.15);
      });
    },
  },
  {
    name: 'markHover',
    displayName: 'mark hover',
    category: 'special',
    character: 'Tiny bright ping',
    duration: 50,
    synthesize: (ctx, volume) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = NOTES.D5;
      
      gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    },
  },
];

// ============================================================================
// SOUND LAB COMPONENT
// ============================================================================

export default function SoundLab() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [categoryVolumes, setCategoryVolumes] = useState<Record<SoundCategory, number>>({
    interactions: 0.8,
    transitions: 0.6,
    palette: 0.7,
    toggle: 0.7,
    special: 0.8,
  });
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [layerQueue, setLayerQueue] = useState<string[]>([]);

  // Initialize AudioContext on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a sound
  const playSound = useCallback((sound: SoundDefinition) => {
    const ctx = getAudioContext();
    const effectiveVolume = masterVolume * categoryVolumes[sound.category];
    sound.synthesize(ctx, effectiveVolume);
    setLastPlayed(sound.name);
    setLayerQueue(prev => [...prev.slice(-4), sound.name]);
  }, [getAudioContext, masterVolume, categoryVolumes]);

  // Play all sounds in a category
  const playCategoryDemo = useCallback((category: SoundCategory) => {
    const sounds = SOUND_DEFINITIONS.filter(s => s.category === category);
    sounds.forEach((sound, i) => {
      setTimeout(() => playSound(sound), i * 400);
    });
  }, [playSound]);

  // Layer test - play multiple sounds rapidly
  const testLayering = useCallback(() => {
    const testSounds = ['click', 'hover', 'paletteNav', 'click'];
    testSounds.forEach((name, i) => {
      const sound = SOUND_DEFINITIONS.find(s => s.name === name);
      if (sound) {
        setTimeout(() => playSound(sound), i * 80);
      }
    });
  }, [playSound]);

  // Group sounds by category
  const categories: SoundCategory[] = ['interactions', 'transitions', 'palette', 'toggle', 'special'];
  const soundsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = SOUND_DEFINITIONS.filter(s => s.category === cat);
    return acc;
  }, {} as Record<SoundCategory, SoundDefinition[]>);

  return (
    <div className={styles.lab}>
      <header className={styles.header}>
        <h1>sound lab</h1>
        <p className={styles.subtitle}>experiment with the warm terminal soundscape</p>
      </header>

      {/* Master Controls */}
      <section className={styles.masterSection}>
        <div className={styles.box}>
          <span className={styles.corner}>┌</span>
          <span className={styles.cornerTr}>┐</span>
          <span className={styles.cornerBl}>└</span>
          <span className={styles.cornerBr}>┘</span>
          
          <h2>master controls</h2>
          
          <div className={styles.control}>
            <label>master volume</label>
            <div className={styles.sliderRow}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.value}>{Math.round(masterVolume * 100)}%</span>
            </div>
            <div className={styles.asciiBar}>
              {'▓'.repeat(Math.round(masterVolume * 10))}
              {'░'.repeat(10 - Math.round(masterVolume * 10))}
            </div>
          </div>

          <div className={styles.actions}>
            <button onClick={testLayering} className={styles.actionButton}>
              [ test layering ]
            </button>
            <button 
              onClick={() => categories.forEach((cat, i) => setTimeout(() => playCategoryDemo(cat), i * 2000))}
              className={styles.actionButton}
            >
              [ play all ]
            </button>
          </div>
        </div>
      </section>

      {/* Category Mixers */}
      <section className={styles.mixerSection}>
        {categories.map((category) => (
          <div key={category} className={styles.categoryBox}>
            <div className={styles.box}>
              <span className={styles.corner}>┌</span>
              <span className={styles.cornerTr}>┐</span>
              <span className={styles.cornerBl}>└</span>
              <span className={styles.cornerBr}>┘</span>
              
              <div className={styles.categoryHeader}>
                <h3>{category}</h3>
                <button 
                  onClick={() => playCategoryDemo(category)}
                  className={styles.smallButton}
                >
                  ▶
                </button>
              </div>

              <div className={styles.control}>
                <div className={styles.sliderRow}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={categoryVolumes[category]}
                    onChange={(e) => setCategoryVolumes(prev => ({
                      ...prev,
                      [category]: parseFloat(e.target.value)
                    }))}
                    className={styles.slider}
                  />
                  <span className={styles.valueSmall}>
                    {Math.round(categoryVolumes[category] * 100)}%
                  </span>
                </div>
              </div>

              <div className={styles.soundList}>
                {soundsByCategory[category].map((sound) => (
                  <button
                    key={sound.name}
                    onClick={() => playSound(sound)}
                    className={`${styles.soundButton} ${lastPlayed === sound.name ? styles.active : ''}`}
                  >
                    <span className={styles.soundName}>· {sound.displayName}</span>
                    <span className={styles.soundDuration}>{sound.duration}ms</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Sound Details Panel */}
      <section className={styles.detailsSection}>
        <div className={styles.box}>
          <span className={styles.corner}>┌</span>
          <span className={styles.cornerTr}>┐</span>
          <span className={styles.cornerBl}>└</span>
          <span className={styles.cornerBr}>┘</span>
          
          <h2>sound details</h2>
          
          <div className={styles.detailsGrid}>
            {SOUND_DEFINITIONS.map((sound) => (
              <div 
                key={sound.name}
                className={`${styles.detailCard} ${lastPlayed === sound.name ? styles.highlight : ''}`}
                onClick={() => playSound(sound)}
              >
                <div className={styles.detailName}>{sound.displayName}</div>
                <div className={styles.detailChar}>{sound.character}</div>
                <div className={styles.detailMeta}>~{sound.duration}ms</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tonal Reference */}
      <section className={styles.referenceSection}>
        <div className={styles.box}>
          <span className={styles.corner}>┌</span>
          <span className={styles.cornerTr}>┐</span>
          <span className={styles.cornerBl}>└</span>
          <span className={styles.cornerBr}>┘</span>
          
          <h2>tonal palette</h2>
          <p className={styles.note}>D major pentatonic — notes that can't clash</p>
          
          <div className={styles.noteGrid}>
            {Object.entries(NOTES).slice(0, 5).map(([note, freq]) => (
              <button
                key={note}
                className={styles.noteButton}
                onClick={() => {
                  const ctx = getAudioContext();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.type = 'sine';
                  osc.frequency.value = freq;
                  gain.gain.setValueAtTime(masterVolume * 0.3, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                  osc.connect(gain).connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.3);
                }}
              >
                <span className={styles.noteName}>{note}</span>
                <span className={styles.noteFreq}>{Math.round(freq)}Hz</span>
              </button>
            ))}
          </div>

          <div className={styles.usageGuide}>
            <div className={styles.usageRow}>
              <span className={styles.usageType}>positive</span>
              <span className={styles.usageNotes}>D, A (root + fifth)</span>
            </div>
            <div className={styles.usageRow}>
              <span className={styles.usageType}>neutral</span>
              <span className={styles.usageNotes}>E, F# (gentle steps)</span>
            </div>
            <div className={styles.usageRow}>
              <span className={styles.usageType}>negative</span>
              <span className={styles.usageNotes}>B, lower D (resolution down)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Layer Queue Visualization */}
      <section className={styles.queueSection}>
        <div className={styles.box}>
          <span className={styles.corner}>┌</span>
          <span className={styles.cornerTr}>┐</span>
          <span className={styles.cornerBl}>└</span>
          <span className={styles.cornerBr}>┘</span>
          
          <h2>recent sounds</h2>
          <div className={styles.queue}>
            {layerQueue.length === 0 ? (
              <span className={styles.queueEmpty}>click sounds to see history</span>
            ) : (
              layerQueue.map((name, i) => (
                <span 
                  key={i} 
                  className={styles.queueItem}
                  style={{ opacity: 0.4 + (i / layerQueue.length) * 0.6 }}
                >
                  {name}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>synthesized with web audio api · d major pentatonic</p>
        <p className={styles.hint}>tip: these are placeholder sounds for experimentation</p>
      </footer>
    </div>
  );
}
