# パラ陸上サポートシステム

パラ陸上アスリートを家族・コーチ・連盟スタッフが共同サポートするための、
**統合型データマネジメントポータル（AMS / Single Source of Truth）**。

スケジュール・移動／競技パフォーマンス／ヘルスケア・体組成／財務・経費を
「日付 × アスリート」で統合し、ロール別ダッシュボードで可視化する。

> 要件定義: Gemini 作成のドキュメント「パラ陸上競技アスリートのための統合型データ
> マネジメントシステム要件定義およびAI活用アーキテクチャ」に基づく。

## 技術スタック（推奨案A）

| 層 | 採用技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| オフライン/PWA | Service Worker + IndexedDB (Dexie) によるオフライン入力＆同期 |
| バックエンド/データ | Supabase（PostgreSQL + Auth + RLS + Storage） |
| ホスティング | Vercel + Supabase（マネージド・ほぼゼロ運用） |

PC ブラウザ（管理ダッシュボード）と現場スマホ（選手の簡単入力）を
**単一コードベース**でカバーし、移動中・会場でも**オフライン入力**できる。

## データモデル（`supabase/migrations/0001_initial_schema.sql`）

- `athletes` … アスリートのプロフィール
- `athlete_members` … 役割（athlete / family / coach / federation）= RBAC の土台
- `daily_logs` … ① ヘルスケア・体組成＋主観入力（**中核**。客観 vs 主観の乖離を可視化）
- `training_logs` … ② 競技パフォーマンス（距離・時間・本数・記録・RPE）
- `schedule_events` … ③ スケジュール・移動（合宿・試合・フライト・新幹線）
- `expenses` … ④ 財務・経費（レシート画像／AI-OCR 取り込み）

各テーブルは RLS で「その athlete のメンバーのみアクセス可」に制限。

## 実装状況

- [x] プロジェクト基盤（Next.js + Tailwind + PWA + Supabase クライアント）
- [x] オフライン基盤（Dexie + 同期処理）
- [x] **MVP: デイリーチェックイン**（`/checkin`）
      — スマイリー5段階入力・睡眠/体重・レディネスカード（信号色）・オフライン保存＆クラウド同期
- [ ] 認証（Supabase Auth）と athlete_members によるロール解決
- [ ] 管理ダッシュボード（時系列チャート、ドリルダウン）
- [ ] HRV 7日移動平均・変動係数(CV)・トレーニング負荷・Optimize/レディネススコア本実装
- [ ] スケジュール×生理データのクロス可視化（移動とHRVのオーバーレイ）
- [ ] 財務（AI-OCR レシート取り込み）・メール解析による予定自動入力
- [ ] ウェアラブル連携（Apple Watch / Garmin / Oura 等）
- [ ] 月次 AI 振り返りレポート

> レディネス算出は MVP の簡易版（`src/lib/readiness.ts`）。要件定義の
> Optimize Score / HRV-CV は履歴データ蓄積後に拡張する。

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # Supabase の URL / anon key を設定（任意）
npm run dev                         # http://localhost:3000
```

- `.env.local` 未設定でも、アプリは **オフライン（IndexedDB）のみ**で動作する。
- Supabase を使う場合: プロジェクト作成後、`supabase/migrations/0001_initial_schema.sql`
  を SQL Editor で実行し、URL と anon key を `.env.local` に設定。

## 検証

```bash
npm run lint
npm run build
```

- `/checkin` でスマイリー入力 → 保存 → 機内モードでも保存できること（PWA/オフライン）。
- Supabase 設定時は「クラウドへ同期」で push/pull が機能すること。
