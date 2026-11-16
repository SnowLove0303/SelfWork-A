import sqlite3
import os
import time
import json

def sanitize():
    db_path = os.path.expandvars(r'%APPDATA%\SelfWork\selfwork.db')
    print(f"Connecting to: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    page_id = 'page_1794537792555'
    page_title = 'SelfWork 功能实测与排版规范'
    page_icon = '📝'
    now = int(time.time() * 1000)

    # 1. 更新页面元数据
    cur.execute('''
        UPDATE doc_pages 
        SET title = ?, icon = ?, updated_at = ?
        WHERE id = ?
    ''', (page_title, page_icon, now, page_id))

    # 2. 清理旧块
    cur.execute('DELETE FROM doc_blocks WHERE page_id = ?', (page_id,))

    # 3. 构造纯净、规范、无 HTML 污染的 16 个典型实测块
    clean_blocks = [
        ("h1", "第一章：排版与样式", None),
        ("p", "欢迎使用 SelfWork 文档编辑器。本篇笔记用于直观测试和体验各项块级元素与键盘操作流。", None),
        ("h2", "1.1 基础富文本格式", None),
        ("p", "粗体、斜体与删除线：在段落中可以直接使用快捷键，或划选文字通过右键菜单快速格式化。", None),
        ("p", "行内代码支持：例如执行 npm run dev 或调用 console.log 时，文字将以等宽字体醒目显示。", None),
        ("h2", "1.2 待办事项与任务列表", None),
        ("todo", "体验行首快捷键：在空行输入 [] 并按下空格，自动转换为待办事项", {"checked": True}),
        ("todo", "测试待办打勾：点击左侧紫色复选框，完成项会自动划上删除线", {"checked": False}),
        ("todo", "回车续接：在待办项末尾按 Enter，下一行会自动生成新的待办项", {"checked": False}),
        ("h2", "1.3 项目列表与引用", None),
        ("bullet", "无序列表项：输入 - 或 * 后加空格，原地蜕变为项目符号", None),
        ("bullet", "多层级阅读：清晰组织复杂知识要点与工作流程", None),
        ("quote", "“工具应当从人的思维出发，而非强迫人去适应工具的限制。让思路自由流动，让格式服务于内容。”", None),
        ("divider", "", None),
        ("h1", "第二章：代码与技术块", None),
        ("code", "// SelfWork 文档编辑器核心块数据结构\nexport interface DocBlock {\n  id: string;\n  blockType: 'p' | 'h1' | 'h2' | 'h3' | 'bullet' | 'todo' | 'quote' | 'code' | 'divider';\n  content: string;\n  sortOrder: number;\n}", None),
    ]

    insert_sql = '''
        INSERT INTO doc_blocks (id, page_id, block_type, content, properties_json, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    '''

    for idx, (b_type, content, props) in enumerate(clean_blocks, start=1):
        block_id = f"b_clean_{now}_{idx:03d}"
        props_str = json.dumps(props) if props else None
        sort_order = float(idx)
        cur.execute(insert_sql, (block_id, page_id, b_type, content, props_str, sort_order, now, now))

    conn.commit()
    print(f"Sanitized and inserted {len(clean_blocks)} clean blocks into {page_id}")

    # 4. 验证
    cur.execute('SELECT sort_order, block_type, content FROM doc_blocks WHERE page_id = ? ORDER BY sort_order', (page_id,))
    rows = cur.fetchall()
    for r in rows:
        print(f"  [{r[1]}]: {r[2][:50]}")
    conn.close()

if __name__ == '__main__':
    sanitize()
