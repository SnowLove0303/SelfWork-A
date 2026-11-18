import { DocBlock } from '../types/docs.ts';

// 将 HTML 富文本清理为纯 Markdown 文本
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<u>(.*?)<\/u>/gi, '_$1_')
    .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
    .replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a [^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<mark[^>]*>(.*?)<\/mark>/gi, '==$1==')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export function exportBlocksToMarkdown(
  title: string,
  icon: string | undefined,
  blocks: DocBlock[]
): string {
  const lines: string[] = [];

  // 页面标题
  lines.push(`# ${icon ? icon + ' ' : ''}${title || '无标题'}`);
  lines.push('');

  for (const block of blocks) {
    const text = htmlToMarkdown(block.content);
    switch (block.blockType) {
      case 'h1':
        lines.push(`# ${text}`, '');
        break;
      case 'h2':
        lines.push(`## ${text}`, '');
        break;
      case 'h3':
        lines.push(`### ${text}`, '');
        break;
      case 'p':
        lines.push(text || '', '');
        break;
      case 'quote':
        lines.push(`> ${text}`, '');
        break;
      case 'bullet':
        lines.push(`- ${text}`);
        break;
      case 'numbered':
        // 简单递增，不追踪序号
        lines.push(`1. ${text}`);
        break;
      case 'todo': {
        const checked = block.properties?.checked ? 'x' : ' ';
        lines.push(`- [${checked}] ${text}`);
        break;
      }
      case 'code': {
        const lang = (block.properties?.language as string) || '';
        lines.push('```' + lang, block.content, '```', '');
        break;
      }
      case 'callout': {
        const calloutIcon = (block.properties?.icon as string) || '💡';
        lines.push(`> ${calloutIcon} **${text}**`, '');
        break;
      }
      case 'toggle': {
        const isOpen = block.properties?.isOpen;
        const children = (block.properties?.children as string) || '';
        lines.push(`**▶ ${text}**`);
        if (isOpen && children) {
          lines.push('', htmlToMarkdown(children));
        }
        lines.push('');
        break;
      }
      case 'divider':
        lines.push('---', '');
        break;
      case 'image':
        lines.push(`![${block.properties?.caption || 'image'}](${block.properties?.src || ''})`, '');
        break;
      default:
        if (text) lines.push(text, '');
    }
  }

  return lines.join('\n');
}
