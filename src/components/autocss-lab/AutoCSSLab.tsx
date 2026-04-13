import React, { useEffect, useState } from 'react';
import styles from './AutoCSSLab.module.css';
import { AUTO_CSS_CASES, AUTO_CSS_STAGE_ORDER } from './data';
import { soundSystem } from '@/lib/sounds';
import CodePanel from './CodePanel';

const LAST_STAGE_INDEX = AUTO_CSS_STAGE_ORDER.length - 1;
type DetailTabId = 'stage' | 'html' | 'css' | 'reread' | 'tree';

export default function AutoCSSLab() {
  const [caseId, setCaseId] = useState(AUTO_CSS_CASES[0]?.id ?? 'lay2');
  const [stageIndex, setStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTabId>('stage');

  const currentCase = AUTO_CSS_CASES.find((item) => item.id === caseId) ?? AUTO_CSS_CASES[0];
  const stage = AUTO_CSS_STAGE_ORDER[stageIndex];

  useEffect(() => {
    soundSystem.suppressPlayback(true);
    return () => soundSystem.suppressPlayback(false);
  }, []);

  function selectCase(nextCaseId: string, nextStageIndex = 0, started = false) {
    setCaseId(nextCaseId);
    setStageIndex(nextStageIndex);
    setIsPlaying(false);
    setHasStarted(started);
    setDetailTab(nextStageIndex === LAST_STAGE_INDEX ? 'html' : 'stage');
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sample = params.get('sample');
    const stageParam = params.get('stage');

    const sampleExists = sample && AUTO_CSS_CASES.some((item) => item.id === sample);
    const nextCaseId = sampleExists ? sample : caseId;

    if (!stageParam) {
      if (sampleExists && sample !== caseId) {
        selectCase(nextCaseId);
      }
      return;
    }

    const resolvedStageIndex = AUTO_CSS_STAGE_ORDER.findIndex((item) => item === stageParam);
    if (resolvedStageIndex === -1) {
      if (sampleExists && sample !== caseId) {
        selectCase(nextCaseId);
      }
      return;
    }

    selectCase(
      nextCaseId,
      resolvedStageIndex,
      true,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    if (stageIndex >= LAST_STAGE_INDEX) {
      setIsPlaying(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setStageIndex((current) => Math.min(current + 1, LAST_STAGE_INDEX));
    }, stageIndex === LAST_STAGE_INDEX - 1 ? 1150 : 820);

    return () => window.clearTimeout(timeout);
  }, [isPlaying, stageIndex]);

  useEffect(() => {
    if (stageIndex === LAST_STAGE_INDEX && detailTab === 'stage') {
      setDetailTab('html');
    }
  }, [detailTab, stageIndex]);

  if (!currentCase) return null;

  const stageMeta = currentCase.stageMeta[stage];
  function startPlayback() {
    setHasStarted(true);
    setDetailTab('stage');
    setStageIndex(0);
    setIsPlaying(true);
  }

  function handlePrimaryAction() {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (stageIndex === LAST_STAGE_INDEX && hasStarted) {
      startPlayback();
      return;
    }

    setHasStarted(true);
    setIsPlaying(true);
  }

  function jumpToOutput() {
    setHasStarted(true);
    setIsPlaying(false);
    setDetailTab('html');
    setStageIndex(LAST_STAGE_INDEX);
  }

  function jumpToStart() {
    setHasStarted(true);
    setIsPlaying(false);
    setDetailTab('stage');
    setStageIndex(0);
  }

  function handleStageSelect(index: number) {
    setHasStarted(true);
    setIsPlaying(false);
    if (index === LAST_STAGE_INDEX && detailTab === 'stage') {
      setDetailTab('html');
    }
    setStageIndex(index);
  }

  const primaryLabel = isPlaying
    ? 'pause'
    : stageIndex === LAST_STAGE_INDEX && hasStarted
      ? 'replay'
      : 'watch transformation';

  const detailTabs: { id: DetailTabId; label: string }[] = [
    { id: 'stage', label: 'process code' },
    { id: 'html', label: 'html' },
    { id: 'css', label: 'css' },
    { id: 'reread', label: '2026 reread' },
    { id: 'tree', label: 'debug tree' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.paper}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>AutoCSS</h1>
              <span className={styles.demoTag}>demo</span>
            </div>
            <p className={styles.subtitle}>
              <span className={styles.subtitleLead}>A 2018 computer-vision prototype</span>
              {' '}for translating{' '}
              <span className={styles.subtitleAccent}>hand-drawn website sketches</span>
              {' '}into rough{' '}
              <span className={styles.subtitleAccent}>HTML/CSS scaffolds</span>.
            </p>
          </div>
          <a href="/projects/autocss" className={styles.backLink}>
            <span className={styles.backIcon}>←</span>
            <span>back to write-up</span>
          </a>
        </header>

        <section className={styles.sampleSection}>
          <div className={styles.sampleIntro}>
            <span className={styles.sampleEyebrow}>example sketches</span>
          </div>

          <div className={styles.sampleRail}>
          {AUTO_CSS_CASES.map((item, index) => (
            <button
              key={item.id}
              className={`${styles.sampleCard} ${item.id === currentCase.id ? styles.sampleCardActive : ''}`}
              onClick={() => selectCase(item.id)}
            >
              <div className={styles.sampleThumbWrap}>
                <img
                  src={item.stages.input}
                  alt={`${item.title} sketch`}
                  className={styles.sampleThumb}
                />
              </div>
              <div className={styles.sampleMeta}>
                <span className={styles.sampleKicker}>example 0{index + 1}</span>
                <span className={styles.sampleTitle}>{item.title}</span>
              </div>
            </button>
          ))}
          </div>
        </section>

        <section className={styles.viewerCard}>
          <div className={styles.viewerTop}>
            <div className={styles.viewerIdentity}>
              <span className={styles.viewerName}>{currentCase.title}</span>
            </div>

            <div className={styles.viewerActions}>
              <button className={styles.primaryAction} onClick={handlePrimaryAction}>
                {isPlaying ? '❚❚' : '▶'} {primaryLabel}
              </button>
              <button
                className={styles.secondaryAction}
                onClick={stageIndex === LAST_STAGE_INDEX ? jumpToStart : jumpToOutput}
              >
                {stageIndex === LAST_STAGE_INDEX ? 'back to frame 1' : 'show end state'}
              </button>
            </div>
          </div>

          <div className={`${styles.stageShell} ${stage === 'dom' ? styles.stageShellDom : ''}`}>
            <div className={styles.stageMeta}>
              <span className={styles.stageLabel}>{stageMeta.label}</span>
              <span className={styles.stageDetail}>{currentCase.sourceName}</span>
            </div>

            {!hasStarted && (
              <div className={styles.launchOverlay}>
                <button className={styles.launchCard} onClick={startPlayback}>
                  <span className={styles.launchEyebrow}>autocss</span>
                  <strong>watch the sketch become a scaffold</strong>
                  <span className={styles.launchHint}>seven notebook frames, then the scaffold takes over</span>
                </button>
              </div>
            )}

            {stage === 'dom' ? (
              <div className={styles.previewStage}>
                <div className={styles.previewBadge}>generated scaffold preview</div>
                <style>{currentCase.generatedCss}</style>
                <div
                  className={styles.previewMount}
                  dangerouslySetInnerHTML={{ __html: currentCase.generatedHtml }}
                />
              </div>
            ) : (
              <div className={styles.imageStage}>
                <img
                  key={`${currentCase.id}-${stage}`}
                  src={currentCase.stages[stage]}
                  alt={`${currentCase.title} ${stage} stage`}
                  className={styles.stageImage}
                />
              </div>
            )}
          </div>

          <nav className={styles.timeline} aria-label="Pipeline stages">
            {AUTO_CSS_STAGE_ORDER.map((stageId, index) => (
              <button
                key={stageId}
                className={`${styles.timelineStep} ${index === stageIndex ? styles.timelineStepActive : ''}`}
                onClick={() => handleStageSelect(index)}
              >
                <span className={styles.timelineIndex}>0{index + 1}</span>
                <span className={styles.timelineLabel}>{currentCase.stageMeta[stageId].shortLabel}</span>
              </button>
            ))}
          </nav>
        </section>

        <section className={styles.inspectSection}>
          <div className={styles.inspectHeader}>
            <div className={styles.inspectHeaderCopy}>
              <span className={styles.inspectTitle}>inspect</span>
              <span className={styles.inspectContext}>
                {detailTab === 'stage'
                  ? currentCase.stageSnippets[stage].title
                  : detailTab === 'html'
                    ? 'generated scaffold html'
                    : detailTab === 'css'
                      ? 'generated scaffold css'
                      : detailTab === 'reread'
                        ? 'semantic reread'
                        : 'debug tree'}
              </span>
            </div>
            <div className={styles.detailTabs} role="tablist" aria-label="Inspection panels">
              {detailTabs.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.detailTab} ${detailTab === item.id ? styles.detailTabActive : ''}`}
                  onClick={() => setDetailTab(item.id)}
                  role="tab"
                  aria-selected={detailTab === item.id}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {detailTab === 'stage' ? (
            <CodePanel
              eyebrow={`${stageMeta.label} · notebook snippet`}
              title={currentCase.stageSnippets[stage].title}
              code={currentCase.stageSnippets[stage].code}
              language={currentCase.stageSnippets[stage].language}
            />
          ) : null}

          {detailTab === 'html' ? (
            <CodePanel
              eyebrow="generated scaffold"
              title="html"
              code={currentCase.generatedHtml}
              language="html"
            />
          ) : null}

          {detailTab === 'css' ? (
            <CodePanel
              eyebrow="generated scaffold"
              title="css"
              code={currentCase.generatedCss}
              language="css"
            />
          ) : null}

          {detailTab === 'reread' ? (
            <div className={styles.modernPanel}>
              <div className={styles.modernHeader}>
                <span className={styles.modernTag}>2026 semantic reread</span>
                <p className={styles.modernNote}>{currentCase.modernView.note}</p>
              </div>
              <div
                className={styles.modernMount}
                dangerouslySetInnerHTML={{ __html: currentCase.modernView.html }}
              />
            </div>
          ) : null}

          {detailTab === 'tree' ? (
            <div className={styles.debugPanel}>
              <div className={styles.debugMeta}>
                <span>{currentCase.contourCount} contours traced</span>
                <div className={styles.debugLinks}>
                  <a href={currentCase.treeAsset} target="_blank" rel="noreferrer">tree.json</a>
                  <a href={currentCase.domAsset} target="_blank" rel="noreferrer">dom.txt</a>
                </div>
              </div>
              <pre className={styles.treeBlock}>{currentCase.treeLines.join('\n')}</pre>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
