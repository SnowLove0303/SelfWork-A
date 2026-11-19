import { DocBlock } from '../types/docs.ts';

export interface DocTemplateDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  buildBlocks: (pageId: string) => DocBlock[];
}

/**
 * 工业级技术文档模板库
 * 包含四大经典技术与工程实践模板：
 * 1. RFC / 技术方案设计规范 (Spec-Driven Architecture)
 * 2. 5-Whys 线上故障与 Bug 深度复盘 (Postmortem)
 * 3. 研发周报与版本发布日志 (Changelog & Weekly)
 * 4. 计算机科学与编程语言核心知识卡片 (Knowledge Card)
 */
export const DOC_TEMPLATES: DocTemplateDefinition[] = [
  {
    id: 'rfc-spec',
    name: '技术方案设计规范 (RFC)',
    description: '工业级架构设计、依赖权衡、状态机转移与任务拆解标准规范',
    icon: '💡',
    category: '架构工程',
    buildBlocks: (pageId: string): DocBlock[] => {
      const now = Date.now();
      const rawBlocks = [
        {
          blockType: 'callout' as const,
          content: '<b>RFC 概要</b>：本文档定义系统核心设计规范。在进入编码阶段前，必须明确系统承重墙、接口契约与反退化防御机制。',
          properties: { theme: 'info', icon: '💡' },
        },
        {
          blockType: 'h1' as const,
          content: '一、背景与核心痛点 (Background & Problem)',
        },
        {
          blockType: 'p' as const,
          content: '请详细阐述当前系统面临的技术瓶颈、用户诉求或历史遗留技术债。明确回答“为什么必须在这个周期解决此问题”。',
        },
        {
          blockType: 'h1' as const,
          content: '二、系统架构与技术选型 (Architecture & Trade-offs)',
        },
        {
          blockType: 'p' as const,
          content: '系统核心拓扑与模块职责边界划分：',
        },
        {
          blockType: 'code' as const,
          content: 'flowchart TD\n    Client["客户端 / UI层"] --> Gateway["API Gateway / IPC 协议"]\n    Gateway --> Engine["领域状态机引擎"]\n    Engine --> SQLite["本地持久化存储"]',
          properties: { language: 'mermaid', viewMode: 'preview' },
        },
        {
          blockType: 'h2' as const,
          content: '2.1 依赖权衡与非功能性指标',
        },
        {
          blockType: 'table' as const,
          content: '',
          properties: {
            hasHeaderRow: true,
            hasHeaderCol: false,
            rows: [
              ['评估维度', '方案 A (当前采纳)', '方案 B (备选/否决)', '决策依据'],
              ['性能与延迟', '< 16ms 极速就地响应', '网络轮询 200ms+', '原生进程内 IPC 零网络抖动'],
              ['实现复杂度', '中等，需严格状态机', '极高，需分布式协调', '单机敏捷与自闭环优势'],
              ['扩展成本', '低，插件化松耦合', '高，侵入式硬依赖', '模块间正交解耦'],
            ],
          },
        },
        {
          blockType: 'h1' as const,
          content: '三、实施计划与自验证清单 (Tasks & Verification)',
        },
        {
          blockType: 'todo' as const,
          content: '阶段 1：底层数据结构立法与单元测试编写 (严格退出码 0)',
          properties: { checked: false },
        },
        {
          blockType: 'todo' as const,
          content: '阶段 2：交互边界接入与状态机防篡改封印',
          properties: { checked: false },
        },
        {
          blockType: 'todo' as const,
          content: '阶段 3：全链路回归与对抗式压力边界检验',
          properties: { checked: false },
        },
      ];

      return rawBlocks.map((b, idx) => ({
        id: `b_${now}_${idx + 1}`,
        pageId,
        blockType: b.blockType,
        content: b.content,
        properties: b.properties,
        sortOrder: idx + 1,
        createdAt: now + idx,
        updatedAt: now + idx,
      }));
    },
  },

  {
    id: 'postmortem',
    name: 'Bug 深度复盘 (5-Whys)',
    description: '根因穿透、影响面评估与避免再次发生的机械化长效防线',
    icon: '🐞',
    category: '质量工程',
    buildBlocks: (pageId: string): DocBlock[] => {
      const now = Date.now();
      const rawBlocks = [
        {
          blockType: 'callout' as const,
          content: '<b>复盘红线</b>：对事不对人。杜绝“加强注意/下次仔细”等敷衍口水话，必须确立编译器硬阻断、静态检查或状态机防线。',
          properties: { theme: 'warn', icon: '🚨' },
        },
        {
          blockType: 'h1' as const,
          content: '一、故障基本信息与影响面 (Overview)',
        },
        {
          blockType: 'table' as const,
          content: '',
          properties: {
            hasHeaderRow: true,
            hasHeaderCol: true,
            rows: [
              ['关键属性', '复盘详情记录'],
              ['发生时间', '2026-XX-XX 10:15:00'],
              ['恢复时间', '2026-XX-XX 10:42:00 (耗时 27 分钟)'],
              ['影响范围', '部分高并发场景下数据保存偶发丢失'],
              ['定级定责', 'P2 核心业务短暂受损'],
            ],
          },
        },
        {
          blockType: 'h1' as const,
          content: '二、5-Whys 根因深度穿透 (Root Cause Analysis)',
        },
        {
          blockType: 'numbered' as const,
          content: '为什么数据会丢失？—— 因为客户端未等待异步持久化完成即关闭了会话。',
        },
        {
          blockType: 'numbered' as const,
          content: '为什么未等待就关闭？—— 因为状态机中未建模 PendingSave 中间态，UI 层直接触发了卸载。',
        },
        {
          blockType: 'numbered' as const,
          content: '为什么没有设计 Pending 状态？—— 因为当时仅依赖单字段 isDirty 做粗粒度判断。',
        },
        {
          blockType: 'numbered' as const,
          content: '为什么粗粒度判断未被发现？—— 缺乏多状态并发离线回归测试用例。',
        },
        {
          blockType: 'numbered' as const,
          content: '为什么测试未覆盖？—— 验证平面与实现代码未物理隔离，且缺乏变异杀伤力门禁。',
        },
        {
          blockType: 'h1' as const,
          content: '三、长效防线下沉与落地跟进 (Action Items)',
        },
        {
          blockType: 'todo' as const,
          content: '【L1 状态机】将生命周期重构为显式有限状态机，非法状态在类型层不可表达',
          properties: { checked: false },
        },
        {
          blockType: 'todo' as const,
          content: '【L2 静态分析】新增 ESLint 规约，禁止在卸载钩子中静默抛弃未决 Promise',
          properties: { checked: false },
        },
        {
          blockType: 'todo' as const,
          content: '【L3 自动化见证】编写真实无头进程环境回归用例，挂载于 CI 退出码 0 硬门禁',
          properties: { checked: false },
        },
      ];

      return rawBlocks.map((b, idx) => ({
        id: `b_${now}_${idx + 1}`,
        pageId,
        blockType: b.blockType,
        content: b.content,
        properties: b.properties,
        sortOrder: idx + 1,
        createdAt: now + idx,
        updatedAt: now + idx,
      }));
    },
  },

  {
    id: 'changelog-weekly',
    name: '研发周报与发布日志 (Changelog)',
    description: '结构化同步本周关键交付、阻塞点与下阶段演进路线',
    icon: '📅',
    category: '敏捷协同',
    buildBlocks: (pageId: string): DocBlock[] => {
      const now = Date.now();
      const rawBlocks = [
        {
          blockType: 'callout' as const,
          content: '<b>发布概览</b>：本周期版本聚焦核心交互体验优化与工程承重墙加固，共计完成 4 项关键交付，测试覆盖率保持 100%。',
          properties: { theme: 'success', icon: '🚀' },
        },
        {
          blockType: 'h1' as const,
          content: '一、本周重点交付物 (Completed Highlights)',
        },
        {
          blockType: 'todo' as const,
          content: '<b>[Feat]</b> 全局查找替换工具条上线，支持正则与带 Undo 栈的全部替换',
          properties: { checked: true },
        },
        {
          blockType: 'todo' as const,
          content: '<b>[Feat]</b> 块级 HTML5 原生拖拽重排落地，支持 6 点手柄与落点蓝色指示线',
          properties: { checked: true },
        },
        {
          blockType: 'todo' as const,
          content: '<b>[Perf]</b> 目录大纲接入 ScrollSpy 滚动监听，实时高亮当前章节并支持过滤',
          properties: { checked: true },
        },
        {
          blockType: 'h1' as const,
          content: '二、技术阻塞点与应对方案 (Blockers & Solutions)',
        },
        {
          blockType: 'quote' as const,
          content: '当前暂无致命外部阻塞。部分大文件多维表格在极端滚动下的渲染帧率将在下周通过虚拟滚动进一步提升。',
        },
        {
          blockType: 'h1' as const,
          content: '三、下阶段迭代里程碑 (Next Milestones)',
        },
        {
          blockType: 'bullet' as const,
          content: 'Milestone 1: 多格式流转与高保真打印/PDF 导出',
        },
        {
          blockType: 'bullet' as const,
          content: 'Milestone 2: 历史快照时间轴抽屉与版本无损还原',
        },
      ];

      return rawBlocks.map((b, idx) => ({
        id: `b_${now}_${idx + 1}`,
        pageId,
        blockType: b.blockType,
        content: b.content,
        properties: b.properties,
        sortOrder: idx + 1,
        createdAt: now + idx,
        updatedAt: now + idx,
      }));
    },
  },

  {
    id: 'knowledge-card',
    name: '核心知识点与技术卡片',
    description: '通俗比喻、核心盲区挖掘、避坑代码对照与速记口诀',
    icon: '📚',
    category: '技术积累',
    buildBlocks: (pageId: string): DocBlock[] => {
      const now = Date.now();
      const rawBlocks = [
        {
          blockType: 'callout' as const,
          content: '<b>知识速记卡</b>：聚焦反直觉盲区。拒绝搬运官方无聊文档，必须包含避坑代码对照与核心记忆口诀。',
          properties: { theme: 'tip', icon: '🧠' },
        },
        {
          blockType: 'h1' as const,
          content: '一、核心机制与通俗比喻 (Analogy)',
        },
        {
          blockType: 'p' as const,
          content: '可以用日常生活的直观概念来理解此底层机制：它就像一个带双钥匙的保险箱，只有验证钥匙与施工钥匙同时插入，门禁方能开启。',
        },
        {
          blockType: 'h1' as const,
          content: '二、新手易犯的经典陷阱 (Pitfall & Fix)',
        },
        {
          blockType: 'code' as const,
          content: '// ❌ 错误示范：闭包陷阱与陈旧状态读取\nuseEffect(() => {\n  const timer = setInterval(() => {\n    console.log(count); // 永远读取初始值 0\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);\n\n// ✅ 正确范式：使用 useRef 穿透最新状态\nconst countRef = useRef(count);\ncountRef.current = count;\nuseEffect(() => {\n  const timer = setInterval(() => {\n    console.log(countRef.current); // 永远获取最新状态\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);',
          properties: { language: 'typescript', viewMode: 'code' },
        },
        {
          blockType: 'h1' as const,
          content: '三、速记口诀与一句话结语 (Summary)',
        },
        {
          blockType: 'quote' as const,
          content: '<b>速记口诀</b>：闭包取值留心眼，最新状态 Ref 穿；异步逻辑防脏读，依赖数组莫等闲。',
        },
      ];

      return rawBlocks.map((b, idx) => ({
        id: `b_${now}_${idx + 1}`,
        pageId,
        blockType: b.blockType,
        content: b.content,
        properties: b.properties,
        sortOrder: idx + 1,
        createdAt: now + idx,
        updatedAt: now + idx,
      }));
    },
  },
];
