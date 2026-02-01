# Sound Lab Design Document

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Ready for Implementation

---

## I. Overview

### Purpose

Sound Lab is an interactive synthesis engine for designing UI sounds for the Warm Terminal portfolio. It serves dual purposes:

1. **Development Tool** — Design, tweak, and export the 14 core UI sounds
2. **Portfolio Piece** — A public-facing interactive showcase of creative engineering

### Scope

**In Scope:**
- Real-time Web Audio synthesis
- Visual parameter editing with knobs and curves
- Two modes: Simple (single tone) and Sequence (multi-note)
- Preset management with categories
- Export to JSON (parameters) and WAV (audio)
- Desktop-optimized experience

**Out of Scope:**
- Full DAW functionality
- LFO modulation
- Effects (reverb, delay)
- MIDI input
- Mobile editing (view-only on mobile)

---

## II. Visual Design

### Aesthetic Direction

**Terminal × Vintage Lab Equipment**

A fusion of the Warm Terminal aesthetic with 1970s-80s scientific instruments:
- HP/Tektronix test equipment
- Scientific calculators
- Analog oscilloscopes
- University lab gear

**Design Principles:**
- Subtle depth (not skeuomorphic)
- Dithering for texture (like reading progress indicator)
- Monospace typography throughout
- Functional, honest, purposeful

### Color Palette

```css
/* Base (from Warm Terminal) */
--cream:          #F5F2EB;    /* Page background */
--cream-dark:     #EBE8E1;    /* Secondary background */
--rust:           #BF4D28;    /* Primary accent */
--rust-muted:     #C4674A;    /* Softer accent */
--text-primary:   #2B2926;    /* Main text */
--text-secondary: #5C5954;    /* Muted text */
--text-tertiary:  #8A8680;    /* Faded text */

/* Lab Equipment Additions */
--panel-bg:       #E8E4D9;    /* Panel/card background */
--panel-inset:    #D4CFC4;    /* Inset areas, wells */
--panel-border:   #C9C4B8;    /* Subtle borders */

/* Indicators */
--amber-glow:     #FFAA33;    /* Active LED, playing state */
--amber-dim:      #CC8822;    /* Inactive LED */
--indicator-on:   #33AA66;    /* Green indicator */

/* Oscilloscope */
--scope-bg:       #1A1A18;    /* Dark screen background */
--scope-grid:     #2A2A28;    /* Grid lines */
--scope-trace:    #33AA66;    /* Waveform trace (green) */
--scope-glow:     rgba(51, 170, 102, 0.3);  /* Trace glow */
```

### Typography

```css
/* All text is monospace */
--font-primary:   'JetBrains Mono', monospace;
--font-display:   'JetBrains Mono', monospace;

/* Sizes */
--text-xs:   11px;   /* Shortcuts, labels */
--text-sm:   13px;   /* Secondary info */
--text-base: 15px;   /* Body text */
--text-lg:   18px;   /* Section headers */
--text-xl:   24px;   /* Page title */
```

### Depth & Texture

**Subtle depth via:**
- 1px borders with slightly darker shade
- Inset backgrounds for wells/displays
- No drop shadows
- No gradients

**Texture via dithering:**
- Apply to panel backgrounds
- Apply to inactive states
- 2×2 or 4×4 dither patterns
- Very subtle (5-10% opacity)

---

## III. Layout

