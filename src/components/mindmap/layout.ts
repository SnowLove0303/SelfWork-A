import { MindMapNode, NodeLayout } from '../../types/mindmap.ts';

export interface TreeConnection {
  id: string;
  from: NodeLayout;
  to: NodeLayout;
  path: string;
  color?: string;
}

export interface MindMapLayoutResult {
  layouts: NodeLayout[];
  connections: TreeConnection[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

const LEVEL_GAP = 68; // 层级水平间距
const SIBLING_GAP = 18; // 兄弟分支垂直间距

export const RAINBOW_COLORS = ['#4F87FF', '#FF6B6B', '#FFD93D', '#6BCB77', '#C77DFF', '#FF9A3C'];

export function getNodeDimensions(depth: number, title: string): { width: number; height: number } {
  // 根据文字长度动态计算节点自适应宽度
  const charLength = title.length;
  const approxTextWidth = Math.max(60, charLength * 12 + 28);

  if (depth === 0) {
    return { width: Math.min(240, Math.max(140, approxTextWidth + 24)), height: 44 };
  }
  if (depth === 1) {
    return { width: Math.min(220, Math.max(120, approxTextWidth + 16)), height: 38 };
  }
  return { width: Math.min(200, Math.max(100, approxTextWidth + 12)), height: 32 };
}

// 递归测量每个子树所占据的总垂直高度（折叠节点不递归子树）
function measureSubtreeHeight(node: MindMapNode, depth: number): number {
  const { height } = getNodeDimensions(depth, node.title);
  if (node.collapsed || !node.children || node.children.length === 0) {
    return height;
  }

  let childrenHeightSum = 0;
  for (let i = 0; i < node.children.length; i++) {
    childrenHeightSum += measureSubtreeHeight(node.children[i], depth + 1);
  }
  childrenHeightSum += (node.children.length - 1) * SIBLING_GAP;

  return Math.max(height, childrenHeightSum);
}

// 递归生成所有节点的精确坐标与贝塞尔连线（单向右展）
export function calculateMindMapLayout(
  root: MindMapNode,
  rainbowColors?: string[]
): MindMapLayoutResult {
  const layouts: NodeLayout[] = [];
  const connections: TreeConnection[] = [];

  // 追踪根节点一级子树的彩虹颜色索引
  const palette = rainbowColors ?? RAINBOW_COLORS;
  let rootChildColorIndex = 0;

  function layoutNode(
    node: MindMapNode,
    depth: number,
    startX: number,
    startY: number,
    parentLayout?: NodeLayout,
    branchColor?: string
  ): NodeLayout {
    const { width, height } = getNodeDimensions(depth, node.title);
    const totalSubtreeHeight = measureSubtreeHeight(node, depth);

    // 当前节点垂直居中放置在自己的子树高度区间中
    const nodeY = startY + (totalSubtreeHeight - height) / 2;
    const isCollapsed = node.collapsed === true;
    const currentLayout: NodeLayout = {
      node,
      x: startX,
      y: nodeY,
      width,
      height,
      depth,
      parentId: parentLayout?.node.id,
      isCollapsed,
    };
    layouts.push(currentLayout);

    // 若有父节点，生成平滑贝塞尔连接线
    if (parentLayout) {
      const parentRightX = parentLayout.x + parentLayout.width;
      const parentCenterY = parentLayout.y + parentLayout.height / 2;
      const currentLeftX = currentLayout.x;
      const currentCenterY = currentLayout.y + currentLayout.height / 2;

      const dx = currentLeftX - parentRightX;
      // 三次贝塞尔控制点，模拟 Xmind 的 roundedElbow 平滑流线
      const c1x = parentRightX + dx * 0.45;
      const c1y = parentCenterY;
      const c2x = currentLeftX - dx * 0.45;
      const c2y = currentCenterY;

      const path = `M ${parentRightX} ${parentCenterY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${currentLeftX} ${currentCenterY}`;
      connections.push({
        id: `conn-${parentLayout.node.id}-${node.id}`,
        from: parentLayout,
        to: currentLayout,
        path,
        color: branchColor,
      });
    }

    // 折叠节点不递归子节点
    if (!isCollapsed && node.children && node.children.length > 0) {
      let childY = startY;
      const nextStartX = startX + width + LEVEL_GAP;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        // 一级子树从根节点分配彩虹色
        let childColor = branchColor;
        if (depth === 0) {
          childColor = palette[rootChildColorIndex % palette.length];
          rootChildColorIndex++;
        }
        const childHeight = measureSubtreeHeight(child, depth + 1);
        layoutNode(child, depth + 1, nextStartX, childY, currentLayout, childColor);
        childY += childHeight + SIBLING_GAP;
      }
    }

    return currentLayout;
  }

  layoutNode(root, 0, 80, 80);

  return buildBounds(layouts, connections);
}

// 双向布局：根节点居中，偶数索引子树向左，奇数索引向右（0-indexed）
export function calculateBothLayout(
  root: MindMapNode,
  rainbowColors?: string[]
): MindMapLayoutResult {
  const layouts: NodeLayout[] = [];
  const connections: TreeConnection[] = [];
  const palette = rainbowColors ?? RAINBOW_COLORS;

  const children = root.children ?? [];
  const leftChildren: MindMapNode[] = [];
  const rightChildren: MindMapNode[] = [];
  const leftColors: string[] = [];
  const rightColors: string[] = [];

  // 偶数索引 → 左，奇数索引 → 右
  for (let i = 0; i < children.length; i++) {
    const color = palette[i % palette.length];
    if (i % 2 === 0) {
      leftChildren.push(children[i]);
      leftColors.push(color);
    } else {
      rightChildren.push(children[i]);
      rightColors.push(color);
    }
  }

  // 根节点坐标先暂定后续根据子树高度确定
  const rootDim = getNodeDimensions(0, root.title);

  // 计算右侧总高
  let rightTotalH = 0;
  for (const c of rightChildren) rightTotalH += measureSubtreeHeight(c, 1);
  if (rightChildren.length > 1) rightTotalH += (rightChildren.length - 1) * SIBLING_GAP;

  // 计算左侧总高
  let leftTotalH = 0;
  for (const c of leftChildren) leftTotalH += measureSubtreeHeight(c, 1);
  if (leftChildren.length > 1) leftTotalH += (leftChildren.length - 1) * SIBLING_GAP;

  const totalH = Math.max(rootDim.height, rightTotalH, leftTotalH);
  const rootY = 80 + (totalH - rootDim.height) / 2;
  const rootX = 480; // 根节点固定中心 x

  const rootLayout: NodeLayout = {
    node: root,
    x: rootX,
    y: rootY,
    width: rootDim.width,
    height: rootDim.height,
    depth: 0,
    isCollapsed: root.collapsed === true,
  };
  layouts.push(rootLayout);

  // 右侧子树（奇数索引）
  function layoutRight(
    node: MindMapNode,
    depth: number,
    startX: number,
    startY: number,
    parentLayout: NodeLayout,
    branchColor?: string
  ): void {
    const { width, height } = getNodeDimensions(depth, node.title);
    const subtreeH = measureSubtreeHeight(node, depth);
    const nodeY = startY + (subtreeH - height) / 2;
    const isCollapsed = node.collapsed === true;
    const current: NodeLayout = {
      node,
      x: startX,
      y: nodeY,
      width,
      height,
      depth,
      parentId: parentLayout.node.id,
      isCollapsed,
    };
    layouts.push(current);

    // 右侧贝塞尔连线
    const pRightX = parentLayout.x + parentLayout.width;
    const pCY = parentLayout.y + parentLayout.height / 2;
    const cLX = current.x;
    const cCY = current.y + current.height / 2;
    const dx = cLX - pRightX;
    const path = `M ${pRightX} ${pCY} C ${pRightX + dx * 0.45} ${pCY}, ${cLX - dx * 0.45} ${cCY}, ${cLX} ${cCY}`;
    connections.push({
      id: `conn-${parentLayout.node.id}-${node.id}`,
      from: parentLayout,
      to: current,
      path,
      color: branchColor,
    });

    if (!isCollapsed && node.children && node.children.length > 0) {
      let childY = startY;
      const nextX = startX + width + LEVEL_GAP;
      for (const child of node.children) {
        const ch = measureSubtreeHeight(child, depth + 1);
        layoutRight(child, depth + 1, nextX, childY, current, branchColor);
        childY += ch + SIBLING_GAP;
      }
    }
  }

  // 左侧子树（偶数索引）：x 坐标镜像
  function layoutLeft(
    node: MindMapNode,
    depth: number,
    startX: number,
    startY: number,
    parentLayout: NodeLayout,
    branchColor?: string
  ): void {
    const { width, height } = getNodeDimensions(depth, node.title);
    const subtreeH = measureSubtreeHeight(node, depth);
    const nodeY = startY + (subtreeH - height) / 2;
    const isCollapsed = node.collapsed === true;
    const nodeX = startX - width; // 向左延伸
    const current: NodeLayout = {
      node,
      x: nodeX,
      y: nodeY,
      width,
      height,
      depth,
      parentId: parentLayout.node.id,
      isCollapsed,
    };
    layouts.push(current);

    // 左侧贝塞尔连线（从父节点左边出发）
    const pLX = parentLayout.x;
    const pCY = parentLayout.y + parentLayout.height / 2;
    const cRX = current.x + current.width;
    const cCY = current.y + current.height / 2;
    const dx = pLX - cRX;
    const path = `M ${pLX} ${pCY} C ${pLX - dx * 0.45} ${pCY}, ${cRX + dx * 0.45} ${cCY}, ${cRX} ${cCY}`;
    connections.push({
      id: `conn-${parentLayout.node.id}-${node.id}`,
      from: parentLayout,
      to: current,
      path,
      color: branchColor,
    });

    if (!isCollapsed && node.children && node.children.length > 0) {
      let childY = startY;
      const nextX = startX - width - LEVEL_GAP;
      for (const child of node.children) {
        const ch = measureSubtreeHeight(child, depth + 1);
        layoutLeft(child, depth + 1, nextX, childY, current, branchColor);
        childY += ch + SIBLING_GAP;
      }
    }
  }

  if (!root.collapsed) {
    // 布局右侧（奇数索引）子树
    let rightStartY = 80 + (totalH - rightTotalH) / 2;
    const rightStartX = rootX + rootDim.width + LEVEL_GAP;
    for (let i = 0; i < rightChildren.length; i++) {
      const child = rightChildren[i];
      const ch = measureSubtreeHeight(child, 1);
      layoutRight(child, 1, rightStartX, rightStartY, rootLayout, rightColors[i]);
      rightStartY += ch + SIBLING_GAP;
    }

    // 布局左侧（偶数索引）子树
    let leftStartY = 80 + (totalH - leftTotalH) / 2;
    const leftStartX = rootX - LEVEL_GAP;
    for (let i = 0; i < leftChildren.length; i++) {
      const child = leftChildren[i];
      const ch = measureSubtreeHeight(child, 1);
      layoutLeft(child, 1, leftStartX, leftStartY, rootLayout, leftColors[i]);
      leftStartY += ch + SIBLING_GAP;
    }
  }

  return buildBounds(layouts, connections);
}

function buildBounds(layouts: NodeLayout[], connections: TreeConnection[]): MindMapLayoutResult {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const l of layouts) {
    if (l.x < minX) minX = l.x;
    if (l.y < minY) minY = l.y;
    if (l.x + l.width > maxX) maxX = l.x + l.width;
    if (l.y + l.height > maxY) maxY = l.y + l.height;
  }

  return {
    layouts,
    connections,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(200, maxX - minX),
      height: Math.max(200, maxY - minY),
    },
  };
}
