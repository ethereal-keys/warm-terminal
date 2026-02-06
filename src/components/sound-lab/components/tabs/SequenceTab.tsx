/**
 * SequenceTab Component
 * Editor for sequence sounds with timeline visualization
 */

import React, { useState } from 'react';
import styles from './SequenceTab.module.css';
import { Knob, WaveformSelector } from '../controls';
import type { SequenceNote, SequenceParams } from '../../lib/types';
import { frequencyToNote, generateId } from '../../lib/types';

interface SequenceTabProps {
  params: SequenceParams;
  onChange: (params: SequenceParams) => void;
  disabled?: boolean;
}

export function SequenceTab({ params, onChange, disabled = false }: SequenceTabProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    params.notes[0]?.id || null
  );

  const selectedNote = params.notes.find(n => n.id === selectedNoteId);

  // Calculate total duration
  const totalDuration = Math.max(
    ...params.notes.map(n => n.delay + n.duration),
    100
  ) + params.envelope.release;

  const updateNote = (noteId: string, updates: Partial<SequenceNote>) => {
    onChange({
      ...params,
      notes: params.notes.map(n =>
        n.id === noteId ? { ...n, ...updates } : n
      )
    });
  };

  const addNote = () => {
    const lastNote = params.notes[params.notes.length - 1];
    const newDelay = lastNote ? lastNote.delay + lastNote.duration + 50 : 0;

    const newNote: SequenceNote = {
      id: generateId(),
      delay: newDelay,
      frequency: 440,
      duration: 100,
      level: 0.7,
      waveform: 'sine',
    };

    onChange({
      ...params,
      notes: [...params.notes, newNote]
    });
    setSelectedNoteId(newNote.id);
  };

  const deleteNote = (noteId: string) => {
    if (params.notes.length <= 1) return; // Keep at least one note

    const newNotes = params.notes.filter(n => n.id !== noteId);
    onChange({ ...params, notes: newNotes });

    if (selectedNoteId === noteId) {
      setSelectedNoteId(newNotes[0]?.id || null);
    }
  };

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>SEQUENCE EDITOR</h3>
        <span className={styles.duration}>TOTAL: ~{Math.round(totalDuration)}ms</span>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        <div className={styles.timelineHeader}>
          <span className={styles.timeLabel}>TIMELINE</span>
        </div>
        <div className={styles.timelineTrack}>
          <svg
            viewBox={`0 0 400 60`}
            className={styles.timelineSvg}
            preserveAspectRatio="xMinYMid meet"
          >
            {/* Time markers */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const x = 10 + t * 380;
              return (
                <g key={i}>
                  <line x1={x} y1="5" x2={x} y2="55" stroke="#D4CFC4" strokeWidth="0.5" />
                  <text
                    x={x}
                    y="62"
                    fontSize="8"
                    fill="#8A8680"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    {Math.round(t * totalDuration)}ms
                  </text>
                </g>
              );
            })}

            {/* Notes */}
            {params.notes.map((note, index) => {
              const startX = 10 + (note.delay / totalDuration) * 380;
              const width = Math.max((note.duration / totalDuration) * 380, 20);
              const isSelected = note.id === selectedNoteId;

              return (
                <g
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={startX}
                    y="15"
                    width={width}
                    height="30"
                    rx="3"
                    fill={isSelected ? '#BF4D28' : '#C4674A'}
                    opacity={isSelected ? 1 : 0.7}
                    stroke={isSelected ? '#8B3520' : 'none'}
                    strokeWidth="2"
                  />
                  <text
                    x={startX + width / 2}
                    y="27"
                    fontSize="10"
                    fill="white"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                  >
                    {index + 1}
                  </text>
                  <text
                    x={startX + width / 2}
                    y="39"
                    fontSize="8"
                    fill="rgba(255,255,255,0.8)"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    {frequencyToNote(note.frequency)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Note Editor */}
      {selectedNote && (
        <div className={styles.noteEditor}>
          <div className={styles.noteHeader}>
            <span className={styles.noteLabel}>
              SELECTED: Note {params.notes.findIndex(n => n.id === selectedNoteId) + 1}
            </span>
            <div className={styles.noteActions}>
              <button
                className={styles.actionButton}
                onClick={addNote}
                disabled={disabled}
              >
                + ADD
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => deleteNote(selectedNote.id)}
                disabled={disabled || params.notes.length <= 1}
              >
                × DEL
              </button>
            </div>
          </div>

          <div className={styles.noteParams}>
            <div className={styles.noteRow}>
              <Knob
                label="DELAY"
                value={selectedNote.delay}
                min={0}
                max={2000}
                step={1}
                unit="ms"
                onChange={(v) => updateNote(selectedNote.id, { delay: v })}
                disabled={disabled}
              />

              <Knob
                label="FREQUENCY"
                value={selectedNote.frequency}
                min={20}
                max={20000}
                step={1}
                displayValue={`${frequencyToNote(selectedNote.frequency)} · ${Math.round(selectedNote.frequency)} Hz`}
                logarithmic
                onChange={(v) => updateNote(selectedNote.id, { frequency: v })}
                disabled={disabled}
              />

              <Knob
                label="DURATION"
                value={selectedNote.duration}
                min={10}
                max={2000}
                step={1}
                unit="ms"
                onChange={(v) => updateNote(selectedNote.id, { duration: v })}
                disabled={disabled}
              />

              <Knob
                label="LEVEL"
                value={selectedNote.level}
                min={0}
                max={1}
                step={0.01}
                displayValue={`${Math.round(selectedNote.level * 100)}%`}
                onChange={(v) => updateNote(selectedNote.id, { level: v })}
                disabled={disabled}
              />
            </div>

            <div className={styles.waveformRow}>
              <WaveformSelector
                value={selectedNote.waveform}
                onChange={(v) => updateNote(selectedNote.id, { waveform: v })}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SequenceTab;