### Overall Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├────────────────────┬────────────────────────────────────────────────────────┤
│                    │                                                        │
│  SIDEBAR           │  MAIN AREA                                             │
│  Sound Browser     │  ┌────────────────────────────────────────────────┐   │
│                    │  │ OSCILLOSCOPE                                   │   │
│  Categories +      │  └────────────────────────────────────────────────┘   │
│  Sound Grid        │  Level Meter + Time Display                           │
│                    │                                                        │
│                    │  ┌────────────────────────────────────────────────┐   │
│                    │  │ SOUND INFO BAR                                 │   │
│                    │  └────────────────────────────────────────────────┘   │
│                    │                                                        │
│                    │  ┌────────────────────────────────────────────────┐   │
│                    │  │ TABS                                           │   │
│                    │  ├────────────────────────────────────────────────┤   │
│                    │  │ TAB CONTENT                                    │   │
│                    │  │ (scrollable if needed)                         │   │
│                    │  └────────────────────────────────────────────────┘   │
│                    │                                                        │
│                    │  ┌────────────────────────────────────────────────┐   │
│                    │  │ ACTION BAR                                     │   │
│                    │  └────────────────────────────────────────────────┘   │
├────────────────────┴────────────────────────────────────────────────────────┤
│  SHORTCUTS BAR                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dimensions (1440×900 viewport)

| Section | Height | Width |
|---------|--------|-------|
| Header | 50px | 100% |
| Sidebar | 100% - header - shortcuts | 180px |
| Oscilloscope | 160px | remaining |
| Level + Time | 30px | remaining |
| Sound Info | 60px | remaining |
| Tabs | 40px | remaining |
| Tab Content | flexible (min 250px) | remaining |
| Action Bar | 50px | remaining |
| Shortcuts Bar | 36px | 100% |

---

## IV. Components

### A. Header

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   WARM TERMINAL SOUND LAB                                      [?]   [×]   │
│   ═══════════════════════                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- Title with underline decoration
- `[?]` — Opens info/about modal
- `[×]` — Close / return to portfolio (if accessed as project page)

---

### B. Sidebar (Sound Browser)

```
┌──────────────────┐
│                  │
│ ▾ INTERACTIONS   │
│ ┌────┬────┐      │
│ │clck│hovr│      │
│ ├────┼────┤      │
│ │ tab│ err│      │
│ └────┴────┘      │
│                  │
│ ▾ TRANSITIONS    │
│ ┌────┬────┐      │
│ │page│ nav│      │
│ └────┴────┘      │
│                  │
│ ▾ PALETTE        │
│ ┌────┬────┐      │
│ │open│clos│      │
│ ├────┼────┤      │
│ │ nav│ sel│      │
│ └────┴────┘      │
│                  │
│ ▾ TOGGLE         │
│ ┌────┬────┐      │
│ │ on♪│off♪│      │
│ └────┴────┘      │
│                  │
│ ▾ SPECIAL        │
│ ┌────┬────┬────┐ │
│ │egg♪│mark│    │ │
│ └────┴────┴────┘ │
│                  │
│ ▾ CUSTOM         │
│ ┌────┐           │
│ │    │           │
│ └────┘           │
│                  │
│ ──────────────── │
│                  │
│ [ + NEW SOUND ]  │
│                  │
└──────────────────┘
```

**Categories (fixed):**
- INTERACTIONS (click, hover, tab, error)
- TRANSITIONS (pageTransition, navShift)
- PALETTE (paletteOpen, paletteClose, paletteNav, paletteSelect)
- TOGGLE (soundOn, soundOff)
- SPECIAL (easterEgg, markHover)
- CUSTOM (user-created sounds)

**Sound Tile (~60×50px):**
```
┌──────────┐
│   clck   │  ← Abbreviated name (4-5 chars)
│          │
│        ● │  ← Modified indicator (if changed)
│        ♪ │  ← Sequence badge (if sequence type)
└──────────┘
```

**States:**
- Default: `--panel-bg` background
- Hover: Slight highlight, show full name tooltip
- Selected: `--rust-muted` border, slightly darker bg
- Modified: Small dot indicator
- Locked: Lock icon overlay

**Hover Tooltip:**
```
┌─────────────────────────┐
│ click                   │
│ soft mechanical key     │
│ 50ms · simple           │
│ ┌───────────────────┐   │
│ │ ∿∿∿∿∿∿∿           │   │  ← Mini waveform preview
│ └───────────────────┘   │
└─────────────────────────┘
```

**Category Collapse:**
- `▾` — Expanded (default)
- `▸` — Collapsed
- Click header to toggle

