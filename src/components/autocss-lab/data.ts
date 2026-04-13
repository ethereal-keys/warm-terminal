import { GENERATED_AUTO_CSS_CASES } from './generatedCases';

export type AutoCssStageId = 'input' | 'binarized' | 'cleanup' | 'edges' | 'contours' | 'scaffold' | 'dom';
export type AutoCssCodeLanguage = 'html' | 'css' | 'python' | 'text';

export interface AutoCssTreeNode {
  id: string;
  bbox: { x: number; y: number; w: number; h: number };
  depth: number;
  children: AutoCssTreeNode[];
}

export interface AutoCssStageMeta {
  label: string;
  shortLabel: string;
  detail: string;
}

interface AutoCssPaletteTone {
  fill: string;
  line: string;
}

interface AutoCssPalette {
  page: string;
  surface: string;
  shadow: string;
  tones: AutoCssPaletteTone[];
}

interface AutoCssStageSnippet {
  title: string;
  language: AutoCssCodeLanguage;
  code: string;
}

type AutoCssScaffoldPattern =
  | 'none'
  | 'single'
  | 'double'
  | 'triple'
  | 'pill'
  | 'pair'
  | 'hero'
  | 'aside'
  | 'workspace';

interface AutoCssScaffoldBlock {
  className: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: number;
  pattern: AutoCssScaffoldPattern;
}

export interface AutoCssModernView {
  note: string;
  html: string;
}

export interface AutoCssCase {
  id: string;
  title: string;
  annotation: string;
  sourceName: string;
  dimensions: { width: number; height: number };
  stages: Record<'input' | 'binarized' | 'cleanup' | 'edges' | 'contours' | 'scaffold', string>;
  tree: AutoCssTreeNode[];
  treeAsset: string;
  treeLines: string[];
  domAsset: string;
  domText: string;
  contourCount: number;
  stageMeta: Record<AutoCssStageId, AutoCssStageMeta>;
  stageSnippets: Record<AutoCssStageId, AutoCssStageSnippet>;
  palette: AutoCssPalette;
  generatedHtml: string;
  generatedCss: string;
  modernView: AutoCssModernView;
}

const STAGE_META: Record<AutoCssStageId, AutoCssStageMeta> = {
  input: {
    label: '01 · input',
    shortLabel: 'input',
    detail: 'camera photo, glare and all',
  },
  binarized: {
    label: '02 · binarize',
    shortLabel: 'binarize',
    detail: 'adaptive threshold isolates the sketch',
  },
  cleanup: {
    label: '03 · cleanup',
    shortLabel: 'cleanup',
    detail: 'morphology thickens the signal',
  },
  edges: {
    label: '04 · edges',
    shortLabel: 'edges',
    detail: 'canny traces the ink lines',
  },
  contours: {
    label: '05 · contours',
    shortLabel: 'contours',
    detail: 'RETR_TREE builds the contour hierarchy',
  },
  scaffold: {
    label: '06 · boxes',
    shortLabel: 'boxes',
    detail: 'the tree is redrawn as raw rectangular bounds',
  },
  dom: {
    label: '07 · output',
    shortLabel: 'output',
    detail: 'the boxes become HTML and scaffold CSS',
  },
};

