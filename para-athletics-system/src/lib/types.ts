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
