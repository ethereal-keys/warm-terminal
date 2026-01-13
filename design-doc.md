# Warm Terminal
## Portfolio Design Document for Sushanth Kashyap

*Version 1.0 — January 2025*

---

## 0. Philosophy

### The Core Tension

Terminal aesthetics (cold, precise, systematic) married to warmth (cream, texture, earthy tones). It says: *"I live in systems, but I'm not a machine."*

### Design Principles

1. **Creativity thrives under constraint.** Monospace grids, box-drawing characters, limited palette. Beauty emerges from discipline.

2. **Everything earns its place.** No decoration without purpose. Each element serves visually, functionally, or both.

3. **Calm and balanced, with dynamic elements.** The foundation is stillness. Animation is breath, not noise.

4. **A system to explore, not a document to read.** The portfolio is a place. Sound, interaction, and discovery make it feel inhabited.

5. **Charm first, impress second.** Visitors should feel something before they evaluate credentials.

---

## I. The Signature Mark

### The Concept: The Cassette

A minimal cassette icon—two reels (dots) inside a shell (rounded rectangle). This connects to:
- Music and analog warmth
- Recording and playback (portfolio as memory)
- The interval—the meaningful space between two points

### Mark Family

**Primary Mark (Full)**
```
╭─────╮
│ · · │
╰─────╯
```
Used in: Hero, favicon, footer, special moments

**Compact Mark (Inline)**
```
(· ·)
```
Used in: Sticky nav, tight spaces, inline references

**Signal Variant (Sound On)**
```
╭─────╮          
│ ∿∿∿ │    or    (∿∿∿)
╰─────╯          
```
Used in: Sound toggle when audio is enabled

### Animation Behaviors

**Breathing (Default)**
The two dots slowly drift closer, then apart. 4-6 second cycle. Smooth easing. Never stops.

```
Frame 1:   │ ·     · │     (apart)
Frame 2:   │  ·   ·  │     (closer)
Frame 3:   │   · ·   │     (closest)
Frame 4:   │  ·   ·  │     (drifting)
Frame 5:   │ ·     · │     (apart)
```

**Hover Response**
- Dots shift toward center (attentive)
- Border opacity +20%
- Subtle warmth shift toward rust accent
- Duration: 150ms ease-out

**Signal Animation (Sound On)**
Waves gently scroll or oscillate. Slow, ambient—not urgent.

---

## II. Color System

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#F5F2EB` | Page background |
| `--bg-secondary` | `#EBE8E1` | Cards, code blocks |
| `--bg-tertiary` | `#E0DCD3` | Borders, dividers |
| `--text-primary` | `#2B2926` | Headings, body |
| `--text-secondary` | `#5C5954` | Descriptions |
| `--text-tertiary` | `#8A8680` | Captions, meta |
| `--accent-primary` | `#BF4D28` | Links, CTAs, highlights |
| `--accent-secondary` | `#4A6B6B` | Rare secondary moments (TBD) |

### Texture

Subtle paper-like grain on background. Barely visible—felt more than seen.

```css
background-image: url("data:image/svg+xml,..."); /* noise texture */
background-blend-mode: overlay;
```

---

## III. Typography

### Font Stack

```css
--font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
```

Single typeface. Hierarchy through weight, size, spacing, and color.

### Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Hero name | 32px | 400 | text-primary |
| Section headers | 14px | 600 | text-primary |
| Nav items | 14px | 400 | text-secondary |
| Body text | 16px | 400 | text-primary |
| Card titles | 16px | 600 | text-primary |
| Card descriptions | 14px | 400 | text-secondary |
| Meta/captions | 14px | 400 | text-tertiary |
| Code | 15px | 400 | text-primary |

### Spacing

Base unit: 8px. All spacing derives from this.

```
--space-1: 8px
--space-2: 16px
--space-3: 24px
--space-4: 32px
--space-5: 48px
--space-6: 64px
--space-7: 96px
```

---

## IV. Navigation System

### Three States

**State 1: Hero (Full Welcome)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ╭─────╮                                                               │
│   │ · · │  sushanth kashyap                                             │
│   ╰─────╯  cloud · systems · creative                                   │
│                                                                         │
│            ./projects     ./writing     ./about     ./contact           │
│                └──                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- Full breathing mark
- Complete name + tagline
- Path-style navigation (`./`)
- Box-drawing location indicator