const STAGE_SNIPPETS: Record<AutoCssStageId, AutoCssStageSnippet> = {
  input: {
    title: 'load the archived sketch photo',
    language: 'python',
    code: `source_path = source_dir / case.source_name
gray = cv2.imread(str(source_path), cv2.IMREAD_GRAYSCALE)
if gray is None:
    raise FileNotFoundError(f"Could not read {source_path}")

input_color = cv2.imread(str(source_path), cv2.IMREAD_COLOR)`,
  },
  binarized: {
    title: 'adaptive threshold the sketch',
    language: 'python',
    code: `def adaptive_threshold(gray):
    blurred = cv2.medianBlur(gray, 5)
    return cv2.adaptiveThreshold(
        blurred,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        3,
    )`,
  },
  cleanup: {
    title: 'thicken the surviving lines',
    language: 'python',
    code: `def cleanup_mask(binary):
    kernel = np.ones((5, 5), np.uint8)
    return cv2.erode(binary, kernel, iterations=2)`,
  },
  edges: {
    title: 'trace edges across the cleaned mask',
    language: 'python',
    code: `def median_canny(channel, low=0.2, high=0.3):
    median = float(np.median(channel))
    return cv2.Canny(channel, int(low * median), int(high * median))

def detect_edges(cleanup):
    color = cv2.cvtColor(cleanup, cv2.COLOR_GRAY2BGR)
    blue, green, red = cv2.split(color)
    return median_canny(blue) | median_canny(green) | median_canny(red)`,
  },
  contours: {
    title: 'turn edges into a contour tree',
    language: 'python',
    code: `def find_contours(edges):
    found = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    if len(found) == 3:
        _, contours, hierarchy = found
    else:
        contours, hierarchy = found
    return contours, hierarchy[0]

contours, hierarchy = find_contours(edges)
root_indices = [idx for idx, item in enumerate(hierarchy) if int(item[3]) == -1]
raw_tree = [build_tree(idx, contours, hierarchy) for idx in root_indices]
deduped_tree = [dedupe_tree(node) for node in raw_tree]`,
  },
  scaffold: {
    title: 'redraw the hierarchy as plain box bounds',
    language: 'python',
    code: `def draw_scaffold(root_nodes, width, height):
    canvas = np.full((height, width, 3), 245, dtype=np.uint8)
    cv2.rectangle(canvas, (0, 0), (width - 1, height - 1), (214, 207, 196), 1)

    palette = [(191, 77, 40), (139, 154, 107), (122, 117, 109), (82, 90, 98)]

    def draw_node(node, depth):
        bbox = node["bbox"]
        color = palette[depth % len(palette)]
        cv2.rectangle(canvas, (bbox["x"], bbox["y"]), (bbox["x"] + bbox["w"], bbox["y"] + bbox["h"]), color, 2)
        for child in node["children"]:
            draw_node(child, depth + 1)

    for root in root_nodes:
        draw_node(root, 0)

    return canvas`,
  },
  dom: {
    title: 'emit a rough DOM and scaffold preview',
    language: 'python',
    code: `def dom_lines(node, indent=0):
    space = "  " * indent
    if not node["children"]:
        return [f"{space}<p>content</p>"]

    lines = [f"{space}<div>"]
    for child in node["children"]:
        lines.extend(dom_lines(child, indent + 1))
    lines.append(f"{space}</div>")
    return lines

deduped_tree = [prune_small_nodes(node) for node in deduped_tree]
deduped_tree = [node for node in deduped_tree if node is not None]

dom_chunks = []
for node in deduped_tree:
    dom_chunks.extend(dom_lines(node, 0))`,
  },
};

