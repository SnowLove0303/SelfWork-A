import React, { useEffect, useRef } from 'react';
import { BlockType } from '../../../types/docs.ts';
import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  CheckSquare,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Table,
  MessageSquare,
  ChevronRight,
  Image as ImageIcon,
  Network,
  Workflow,
  Sigma,
} from 'lucide-react';

export interface SlashMenuItem {
  type: BlockType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  properties?: Record<string, any>;
}

interface SlashMenuProps {
  position: { top: number; left: number };
  onSelect: (type: BlockType, properties?: Record<string, any>) => void;
  onClose: () => void;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
}

export const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  {
    type: 'p',
    label: '正文文本',
    desc: '普通纯文本段落',
    icon: <Type size={14} className="text-slate-400" />,
  },
  {
    type: 'h1',
    label: '一级标题 (H1)',
    desc: '高层级结构主标题',
    icon: <Heading1 size={14} className="text-sky-400" />,
  },
  {
    type: 'h2',
    label: '二级标题 (H2)',
    desc: '中层级小节标题',
    icon: <Heading2 size={14} className="text-emerald-400" />,
  },
  {
    type: 'h3',
    label: '三级标题 (H3)',
    desc: '底层级重点标题',
    icon: <Heading3 size={14} className="text-amber-400" />,
  },
  {
    type: 'todo',
    label: '待办清单',
    desc: '支持打勾标销的交互式复选清单',
    icon: <CheckSquare size={14} className="text-purple-400" />,
  },
  {
    type: 'bullet',
    label: '无序列表',
    desc: '项目符号列表',
    icon: <List size={14} className="text-cyan-400" />,
  },
  {
    type: 'numbered',
    label: '有序列表',
    desc: '自动编号序列内容条目',
    icon: <ListOrdered size={14} className="text-blue-400" />,
  },
  {
    type: 'toggle',
    label: '折叠块（Toggle）',
    desc: '可折叠收起的内容区块',
    icon: <ChevronRight size={14} className="text-teal-400" />,
  },
  {
    type: 'callout',
    label: '提示框（Callout）',
    desc: '带图标的色彩信息卡片块',
    icon: <MessageSquare size={14} className="text-violet-400" />,
  },
  {
    type: 'quote',
    label: '引用块',
    desc: '竖线高亮标注的引述萸萝',
    icon: <Quote size={14} className="text-yellow-400" />,
  },
  {
    type: 'code',
    label: '代码块',
    desc: '等宽字体代码与高亮显示',
    icon: <Code size={14} className="text-rose-400" />,
  },
  {
    type: 'divider',
    label: '水平分隔线',
    desc: '视觉分割内容的线条',
    icon: <Minus size={14} className="text-slate-500" />,
  },
  {
    type: 'table',
    label: '数据表格 (Table)',
    desc: '用于技术对比、参数对照与二维数据排版',
    icon: <Table size={14} className="text-indigo-400" />,
  },
  {
    type: 'mindmap',
    label: '思维导图 (MindMap)',
    desc: '嵌入式结构化思维导图画布，支持展开与编辑',
    icon: <Network size={14} className="text-amber-400" />,
  },
  {
    type: 'code',
    label: '架构流程图 (Mermaid)',
    desc: '用文本语法绘制流程图、时序图与架构拓扑',
    icon: <Workflow size={14} className="text-emerald-400" />,
    properties: { language: 'mermaid' },
  },
  {
    type: 'math',
    label: '数学公式 (Math)',
    desc: '基于 KaTeX 的 LaTeX 专业数学公式排版',
    icon: <Sigma size={14} className="text-violet-400" />,
  },
  {
    type: 'image',
    label: '图片',
    desc: '上传本地图片或嵌入网络图片',
    icon: <ImageIcon size={14} className="text-pink-400" />,
  },
];

export const SlashMenu: React.FC<SlashMenuProps> = ({
  position,
  onSelect,
  onClose,
  selectedIndex,
  setSelectedIndex,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="fixed z-50 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 text-slate-200 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto"
    >
      <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        基础块类型
      </div>
      <div className="space-y-0.5">
        {SLASH_MENU_ITEMS.map((item, idx) => (
          <button
            key={`${item.type}-${item.label}`}
            onClick={() => onSelect(item.type, item.properties)}
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              selectedIndex === idx
                ? 'bg-sky-500/20 text-white'
                : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <div className="p-1 rounded bg-white/5">{item.icon}</div>
            <div className="flex-1 truncate">
              <div className="text-xs font-medium">{item.label}</div>
              <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
