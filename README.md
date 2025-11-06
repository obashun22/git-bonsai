# 🌳 Gitで盆栽

Gitリポジトリのコミット履歴を美しい盆栽として可視化するWebアプリケーションです。

## ✨ 特徴

- **🎨 芸術的な可視化**: Gitのコミット履歴を盆栽の形で表現
- **🌿 直感的な表現**: ルートコミット（植木鉢）、通常コミット（枝）、ブランチHEAD（葉）
- **🔍 インタラクティブ**: ズーム・パン機能でコミットを探索
- **💡 情報表示**: コミット情報をツールチップで確認
- **🎬 アニメーション**: 盆栽の成長をアニメーションで表現
- **🎯 決定論的**: 同じリポジトリは常に同じ形状
- **📊 最適化**: 直近30件のコミットを表示してパフォーマンスを確保

## 📸 スクリーンショット

![Gitで盆栽 - スクリーンショット](docs/images/screenshot.jpg)

## 🎨 視覚表現

- **植木鉢**: ルートコミット（リポジトリの起点）
- **枝**: コミット（茶色の線）
- **葉**: ブランチHEAD（緑色の楕円）

## 🚀 使い方

### 前提条件

- **ブラウザ**: Chrome、Edge、またはFile System Access APIに対応したブラウザの最新版
- **Gitリポジトリ**: ローカルに存在する任意のGitリポジトリ

### 起動方法

1. `index.html` をブラウザで開く

   ```bash
   # ローカルサーバーを起動（推奨）
   cd git-bonsai-visualizer
   python -m http.server 8000
   ```

2. ブラウザで `http://localhost:8000` にアクセス

3. 「リポジトリを選択」ボタンをクリック

4. 可視化したいGitリポジトリのディレクトリを選択

5. 盆栽が表示されます！

### 操作方法

- **ズーム**: マウスホイールを回転
- **パン**: ドラッグで移動
- **情報表示**: ノードや葉にカーソルを合わせる
- **ビューリセット**: 「ビューをリセット」ボタンをクリック
- **アニメーション再生**: 「アニメーション」ボタンをクリック

## 🏗️ 技術スタック

- **フロントエンド**: Vanilla JavaScript (ES6+)
- **描画**: SVG
- **Git解析**: [isomorphic-git](https://isomorphic-git.org/)
- **ファイルシステム**: [LightningFS](https://github.com/isomorphic-git/lightning-fs)
- **乱数**: [seedrandom](https://github.com/davidbau/seedrandom)

## 📁 プロジェクト構成

```
git-bonsai-visualizer/
├── index.html              # メインHTML
├── css/
│   └── style.css          # スタイルシート
├── js/
│   ├── main.js            # エントリーポイント
│   ├── constants.js       # 定数定義
│   ├── git-parser.js      # Git解析エンジン
│   ├── bonsai-layout.js   # 盆栽レイアウトエンジン
│   ├── svg-renderer.js    # SVG描画エンジン
│   └── ui-controller.js   # UIコントローラー
├── docs/
│   ├── ARCHITECTURE.md    # アーキテクチャドキュメント
│   └── ...
└── README.md              # このファイル
```

## ⚙️ カスタマイズ

アプリケーションの動作をカスタマイズするには、`js/constants.js` の定数を変更してください:

```javascript
// コミット数の変更
export const GIT_CONFIG = {
  MAX_COMMITS: 30,  // 表示する最大コミット数
  ...
};

// レイアウトの調整
export const LAYOUT_CONFIG = {
  CANVAS_SIZE: 800,         // キャンバスサイズ
  BASE_DISTANCE: 50,        // ノード間の基本距離
  HORIZONTAL_SCALE: 3.0,    // 横方向のスケール
  VERTICAL_SCALE: 0.3,      // 縦方向のスケール
  ...
};

// 色の変更
export const COLORS = {
  ROOT: '#654321',    // 植木鉢の色
  TRUNK: '#8B4513',   // 枝の色
  LEAF: '#228B22',    // 葉の色
  ...
};
```

## 🐛 既知の問題

- **ブラウザ制限**: File System Access APIに対応したブラウザのみで動作（Chrome、Edge等）
- **コミット数制限**: 直近30件のコミットのみを表示（パフォーマンス最適化のため）

## 📝 ライセンス

MIT License

## 🤝 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 🙏 謝辞

- [isomorphic-git](https://isomorphic-git.org/) - ブラウザでGitを実現
- [LightningFS](https://github.com/isomorphic-git/lightning-fs) - ブラウザ内ファイルシステム
- [seedrandom](https://github.com/davidbau/seedrandom) - 決定論的乱数生成

## 👤 作者

© 2025 [@obashun22](https://x.com/obashun22)

---

**楽しいGit盆栽ライフを！** 🌳✨
