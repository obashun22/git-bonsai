/**
 * UIコントローラー
 * ユーザーインターフェースの制御
 */

export class UIController {
  constructor() {
    this.eventHandlers = new Map();
    this.initializeElements();
    this.setupEventListeners();
  }

  /**
   * DOM要素を初期化
   */
  initializeElements() {
    this.selectRepoBtn = document.getElementById('select-repo-btn');
    this.resetViewBtn = document.getElementById('reset-view-btn');
    this.toggleAnimationBtn = document.getElementById('toggle-animation-btn');
    this.saveImageBtn = document.getElementById('save-image-btn');

    this.repoInfo = document.getElementById('repo-info');
    this.repoName = document.getElementById('repo-name');
    this.commitCount = document.getElementById('commit-count');

    this.loading = document.getElementById('loading');
    this.error = document.getElementById('error');
    this.errorMessage = document.getElementById('error-message');
    this.canvas = document.getElementById('bonsai-canvas');
    this.welcome = document.getElementById('welcome');
  }

  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    // リポジトリ選択ボタン
    this.selectRepoBtn.addEventListener('click', async () => {
      await this.selectRepository();
    });

    // ビューリセットボタン
    this.resetViewBtn.addEventListener('click', () => {
      this.emit('reset-view');
    });

    // アニメーショントグルボタン
    this.toggleAnimationBtn.addEventListener('click', () => {
      this.emit('toggle-animation');
    });

    // 画像保存ボタン
    this.saveImageBtn.addEventListener('click', () => {
      this.emit('save-image');
    });
  }

  /**
   * リポジトリを選択
   */
  async selectRepository() {
    try {
      // File System Access APIでディレクトリを選択
      if (!('showDirectoryPicker' in window)) {
        throw new Error('このブラウザはFile System Access APIに対応していません。Chrome、Edge等の最新版をご利用ください。');
      }

      const directoryHandle = await window.showDirectoryPicker();

      // イベントを発火
      this.emit('repository-selected', directoryHandle);
    } catch (error) {
      if (error.name === 'AbortError') {
        // ユーザーがキャンセルした場合
        console.log('リポジトリ選択がキャンセルされました');
        return;
      }

      console.error('リポジトリ選択エラー:', error);
      this.showError('リポジトリの選択に失敗しました: ' + error.message);
    }
  }

  /**
   * リポジトリ情報を表示
   */
  showRepoInfo(name, commitCount) {
    this.repoName.textContent = `📦 ${name}`;
    this.commitCount.textContent = `📊 ${commitCount} コミット`;
    this.repoInfo.style.display = 'flex';
  }

  /**
   * ローディングを表示
   */
  showLoading() {
    this.loading.style.display = 'flex';
    this.error.style.display = 'none';
    this.canvas.style.display = 'none';
    this.welcome.style.display = 'none';
  }

  /**
   * ローディングを非表示
   */
  hideLoading() {
    this.loading.style.display = 'none';
  }

  /**
   * ウェルカム画面を非表示
   */
  hideWelcome() {
    this.welcome.style.display = 'none';
  }

  /**
   * キャンバスを表示
   */
  showCanvas() {
    this.canvas.style.display = 'block';
    this.error.style.display = 'none';
  }

  /**
   * エラーを表示
   */
  showError(message) {
    this.errorMessage.textContent = message;
    this.error.style.display = 'block';
    this.loading.style.display = 'none';
    this.canvas.style.display = 'none';
  }

  /**
   * コントロールを有効化
   */
  enableControls() {
    this.resetViewBtn.disabled = false;
    this.toggleAnimationBtn.disabled = false;
    this.saveImageBtn.disabled = false;
  }

  /**
   * コントロールを無効化
   */
  disableControls() {
    this.resetViewBtn.disabled = true;
    this.toggleAnimationBtn.disabled = true;
    this.saveImageBtn.disabled = true;
  }

  /**
   * イベントハンドラーを登録
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * イベントを発火
   */
  emit(event, ...args) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }
}
