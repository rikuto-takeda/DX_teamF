# DX-

## プロジェクト概要
Figma Make をベースに作成されたプロジェクトです。

## 使用技術・インストール済みパッケージ
現在までに導入されている主な技術・パッケージは以下の通りです。

- **UIライブラリ**: `shadcn/ui`
- **UIコンポーネント・スタイリング**:
  - Tailwind CSS (スタイリング)
  - Material UI (`@mui/material`, `@mui/icons-material`)
  - Radix UI (shadcn/uiのベース)
  - Emotion (`@emotion/react`, `@emotion/styled`)
- **アセット**: Unsplash (画像)
- **主要な機能拡張パッケージ**: 
  - **フレームワーク/ビルド**: React (18.x), Vite (6.x)
  - **ルーティング**: React Router
  - **フォーム**: React Hook Form
  - **グラフ/チャート**: Recharts
  - **日付操作**: date-fns
  - **アニメーション・UI動作**: Framer Motion (`motion`), Embla Carousel, React DnD (ドラッグ&ドロップ)
  - **ファイル操作**: xlsx (Excelファイルの読み書き)

## 実装履歴

現時点で実装・設定されている内容は以下の通りです。

### プロジェクト初期・環境構築
- プロジェクトの初期セットアップ
- `shadcn/ui` の初期構成および各種コンポーネントの導入
- Unsplash画像等を使用するためのアセット構成
- 上記「使用技術」に記載の各種npmパッケージのインストール

### 実装済み機能
- *(※ここに現在までに作成したページ、UIコンポーネント、ロジックなどを追記してください)*

## 今後の課題・実装予定
- *(※今後着手する予定の機能開発やタスクを追記してください)*

---

## Git / GitHub の基本的な使い方

チーム開発を進める際の基本的な Git コマンドとフローです。

### 1. 最新のコードを取得する
```bash
git pull origin main
```

### 2. 作業用のブランチを作成・移動する
```bash
git checkout -b feature/your-feature-name
```

### 3. 変更を記録（コミット）して GitHub に送信（プッシュ）する
```bash
git add .
git commit -m "機能追加: ○○画面の実装"
git push origin feature/your-feature-name
```

### 4. GitHub上で Pull Request (PR) を作成する
- GitHubのページを開き、プッシュしたブランチから `main` ブランチに向けて Pull Request を作成します。
- レビューを受けた後、`main` にマージ（統合）します。