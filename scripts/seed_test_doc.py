import sqlite3
import os
import json
import time

def main():
    db_path = os.path.expandvars(r'%APPDATA%\SelfWork\selfwork.db')
    print(f"Connecting to: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    page_id = 'page_1794537792555'
    page_title = '📝 SelfWork 文档编辑器全功能排版与交互实测规范'
    page_icon = '📝'
    now = int(time.time() * 1000)

    # 1. 更新或确保页面元数据
    cur.execute('''
        UPDATE doc_pages 
        SET title = ?, icon = ?, updated_at = ?
        WHERE id = ?
    ''', (page_title, page_icon, now, page_id))
    
    if cur.rowcount == 0:
        cur.execute('''
            INSERT INTO doc_pages (id, title, icon, partition_id, created_at, updated_at)
            VALUES (?, ?, ?, 'part_private', ?, ?)
        ''', (page_id, page_title, page_icon, now, now))

    # 2. 清空该页面的旧测试块
    cur.execute('DELETE FROM doc_blocks WHERE page_id = ?', (page_id,))

    # 3. 准备 Swarm doc-tester 规划的 42 个全功能实测块
    blocks_data = [
        # 一、标题层级
        ("h1", "📝 SelfWork 文档编辑器全功能排版与交互实测规范", None),
        ("h2", "第一章：文字排版与内联格式", None),
        ("h3", "1.1 基础富文本格式", None),

        # 二、正文段落 + 内联格式标注
        ("p", "本文档用于系统性验证 SelfWork 文档编辑器的所有块类型与排版能力。请逐块检查渲染效果是否符合预期。", None),
        ("p", "**粗体文字示例**：这是一段包含 **重要内容** 的正文，粗体应显示为加粗字重。", None),
        ("p", "*斜体文字示例*：这是一段包含 *技术术语 Italic* 的正文，斜体应显示为倾斜字形。", None),
        ("p", "~~删除线示例~~：这段文字中 ~~已废弃的内容~~ 应显示为贯穿删除线。", None),
        ("p", "行内代码示例：调用 `console.log('Hello, SelfWork!')` 或 `npm run dev` 时使用等宽字体与粉红醒目标注。", None),
        ("p", "**粗体** 与 *斜体* 与 ~~删除线~~ 与 `代码` 四种格式混排于同一段落的综合测试行。", None),

        # 三、文字颜色（6色）
        ("h3", "1.2 六种文字颜色", None),
        ("p", '<span class="text-rose-400">🔴 玫瑰红 Rose — 用于警告、危险标注与高危操作</span>', None),
        ("p", '<span class="text-amber-500">🟠 琥珀橙 Amber — 用于注意事项与重要待办提醒</span>', None),
        ("p", '<span class="text-yellow-300">🟡 明黄 Yellow — 用于重点提示与关键点说明</span>', None),
        ("p", '<span class="text-emerald-400">🟢 翠绿 Emerald — 用于成功、正常运行与审核通过状态</span>', None),
        ("p", '<span class="text-sky-400">🔵 晴蓝 Sky — 用于超链接、协议规范与通用信息提示</span>', None),
        ("p", '<span class="text-purple-400">🟣 浅紫 Purple — 用于分类标签、架构模块与元数据标注</span>', None),

        # 四、荧光笔高亮（5色）
        ("h3", "1.3 五种荧光笔高亮", None),
        ("p", '<mark class="bg-yellow-400/20 text-yellow-200 border-b border-yellow-400/60 px-1 py-0.5 rounded">鹅黄高亮：适合标注关键定义与核心业务概念</mark>', None),
        ("p", '<mark class="bg-emerald-400/20 text-emerald-200 border-b border-emerald-400/60 px-1 py-0.5 rounded">薄荷高亮：适合标注操作步骤、部署指令与执行命令</mark>', None),
        ("p", '<mark class="bg-sky-400/20 text-sky-200 border-b border-sky-400/60 px-1 py-0.5 rounded">冰蓝高亮：适合标注参考链接、API 端点与官方文档来源</mark>', None),
        ("p", '<mark class="bg-rose-400/20 text-rose-200 border-b border-rose-400/60 px-1 py-0.5 rounded">淡粉高亮：适合标注安全风险点、注意事项与破坏性操作</mark>', None),
        ("p", '<mark class="bg-purple-400/20 text-purple-200 border-b border-purple-400/60 px-1 py-0.5 rounded">淡紫高亮：适合标注实验性特性、Swarm 协同任务与待验证项</mark>', None),

        # 五、待办列表（todo）
        ("h2", "第二章：列表与结构化块", None),
        ("h3", "2.1 待办事项列表", None),
        ("todo", "已完成：BlockItem 组件基础渲染框架搭建", {"checked": True}),
        ("todo", "已完成：右键上下文菜单（BlockContextMenu）实现", {"checked": True}),
        ("todo", "已完成：标题收拢为一级条目并构建防溢出二级子弹窗", {"checked": True}),
        ("todo", "已完成：专注文档编辑原子操作的 doc-editor-mcp 测试服务搭建", {"checked": True}),
        ("todo", "已完成：行首 Markdown 速记蜕变（# / ## / ### / [] / - / > / ---）落地", {"checked": True}),
        ("todo", "已完成：Enter 换行延续当前块类型与空项回退普通段落", {"checked": True}),
        ("todo", "已完成：富文本格式双模所见即所得渲染与即时编辑聚焦", {"checked": True}),

        # 六、无序列表（bullet）
        ("h3", "2.2 无序列表", None),
        ("bullet", "块编辑器核心设计原则：每个内容单元是独立可操作的块，支持上下文菜单交互", None),
        ("bullet", "支持的块类型：段落、标题 H1/H2/H3、待办、无序列表、引用、代码、分隔线、表格", None),
        ("bullet", "键盘导航：ArrowUp/Down 跨块移动焦点，Enter 插入新块，Backspace 平滑降级与删除", None),
        ("bullet", "右键菜单：格式化选中文字、转换块类型、复制/剪切操作", None),

        # 七、引用块（quote）
        ("h3", "2.3 引用语录", None),
        ("quote", "“工具应当从人的思维出发，而非强迫人去适应工具的结构限制。好的编辑器让思路自由流动，让格式服务于内容，而非束缚它。” —— SelfWork 工业级设计法则", None),

        # 八、分隔线（divider）
        ("divider", "", None),

        # 九、多行代码块（code）
        ("h2", "第三章：代码块实测", None),
        ("h3", "3.1 多行代码块渲染", None),
        ("code", """// SelfWork 文档编辑器核心数据结构定义
export interface DocBlock {
  id: string;
  pageId: string;
  blockType: 'p' | 'h1' | 'h2' | 'h3' | 'bullet' | 'todo' | 'quote' | 'code' | 'divider' | 'table';
  content: string;
  properties?: Record<string, any>;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// 模拟创建全功能测试块
export function createSampleBlock(type: DocBlock['blockType'], text: string): DocBlock {
  return {
    id: 'b_' + Date.now(),
    pageId: 'page_demo',
    blockType: type,
    content: text,
    sortOrder: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}""", None)
    ]

    # 4. 逐条写入 doc_blocks
    insert_sql = '''
        INSERT INTO doc_blocks (id, page_id, block_type, content, properties_json, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    '''
    
    for idx, (b_type, content, props) in enumerate(blocks_data, start=1):
        block_id = f"b_test_{now}_{idx:03d}"
        props_str = json.dumps(props) if props else None
        sort_order = float(idx)
        cur.execute(insert_sql, (block_id, page_id, b_type, content, props_str, sort_order, now, now))

    conn.commit()
    print(f"Successfully inserted {len(blocks_data)} blocks into page {page_id} ({page_title})")

    # 5. 验证查询
    cur.execute('SELECT COUNT(*) FROM doc_blocks WHERE page_id = ?', (page_id,))
    count = cur.fetchone()[0]
    print(f"Verified count in SQLite: {count} blocks")
    conn.close()

if __name__ == '__main__':
    main()
