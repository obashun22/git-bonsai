/**
 * Git解析エンジン
 * Gitリポジトリを解析してコミット・ブランチ情報を抽出
 */

import { GIT_CONFIG } from './constants.js';

export class GitParser {
  constructor() {
    this.fs = null;
    this.dir = GIT_CONFIG.REPO_DIR;
    this.maxCommits = GIT_CONFIG.MAX_COMMITS;
  }

  /**
   * Gitリポジトリを解析
   * @param {FileSystemDirectoryHandle} directoryHandle - リポジトリのディレクトリハンドル
   * @returns {Promise<{commits: Map<string, Commit>, branches: Map<string, Branch>}>}
   */
  async parseRepository(directoryHandle) {
    try {
      // LightningFSを初期化
      this.fs = new LightningFS(GIT_CONFIG.FS_NAME);

      // .gitディレクトリのみをコピー（高速化）
      const gitDir = await directoryHandle.getDirectoryHandle('.git');
      await this.copyDirectory(gitDir, `${this.dir}/.git`);

      // Gitログを取得（最初から制限をかける）
      console.log(`📊 最大 ${this.maxCommits} コミットを取得中...`);
      const logEntries = await git.log({
        fs: this.fs,
        dir: this.dir,
        ref: 'HEAD',
        depth: this.maxCommits  // 最初から制限
      });

      console.log(`✅ ${logEntries.length} コミットを取得`);

      // ブランチ情報を取得
      const branchNames = await git.listBranches({
        fs: this.fs,
        dir: this.dir
      });

      console.log(`🌿 ${branchNames.length} ブランチを検出:`, branchNames);

      // コミットマップを構築
      const commits = this.buildCommitGraph(logEntries);

      // ブランチマップを構築
      const branches = await this.buildBranchMap(branchNames, commits);

      // ブランチを推定
      this.estimateBranches(commits, branches);

      return { commits, branches };
    } catch (error) {
      console.error('Git解析エラー:', error);
      throw new Error(`Git解析に失敗しました: ${error.message}`);
    }
  }


  /**
   * ディレクトリを再帰的にコピー
   */
  async copyDirectory(dirHandle, targetPath) {
    try {
      await this.fs.promises.mkdir(targetPath, { recursive: true });
    } catch (e) {
      // ディレクトリが既に存在する場合は無視
    }

    for await (const entry of dirHandle.values()) {
      const entryPath = `${targetPath}/${entry.name}`;

      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await this.fs.promises.writeFile(entryPath, uint8Array);
      } else if (entry.kind === 'directory') {
        await this.copyDirectory(entry, entryPath);
      }
    }
  }

  /**
   * コミットリストからグラフ構造を構築
   * @param {Array} logEntries - gitログエントリ
   * @returns {Map<string, Commit>}
   */
  buildCommitGraph(logEntries) {
    const commits = new Map();

    // コミットオブジェクトを作成
    logEntries.forEach((entry) => {
      const commit = {
        sha: entry.oid,
        parents: entry.commit.parent || [],
        message: entry.commit.message.split('\n')[0],  // 1行目のみ
        author: entry.commit.author.name,
        timestamp: entry.commit.author.timestamp,
        isMerge: (entry.commit.parent || []).length > 1,
        branchName: null,
        depth: 0,
        children: []
      };

      commits.set(commit.sha, commit);
    });

    // 親子関係を構築
    commits.forEach((commit) => {
      commit.parents.forEach((parentSha) => {
        const parent = commits.get(parentSha);
        if (parent) {
          parent.children.push(commit.sha);
        }
      });
    });

    // 深さを計算
    const root = this.findRootCommit(commits);
    if (root) {
      this.calculateDepth(root, commits, 0);
    }

    return commits;
  }

  /**
   * ブランチマップを構築
   * @param {Array<string>} branchNames - ブランチ名配列
   * @param {Map<string, Commit>} commits - コミットマップ
   * @returns {Promise<Map<string, Branch>>}
   */
  async buildBranchMap(branchNames, commits) {
    const branches = new Map();

    for (const name of branchNames) {
      try {
        const ref = await git.resolveRef({
          fs: this.fs,
          dir: this.dir,
          ref: name
        });

        const branch = {
          name,
          head: ref,
          commits: [],
          isMain: name === 'master' || name === 'main',
          parentBranch: null
        };

        branches.set(name, branch);
      } catch (error) {
        console.warn(`ブランチ ${name} の解決に失敗:`, error);
      }
    }

    return branches;
  }

  /**
   * コミットの所属ブランチを推定
   * @param {Map<string, Commit>} commits
   * @param {Map<string, Branch>} branches
   */
  estimateBranches(commits, branches) {
    // メインブランチを特定
    const mainBranch = Array.from(branches.values()).find(b => b.isMain);

    if (mainBranch) {
      // メインブランチのHEADから遡ってコミットをマーク
      this.markBranchCommits(mainBranch.head, commits, mainBranch.name);
    }

    // 他のブランチも同様に
    branches.forEach((branch) => {
      if (!branch.isMain) {
        this.markBranchCommits(branch.head, commits, branch.name);
      }
    });
  }

  /**
   * ブランチのコミットをマーク
   * @param {string} headSha - ブランチのHEADのSHA
   * @param {Map<string, Commit>} commits - コミットマップ
   * @param {string} branchName - ブランチ名
   */
  markBranchCommits(headSha, commits, branchName) {
    const visited = new Set();
    const queue = [headSha];

    while (queue.length > 0) {
      const sha = queue.shift();

      if (visited.has(sha)) continue;
      visited.add(sha);

      const commit = commits.get(sha);
      if (!commit) continue;

      // まだブランチが割り当てられていない場合のみ設定
      if (!commit.branchName) {
        commit.branchName = branchName;
      }

      // 親を追加（マージコミットの場合は第1親のみ）
      if (commit.parents.length > 0) {
        queue.push(commit.parents[0]);
      }
    }
  }


  /**
   * ルートコミット（親がないコミット）を探す
   * @param {Map<string, Commit>} commits
   * @returns {Commit | null}
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
   * コミットの深さをループベースで計算
   * @param {Commit} commit
   * @param {Map<string, Commit>} commits
   * @param {number} depth
   */
  calculateDepth(commit, commits, depth) {
    // 幅優先探索でスタックオーバーフローを回避
    const queue = [{ commit, depth }];
    const visited = new Set();  // 訪問済みコミットを追跡

    while (queue.length > 0) {
      const { commit: current, depth: currentDepth } = queue.shift();

      // すでに訪問済みの場合はスキップ
      if (visited.has(current.sha)) continue;
      visited.add(current.sha);

      current.depth = currentDepth;

      current.children.forEach((childSha) => {
        const child = commits.get(childSha);
        if (child && !visited.has(childSha)) {
          queue.push({ commit: child, depth: currentDepth + 1 });
        }
      });
    }
  }
}
