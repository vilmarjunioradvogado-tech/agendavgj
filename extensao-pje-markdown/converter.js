// Conversor genérico de um elemento do DOM para Markdown.
// Não depende de seletores específicos de um tribunal: percorre a árvore
// recursivamente e reconhece tanto tabelas HTML tradicionais quanto grids
// baseados em ARIA roles (role="grid"/"row"/"gridcell"), comuns em telas
// construídas com Vaadin (usado por várias instâncias do PJe).
(function (global) {
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'CANVAS']);
  const BLOCK_TAGS = new Set([
    'P', 'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE',
    'FORM', 'FIELDSET', 'BLOCKQUOTE', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  ]);

  function roleOf(el) {
    return (el.getAttribute && el.getAttribute('role') || '').toLowerCase();
  }

  function isTableLike(el) {
    const role = roleOf(el);
    return el.tagName === 'TABLE' || role === 'table' || role === 'grid' || role === 'treegrid';
  }

  function isCellLike(el) {
    const role = roleOf(el);
    return el.tagName === 'TD' || el.tagName === 'TH' ||
      role === 'cell' || role === 'gridcell' || role === 'columnheader' || role === 'rowheader';
  }

  function effectiveTag(el) {
    if (isTableLike(el)) return 'TABLE';
    return el.tagName;
  }

  function isHiddenElement(el) {
    if (el.hasAttribute && el.hasAttribute('hidden')) return true;
    if (el.getAttribute && el.getAttribute('aria-hidden') === 'true') return true;
    try {
      const style = window.getComputedStyle(el);
      if (style && (style.display === 'none' || style.visibility === 'hidden')) return true;
    } catch (e) { /* elementos fora do documento: ignora */ }
    return false;
  }

  const collapseWhitespace = (text) => text.replace(/[ \t\r\n]+/g, ' ');
  const escapePipes = (text) => text.replace(/\|/g, '\\|');

  function inline(el) {
    let out = '';
    el.childNodes.forEach((child) => { out += inlineNode(child); });
    return out;
  }

  function inlineNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return collapseWhitespace(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node;
    if (SKIP_TAGS.has(el.tagName) || isHiddenElement(el)) return '';

    switch (el.tagName) {
      case 'BR':
        return '\n';
      case 'STRONG':
      case 'B': {
        const t = inline(el).trim();
        return t ? `**${t}**` : '';
      }
      case 'EM':
      case 'I': {
        const t = inline(el).trim();
        return t ? `*${t}*` : '';
      }
      case 'CODE': {
        const t = inline(el).trim();
        return t ? `\`${t}\`` : '';
      }
      case 'A': {
        const t = inline(el).trim();
        const href = el.getAttribute('href');
        if (!t) return '';
        if (!href || href.startsWith('javascript:') || href.startsWith('#')) return t;
        try {
          return `[${t}](${new URL(href, location.href).href})`;
        } catch (e) {
          return t;
        }
      }
      case 'INPUT': {
        const type = (el.getAttribute('type') || 'text').toLowerCase();
        if (['hidden', 'submit', 'button', 'image', 'file'].includes(type)) return '';
        if (type === 'checkbox' || type === 'radio') return el.checked ? '[x]' : '[ ]';
        return el.value ? collapseWhitespace(el.value) : '';
      }
      case 'SELECT': {
        const opt = el.options && el.options[el.selectedIndex];
        return opt ? collapseWhitespace(opt.textContent) : '';
      }
      case 'TEXTAREA':
        return el.value ? collapseWhitespace(el.value) : '';
      default:
        if (isTableLike(el)) return block(el).replace(/\n+/g, ' ').trim();
        return inline(el);
    }
  }

  function listToMarkdown(el, depth) {
    let out = '';
    const isOrdered = el.tagName === 'OL';
    let idx = 0;
    Array.from(el.children).forEach((child) => {
      if (child.tagName !== 'LI' || isHiddenElement(child)) return;
      idx += 1;
      const indent = '  '.repeat(depth);
      const marker = isOrdered ? `${idx}.` : '-';
      const nestedLists = Array.from(child.children).filter((c) => c.tagName === 'UL' || c.tagName === 'OL');
      const clone = child.cloneNode(true);
      Array.from(clone.children).forEach((c) => {
        if (c.tagName === 'UL' || c.tagName === 'OL') clone.removeChild(c);
      });
      const text = inline(clone).trim().replace(/\s+/g, ' ');
      out += `${indent}${marker} ${text}\n`;
      nestedLists.forEach((nl) => { out += listToMarkdown(nl, depth + 1); });
    });
    return out;
  }

  function tableToMarkdown(el) {
    const rowEls = Array.from(el.querySelectorAll('tr, [role="row"]')).filter((r) => !isHiddenElement(r));
    const rows = rowEls
      .map((row) => {
        let cells = Array.from(row.children).filter(isCellLike);
        if (!cells.length) {
          cells = Array.from(row.querySelectorAll('td, th, [role="cell"], [role="gridcell"], [role="columnheader"]'));
        }
        return cells.filter((c) => !isHiddenElement(c))
          .map((cell) => escapePipes(inline(cell).trim().replace(/\s+/g, ' ')) || ' ');
      })
      .filter((r) => r.length);
    if (!rows.length) return '';
    const colCount = Math.max(...rows.map((r) => r.length));
    rows.forEach((r) => { while (r.length < colCount) r.push(''); });
    let out = `| ${rows[0].join(' | ')} |\n`;
    out += `| ${rows[0].map(() => '---').join(' | ')} |\n`;
    rows.slice(1).forEach((r) => { out += `| ${r.join(' | ')} |\n`; });
    return out + '\n';
  }

  function block(el) {
    if (SKIP_TAGS.has(el.tagName) || isHiddenElement(el)) return '';

    switch (effectiveTag(el)) {
      case 'H1': return `# ${inline(el).trim()}\n\n`;
      case 'H2': return `## ${inline(el).trim()}\n\n`;
      case 'H3': return `### ${inline(el).trim()}\n\n`;
      case 'H4': return `#### ${inline(el).trim()}\n\n`;
      case 'H5': return `##### ${inline(el).trim()}\n\n`;
      case 'H6': return `###### ${inline(el).trim()}\n\n`;
      case 'HR': return '---\n\n';
      case 'BR': return '\n';
      case 'UL':
      case 'OL':
        return listToMarkdown(el, 0) + '\n';
      case 'TABLE':
        return tableToMarkdown(el);
      case 'BLOCKQUOTE': {
        const inner = childrenToMarkdown(el).trim();
        return inner.split('\n').map((l) => (l ? `> ${l}` : '>')).join('\n') + '\n\n';
      }
      case 'PRE':
        return '```\n' + el.textContent.replace(/\n+$/, '') + '\n```\n\n';
      default: {
        if (BLOCK_TAGS.has(el.tagName) || el.tagName === 'LI') {
          const inner = childrenToMarkdown(el).trim();
          return inner ? `${inner}\n\n` : '';
        }
        return childrenToMarkdown(el);
      }
    }
  }

  function childrenToMarkdown(el) {
    let out = '';
    let pendingInline = '';
    const flushInline = () => {
      const t = pendingInline.trim();
      if (t) out += `${t}\n\n`;
      pendingInline = '';
    };
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        pendingInline += collapseWhitespace(child.textContent);
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      if (SKIP_TAGS.has(child.tagName) || isHiddenElement(child)) return;
      const tag = effectiveTag(child);
      const isBlockLevel = BLOCK_TAGS.has(tag) || tag === 'UL' || tag === 'OL' || tag === 'TABLE' || tag === 'HR' || tag === 'LI';
      if (isBlockLevel) {
        flushInline();
        out += block(child);
      } else {
        pendingInline += inlineNode(child);
      }
    });
    flushInline();
    return out;
  }

  function htmlElementToMarkdown(rootEl) {
    if (!rootEl) return '';
    const md = block(rootEl);
    return md.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  global.PjeMdConverter = { htmlElementToMarkdown };
})(window);
