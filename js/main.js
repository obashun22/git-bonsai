/**
 * Gitで盆栽 - メインアプリケーション
 */

import { GitParser } from './git-parser.js';
import { BonsaiLayout } from './bonsai-layout.js';
import { SVGRenderer } from './svg-renderer.js';
import { UIController } from './ui-controller.js';

class BonsaiApp {
  constructor() {
    this.gitParser = null;
    this.bonsaiLayout = null;
    this.svgRenderer = null;
    this.uiController = null;

    this.currentNodes = null;
  }

  /**
   * アプリケーションを初期化
   */
  async init() {
    try {
      console.log('🌳 Gitで盆栽を初期化中...');

      // モジュール初期化
      this.gitParser = new GitParser();
      this.bonsaiLayout = new BonsaiLayout();
      this.svgRenderer = new SVGRenderer('bonsai-canvas');
      this.uiController = new UIController();

      // UIコントローラーのイベント設定
      this.uiController.on('repository-selected', async (directoryHandle) => {
        await this.loadRepository(directoryHandle);
      });

      this.uiController.on('load-sample-data', async () => {
        await this.loadSampleData();
      });

      this.uiController.on('reset-view', () => {
        this.svgRenderer.resetView();
      });

      this.uiController.on('toggle-animation', () => {
        if (this.currentNodes) {
          this.svgRenderer.animateGrowth(this.currentNodes);
        }
      });

      this.uiController.on('save-image', async () => {
        try {
          await this.svgRenderer.saveAsPNG();
        } catch (error) {
          this.uiController.showError('画像の保存に失敗しました: ' + error.message);
        }
      });

      // ズーム・パン機能を初期化
      this.svgRenderer.initZoomPan();

      console.log('✅ 初期化完了');
    } catch (error) {
      console.error('❌ 初期化エラー:', error);
      this.uiController.showError('アプリケーションの初期化に失敗しました: ' + error.message);
    }
  }

  /**
   * リポジトリを読み込んで盆栽を生成
   */
  async loadRepository(directoryHandle) {
    try {
      // ローディング表示
      this.uiController.showLoading();
      this.uiController.hideWelcome();

      console.log('📁 リポジトリを解析中...');

      // Git解析
      const { commits, branches } = await this.gitParser.parseRepository(directoryHandle);

      console.log(`✅ ${commits.size} コミット、${branches.size} ブランチを検出`);

      // リポジトリ情報を表示
      this.uiController.showRepoInfo(directoryHandle.name, commits.size);

      // 盆栽レイアウト生成
      console.log('🌿 盆栽レイアウトを生成中...');
      const nodes = this.bonsaiLayout.generateLayout(commits, branches);

      console.log(`✅ ${nodes.length} ノードを配置`);

      // SVG描画
      console.log('🎨 SVGを描画中...');
      this.svgRenderer.render(nodes);

      this.currentNodes = nodes;

      // ローディングを非表示、キャンバスを表示
      this.uiController.hideLoading();
      this.uiController.showCanvas();
      this.uiController.enableControls();

      // 成長アニメーションを自動再生
      setTimeout(() => {
        this.svgRenderer.animateGrowth(nodes);
      }, 100);

      console.log('✅ 盆栽の描画完了！');
    } catch (error) {
      console.error('❌ リポジトリの読み込みエラー:', error);
      this.uiController.hideLoading();
      this.uiController.showError('リポジトリの読み込みに失敗しました: ' + error.message);
    }
  }


  /**
   * サンプルデータを読み込んで盆栽を生成（静的サイト用）
   */
  async loadSampleData() {
    try {
      // ローディング表示
      this.uiController.showLoading();
      this.uiController.hideWelcome();

      console.log('📁 サンプルデータを読み込み中...');

      // サンプルデータを解析
      const { commits, branches } = await this.gitParser.parseSampleData();

      console.log(`✅ ${commits.size} コミット、${branches.size} ブランチを検出`);

      // リポジトリ情報を表示
      this.uiController.showRepoInfo('Sample Repository', commits.size);

      // 盆栽レイアウト生成
      console.log('🌿 盆栽レイアウトを生成中...');
      const nodes = this.bonsaiLayout.generateLayout(commits, branches);

      console.log(`✅ ${nodes.length} ノードを配置`);

      // SVG描画
      console.log('🎨 SVGを描画中...');
      this.svgRenderer.render(nodes);

      this.currentNodes = nodes;

      // ローディングを非表示、キャンバスを表示
      this.uiController.hideLoading();
      this.uiController.showCanvas();
      this.uiController.enableControls();

      // 成長アニメーションを自動再生
      setTimeout(() => {
        this.svgRenderer.animateGrowth(nodes);
      }, 100);

      console.log('✅ 盆栽の描画完了！');
    } catch (error) {
      console.error('❌ サンプルデータの読み込みエラー:', error);
      this.uiController.hideLoading();
      this.uiController.showError('サンプルデータの読み込みに失敗しました: ' + error.message);
    }
  }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', async () => {
  const app = new BonsaiApp();
  await app.init();
});
