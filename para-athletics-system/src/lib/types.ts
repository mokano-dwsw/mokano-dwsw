// ドメイン型定義 (パラ陸上 統合データマネジメントポータル)
// 中核は日々の「デイリーログ」。客観データ(ウェアラブル等)と主観データ(1〜5)を同居させる。

/** 1〜5 の主観スケール (スマイリー/スライダー入力) */
export type Scale5 = 1 | 2 | 3 | 4 | 5;

/** ① ヘルスケア・体組成 + 主観入力 (デイリーダイアリー) */
export interface DailyLog {
  id: string; // uuid
  athleteId: string;
  logDate: string; // YYYY-MM-DD

  // 体組成
  weightKg?: number;
  bodyFatPct?: number;

  // 睡眠
  sleepHours?: number;
  sleepDeepPct?: number;
  sleepRemPct?: number;
  sleepEfficiencyPct?: number;

  // 循環器
  restingHr?: number;
  hrv?: number;

  // 主観 (1〜5)
  subjectiveRecovery?: Scale5;
  subjectiveFatigue?: Scale5;
  mood?: Scale5;

  notes?: string;
  updatedAt: string; // ISO datetime
}

/** レディネス判定の信号色 */
export type ReadinessLevel = "green" | "yellow" | "red";

/** ② 競技パフォーマンス (トレーニングログ) */
export interface TrainingLog {
  id: string; // uuid
  athleteId: string;
  logDate: string; // YYYY-MM-DD
  menu?: string; // 練習メニュー
  distanceM?: number; // 距離 (m)
  durationMin?: number; // 時間 (分)
  reps?: number; // 本数
  result?: string; // タイム/記録
  rpe?: number; // 主観的運動強度 (1〜10)
  notes?: string;
  updatedAt: string; // ISO datetime
}

/** ④ 財務・経費 */
export type ExpenseCategory = "travel" | "lodging" | "equipment" | "other";

export interface Expense {
  id: string; // uuid
  athleteId: string;
  spentDate: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amountJpy: number;
  description?: string;
  receiptUrl?: string; // AI-OCR 取り込み元のレシート画像 (将来)
  updatedAt: string; // ISO datetime
}

export const EXPENSE_META: Record<ExpenseCategory, { label: string; icon: string }> = {
  travel: { label: "交通費", icon: "🚄" },
  lodging: { label: "宿泊費", icon: "🏨" },
  equipment: { label: "用具", icon: "🦿" },
  other: { label: "その他", icon: "📦" },
};

/** ③ スケジュール・移動 (ロジスティクス) */
export type ScheduleType = "practice" | "camp" | "competition" | "travel" | "other";

export interface ScheduleEvent {
  id: string; // uuid
  athleteId: string;
  eventDate: string; // YYYY-MM-DD
  type: ScheduleType;
  title: string;
  transport?: string; // 'flight' | 'shinkansen' 等
  reference?: string; // 便名/列車名・予約番号
  location?: string;
  details?: string;
  updatedAt: string; // ISO datetime
}

/** スケジュール種別の表示属性 (アイコン・色) */
export const SCHEDULE_META: Record<ScheduleType, { label: string; icon: string; color: string }> = {
  practice: { label: "練習", icon: "🏃", color: "#94a3b8" },
  camp: { label: "合宿", icon: "🏕️", color: "#0891b2" },
  competition: { label: "試合", icon: "🏟️", color: "#dc2626" },
  travel: { label: "移動", icon: "✈️", color: "#d97706" },
  other: { label: "その他", icon: "📌", color: "#6b7280" },
};