---

### C. Oscilloscope

```
┌────────────────────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░░│
│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░░│
│░░░░┼░░░░┼░░░░┼░░░░∿∿∿∿∿┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░░│
│░░░░│░░░░│░░░∿│░░░░│░░░░∿░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░░│
│────┼────┼──∿─┼────┼────┼─∿──┼────┼────┼────┼────┼────┼────┼────┼────┼─────│
│░░░░│░░░░│∿░░░│░░░░│░░░░│░░∿░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░░│
│░░░░┼░░░∿┼░░░░┼░░░░┼░░░░┼░░░∿┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░░│
│░░░░│░░∿░│░░░░│░░░░│░░░░│░░░░∿░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░░│
│░░░░┼░∿░░┼░░░░┼░░░░┼░░░░┼░░░░┼∿░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░┼░░░░░│
│░░░░│∿░░░│░░░░│░░░░│░░░░│░░░░│░∿∿∿│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Dark background (`--scope-bg`)
- Subtle grid lines (`--scope-grid`)
- Green trace (`--scope-trace`) with subtle glow
- Real-time audio visualization using AnalyserNode
- Center line (0 amplitude) emphasized

**Below Oscilloscope:**
```
○ ○ ○ ○ ○ ● ● ● ○ ○ ○ ○ ○ ○ ○ ○          TIME/DIV: 10ms    AMP: auto
└──────── level meter ────────┘
```

**Level Meter:**
- 16 segments
- Fills from left based on output amplitude
- `○` = off, `●` = on
- Rightmost segments could be amber/red for clipping warning

---

### D. Sound Info Bar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ▸ click                                              ● modified            │
│    soft mechanical key · 50ms                    [⋮]             [▶ PLAY]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- `▸` — Sound type indicator (▸ simple, ♪ sequence)
- Sound name — Click to edit inline
- Description — Click to edit inline
- Duration — Auto-calculated, read-only
- Modified indicator — Shows if unsaved changes
- `[⋮]` — More actions menu
- `[▶ PLAY]` — Play button (shows ■ STOP while playing)

**More Menu:**
```
┌─────────────────┐
│ Duplicate       │
│ Rename          │
│ Edit description│
│ ────────────────│
│ Convert to      │
│ Sequence        │  ← Only for simple sounds
│ ────────────────│
│ Lock            │
│ Delete          │
└─────────────────┘
```

---

### E. Tabs

**Simple Mode:**
```
┌─────────┬─────────┬──────────┬─────────┐
│  OSC A  │  OSC B  │ ENVELOPE │ FILTER  │
└─────────┴─────────┴──────────┴─────────┘
```

**Sequence Mode:**
```
┌──────────┬──────────┬─────────┐
│ SEQUENCE │ ENVELOPE │ FILTER  │
└──────────┴──────────┴─────────┘
```

**Tab States:**
- Default: `--text-secondary`
- Hover: `--text-primary`
- Active: `--rust`, bottom border accent

---

### F. Tab Content: OSC A / OSC B

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  OSCILLATOR A                                                     [ON/OFF] ║
╟───────────────────────────────────────────────────────────────────────────╢
║                                                                           ║
║    WAVEFORM              FREQUENCY                    DETUNE              ║
║   ┌─────────┐                                                             ║
║   │ ● SIN   │           ╭───╮                       ╭───╮                 ║
║   │ ○ TRI   │          ╱  │  ╲                     ╱  │  ╲                ║
║   │ ○ SQR   │         │   ●   │                   │   ●   │               ║
║   │ ○ SAW   │         │  ╱    │                   │  ╱    │               ║
║   └─────────┘          ╲     ╱                     ╲     ╱                ║
║                         ╰───╯                       ╰───╯                 ║
║                        A4 · 440 Hz                  +0 cents              ║
║                                                                           ║
║  ─────────────────────────────────────────────────────────────────────    ║
║                                                                           ║
║    PITCH ENVELOPE                                                         ║
║                                                                           ║
║    START               END                 TIME                           ║
║    ╭───╮               ╭───╮               ╭───╮                          ║
║   ╱  │  ╲             ╱  │  ╲             ╱  │  ╲                         ║
║  │   ●   │           │   ●   │           │   ●   │                        ║
║  │  ╱    │           │  ╱    │           │  ╱    │                        ║
║   ╲     ╱             ╲     ╱             ╲     ╱                         ║
║    ╰───╯               ╰───╯               ╰───╯                          ║
║   800 Hz              200 Hz               50 ms                          ║
║                                                                           ║
║   ┌─────────────────────────────────────────────┐                         ║
║   │  ╲                                          │  Pitch curve preview    ║
║   │   ╲                                         │                         ║
║   │    ╲____________________________________    │                         ║
║   └─────────────────────────────────────────────┘                         ║
║                                                                           ║
║  ─────────────────────────────────────────────────────────────────────    ║
║                                                                           ║
║    LEVEL                                                                  ║
║    ╭───╮                                                                  ║
║   ╱  │  ╲                                                                 ║
║  │   ●   │                                                                ║
║  │  ╱    │                                                                ║
║   ╲     ╱                                                                 ║
║    ╰───╯                                                                  ║
║     70%                                                                   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Parameters:**
| Parameter | Range | Default |
|-----------|-------|---------|
| Waveform | sine, triangle, square, sawtooth | sine |
| Frequency | 20 Hz - 20,000 Hz | 440 Hz |
| Detune | -100 to +100 cents | 0 |
| Pitch Start | 20 Hz - 20,000 Hz | same as freq |
| Pitch End | 20 Hz - 20,000 Hz | same as freq |
| Pitch Time | 1 ms - 2000 ms | 50 ms |
| Level | 0% - 100% | 70% |

**OSC B:**
- Same parameters as OSC A
- Additional: ON/OFF toggle (OSC B is optional)
- When off, parameters are dimmed

---

### G. Tab Content: ENVELOPE

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  AMPLITUDE ENVELOPE                                                       ║
╟───────────────────────────────────────────────────────────────────────────╢
║                                                                           ║
║   ┌───────────────────────────────────────────────────────────────────┐   ║
║   │                                                                   │   ║
║   │         ╱╲                                                        │   ║
║   │        ╱  ╲                                                       │   ║
║   │       ╱    ╲_____________                                         │   ║
║   │      ╱                   ╲                                        │   ║
║   │     ╱                     ╲                                       │   ║
║   │    ╱                       ╲                                      │   ║
║   │   ╱                         ╲_____                                │   ║
║   │  ╱                                ╲                               │   ║
║   │ ╱                                  ╲                              │   ║
║   │╱                                    ╲                             │   ║
║   └───────────────────────────────────────────────────────────────────┘   ║
║       A           D              S                 R                      ║
║                                                                           ║
║    ATTACK            DECAY             SUSTAIN           RELEASE          ║
║    ╭───╮             ╭───╮             ╭───╮             ╭───╮            ║
║   ╱  │  ╲           ╱  │  ╲           ╱  │  ╲           ╱  │  ╲           ║
║  │   ●   │         │   ●   │         │   ●   │         │   ●   │          ║
║  │  ╱    │         │  ╱    │         │  ╱    │         │  ╱    │          ║
║   ╲     ╱           ╲     ╱           ╲     ╱           ╲     ╱           ║
║    ╰───╯             ╰───╯             ╰───╯             ╰───╯            ║
║    10 ms             50 ms              0.7              100 ms           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Parameters:**
| Parameter | Range | Default |
|-----------|-------|---------|
| Attack | 0 ms - 2000 ms | 10 ms |
| Decay | 0 ms - 2000 ms | 50 ms |
| Sustain | 0.0 - 1.0 | 0.7 |
| Release | 0 ms - 5000 ms | 100 ms |

**Envelope Curve:**
- Updates in real-time as knobs change
- Shows time scale below
- Total duration displayed

---

### H. Tab Content: FILTER

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  FILTER                                                           [ON/OFF] ║
╟───────────────────────────────────────────────────────────────────────────╢
║                                                                           ║
║    TYPE                                                                   ║
║   ┌─────────┐                                                             ║
║   │ ● LP    │   Lowpass                                                   ║
║   │ ○ HP    │   Highpass                                                  ║
║   │ ○ BP    │   Bandpass                                                  ║
║   └─────────┘                                                             ║
║                                                                           ║
║   ┌───────────────────────────────────────────────────────────────────┐   ║
║   │                     FREQUENCY RESPONSE                            │   ║
║   │ ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   ║
║   │ ████████████████████████████▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   ║
║   │ █████████████████████████████▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   ║
║   │ ██████████████████████████████▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   ║
║   │ ████████████████████████████████▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   ║
║   └───────────────────────────────────────────────────────────────────┘   ║
║     20      100       500     1k      5k      10k     20k   Hz            ║
║                                                                           ║
║    CUTOFF            RESONANCE          ENV AMOUNT                        ║
║    ╭───╮             ╭───╮              ╭───╮                             ║
║   ╱  │  ╲           ╱  │  ╲            ╱  │  ╲                            ║
║  │   ●   │         │   ●   │          │   ●   │                           ║
║  │  ╱    │         │  ╱    │          │  ╱    │                           ║
║   ╲     ╱           ╲     ╱            ╲     ╱                            ║
║    ╰───╯             ╰───╯              ╰───╯                             ║
║   2000 Hz             0.5                50%                              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Parameters:**
| Parameter | Range | Default |
|-----------|-------|---------|
| Type | lowpass, highpass, bandpass | lowpass |
| Cutoff | 20 Hz - 20,000 Hz | 2000 Hz |
| Resonance (Q) | 0.1 - 20 | 1.0 |
| Envelope Amount | -100% to +100% | 0% |

**Frequency Response Curve:**
- Updates in real-time
- Shows where frequencies are cut/boosted
- Logarithmic frequency scale

---

### I. Tab Content: SEQUENCE

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  SEQUENCE EDITOR                                           TOTAL: 750 ms  ║
╟───────────────────────────────────────────────────────────────────────────╢
║                                                                           ║
║   ┌───────────────────────────────────────────────────────────────────┐   ║
║   │ TIMELINE                                                          │   ║
║   │                                                                   │   ║
║   │  0ms      100ms     200ms     300ms     400ms     500ms     600ms │   ║
║   │  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤   │   ║
║   │                                                                   │   ║
║   │  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐                 │   ║
║   │  │  1  │   │  2  │   │  3  │   │  4  │   │  5  │                 │   ║
║   │  │ D4  │   │ F#4 │   │ A4  │   │ B4  │   │ A4  │                 │   ║
║   │  └─────┘   └─────┘   └─────┘   └─────┘   └─────┘                 │   ║
║   │                                                                   │   ║
║   └───────────────────────────────────────────────────────────────────┘   ║
║                                                                           ║
║   SELECTED: Note 3                                      [+ ADD] [× DEL]   ║
║                                                                           ║
║  ─────────────────────────────────────────────────────────────────────    ║
║                                                                           ║
║    DELAY              FREQUENCY           DURATION         LEVEL          ║
║    ╭───╮              ╭───╮               ╭───╮            ╭───╮          ║
║   ╱  │  ╲            ╱  │  ╲             ╱  │  ╲          ╱  │  ╲         ║
║  │   ●   │          │   ●   │           │   ●   │        │   ●   │        ║
║  │  ╱    │          │  ╱    │           │  ╱    │        │  ╱    │        ║
║   ╲     ╱            ╲     ╱             ╲     ╱          ╲     ╱         ║
║    ╰───╯              ╰───╯               ╰───╯            ╰───╯          ║
║   200 ms             A4 · 440 Hz          150 ms            80%           ║
║                                                                           ║
║    WAVEFORM                                                               ║
║   ┌─────────┐                                                             ║
║   │ ● SIN   │                                                             ║
║   │ ○ TRI   │                                                             ║
║   │ ○ SQR   │                                                             ║
║   │ ○ SAW   │                                                             ║
║   └─────────┘                                                             ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Sequence Features:**
- Visual timeline showing all notes
- Click note to select for editing
- Drag notes on timeline to reposition
- Per-note parameters: delay, frequency, duration, level, waveform
- Add/Delete note buttons
- Total duration auto-calculated

**Note Block:**
- Shows note number and frequency/note name
- Width represents duration
- Position represents delay
- Selected note highlighted

---

### J. Action Bar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ↶ UNDO    ↷ REDO   │   [A/B COMPARE]   │   SAVE   │   EXPORT ▾           │
└─────────────────────────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
                                                   ┌────────────────┐
                                                   │ Copy as JSON   │
                                                   │ Download WAV   │
                                                   │ ────────────── │
                                                   │ Export All...  │
                                                   └────────────────┘
```