**State 2: Sticky (Scrolled)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  (· ·)  sk      ./projects   ./writing   ./about        sound (∿∿∿)    │
│                      ───                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

- Compact breathing mark
- Initials only
- Underline location indicator
- Sound toggle right-aligned

**State 3: Deep (Content Page)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  (· ·)  sk > projects > style-transfer              sound (∿∿∿)      ↑ │
└─────────────────────────────────────────────────────────────────────────┘
```

- Breadcrumb with `>` separator
- Up arrow to return
- No separate location indicator (breadcrumb IS location)

### Location Indicator Variants

**Hero (expressive):**
```
./projects     ./writing     ./about
    └──
```

**Sticky (minimal):**
```
./projects   ./writing   ./about
     ───
```

### Sound Toggle

Label before mark. Two states:

```
sound (∿∿∿)    ← on (waves animate)
sound (· ·)    ← off (dots still)
```

Click toggles. Waves "collapse" to dots or dots "expand" to waves.

### Transitions

- Hero → Sticky: Triggered on scroll past hero. Smooth morph.
- Sticky → Deep: Triggered on entering project/blog page.
- All transitions: 200-300ms ease-out.

---

## V. Box-Drawing System

### Character Set

```
Corners:     ┌ ┐ └ ┘
Edges:       ─ │
T-junctions: ├ ┤ ┬ ┴
Cross:       ┼
Rounded:     ╭ ╮ ╰ ╯
```

### Frame Pattern

```
┌─────────────────────────────────────────┐
│                                         │
│   Content here                          │
│                                         │
└─────────────────────────────────────────┘
```

### Usage Rules

- **Hero section:** Full frame
- **Project cards:** Full frame, highlights on hover
- **Navigation:** Full frame in hero, single-line frame when sticky
- **Code blocks:** Top/bottom borders only
- **Dividers:** Single `─` repeated

---

## VI. Components

### Hero Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ╭─────╮                                                               │
│   │ · · │  sushanth kashyap                                             │
│   ╰─────╯  cloud · systems · creative                                   │
│                                                                         │
│            > currently seeking opportunities_                           │
│            > prev: aruba networks / hpe (2 years)                       │
│            > edu: ms cs @ arizona state                                 │
│                                                                         │
│            [ view projects ]    [ download resume ]                     │
│                                                                         │
│            ./projects     ./writing     ./about     ./contact           │
│                └──                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- Blinking cursor after "opportunities"
- Prompt-style (`>`) for info lines
- Bracketed CTAs

### Project Cards

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Real-Time Style Transfer Plugin                                       │
│   ─────────────────────────────────                                     │
│                                                                         │
│   Godot engine plugin applying neural style transfer to viewport        │
│   textures. Includes training pipeline and C++ integration.             │
│                                                                         │
│   c++ · pytorch · godot                                     view →      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hover state:**
- Border color shifts from tertiary to primary
- Subtle lift (translateY: -2px)
- `view →` shifts right slightly

### Blog Post Cards

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   2025-01-08 · 8 min read                                               │
│                                                                         │
│   Building a Style Transfer Plugin for Godot                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Simpler than project cards. Date and reading time as meta.

### Buttons

**Primary:**
```css
background: var(--accent-primary);
color: var(--bg-primary);
padding: 10px 20px;
font-family: var(--font-mono);
border: none;
```

**Secondary:**
```css
background: transparent;
color: var(--text-primary);
padding: 10px 20px;
border: 1px solid var(--text-primary);
```

**Hover:** Invert colors.

### Links

```css
color: var(--accent-primary);
text-decoration: none;
```

**Hover:** Underline or slight color shift.

### Footer

```
────────────────────────────────────────────────────────────────────────────

                    [ github ]    [ linkedin ]    [ email ]

                           ╭─────╮
                           │ · · │
                           ╰─────╯

                        built with care · 2025

