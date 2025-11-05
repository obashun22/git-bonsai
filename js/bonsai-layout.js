/**
 * 盆栽レイアウトエンジン
 * Gitグラフを盆栽の形状にレイアウト
 */

import {
  LAYOUT_CONFIG,
  NODE_SIZE,
  ANGLE_CONFIG,
  COLORS
} from './constants.js';

export class BonsaiLayout {
  constructor() {
    this.rng = null;
  }

  /**
   * Gitグラフから盆栽レイアウトを生成
   * @param {Map<string, Commit>} commits - コミットマップ
   * @param {Map<string, Branch>} branches - ブランチマップ
   * @returns {Array<GraphNode>}
   */
  generateLayout(commits, branches) {
    // ルートコミットを見つける（見つからない場合は最も古いコミットを使用）
    let root = this.findRootCommit(commits);
    const isPseudoRoot = !root;
    if (!root) {
      console.warn('⚠️ ルートコミットが見つからないため、最も古いコミットを使用します');
      root = this.findOldestCommit(commits);
      if (!root) {
        throw new Error('コミットが見つかりません');
      }
    }

    // シード値を生成（決定論的レイアウト用）
    this.rng = new Math.seedrandom(root.sha);

    // ノードを作成
    const nodes = this.createNodes(commits, branches);

    // 疑似ルートの場合、該当するノードのtypeを'root'に変更
    if (isPseudoRoot) {
      const rootNode = nodes.find(n => n.sha === root.sha);
      if (rootNode) {
        rootNode.type = 'root';
        rootNode.color = this.getColorForType('root');
      }
    }

    // 座標を計算
    this.calculatePositions(nodes, commits, root);

    // 衝突を解消
    this.resolveCollisions(nodes);

    // 正方形にフィット
    this.fitToSquare(nodes);

    return nodes;
  }

  /**
   * ノードを作成
   */
  createNodes(commits, branches) {
    const nodes = [];
    const branchHeads = new Set(Array.from(branches.values()).map(b => b.head));

    commits.forEach((commit) => {
      const type = this.calculateNodeType(commit, branchHeads, commits);
      const size = this.calculateNodeSize(commit, commits, type);

      const node = {
        sha: commit.sha,
        type,
        x: 0,
        y: 0,
        angle: 0,
        size,
        color: this.getColorForType(type),
        parent: commit.parents.length > 0 ? commit.parents[0] : null,
        commit
      };

      nodes.push(node);
    });

    return nodes;
  }

  /**
   * ノードタイプを決定
   */
  calculateNodeType(commit, branchHeads, commits) {
    if (commit.parents.length === 0) return 'root';
    if (commit.isMerge) return 'merge';

    // 以下のコミットを葉にする：
    // 1. ブランチのHEAD
    // 2. 子が1つだけで、その子がマージコミット（ブランチの最終コミット）
    if (branchHeads.has(commit.sha)) return 'leaf';
    if (commit.children.length === 1) {
      const childSha = commit.children[0];
      const childCommit = commits.get(childSha);
      if (childCommit && childCommit.isMerge) return 'leaf';
    }

    return 'trunk';
  }

  /**
   * ノードサイズを計算
   */
  calculateNodeSize(commit, commits, type) {
    if (type === 'root') return NODE_SIZE.ROOT;
    if (type === 'merge') {
      // マージの規模に応じたサイズ
      const mergeSize = commit.parents.length * NODE_SIZE.MERGE_FACTOR;
      return Math.min(NODE_SIZE.MERGE_MAX, NODE_SIZE.MERGE_BASE + mergeSize);
    }
    if (type === 'leaf') {
      // マージ元のコミット数を数える
      if (commit.isMerge && commit.parents.length > 1) {
        const count = this.countCommitsInBranch(commit.parents[1], commits);
        return LAYOUT_CONFIG.BASE_LEAF_SIZE + Math.min(count * LAYOUT_CONFIG.SIZE_MULTIPLIER, 50);
      }
      return LAYOUT_CONFIG.BASE_LEAF_SIZE;
    }
    return NODE_SIZE.TRUNK;
  }

  /**
   * ブランチのコミット数を数える
   */
  countCommitsInBranch(sha, commits) {
    let count = 0;
    const visited = new Set();
    const queue = [sha];

    while (queue.length > 0 && count < 100) {  // 最大100
      const currentSha = queue.shift();

      if (visited.has(currentSha)) continue;
      visited.add(currentSha);

      const commit = commits.get(currentSha);
      if (!commit) continue;

      count++;

      // 親がマージコミットでない場合のみ続行
      if (!commit.isMerge && commit.parents.length > 0) {
        queue.push(commit.parents[0]);
      }
    }

    return count;
  }

