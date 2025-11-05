# Git盆栽リポジトリ設計

このリポジトリは、Git履歴を美しい盆栽のように可視化するためのサンプルリポジトリです。

## 設計コンセプト

- **幹（trunk）**: mainブランチが垂直に伸びる
- **枝（branches）**: 適度にフィーチャーブランチが分岐
- **節（nodes）**: マージコミットが分岐点として機能
- **葉（leaves）**: ブランチの先端やマージされたブランチ

## ツリー構造

```
main (幹)
├─ v1.0 リリース
│  ├─ feature/login (枝1)
│  │  └─ ログイン機能実装 → merge
│  └─ feature/signup (枝2)
│     └─ サインアップ機能実装 → merge
├─ v1.1 リリース
│  ├─ feature/profile (枝3)
│  │  └─ プロフィール画面実装 → merge
│  └─ bugfix/auth (枝4)
│     └─ 認証バグ修正 → merge
├─ v2.0 リリース
│  ├─ feature/api (枝5)
│  │  ├─ API基盤構築
│  │  └─ エンドポイント実装 → merge
│  └─ feature/dashboard (枝6)
│     ├─ ダッシュボード設計
│     └─ ダッシュボード実装 → merge
└─ v2.1 リリース
   └─ feature/notifications (枝7)
      └─ 通知機能実装 → merge
```

## コミット詳細

### Phase 1: プロジェクト初期化
1. Initial commit
2. プロジェクト構造作成

### Phase 2: v1.0開発
3. ブランチ: feature/login
   - ログインフォーム作成
   - 認証ロジック実装
   - マージ → main
4. ブランチ: feature/signup
   - サインアップフォーム作成
   - バリデーション実装
   - マージ → main
5. v1.0リリースタグ

### Phase 3: v1.1開発
6. ブランチ: feature/profile
   - プロフィール画面UI
   - プロフィール編集機能
   - マージ → main
7. ブランチ: bugfix/auth
   - セッション管理修正
   - マージ → main
8. v1.1リリースタグ

### Phase 4: v2.0開発
9. ブランチ: feature/api
   - REST API基盤
   - ユーザーエンドポイント
   - データエンドポイント
   - マージ → main
10. ブランチ: feature/dashboard
    - ダッシュボードレイアウト
    - ウィジェット実装
    - データ可視化
    - マージ → main
11. v2.0リリースタグ

### Phase 5: v2.1開発
12. ブランチ: feature/notifications
    - 通知システム構築
    - リアルタイム通知
    - マージ → main
13. v2.1リリースタグ

## 期待される盆栽の形

```
          🌿 (notifications)
          │
      ────┴──── v2.1
      │
  🌿──┘ └──🌿 (api + dashboard)
  │
  ├──────── v2.0
  │
  🌿──┘ └──🌿 (profile + bugfix)
  │
  ├──────── v1.1
  │
  🌿──┘ └──🌿 (login + signup)
  │
  ├──────── v1.0
  │
  🌱 Initial
```