**A/B Compare Behavior:**
- Click and hold to hear saved version
- Release to return to current tweaked version
- Visual indicator shows which is playing

---

### K. Shortcuts Bar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SPACE: play │ ⌘Z: undo │ ⌘⇧Z: redo │ ⌘S: save │ 1-4: tabs │ R: randomize │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## V. Interactive Elements

### Knob

```
        ╭───╮
       ╱     ╲
      │   │   │    ← Indicator line shows position
      │   ●   │    ← Center point
      │  ╱    │    ← Indicator rotated based on value
       ╲     ╱
        ╰───╯
      ·  ·  ·  ·   ← Optional tick marks
       440 Hz      ← Value display
```

**Interaction:**
- Click + drag vertically: Adjust value
- Scroll wheel: Fine adjustment
- Double-click: Open text input for exact value

**States:**
- Default: `--text-secondary` border
- Hover: `--text-primary` border
- Active (dragging): `--rust` border
- Disabled: Dimmed, no interaction

**Text Input Mode (on double-click):**
```
        ╭───╮
       ╱     ╲
      │   │   │
      │   ●   │
      │  ╱    │
       ╲     ╱
        ╰───╯
     ┌─────────┐
     │ 440     │   ← Focused input, select all
     └─────────┘
```

### Toggle Switch (Waveform Selector)