const CASE_META: Record<string, {
  title: string;
  annotation: string;
  palette: AutoCssPalette;
  scaffoldBlocks: AutoCssScaffoldBlock[];
  modernView: AutoCssModernView;
}> = {
  lay2: {
    title: 'dashboard',
    annotation: 'the notebook reads a shell, a side rail, and stacked content rows',
    palette: {
      page: '#FBF8F1',
      surface: '#FFFDFC',
      shadow: 'rgba(86, 76, 66, 0.08)',
      tones: [
        { fill: '#EEDCCF', line: '#C58E74' },
        { fill: '#DDE8DC', line: '#7F9C87' },
        { fill: '#E9E1C8', line: '#A88F5A' },
        { fill: '#DDE3EC', line: '#8194B0' },
      ],
    },
    scaffoldBlocks: [
      { className: 'dashboard-shell', x: 10.2, y: 11, w: 80, h: 76, tone: 3, pattern: 'none' },
      { className: 'dashboard-strip', x: 15.1, y: 15.3, w: 68, h: 15.2, tone: 1, pattern: 'single' },
      { className: 'dashboard-sidebar', x: 16.2, y: 34.3, w: 18.5, h: 44.8, tone: 1, pattern: 'none' },
      { className: 'dashboard-nav-one', x: 21.2, y: 41.2, w: 8.4, h: 8.8, tone: 2, pattern: 'pill' },
      { className: 'dashboard-nav-two', x: 22.1, y: 53.4, w: 8.1, h: 8.5, tone: 0, pattern: 'pill' },
      { className: 'dashboard-nav-three', x: 22.2, y: 67.1, w: 9.1, h: 9.2, tone: 2, pattern: 'pill' },
      { className: 'dashboard-panel-top', x: 39.4, y: 31.4, w: 39.2, h: 15.8, tone: 1, pattern: 'double' },
      { className: 'dashboard-panel-mid', x: 40.3, y: 51.5, w: 39.8, h: 15.4, tone: 0, pattern: 'double' },
      { className: 'dashboard-mini-stats', x: 40.9, y: 67.7, w: 14.5, h: 14.4, tone: 1, pattern: 'pair' },
      { className: 'dashboard-wide-stats', x: 57.5, y: 66.1, w: 23.8, h: 18.7, tone: 3, pattern: 'pair' },
    ],
    modernView: {
      note: 'A modern reread sees navigation, a side rail, and summary cards instead of anonymous rectangles.',
      html: `
        <section class="modernCase modernCase--dashboard">
          <header class="modernDashboardHero">
            <div>
              <span class="modernEyebrow">ops console</span>
              <h4>Everything important, in one quiet dashboard.</h4>
              <p>Navigation, status strips, and small metric cards emerge once the boxes are read semantically.</p>
            </div>
            <button>new report</button>
          </header>
          <div class="modernDashboardBody">
            <aside class="modernSidebar">
              <span>overview</span>
              <span>alerts</span>
              <span>deploys</span>
            </aside>
            <div class="modernDashboardMain">
              <div class="modernRibbon"></div>
              <div class="modernRibbon modernRibbon--muted"></div>
              <div class="modernStats">
                <article><strong>98.4%</strong><span>uptime</span></article>
                <article><strong>23</strong><span>events</span></article>
                <article><strong>7</strong><span>alerts</span></article>
              </div>
            </div>
          </div>
        </section>
      `,
    },
  },
  lay4: {
    title: 'split page',
    annotation: 'the simplest case: one dominant block and one smaller companion card',
    palette: {
      page: '#FCF7F0',
      surface: '#FFFCF8',
      shadow: 'rgba(86, 76, 66, 0.08)',
      tones: [
        { fill: '#F1D5C8', line: '#CB8369' },
        { fill: '#E6E0C9', line: '#A59261' },
        { fill: '#DBE7DF', line: '#7E9A88' },
        { fill: '#E1E3F0', line: '#8290B6' },
      ],
    },
    scaffoldBlocks: [
      { className: 'split-hero', x: 16.7, y: 23.9, w: 45.8, h: 56.2, tone: 0, pattern: 'hero' },
      { className: 'split-aside', x: 68.9, y: 32.3, w: 18.1, h: 25.6, tone: 2, pattern: 'aside' },
    ],
    modernView: {
      note: 'The same geometry becomes a hero panel with one tight action card once you read it semantically.',
      html: `
        <section class="modernCase modernCase--split">
          <div class="modernSplitHero">
            <span class="modernEyebrow">landing page</span>
            <h4>Ship tools your team actually wants to use.</h4>
            <p>One dominant message block, one compact side card, and a lot more implied structure than the contour tree can understand.</p>
            <button>book a walkthrough</button>
          </div>
          <aside class="modernSplitCard">
            <strong>next run</strong>
            <span>today · 4:30pm</span>
          </aside>
        </section>
      `,
    },
  },
  newlay: {
    title: 'floating cards',
    annotation: 'a looser arrangement that reads like separate cards on one canvas',
    palette: {
      page: '#F8F6EF',
      surface: '#FFFDF9',
      shadow: 'rgba(86, 76, 66, 0.08)',
      tones: [
        { fill: '#E4EADF', line: '#7C9884' },
        { fill: '#E8D9CD', line: '#C58A73' },
        { fill: '#E8E1C8', line: '#A6905B' },
        { fill: '#DCE3EE', line: '#7F92B4' },
      ],
    },
    scaffoldBlocks: [
      { className: 'cards-top-strip', x: 24.4, y: 10.5, w: 57.3, h: 13.4, tone: 1, pattern: 'single' },
      { className: 'cards-left', x: 15.8, y: 37.4, w: 22.5, h: 16.1, tone: 3, pattern: 'double' },
      { className: 'cards-center', x: 44.6, y: 35.4, w: 17.6, h: 25.1, tone: 0, pattern: 'workspace' },
      { className: 'cards-small', x: 65.5, y: 38.5, w: 13.6, h: 14.1, tone: 2, pattern: 'aside' },
      { className: 'cards-large', x: 64.8, y: 59.5, w: 22.1, h: 27.7, tone: 1, pattern: 'workspace' },
    ],
    modernView: {
      note: 'A modern system would probably preserve the looseness and treat this as a lightweight card workspace.',
      html: `
        <section class="modernCase modernCase--cards">
          <header class="modernCardsHeader">
            <span class="modernEyebrow">workspace</span>
            <h4>Loose cards, lightly pinned to one shared canvas.</h4>
          </header>
          <div class="modernTopBar"></div>
          <div class="modernWorkspace">
            <article class="modernTile modernTile--soft">
              <strong>notes</strong>
              <span>wireframes, to-dos, and quick ratios</span>
            </article>
            <article class="modernTile modernTile--center">
              <strong>drafts</strong>
              <span>larger composition ideas</span>
            </article>
            <article class="modernTile modernTile--small">
              <strong>queue</strong>
              <span>3 cards</span>
            </article>
            <article class="modernTile modernTile--large">
              <strong>canvas</strong>
              <span>the main working area keeps the looseness</span>
            </article>
          </div>
        </section>
      `,
    },
  },
};