────────────────────────────────────────────────────────────────────────────
```

Centered. Full mark. Minimal.

---

## VII. Motion & Animation

### Principles

- **Ambient:** Always-moving elements (breathing mark) are slow and subtle
- **Responsive:** Interaction-triggered animations are quick (150-200ms)
- **Meaningful:** Every animation communicates something
- **Interruptible:** Nothing blocks user action

### Inventory

| Element | Animation | Trigger | Duration |
|---------|-----------|---------|----------|
| Signature mark | Breathing dots | Always | 4-6s cycle |
| Signature mark | Perk up | Hover | 150ms |
| Sound toggle | Wave ↔ dots | Click | 200ms |
| Hero cursor | Blink | Always | 600ms |
| Hero line | Draw left→right | Page load | 500ms |
| Nav transition | Morph | Scroll | 200ms |
| Card | Lift + border | Hover | 150ms |
| Links | Underline | Hover | 150ms |
| Page transition | Fade | Navigation | 200ms |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Breathing mark becomes static. Cursor stops blinking. Essential feedback preserved.

---

## VIII. Responsive Behavior

### Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| Mobile | < 640px | Single column, hamburger nav |
| Tablet | 640-1024px | Two-column grid |
| Desktop | > 1024px | Full experience |

### Mobile Navigation

```
┌───────────────────────────────────┐
│  (· ·)  sk           ☰   (∿∿∿)   │
└───────────────────────────────────┘
```

Hamburger opens full-screen menu:

```
┌───────────────────────────────────┐
│                              ✕    │
│                                   │
│         ./projects                │
│         ./writing                 │
│         ./about                   │
│         ./contact                 │
│                                   │
│         ╭─────╮                   │
│         │ · · │                   │
│         ╰─────╯                   │
│                                   │
└───────────────────────────────────┘
```

---

## IX. Content Voice

### Characteristics

- Clear and direct
- Technical vocabulary used naturally (not forced)
- Occasional warmth and personality
- No emoji (the aesthetic carries expression)
- Confident but not arrogant

### Examples

**Hero tagline:**
> cloud · systems · creative

**Project description:**
> Godot engine plugin applying neural style transfer to viewport textures. Includes training pipeline and C++ integration.

**About excerpt:**
> I'm a systems engineer who builds infrastructure that doesn't wake me up at 3am. Two years at Aruba Networks/HPE taught me that the best systems are invisible—they just work.

**Footer:**
> built with care · 2025

---

## X. Implementation Notes

### Tech Stack (Recommended)

- **Framework:** Next.js or Astro
- **Styling:** CSS custom properties + minimal utility classes
- **Animation:** CSS transitions + minimal JS for complex sequences
- **Sound:** Tone.js or Web Audio API
- **Fonts:** Self-hosted JetBrains Mono

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 1.5s |
| Time to Interactive | < 2.0s |
| Total page weight | < 500kb |

### Accessibility

- Semantic HTML
- ARIA labels for interactive elements
- Visible focus states
- Reduced motion support
- Color contrast: AA minimum (4.5:1)
- Sound off by default (user opt-in)

---

---

## XI. Project Page Template

### Structure: Tabbed Exploration

```
┌─────────────────────────────────────────────────────────────────────────┐
│  (· ·)  sk > projects > style-transfer              sound (∿∿∿)      ↑ │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Real-Time Style Transfer Plugin                                       │
│   ═══════════════════════════════                                       │
│                                                                         │
│   Godot engine plugin that applies neural style transfer to viewport    │
│   textures, enabling dynamic artistic rendering in real-time.           │
│                                                                         │
│   c++ · pytorch · godot · ml                        [ github ] [ demo ] │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ./overview     ./technical     ./demo     ./reflections               │
│       └──                                                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [Tab content here - scrollable within frame]                          │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────

   ← swe-bench agent                              xv6 kernel modules →     