```
┌─────────┐
│ ● SIN   │ ← Selected (filled dot, highlighted)
│ ○ TRI   │ ← Unselected (empty dot)
│ ○ SQR   │
│ ○ SAW   │
└─────────┘
```

**Interaction:**
- Click option to select
- Keyboard: Arrow keys when focused

### On/Off Toggle

```
[ON ●───○ OFF]   ← ON state
[ON ○───● OFF]   ← OFF state
```

---

## VI. Interactions & Flows

### Creating a New Sound

1. Click `[+ NEW SOUND]` in sidebar
2. Dialog appears:
   ```
   ┌─────────────────────────────────────┐
   │                                     │
   │   NEW SOUND                         │
   │   ═════════                         │
   │                                     │
   │   Name: [________________]          │
   │                                     │
   │   Category: [CUSTOM        ▾]       │
   │                                     │
   │   Type: ● Simple  ○ Sequence        │
   │                                     │
   │              [CANCEL]  [CREATE]     │
   │                                     │
   └─────────────────────────────────────┘
   ```
3. Sound created with default parameters
4. Sound selected, ready to edit

### Converting Simple to Sequence

1. Select a simple sound
2. Click `[⋮]` → "Convert to Sequence"
3. Confirmation dialog:
   ```
   ┌─────────────────────────────────────────┐
   │                                         │
   │   CONVERT TO SEQUENCE                   │
   │   ═══════════════════                   │
   │                                         │
   │   Current sound will become Note 1.     │
   │   You can then add more notes.          │
   │                                         │
   │                [CANCEL]  [CONVERT]      │
   │                                         │
   └─────────────────────────────────────────┘
   ```
