/**
 * Sound Lab
 * Terminal aesthetic on aged graph paper
 * Musical note system with scale constraints
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import styles from './SoundLab.module.css';

import { play, stop, getWaveformData, renderToWav } from './lib/engine';
import { DEFAULT_SOUNDS, createSound } from './lib/presets';
import type { Sound, SimpleParams, SequenceParams, EnvelopeParams, FilterParams, OscillatorParams, SequenceNote, WaveformType } from './lib/types';
import { generateId } from './lib/types';
import { useSound } from '@/hooks/useSound';
import { SoundToggle } from '@/components/interactive/SoundToggle';

// =============================================================================
// MUSICAL SCALES
// =============================================================================

type ScaleId = 'dPent' | 'dMaj' | 'dMin' | 'chromatic';

const SCALES: { id: ScaleId; name: string; notes: number[] }[] = [
  { id: 'dPent', name: 'D pent', notes: [50, 52, 54, 57, 59, 62, 64, 66, 69, 71, 74, 76, 78, 81, 83] },
  { id: 'dMaj', name: 'D major', notes: [50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81, 83, 85, 86] },
  { id: 'dMin', name: 'D minor', notes: [50, 52, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81, 82, 84, 86] },
  { id: 'chromatic', name: 'chromatic', notes: Array.from({ length: 37 }, (_, i) => 48 + i) },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

function midiToNoteName(midi: number): string {
  const note = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function freqToNoteName(freq: number): string {
  return midiToNoteName(Math.round(freqToMidi(freq)));
}

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

type TabId = 'oscA' | 'oscB' | 'env' | 'filter' | 'seq';
type ModalType = 'none' | 'help' | 'newSound' | 'reset' | 'delete';

// Calculate total duration of a sound in milliseconds
function calcSoundDuration(params: SimpleParams | SequenceParams): number {
  const env = params.envelope;
  const envDuration = env.attack + env.decay + env.release;

  if ('notes' in params && params.notes?.length) {
    // Sequence: max note end time + release
    const maxNoteEnd = Math.max(...params.notes.map(n => n.delay + n.duration));
    return maxNoteEnd + env.release;
  } else {
    // Simple: envelope duration + sustain hold time (estimate ~50ms)
    return envDuration + 50;
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SoundLab() {
  const { enabled: soundOn, toggle: toggleSound } = useSound();
  const [sounds, setSounds] = useState<Record<string, Sound>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('soundlab-sounds');
        if (saved) return { ...DEFAULT_SOUNDS, ...JSON.parse(saved) };
      } catch { }
    }
    return { ...DEFAULT_SOUNDS };
  });

  const [selectedId, setSelectedId] = useState<string>('click');
  const [activeTab, setActiveTab] = useState<TabId>('oscA');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playStartTime, setPlayStartTime] = useState<number | null>(null);
  const [pausedElapsed, setPausedElapsed] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalType>('none');
  const [scaleId, setScaleId] = useState<ScaleId>('dPent');
  const [showScaleMenu, setShowScaleMenu] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const playbackTimeoutRef = useRef<number | null>(null);
  const scaleMenuRef = useRef<HTMLDivElement>(null);

  const [newSoundName, setNewSoundName] = useState('');
  const [newSoundType, setNewSoundType] = useState<'simple' | 'sequence'>('simple');

  // Close scale menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (scaleMenuRef.current && !scaleMenuRef.current.contains(event.target as Node)) {
        setShowScaleMenu(false);
      }
    }

    if (showScaleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showScaleMenu]);

  const scale = SCALES.find(s => s.id === scaleId) || SCALES[0];
  const sound = sounds[selectedId];
  const isSimple = sound?.type === 'simple';
  const original = DEFAULT_SOUNDS[selectedId];
  const canReset = sound?.modified && original;
  const canDelete = Object.keys(sounds).length > 1;

  const tabs = useMemo(() =>
    isSimple
      ? [{ id: 'oscA', label: 'osc-a', key: '1' }, { id: 'oscB', label: 'osc-b', key: '2' }, { id: 'env', label: 'env', key: '3' }, { id: 'filter', label: 'filter', key: '4' }]
      : [{ id: 'seq', label: 'seq', key: '1' }, { id: 'env', label: 'env', key: '2' }, { id: 'filter', label: 'filter', key: '3' }]
    , [isSimple]) as { id: TabId; label: string; key: string }[];

  const allSounds = useMemo(() => Object.values(sounds), [sounds]);

  useEffect(() => {
    try {
      localStorage.setItem('soundlab-sounds', JSON.stringify(sounds));
      // Notify the global sound system
      window.dispatchEvent(new Event('soundlab-update'));
    } catch { }
  }, [sounds]);

  useEffect(() => {
    if (!sound) return;
    if (sound.type === 'sequence' && (activeTab === 'oscA' || activeTab === 'oscB')) {
      setActiveTab('seq');
    }
    if (sound.type === 'simple' && activeTab === 'seq') {
      setActiveTab('oscA');
    }
  }, [sound?.type, sound?.id]);

  // Clear paused state and cancel timeout when switching sounds
  useEffect(() => {
    setPausedElapsed(null);
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
  }, [selectedId]);

  const handlePlay = useCallback(() => {
    if (!sound) return;
    if (isPlaying) {
      stop();
      // Cancel the scheduled timeout
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
      // Save elapsed time when stopping
      if (playStartTime) {
        setPausedElapsed(Date.now() - playStartTime);
      }
      setIsPlaying(false);
      setPlayStartTime(null);
    } else {
      setIsPlaying(true);
      setPlayStartTime(Date.now());
      setPausedElapsed(null); // Clear paused state when starting
      const duration = play(sound.params);
      playbackTimeoutRef.current = window.setTimeout(() => {
        setIsPlaying(false);
        setPlayStartTime(null);
        setPausedElapsed(null); // Clear when playback completes naturally
        playbackTimeoutRef.current = null;
      }, duration);
    }
  }, [sound, isPlaying, playStartTime]);

  const update = useCallback((params: SimpleParams | SequenceParams) => {
    setSounds(p => ({ ...p, [selectedId]: { ...p[selectedId], params, modified: true } }));
  }, [selectedId]);

  const handleReset = useCallback(() => {
    if (original) {
      setSounds(p => ({ ...p, [selectedId]: { ...original, modified: false } }));
      setModal('none');
    }
  }, [selectedId, original]);

  const handleDelete = useCallback(() => {
    if (deleteTargetId && canDelete) {
      setSounds(p => {
        const newSounds = { ...p };
        delete newSounds[deleteTargetId];
        return newSounds;
      });
      if (selectedId === deleteTargetId) {
        const remaining = Object.keys(sounds).filter(id => id !== deleteTargetId);
        setSelectedId(remaining[0] || 'click');
      }
      setModal('none');
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, canDelete, selectedId, sounds]);

  const handleCreateSound = useCallback(() => {
    if (!newSoundName.trim()) return;
    const ns = createSound(newSoundName.trim(), newSoundType);
    setSounds(p => ({ ...p, [ns.id]: ns }));
    setSelectedId(ns.id);
    setModal('none');
    setNewSoundName('');
    setNewSoundType('simple');
  }, [newSoundName, newSoundType]);

  const openDeleteModal = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
    setModal('delete');
  }, []);

  const handleDownload = useCallback(async () => {
    if (!sound) return;
    try {
      const blob = await renderToWav(sound.params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sound.name || 'sound'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download wav', e);
    }
  }, [sound]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      // Skip if typing in a text input
      if (e.target instanceof HTMLInputElement && e.target.type === 'text') return;

      if (modal !== 'none' && e.key === 'Escape') {
        setModal('none');
        return;
      }
      if (modal !== 'none') return;

      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        // Blur any focused element to prevent it capturing future keypresses
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        handlePlay();
        return;
      }
      if (e.key === 'r' && canReset) setModal('reset');
      if (e.key === 'd') handleDownload();
      if (e.key === '?') setModal('help');
      if (e.key === 'Escape') setShowScaleMenu(false);

      const i = +e.key - 1;
      if (tabs[i]) setActiveTab(tabs[i].id);
    };
    addEventListener('keydown', fn, true); // Use capture phase
    return () => removeEventListener('keydown', fn, true);
  }, [handlePlay, tabs, canReset, modal]);

  const sp = sound?.params as SimpleParams;
  const sqp = sound?.params as SequenceParams;

  return (
    <div className={styles.page}>
      <div className={styles.paper}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTitleRow}>
              <span className={styles.title}>sound-lab</span>
              <button
                className={styles.helpBtn}
                onClick={() => setModal('help')}
                title="Help"
              >
                ?
              </button>
            </div>
            <div className={styles.scaleWrap} ref={scaleMenuRef}>
              <button className={styles.scaleBtn} onClick={() => setShowScaleMenu(s => !s)}>
                scale: {scale.name} ▾
              </button>
              {showScaleMenu && (
                <div className={styles.scaleMenu}>
                  {SCALES.map(s => (
                    <button
                      key={s.id}
                      className={styles.scaleOption}
                      onClick={() => { setScaleId(s.id); setShowScaleMenu(false); }}
                    >
                      ({s.id === scaleId ? '●' : '○'}) {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.headerRight}>
            <a href="/" className={styles.back}>
              <span className={styles.backIcon}>←</span>
              <span>back to portfolio</span>
            </a>
            <SoundToggle soundOn={soundOn} onToggle={toggleSound} size="small" />
          </div>
        </header>

        <div className={styles.rule} />

        {/* Current sound */}
        <section className={styles.soundInfo}>
          <div className={styles.soundLine}>
            <span className={styles.prompt}>&gt;</span>
            {isEditingName ? (
              <input
                type="text"
                className={styles.nameInput}
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                onBlur={() => {
                  if (editedName.trim() && editedName !== sound?.name) {
                    setSounds(p => ({ ...p, [selectedId]: { ...p[selectedId], name: editedName.trim(), modified: true } }));
                  }
                  setIsEditingName(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  } else if (e.key === 'Escape') {
                    setIsEditingName(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <span
                className={styles.soundName}
                onClick={() => {
                  setEditedName(sound?.name || '');
                  setIsEditingName(true);
                }}
                title="Click to rename"
              >
                {sound?.name}
              </span>
            )}
            {sound && <span className={styles.duration}>{formatDuration(calcSoundDuration(sound.params))}</span>}
            {sound?.modified && <span className={styles.modified}>● modified</span>}
          </div>
          <div className={styles.soundDesc}>{sound?.description}</div>
        </section>

        {/* Display row */}
        <div className={styles.displayRow}>
          <div className={styles.graphBox}>
            <Scope isPlaying={isPlaying} />
            <button className={styles.graphLabel} onClick={handlePlay}>
              ▶ waveform
            </button>
          </div>
          <ArcMeter isPlaying={isPlaying} />
          <div className={styles.graphBox}>
            <ContextGraph
              tab={activeTab}
              oscA={sp?.oscA}
              oscB={sp?.oscB}
              env={sound?.params.envelope}
              filter={sound?.params.filter}
              seq={sqp}
              isPlaying={isPlaying}
              playStartTime={playStartTime}
              pausedElapsed={pausedElapsed}
              scaleNotes={scale.notes}
            />
            <span className={styles.graphLabelStatic}>
              {activeTab === 'oscA' ? (sp?.oscA?.waveform || 'sine') :
                activeTab === 'oscB' ? (sp?.oscB?.waveform || 'sine') :
                  activeTab === 'env' ? 'envelope' :
                    activeTab === 'filter' ? 'filter' : 'timeline'}
            </span>
          </div>
        </div>

        <div className={styles.rule} />

        {/* Controls */}
        <section className={styles.controls}>
          {activeTab === 'oscA' && isSimple && (
            <OscControls osc={sp.oscA} scale={scale} set={o => update({ ...sp, oscA: o })} />
          )}
          {activeTab === 'oscB' && isSimple && (
            <OscControls osc={sp.oscB} scale={scale} set={o => update({ ...sp, oscB: o })} />
          )}
          {activeTab === 'env' && sound && (
            <EnvControls env={sound.params.envelope} set={e => update({ ...sound.params, envelope: e })} />
          )}
          {activeTab === 'filter' && sound && (
            <FilterControls filter={sound.params.filter} set={f => update({ ...sound.params, filter: f })} />
          )}
          {activeTab === 'seq' && sound && !isSimple && (
            <SeqControls params={sqp} scale={scale} set={update} />
          )}
        </section>

        <div className={styles.rule} />

        {/* Tabs */}
        <nav className={styles.tabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              [{t.key}] {t.label}
            </button>
          ))}
          <span className={styles.tabSpacer} />
          <button
            className={`${styles.tabBtn} ${!canReset ? styles.tabBtnDisabled : ''}`}
            onClick={() => canReset && setModal('reset')}
          >
            [r] reset
          </button>
          <button
            className={styles.tabBtn}
            onClick={handleDownload}
          >
            [d] download
          </button>
        </nav>

        <div className={styles.rule} />

        {/* Sound Grid */}
        <section className={styles.soundGrid}>
          {allSounds.map(s => (
            <div key={s.id} className={styles.gridItemWrap}>
              <button
                className={`${styles.gridItem} ${selectedId === s.id ? styles.gridSel : ''}`}
                onClick={() => setSelectedId(s.id)}
              >
                {selectedId === s.id && '● '}
                {s.name}
                {s.type === 'sequence' && ' ♪'}
                {s.modified && selectedId !== s.id && ' ●'}
              </button>
              {canDelete && (
                <button
                  className={styles.gridDelete}
                  onClick={(e) => openDeleteModal(s.id, e)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className={styles.gridAdd} onClick={() => setModal('newSound')}>+</button>
        </section>

        {/* Help modal */}
        {modal === 'help' && (
          <div className={styles.modal} onClick={() => setModal('none')}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
              <div className={styles.modalTitle}>sound-lab</div>
              <div className={styles.rule} />
              <p>Interactive synthesizer for UI sounds.</p>
              <p>Notes snap to the selected scale.</p>
              <div className={styles.rule} />
              <div className={styles.helpGrid}>
                <span>space</span><span>play / stop</span>
                <span>1–4</span><span>switch tabs</span>
                <span>r</span><span>reset sound</span>
                <span>esc</span><span>close dialogs</span>
              </div>
              <div className={styles.rule} />
              <div className={styles.modalActions}>
                <span></span>
                <button onClick={() => setModal('none')}>close</button>
              </div>
            </div>
          </div>
        )}

        {/* New Sound modal */}
        {modal === 'newSound' && (
          <div className={styles.modal} onClick={() => setModal('none')}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
              <div className={styles.modalTitle}>new sound</div>
              <div className={styles.rule} />
              <div className={styles.modalField}>
                <label>name</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={newSoundName}
                  onChange={e => setNewSoundName(e.target.value)}
                  placeholder="my-sound"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleCreateSound()}
                />
              </div>
              <div className={styles.modalField}>
                <label>type</label>
                <div className={styles.modalOptions}>
                  <button
                    className={`${styles.modalOption} ${newSoundType === 'simple' ? styles.modalOptionSel : ''}`}
                    onClick={() => setNewSoundType('simple')}
                  >
                    {newSoundType === 'simple' ? '●' : '○'} simple
                  </button>
                  <button
                    className={`${styles.modalOption} ${newSoundType === 'sequence' ? styles.modalOptionSel : ''}`}
                    onClick={() => setNewSoundType('sequence')}
                  >
                    {newSoundType === 'sequence' ? '●' : '○'} sequence
                  </button>
                </div>
              </div>
              <div className={styles.rule} />
              <div className={styles.modalActions}>
                <button onClick={() => setModal('none')}>cancel</button>
                <button onClick={handleCreateSound} disabled={!newSoundName.trim()}>+ create</button>
              </div>
            </div>
          </div>
        )}

        {/* Reset modal */}
        {modal === 'reset' && (
          <div className={styles.modal} onClick={() => setModal('none')}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
              <div className={styles.modalTitle}>reset sound</div>
              <div className={styles.rule} />
              <p>Reset "{sound?.name}" to default settings?</p>
              <p>Your modifications will be lost.</p>
              <div className={styles.rule} />
              <div className={styles.modalActions}>
                <button onClick={() => setModal('none')}>cancel</button>
                <button onClick={handleReset}>reset</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {modal === 'delete' && deleteTargetId && (
          <div className={styles.modal} onClick={() => setModal('none')}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
              <div className={styles.modalTitle}>delete sound</div>
              <div className={styles.rule} />
              <p>Remove "{sounds[deleteTargetId]?.name}" permanently?</p>
              <div className={styles.rule} />
              <div className={styles.modalActions}>
                <button onClick={() => setModal('none')}>cancel</button>
                <button onClick={handleDelete}>× delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// VISUALIZATIONS
// =============================================================================

function Scope({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 240;
  const H = 78;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    let raf: number;
    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Paper background
      ctx.fillStyle = '#F5F2EB';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#E0DCD3';
      ctx.lineWidth = 1;
      const gridSpacing = 20;
      for (let x = gridSpacing; x < W; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = gridSpacing; y < H; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = '#B8B3A8';
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      const data = getWaveformData();
      if (data?.length) {
        ctx.beginPath();
        ctx.strokeStyle = '#BF4D28';
        ctx.lineWidth = 2;
        const slice = W / data.length;
        let x = 0;
        for (let i = 0; i < data.length; i++) {
          const y = (data[i] / 128) * (H / 2);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          x += slice;
        }
        ctx.stroke();
      }

      if (isPlaying) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      style={{ width: W, height: H }}
    />
  );
}

function ContextGraph({ tab, oscA, oscB, env, filter, seq, isPlaying, playStartTime, pausedElapsed, scaleNotes }: {
  tab: TabId;
  oscA?: OscillatorParams;
  oscB?: OscillatorParams;
  env?: EnvelopeParams;
  filter?: FilterParams;
  seq?: SequenceParams;
  isPlaying?: boolean;
  playStartTime?: number | null;
  pausedElapsed?: number | null;
  scaleNotes: number[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 240;
  const H = 78;

  // Include detune in dependencies
  const oscADeps = oscA ? `${oscA.waveform}-${oscA.enabled}-${oscA.frequency}-${oscA.level}-${oscA.detune}` : '';
  const oscBDeps = oscB ? `${oscB.waveform}-${oscB.enabled}-${oscB.frequency}-${oscB.level}-${oscB.detune}` : '';
  const envDeps = env ? `${env.attack}-${env.decay}-${env.sustain}-${env.release}` : '';
  const filterDeps = filter ? `${filter.enabled}-${filter.type}-${filter.cutoff}-${filter.resonance}` : '';
  const seqDeps = seq?.notes ? JSON.stringify(seq.notes.map(n => `${n.delay}-${n.duration}-${n.frequency}`)) : '';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    let raf: number;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const padding = 6;

      // Paper background
      ctx.fillStyle = '#F5F2EB';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#E8E4D9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      ctx.setLineDash([2, 4]);
      for (let i = 1; i < 4; i++) {
        const x = (W / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.strokeStyle = '#BF4D28';
      ctx.lineWidth = 2;

      if ((tab === 'oscA' && oscA) || (tab === 'oscB' && oscB)) {
        const osc = tab === 'oscA' ? oscA : oscB;
        if (osc) {
          const waveform = osc.waveform || 'sine';
          const gain = osc.level ?? 0.7;
          const freq = osc.frequency || 440;
          const detune = osc.detune || 0;

          const midi = freqToMidi(freq);
          const minMidi = scaleNotes[0] || 50;
          const maxMidi = scaleNotes[scaleNotes.length - 1] || 83;
          const notePosition = Math.max(0, Math.min(1, (midi - minMidi) / (maxMidi - minMidi)));

          // Base cycles from note position, then modulate with detune
          const detuneEffect = 1 + (detune / 100) * 0.1;
          const cycles = (1 + notePosition * 7) * detuneEffect;

          const maxAmplitude = (H - padding * 2) / 2;
          const amplitude = maxAmplitude * gain;
          const centerY = H / 2;

          ctx.beginPath();
          ctx.strokeStyle = osc.enabled ? '#BF4D28' : '#B8B3A8';
          ctx.lineWidth = 2;

          for (let px = padding; px < W - padding; px++) {
            const t = ((px - padding) / (W - padding * 2)) * cycles * Math.PI * 2;
            let y = 0;

            switch (waveform) {
              case 'sine':
                y = Math.sin(t);
                break;
              case 'triangle':
                y = (2 / Math.PI) * Math.asin(Math.sin(t));
                break;
              case 'square':
                y = Math.sin(t) >= 0 ? 0.9 : -0.9;
                break;
              case 'sawtooth':
                const phase = (t % (Math.PI * 2)) / (Math.PI * 2);
                y = 2 * phase - 1;
                break;
            }

            const canvasY = centerY - y * amplitude;
            px === padding ? ctx.moveTo(px, canvasY) : ctx.lineTo(px, canvasY);
          }
          ctx.stroke();

          if (!osc.enabled) {
            ctx.fillStyle = '#8A8680';
            ctx.font = '10px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('osc off', W / 2, H - 8);
          }
        }
      } else if (tab === 'env' && env) {
        const { attack: a, decay: d, sustain: s, release: r } = env;
        const total = a + d + 100 + r;
        const drawW = W - padding * 2;
        const drawH = H - padding * 2;
        const sc = drawW / total;

        const ax = padding + a * sc;
        const dx = ax + d * sc;
        const sx = dx + 100 * sc;
        const rx = sx + r * sc;
        const sY = padding + (1 - s) * drawH;
        const bottom = H - padding;
        const top = padding;

        ctx.beginPath();
        ctx.moveTo(padding, bottom);
        ctx.lineTo(ax, top);
        ctx.lineTo(dx, sY);
        ctx.lineTo(sx, sY);
        ctx.lineTo(rx, bottom);
        ctx.stroke();

        ctx.fillStyle = '#BF4D28';
        const dotRadius = 3;

        ctx.beginPath();
        ctx.arc(ax, top, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dx, sY, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sY, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#D4CFC4';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        [ax, dx, sx].forEach(x => {
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, bottom);
          ctx.stroke();
        });
        ctx.setLineDash([]);

      } else if (tab === 'filter' && filter) {
        if (filter.enabled) {
          const { type, cutoff, resonance } = filter;
          const logMin = Math.log(20), logMax = Math.log(20000);
          const cutoffX = padding + ((Math.log(cutoff) - logMin) / (logMax - logMin)) * (W - padding * 2);
          const resBoost = Math.min(resonance * 2, 35);
          const top = padding + 4;
          const bottom = H - padding - 4;

          if (type === 'lowpass') {
            ctx.beginPath();
            ctx.moveTo(padding, top);
            ctx.lineTo(cutoffX - 15, top);
            ctx.quadraticCurveTo(cutoffX, top - resBoost, cutoffX + 20, bottom);
            ctx.lineTo(W - padding, bottom);
            ctx.stroke();
          } else if (type === 'highpass') {
            ctx.beginPath();
            ctx.moveTo(padding, bottom);
            ctx.lineTo(cutoffX - 20, bottom);
            ctx.quadraticCurveTo(cutoffX, top - resBoost, cutoffX + 15, top);
            ctx.lineTo(W - padding, top);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(padding, bottom);
            ctx.quadraticCurveTo(cutoffX - 30, bottom, cutoffX, top - resBoost * 0.5);
            ctx.quadraticCurveTo(cutoffX + 30, bottom, W - padding, bottom);
            ctx.stroke();
          }

          ctx.fillStyle = '#BF4D28';
          ctx.beginPath();
          ctx.arc(cutoffX, H / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#B8B3A8';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(padding, H / 2);
          ctx.lineTo(W - padding, H / 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#8A8680';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('filter off', W / 2, H / 2 + 16);
        }
      } else if (tab === 'seq' && seq) {
        if (seq.notes?.length) {
          const total = Math.max(...seq.notes.map(n => n.delay + n.duration), 200);
          const drawW = W - padding * 2;
          const noteHeight = H - padding * 2 - 8;

          seq.notes.forEach((note, i) => {
            const x = padding + (note.delay / total) * drawW;
            const nw = Math.max((note.duration / total) * drawW, 6);
            ctx.fillStyle = `rgba(191, 77, 40, ${0.5 + i * 0.12})`;
            ctx.fillRect(x, padding + 4, nw, noteHeight);
          });

          // Show seek indicator when playing OR when paused mid-playback
          const elapsed = isPlaying && playStartTime
            ? Date.now() - playStartTime
            : pausedElapsed;

          if (elapsed != null && elapsed > 0) {
            const progress = Math.min(elapsed / total, 1);
            const seekX = padding + progress * drawW;

            ctx.strokeStyle = '#2B2926';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(seekX, 2);
            ctx.lineTo(seekX, H - 2);
            ctx.stroke();

            ctx.fillStyle = '#2B2926';
            ctx.beginPath();
            ctx.moveTo(seekX - 5, 0);
            ctx.lineTo(seekX + 5, 0);
            ctx.lineTo(seekX, 7);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      if (isPlaying && tab === 'seq') {
        raf = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [tab, oscADeps, oscBDeps, envDeps, filterDeps, seqDeps, isPlaying, playStartTime, pausedElapsed, scaleNotes]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      style={{ width: W, height: H }}
    />
  );
}

function ArcMeter({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    let raf: number;
    const update = () => {
      const data = getWaveformData();
      if (data?.length) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += ((data[i] - 128) / 128) ** 2;
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 3));
      } else {
        setLevel(l => l * 0.85);
      }
      if (isPlaying) raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 80;
    const displayHeight = 64;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const w = displayWidth, h = displayHeight;
    const centerX = w / 2;
    const centerY = h - 6;
    const radius = 34;

    ctx.fillStyle = '#F5F2EB';
    ctx.fillRect(0, 0, w, h);

    const startAngle = Math.PI * 1.15;
    const endAngle = Math.PI * 1.85;

    const ticks = [
      { value: 0, label: '-∞' },
      { value: 0.25, label: '-20' },
      { value: 0.5, label: '-10' },
      { value: 0.75, label: '-3' },
      { value: 1, label: '0' },
    ];

    ctx.font = '8px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ticks.forEach(tick => {
      const angle = startAngle + (endAngle - startAngle) * tick.value;
      const innerR = radius - 6;
      const outerR = radius;
      const labelR = radius + 9;

      const isHot = tick.value >= 0.75;
      ctx.strokeStyle = isHot ? '#BF4D28' : '#B8B3A8';
      ctx.lineWidth = tick.value === 1 || tick.value === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
      ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
      ctx.stroke();

      ctx.fillStyle = isHot ? '#BF4D28' : '#8A8680';
      ctx.fillText(tick.label, centerX + Math.cos(angle) * labelR, centerY + Math.sin(angle) * labelR);
    });

    ctx.strokeStyle = '#D4CFC4';
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 3, startAngle, endAngle);
    ctx.stroke();
    ctx.setLineDash([]);

    const needleAngle = startAngle + (endAngle - startAngle) * Math.min(level, 1);
    const needleLength = radius - 10;
    const isHot = level >= 0.75;

    ctx.strokeStyle = isHot ? '#BF4D28' : '#2B2926';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * needleLength,
      centerY + Math.sin(needleAngle) * needleLength
    );
    ctx.stroke();

    ctx.fillStyle = '#2B2926';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [level]);

  return (
    <div className={styles.arcMeter}>
      <canvas ref={canvasRef} className={styles.arcMeterCanvas} style={{ width: 80, height: 64 }} />
      <span className={styles.arcMeterLabel}>level</span>
    </div>
  );
}

// =============================================================================
// CONTROLS
// =============================================================================

function NoteSlider({ value, scale, onChange }: {
  value: number;
  scale: { notes: number[] };
  onChange: (freq: number) => void;
}) {
  const notes = scale.notes;
  const currentMidi = Math.round(freqToMidi(value));
  let noteIndex = notes.findIndex(n => n === currentMidi);
  if (noteIndex < 0) {
    let minDist = Infinity;
    notes.forEach((n, i) => {
      const dist = Math.abs(n - currentMidi);
      if (dist < minDist) { minDist = dist; noteIndex = i; }
    });
  }

  const percent = notes.length > 1 ? (noteIndex / (notes.length - 1)) * 100 : 50;

  return (
    <div className={styles.sliderRow}>
      <span className={styles.sliderLabel}>note</span>
      <div className={styles.sliderTrack}>
        <div className={styles.sliderTrackLine} />
        <input
          type="range"
          min={0}
          max={notes.length - 1}
          value={noteIndex}
          onChange={e => onChange(midiToFreq(notes[+e.target.value]))}
          className={styles.sliderInput}
        />
        <div className={styles.sliderThumb} style={{ left: `${percent}%` }} />
        <div className={styles.tickContainer}>
          {notes.map((_, i) => (
            <div
              key={i}
              className={styles.tick}
              style={{ left: `${notes.length > 1 ? (i / (notes.length - 1)) * 100 : 50}%` }}
            />
          ))}
        </div>
      </div>
      <span className={styles.sliderValue}>{freqToNoteName(value)}  {Math.round(value)} Hz</span>
    </div>
  );
}

function Slider({ label, value, min, max, display, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const norm = (value - min) / (max - min);
  const percent = norm * 100;

  return (
    <div className={styles.sliderRow}>
      <span className={styles.sliderLabel}>{label}</span>
      <div className={styles.sliderTrack}>
        <div className={styles.sliderTrackLine} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={norm}
          onChange={e => onChange(min + +e.target.value * (max - min))}
          className={styles.sliderInput}
        />
        <div className={styles.sliderThumb} style={{ left: `${percent}%` }} />
      </div>
      <span className={styles.sliderValue}>{display}</span>
    </div>
  );
}

const WAVE_OPTIONS: { type: WaveformType; icon: string; label: string }[] = [
  { type: 'sine', icon: '∿', label: 'sin' },
  { type: 'triangle', icon: '△', label: 'tri' },
  { type: 'square', icon: '⊓', label: 'sqr' },
  { type: 'sawtooth', icon: '⩘', label: 'saw' },
];

function WaveSelect({ value, onChange }: { value: WaveformType; onChange: (w: WaveformType) => void }) {
  return (
    <div className={styles.sliderRow}>
      <span className={styles.sliderLabel}>wave</span>
      <div className={styles.waveOptions}>
        {WAVE_OPTIONS.map(w => (
          <button
            key={w.type}
            className={`${styles.waveBtn} ${value === w.type ? styles.waveSel : ''}`}
            onClick={() => onChange(w.type)}
          >
            [{w.icon} {w.label}]
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={styles.toggle} onClick={() => onChange(!value)}>
      [{value ? '●' : '○'}] {label}
    </button>
  );
}

// =============================================================================
// TAB PANELS
// =============================================================================

function OscControls({ osc, scale, set }: { osc: OscillatorParams; scale: { notes: number[] }; set: (o: OscillatorParams) => void }) {
  const u = <K extends keyof OscillatorParams>(k: K, v: OscillatorParams[K]) => set({ ...osc, [k]: v });

  return (
    <div className={styles.panel}>
      <Toggle label="oscillator" value={osc.enabled} onChange={v => u('enabled', v)} />
      <div className={`${styles.panelInner} ${!osc.enabled ? styles.disabled : ''}`}>
        <NoteSlider value={osc.frequency} scale={scale} onChange={v => u('frequency', v)} />
        <Slider label="bend" value={osc.detune} min={-100} max={100}
          display={`${osc.detune > 0 ? '+' : ''}${Math.round(osc.detune)} ¢`}
          onChange={v => u('detune', v)} />
        <Slider label="gain" value={osc.level} min={0} max={1}
          display={`${Math.round(osc.level * 100)} %`}
          onChange={v => u('level', v)} />
        <WaveSelect value={osc.waveform} onChange={v => u('waveform', v)} />
      </div>
    </div>
  );
}

function EnvControls({ env, set }: { env: EnvelopeParams; set: (e: EnvelopeParams) => void }) {
  const u = <K extends keyof EnvelopeParams>(k: K, v: number) => set({ ...env, [k]: v });
  const total = env.attack + env.decay + 50 + env.release;

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>envelope <span className={styles.meta}>~{Math.round(total)} ms</span></div>
      <div className={styles.panelInner}>
        <Slider label="attack" value={env.attack} min={0} max={2000}
          display={`${Math.round(env.attack)} ms`} onChange={v => u('attack', v)} />
        <Slider label="decay" value={env.decay} min={0} max={2000}
          display={`${Math.round(env.decay)} ms`} onChange={v => u('decay', v)} />
        <Slider label="sustain" value={env.sustain} min={0} max={1}
          display={`${Math.round(env.sustain * 100)} %`} onChange={v => u('sustain', v)} />
        <Slider label="release" value={env.release} min={0} max={5000}
          display={`${Math.round(env.release)} ms`} onChange={v => u('release', v)} />
      </div>
    </div>
  );
}

function FilterControls({ filter: f, set }: { filter: FilterParams; set: (f: FilterParams) => void }) {
  const u = <K extends keyof FilterParams>(k: K, v: FilterParams[K]) => set({ ...f, [k]: v });

  return (
    <div className={styles.panel}>
      <Toggle label="filter" value={f.enabled} onChange={v => u('enabled', v)} />
      <div className={`${styles.panelInner} ${!f.enabled ? styles.disabled : ''}`}>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>type</span>
          <div className={styles.waveOptions}>
            {(['lowpass', 'highpass', 'bandpass'] as const).map(t => (
              <button
                key={t}
                className={`${styles.waveBtn} ${f.type === t ? styles.waveSel : ''}`}
                onClick={() => u('type', t)}
              >
                [{t === 'lowpass' ? 'low' : t === 'highpass' ? 'high' : 'band'}]
              </button>
            ))}
          </div>
        </div>
        <Slider label="cutoff" value={f.cutoff} min={20} max={20000}
          display={f.cutoff >= 1000 ? `${(f.cutoff / 1000).toFixed(1)}k Hz` : `${Math.round(f.cutoff)} Hz`}
          onChange={v => u('cutoff', v)} />
        <Slider label="res" value={f.resonance} min={0.1} max={20}
          display={f.resonance.toFixed(1)} onChange={v => u('resonance', v)} />
        <Slider label="env" value={f.envelopeAmount} min={-1} max={1}
          display={`${f.envelopeAmount >= 0 ? '+' : ''}${Math.round(f.envelopeAmount * 100)} %`}
          onChange={v => u('envelopeAmount', v)} />
      </div>
    </div>
  );
}

function SeqControls({ params: p, scale, set }: { params: SequenceParams; scale: { notes: number[] }; set: (p: SequenceParams) => void }) {
  const [sel, setSel] = useState(0);

  const notes = p.notes || [];
  const n = notes[sel];
  const total = notes.length > 0 ? Math.max(...notes.map(x => x.delay + x.duration), 100) : 100;

  const uNote = (upd: Partial<SequenceNote>) => {
    if (!n) return;
    const newNotes = [...notes];
    newNotes[sel] = { ...newNotes[sel], ...upd };
    set({ ...p, notes: newNotes });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>
        sequence <span className={styles.meta}>~{Math.round(total)} ms · {notes.length} notes</span>
      </div>
      <div className={styles.seqRow}>
        {notes.map((note, i) => (
          <button key={note.id} className={`${styles.seqNote} ${i === sel ? styles.seqSel : ''}`} onClick={() => setSel(i)}>
            {freqToNoteName(note.frequency)}
          </button>
        ))}
        <button className={styles.seqBtn} onClick={() => {
          const last = notes[notes.length - 1];
          const nn: SequenceNote = { id: generateId(), delay: last ? last.delay + last.duration + 50 : 0, frequency: 440, duration: 100, level: 0.7, waveform: 'sine' };
          set({ ...p, notes: [...notes, nn] });
          setSel(notes.length);
        }}>+</button>
        {notes.length > 1 && (
          <button className={styles.seqBtn} onClick={() => {
            set({ ...p, notes: notes.filter((_, i) => i !== sel) });
            setSel(Math.max(0, sel - 1));
          }}>−</button>
        )}
      </div>
      {n && (
        <div className={styles.panelInner}>
          <Slider label="delay" value={n.delay} min={0} max={2000}
            display={`${Math.round(n.delay)} ms`} onChange={v => uNote({ delay: v })} />
          <NoteSlider value={n.frequency} scale={scale} onChange={v => uNote({ frequency: v })} />
          <Slider label="dur" value={n.duration} min={10} max={2000}
            display={`${Math.round(n.duration)} ms`} onChange={v => uNote({ duration: v })} />
          <Slider label="gain" value={n.level} min={0} max={1}
            display={`${Math.round(n.level * 100)} %`} onChange={v => uNote({ level: v })} />
        </div>
      )}
    </div>
  );
}