────────────────────────────────────────────────────────────────────────────
```

### Tab Contents

**./overview**
- Brief problem statement
- Key outcomes/impact
- Visual preview (screenshot or demo embed)
- Quick tech stack summary

**./technical (long-scroll within tab)**
- The problem in depth
- The approach/architecture
- Key decisions and trade-offs
- Code snippets with syntax highlighting
- ASCII diagrams where possible
- Performance considerations

**./demo**
- Inline embed when possible
- Fallback: screenshots/GIFs with "launch demo →" link
- Interactive elements if applicable

**./reflections**
- What worked
- What didn't
- What I'd do differently
- Future directions
- Related resources/links

### ASCII Diagrams

Preferred for technical explanations:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Input Frame          Style Network           Output Frame             │
│   ┌─────────┐         ┌─────────────┐         ┌─────────┐              │
│   │         │         │   ┌─────┐   │         │         │              │
│   │  Game   │────────▶│   │ CNN │   │────────▶│ Styled  │              │
│   │ Render  │         │   └─────┘   │         │  Frame  │              │
│   │         │         │      │      │         │         │              │
│   └─────────┘         │   ┌─────┐   │         └─────────┘              │
│                       │   │Style│   │                                   │
│                       │   │Embed│   │                                   │
│                       │   └─────┘   │                                   │
│                       └─────────────┘                                   │
│                                                                         │
│   ◀──────────────── ~16ms target ────────────────▶                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

When ASCII isn't sufficient, use minimal SVG with:
- Monospace labels
- Box-drawing-style lines
- Warm palette colors
- No gradients or shadows

### Code Snippets

Warm syntax highlighting palette:

```css
--syntax-bg: #EBE8E1;
--syntax-text: #2B2926;
--syntax-keyword: #BF4D28;       /* rust accent */
--syntax-string: #5A7A5A;        /* muted green */
--syntax-function: #6B5A4A;      /* warm brown */
--syntax-comment: #8A8680;       /* tertiary gray */
--syntax-number: #7A5A6A;        /* muted purple */
--syntax-operator: #5C5954;      /* secondary gray */
```

```
┌── style_transfer.cpp ───────────────────────────────────────────────────┐
│                                                                         │
│   void StyleTransfer::apply(Texture* input, Texture* style) {          │
│       // Extract features from both textures                            │
│       auto content_features = extract_features(input);                  │
│       auto style_features = extract_features(style);                    │
│                                                                         │
│       // Blend features using adaptive instance normalization           │
│       auto blended = adain(content_features, style_features);           │
│                                                                         │
│       // Decode back to image space                                     │
│       return decode(blended);                                           │
│   }                                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Project Navigation

At bottom of every project page:

```
────────────────────────────────────────────────────────────────────────────

   ← swe-bench agent                              xv6 kernel modules →     

────────────────────────────────────────────────────────────────────────────
```

Hover: project title shifts slightly in arrow direction.

---

## XII. Blog Post Template

### Structure: Editorial Within Terminal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  (· ·)  sk > writing > style-transfer-plugin        sound (∿∿∿)      ↑ │
├────────────────────────────────────────────────────────────────═══════──┤
│                                                        ▓░░░░░░░░░░░ 12% │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Building a Style Transfer Plugin for Godot                            │
│   ══════════════════════════════════════════                            │
│                                                                         │
│   January 8, 2025 · 8 min read · c++, godot, ml                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│       When I first started exploring neural style transfer, I           │
│       didn't expect to end up mass deep in Godot's rendering            │
│       pipeline. But here we are.                                        │
│                                                                         │
│       The goal was simple: make a game look like a painting in          │
│       real-time. The execution was anything but.                        │
│                                                                         │
│                                                                         │
│       the first attempt                                                 │
│       ─────────────────                                                 │
│                                                                         │
│       I started where anyone would: the original Gatys et al.           │
│       paper¹. The results were beautiful. The performance was           │
│       not.                                                              │
│                                                                         │
│       ┌── python ───────────────────────────────────────────────┐       │
│       │                                                         │       │
│       │   def style_transfer(content, style, iterations=500):   │       │
│       │       # This took 45 seconds per frame                  │       │
│       │       for i in range(iterations):                       │       │
│       │           optimize_step(content, style)                 │       │
│       │       return content                                    │       │
│       │                                                         │       │
│       └─────────────────────────────────────────────────────────┘       │
│                                                                         │
│       45 seconds. Per frame. For a game targeting 60fps, I needed       │
│       to be roughly 2,700 times faster.                                 │
│                                                                         │
│                                                                         │
│       │                                                                 │
│       │  "The best optimization is the one you don't have to do."       │
│       │                                                                 │
│       │   This kept echoing in my head as I stared at the               │
│       │   profiler output.                                              │
│       │                                                                 │
│                                                                         │
│                                                                         │
│       ┌─────────────────────────────────────────────────────────┐       │
│       │                                                         │       │
│       │           Original          Feed-Forward                │       │
│       │          ┌───────┐          ┌───────┐                   │       │
│       │          │iterate│          │single │                   │       │
│       │          │ 500x  │    vs    │ pass  │                   │       │
│       │          └───────┘          └───────┘                   │       │
│       │            45s               0.016s                     │       │
│       │                                                         │       │
│       └─────────────────────────────────────────────────────────┘       │
│                                                                         │
│       [Content continues...]                                            │
│                                                                         │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                         │
│   ¹ Gatys, Ecker, Bethge. "A Neural Algorithm of Artistic Style."       │
│     2015. The paper that started it all.                                │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────

   related                                                                  
   ───────                                                                  

   ./kubernetes-lessons    ./godot-shaders    ./neural-networks-intro       