4. Tabs change to Sequence mode
5. Original parameters become Note 1

### Deleting a Sound

1. Click `[⋮]` → "Delete"
2. Confirmation:
   ```
   ┌─────────────────────────────────────┐
   │                                     │
   │   DELETE SOUND                      │
   │   ════════════                      │
   │                                     │
   │   Delete "click"?                   │
   │   This cannot be undone.            │
   │                                     │
   │              [CANCEL]  [DELETE]     │
   │                                     │
   └─────────────────────────────────────┘
   ```
3. Sound removed from category
4. Adjacent sound auto-selected

### Export Flow

**Copy as JSON:**
1. Click Export → "Copy as JSON"
2. Parameters copied to clipboard
3. Toast notification: "Copied to clipboard"

**Download WAV:**
1. Click Export → "Download WAV"
2. Sound rendered to buffer
3. WAV file downloaded: `sound-name.wav`

**Export All:**
1. Click Export → "Export All..."
2. Dialog:
   ```
   ┌─────────────────────────────────────┐
   │                                     │
   │   EXPORT ALL                        │
   │   ══════════                        │
   │                                     │
   │   Format:                           │
   │   ● JSON (all parameters)           │
   │   ○ ZIP (all WAV files)             │
   │                                     │
   │              [CANCEL]  [EXPORT]     │
   │                                     │
   └─────────────────────────────────────┘
   ```
