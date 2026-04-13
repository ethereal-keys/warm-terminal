import type { AutoCssCodeLanguage } from './data';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function stashMatches(
  input: string,
  pattern: RegExp,
  className: string,
  placeholders: string[],
): string {
  return input.replace(pattern, (match) => {
    const token = `@@CODE_TOKEN_${placeholders.length}@@`;
    placeholders.push(`<span class="${className}">${match}</span>`);
    return token;
  });
}

function restoreMatches(input: string, placeholders: string[]): string {
  return input.replace(/@@CODE_TOKEN_(\d+)@@/g, (_, rawIndex) => placeholders[Number(rawIndex)] ?? '');
}

function highlightPython(raw: string): string {
  const placeholders: string[] = [];
  let code = escapeHtml(raw);

  code = stashMatches(code, /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, 'syntax-string', placeholders);
  code = stashMatches(code, /#.*$/gm, 'syntax-comment', placeholders);

  code = code.replace(
    /\b(import|from|def|return|if|elif|else|for|while|in|with|as|class|raise|try|except|True|False|None|and|or|not)\b/g,
    '<span class="syntax-keyword">$1</span>',
  );
  code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syntax-number">$1</span>');
  code = code.replace(/\b([A-Za-z_][\w]*)(?=\()/g, '<span class="syntax-function">$1</span>');

  return restoreMatches(code, placeholders);
}

function highlightCss(raw: string): string {
  const placeholders: string[] = [];
  let code = escapeHtml(raw);

  code = stashMatches(code, /\/\*[\s\S]*?\*\//g, 'syntax-comment', placeholders);
  code = stashMatches(code, /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, 'syntax-string', placeholders);

  code = code.replace(/^([^\{\n][^\{]*?)(\s*\{)$/gm, '<span class="syntax-selector">$1</span>$2');
  code = code.replace(/([a-z-]+)(\s*:)/g, '<span class="syntax-property">$1</span>$2');
  code = code.replace(/(#(?:[0-9a-fA-F]{3,8})|\b\d+(?:\.\d+)?(?:px|%|rem|em|vh|vw)?\b)/g, '<span class="syntax-number">$1</span>');

  return restoreMatches(code, placeholders);
}

function highlightHtmlAttributes(attrs: string): string {
  return attrs.replace(
    /([\w:-]+)(=)("(?:[^"]*)"|'(?:[^']*)')/g,
    '<span class="syntax-attr">$1</span><span class="syntax-operator">$2</span><span class="syntax-string">$3</span>',
  );
}

function highlightHtml(raw: string): string {
  const placeholders: string[] = [];
  let code = escapeHtml(raw);

  code = stashMatches(code, /&lt;!--[\s\S]*?--&gt;/g, 'syntax-comment', placeholders);
  code = code.replace(
    /(&lt;\/?)([A-Za-z][\w-]*)([\s\S]*?)(\/?&gt;)/g,
    (_, open, tag, attrs, close) => {
      return [
        `<span class="syntax-operator">${open}</span>`,
        `<span class="syntax-keyword">${tag}</span>`,
        highlightHtmlAttributes(attrs),
        `<span class="syntax-operator">${close}</span>`,
      ].join('');
    },
  );

  return restoreMatches(code, placeholders);
}

export function highlightCode(code: string, language: AutoCssCodeLanguage): string {
  if (language === 'python') return highlightPython(code);
  if (language === 'css') return highlightCss(code);
  if (language === 'html') return highlightHtml(code);
  return escapeHtml(code);
}
