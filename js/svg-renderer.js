/**
 * SVG描画エンジン
 * 盆栽レイアウトをSVGで描画
 */

import {
  SVG_NS,
  POT_CONFIG,
  BRANCH_WIDTH,
  COLORS,
  ANIMATION,
  ZOOM_CONFIG
} from './constants.js';

export class SVGRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.viewport = document.getElementById('viewport');
    this.tooltip = document.getElementById('tooltip');

    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;

    this.nodeMap = new Map();
  }

  /**
   * 盆栽を描画
   * @param {Array<GraphNode>} nodes
   */
  render(nodes) {
    // SVGをクリア
    this.clearSvg();

    // ノードマップを作成
    this.nodeMap = new Map(nodes.map(n => [n.sha, n]));

    // 描画順序: 植木鉢 → 枝 → 葉
    this.drawPot(nodes);
    this.drawBranches(nodes);
    this.drawLeaves(nodes);

    // ツールチップイベントを設定
    this.setupTooltips();
  }

  /**
   * SVGをクリア
   */
  clearSvg() {
    const groups = ['branches', 'nodes', 'leaves', 'root'];
    groups.forEach(id => {
      const group = document.getElementById(id);
      if (group) group.innerHTML = '';
    });
  }

  /**
   * 植木鉢を描画（日本の伝統的な盆栽鉢：逆台形）
   */
  drawPot(nodes) {
    const rootGroup = document.getElementById('root');

    // ルートノードを探す
    const rootNode = nodes.find(n => n.type === 'root');
    if (!rootNode) return;

    // 植木鉢の位置とサイズ（上が広く、下が狭い逆台形）
    const potCenterX = rootNode.x;
    const potTopY = rootNode.y + POT_CONFIG.OFFSET_Y;
    const potTopWidth = POT_CONFIG.TOP_WIDTH;
    const potBottomWidth = POT_CONFIG.BOTTOM_WIDTH;
    const potHeight = POT_CONFIG.HEIGHT;

    // 植木鉢本体（逆台形）
    const pot = document.createElementNS(SVG_NS, 'path');
    const potPath = `
      M ${potCenterX - potTopWidth/2} ${potTopY}
      L ${potCenterX - potBottomWidth/2} ${potTopY + potHeight}
      L ${potCenterX + potBottomWidth/2} ${potTopY + potHeight}
      L ${potCenterX + potTopWidth/2} ${potTopY}
      Z
    `;
    pot.setAttribute('d', potPath);
    pot.setAttribute('fill', COLORS.POT_BODY);
    pot.setAttribute('stroke', COLORS.POT_STROKE);
    pot.setAttribute('stroke-width', 5);
    rootGroup.appendChild(pot);

    // 上部の縁（長方形）
    const rim = document.createElementNS(SVG_NS, 'rect');
    rim.setAttribute('x', potCenterX - potTopWidth/2);
    rim.setAttribute('y', potTopY - POT_CONFIG.RIM_HEIGHT);
    rim.setAttribute('width', potTopWidth);
    rim.setAttribute('height', POT_CONFIG.RIM_HEIGHT);
    rim.setAttribute('fill', COLORS.POT_RIM);
    rim.setAttribute('stroke', COLORS.POT_STROKE);
    rim.setAttribute('stroke-width', 3);
    rootGroup.appendChild(rim);

    // 土の表面
    const soil = document.createElementNS(SVG_NS, 'rect');
    soil.setAttribute('x', potCenterX - potTopWidth/2 + POT_CONFIG.SOIL_MARGIN);
    soil.setAttribute('y', potTopY);
    soil.setAttribute('width', potTopWidth - POT_CONFIG.SOIL_MARGIN * 2);
    soil.setAttribute('height', POT_CONFIG.SOIL_HEIGHT);
    soil.setAttribute('fill', COLORS.SOIL);
    rootGroup.appendChild(soil);
  }

  /**
   * 枝を描画
   */
  drawBranches(nodes) {
    const branchesGroup = document.getElementById('branches');

    nodes.forEach(node => {
      if (node.parent) {
        const parent = this.nodeMap.get(node.parent);
        if (parent) {
          const line = this.createBranch(parent, node);
          branchesGroup.appendChild(line);
        }
      }
    });
  }

  /**
   * 枝（線）を作成
   */
  createBranch(parent, child) {
    const line = document.createElementNS(SVG_NS, 'line');

    line.setAttribute('x1', parent.x);
    line.setAttribute('y1', parent.y);
    line.setAttribute('x2', child.x);
    line.setAttribute('y2', child.y);
    line.setAttribute('stroke', COLORS.TRUNK);
    line.setAttribute('stroke-width', this.calculateBranchWidth(child));
    line.setAttribute('stroke-linecap', 'round');
    line.classList.add('branch');

    return line;
  }

  /**
   * 枝の太さを計算
   */
  calculateBranchWidth(node) {
    const isMain = node.commit.branchName === 'master' || node.commit.branchName === 'main';
    const baseWidth = isMain ? BRANCH_WIDTH.MAIN : BRANCH_WIDTH.OTHER;
    const depthFactor = Math.max(1, BRANCH_WIDTH.DEPTH_REDUCTION - node.commit.depth);
    return Math.min(baseWidth * depthFactor * 0.5, BRANCH_WIDTH.MAX);
  }


  /**
   * 葉を描画
   */
  drawLeaves(nodes) {
    const leavesGroup = document.getElementById('leaves');

    const leafNodes = nodes.filter(n => n.type === 'leaf');

    leafNodes.forEach(node => {
      const ellipse = this.createLeaf(node);
      leavesGroup.appendChild(ellipse);
    });
  }

  /**
   * 葉（楕円）を作成
   */
  createLeaf(node) {
    const ellipse = document.createElementNS(SVG_NS, 'ellipse');

    ellipse.setAttribute('cx', node.x);
    ellipse.setAttribute('cy', node.y);
    ellipse.setAttribute('rx', node.size);
    ellipse.setAttribute('ry', node.size * 0.6);
    ellipse.setAttribute('fill', node.color);
    ellipse.setAttribute('stroke', COLORS.LEAF_STROKE);
    ellipse.setAttribute('stroke-width', 3);
    ellipse.setAttribute('transform', `rotate(${node.angle} ${node.x} ${node.y})`);
    ellipse.classList.add('leaf');

    // データ属性
    ellipse.setAttribute('data-sha', node.sha);
    ellipse.setAttribute('data-message', node.commit.message);
    ellipse.setAttribute('data-author', node.commit.author);
    ellipse.setAttribute('data-timestamp', node.commit.timestamp);

    return ellipse;
  }

  /**
   * ツールチップイベントを設定
   */
  setupTooltips() {
    const elements = document.querySelectorAll('.node, .leaf');

    elements.forEach(element => {
      element.addEventListener('mouseenter', (e) => this.showTooltip(e));
      element.addEventListener('mouseleave', () => this.hideTooltip());
    });
  }

  /**
   * ツールチップを表示
   */
  showTooltip(event) {
    const element = event.target;

    const message = element.getAttribute('data-message');
    const author = element.getAttribute('data-author');
    const timestamp = element.getAttribute('data-timestamp');

    const date = new Date(timestamp * 1000).toLocaleDateString('ja-JP');

    const tooltipText = this.tooltip.querySelector('.tooltip-text');
    const tooltipBg = this.tooltip.querySelector('.tooltip-bg');

    // テキストを設定
    tooltipText.textContent = '';

    const lines = [
      message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      `作成者: ${author}`,
      `日付: ${date}`
    ];

    let yOffset = 20;
    lines.forEach((line, index) => {
      const tspan = document.createElementNS(SVG_NS, 'tspan');
      tspan.textContent = line;
      tspan.setAttribute('x', 10);
      tspan.setAttribute('y', yOffset);
      yOffset += 18;
      tooltipText.appendChild(tspan);
    });

    // 背景サイズを調整
    const bbox = tooltipText.getBBox();
    tooltipBg.setAttribute('width', bbox.width + 20);
    tooltipBg.setAttribute('height', bbox.height + 20);

    // 位置を設定（マウス位置）
    const pt = this.canvas.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgP = pt.matrixTransform(this.canvas.getScreenCTM().inverse());

    this.tooltip.setAttribute('transform', `translate(${svgP.x + 10}, ${svgP.y + 10})`);
    this.tooltip.style.display = 'block';
  }

  /**
   * ツールチップを非表示
   */
  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  /**
   * 成長アニメーション
   */
  animateGrowth(nodes) {
    // 深さ順にソート
    const sortedNodes = [...nodes].sort((a, b) => a.commit.depth - b.commit.depth);

    sortedNodes.forEach((node, index) => {
      const delay = index * ANIMATION.DELAY_PER_NODE;

      const elements = document.querySelectorAll(`[data-sha="${node.sha}"]`);

      elements.forEach(element => {
        // 初期状態
        element.style.opacity = 0;
        element.style.transform = 'scale(0)';
        element.style.transformOrigin = 'center';

        // アニメーション
        setTimeout(() => {
          element.style.transition = `opacity ${ANIMATION.TRANSITION_DURATION}s, transform ${ANIMATION.TRANSITION_DURATION}s`;
          element.style.opacity = 1;
          element.style.transform = 'scale(1)';
        }, delay);
      });
    });
  }

  /**
   * ズーム・パン機能を初期化
   */
  initZoomPan() {
    let isDragging = false;
    let startX, startY;

    // ホイールでズーム
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();

      const delta = e.deltaY > 0 ? ZOOM_CONFIG.ZOOM_STEP : ZOOM_CONFIG.ZOOM_IN_STEP;
      this.scale *= delta;
      this.scale = Math.max(ZOOM_CONFIG.MIN_SCALE, Math.min(ZOOM_CONFIG.MAX_SCALE, this.scale));

      this.updateTransform();
    });

    // ドラッグでパン
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.target === this.canvas || e.target.classList.contains('branch')) {
        isDragging = true;
        startX = e.clientX - this.translateX;
        startY = e.clientY - this.translateY;
        this.canvas.style.cursor = 'grabbing';
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      this.translateX = e.clientX - startX;
      this.translateY = e.clientY - startY;

      this.updateTransform();
    });

    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
      this.canvas.style.cursor = 'grab';
    });

    this.canvas.addEventListener('mouseleave', () => {
      isDragging = false;
      this.canvas.style.cursor = 'grab';
    });
  }

  /**
   * トランスフォームを更新
   */
  updateTransform() {
    this.viewport.setAttribute('transform',
      `translate(${this.translateX},${this.translateY}) scale(${this.scale})`
    );
  }

  /**
   * ビューをリセット
   */
  resetView() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.updateTransform();
  }

  /**
   * SVGをPNG画像として保存
   */
  async saveAsPNG() {
    try {
      // SVG要素を取得
      const svgElement = this.canvas.cloneNode(true);

      // 現在のトランスフォームをリセット（保存時は全体を表示）
      const viewportClone = svgElement.querySelector('#viewport');
      if (viewportClone) {
        viewportClone.removeAttribute('transform');
      }

      // SVGをシリアライズ
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      // BlobとしてSVGを作成
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // 画像をロード
      const img = new Image();
      img.onload = () => {
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // 背景を白に
        ctx.fillStyle = '#fffef8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 画像を描画
        ctx.drawImage(img, 0, 0);

        // PNGとしてダウンロード
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.download = `git-bonsai-${Date.now()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();

          // クリーンアップ
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(link.href);
        });
      };

      img.src = url;
    } catch (error) {
      console.error('画像保存エラー:', error);
      throw new Error('画像の保存に失敗しました');
    }
  }
}