3. File downloaded

---

## VII. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Stop current sound |
| `⌘ Z` | Undo |
| `⌘ ⇧ Z` | Redo |
| `⌘ S` | Save current sound |
| `⌘ D` | Duplicate current sound |
| `⌘ E` | Export (opens menu) |
| `1` | Switch to tab 1 (OSC A / SEQUENCE) |
| `2` | Switch to tab 2 (OSC B / ENVELOPE) |
| `3` | Switch to tab 3 (ENVELOPE / FILTER) |
| `4` | Switch to tab 4 (FILTER) |
| `R` | Randomize parameters |
| `A` | Toggle A/B compare |
| `↑ ↓` | Navigate sound list |
| `Enter` | Select sound / Confirm dialog |
| `Escape` | Close dialog / Deselect |

---

## VIII. Mobile Experience

**Breakpoint:** < 1024px width

**Behavior:**
- Show simplified view-only mode
- Message: "For the full experience, visit on desktop"
- Can browse sounds and play them
- Cannot edit parameters
- Shows sound info and waveform preview

```
┌─────────────────────────────────┐
│                                 │
│  WARM TERMINAL SOUND LAB        │
│  ═══════════════════════        │
│                                 │
│  ┌───────────────────────────┐  │
│  │    OSCILLOSCOPE           │  │
│  │    (shows waveform)       │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ▸ click                  │  │
│  │    soft mechanical key    │  │
│  │                    [▶]    │  │
│  └───────────────────────────┘  │
│                                 │
│  SOUNDS                         │
│  ┌────┬────┬────┬────┐          │
│  │clck│hovr│tab │err │          │
│  ├────┼────┼────┼────┤          │
│  │page│nav │open│... │          │
│  └────┴────┴────┴────┘          │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ⓘ For the full synthesis      │
│    experience, visit on         │
│    desktop.                     │
│                                 │
└─────────────────────────────────┘
```

---

## IX. Data Persistence

### localStorage Structure

```javascript
{
  "soundlab-sounds": {
    "click": {
      id: "click",
      name: "click",
      description: "soft mechanical key",
      category: "interactions",
      type: "simple",
      locked: false,
      modified: false,
      params: {
        oscA: { waveform: "square", freq: 800, ... },
        oscB: { enabled: false, ... },
        envelope: { attack: 10, decay: 50, ... },
        filter: { enabled: true, type: "lowpass", ... }
      }
    },
    // ... more sounds
  },
  "soundlab-preferences": {
    lastSelectedSound: "click",
    expandedCategories: ["interactions", "palette"],
  },
  "soundlab-history": {
    // undo/redo stack
  }
}
```