  /**
   * 座標を計算
   */
  calculatePositions(nodes, commits, root) {
    const nodeMap = new Map(nodes.map(n => [n.sha, n]));

    // ルートの位置
    const rootNode = nodeMap.get(root.sha);
    rootNode.x = LAYOUT_CONFIG.CANVAS_SIZE / 2;
    rootNode.y = LAYOUT_CONFIG.CANVAS_SIZE - LAYOUT_CONFIG.MARGIN;

    // 幅優先探索で座標を計算
    const queue = [root.sha];
    const visited = new Set();

    while (queue.length > 0) {
      const sha = queue.shift();

      if (visited.has(sha)) continue;
      visited.add(sha);

      const commit = commits.get(sha);
      const node = nodeMap.get(sha);

      if (!node || !commit) continue;

      // 子ノードの座標を計算
      commit.children.forEach((childSha, index) => {
        const child = commits.get(childSha);
        const childNode = nodeMap.get(childSha);

        if (!child || !childNode) return;

        // 距離を計算
        const distance = LAYOUT_CONFIG.BASE_DISTANCE + (child.depth * LAYOUT_CONFIG.DEPTH_FACTOR);

        // 角度を計算
        const angle = this.calculateAngle(child, commit, index, commit.children.length);

        // 新しい座標（横方向と縦方向で異なるスケールを適用）
        const angleRad = (angle * Math.PI) / 180;
        const dx = distance * Math.sin(angleRad) * LAYOUT_CONFIG.HORIZONTAL_SCALE;  // 横方向を拡大
        const dy = distance * Math.cos(angleRad) * LAYOUT_CONFIG.VERTICAL_SCALE;    // 縦方向を縮小
        childNode.x = node.x + dx;
        childNode.y = node.y - dy;
        childNode.angle = angle;

        queue.push(childSha);
      });
    }
  }

  /**
   * 角度を計算
   */
  calculateAngle(commit, parent, index, totalChildren) {
    // メインブランチ（ブランチ名がmaster/main）は垂直
    if (commit.branchName === 'master' || commit.branchName === 'main') {
      return 0 + (this.rng() - 0.5) * ANGLE_CONFIG.MAIN_BRANCH_VARIATION;
    }

    // 子が複数ある場合、均等に配分
    if (totalChildren > 1) {
      const step = ANGLE_CONFIG.ANGLE_RANGE / (totalChildren - 1);
      return -85 + step * index + (this.rng() - 0.5) * ANGLE_CONFIG.ANGLE_VARIATION;
    }

    // 単一の子の場合
    const baseAngle = parent.branchName === commit.branchName ? 0 : ANGLE_CONFIG.SINGLE_CHILD_BASE;
    return baseAngle + (this.rng() - 0.5) * ANGLE_CONFIG.SINGLE_CHILD_VARIATION;
  }

  /**
   * 衝突を解消
   */
  resolveCollisions(nodes) {
    for (let iteration = 0; iteration < LAYOUT_CONFIG.MAX_ITERATIONS; iteration++) {
      let hasCollision = false;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (this.isColliding(nodes[i], nodes[j])) {
            this.adjustPosition(nodes[i], nodes[j]);
            hasCollision = true;
          }
        }
      }

      if (!hasCollision) break;
    }
  }

  /**
   * 衝突判定
   */
  isColliding(node1, node2) {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = node1.size + node2.size + LAYOUT_CONFIG.COLLISION_MARGIN;

    return distance < minDistance;
  }

  /**
   * 位置を調整
   */
  adjustPosition(node1, node2) {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const minDistance = node1.size + node2.size + LAYOUT_CONFIG.COLLISION_MARGIN;
    const overlap = minDistance - distance;

    const adjustX = (dx / distance) * overlap * 0.5;
    const adjustY = (dy / distance) * overlap * 0.5;

    node1.x -= adjustX;
    node1.y -= adjustY;
    node2.x += adjustX;
    node2.y += adjustY;
  }

  /**
   * 正方形にフィット
   */
  fitToSquare(nodes) {
    const bbox = this.calculateBoundingBox(nodes);

    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;

    const maxDimension = Math.max(width, height);
    const scale = (LAYOUT_CONFIG.CANVAS_SIZE - 2 * LAYOUT_CONFIG.MARGIN) / maxDimension;

    // スケーリングと中央配置
    const centerX = LAYOUT_CONFIG.CANVAS_SIZE / 2;
    const centerY = LAYOUT_CONFIG.CANVAS_SIZE / 2;
    const bboxCenterX = (bbox.minX + bbox.maxX) / 2;
    const bboxCenterY = (bbox.minY + bbox.maxY) / 2;

    nodes.forEach(node => {
      node.x = centerX + (node.x - bboxCenterX) * scale;
      node.y = centerY + (node.y - bboxCenterY) * scale;
      node.size *= scale;
    });
  }

  /**
   * 境界ボックスを計算
   */
  calculateBoundingBox(nodes) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      minX = Math.min(minX, node.x - node.size);
      maxX = Math.max(maxX, node.x + node.size);
      minY = Math.min(minY, node.y - node.size);
      maxY = Math.max(maxY, node.y + node.size);
    });

    return { minX, maxX, minY, maxY };
  }

  /**
   * ルートコミットを見つける
   */
  findRootCommit(commits) {
    for (const commit of commits.values()) {
      if (commit.parents.length === 0) {
        return commit;
      }
    }
    return null;
  }

  /**
   * 最も古いコミットを見つける（タイムスタンプベース）
   */
  findOldestCommit(commits) {
    let oldest = null;
    for (const commit of commits.values()) {
      if (!oldest || commit.timestamp < oldest.timestamp) {
        oldest = commit;
      }
    }
    return oldest;
  }

  /**
   * ノードタイプに応じた色を返す
   */
  getColorForType(type) {
    return COLORS[type.toUpperCase()] || COLORS.TRUNK;
  }
}