────────────────────────────────────────────────────────────────────────────
```

### Reading Progress Indicator

Subtle bar in sticky nav:

```
├────────────────────────────────────────────────────────────────═══════──┤
│                                                        ▓░░░░░░░░░░░ 12% │
```

- `▓` = progress filled
- `░` = progress remaining
- Percentage on right
- Updates on scroll
- Disappears on non-blog pages

### Typography for Reading Comfort

Blog body text can use a proportional font for improved readability:

```css
--font-blog: 'Source Serif 4', 'Georgia', serif;
--font-blog-size: 18px;
--font-blog-line-height: 1.7;
--font-blog-measure: 65ch; /* optimal reading width */
```

Code blocks, headers, and frame elements remain monospace.

This creates contrast:
- Frame = terminal (monospace, the container)
- Content = editorial (serif, the story)
- Code = technical (monospace, the truth)

### Footnotes

Inline reference: `paper¹`

Footnote section at bottom of post:

```
│   ─────────────────────────────────────────────────────────────────     │
│                                                                         │
│   ¹ Gatys, Ecker, Bethge. "A Neural Algorithm of Artistic Style."       │
│     2015. The paper that started it all.                                │
│                                                                         │
│   ² Johnson et al. "Perceptual Losses for Real-Time Style Transfer."    │
│     2016. The feed-forward breakthrough.                                │
```

### Sidenotes (Alternative to Footnotes)

For shorter asides, sidenotes can appear in the margin:

```
│       The goal was simple: make a      │  ┌─────────────────────┐  │
│       game look like a painting in     │  │ sidenote: this is   │  │
│       real-time.                       │  │ harder than it      │  │
│                                        │  │ sounds              │  │
│                                        │  └─────────────────────┘  │
```

Only on desktop. Mobile: sidenotes become inline parentheticals or footnotes.

### Blockquotes

```
│       │                                                                 │
│       │  "The best optimization is the one you don't have to do."       │
│       │                                                                 │
```

Single `│` left border. Indented. Optional attribution below.

### Images/Diagrams

Always framed:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        [image or diagram here]                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│   Figure 1: Style transfer applied to a game scene                      │
└─────────────────────────────────────────────────────────────────────────┘
```

Caption in secondary text color, below the image within the frame.

---

## XIII. Command Palette

### Overview

Press `⌘K` (Mac) or `Ctrl+K` (Windows) or `/` to open.

Mentioned in:
- Footer: "tip: press / to navigate"
- First visit: subtle toast notification

### Visual Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   where would you like to go?                                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ > _                                                             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   navigation                                                            │
│   ──────────                                                            │
│   ·  ./projects               see what i've built                       │
│   ·  ./writing                thoughts and tutorials                    │
│   ·  ./about                  the person behind the code                │
│   ·  ./contact                say hello                                 │
│                                                                         │
│   recent                                                                │
│   ──────                                                                │
│   ·  style-transfer           last viewed 2 days ago                    │
│   ·  kubernetes post          last viewed 1 week ago                    │
│                                                                         │
│   commands                                                              │
│   ────────                                                              │
│   ·  /sound [on|off]          toggle sound                              │
│   ·  /settings                open settings                             │
│   ·  /help                    show all commands                         │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────   │
│                                                                         │
│   search pages and tags · esc to close · ⌘K to open                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Interaction

**Typing filters results in real-time:**

```
│   │ > godot_                                                        │   │

│   results                                                               │
│   ───────                                                               │
│   ·  style-transfer           tagged: godot, c++, ml                    │
│   ·  godot-shaders            tagged: godot, graphics                   │
│   ·  "Getting Started with Godot"   blog post                           │
```

**Keyboard navigation:**
- `↑` `↓` to move between results
- `Enter` to select
- `Esc` to close
- `/` to focus search input

**Selection highlight:**

```
│   ·  ./projects               see what i've built                       │
│   ● ./writing                 thoughts and tutorials    ← selected      │
│   ·  ./about                  the person behind the code                │
```

`●` instead of `·` for selected item. Or subtle background highlight.

### Commands

| Command | Action |
|---------|--------|
| `/sound on` | Enable sound |
| `/sound off` | Disable sound |
| `/settings` | Open settings overlay |
| `/help` | Show all commands |
| `/current` | What I'm currently working on |
| `/hello` | Easter egg: a friendly message |
| `/credits` | Easter egg: who made this |
| `/b` | Easter egg: a secret (find out what it does!) |