### Autosave

- Save to localStorage on every parameter change (debounced 500ms)
- Save preferences on category toggle, sound selection

---

## X. Technical Implementation Notes

### Web Audio Graph (Simple Sound)

```
OscillatorA ──┐
              ├──► GainA ──┐
OscillatorB ──┘            │
                           ├──► Filter ──► MasterGain ──► Destination
EnvelopeGain ──────────────┘
```

### Web Audio Graph (Sequence Sound)

```
Note1.Osc ──► Note1.Gain ──┐
Note2.Osc ──► Note2.Gain ──┼──► Filter ──► MasterGain ──► Destination
Note3.Osc ──► Note3.Gain ──┘
```

### Real-time Oscilloscope

```javascript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

masterGain.connect(analyser);
analyser.connect(audioContext.destination);

// In animation frame:
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteTimeDomainData(dataArray);
// Draw dataArray to canvas
```

### WAV Export

Use OfflineAudioContext to render sound to buffer, then encode as WAV:

```javascript
const offlineCtx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
// Build audio graph in offlineCtx
const buffer = await offlineCtx.startRendering();
// Convert buffer to WAV blob
```

---

## XI. File Structure

```
src/
├── pages/
│   └── sound-lab.astro
├── components/
│   └── sound-lab/
│       ├── SoundLab.tsx           # Main container
│       ├── SoundLab.module.css
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── SoundGrid.tsx
│       ├── Oscilloscope.tsx
│       ├── SoundInfo.tsx
│       ├── TabContainer.tsx
│       ├── tabs/
│       │   ├── OscillatorTab.tsx
│       │   ├── EnvelopeTab.tsx
│       │   ├── FilterTab.tsx
│       │   └── SequenceTab.tsx
│       ├── controls/
│       │   ├── Knob.tsx
│       │   ├── Knob.module.css
│       │   ├── WaveformSelector.tsx
│       │   ├── Toggle.tsx
│       │   └── LevelMeter.tsx
│       ├── dialogs/
│       │   ├── NewSoundDialog.tsx
│       │   ├── DeleteDialog.tsx
│       │   ├── ExportDialog.tsx
│       │   └── InfoDialog.tsx
│       ├── ActionBar.tsx
│       └── ShortcutsBar.tsx
├── lib/
│   └── sound-lab/
│       ├── engine.ts              # Web Audio synthesis
│       ├── presets.ts             # Default 14 sounds
│       ├── storage.ts             # localStorage handling
│       ├── export.ts              # JSON/WAV export
│       └── types.ts               # TypeScript types
└── hooks/
    └── sound-lab/
        ├── useSoundEngine.ts
        ├── useKnob.ts
        ├── useHistory.ts          # Undo/redo
        └── useKeyboardShortcuts.ts
```

---

## XII. Success Criteria

### Functional
- [ ] All 14 default sounds can be edited
- [ ] New sounds can be created and categorized
- [ ] Simple ↔ Sequence conversion works
- [ ] Real-time oscilloscope shows actual output
- [ ] Export to JSON and WAV works
- [ ] Undo/Redo works reliably
- [ ] A/B compare works
- [ ] Keyboard shortcuts work
- [ ] Autosave prevents data loss

### Visual
- [ ] Matches Warm Terminal aesthetic
- [ ] Knobs feel responsive and precise
- [ ] Curves update in real-time
- [ ] Level meter responds to audio
- [ ] Dithering texture applied appropriately
- [ ] Consistent spacing and typography

### Performance
- [ ] No audio glitches during parameter changes
- [ ] Smooth oscilloscope animation (60fps)
- [ ] Knob dragging is lag-free
- [ ] Page load under 2 seconds

### Portfolio Quality
- [ ] Info modal explains the project well
- [ ] First-time hints guide new users
- [ ] Mobile shows graceful fallback
- [ ] Shareable (works as standalone page)

---

*End of Sound Lab Design Document v1.0*