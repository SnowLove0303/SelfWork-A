import { DocBlock } from '../types/docs.ts';

/**
 * 将文档与块流序列化为高保真自包含独立 HTML 文档
 * 内嵌完整的现代暗黑排版样式与打印支持，可在任何浏览器中离线阅读
 */
export function exportBlocksToHtml(
  title: string,
  icon: string | undefined,
  blocks: DocBlock[]
): string {
  const renderedBlocks: string[] = [];

  for (const block of blocks) {
    switch (block.blockType) {
      case 'h1':
        renderedBlocks.push(`<h1 class="heading-1">${block.content}</h1>`);
        break;
      case 'h2':
        renderedBlocks.push(`<h2 class="heading-2">${block.content}</h2>`);
        break;
      case 'h3':
        renderedBlocks.push(`<h3 class="heading-3">${block.content}</h3>`);
        break;
      case 'p':
        if (block.content.trim()) {
          renderedBlocks.push(`<p class="paragraph">${block.content}</p>`);
        }
        break;
      case 'quote':
        renderedBlocks.push(`<blockquote class="quote">${block.content}</blockquote>`);
        break;
      case 'bullet':
        renderedBlocks.push(`<li class="bullet-item">${block.content}</li>`);
        break;
      case 'numbered':
        renderedBlocks.push(`<li class="numbered-item">${block.content}</li>`);
        break;
      case 'todo': {
        const checked = block.properties?.checked;
        renderedBlocks.push(
          `<div class="todo-item ${checked ? 'completed' : ''}">
            <input type="checkbox" ${checked ? 'checked' : ''} disabled />
            <span>${block.content}</span>
          </div>`
        );
        break;
      }
      case 'code': {
        const lang = (block.properties?.language as string) || 'plaintext';
        renderedBlocks.push(
          `<div class="code-container">
            <div class="code-header">${lang}</div>
            <pre><code>${escapeHtml(block.content)}</code></pre>
          </div>`
        );
        break;
      }
      case 'callout': {
        const calloutIcon = (block.properties?.icon as string) || '💡';
        const theme = (block.properties?.theme as string) || 'info';
        renderedBlocks.push(
          `<div class="callout callout-${theme}">
            <span class="callout-icon">${calloutIcon}</span>
            <div class="callout-content">${block.content}</div>
          </div>`
        );
        break;
      }
      case 'divider':
        renderedBlocks.push('<hr class="divider" />');
        break;
      case 'table': {
        const rows = (block.properties?.rows as string[][]) || [];
        if (rows.length > 0) {
          const tableHtml = rows
            .map((r, rIdx) => {
              const cells = r
                .map((c) =>
                  rIdx === 0
                    ? `<th>${c || '&nbsp;'}</th>`
                    : `<td>${c || '&nbsp;'}</td>`
                )
                .join('');
              return `<tr>${cells}</tr>`;
            })
            .join('');
          renderedBlocks.push(`<div class="table-container"><table>${tableHtml}</table></div>`);
        }
        break;
      }
      case 'image': {
        const src = block.properties?.src as string;
        const caption = block.properties?.caption as string;
        if (src) {
          renderedBlocks.push(
            `<figure class="image-container">
              <img src="${src}" alt="${caption || 'Image'}" />
              ${caption ? `<figcaption>${caption}</figcaption>` : ''}
            </figure>`
          );
        }
        break;
      }
      case 'columns': {
        const cols = (block.properties?.columns as Array<{ content: string }>) || [];
        const colsHtml = cols
          .map((c, idx) => `<div class="column-item"><div class="column-label">第 ${idx + 1} 栏</div><div>${c.content}</div></div>`)
          .join('');
        renderedBlocks.push(`<div class="columns-container">${colsHtml}</div>`);
        break;
      }
      default:
        if (block.content) {
          renderedBlocks.push(`<div class="block-misc">${block.content}</div>`);
        }
    }
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${icon ? icon + ' ' : ''}${title || 'SelfWork 文档'}</title>
  <style>
    :root {
      --bg-color: #0a0d14;
      --text-color: #e2e8f0;
      --heading-color: #ffffff;
      --card-bg: #111622;
      --border-color: rgba(255, 255, 255, 0.1);
      --link-color: #38bdf8;
      --quote-bar: #0284c7;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg-color: #ffffff;
        --text-color: #1e293b;
        --heading-color: #0f172a;
        --card-bg: #f8fafc;
        --border-color: rgba(0, 0, 0, 0.1);
        --link-color: #0284c7;
        --quote-bar: #38bdf8;
      }
    }
    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.75;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 820px;
      width: 100%;
    }
    .doc-header {
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .doc-icon {
      font-size: 2.2rem;
      margin-bottom: 8px;
    }
    .doc-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--heading-color);
      margin: 0;
      line-height: 1.25;
    }
    .heading-1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-top: 40px;
      margin-bottom: 12px;
      padding-top: 8px;
    }
    .heading-2 {
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--heading-color);
      margin-top: 32px;
      margin-bottom: 10px;
    }
    .heading-3 {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--heading-color);
      margin-top: 20px;
      margin-bottom: 8px;
    }
    .paragraph {
      margin: 10px 0;
      font-size: 1rem;
    }
    .quote {
      border-left: 4px solid var(--quote-bar);
      padding: 8px 16px;
      margin: 16px 0;
      background: rgba(56, 189, 248, 0.05);
      border-radius: 0 8px 8px 0;
      font-style: italic;
    }
    .bullet-item, .numbered-item {
      margin: 4px 0;
      margin-left: 20px;
    }
    .todo-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 6px 0;
    }
    .todo-item.completed span {
      text-decoration: line-through;
      opacity: 0.6;
    }
    .callout {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      margin: 16px 0;
    }
    .callout-icon { font-size: 1.25rem; }
    .callout-content { flex: 1; }
    .code-container {
      background: #0d1117;
      color: #e6edf3;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin: 16px 0;
      overflow: hidden;
    }
    .code-header {
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.3);
      font-size: 0.75rem;
      font-family: monospace;
      color: #8b949e;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    pre {
      margin: 0;
      padding: 14px;
      overflow-x: auto;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 0.88rem;
    }
    .table-container {
      overflow-x: auto;
      margin: 16px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--border-color);
    }
    th, td {
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      text-align: left;
    }
    th { background: rgba(255, 255, 255, 0.05); }
    .divider {
      border: none;
      height: 1px;
      background: var(--border-color);
      margin: 24px 0;
    }
    .columns-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }
    .column-item {
      padding: 12px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      border-radius: 10px;
    }
    .column-label {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .image-container img {
      max-width: 100%;
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }
    figcaption {
      font-size: 0.8rem;
      color: #94a3b8;
      text-align: center;
      margin-top: 6px;
    }
    @media print {
      body { background: #fff !important; color: #000 !important; padding: 0 !important; }
      .container { max-width: 100% !important; }
      .doc-header { border-bottom: 2px solid #000 !important; }
      .code-container, .callout, .column-item { border: 1px solid #ccc !important; background: #fafafa !important; color: #000 !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="doc-header">
      ${icon ? `<div class="doc-icon">${icon}</div>` : ''}
      <h1 class="doc-title">${title || '无标题文档'}</h1>
    </div>
    <div class="doc-body">
      ${renderedBlocks.join('\n')}
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