### Search

Searches across:
- Page titles
- Tags
- Project names
- Blog post titles

Does NOT search full content (too heavy). Tags are the primary discovery mechanism.

### Sound

- **Open:** Two notes ascending (soft chime)
- **Close:** Same notes descending
- **Navigate results:** Subtle tick
- **Select:** Satisfying click + tonal confirmation
- **Error (no results):** Low muted tone

---

## XIV. Sound Design

### Philosophy

Sound makes the portfolio a place, not a page. It should be:
- **Ambient:** Felt as much as heard
- **Layered:** Sounds blend, don't clash
- **Meaningful:** Every sound maps to an action
- **Optional:** Clear off switch, respects user preference

### Sound on by Default

Controversial, but intentional. This is a portfolio—first impressions matter. The sound is part of the experience. The toggle is immediately visible and accessible.

### Sound Inventory

| Interaction | Sound Name | Character | Duration |
|-------------|------------|-----------|----------|
| Click/tap | `click` | Soft mechanical key | ~50ms |
| Hover (interactive) | `hover` | Quiet tonal ping | ~30ms |
| Page transition | `transition` | Low warm tone + step | ~200ms |
| Nav state change | `nav-shift` | Subtle whoosh | ~150ms |
| Command palette open | `palette-open` | Two notes ascending | ~300ms |
| Command palette close | `palette-close` | Two notes descending | ~300ms |
| Palette navigate | `palette-nav` | Soft tick | ~30ms |
| Palette select | `palette-select` | Click + tonal confirm | ~100ms |
| Sound toggle on | `sound-on` | Warm tone awakening | ~400ms |
| Sound toggle off | `sound-off` | Gentle fade/sigh | ~400ms |
| Tab switch | `tab` | Light click | ~50ms |
| Error/invalid | `error` | Low muted tone | ~200ms |
| Easter egg found | `easter-egg` | Melodic phrase | ~800ms |
| Mark hover | `mark-hover` | Tiny bright ping | ~50ms |
| Scroll section | `section` | Very subtle shift | ~100ms |

### Layering Behavior

When sounds overlap:
1. Previous sound ducks (volume reduces ~40%)
2. New sound plays at full volume
3. Previous sound fades out naturally

This prevents:
- Harsh cutoffs
- Volume spikes from stacking
- Cacophony from rapid interactions

### Tonal Palette

