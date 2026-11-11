import { MindMapNode, NodeLayout } from '../../types/mindmap.ts';

export interface TreeConnection {
  id: string;
  from: NodeLayout;
  to: NodeLayout;
  path: string;
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

// 递归测量每个子树所占据的总垂直高度
function measureSubtreeHeight(node: MindMapNode, depth: number): number {
  const { height } = getNodeDimensions(depth, node.title);
  if (!node.children || node.children.length === 0) {
    return height;
  }

  let childrenHeightSum = 0;
  for (let i = 0; i < node.children.length; i++) {
    childrenHeightSum += measureSubtreeHeight(node.children[i], depth + 1);
  }
  childrenHeightSum += (node.children.length - 1) * SIBLING_GAP;

  return Math.max(height, childrenHeightSum);
}

// 递归生成所有节点的精确坐标与贝塞尔连线
export function calculateMindMapLayout(root: MindMapNode): MindMapLayoutResult {
  const layouts: NodeLayout[] = [];
  const connections: TreeConnection[] = [];

  function layoutNode(
    node: MindMapNode,
    depth: number,
    startX: number,
    startY: number,
    parentLayout?: NodeLayout
  ): NodeLayout {
    const { width, height } = getNodeDimensions(depth, node.title);
    const totalSubtreeHeight = measureSubtreeHeight(node, depth);

    // 当前节点垂直居中放置在自己的子树高度区间中
    const nodeY = startY + (totalSubtreeHeight - height) / 2;
    const currentLayout: NodeLayout = {
      node,
      x: startX,
      y: nodeY,
      width,
      height,
      depth,
      parentId: parentLayout?.node.id,
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
      });
    }

    // 递归布局所有子分支
    if (node.children && node.children.length > 0) {
      let childY = startY;
      const nextStartX = startX + width + LEVEL_GAP;

      for (const child of node.children) {
        const childHeight = measureSubtreeHeight(child, depth + 1);
        layoutNode(child, depth + 1, nextStartX, childY, currentLayout);
        childY += childHeight + SIBLING_GAP;
      }
    }

    return currentLayout;
  }

  layoutNode(root, 0, 80, 80);

  // 计算整体包围盒边界
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