function percent(value: number): string {
  return `${value.toFixed(2).replace(/\.00$/, '')}%`;
}

function fillMarkup(pattern: AutoCssScaffoldPattern, indent: number): string[] {
  const pad = '  '.repeat(indent);

  if (pattern === 'none') return [];

  if (pattern === 'single') {
    return [
      `${pad}<div class="scaffold-fill scaffold-fill--single">`,
      `${pad}  <span></span>`,
      `${pad}</div>`,
    ];
  }

  if (pattern === 'double') {
    return [
      `${pad}<div class="scaffold-fill scaffold-fill--double">`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}</div>`,
    ];
  }

  if (pattern === 'triple') {
    return [
      `${pad}<div class="scaffold-fill scaffold-fill--triple">`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}</div>`,
    ];
  }

  if (pattern === 'pill') {
    return [
      `${pad}<div class="scaffold-fill scaffold-fill--pill">`,
      `${pad}  <span></span>`,
      `${pad}</div>`,
    ];
  }

  if (pattern === 'pair') {
    return [
      `${pad}<div class="scaffold-fill scaffold-fill--pair">`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}</div>`,
    ];
  }

  if (pattern === 'hero') {
    return [
      `${pad}<div class="scaffold-fill scaffold-fill--hero">`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}</div>`,
    ];
  }

  if (pattern === 'aside') {
    return [
      `${pad}<div class="scaffold-fill scaffold-fill--aside">`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}  <span></span>`,
      `${pad}</div>`,
    ];
  }

  return [
    `${pad}<div class="scaffold-fill scaffold-fill--workspace">`,
    `${pad}  <span></span>`,
    `${pad}  <span></span>`,
    `${pad}  <span></span>`,
    `${pad}</div>`,
  ];
}

function blockMarkup(block: AutoCssScaffoldBlock, indent = 1): string {
  const pad = '  '.repeat(indent);
  const body = fillMarkup(block.pattern, indent + 1);

  return [
    `${pad}<section class="autocss-block ${block.className} pattern-${block.pattern}">`,
    ...body,
    `${pad}</section>`,
  ].join('\n');
}

function blockCss(block: AutoCssScaffoldBlock, palette: AutoCssPalette): string[] {
  const tone = palette.tones[block.tone % palette.tones.length];

  return [
    `.${block.className} {`,
    `  left: ${percent(block.x)};`,
    `  top: ${percent(block.y)};`,
    `  width: ${percent(block.w)};`,
    `  height: ${percent(block.h)};`,
    `  --block-fill: ${tone.fill};`,
    `  --block-line: ${tone.line};`,
    `}`,
  ];
}

function buildScaffoldOutput(
  caseId: string,
  dimensions: { width: number; height: number },
  palette: AutoCssPalette,
  blocks: AutoCssScaffoldBlock[],
) {
  const html = [
    `<div class="autocss-output autocss-output--${caseId}">`,
    ...blocks.map((block) => blockMarkup(block)),
    `</div>`,
  ].join('\n');

  const css = [
    `.autocss-output {`,
    `  position: relative;`,
    `  width: 100%;`,
    `  aspect-ratio: ${dimensions.width} / ${dimensions.height};`,
    `  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.82), transparent 34%), linear-gradient(180deg, ${palette.surface} 0%, ${palette.page} 100%);`,
    `  border: 1px solid rgba(197, 192, 184, 0.9);`,
    `  border-radius: 34px;`,
    `  overflow: hidden;`,
    `  box-shadow: 0 24px 45px ${palette.shadow};`,
    `}`,
    `.autocss-output::before {`,
    `  content: '';`,
    `  position: absolute;`,
    `  inset: 0 0 auto;`,
    `  height: clamp(34px, 7%, 52px);`,
    `  background: linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.14));`,
    `  border-bottom: 1px solid rgba(197, 192, 184, 0.42);`,
    `}`,
    `.autocss-output::after {`,
    `  content: '';`,
    `  position: absolute;`,
    `  top: clamp(12px, 2.2%, 18px);`,
    `  right: clamp(16px, 2.6%, 24px);`,
    `  width: clamp(16px, 2.4%, 22px);`,
    `  height: clamp(16px, 2.4%, 22px);`,
    `  border-radius: 999px;`,
    `  background: rgba(255, 255, 255, 0.52);`,
    `  box-shadow: -34px 0 0 rgba(255, 255, 255, 0.34), -68px 0 0 rgba(255, 255, 255, 0.24);`,
    `}`,
    `.autocss-output * {`,
    `  box-sizing: border-box;`,
    `}`,
    `.autocss-block {`,
    `  position: absolute;`,
    `  border-radius: clamp(16px, 2vw, 28px);`,
    `  border: 2px solid var(--block-line);`,
    `  background: linear-gradient(180deg, color-mix(in srgb, var(--block-fill) 82%, white), var(--block-fill));`,
    `  box-shadow: 0 14px 22px rgba(63, 58, 52, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.58);`,
    `  overflow: hidden;`,
    `}`,
    `.autocss-block::after {`,
    `  content: '';`,
    `  position: absolute;`,
    `  inset: 0;`,
    `  border-radius: inherit;`,
    `  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42);`,
    `  pointer-events: none;`,
    `}`,
    `.scaffold-fill {`,
    `  position: absolute;`,
    `  inset: clamp(10px, 2.2%, 22px);`,
    `  display: flex;`,
    `  gap: clamp(8px, 1.6%, 12px);`,
    `}`,
    `.scaffold-fill span {`,
    `  display: block;`,
    `  border-radius: 999px;`,
    `  background: color-mix(in srgb, var(--block-line) 12%, white);`,
    `}`,
    `.scaffold-fill--single,`,
    `.scaffold-fill--pill {`,
    `  align-items: center;`,
    `  justify-content: center;`,
    `}`,
    `.scaffold-fill--single span {`,
    `  width: 70%;`,
    `  height: 12px;`,
    `}`,
    `.scaffold-fill--double,`,
    `.scaffold-fill--triple,`,
    `.scaffold-fill--aside,`,
    `.scaffold-fill--workspace,`,
    `.scaffold-fill--hero {`,
    `  flex-direction: column;`,
    `  justify-content: center;`,
    `}`,
    `.scaffold-fill--double span:nth-child(1) { width: 74%; height: 12px; }`,
    `.scaffold-fill--double span:nth-child(2) { width: 88%; height: 12px; }`,
    `.scaffold-fill--triple span:nth-child(1) { width: 62%; height: 10px; }`,
    `.scaffold-fill--triple span:nth-child(2) { width: 88%; height: 12px; }`,
    `.scaffold-fill--triple span:nth-child(3) { width: 52%; height: 12px; }`,
    `.scaffold-fill--pill span {`,
    `  width: 58%;`,
    `  height: 18px;`,
    `  background: color-mix(in srgb, var(--block-line) 28%, white);`,
    `}`,
    `.scaffold-fill--pair {`,
    `  display: grid;`,
    `  grid-template-columns: repeat(2, minmax(0, 1fr));`,
    `  align-items: stretch;`,
    `}`,
    `.scaffold-fill--pair span {`,
    `  min-height: 100%;`,
    `  border-radius: 16px;`,
    `  background: linear-gradient(180deg, rgba(255, 255, 255, 0.66), color-mix(in srgb, var(--block-line) 18%, white));`,
    `}`,
    `.scaffold-fill--hero span:nth-child(1) { width: 26%; height: 10px; }`,
    `.scaffold-fill--hero span:nth-child(2) { width: 72%; height: 18px; }`,
    `.scaffold-fill--hero span:nth-child(3) { width: 88%; height: 12px; }`,
    `.scaffold-fill--hero span:nth-child(4) { width: 38%; height: 18px; background: color-mix(in srgb, var(--block-line) 28%, white); }`,
    `.scaffold-fill--aside span:nth-child(1) { width: 46%; height: 10px; }`,
    `.scaffold-fill--aside span:nth-child(2) { width: 72%; height: 14px; }`,
    `.scaffold-fill--aside span:nth-child(3) { width: 44%; height: 18px; background: color-mix(in srgb, var(--block-line) 24%, white); }`,
    `.scaffold-fill--workspace span:nth-child(1) { width: 34%; height: 10px; }`,
    `.scaffold-fill--workspace span:nth-child(2) { flex: 1; border-radius: 18px; }`,
    `.scaffold-fill--workspace span:nth-child(3) { width: 56%; height: 12px; }`,
    ...blocks.flatMap((block) => blockCss(block, palette)),
  ].join('\n');

  return { html, css };
}

export const AUTO_CSS_STAGE_ORDER: AutoCssStageId[] = [
  'input',
  'binarized',
  'cleanup',
  'edges',
  'contours',
  'scaffold',
  'dom',
];

export const AUTO_CSS_CASES: AutoCssCase[] = GENERATED_AUTO_CSS_CASES
  .filter((item) => item.id in CASE_META)
  .map((item) => {
    const meta = CASE_META[item.id];
    const generated = buildScaffoldOutput(item.id, item.dimensions, meta.palette, meta.scaffoldBlocks);

    return {
      ...item,
      ...meta,
      stageMeta: STAGE_META,
      stageSnippets: STAGE_SNIPPETS,
      generatedHtml: generated.html,
      generatedCss: generated.css,
    };
  });