**Root:** D major (warm, accessible)
**Scale:** Pentatonic (D, E, F#, A, B) — can't clash

| Sound Type | Notes Used |
|------------|------------|
| Positive (select, success) | D, A (root + fifth) |
| Neutral (navigate, hover) | E, F# (gentle steps) |
| Negative (error, close) | B, lower D (resolution down) |
| Delight (easter egg) | Full phrase: D-F#-A-B-A |

### Settings Overlay

Accessible via command palette (`/settings`) or a settings icon (if we add one).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   settings                                                              │
│   ════════                                                              │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                 │   │
│   │   sound                                                         │   │
│   │   ─────                                                         │   │
│   │                                                                 │   │
│   │   master volume                                                 │   │
│   │   ├────────────────●─────┤  70%                                 │   │
│   │                                                                 │   │
│   │   interactions     ▓▓▓▓▓▓▓▓░░  80%                              │   │
│   │   transitions      ▓▓▓▓▓▓░░░░  60%                              │   │
│   │   ambient          ▓▓▓▓▓▓▓▓▓░  90%                              │   │
│   │                                                                 │   │
│   │   [ test sounds ]                                               │   │
│   │                                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────   │
│                                                                         │
│   esc to close                                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Appears as overlay with subtle animation (fade in + slight scale up from 95% to 100%).

The sliders use ASCII art for the aesthetic:
- `▓` = filled
- `░` = empty
- `●` = handle position

---

## XV. Easter Eggs

### Philosophy

Easter eggs reward curiosity. They should:
- Feel discovered, not advertised
- Bring genuine delight
- Not be necessary for functionality
- Create shareable moments ("did you know if you...")

### Implemented Easter Eggs

**1. Click the Signature Mark 7 Times**

After 7 clicks on the breathing mark:
- The mark does a little "happy wiggle"
- A tiny tooltip appears: "hi there :)"
- Sound: the easter egg melodic phrase
- Resets after a few seconds

**2. Hidden Page: ./hello**

Navigating to `/hello` or `./hello` reveals:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   you found it.                                                         │
│   ═════════════                                                         │
│                                                                         │
│   thanks for exploring. it means a lot.                                 │
│                                                                         │
│   since you're here, a few things:                                      │
│                                                                         │
│   · this portfolio was built with care over many conversations          │
│   · the breathing dots? they're meant to feel alive                     │
│   · the sound design took longer than the layout                        │
│   · there might be other secrets. keep looking.                         │
│                                                                         │
│   now go build something beautiful.                                     │
│                                                                         │
│                           ╭─────╮                                       │
│                           │ · · │                                       │
│                           ╰─────╯                                       │
│                                                                         │
│   [ back to home ]                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**3. Command Palette: "hello"**

Typing "hello" or "hi" in the command palette:

```
│   results                                                               │
│   ───────                                                               │
│   ·  hello!                   hey, thanks for saying hi :)              │
│                               here's a secret: try ./hello              │
```

**4. Command Palette: Hidden Commands**

| Command | Response |
|---------|----------|
| `/hello` | "hey! thanks for reaching out into the void." |
| `/credits` | "designed & built by sushanth kashyap, with a lot of care." |
| `/b` | A surprise animation or sound (decide during build) |
| `/current` | Shows what you're currently working on/reading/listening to |

**5. Wait 5 Minutes**

If someone stays on any page for 5+ minutes without interaction:
- A tiny message fades in near the footer: "still here? me too. thanks for staying."
- Fades out after 10 seconds
- Only happens once per session

### Not Implemented (Considered but Cut)

- Konami code: Too expected
- Dev console commands: Too niche
- Date-based themes: Maintenance burden
- Scroll past footer: Might feel buggy

---

## XVI. Responsive & Accessibility

### Mobile Navigation

Hamburger opens full-screen menu:

```
┌───────────────────────────────────┐
│  (· ·)  sk           ☰   (∿∿∿)   │
└───────────────────────────────────┘

        ↓ tap hamburger ↓

┌───────────────────────────────────┐
│                              ✕    │
│                                   │
│         ╭─────╮                   │
│         │ · · │                   │
│         ╰─────╯                   │
│                                   │
│         ./projects                │
│             └──                   │
│         ./writing                 │
│         ./about                   │
│         ./contact                 │
│                                   │
│         ───────────────           │
│                                   │
│         sound (∿∿∿)               │
│                                   │
│         ───────────────           │
│                                   │
│         tip: press / to search    │
│                                   │
└───────────────────────────────────┘
```

### Accessibility Checklist

- [ ] Semantic HTML (header, nav, main, article, footer)
- [ ] ARIA labels for interactive elements
- [ ] Skip-to-content link (visually hidden)
- [ ] Focus states visible (rust accent outline)
- [ ] Keyboard navigable (tab order logical)
- [ ] Color contrast AA minimum (4.5:1)
- [ ] Reduced motion support
- [ ] Sound off option prominently available
- [ ] Alt text for all images
- [ ] Responsive down to 320px width

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Mark stops breathing, shows static dots */
  .signature-mark .dot {
    animation: none;
  }
  
  /* Cursor stops blinking */
  .cursor {
    animation: none;
    opacity: 1;
  }
}
```

---

## XVII. Technical Implementation

### Recommended Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Next.js or Astro | SSG, good DX, easy routing |
| Styling | CSS Modules + Custom Properties | Scoped styles, design tokens |
| Animation | CSS + Framer Motion | CSS for simple, FM for complex |
| Sound | Howler.js or Tone.js | Reliable, good layering support |
| Fonts | Self-hosted JetBrains Mono + Source Serif 4 | Performance, reliability |
| Hosting | Vercel or Netlify | Easy, fast, free tier |

### File Structure

```
src/
├── components/
│   ├── SignatureMark/
│   │   ├── SignatureMark.tsx
│   │   ├── SignatureMark.module.css
│   │   └── animations.ts
│   ├── Navigation/
│   ├── CommandPalette/
│   ├── SoundToggle/
│   ├── ProjectCard/
│   ├── BlogPost/
│   └── ...
├── pages/
│   ├── index.tsx
│   ├── projects/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   ├── writing/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   ├── about.tsx
│   ├── contact.tsx
│   └── hello.tsx          ← easter egg page
├── hooks/
│   ├── useSound.ts
│   ├── useCommandPalette.ts
│   └── useScrollProgress.ts
├── lib/
│   ├── sounds.ts
│   └── content.ts
├── styles/
│   ├── globals.css
│   ├── tokens.css
│   └── typography.css
└── content/
    ├── projects/
    └── posts/
