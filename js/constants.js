/**
 * アプリケーション全体の定数定義
 */

// Git解析関連
export const GIT_CONFIG = {
  MAX_COMMITS: 30,           // 最大コミット数
  REPO_DIR: '/repo',         // LightningFS上のリポジトリディレクトリ
  FS_NAME: 'git-bonsai-fs'   // LightningFSの名前
};

// レイアウト関連
export const LAYOUT_CONFIG = {
  CANVAS_SIZE: 800,          // キャンバスサイズ
  MARGIN: 50,                // マージン
  BASE_DISTANCE: 50,         // ノード間の基本距離
  DEPTH_FACTOR: 2,           // 深さ係数
  HORIZONTAL_SCALE: 3.0,     // 横方向のスケール（横に伸ばす）
  VERTICAL_SCALE: 0.3,       // 縦方向のスケール（縦を抑える）
  BASE_LEAF_SIZE: 50,        // 葉の基本サイズ
  SIZE_MULTIPLIER: 10,       // サイズ倍率
  MAX_ITERATIONS: 50,        // 衝突解消の最大反復回数
  COLLISION_MARGIN: 5        // 衝突判定のマージン
};

// ノードサイズ
export const NODE_SIZE = {
  ROOT: 15,                  // 根のサイズ
  TRUNK: 10,                 // 幹のサイズ
  MERGE_BASE: 10,            // マージコミットの基本サイズ
  MERGE_FACTOR: 5,           // マージコミットのサイズ係数
  MERGE_MAX: 20,             // マージコミットの最大サイズ
  LEAF_MIN_SIZE: 50          // 葉の最小サイズ
};

// 角度設定
export const ANGLE_CONFIG = {
  MAIN_BRANCH_VARIATION: 20, // メインブランチの角度のばらつき（±10度）
  ANGLE_RANGE: 170,          // 子ノードの角度範囲（±85度）
  ANGLE_VARIATION: 25,       // 角度のばらつき（±12.5度）
  SINGLE_CHILD_BASE: 75,     // 単一の子ノードの基本角度
  SINGLE_CHILD_VARIATION: 30 // 単一の子ノードの角度のばらつき（±15度）
};

// 枝の太さ
export const BRANCH_WIDTH = {
  MAIN: 16,                  // メインブランチの基本太さ
  OTHER: 10,                 // その他のブランチの基本太さ
  MAX: 25,                   // 最大太さ
  DEPTH_REDUCTION: 10        // 深さによる太さ減少係数
};

// 植木鉢
export const POT_CONFIG = {
  TOP_WIDTH: 240,            // 上部の幅
  BOTTOM_WIDTH: 180,         // 下部の幅
  HEIGHT: 70,                // 高さ
  OFFSET_Y: 10,              // Y軸オフセット
  RIM_HEIGHT: 8,             // 縁の高さ
  SOIL_HEIGHT: 12,           // 土の高さ
  SOIL_MARGIN: 10            // 土のマージン
};

// 色
export const COLORS = {
  ROOT: '#654321',           // 根の色
  TRUNK: '#8B4513',          // 幹の色
  MERGE: '#654321',          // マージコミットの色
  LEAF: '#228B22',           // 葉の色
  POT_BODY: '#8B4513',       // 植木鉢本体の色
  POT_STROKE: '#654321',     // 植木鉢の枠線の色
  POT_RIM: '#A0522D',        // 植木鉢の縁の色
  SOIL: '#3E2723',           // 土の色
  LEAF_STROKE: '#006400'     // 葉の枠線の色
};

// アニメーション
export const ANIMATION = {
  DELAY_PER_NODE: 30,        // ノードごとのアニメーション遅延（ms）
  TRANSITION_DURATION: 0.3   // トランジション時間（秒）
};

// ズーム・パン
export const ZOOM_CONFIG = {
  ZOOM_STEP: 0.9,            // ズームステップ
  ZOOM_IN_STEP: 1.1,         // ズームインステップ
  MIN_SCALE: 0.1,            // 最小スケール
  MAX_SCALE: 10              // 最大スケール
};

// SVG
export const SVG_NS = 'http://www.w3.org/2000/svg';
