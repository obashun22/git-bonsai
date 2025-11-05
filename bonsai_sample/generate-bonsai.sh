#!/bin/bash
# Git盆栽リポジトリ自動生成スクリプト

set -e

echo "🌳 Git盆栽リポジトリを生成中..."

# リポジトリ初期化
git init

# Git設定
git config user.name "Bonsai Builder"
git config user.email "bonsai@example.com"

# ヘルパー関数: ファイル作成とコミット
commit() {
    local message="$1"
    local file="${2:-README.md}"
    local dir=$(dirname "$file")

    # ディレクトリが存在しない場合は作成
    if [ "$dir" != "." ] && [ ! -d "$dir" ]; then
        mkdir -p "$dir"
    fi

    echo "$message" >> "$file"
    git add .
    git commit -m "$message"
    sleep 0.1  # コミット間に時間差を作る
}

# Phase 1: プロジェクト初期化
echo "📦 Phase 1: プロジェクト初期化"
cat > README.md << 'EOF'
# 盆栽プロジェクト

美しいGit履歴を持つサンプルプロジェクト
EOF

cat > package.json << 'EOF'
{
  "name": "bonsai-project",
  "version": "0.0.1",
  "description": "Beautiful Git History Sample"
}
EOF

git add .
git commit -m "Initial commit"

commit "プロジェクト構造作成" "src/index.js"

# Phase 2: v1.0開発
echo "🌱 Phase 2: v1.0開発"

# feature/login ブランチ
git checkout -b feature/login
commit "ログインフォーム作成" "src/login.js"
commit "認証ロジック実装" "src/auth.js"

# main にマージ
git checkout main
git merge --no-ff feature/login -m "Merge: ログイン機能実装"
git branch -d feature/login

# feature/signup ブランチ
git checkout -b feature/signup
commit "サインアップフォーム作成" "src/signup.js"
commit "バリデーション実装" "src/validation.js"

# main にマージ
git checkout main
git merge --no-ff feature/signup -m "Merge: サインアップ機能実装"
git branch -d feature/signup

# v1.0 リリース
commit "v1.0リリース準備" "package.json"
git tag -a v1.0 -m "Release v1.0"

# Phase 3: v1.1開発
echo "🌿 Phase 3: v1.1開発"

# feature/profile ブランチ
git checkout -b feature/profile
commit "プロフィール画面UI" "src/profile.js"
commit "プロフィール編集機能" "src/profile-edit.js"

# main にマージ
git checkout main
git merge --no-ff feature/profile -m "Merge: プロフィール機能実装"
git branch -d feature/profile

# bugfix/auth ブランチ
git checkout -b bugfix/auth
commit "セッション管理修正" "src/auth.js"

# main にマージ
git checkout main
git merge --no-ff bugfix/auth -m "Merge: 認証バグ修正"
git branch -d bugfix/auth

# v1.1 リリース
commit "v1.1リリース準備" "package.json"
git tag -a v1.1 -m "Release v1.1"

# Phase 4: v2.0開発
echo "🌲 Phase 4: v2.0開発"

# feature/api ブランチ
git checkout -b feature/api
commit "REST API基盤構築" "src/api/base.js"
commit "ユーザーエンドポイント" "src/api/users.js"
commit "データエンドポイント" "src/api/data.js"

# main にマージ
git checkout main
git merge --no-ff feature/api -m "Merge: API機能実装"
git branch -d feature/api

# feature/dashboard ブランチ
git checkout -b feature/dashboard
commit "ダッシュボードレイアウト" "src/dashboard/layout.js"
commit "ウィジェット実装" "src/dashboard/widgets.js"
commit "データ可視化" "src/dashboard/charts.js"

# main にマージ
git checkout main
git merge --no-ff feature/dashboard -m "Merge: ダッシュボード機能実装"
git branch -d feature/dashboard

# v2.0 リリース
commit "v2.0リリース準備" "package.json"
git tag -a v2.0 -m "Release v2.0"

# Phase 5: v2.1開発
echo "🎋 Phase 5: v2.1開発"

# feature/notifications ブランチ
git checkout -b feature/notifications
commit "通知システム構築" "src/notifications/system.js"
commit "リアルタイム通知実装" "src/notifications/realtime.js"

# main にマージ
git checkout main
git merge --no-ff feature/notifications -m "Merge: 通知機能実装"
git branch -d feature/notifications

# v2.1 リリース
commit "v2.1リリース準備" "package.json"
git tag -a v2.1 -m "Release v2.1"

echo ""
echo "✅ Git盆栽リポジトリの生成が完了しました！"
echo ""
echo "📊 統計情報:"
echo "   コミット数: $(git rev-list --count HEAD)"
echo "   タグ: $(git tag | wc -l)"
echo ""
echo "🌳 ログを確認:"
echo "   git log --oneline --graph --all"
