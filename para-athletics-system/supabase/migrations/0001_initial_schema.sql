-- パラ陸上 統合データマネジメントポータル (AMS) 初期スキーマ
-- Supabase (PostgreSQL) 用マイグレーション
--
-- 設計方針:
--   個々のアスリートを家族・コーチ・連盟スタッフが共同サポートするための
--   Single Source of Truth。日々のデータは「日付 + athlete_id」で各テーブルを
--   結合し、ダッシュボードで横断的に可視化する (要件定義書より)。
--
-- 適用方法:
--   supabase db push  もしくは ダッシュボードの SQL Editor で実行

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- アスリート (プロフィール)
-- ---------------------------------------------------------------------------
create table if not exists athletes (
  id           uuid primary key default gen_random_uuid(),
  display_name text not null,
  birth_date   date,
  class_code   text,             -- 障害クラス (任意・例: 'T20')
  notes        text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ロール (役割ベースアクセス制御の土台)
--   role: 'athlete' | 'family' | 'coach' | 'federation'
-- ---------------------------------------------------------------------------
create table if not exists athlete_members (
  athlete_id uuid not null references athletes(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('athlete','family','coach','federation')),
  created_at  timestamptz not null default now(),
  primary key (athlete_id, user_id)
);

-- ---------------------------------------------------------------------------
-- ① ヘルスケア・体組成 + 主観入力 (デイリーダイアリー) = システムの中核
--   客観データ (ウェアラブル等) と 主観データ (1〜5) を同居させ「乖離」を可視化
-- ---------------------------------------------------------------------------
create table if not exists daily_logs (
  id                   uuid primary key default gen_random_uuid(),
  athlete_id           uuid not null references athletes(id) on delete cascade,
  log_date             date not null,
  -- 体組成
  weight_kg            numeric,
  body_fat_pct         numeric,
  -- 睡眠
  sleep_hours          numeric,
  sleep_deep_pct       numeric,
  sleep_rem_pct        numeric,
  sleep_efficiency_pct numeric,
  -- 循環器
  resting_hr           integer,
  hrv                  numeric,
  -- 主観 (1〜5: スマイリー/スライダー入力)
  subjective_recovery  integer check (subjective_recovery between 1 and 5),
  subjective_fatigue   integer check (subjective_fatigue between 1 and 5),
  mood                 integer check (mood between 1 and 5),
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (athlete_id, log_date)
);

-- ---------------------------------------------------------------------------
-- ② 競技パフォーマンス (トレーニングログ)
-- ---------------------------------------------------------------------------
create table if not exists training_logs (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references athletes(id) on delete cascade,
  log_date     date not null,
  menu         text,                 -- 練習メニュー
  distance_m   numeric,              -- 距離 (m)
  duration_min numeric,              -- 時間 (分)
  reps         integer,              -- 本数
  result       text,                 -- タイム/記録
  rpe          integer check (rpe between 1 and 10),  -- 主観的運動強度
  notes        text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ③ スケジュール・移動 (ロジスティクス)
--   type: 'practice'|'camp'|'competition'|'travel'|'other'
-- ---------------------------------------------------------------------------
create table if not exists schedule_events (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references athletes(id) on delete cascade,
  event_date  date not null,
  type        text not null check (type in ('practice','camp','competition','travel','other')),
  title       text not null,
  start_at    timestamptz,
  end_at      timestamptz,
  location    text,
  transport   text,                  -- 'flight'|'shinkansen' 等
  reference   text,                  -- 便名/列車名・予約番号
  details     text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ④ 財務・経費
--   category: 'travel'|'lodging'|'equipment'|'other'
-- ---------------------------------------------------------------------------
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references athletes(id) on delete cascade,
  spent_date  date not null,
  category    text not null check (category in ('travel','lodging','equipment','other')),
  amount_jpy  integer not null,
  description text,
  receipt_url text,                  -- AI-OCR 取り込み元のレシート画像
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at 自動更新 (daily_logs)
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_daily_logs_updated_at on daily_logs;
create trigger trg_daily_logs_updated_at
  before update on daily_logs
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--   「その athlete のメンバーであれば閲覧可」を基本とする。
--   役割別の細かな書き込み制御 (例: 主観入力は選手のみ) は要件確定後に精緻化。
-- ---------------------------------------------------------------------------
alter table athletes        enable row level security;
alter table athlete_members enable row level security;
alter table daily_logs      enable row level security;
alter table training_logs   enable row level security;
alter table schedule_events enable row level security;
alter table expenses        enable row level security;

-- 自分が所属する athlete のメンバーかどうかを判定するヘルパ
create or replace function is_member_of(target uuid) returns boolean as $$
  select exists (
    select 1 from athlete_members m
    where m.athlete_id = target and m.user_id = auth.uid()
  );
$$ language sql security definer stable;

do $$
declare t text;
begin
  foreach t in array array['daily_logs','training_logs','schedule_events','expenses'] loop
    execute format($p$
      create policy "members access" on %I
        for all to authenticated
        using (is_member_of(athlete_id)) with check (is_member_of(athlete_id));
    $p$, t);
  end loop;
end $$;

create policy "members read athlete" on athletes
  for select to authenticated using (is_member_of(id));

create policy "self memberships" on athlete_members
  for select to authenticated using (user_id = auth.uid());