```

### Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| FCP | < 1.0s | SSG, font preload |
| LCP | < 1.5s | Optimize images, lazy load |
| TTI | < 2.0s | Minimal JS, code split |
| CLS | < 0.1 | Reserve space for async content |
| Bundle | < 100kb JS | Tree shake, lazy load sounds |

### Sound Loading Strategy

1. **Initial load:** No sounds (0kb)
2. **After page interactive:** Preload critical sounds (click, hover) ~50kb
3. **On demand:** Load other sounds as needed

```typescript
// Lazy load sound module
const loadSounds = async () => {
  const { initSounds } = await import('@/lib/sounds');
  await initSounds();
};

// Call after hydration
useEffect(() => {
  if (soundEnabled) {
    loadSounds();
  }
}, [soundEnabled]);
```

---

## XVIII. Content Requirements

### Homepage

- [ ] Hero with signature mark, name, tagline
- [ ] 3-4 featured projects (cards)
- [ ] 2-3 recent blog posts
- [ ] Brief about section
- [ ] Footer with links and mark

### Projects (each needs)

- [ ] Title and one-line description
- [ ] Tags (3-5)
- [ ] Overview content (2-3 paragraphs)
- [ ] Technical content (as deep as desired)
- [ ] Demo embed or screenshots
- [ ] Reflections (optional but recommended)
- [ ] GitHub link (if public)

### Blog Posts (each needs)

- [ ] Title
- [ ] Date
- [ ] Tags (2-4)
- [ ] Estimated reading time (auto-calculated)
- [ ] Content in markdown
- [ ] Code snippets (if technical)
- [ ] Related posts (2-3)

### About Page

- [ ] Professional summary
- [ ] Current status (seeking opportunities)
- [ ] Work history highlights
- [ ] Education
- [ ] Personal interests (brief)
- [ ] Contact CTA

---

*End of Design Document v1.0*

---

## Appendix A: ASCII Art Reference

### Box Drawing Characters

```
Light:     ─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼
Rounded:   ╭ ╮ ╰ ╯
Heavy:     ━ ┃ ┏ ┓ ┗ ┛
Double:    ═ ║ ╔ ╗ ╚ ╝
Mixed:     ╒ ╓ ╘ ╙ ╞ ╟ ╤ ╥ ╧ ╨
```

### Progress/Loading

```
Empty:     ░░░░░░░░░░
Filled:    ▓▓▓▓▓▓▓▓▓▓
Mixed:     ▓▓▓▓▓░░░░░
```

### Bullets/Markers

```
Standard:  ·
Selected:  ●
Arrow:     ›  ▶  →
Check:     ✓
```

### Signature Mark ASCII

```
Full:
╭─────╮
│ · · │
╰─────╯

Compact:
(· ·)

Signal:
╭─────╮
│ ∿∿∿ │
╰─────╯

Signal Compact:
(∿∿∿)
```

---

## Appendix B: Color Reference

```css
:root {
  /* Backgrounds */
  --bg-primary: #F5F2EB;
  --bg-secondary: #EBE8E1;
  --bg-tertiary: #E0DCD3;
  
  /* Text */
  --text-primary: #2B2926;
  --text-secondary: #5C5954;
  --text-tertiary: #8A8680;
  
  /* Accent */
  --accent-primary: #BF4D28;
  --accent-secondary: #4A6B6B;
  
  /* Syntax */
  --syntax-keyword: #BF4D28;
  --syntax-string: #5A7A5A;
  --syntax-function: #6B5A4A;
  --syntax-comment: #8A8680;
  --syntax-number: #7A5A6A;
}
```

---

## Appendix C: Sound File Naming

```
sounds/
├── interactions/
│   ├── click.mp3
│   ├── hover.mp3
│   ├── tab.mp3
│   └── error.mp3
├── transitions/
│   ├── page.mp3
│   ├── nav-shift.mp3
│   └── section.mp3
├── palette/
│   ├── open.mp3
│   ├── close.mp3
│   ├── navigate.mp3
│   └── select.mp3
├── toggle/
│   ├── sound-on.mp3
│   └── sound-off.mp3
└── special/
    ├── easter-egg.mp3
    └── mark-hover.mp3
```