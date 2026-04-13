import React from 'react';
import styles from './AutoCSSLab.module.css';
import { highlightCode } from './syntaxHighlight';
import type { AutoCssCodeLanguage } from './data';

interface Props {
  eyebrow: string;
  title: string;
  code: string;
  language: AutoCssCodeLanguage;
}

export default function CodePanel({ eyebrow, title, code, language }: Props) {
  const highlighted = highlightCode(code, language);

  return (
    <section className={styles.codeCard}>
      <header className={styles.codeHeader}>
        <span className={styles.codeEyebrow}>{eyebrow}</span>
        <span className={styles.codeTitle}>{title}</span>
      </header>
      <pre className={styles.codeBlock}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </section>
  );
}
